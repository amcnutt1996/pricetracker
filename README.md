# Price Tracker Dashboard

A full-stack price tracking application that monitors product prices and sends email notifications when prices drop. Built with Java Spring Boot, Python Beautiful Soup, MySQL, and Docker.

## Features

- User account management
- Product price tracking with web scraping
- Email notifications when prices drop or reach target price
- RESTful API for dashboard operations
- Scheduled price checks
- Docker containerization for easy deployment

## Tech Stack

- **Backend**: Java Spring Boot 3.2.0
- **Web Scraping**: Python 3 with Beautiful Soup
- **Database**: MySQL 8.0
- **Containerization**: Docker & Docker Compose
- **Email**: Spring Mail (SMTP)

## Project Structure

```
pricetracker/
├── src/
│   └── main/
│       ├── java/com/pricetracker/
│       │   ├── controller/     # REST API endpoints
│       │   ├── service/        # Business logic
│       │   ├── repository/     # Data access layer
│       │   ├── model/          # JPA entities
│       │   └── dto/            # Data transfer objects
│       └── resources/
│           └── application.yml # Configuration
├── python/
│   ├── scraper.py              # Web scraping script
│   └── requirements.txt        # Python dependencies
├── Dockerfile
├── docker-compose.yml
└── pom.xml
```

## Prerequisites

- Docker and Docker Compose
- Maven 3.6+ (for local development)
- Java 17+ (for local development)
- Python 3.8+ (for local development)

## Quick Start with Docker

1. **Clone or navigate to the project directory**

2. **Set up required environment variables**

   Database (MySQL) credentials:
   ```bash
   export MYSQL_ROOT_PASSWORD=your-root-password
   export SPRING_DATASOURCE_URL="jdbc:mysql://mysql:3306/pricetracker?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
   export SPRING_DATASOURCE_USERNAME=root
   export SPRING_DATASOURCE_PASSWORD=your-app-password
   ```

   Email credentials (optional, for email notifications):
   ```bash
   export MAIL_USERNAME=your-email@gmail.com
   export MAIL_PASSWORD=your-app-password
   ```

3. **Start the application**:
   ```bash
   docker-compose up -d
   ```

4. **Check logs**:
   ```bash
   docker-compose logs -f app
   ```

The application will be available at `http://localhost:8080`

## Local Development

### 1. Set up MySQL Database

Start MySQL (using Docker or local installation):
```bash
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=pricetracker -p 3306:3306 mysql:8.0
```

### 2. Configure Application

The application reads most sensitive settings from environment variables.
For local development without Docker, you can export them before running:

```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/pricetracker?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=your-app-password
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

You generally should not hard-code real passwords into `src/main/resources/application.yml`.

### 3. Install Python Dependencies

```bash
cd python
pip3 install -r requirements.txt
```

### 4. Build and Run Spring Boot Application

```bash
mvn clean install
mvn spring-boot:run
```

## API Endpoints

### User Management

- `POST /api/users` - Create a new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email

### Product Management

- `POST /api/products` - Add a product to track
  ```json
  {
    "name": "Example Product",
    "url": "https://example.com/product",
    "targetPrice": 99.99,
    "userId": 1
  }
  ```

- `GET /api/products/user/{userId}` - Get all products for a user
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products` - Get all products
- `DELETE /api/products/{id}` - Delete a product
- `POST /api/products/{id}/check-price` - Manually trigger price check

## Configuration

### Application Properties

Key configuration in `application.yml`:

- **Database**: Configure MySQL connection
- **Email**: Set SMTP settings for notifications
- **Scraping**: Adjust price check interval (default: 60 minutes)

### Email Setup

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the app password in `MAIL_PASSWORD`

## How It Works

1. **User Registration**: Users create accounts via the API
2. **Product Tracking**: Users add products with URLs and optional target prices
3. **Price Scraping**: Python script scrapes prices from product URLs
4. **Scheduled Checks**: Spring Boot scheduler runs price checks at configured intervals
5. **Notifications**: Email alerts sent when:
   - Price drops below previous price
   - Price reaches or goes below target price

## Web Scraping

The Python scraper (`python/scraper.py`) supports:
- Amazon product pages
- Generic e-commerce sites (using common price selectors)
- JSON-LD structured data
- Meta tags

To test the scraper manually:
```bash
python3 python/scraper.py "https://example.com/product"
```

## Database Schema

- **users**: User accounts
- **products**: Tracked products with URLs and prices
- **price_history**: Historical price records

## Troubleshooting

### Python Script Not Found
Ensure the Python script path in `application.yml` matches your setup:
```yaml
app:
  python:
    script-path: python/scraper.py
```

### Email Not Sending
- Verify SMTP credentials
- Check firewall/network settings
- Review application logs for errors

### Scraping Failures
- Some websites may block automated requests
- Check if the website structure has changed
- Review scraper logs for specific errors

## Future Enhancements

- Authentication and authorization (JWT)
- Password hashing (BCrypt)
- More robust web scraping with Selenium for JavaScript-heavy sites
- Frontend dashboard UI
- Price history charts
- Multiple notification channels (SMS, push notifications)

## License

MIT License

