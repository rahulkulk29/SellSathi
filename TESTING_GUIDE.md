# Sellsathi E-Commerce Platform - Complete Testing Guide

## 🎯 Testing Overview

This guide provides step-by-step instructions to test all features of the Sellsathi platform.

## 🚀 Prerequisites

1. **Start the Application**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

2. **Test Credentials**
   - Admin: +917483743936 (OTP: 123456)
   - Consumer: +919876543210 (OTP: 123456)
   - Seller: +917676879059 (OTP: 123456)

---

## 📱 CONSUMER FLOW TESTING

### Test 1: User Registration & Login
**Steps:**
1. Open http://localhost:5173
2. Click "User" icon in navbar
3. Enter phone: 9876543210
4. Click "Send OTP"
5. Enter OTP: 123456
6. Click "Verify & Login"

**Expected Result:**
- ✅ User logged in successfully
- ✅ Profile dropdown shows phone number
- ✅ "Dashboard" button visible in navbar
- ✅ User role shows "CONSUMER"

---

### Test 2: Browse Products
**Steps:**
1. On homepage, view product grid
2. Use category filter (select "Electronics")
3. Adjust price slider to ₹50,000
4. Sort by "Price: Low to High"
5. Use search bar to search "laptop"

**Expected Result:**
- ✅ Products filtered by category
- ✅ Products within price range
- ✅ Products sorted correctly
- ✅ Search results show relevant products
- ✅ Product cards show image, name, price, rating

---

### Test 3: Product Details
**Steps:**
1. Click on any product card
2. View product images (click thumbnails)
3. Select size (S, M, L, XL, XXL)
4. Enter pincode: 560001
5. Click "Check" delivery
6. Click "Add to Cart"
7. Click "Add to Wishlist" (heart icon)

**Expected Result:**
- ✅ Product details page loads
- ✅ Image gallery works
- ✅ Size selection highlights
- ✅ Delivery check shows availability
- ✅ "Added to cart" message
- ✅ "Added to wishlist" message
- ✅ Related products shown at bottom

---

### Test 4: Cart & Checkout
**Steps:**
1. Click cart icon in navbar
2. View cart items
3. Remove one item (trash icon)
4. Click "Continue to Checkout"
5. Fill shipping address:
   - First Name: John
   - Last Name: Doe
   - Address: 123 Main Street
   - City: Bangalore
   - Pincode: 560001
6. Check "Save address for future"
7. Click "Continue to Payment"
8. Select "Cash on Delivery"
9. Click "Place Order"

**Expected Result:**
- ✅ Cart shows all items
- ✅ Item removed successfully
- ✅ Checkout page loads
- ✅ Address form validates (6-digit pincode)
- ✅ Payment methods shown
- ✅ Order placed successfully
- ✅ Order confirmation with Order ID
- ✅ "Track Order" button visible

---

### Test 5: Consumer Dashboard
**Steps:**
1. Click "Dashboard" in navbar
2. View dashboard overview
3. Click "My Orders" tab
4. Click on an order
5. View order timeline
6. Click "Track Detailed"
7. Click "Download Invoice" icon
8. Go back to dashboard
9. Click "Wishlist" tab
10. Click "X" to remove item from wishlist
11. Click "View Product" on wishlist item

**Expected Result:**
- ✅ Dashboard loads with stats
- ✅ Orders tab shows all orders
- ✅ Order details panel shows status
- ✅ Timeline shows order progress
- ✅ Tracking page opens
- ✅ Invoice downloads (PDF)
- ✅ Wishlist shows saved items
- ✅ Item removed from wishlist
- ✅ Product detail page opens

---

### Test 6: Notifications
**Steps:**
1. In dashboard, click bell icon (top right)
2. View notifications panel
3. Click on a notification
4. Click "Mark all as read"
5. Close notification panel

**Expected Result:**
- ✅ Notification panel slides in from right
- ✅ Shows order notifications
- ✅ Shows welcome message
- ✅ Notifications clickable
- ✅ Panel closes smoothly

---

### Test 7: Profile & Settings
**Steps:**
1. In dashboard, click "Settings" tab
2. Click "Update Profile"
3. Change name to "John Smith"
4. Change email to "john@example.com"
5. Click "Save Changes"
6. Click "Manage Address"
7. Edit address details
8. Click "Update Address"
9. Click "Sign Out"

**Expected Result:**
- ✅ Settings page loads
- ✅ Profile modal opens
- ✅ Profile updated successfully
- ✅ Address modal opens
- ✅ Address updated successfully
- ✅ User logged out
- ✅ Redirected to homepage

---

## 🏪 SELLER FLOW TESTING

### Test 8: Seller Registration
**Steps:**
1. Logout if logged in
2. Click "Become a Seller" in footer
3. Login with phone: 7676879059 (OTP: 123456)
4. Fill seller details:
   - Shop Name: Tech Store
   - Category: Electronics
   - Address: 456 Market Road, Mumbai
   - GST: 27AABCU9603R1ZM (optional)
5. Click "Submit Application"

**Expected Result:**
- ✅ Seller registration modal opens
- ✅ Phone verification works
- ✅ Seller form validates
- ✅ Application submitted
- ✅ "Pending approval" message shown

---

### Test 9: Admin Approval (Switch to Admin)
**Steps:**
1. Logout
2. Login as admin: +917483743936 (OTP: 123456)
3. Navigate to /admin
4. Click "Sellers" tab
5. Find pending seller
6. Click "Approve"

**Expected Result:**
- ✅ Admin dashboard loads
- ✅ Sellers list shows all sellers
- ✅ Pending seller visible
- ✅ Seller approved successfully
- ✅ Status changes to "APPROVED"

---

### Test 10: Seller Dashboard
**Steps:**
1. Logout from admin
2. Login as seller: +917676879059
3. Navigate to /seller/dashboard
4. View dashboard stats
5. Click "Products" tab
6. Click "Add Product" button
7. Fill product details:
   - Title: Gaming Laptop
   - Price: 75000
   - Category: Electronics
   - Stock: 10
   - Description: High-performance gaming laptop
   - Image URL: (use any image URL)
8. Click "Add Product"
9. View products list
10. Click delete icon on a product

**Expected Result:**
- ✅ Seller dashboard loads
- ✅ Stats show sales, products, orders
- ✅ Products tab shows seller's products
- ✅ Add product modal opens
- ✅ Product added successfully
- ✅ Product appears in list
- ✅ Product deleted successfully

---

### Test 11: Seller Orders
**Steps:**
1. In seller dashboard, click "Orders" tab
2. View orders containing seller's products
3. Check order details
4. View customer information

**Expected Result:**
- ✅ Orders tab shows relevant orders
- ✅ Order details visible
- ✅ Customer info displayed
- ✅ Order status shown

---

## 👨‍💼 ADMIN FLOW TESTING

### Test 12: Admin Dashboard
**Steps:**
1. Login as admin: +917483743936
2. Navigate to /admin
3. View dashboard stats
4. Click "Sellers" tab
5. Search for a seller
6. Click "Suspend" on a seller
7. Click "Activate" to reactivate
8. Click "Reject" on pending seller

**Expected Result:**
- ✅ Admin dashboard loads
- ✅ Stats show totals (sellers, products, orders)
- ✅ Sellers list loads
- ✅ Search filters sellers
- ✅ Seller suspended successfully
- ✅ Seller activated successfully
- ✅ Seller rejected successfully

---

### Test 13: Admin Product Management
**Steps:**
1. In admin dashboard, click "Products" tab
2. View all products
3. Check product details
4. Note seller information

**Expected Result:**
- ✅ Products tab shows all products
- ✅ Product details visible
- ✅ Seller name shown
- ✅ Product status displayed

---

### Test 14: Admin Order Management
**Steps:**
1. In admin dashboard, click "Orders" tab
2. View all orders
3. Click on an order
4. View order details
5. Check customer information

**Expected Result:**
- ✅ Orders tab shows all orders
- ✅ Order list loads
- ✅ Order details modal opens
- ✅ Customer info visible
- ✅ Order items shown

---

## 🔄 NAVIGATION FLOW TESTING

### Test 15: Navigation Continuity
**Steps:**
1. Start at homepage (/)
2. Click product → Product detail page
3. Click "Back" button → Returns to products
4. Click "Add to Cart" → Cart icon updates
5. Click cart icon → Checkout page
6. Click "Continue Shopping" → Returns to products
7. Click "Dashboard" → Consumer dashboard
8. Click "Sellsathi" logo → Returns to homepage
9. Click "Track Order" in footer → Tracking page
10. Use browser back button → Previous page

**Expected Result:**
- ✅ All navigation links work
- ✅ Back button works correctly
- ✅ Forward navigation works
- ✅ Logo returns to homepage
- ✅ Footer links work
- ✅ Browser back/forward works
- ✅ No broken links
- ✅ Smooth transitions

---

## 📱 RESPONSIVE DESIGN TESTING

### Test 16: Mobile View
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. Test all pages:
   - Homepage
   - Product listing
   - Product detail
   - Cart
   - Checkout
   - Dashboard
5. Test hamburger menu
6. Test touch interactions

**Expected Result:**
- ✅ All pages responsive
- ✅ Mobile menu works
- ✅ Touch targets adequate
- ✅ Text readable
- ✅ Images scale properly
- ✅ Forms usable on mobile

---

### Test 17: Tablet View
**Steps:**
1. Select "iPad Pro"
2. Test landscape and portrait
3. Verify layout adapts
4. Test all interactive elements

**Expected Result:**
- ✅ Tablet layout optimized
- ✅ Both orientations work
- ✅ Sidebar navigation works
- ✅ Grid layouts adapt

---

## 🎨 UI/UX TESTING

### Test 18: Visual Consistency
**Steps:**
1. Check color scheme consistency
2. Verify font sizes and weights
3. Check button styles
4. Verify spacing and padding
5. Check border radius consistency
6. Verify shadow effects

**Expected Result:**
- ✅ Consistent primary color (blue)
- ✅ Uniform typography
- ✅ Consistent button styles
- ✅ Proper spacing throughout
- ✅ Rounded corners consistent
- ✅ Shadows enhance depth

---

### Test 19: Loading States
**Steps:**
1. Refresh dashboard (observe loading spinner)
2. Add to cart (observe button state)
3. Place order (observe loading)
4. Load product list (observe skeleton)

**Expected Result:**
- ✅ Loading spinners shown
- ✅ Button states change
- ✅ Skeleton screens shown
- ✅ No blank pages
- ✅ Smooth transitions

---

### Test 20: Error Handling
**Steps:**
1. Try checkout without address
2. Try invalid pincode (5 digits)
3. Try empty search
4. Try accessing admin without permission
5. Try adding product without login

**Expected Result:**
- ✅ Validation errors shown
- ✅ Error messages clear
- ✅ Red color for errors
- ✅ Access denied messages
- ✅ Login prompts shown

---

## 🔍 EDGE CASES TESTING

### Test 21: Empty States
**Steps:**
1. New user → Empty wishlist
2. New user → No orders
3. New seller → No products
4. Search with no results
5. Filter with no matches

**Expected Result:**
- ✅ Helpful empty state messages
- ✅ Call-to-action buttons
- ✅ Illustrations/icons shown
- ✅ No broken layouts

---

### Test 22: Long Content
**Steps:**
1. Product with very long name
2. Address with long text
3. Many items in cart (10+)
4. Many orders in dashboard (20+)

**Expected Result:**
- ✅ Text truncates properly
- ✅ Ellipsis (...) shown
- ✅ Scrolling works
- ✅ Pagination if needed
- ✅ No layout breaks

---

### Test 23: Network Issues
**Steps:**
1. Stop backend server
2. Try to load dashboard
3. Try to place order
4. Restart backend
5. Retry operations

**Expected Result:**
- ✅ Error messages shown
- ✅ "Try again" buttons
- ✅ No crashes
- ✅ Graceful degradation
- ✅ Recovery after reconnect

---

## ✅ FINAL CHECKLIST

### Functionality
- [ ] All pages load correctly
- [ ] All buttons work
- [ ] All forms validate
- [ ] All links work
- [ ] All images load
- [ ] All icons display

### User Experience
- [ ] Navigation is intuitive
- [ ] Feedback is immediate
- [ ] Errors are clear
- [ ] Loading states shown
- [ ] Success messages shown
- [ ] Animations smooth

### Performance
- [ ] Pages load < 3 seconds
- [ ] No lag on interactions
- [ ] Images optimized
- [ ] No memory leaks
- [ ] Smooth scrolling

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Color contrast adequate
- [ ] Screen reader friendly

### Security
- [ ] Phone OTP works
- [ ] Role-based access enforced
- [ ] Admin restricted
- [ ] Input sanitized
- [ ] CORS configured

### Mobile
- [ ] Responsive on all devices
- [ ] Touch targets adequate
- [ ] Text readable
- [ ] Forms usable
- [ ] Performance good

---

## 🐛 Bug Reporting Template

If you find any issues, report them using this format:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: What should happen

**Actual Result**: What actually happened

**Screenshots**: [Attach if applicable]

**Environment**:
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080

**Severity**: Critical / High / Medium / Low
```

---

## 📊 Test Results Summary

After completing all tests, fill this summary:

```
Total Tests: 23
Passed: __
Failed: __
Skipped: __

Pass Rate: __%

Critical Issues: __
High Priority: __
Medium Priority: __
Low Priority: __

Overall Status: ✅ PASS / ❌ FAIL
```

---

## 🎉 Conclusion

This comprehensive testing guide covers:
- ✅ All user roles (Consumer, Seller, Admin)
- ✅ All major features
- ✅ Navigation flows
- ✅ Responsive design
- ✅ UI/UX elements
- ✅ Edge cases
- ✅ Error handling

Complete all tests to ensure the platform is production-ready!

---

**Last Updated**: February 19, 2026
**Version**: 1.0.0
