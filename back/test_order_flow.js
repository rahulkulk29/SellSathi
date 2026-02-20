
const axios = require('axios');

async function testOrderFlow() {
    try {
        console.log("Testing Order Flow...");

        // Mock User UID (assuming a test user exists or just use a string, as controller doesn't strictly validate UID existence against Auth, just DB)
        // In real app, UID comes from decoded token. In our controller `placeOrder`, we accept UID in body.
        // Wait, `placeOrder` takes `uid` from `req.body` directly? Yes.

        const testUid = "test_user_123";
        const orderId = "OD" + Math.floor(Math.random() * 10000000);

        const orderData = {
            orderId: orderId,
            items: [
                { title: "Test Product A", price: 500, quantity: 2 },
                { title: "Test Product B", price: 1000, quantity: 1 }
            ],
            total: 2000,
            shippingAddress: {
                firstName: "Test",
                lastName: "User",
                addressLine: "123 Test St",
                city: "Test City",
                pincode: "123456"
            },
            paymentMethod: "card",
            status: "Placed",
            customerName: "Test User",
            email: "test@example.com",
            phone: "9999999999"
        };

        console.log(`Sending order ${orderId}...`);

        const response = await axios.post('http://localhost:5000/api/orders/place', {
            uid: testUid,
            orderData: orderData
        });

        console.log("Response:", response.data);

        if (response.data.success) {
            console.log("✅ Order placed successfully!");
            console.log("Check server logs for Invoice Generation and Email sending.");
        } else {
            console.log("❌ Failed to place order:", response.data.message);
        }

    } catch (error) {
        console.error("❌ Error:", error.response ? error.response.data : error.message);
    }
}

testOrderFlow();
