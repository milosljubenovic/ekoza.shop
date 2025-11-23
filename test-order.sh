#!/bin/bash

# Test order submission to Google Apps Script
# This sends a sample order to verify your setup works

curl -X POST \
  'https://script.google.com/macros/s/AKfycbwgbhQPDVbVEA4pwh5GCEL3xSkkdRct427rcAjfW_TOwdLPzH9Ziffd7vRmGz3ToRA9/exec' \
  -H 'Content-Type: application/json' \
  -d '{
    "orderNumber": "EK12345678",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
    "status": "pending",
    "customer": {
      "firstName": "Test",
      "lastName": "Kupac",
      "email": "test@example.com",
      "phone": "+381 62 123 4567"
    },
    "shipping": {
      "address": "Test Ulica 123",
      "city": "Beograd",
      "postalCode": "11000",
      "country": "Srbija",
      "method": "standard"
    },
    "paymentMethod": "pouzecem",
    "notes": "Ovo je test porudžbina",
    "items": [
      {
        "id": 1,
        "name": "Test Lazy Bag",
        "price": 4000,
        "quantity": 1,
        "color": "Crvena",
        "size": "M",
        "image": "/assets/images/products/test.jpg",
        "url": "/proizvod/test/"
      }
    ],
    "pricing": {
      "subtotal": 4000,
      "shipping": 400,
      "codFee": 0,
      "total": 4400
    }
  }'

echo ""
echo "✅ Test order sent!"
echo "📋 Check your Google Sheet for the order"
echo "📧 Check your email for notifications"
