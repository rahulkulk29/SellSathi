const admin = require("firebase-admin");
const db = admin.firestore();
const invoiceService = require("../services/invoiceService");
const emailService = require("../services/emailService");
const path = require('path');
const fs = require('fs');

// Helper to process order (Save to DB + Generate Invoice + Send Emails)
const processOrderInternal = async (uid, orderData) => {
    try {
        // 1. Save Order to Database
        const orderRef = await db.collection("orders").add({
            ...orderData,
            userId: uid || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: orderData.status || "Placed",
            invoiceGenerated: false
        });

        const orderId = orderRef.id;
        console.log(`Order processed: ${orderId}`);

        const fullOrder = {
            ...orderData,
            orderId: orderData.orderId || orderId,
            documentId: orderId
        };

        // 2. Generate Invoice (Async)
        let invoicePath = null;
        try {
            invoicePath = await invoiceService.generateInvoice(fullOrder);
            console.log(`Invoice generated at: ${invoicePath}`);

            await orderRef.update({
                invoiceGenerated: true,
                invoicePath: invoicePath
            });
        } catch (invError) {
            console.error("Failed to generate invoice:", invError);
        }

        // 3. Send Emails (Async)
        if (invoicePath) {
            // A. Send to Consumer
            const consumerEmail = orderData.email || orderData.customerEmail;
            if (consumerEmail) {
                emailService.sendOrderConfirmation(consumerEmail, fullOrder, invoicePath)
                    .catch(err => console.error("Failed to send consumer email:", err));
            }

            // B. Send to Sellers
            if (orderData.items && orderData.items.length > 0) {
                const sellerGroups = orderData.items.reduce((acc, item) => {
                    const sId = item.sellerId || item.sellerUid;
                    if (sId) {
                        if (!acc[sId]) acc[sId] = [];
                        acc[sId].push(item);
                    }
                    return acc;
                }, {});

                Object.entries(sellerGroups).forEach(async ([sellerId, items]) => {
                    try {
                        const sellerSnap = await db.collection("users").doc(sellerId).get();
                        if (sellerSnap.exists) {
                            const sellerEmail = sellerSnap.data().email;
                            if (sellerEmail) {
                                emailService.sendSellerNotification(sellerEmail, fullOrder, items);
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to notify seller ${sellerId}:`, err);
                    }
                });
            }
        }

        return { success: true, orderId };
    } catch (error) {
        console.error("Internal Order Processing Error:", error);
        throw error;
    }
};

// POST /api/orders/place
exports.placeOrder = async (req, res) => {
    try {
        const { uid, orderData } = req.body;
        if (!uid || !orderData) {
            return res.status(400).json({ success: false, message: "Missing uid or orderData" });
        }

        const result = await processOrderInternal(uid, orderData);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to place order" });
    }
};

// Export the internal helper so index.js can use it
exports.processOrderInternal = processOrderInternal;

// GET /api/user/:uid/orders
exports.getUserOrders = async (req, res) => {
    try {
        const { uid } = req.params;
        const snapshot = await db.collection("orders")
            .where("userId", "==", uid)
            .get();

        const orders = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            orders.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date() // Convert timestamp
            });
        });

        // Sort in-memory to avoid index requirement
        orders.sort((a, b) => b.createdAt - a.createdAt);

        return res.status(200).json({ success: true, orders });

    } catch (error) {
        console.error("GET USER ORDERS ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

// GET /api/user/:uid/stats
exports.getOrderStats = async (req, res) => {
    try {
        const { uid } = req.params;
        const snapshot = await db.collection("orders").where("userId", "==", uid).get();

        let totalOrders = 0;
        let pendingOrders = 0;
        let deliveredOrders = 0;
        let cancelledOrders = 0;
        let totalSpend = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalOrders++;
            const status = data.status || "Placed";

            if (["Placed", "Confirmed", "Shipped", "Out for Delivery"].includes(status)) {
                pendingOrders++;
            } else if (status === "Delivered") {
                deliveredOrders++;
            } else if (status === "Cancelled") {
                cancelledOrders++;
            }

            if (status !== "Cancelled") {
                totalSpend += (data.total || 0);
            }
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                cancelledOrders,
                totalSpend
            }
        });

    } catch (error) {
        console.error("GET ORDER STATS ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch stats" });
    }
};

// GET /api/invoice/:orderId
exports.downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const invoiceName = `Invoice-${orderId}.pdf`;
        const invoicePath = path.join(__dirname, '..', 'invoices', invoiceName);

        if (fs.existsSync(invoicePath)) {
            res.download(invoicePath);
        } else {
            // Try to regenerate if checking existing order without invoice?
            // For now, return 404
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }

    } catch (error) {
        console.error("DOWNLOAD INVOICE ERROR:", error);
        return res.status(500).json({ success: false, message: "Failed to download invoice" });
    }
};
