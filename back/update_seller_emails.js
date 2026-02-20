// Script to add/update seller email addresses in Firestore
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Add your seller UIDs and their email addresses here
const sellersToUpdate = [
    {
        uid: 'SELLER_UID_HERE',  // Replace with actual seller UID
        email: 'seller@example.com'  // Replace with actual seller email
    },
    // Add more sellers as needed
];

async function updateSellerEmails() {
    console.log('Starting to update seller emails...');

    for (const seller of sellersToUpdate) {
        try {
            await db.collection('users').doc(seller.uid).set({
                email: seller.email
            }, { merge: true });

            console.log(`✅ Updated email for seller ${seller.uid}: ${seller.email}`);
        } catch (error) {
            console.error(`❌ Failed to update seller ${seller.uid}:`, error);
        }
    }

    console.log('Done!');
    process.exit(0);
}

updateSellerEmails();
