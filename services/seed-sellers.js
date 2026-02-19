const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Sample seller data
const sampleSellers = [
    {
        uid: 'test_seller_001',
        phone: '+919876543210',
        shopName: 'Fashion Hub',
        category: 'Clothing',
        address: '123 MG Road, Bangalore, Karnataka 560001',
        sellerStatus: 'APPROVED',
        appliedAt: admin.firestore.Timestamp.fromDate(new Date('2025-12-01')),
        approvedAt: admin.firestore.Timestamp.fromDate(new Date('2025-12-02')),
        aadhaarNumber: '123456789012',
        age: '28',
        extractedName: 'Rahul Sharma'
    },
    {
        uid: 'test_seller_002',
        phone: '+919876543211',
        shopName: 'Electro World',
        category: 'Electronics',
        address: '456 Commercial Street, Mumbai, Maharashtra 400001',
        sellerStatus: 'PENDING',
        appliedAt: admin.firestore.Timestamp.fromDate(new Date('2026-01-15')),
        aadhaarNumber: '234567890123',
        age: '35',
        extractedName: 'Priya Patel'
    },
    {
        uid: 'test_seller_003',
        phone: '+919876543212',
        shopName: 'Home Decor Store',
        category: 'Home Decor',
        address: '789 Park Avenue, Delhi, 110001',
        sellerStatus: 'APPROVED',
        appliedAt: admin.firestore.Timestamp.fromDate(new Date('2025-11-20')),
        approvedAt: admin.firestore.Timestamp.fromDate(new Date('2025-11-22')),
        aadhaarNumber: '345678901234',
        age: '42',
        extractedName: 'Amit Kumar'
    },
    {
        uid: 'test_seller_004',
        phone: '+919876543213',
        shopName: 'Sports Central',
        category: 'Sports',
        address: '321 Stadium Road, Chennai, Tamil Nadu 600001',
        sellerStatus: 'REJECTED',
        appliedAt: admin.firestore.Timestamp.fromDate(new Date('2026-01-10')),
        rejectedAt: admin.firestore.Timestamp.fromDate(new Date('2026-01-12')),
        aadhaarNumber: '456789012345',
        age: '30',
        extractedName: 'Sneha Reddy'
    },
    {
        uid: 'test_seller_005',
        phone: '+919876543214',
        shopName: 'Book Paradise',
        category: 'Books',
        address: '654 Library Lane, Kolkata, West Bengal 700001',
        sellerStatus: 'PENDING',
        appliedAt: admin.firestore.Timestamp.fromDate(new Date('2026-02-01')),
        aadhaarNumber: '567890123456',
        age: '26',
        extractedName: 'Vikram Singh'
    }
];

async function seedSellers() {
    try {
        console.log('🌱 Starting to seed seller data...');
        
        const batch = db.batch();
        
        for (const seller of sampleSellers) {
            // Add to sellers collection
            const sellerRef = db.collection('sellers').doc(seller.uid);
            batch.set(sellerRef, seller);
            
            // Add corresponding user document
            const userRef = db.collection('users').doc(seller.uid);
            batch.set(userRef, {
                uid: seller.uid,
                phone: seller.phone,
                role: seller.sellerStatus === 'APPROVED' ? 'SELLER' : 'CONSUMER',
                name: seller.extractedName,
                shopName: seller.shopName,
                isSeller: seller.sellerStatus === 'APPROVED',
                isActive: seller.sellerStatus === 'APPROVED',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
        
        await batch.commit();
        
        console.log(`✅ Successfully seeded ${sampleSellers.length} sellers!`);
        console.log('📊 Summary:');
        console.log(`   - Approved: ${sampleSellers.filter(s => s.sellerStatus === 'APPROVED').length}`);
        console.log(`   - Pending: ${sampleSellers.filter(s => s.sellerStatus === 'PENDING').length}`);
        console.log(`   - Rejected: ${sampleSellers.filter(s => s.sellerStatus === 'REJECTED').length}`);
        
    } catch (error) {
        console.error('❌ Error seeding sellers:', error);
    } finally {
        process.exit();
    }
}

// Run the seeding function
seedSellers();
