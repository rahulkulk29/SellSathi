const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

console.log("Initializing Firebase...");
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase initialized.");
} catch (e) {
    console.error("Error initializing Firebase:", e);
    process.exit(1);
}

const db = admin.firestore();

async function testConnection() {
    console.log("Attempting to fetch users collection...");
    try {
        // Set a timeout for the operation
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore operation timed out')), 5000)
        );

        const fetchPromise = db.collection("users").limit(1).get();

        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);

        console.log("Successfully connected to Firestore!");
        console.log(`Found ${snapshot.size} documents in 'users' (limit 1).`);
        process.exit(0);
    } catch (error) {
        console.error("FAILED to connect to Firestore:", error);
        process.exit(1);
    }
}

testConnection();
