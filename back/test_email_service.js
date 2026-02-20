const emailService = require('./services/emailService');
const path = require('path');
const fs = require('fs');

async function testEmail() {
    console.log("Starting Email Service Test...");

    const mockOrder = {
        orderId: "TEST-12345",
        customerName: "Lokesh S",
        total: 1500,
        email: "test@example.com"
    };

    // Create a dummy file for invoice
    const dummyInvoicePath = path.join(__dirname, 'invoices', 'Invoice-TEST-12345.pdf');
    if (!fs.existsSync(path.join(__dirname, 'invoices'))) {
        fs.mkdirSync(path.join(__dirname, 'invoices'));
    }
    fs.writeFileSync(dummyInvoicePath, 'Mock PDF Content');

    try {
        // 1. Test Consumer Email
        const consumerResult = await emailService.sendOrderConfirmation(mockOrder.email, mockOrder, dummyInvoicePath);
        console.log("Consumer Test Result:", consumerResult);

        // 2. Test Seller Email
        const mockSellerItems = [
            { name: "Handmade Jute Bag", quantity: 1, price: 450 }
        ];
        const sellerResult = await emailService.sendSellerNotification("seller@example.com", mockOrder, mockSellerItems);
        console.log("Seller Test Result:", sellerResult);

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        // Cleanup dummy file
        if (fs.existsSync(dummyInvoicePath)) {
            // fs.unlinkSync(dummyInvoicePath);
        }
    }
}

testEmail();
