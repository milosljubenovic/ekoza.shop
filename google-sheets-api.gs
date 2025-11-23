// Google Apps Script for handling ekoza.shop orders
// Deploy this as a Web App: Deploy > New deployment > Web app
// Set "Execute as" to "Me" and "Who has access" to "Anyone"

// Your Google Sheet ID (get from URL: docs.google.com/spreadsheets/d/SHEET_ID/edit)
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';

function doPost(e) {
  try {
    const orderData = JSON.parse(e.postData.contents);
    
    // Add order to "Orders" sheet
    addOrderToSheet(orderData);
    
    // Send email notification (optional)
    sendOrderNotification(orderData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        orderNumber: orderData.orderNumber,
        message: 'Order received successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addOrderToSheet(orderData) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let ordersSheet = ss.getSheetByName('Orders');
  
  // Create Orders sheet if it doesn't exist
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet('Orders');
    
    // Add headers
    ordersSheet.appendRow([
      'Order Number',
      'Date/Time',
      'Status',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'Postal Code',
      'Country',
      'Shipping Method',
      'Payment Method',
      'Items',
      'Subtotal (RSD)',
      'Shipping (RSD)',
      'COD Fee (RSD)',
      'Total (RSD)',
      'Notes'
    ]);
    
    // Format header row
    const headerRange = ordersSheet.getRange(1, 1, 1, 18);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4A5568');
    headerRange.setFontColor('#FFFFFF');
  }
  
  // Prepare items list
  const itemsList = orderData.items.map(item => 
    `${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${item.price * item.quantity} RSD`
  ).join('\n');
  
  // Add order row
  ordersSheet.appendRow([
    orderData.orderNumber,
    new Date(orderData.timestamp),
    orderData.status,
    `${orderData.customer.firstName} ${orderData.customer.lastName}`,
    orderData.customer.email,
    orderData.customer.phone,
    orderData.shipping.address,
    orderData.shipping.city,
    orderData.shipping.postalCode,
    orderData.shipping.country,
    getShippingMethodName(orderData.shipping.method),
    getPaymentMethodName(orderData.paymentMethod),
    itemsList,
    orderData.pricing.subtotal,
    orderData.pricing.shipping,
    orderData.pricing.codFee || 0,
    orderData.pricing.total,
    orderData.notes
  ]);
  
  // Add detailed items to separate sheet
  addItemsToSheet(ss, orderData);
}

function addItemsToSheet(ss, orderData) {
  let itemsSheet = ss.getSheetByName('Order Items');
  
  // Create Order Items sheet if it doesn't exist
  if (!itemsSheet) {
    itemsSheet = ss.insertSheet('Order Items');
    
    // Add headers
    itemsSheet.appendRow([
      'Order Number',
      'Date/Time',
      'Product Name',
      'Color',
      'Size',
      'Quantity',
      'Unit Price (RSD)',
      'Total (RSD)'
    ]);
    
    // Format header row
    const headerRange = itemsSheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4A5568');
    headerRange.setFontColor('#FFFFFF');
  }
  
  // Add each item
  orderData.items.forEach(item => {
    itemsSheet.appendRow([
      orderData.orderNumber,
      new Date(orderData.timestamp),
      item.name,
      item.color,
      item.size,
      item.quantity,
      item.price,
      item.price * item.quantity
    ]);
  });
}

function getShippingMethodName(method) {
  const methods = {
    'standard': 'Brza Pošta (do 7 radnih dana)',
    'pickup': 'Lično preuzimanje (3 radna dana)'
  };
  return methods[method] || method;
}

function getPaymentMethodName(method) {
  const methods = {
    'pouzecem': 'Plaćanje pouzećem',
    'uplatnica': 'Uplata na račun pre slanja'
  };
  return methods[method] || method;
}

function sendOrderNotification(orderData) {
  // Configure your email address to receive notifications
  const ADMIN_EMAIL = 'your-email@example.com';
  
  const subject = `Nova porudžbina #${orderData.orderNumber}`;
  
  const itemsList = orderData.items.map(item => 
    `• ${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${item.price * item.quantity} RSD`
  ).join('\n');
  
  const body = `
Nova porudžbina je primljena!

Broj porudžbine: ${orderData.orderNumber}
Datum: ${new Date(orderData.timestamp).toLocaleString('sr-RS')}
Status: ${orderData.status}

KUPAC:
Ime i prezime: ${orderData.customer.firstName} ${orderData.customer.lastName}
Email: ${orderData.customer.email}
Telefon: ${orderData.customer.phone}

DOSTAVA:
Adresa: ${orderData.shipping.address}
Grad: ${orderData.shipping.city}
Poštanski broj: ${orderData.shipping.postalCode}
Država: ${orderData.shipping.country}
Način dostave: ${getShippingMethodName(orderData.shipping.method)}

NAČIN PLAĆANJA: ${getPaymentMethodName(orderData.paymentMethod)}

PROIZVODI:
${itemsList}

UKUPNO:
Međuzbir: ${orderData.pricing.subtotal} RSD
Dostava: ${orderData.pricing.shipping === 0 ? 'Besplatna' : orderData.pricing.shipping + ' RSD'}
${orderData.pricing.codFee ? 'Naknada pouzećem: ' + orderData.pricing.codFee + ' RSD\n' : ''}UKUPNO: ${orderData.pricing.total} RSD

${orderData.notes ? 'NAPOMENA:\n' + orderData.notes : ''}

--
ekoza.shop
  `;
  
  MailApp.sendEmail(ADMIN_EMAIL, subject, body);
  
  // Send confirmation email to customer
  sendCustomerConfirmation(orderData);
}

function sendCustomerConfirmation(orderData) {
  const itemsList = orderData.items.map(item => 
    `• ${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${item.price * item.quantity} RSD`
  ).join('\n');
  
  const subject = `Potvrda porudžbine #${orderData.orderNumber} - ekoza.shop`;
  
  const body = `
Poštovani ${orderData.customer.firstName},

Hvala Vam što ste izabrali ekoza.shop!

Vaša porudžbina je uspešno primljena i biće obrađena u najkraćem roku.

DETALJI PORUDŽBINE:
Broj porudžbine: ${orderData.orderNumber}
Datum: ${new Date(orderData.timestamp).toLocaleString('sr-RS')}

PROIZVODI:
${itemsList}

UKUPNO:
Međuzbir: ${orderData.pricing.subtotal} RSD
Dostava: ${orderData.pricing.shipping === 0 ? 'Besplatna' : orderData.pricing.shipping + ' RSD'}
UKUPNO: ${orderData.pricing.total} RSD

NAČIN PLAĆANJA: ${getPaymentMethodName(orderData.paymentMethod)}

ADRESA DOSTAVE:
${orderData.shipping.address}
${orderData.shipping.postalCode} ${orderData.shipping.city}
${orderData.shipping.country}

Bićete obavešteni kada Vaša porudžbina bude poslata.

Ukoliko imate bilo kakvih pitanja, slobodno nas kontaktirajte.

Srdačan pozdrav,
ekoza.shop tim

--
Web: https://ekoza.shop
Email: kontakt@ekoza.shop
  `;
  
  MailApp.sendEmail(orderData.customer.email, subject, body);
}

// Function to check order status (can be called via GET request)
function doGet(e) {
  const orderNumber = e.parameter.orderNumber;
  
  if (!orderNumber) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Order number is required'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  try {
    const orderStatus = getOrderStatus(orderNumber);
    
    return ContentService
      .createTextOutput(JSON.stringify(orderStatus))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrderStatus(orderNumber) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const ordersSheet = ss.getSheetByName('Orders');
  
  if (!ordersSheet) {
    throw new Error('Orders sheet not found');
  }
  
  const data = ordersSheet.getDataRange().getValues();
  
  // Find order by order number
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderNumber) {
      return {
        orderNumber: data[i][0],
        date: data[i][1],
        status: data[i][2],
        customerName: data[i][3],
        total: data[i][14],
        found: true
      };
    }
  }
  
  return { found: false };
}
