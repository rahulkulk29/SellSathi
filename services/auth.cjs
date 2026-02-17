const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.send("Backend is running from services/auth.cjs!");
});

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

console.log("🔥 Firebase initialized with Project ID:", serviceAccount.project_id);

const db = admin.firestore();

// TEST CREDENTIALS - For development/testing purposes only
const TEST_CREDENTIALS = {
    '+917483743936': { otp: '123456', role: 'ADMIN' },
    '+919876543210': { otp: '123456', role: 'CONSUMER' }, // Test consumer number
    '+917676879059': { otp: '123456', role: 'CONSUMER' }, // Real phone - Test as consumer
    // Add more test numbers here as needed
};

app.post("/auth/login", async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "ID token is required",
            });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const phoneNumber = decodedToken.phone_number || null;


        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            await userRef.set({
                uid,
                phone: phoneNumber,
                role: "CONSUMER",
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            return res.status(200).json({
                success: true,
                uid,
                role: "CONSUMER",
                status: "NEW_USER",
                message: "New user created as CONSUMER",
            });
        }
        const userData = userSnap.data();

        if (userData.isActive === false) {
            return res.status(403).json({
                success: false,
                role: userData.role,
                message: "Account is disabled. Contact support.",
            });
        }

        // STRICT SECURITY CHECK: Only specific phone number can be ADMIN
        const ADMIN_PHONE = "+917483743936";

        let userRole = userData.role;

        // If database says ADMIN but phone doesn't match, force CONSUMER
        if (userData.role === "ADMIN" && phoneNumber !== ADMIN_PHONE) {
            console.warn(`Security Alert: Non-admin phone ${phoneNumber} tried to login as ADMIN. Downgrading to CONSUMER.`);
            userRole = "CONSUMER";
        }

        // Only allow ADMIN role if phone matches exactly
        if (userRole === "ADMIN") {
            if (phoneNumber !== ADMIN_PHONE) {
                console.error(`SECURITY BREACH ATTEMPT: User with phone ${phoneNumber} trying to access admin with role ADMIN`);
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized admin access",
                });
            }
            return res.status(200).json({
                success: true,
                uid,
                role: "ADMIN",
                status: "AUTHORIZED",
                message: "Admin login successful",
            });
        }
        if (userData.role === "SELLER") {
            const sellerRef = db.collection("sellers").doc(uid);
            const sellerSnap = await sellerRef.get();

            if (!sellerSnap.exists) {
                return res.status(403).json({
                    success: false,
                    role: "SELLER",
                    message: "Seller profile missing. Contact admin.",
                });
            }

            const sellerData = sellerSnap.data();

            if (sellerData.sellerStatus === "APPROVED") {
                return res.status(200).json({
                    success: true,
                    uid,
                    role: "SELLER",
                    status: "APPROVED",
                    message: "Seller login successful",
                });
            }

            if (sellerData.sellerStatus === "PENDING") {
                return res.status(200).json({
                    success: true,
                    uid,
                    role: "SELLER",
                    status: "PENDING",
                    message: "Seller approval pending",
                });
            }

            if (sellerData.sellerStatus === "REJECTED") {
                return res.status(403).json({
                    success: false,
                    role: "SELLER",
                    status: "REJECTED",
                    message: "Seller request rejected",
                });
            }
        }

        return res.status(200).json({
            success: true,
            uid,
            role: "CONSUMER",
            status: "AUTHORIZED",
            message: "Consumer login successful",
        });

    } catch (error) {
        console.error("AUTH ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
});


// Endpoint for seller application
app.post("/auth/apply-seller", async (req, res) => {
    try {
        const { idToken, sellerDetails } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "ID token is required",
            });
        }

        if (!sellerDetails || !sellerDetails.shopName || !sellerDetails.category || !sellerDetails.address) {
            return res.status(400).json({
                success: false,
                message: "Shop name, category, and address are required",
            });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check if user exists
        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please login first.",
            });
        }

        const userData = userSnap.data();

        // Check if user is already a seller
        if (userData.role === "SELLER") {
            return res.status(400).json({
                success: false,
                message: "You are already registered as a seller",
            });
        }

        // Check if user is admin
        if (userData.role === "ADMIN") {
            return res.status(400).json({
                success: false,
                message: "Admin cannot become a seller",
            });
        }

        // Create seller application in sellers collection
        const sellerRef = db.collection("sellers").doc(uid);
        await sellerRef.set({
            uid,
            phone: sellerDetails.phone,
            shopName: sellerDetails.shopName,
            category: sellerDetails.category,
            address: sellerDetails.address,
            gstNumber: sellerDetails.gstNumber || "",
            sellerStatus: "PENDING",
            appliedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedAt: null,
            rejectedAt: null,
        });

        // Update user role to SELLER but keep status as PENDING
        await userRef.update({
            role: "SELLER",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).json({
            success: true,
            uid,
            message: "Seller application submitted successfully. Awaiting admin approval.",
            status: "PENDING",
        });

    } catch (error) {
        console.error("SELLER APPLICATION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit seller application",
        });
    }
});

// TEST CREDENTIALS ENDPOINT - For development/testing purposes only
// This endpoint allows testing without Firebase phone auth
app.post("/auth/test-login", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone and OTP are required",
            });
        }

        const phoneNumber = phone.startsWith('+91') ? phone : `+91${phone}`;

        // Check if this is a test credential
        if (!TEST_CREDENTIALS[phoneNumber]) {
            return res.status(401).json({
                success: false,
                message: "Invalid test credentials",
            });
        }

        const testCred = TEST_CREDENTIALS[phoneNumber];

        // Verify OTP
        if (otp !== testCred.otp) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Generate a mock UID based on phone number
        const uid = `test_${phoneNumber.replace(/[^0-9]/g, '')}`;

        // Check if user exists in database
        const userRef = db.collection("users").doc(uid);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            // Create test user with predefined role
            await userRef.set({
                uid,
                phone: phoneNumber,
                role: testCred.role,
                isActive: true,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            return res.status(200).json({
                success: true,
                uid,
                role: testCred.role,
                status: "NEW_USER",
                message: "Test user created successfully",
            });
        }

        const userData = userSnap.data();

        if (userData.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Account is disabled. Contact support.",
            });
        }

        // STRICT SECURITY CHECK: Only specific phone number can have ADMIN role
        const ADMIN_PHONE = "+917483743936";
        let userRole = userData.role;

        if (userData.role === "ADMIN" && phoneNumber !== ADMIN_PHONE) {
            console.warn(`Security Alert: Non-admin phone ${phoneNumber} tried to login as ADMIN. Downgrading to CONSUMER.`);
            userRole = "CONSUMER";
        }

        // Only allow ADMIN role if phone matches exactly
        if (userRole === "ADMIN") {
            if (phoneNumber !== ADMIN_PHONE) {
                console.error(`SECURITY BREACH ATTEMPT: User with phone ${phoneNumber} trying to access admin with role ADMIN`);
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized admin access",
                });
            }
            return res.status(200).json({
                success: true,
                uid,
                role: "ADMIN",
                status: "AUTHORIZED",
                message: "Admin login successful",
            });
        }

        return res.status(200).json({
            success: true,
            uid,
            role: userRole,
            status: "AUTHORIZED",
            message: "User login successful",
        });

    } catch (error) {
        console.error("TEST LOGIN ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Test login failed",
        });
    }
});

// ========== ADMIN ENDPOINTS ==========

// GET /admin/stats - Dashboard statistics
app.get("/admin/stats", async (req, res) => {
    try {
        const usersSnap = await db.collection("users").get();
        const sellersSnap = await db.collection("sellers").get();
        const productsSnap = await db.collection("products").get();
        const ordersSnap = await db.collection("orders").get();
        const reviewsSnap = await db.collection("reviews").get();

        const totalSellers = sellersSnap.size;
        const pendingSellers = sellersSnap.docs.filter(doc => doc.data().sellerStatus === "PENDING").length;
        const totalProducts = productsSnap.size;
        const totalOrders = ordersSnap.size;

        // Sum total reviews: real ones + a baseline mock number for each product to match Dashboard UI
        let totalReviews = reviewsSnap.size;
        productsSnap.forEach(doc => {
            const hash = doc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            totalReviews += (hash % 50) + 15; // Match the product review fallback baseline
        });

        const pendingOrders = ordersSnap.docs.filter(doc => doc.data().status !== "DELIVERED").length;

        return res.status(200).json({
            success: true,
            stats: {
                totalSellers,
                totalProducts,
                totalOrders, // Return the actual count
                todayOrders: totalOrders, // Maintain backward compatibility for UI
                pendingApprovals: pendingSellers,
                pendingOrders,
                totalReviews
            }
        });
    } catch (error) {
        console.error("STATS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stats"
        });
    }
});

// GET /admin/sellers - Pending sellers for approval
app.get("/admin/sellers", async (req, res) => {
    try {
        const sellersSnap = await db.collection("sellers").get();

        const sellers = [];
        for (const doc of sellersSnap.docs) {
            const sellerData = doc.data();
            const userSnap = await db.collection("users").doc(doc.id).get();
            const userData = userSnap.data();

            sellers.push({
                uid: doc.id,
                name: sellerData.shopName || "New Shop",
                email: userData?.phone || sellerData.phone || "N/A",
                type: "Individual",
                status: sellerData.sellerStatus || "PENDING",
                joined: sellerData.appliedAt?.toDate ? sellerData.appliedAt.toDate().toISOString().split('T')[0] : (sellerData.appliedAt?.seconds ? new Date(sellerData.appliedAt.seconds * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
                shopName: sellerData.shopName,
                category: sellerData.category,
                address: sellerData.address
            });
        }

        return res.status(200).json({
            success: true,
            sellers
        });
    } catch (error) {
        console.error("GET SELLERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch sellers"
        });
    }
});

// GET /admin/products - All products for review
app.get("/admin/products", async (req, res) => {
    try {
        const productsSnap = await db.collection("products").get();

        const products = [];

        // Add a hardcoded mock product as requested
        products.push({
            id: "mock-out-of-stock",
            title: "Out of Stock Test Product",
            seller: "Admin Demo Seller",
            price: 999,
            category: "Electronics",
            status: "Inactive",
            stock: 0,
            averageRating: 4.8,
            reviewCount: 42
        });
        for (const doc of productsSnap.docs) {
            const productData = doc.data();

            let sellerData = {};
            // Safely handle missing or invalid sellerId
            if (productData.sellerId && typeof productData.sellerId === 'string') {
                try {
                    const sellerSnap = await db.collection("users").doc(productData.sellerId).get();
                    if (sellerSnap.exists) {
                        sellerData = sellerSnap.data();
                    }
                } catch (err) {
                    console.log(`Error fetching seller for product ${doc.id}:`, err.message);
                }
            } else {
                console.log(`Product ${doc.id} has missing or invalid sellerId`);
            }

            // Fetch reviews for this product to calculate stats
            const reviewsSnap = await db.collection("reviews")
                .where("productId", "==", doc.id)
                .get();

            let totalRating = 0;
            const reviewCount = reviewsSnap.size;
            reviewsSnap.forEach(revDoc => {
                totalRating += (revDoc.data().rating || 0);
            });
            let averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;
            let displayReviewCount = reviewCount;

            // Manual ratings for showing (as requested by user)
            if (!averageRating || averageRating == 0 || reviewCount === 0) {
                // Generate a consistent pseudo-random rating based on product ID
                const hash = doc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                averageRating = (4.0 + (hash % 10) / 10).toFixed(1);
                displayReviewCount = (hash % 50) + 10;
            }

            // Stock-based status logic
            const stock = productData.stock !== undefined ? productData.stock : 10;
            let status;

            // If stock is 0, mark as Inactive
            if (stock === 0) {
                status = "Inactive";
            }
            // If product has a saved status, use it (for manual toggles)
            else if (productData.status && productData.status !== "PENDING" && productData.status !== "Pending") {
                status = productData.status;
            }
            // Default to Active for existing products with stock
            else {
                status = "Active";
            }

            products.push({
                id: doc.id,
                title: productData.title || "Unnamed Product",
                seller: sellerData?.shopName || sellerData?.phone || productData.sellerId || "Unknown Seller",
                price: productData.price,
                discountedPrice: (productData.discountedPrice && productData.discountedPrice < productData.price) ? productData.discountedPrice : null,
                category: productData.category,
                image: productData.image,
                status: status,
                stock: stock,
                averageRating: Number(averageRating),
                reviewCount: displayReviewCount
            });
        }


        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
});

// GET /admin/orders - All orders
app.get("/admin/orders", async (req, res) => {
    try {
        const ordersSnap = await db.collection("orders").get();

        // Fetch all orders and sort by createdAt descending
        const ordersSorted = [];
        for (const doc of ordersSnap.docs) {
            const orderData = doc.data();
            const orderIdStr = String(orderData.orderId || doc.id);

            // Aggressively extract timestamp from Order ID or createdAt
            let rawDate = orderData.createdAt?.seconds || 0;

            if (rawDate === 0) {
                const digits = orderIdStr.match(/\d+/g)?.join('') || '';
                if (digits.length >= 10) {
                    // Try to parse as seconds (10 chars) or ms (13 chars)
                    const parsed = parseInt(digits.substring(0, 10));
                    if (parsed > 1600000000 && parsed < 2000000000) { // Realistic range for 2020-2030
                        rawDate = parsed;
                    }
                }
            }

            ordersSorted.push({
                id: doc.id,
                orderId: orderIdStr,
                customer: orderData.customerName || "Unknown",
                total: orderData.total || 0,
                status: orderData.status || "Processing",
                date: (orderData.createdAt?.toDate ? orderData.createdAt.toDate().toISOString().split('T')[0] :
                    (rawDate ? new Date(rawDate * 1000).toISOString().split('T')[0] :
                        new Date().toISOString().split('T')[0])),
                rawDate: rawDate || (Date.now() / 1000) // Default to now if completely unknown
            });
        }

        // Final descending sort (newest first)
        ordersSorted.sort((a, b) => b.rawDate - a.rawDate);

        return res.status(200).json({
            success: true,
            orders: ordersSorted
        });
    } catch (error) {
        console.error("GET ORDERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
});

// POST /admin/seller/:uid/approve - Approve seller
app.post("/admin/seller/:uid/approve", async (req, res) => {
    try {
        const { uid } = req.params;

        const sellerRef = db.collection("sellers").doc(uid);
        await sellerRef.update({
            sellerStatus: "APPROVED",
            approvedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const userRef = db.collection("users").doc(uid);
        await userRef.update({
            role: "SELLER"
        });

        return res.status(200).json({
            success: true,
            message: "Seller approved successfully"
        });
    } catch (error) {
        console.error("APPROVE SELLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve seller"
        });
    }
});

// POST /admin/seller/:uid/reject - Reject seller
app.post("/admin/seller/:uid/reject", async (req, res) => {
    try {
        const { uid } = req.params;

        const sellerRef = db.collection("sellers").doc(uid);
        await sellerRef.update({
            sellerStatus: "REJECTED",
            rejectedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({
            success: true,
            message: "Seller rejected successfully"
        });
    } catch (error) {
        console.error("REJECT SELLER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject seller"
        });
    }
});

// POST /admin/product/:productId/status - Toggle product status
app.post("/admin/product/:productId/status", async (req, res) => {
    try {
        const { productId } = req.params;
        const { status } = req.body;
        console.log(`Update Product Status: ID=${productId}, targetStatus=${status}`);

        if (productId === "mock-out-of-stock") {
            return res.status(200).json({ success: true, message: "Mock product updated" });
        }

        if (!status) {
            return res.status(400).json({ success: false, message: "Status is required" });
        }

        await db.collection("products").doc(productId).update({
            status: status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ success: true, message: `Product status updated to ${status}` });
    } catch (error) {
        console.error("TOGGLE PRODUCT STATUS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to update product status" });
    }
});

// ========== SELLER ENDPOINTS ==========

// GET /seller/:uid/stats - Seller dashboard statistics
app.get("/seller/:uid/stats", async (req, res) => {
    try {
        const { uid } = req.params;

        // Products
        const productsSnap = await db.collection("products").where("sellerId", "==", uid).get();
        const totalProducts = productsSnap.size;

        // Orders (This is simplified. Ideally orders should store sellerId per item or we query subcollections)
        // For this hackathon scope, we'll scan all orders and filter in code or assume orders structure
        // Let's assume we search for all orders where items array contains a product with sellerId = uid
        // Fetching all orders is not scalable but works for small demo
        const allOrdersSnap = await db.collection("orders").get();
        let totalSales = 0;
        let newOrdersCount = 0;
        let pendingOrdersCount = 0;

        allOrdersSnap.forEach(doc => {
            const order = doc.data();
            // Check if any item in this order belongs to the seller
            const sellerItems = order.items?.filter(item => item.sellerId === uid) || [];

            if (sellerItems.length > 0) {
                // Calculate sales from these items
                const orderSales = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                totalSales += orderSales;

                if (order.status === 'Processing') newOrdersCount++; // Assuming 'Processing' is new
                if (order.status === 'Pending') pendingOrdersCount++;
            }
        });

        return res.status(200).json({
            success: true,
            stats: {
                totalSales, // Value in currency
                totalProducts,
                newOrders: newOrdersCount,
                pendingOrders: pendingOrdersCount
            }
        });

    } catch (error) {
        console.error("SELLER STATS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch seller stats"
        });
    }
});

// GET /seller/:uid/products - Get all products for a seller
app.get("/seller/:uid/products", async (req, res) => {
    try {
        const { uid } = req.params;
        const productsSnap = await db.collection("products").where("sellerId", "==", uid).get();

        const products = [];
        productsSnap.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error("SELLER PRODUCTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products"
        });
    }
});

// POST /seller/product/add - Add a new product
app.post("/seller/product/add", async (req, res) => {
    try {
        const { sellerId, productData } = req.body;

        if (!sellerId || !productData) {
            return res.status(400).json({ success: false, message: "Missing data" });
        }

        const newProduct = {
            ...productData,
            sellerId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "Active" // Default status
        };

        const docRef = await db.collection("products").add(newProduct);

        return res.status(200).json({
            success: true,
            message: "Product added successfully",
            productId: docRef.id
        });
    } catch (error) {
        console.error("ADD PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add product"
        });
    }
});

// DELETE /seller/product/:id - Delete a product
app.delete("/seller/product/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection("products").doc(id).delete();

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete product"
        });
    }
});

// GET /seller/:uid/orders - Get orders for a seller
app.get("/seller/:uid/orders", async (req, res) => {
    try {
        const { uid } = req.params;
        // Again, assuming simplified order structure scanning for demo
        const allOrdersSnap = await db.collection("orders").get();
        const sellerOrders = [];

        allOrdersSnap.forEach(doc => {
            const order = doc.data();
            const sellerItems = order.items?.filter(item => item.sellerId === uid) || [];

            if (sellerItems.length > 0) {
                sellerOrders.push({
                    id: doc.id,
                    orderId: order.orderId || doc.id,
                    customer: order.customerName || "Customer",
                    items: sellerItems, // Only show items relevant to this seller
                    total: sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                    status: order.status,
                    date: order.createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
                });
            }
        });

        return res.status(200).json({
            success: true,
            orders: sellerOrders
        });
    } catch (error) {
        console.error("SELLER ORDERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
});

// ========== PUBLIC PRODUCT ENDPOINTS ==========

// GET /products - Get all active products for listing with ratings
app.get("/products", async (req, res) => {
    try {
        const productsSnap = await db.collection("products").get();
        const products = [];

        for (const doc of productsSnap.docs) {
            const data = doc.data();
            const productId = doc.id;

            // Fetch reviews for this product to calculate stats
            // Note: In production, denormalizing these values into the product doc is better
            const reviewsSnap = await db.collection("reviews")
                .where("productId", "==", productId)
                .get();

            let totalRating = 0;
            const reviewCount = reviewsSnap.size;

            reviewsSnap.forEach(revDoc => {
                totalRating += (revDoc.data().rating || 0);
            });

            const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

            products.push({
                id: productId,
                ...data,
                averageRating: Number(averageRating),
                reviewCount
            });
        }
        res.status(200).json({ success: true, products });
    } catch (error) {
        console.error("GET PUBLIC PRODUCTS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
});

// GET /product/:id - Get single product details
app.get("/product/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection("products").doc(id).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const data = doc.data();
        let sellerName = "Unknown Seller";

        if (data.sellerId) {
            const sellerSnap = await db.collection("users").doc(data.sellerId).get();
            if (sellerSnap.exists) {
                sellerName = sellerSnap.data().shopName || sellerSnap.data().phone || "Seller";
            }
        }

        res.status(200).json({ success: true, product: { id: doc.id, ...data, seller: sellerName } });
    } catch (error) {
        console.error("GET PRODUCT DETAIL ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch product" });
    }
});

// ========== REVIEW SYSTEM ENDPOINTS ==========

// POST /reviews/add - Add a new review
app.post("/reviews/add", async (req, res) => {
    try {
        const { idToken, productId, rating, feedback } = req.body;

        if (!idToken || !productId || !rating) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const phone = decodedToken.phone_number || "Anonymous";

        await db.collection("reviews").add({
            productId,
            userId: uid,
            userName: phone, // Using phone as name for now, or fetch user profile if available
            rating: Number(rating),
            feedback: feedback || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ success: true, message: "Review added successfully" });
    } catch (error) {
        console.error("ADD REVIEW ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to add review" });
    }
});

// GET /reviews/:productId - Get reviews for a specific product
app.get("/reviews/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const reviewsSnap = await db.collection("reviews")
            .where("productId", "==", productId)
            .get();

        const reviews = [];
        reviewsSnap.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        // Sort by createdAt desc in JS to avoid composite index requirement
        reviews.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("GET REVIEWS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
});

// GET /admin/reviews - Get all reviews for admin dashboard
app.get("/admin/reviews", async (req, res) => {
    try {
        const reviewsSnap = await db.collection("reviews").get();

        const reviews = [];
        for (const doc of reviewsSnap.docs) {
            const review = doc.data();
            // Fetch product name for context
            let productName = "Unknown Product";
            try {
                const productDoc = await db.collection("products").doc(review.productId).get();
                if (productDoc.exists) {
                    productName = productDoc.data().title;
                }
            } catch (e) {
                console.log("Error fetching product for review:", e.message);
            }

            reviews.push({
                id: doc.id,
                ...review,
                productName
            });
        }

        // Sort in JS
        reviews.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("ADMIN REVIEWS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch all reviews" });
    }
});

// DELETE /admin/product/:productId - Delete a product and notify seller
app.post("/admin/product/:productId/delete", async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Fetch product data before deletion to get sellerId and title
        const productDoc = await db.collection("products").doc(productId).get();
        if (!productDoc.exists) {
            return res.status(404).json({ success: false, message: "Product already deleted or not found" });
        }

        const productData = productDoc.data();
        const sellerId = productData.sellerId;
        const productTitle = productData.title;

        // 2. Delete the product
        await db.collection("products").doc(productId).delete();

        // 3. Notify the seller
        if (sellerId) {
            await db.collection("notifications").add({
                sellerId: sellerId,
                message: `Your product '${productTitle}' has been removed by the admin due to negative customer feedback.`,
                type: "PRODUCT_DELETED",
                productId: productId,
                productTitle: productTitle,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                read: false
            });
        }

        res.status(200).json({ success: true, message: "Product deleted and seller notified" });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to delete product" });
    }
});

// ========== CUSTOMER REVIEW ENDPOINTS ==========

// POST /reviews/add - Submit a product review
app.post("/reviews/add", async (req, res) => {
    try {
        const { idToken, productId, rating, feedback } = req.body;

        if (!idToken || !productId || !rating || !feedback) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Verify user token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;

        // Get user info
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data();
        const userName = userData?.name || userData?.email || "Anonymous";

        // Create review document
        const reviewData = {
            productId: productId,
            userId: userId,
            userName: userName,
            rating: Number(rating),
            feedback: feedback,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("reviews").add(reviewData);

        // Update product's average rating
        const reviewsSnap = await db.collection("reviews").where("productId", "==", productId).get();
        let totalRating = 0;
        let reviewCount = 0;

        reviewsSnap.forEach(doc => {
            totalRating += doc.data().rating || 0;
            reviewCount++;
        });

        const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

        await db.collection("products").doc(productId).update({
            averageRating: Number(averageRating),
            reviewCount: reviewCount
        });

        res.status(200).json({ success: true, message: "Review submitted successfully" });
    } catch (error) {
        console.error("ADD REVIEW ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to submit review" });
    }
});

// GET /reviews/:productId - Get all reviews for a product
app.get("/reviews/:productId", async (req, res) => {
    try {
        const { productId } = req.params;

        const reviewsSnap = await db.collection("reviews")
            .where("productId", "==", productId)
            .orderBy("createdAt", "desc")
            .get();

        const reviews = [];
        reviewsSnap.forEach(doc => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        console.error("GET REVIEWS ERROR:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
});