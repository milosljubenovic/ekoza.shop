# Google Sheets Order Management Setup Guide

This guide will help you set up Google Sheets to receive and manage orders from your ekoza.shop website.

## Overview

The system uses Google Apps Script to:
- Receive orders from your website via POST requests
- Store order data in Google Sheets
- Send email notifications to you and customers
- Allow order status tracking via GET requests

---

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it **"ekoza.shop Orders"**
4. Note the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
5. The script will automatically create two sheets:
   - **Orders** - Main order information
   - **Order Items** - Detailed product information per order

---

## Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete any existing code in the editor
3. Copy the entire contents of `google-sheets-api.gs` file
4. Paste it into the Apps Script editor
5. Update the configuration at the top:

```javascript
// Replace with your actual Google Sheet ID
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

// Replace with your email to receive order notifications
const ADMIN_EMAIL = 'your-email@example.com';
```

6. Save the project (File > Save or Ctrl+S)
7. Name the project: **"ekoza.shop Order Handler"**

---

## Step 3: Deploy as Web App

1. In Apps Script editor, click **Deploy > New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure deployment settings:
   - **Description**: "ekoza.shop Order API"
   - **Execute as**: **Me** (your account)
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. **Authorize the script**:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to ekoza.shop Order Handler (unsafe)"
   - Click "Allow"
7. Copy the **Web app URL** - it looks like:
   ```
   https://script.google.com/macros/s/XXXXX/exec
   ```

---

## Step 4: Configure Website

1. Open `assets/js/checkout.js` in your code editor
2. Find line 4 and replace the placeholder:

```javascript
// Before:
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// After:
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXX/exec';
```

3. Save the file
4. Commit and deploy your website

---

## Step 5: Test the Integration

### Test Order Submission

1. Visit your website checkout page: `https://ekoza.shop/porudzbina/`
2. Add some products to cart
3. Fill out the checkout form
4. Submit the order
5. Check your Google Sheet - a new row should appear in "Orders" sheet
6. Check your email - you should receive an order notification

### Test Order Tracking (Optional)

You can check order status by making a GET request:
```
https://script.google.com/macros/s/XXXXX/exec?orderNumber=EK12345678
```

---

## Google Sheet Structure

### Orders Sheet

| Column | Description |
|--------|-------------|
| Order Number | Unique order ID (EK + timestamp) |
| Date/Time | Order timestamp |
| Status | Order status (pending, processing, shipped, delivered) |
| Customer Name | Full name |
| Email | Customer email |
| Phone | Customer phone number |
| Address | Delivery address |
| City | City |
| Postal Code | ZIP/Postal code |
| Country | Country |
| Payment Method | Payment method chosen |
| Items | List of all items in order |
| Subtotal (RSD) | Items total |
| Shipping (RSD) | Shipping cost |
| Total (RSD) | Final total |
| Notes | Customer notes |

### Order Items Sheet

| Column | Description |
|--------|-------------|
| Order Number | Reference to order |
| Date/Time | Order timestamp |
| Product Name | Product name |
| Color | Selected color |
| Size | Selected size |
| Quantity | Number of items |
| Unit Price (RSD) | Price per item |
| Total (RSD) | Line total |

---

## Managing Orders

### Change Order Status

1. Open your Google Sheet
2. Find the order in the "Orders" sheet
3. Update the "Status" column to one of:
   - `pending` - Order received, awaiting processing
   - `processing` - Order is being prepared
   - `shipped` - Order has been shipped
   - `delivered` - Order has been delivered
   - `cancelled` - Order cancelled

### Filter Orders

Use Google Sheets filters to view:
- Today's orders: Filter Date/Time column
- Pending orders: Filter Status = "pending"
- By payment method: Filter Payment Method column
- By customer: Filter Customer Name or Email

### Export Orders

1. File > Download > CSV or Excel
2. Select date range if needed
3. Use for accounting or inventory tracking

---

## Email Notifications

### Admin Notification

When an order is submitted, you receive an email with:
- Order number and details
- Customer information
- Delivery address
- List of items ordered
- Total amount
- Payment method

### Customer Confirmation

Customers automatically receive a confirmation email with:
- Order number for reference
- Order summary
- Delivery address
- Total amount
- Expected next steps

### Customize Emails

Edit the `sendOrderNotification()` and `sendCustomerConfirmation()` functions in `google-sheets-api.gs` to customize email content.

---

## Troubleshooting

### Orders not appearing in sheet

1. Check Web App URL is correctly set in `checkout.js`
2. Verify deployment settings (Execute as: Me, Who has access: Anyone)
3. Check Apps Script execution logs:
   - Apps Script Editor > Executions
   - Look for errors

### Emails not sending

1. Verify `ADMIN_EMAIL` is set correctly in script
2. Check Gmail sending limits (100 emails/day for free accounts)
3. Check spam folder

### Authorization errors

1. Re-deploy the Web App
2. Re-authorize the script
3. Make sure you're using the latest deployment URL

### CORS errors in browser console

This is expected with `mode: 'no-cors'` in checkout.js. Orders will still be submitted successfully.

---

## Advanced Features

### Add Order Status Page

Create a page where customers can check their order status:

```html
<!-- praćenje-porudžbine.html -->
<form id="trackOrderForm">
  <input type="text" id="orderNumberInput" placeholder="Broj porudžbine (npr. EK12345678)">
  <button type="submit">Proveri Status</button>
</form>

<div id="orderStatus"></div>

<script>
document.getElementById('trackOrderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const orderNumber = document.getElementById('orderNumberInput').value;
  
  const response = await fetch(
    `https://script.google.com/macros/s/XXXXX/exec?orderNumber=${orderNumber}`
  );
  const data = await response.json();
  
  const statusDiv = document.getElementById('orderStatus');
  if (data.found) {
    statusDiv.innerHTML = `
      <h3>Porudžbina ${data.orderNumber}</h3>
      <p>Status: ${data.status}</p>
      <p>Datum: ${new Date(data.date).toLocaleDateString('sr-RS')}</p>
      <p>Ukupno: ${data.total} RSD</p>
    `;
  } else {
    statusDiv.innerHTML = '<p>Porudžbina nije pronađena.</p>';
  }
});
</script>
```

### Connect to Inventory System

Extend the script to:
- Update product inventory in a separate sheet
- Send low stock alerts
- Generate restock reports

### Analytics Dashboard

Use Google Sheets built-in features:
- Create pivot tables for sales analysis
- Build charts for revenue trends
- Track best-selling products

---

## Security Notes

1. **Never commit** the actual Google Apps Script URL to public repositories
2. Use environment variables for sensitive data in production
3. Consider adding authentication for order tracking
4. Regularly review Apps Script execution logs
5. Set up backup exports of your order data

---

## Support

If you encounter issues:

1. Check the [Google Apps Script documentation](https://developers.google.com/apps-script)
2. Review Apps Script execution logs for errors
3. Test with browser developer console open
4. Verify all configuration values are correct

---

## Quick Reference

### Important Files

- `assets/js/checkout.js` - Frontend checkout logic
- `google-sheets-api.gs` - Backend order processing
- `porudzbina.html` - Checkout page

### Configuration Variables

```javascript
// In checkout.js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXX/exec';

// In google-sheets-api.gs
const SHEET_ID = 'YOUR_SHEET_ID';
const ADMIN_EMAIL = 'your-email@example.com';
```

### Order Number Format

Format: `EK` + last 8 digits of timestamp
Example: `EK12345678`

---

## Next Steps

Once setup is complete:

1. ✅ Test with a real order
2. ✅ Verify emails are received
3. ✅ Check data in Google Sheets
4. ✅ Test order status tracking
5. ✅ Train team on order management
6. ✅ Set up regular backups
7. ✅ Go live! 🚀
