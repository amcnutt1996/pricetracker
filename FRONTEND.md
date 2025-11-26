# Frontend Dashboard

A modern, responsive web dashboard for the Price Tracker application.

## Features

- **User Authentication**: Register and login functionality
- **Product Management**: Add, view, and delete tracked products
- **Price Monitoring**: View current prices, target prices, and last checked times
- **Manual Price Checks**: Trigger price checks on-demand for individual products or all products
- **Real-time Updates**: Automatic refresh after operations

## Access

Once the application is running via Docker, access the frontend at:

```
http://localhost:8080
```

The frontend is automatically served by Spring Boot from the `/static` directory.

## Usage

1. **Register/Login**: 
   - Create a new account or login with existing credentials
   - Note: Current implementation uses basic authentication (password verification should be added in production)

2. **Add Products**:
   - Enter product name, URL, and optional target price
   - Click "Add Product" to start tracking

3. **View Products**:
   - All your tracked products are displayed with current prices
   - See target prices and last checked timestamps

4. **Check Prices**:
   - Click "Check Price Now" on individual products
   - Or use "Check All Prices" to update all products at once

5. **Delete Products**:
   - Click the "Delete" button to remove a product from tracking

## Technical Details

- **Framework**: Vanilla JavaScript (no dependencies)
- **Styling**: Modern CSS with gradient design
- **API Communication**: RESTful API calls to Spring Boot backend
- **Storage**: LocalStorage for session persistence

## File Structure

```
src/main/resources/static/
├── index.html    # Main HTML structure
├── styles.css    # All styling
└── app.js        # Application logic and API calls
```

