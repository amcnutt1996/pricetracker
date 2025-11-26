// API Base URL - use relative path since frontend is served from same origin
const API_BASE = '/api';

// Current user state
let currentUser = null;
let currentUserId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in (stored in localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            currentUser = user;
            currentUserId = user.id;
            showDashboard();
        } catch (e) {
            localStorage.removeItem('currentUser');
        }
    }
});

// Auth Functions
function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            currentUserId = user.id;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification('Registration successful!', 'success');
            showDashboard();
        } else {
            const error = await response.text();
            showNotification(error || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
        console.error('Registration error:', error);
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // First, try to get user by email
        const userResponse = await fetch(`${API_BASE}/users/email/${encodeURIComponent(email)}`);
        
        if (userResponse.ok) {
            const user = await userResponse.json();
            // In a real app, you'd verify the password on the backend
            // For now, we'll just check if user exists
            currentUser = user;
            currentUserId = user.id;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification('Login successful!', 'success');
            showDashboard();
        } else {
            showNotification('Invalid email or password', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
        console.error('Login error:', error);
    }
}

function logout() {
    currentUser = null;
    currentUserId = null;
    localStorage.removeItem('currentUser');
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
    showNotification('Logged out successfully', 'info');
}

function showDashboard() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    loadProducts();
}

// Product Functions
async function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const url = document.getElementById('productUrl').value;
    const targetPrice = document.getElementById('targetPrice').value;

    const productData = {
        name,
        url,
        userId: currentUserId,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null
    };

    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            const product = await response.json();
            showNotification('Product added successfully!', 'success');
            // Clear form
            document.getElementById('productName').value = '';
            document.getElementById('productUrl').value = '';
            document.getElementById('targetPrice').value = '';
            // Immediately reload products to show the new one
            await loadProducts();
            // Scroll to products list to show the newly added product
            const productsList = document.getElementById('productsList');
            if (productsList) {
                productsList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            const error = await response.text();
            showNotification(error || 'Failed to add product', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
        console.error('Add product error:', error);
    }
}

async function loadProducts() {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '<p class="loading">Loading products...</p>';

    try {
        const response = await fetch(`${API_BASE}/products/user/${currentUserId}`);
        
        if (response.ok) {
            const products = await response.json();
            displayProducts(products);
        } else {
            productsList.innerHTML = '<p class="empty-state">No products found. Add your first product above!</p>';
        }
    } catch (error) {
        productsList.innerHTML = '<p class="error">Error loading products. Please refresh the page.</p>';
        console.error('Load products error:', error);
    }
}

function displayProducts(products) {
    const productsList = document.getElementById('productsList');
    
    if (products.length === 0) {
        productsList.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p>No products tracked yet. Add your first product above!</p>
            </div>
        `;
        return;
    }

    productsList.innerHTML = products.map(product => {
        const currentPrice = product.currentPrice ? `$${product.currentPrice.toFixed(2)}` : 'Not checked';
        const targetPrice = product.targetPrice ? `$${product.targetPrice.toFixed(2)}` : 'Not set';
        const lastChecked = product.lastChecked ? formatLocalDateTime(product.lastChecked) : 'Never';
        const emailEnabled = product.emailNotificationsEnabled !== false; // Default to true if null
        
        return `
            <div class="product-item">
                <div class="product-header">
                    <div class="product-header-left">
                        <div class="product-name-row">
                            <div class="product-name">${escapeHtml(product.name)}</div>
                            <label class="toggle-switch" title="${emailEnabled ? 'Disable' : 'Enable'} email notifications">
                                <input type="checkbox" ${emailEnabled ? 'checked' : ''} onchange="toggleEmailNotifications(${product.id}, this.checked)">
                                <span class="toggle-slider"></span>
                            </label>
                            <span class="toggle-label">Email Alerts</span>
                        </div>
                        <a href="${escapeHtml(product.url)}" target="_blank" class="product-url">${escapeHtml(product.url)}</a>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
                <div class="product-info">
                    <div class="info-item">
                        <span class="info-label">Current Price</span>
                        <span class="info-value price-current">${currentPrice}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Target Price</span>
                        <span class="info-value price-target">${targetPrice}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Last Checked</span>
                        <span class="info-value">${lastChecked}</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-primary btn-sm" onclick="checkPrice(${product.id})">Check Price Now</button>
                </div>
            </div>
        `;
    }).join('');
}

async function checkPrice(productId) {
    try {
        showNotification('Checking price...', 'info');
        
        // Trigger price check via scraping endpoint
        const response = await fetch(`${API_BASE}/products/${productId}/check-price`, {
            method: 'POST'
        });

        if (response.ok) {
            // Wait a bit then reload products to see updated price
            setTimeout(() => {
                loadProducts();
                showNotification('Price check completed!', 'success');
            }, 2000);
        } else {
            showNotification('Failed to check price', 'error');
        }
    } catch (error) {
        showNotification('Error checking price', 'error');
        console.error('Check price error:', error);
    }
}

async function checkAllPrices() {
    try {
        showNotification('Checking all prices...', 'info');
        
        const response = await fetch(`${API_BASE}/scraping/check-all`, {
            method: 'POST'
        });

        if (response.ok) {
            setTimeout(() => {
                loadProducts();
                showNotification('All prices checked!', 'success');
            }, 3000);
        } else {
            showNotification('Failed to check prices', 'error');
        }
    } catch (error) {
        showNotification('Error checking prices', 'error');
        console.error('Check all prices error:', error);
    }
}

async function toggleEmailNotifications(productId, enabled) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}/toggle-email-notifications`, {
            method: 'POST'
        });

        if (response.ok) {
            const product = await response.json();
            showNotification(
                enabled ? 'Email notifications enabled for this product' : 'Email notifications disabled for this product',
                'success'
            );
            // Update the product in the list without full reload
            loadProducts();
        } else {
            showNotification('Failed to update email notifications', 'error');
        }
    } catch (error) {
        showNotification('Error updating email notifications', 'error');
        console.error('Toggle email notifications error:', error);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification('Product deleted successfully', 'success');
            loadProducts();
        } else {
            showNotification('Failed to delete product', 'error');
        }
    } catch (error) {
        showNotification('Error deleting product', 'error');
        console.error('Delete product error:', error);
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatLocalDateTime(dateString) {
    if (!dateString) return 'Never';
    
    try {
        // Server sends dates in UTC but without the 'Z' suffix
        // Append 'Z' to tell JavaScript the time is in UTC
        let utcDateString = dateString;
        if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
            utcDateString = dateString + 'Z';
        }
        
        // Parse the date string as UTC
        const date = new Date(utcDateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        // Format to user's local timezone with a readable format
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        };
        
        return date.toLocaleString(undefined, options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
}

