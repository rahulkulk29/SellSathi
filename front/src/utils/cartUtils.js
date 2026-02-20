import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    collection,
    onSnapshot,
    deleteDoc,
    getDocs
} from 'firebase/firestore';

import { db, auth } from '../config/firebase';


// 🟢 ADD TO CART
export const addToCart = async (product) => {
    try {

        const user = auth.currentUser;

        if (!user) {

            const localCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
            const existingItemIndex = localCart.findIndex(item => item.productId === product.id);

            if (existingItemIndex > -1) {
                localCart[existingItemIndex].quantity += 1;
            } else {
                localCart.push({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: 1,
                    category: product.category
                });
            }

            localStorage.setItem('tempCart', JSON.stringify(localCart));
            return { success: true };
        }

        const cartItemRef = doc(db, "users", user.uid, "cart", product.id);
        const cartItemSnap = await getDoc(cartItemRef);

        if (cartItemSnap.exists()) {
            await updateDoc(cartItemRef, {
                quantity: increment(1)
            });
        } else {
            await setDoc(cartItemRef, {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1,
                category: product.category
            });
        }

        return { success: true };

    } catch (error) {

        console.error("Error adding to cart:", error);

        const localCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const existingItemIndex = localCart.findIndex(item => item.productId === product.id);

        if (existingItemIndex > -1) {
            localCart[existingItemIndex].quantity += 1;
        } else {
            localCart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1,
                category: product.category
            });
        }

        localStorage.setItem('tempCart', JSON.stringify(localCart));

        return { success: true };
    }
};



// 🔵 LISTEN TO CART REAL-TIME
export const listenToCart = (callback) => {

    const user = auth.currentUser;

    if (!user) {
        const localCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        callback(localCart);
        return () => { };
    }

    const q = collection(db, "users", user.uid, "cart");

    const unsubscribe = onSnapshot(q, (querySnapshot) => {

        const items = [];

        querySnapshot.forEach((docItem) => {
            items.push({ id: docItem.id, ...docItem.data() });
        });

        callback(items);

    }, (error) => {

        console.error("Error listening to cart:", error);

        const localCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        callback(localCart);
    });

    return unsubscribe;
};



// 🔴 REMOVE FROM CART
export const removeFromCart = async (productId) => {

    const user = auth.currentUser;

    if (!user) {

        const localCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const updatedCart = localCart.filter(item => item.productId !== productId);
        localStorage.setItem('tempCart', JSON.stringify(updatedCart));
        return { success: true };
    }

    try {

        await deleteDoc(doc(db, "users", user.uid, "cart", productId));
        return { success: true };

    } catch (error) {

        console.error("Error removing from cart:", error);
        return { success: false };
    }
};



// 🟡 CLEAR FULL CART (after COD / Razorpay success)
export const clearCart = async () => {

    const user = auth.currentUser;

    if (!user) {
        localStorage.removeItem('tempCart');
        return;
    }

    try {

        const cartCollectionRef = collection(db, "users", user.uid, "cart");

        const snapshot = await getDocs(cartCollectionRef);

        const deletePromises = [];

        snapshot.forEach((docItem) => {
            deletePromises.push(
                deleteDoc(doc(db, "users", user.uid, "cart", docItem.id))
            );
        });

        await Promise.all(deletePromises);

    } catch (error) {

        console.error("Error clearing cart:", error);
    }
};
