# Table Structure Comparison - All Three Sections

## 📊 Consistent Table Structure

All three sections now have the same column structure for consistency:

### Column Headers (Same for All Sections):
1. Shop Identity
2. Category
3. Contact Info
4. Status
5. Verification
6. Actions

---

## 1️⃣ Pending Approvals Section

### Columns:
```
| Shop Identity | Category | Contact Info | Status  | Verification | Actions |
|---------------|----------|--------------|---------|--------------|---------|
| Shop Name     | Tech     | +91...       | PENDING | [View]       | [✓][✗] |
| UID: xxx      |          | UID: xxx     |         |              |         |
```

### Actions Column:
- **Accept Button** (✓) - Approves seller → Moves to Seller Management
- **Reject Button** (✗) - Rejects seller → Moves to Rejected Applications

### Status Column:
- Shows "PENDING" badge in yellow/orange

---

## 2️⃣ Seller Management Section (Approved Only)

### Columns:
```
| Shop Identity | Category | Contact Info | Status   | Verification  | Actions  |
|---------------|----------|--------------|----------|---------------|----------|
| Shop Name     | Tech     | +91...       | APPROVED | [Review Data] | Approved |
| UID: xxx      |          | UID: xxx     |          |               |          |
```

### Actions Column:
- Shows **"Approved"** text (no button)

### Verification Column:
- **Review Data Button** - Opens modal with "Block Seller" option

### Status Column:
- Shows "APPROVED" badge in green

---

## 3️⃣ Rejected Applications Section

### Columns:
```
| Shop Identity | Category | Contact Info | Status    | Verification  | Actions  |
|---------------|----------|--------------|-----------|---------------|----------|
| Shop Name     | Tech     | +91...       | REJECTED  | [Review Data] | Rejected |
| UID: xxx      |          | UID: xxx     | 🚫BLOCKED |               |          |
```

### Actions Column:
- Shows **"Rejected"** - if manually rejected from Pending Approvals
- Shows **"Blocked"** - if blocked from Seller Management

### Verification Column:
- **Review Data Button** - Opens modal (read-only, Close button only)

### Status Column:
- Shows "REJECTED" badge in red
- Shows "🚫 BLOCKED" badge in orange (if blocked)

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ SECTION 1: PENDING APPROVALS                                │
├─────────────────────────────────────────────────────────────┤
│ Shop | Category | Contact | PENDING | [View] | [✓] [✗]     │
└─────────────────────────────────────────────────────────────┘
                    ↓                    ↓
              [Accept]              [Reject]
                    ↓                    ↓
┌─────────────────────────────────────────────────────────────┐
│ SECTION 2: SELLER MANAGEMENT (APPROVED)                     │
├─────────────────────────────────────────────────────────────┤
│ Shop | Category | Contact | APPROVED | [Review Data] | Approved │
└─────────────────────────────────────────────────────────────┘
                    ↓
               [Block]
                    ↓
                    ↓ ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ┐
                    ↓                                           │
┌─────────────────────────────────────────────────────────────┤
│ SECTION 3: REJECTED APPLICATIONS                            │
├─────────────────────────────────────────────────────────────┤
│ Shop | Category | Contact | REJECTED | [Review Data] | Rejected │
│      |          |         | 🚫BLOCKED|               | Blocked  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Actions Column Logic

### Pending Approvals:
```javascript
Actions: [Accept Button] [Reject Button]
```

### Seller Management:
```javascript
Actions: "Approved" (text only)
```

### Rejected Applications:
```javascript
Actions: seller.isBlocked ? "Blocked" : "Rejected"
```

---

## 🎨 Visual Examples

### Example 1: Manually Rejected Seller
```
┌──────────────────────────────────────────────────────────────┐
│ REJECTED APPLICATIONS                                        │
├──────────────────────────────────────────────────────────────┤
│ BadShop | Food | +91... | [REJECTED] | [Review Data] | Rejected │
└──────────────────────────────────────────────────────────────┘
```

### Example 2: Blocked Seller
```
┌──────────────────────────────────────────────────────────────┐
│ REJECTED APPLICATIONS                                        │
├──────────────────────────────────────────────────────────────┤
│ BlockShop | Tech | +91... | [REJECTED]  | [Review Data] | Blocked │
│           |      |        | [🚫BLOCKED] |               |         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔍 Key Differences Between Sections

### Pending Approvals:
- Status: PENDING (yellow)
- Verification: View button
- Actions: Accept + Reject buttons

### Seller Management:
- Status: APPROVED (green)
- Verification: Review Data button (opens modal with Block option)
- Actions: "Approved" text

### Rejected Applications:
- Status: REJECTED (red) + BLOCKED badge if blocked (orange)
- Verification: Review Data button (opens read-only modal)
- Actions: "Rejected" or "Blocked" text

---

## 📧 Email Notifications

### When Actions Column Shows "Rejected":
- Seller was manually rejected from Pending Approvals
- Email sent: ❌ Rejection notification

### When Actions Column Shows "Blocked":
- Seller was blocked from Seller Management
- Email sent: ⚠️ Block notification with duration

---

## 🧪 Testing Checklist

### Test Rejected Applications Table:
- [ ] Same columns as Seller Management
- [ ] Actions shows "Rejected" for manually rejected sellers
- [ ] Actions shows "Blocked" for blocked sellers
- [ ] Status shows REJECTED badge
- [ ] Status shows BLOCKED badge for blocked sellers
- [ ] Verification has Review Data button
- [ ] Modal opens in read-only mode (Close button only)

### Test Seller Flow:
- [ ] Reject from Pending → Actions shows "Rejected"
- [ ] Block from Seller Management → Actions shows "Blocked"
- [ ] Both appear in Rejected Applications section
- [ ] Email notifications sent for both actions

---

## 📊 Summary Table

| Section | Status Badge | Verification Button | Actions Column |
|---------|-------------|---------------------|----------------|
| Pending Approvals | PENDING (yellow) | View | [Accept] [Reject] |
| Seller Management | APPROVED (green) | Review Data | "Approved" |
| Rejected Applications | REJECTED (red) + BLOCKED (orange) | Review Data | "Rejected" or "Blocked" |

---

**Date**: February 19, 2026
**Version**: 3.2
**Status**: ✅ Complete - All sections have consistent structure
