# Quick Test Guide - Seller Sections & Email Notifications

## 🚀 How to Test Right Now

### Test 1: Verify Three Separate Sections

1. **Login as Admin**
   - Phone: `+917483743936`
   - OTP: `123456`

2. **Navigate to Seller Management**
   - Click "Seller Mgmt" in the sidebar

3. **You Should See Three Sections**:
   - **Section 1**: Pending Approvals (X) - at the top
   - **Section 2**: Seller Management (Y) - in the middle (ONLY approved sellers)
   - **Section 3**: Rejected Applications (Z) - at the bottom (rejected + blocked sellers)

### Test 2: Approve a Seller

1. **Go to Pending Approvals Section** (top section)
   - Should show sellers with Accept/Reject buttons

2. **Click "Accept" on a Pending Seller**
   - Confirm the action

3. **Verify**:
   - ✅ Seller disappears from Pending Approvals
   - ✅ Seller appears in Seller Management section (middle)
   - ✅ Count in "Seller Management (Y)" increases
   - ✅ Check backend console for approval email log

### Test 3: Reject a Seller

1. **Go to Pending Approvals Section**

2. **Click "Reject" on a Pending Seller**
   - Confirm the action

3. **Verify**:
   - ✅ Seller disappears from Pending Approvals
   - ✅ Seller appears in Rejected Applications section (bottom)
   - ✅ Count in "Rejected Applications (Z)" increases
   - ✅ Seller does NOT appear in Seller Management
   - ✅ Check backend console for rejection email log

### Test 4: Block an Approved Seller

1. **Go to Seller Management Section** (middle section)
   - Should show ONLY approved sellers

2. **Click "Review Data" on any Approved Seller**
   - Modal opens

3. **Click "Block Seller" Button**
   - Select duration (e.g., "7 Days")
   - Click "Block Seller" to confirm

4. **Verify**:
   - ✅ Seller disappears from Seller Management section
   - ✅ Seller appears in Rejected Applications section (bottom)
   - ✅ Seller shows "🚫 BLOCKED" badge
   - ✅ Count in "Seller Management (Y)" decreases
   - ✅ Count in "Rejected Applications (Z)" increases
   - ✅ Check backend console for block email log

### Test 5: View Rejected/Blocked Seller Details

1. **Go to Rejected Applications Section** (bottom)

2. **Click "View Details" on any Rejected Seller**
   - Modal opens

3. **Verify**:
   - ✅ Modal shows seller information
   - ✅ Only "Close" button appears (no action buttons)
   - ✅ Modal is read-only

---

## 📧 Email Notification Console Output

### Backend Console (Terminal where you ran `npm run dev`)

When you approve/reject/block a seller, you'll see this in the BACKEND terminal:

#### Approval Email
```
📧 EMAIL NOTIFICATION (Not sent - Email service not configured):
   To: +919876543210
   Subject: ✅ Your Seller Application Has Been Approved!
   Template: [Object object]
```

#### Rejection Email
```
📧 EMAIL NOTIFICATION (Not sent - Email service not configured):
   To: +919876543210
   Subject: ❌ Your Seller Application Status
   Template: [Object object]
```

#### Block Email
```
📧 EMAIL NOTIFICATION (Not sent - Email service not configured):
   To: +919876543210
   Subject: ⚠️ Your Seller Account Has Been Blocked
   Template: [Object object]
```

---

## 🔍 What to Look For

### Section Structure:
- ✅ Three clearly separated sections with borders
- ✅ Each section has its own count in the header
- ✅ Pending Approvals at top
- ✅ Seller Management in middle (ONLY approved)
- ✅ Rejected Applications at bottom (rejected + blocked)

### Seller Movement:
- ✅ Approved sellers move from Pending → Seller Management
- ✅ Rejected sellers move from Pending → Rejected Applications
- ✅ Blocked sellers move from Seller Management → Rejected Applications

### Visual Indicators:
- ✅ "APPROVED" badge in green for approved sellers
- ✅ "REJECTED" badge in red for rejected sellers
- ✅ "🚫 BLOCKED" badge in orange for blocked sellers (additional badge)

### Email Logs:
- ✅ Email logged in BACKEND terminal (not browser console)
- ✅ Correct subject line for each action
- ✅ Recipient phone number shown
- ✅ No errors in console

---

## 🐛 Troubleshooting

### Seller not moving to correct section?
- Refresh the page (F5)
- Check backend terminal for errors
- Verify database update in Firestore console

### Email not logged to console?
- Check BACKEND terminal (where you ran `npm run dev`)
- NOT the browser console
- Look for "📧 EMAIL NOTIFICATION" message

### Blocked seller not showing BLOCKED badge?
- Verify `isBlocked: true` in Firestore
- Refresh the page
- Check that seller is in Rejected Applications section

### Counts not updating?
- Refresh the page
- Check that seller status changed in database
- Verify no JavaScript errors in browser console

---

## 📊 Expected Section Counts

### Example Scenario:
- 5 sellers total
- 2 pending applications
- 2 approved sellers
- 1 rejected/blocked seller

### Section Headers Should Show:
- **Pending Approvals (2)**
- **Seller Management (2)** ← Only approved
- **Rejected Applications (1)** ← Rejected + blocked

### Dashboard Home Should Show:
- **Total Sellers: 5** ← All sellers
- **Pending Approvals: 2** ← Only pending

---

## 📝 Notes

- **Email service is NOT configured** - Emails are only logged, not sent
- To enable actual email sending, see `services/EMAIL_SETUP.md`
- Sellers currently only have phone numbers, not email addresses
- Consider adding email field to seller registration form
- Email logs appear in BACKEND terminal, not browser console

---

**Ready to Test?** Follow the steps above and verify the three-section structure works correctly!
