#!/usr/bin/env python3
"""
Web scraper for price tracking using Beautiful Soup.
This script takes a URL as a command-line argument and returns the price.
"""

import sys
import re
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def get_session():
    """Create a requests session with retry strategy."""
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def get_headers():
    """Return headers to mimic a browser request."""
    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
    }

def extract_price_from_text(text):
    """Extract price from text using regex."""
    # Remove common currency symbols and extract numbers
    price_patterns = [
        r'\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # $1,234.56 or 1234.56
        r'(\d+\.\d{2})',  # 12.34
    ]
    
    for pattern in price_patterns:
        matches = re.findall(pattern, text.replace(',', ''))
        if matches:
            try:
                price = float(matches[0])
                if price > 0:
                    return price
            except ValueError:
                continue
    return None

def scrape_amazon(url):
    """Scrape price from Amazon."""
    session = get_session()
    try:
        response = session.get(url, headers=get_headers(), timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try multiple selectors for Amazon price
        selectors = [
            'span.a-price-whole',
            'span#priceblock_ourprice',
            'span#priceblock_dealprice',
            'span.a-offscreen',
            '.a-price .a-offscreen',
        ]
        
        for selector in selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                price = extract_price_from_text(price_text)
                if price:
                    return price
        
        # Fallback: search for price in meta tags
        price_meta = soup.find('meta', {'property': 'product:price:amount'})
        if price_meta:
            return float(price_meta.get('content', ''))
            
    except Exception as e:
        print(f"Error scraping Amazon: {e}", file=sys.stderr)
    
    return None

def scrape_generic(url):
    """Generic scraper that tries to find price in common patterns."""
    session = get_session()
    try:
        response = session.get(url, headers=get_headers(), timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Try common price class names
        price_selectors = [
            '.price',
            '.product-price',
            '.current-price',
            '[class*="price"]',
            '[id*="price"]',
        ]
        
        for selector in price_selectors:
            price_elems = soup.select(selector)
            for elem in price_elems:
                price_text = elem.get_text(strip=True)
                price = extract_price_from_text(price_text)
                if price:
                    return price
        
        # Try JSON-LD structured data
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            import json
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    offers = data.get('offers', {})
                    if isinstance(offers, dict):
                        price = offers.get('price')
                        if price:
                            return float(price)
            except:
                continue
        
        # Try meta tags
        price_meta = soup.find('meta', {'property': 'product:price:amount'})
        if price_meta:
            return float(price_meta.get('content', ''))
            
    except Exception as e:
        print(f"Error scraping generic site: {e}", file=sys.stderr)
    
    return None

def scrape_price(url):
    """Main function to scrape price from URL."""
    if not url:
        return None
    
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()
    
    # Route to specific scraper based on domain
    if 'amazon' in domain:
        price = scrape_amazon(url)
    else:
        price = scrape_generic(url)
    
    return price

def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python scraper.py <url>", file=sys.stderr)
        sys.exit(1)
    
    url = sys.argv[1]
    price = scrape_price(url)
    
    if price is not None:
        print(f"{price:.2f}")
        sys.exit(0)
    else:
        print("Error: Could not extract price", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

