# Seller Management Sections Structure

## 📋 Three Separate Sections

### 1. Pending Approvals Section
**Purpose**: New seller applications awaiting admin review

**Shows**:
- Sellers with `sellerStatus: "PENDING"`
- Name, Phone Number, Aadhaar, Address
- Actions: Accept or Reject buttons

**Count**: Number of pending applications

**Email Notifications**:
- ✅ Approval → Sends approval email
- ❌ Rejection → Sends rejection email

---

### 2. Seller Management Section
**Purpose**: Active approved sellers only

**Shows**:
- ONLY sellers with `sellerStatus: "APPROVED"`
- Shop Identity, Category, Contact Info, Status
- Search by shop name
- Filter by category
- Review Data button

**Count**: Number of approved sellers

**Actions**:
- Review Data → Opens modal with Block Seller option

**Email Notifications**:
- ⚠️ Block → Sends block email, moves to Rejected section

---

### 3. Rejected Applications Section
**Purpose**: Rejected and blocked sellers

**Shows**:
- Sellers with `sellerStatus: "REJECTED"`
- Includes both manually rejected AND blocked sellers
- Shop Identity, Category, Contact Info, Status, Rejected Date
- "🚫 BLOCKED" badge for blocked sellers
- Search by shop name

**Count**: Number of rejected/blocked sellers

**Actions**:
- View Details → Opens modal (read-only, shows Close button)

**Email Notifications**:
- All rejected/blocked sellers have already received email notifications

---

## 🔄 Seller Lifecycle Flow

```
NEW SELLER REGISTRATION
         ↓
[PENDING APPROVALS SECTION]
         ↓
    Admin Decision
         ↓
    ┌────┴────┐
    ↓         ↓
APPROVE    REJECT
    ↓         ↓
[SELLER    [REJECTED
MGMT]      SECTION]
    ↓         ↑
  BLOCK ──────┘
```

### Detailed Flow:

1. **New Seller Applies**
   - Status: `PENDING`
   - Appears in: Pending Approvals Section
   - Admin sees: Accept/Reject buttons

2. **Admin Approves**
   - Status: `APPROVED`
   - Moves to: Seller Management Section
   - Email: ✅ Approval notification sent
   - Admin sees: Block Seller button in modal

3. **Admin Rejects (from Pending)**
   - Status: `REJECTED`
   - Moves to: Rejected Applications Section
   - Email: ❌ Rejection notification sent
   - Admin sees: View Details (read-only)

4. **Admin Blocks (from Approved)**
   - Status: `REJECTED` + `isBlocked: true`
   - Moves to: Rejected Applications Section
   - Email: ⚠️ Block notification sent
   - Badge: "🚫 BLOCKED" shown
   - Admin sees: View Details (read-only)

---

## 📊 Section Counts

### Dashboard Home Stats:
- **Total Sellers**: Count of ALL sellers (approved + pending + rejected)
- **Pending Approvals**: Count of PENDING sellers only

### Section Headers:
- **Pending Approvals (X)**: X = number of pending sellers
- **Seller Management (Y)**: Y = number of APPROVED sellers only
- **Rejected Applications (Z)**: Z = number of REJECTED sellers (includes blocked)

---

## 🎯 Key Rules

### Seller Management Section:
✅ Shows ONLY approved sellers
❌ Does NOT show rejected sellers
❌ Does NOT show blocked sellers
❌ Does NOT show pending sellers

### Rejected Applications Section:
✅ Shows rejected sellers
✅ Shows blocked sellers (with BLOCKED badge)
❌ Does NOT show approved sellers
❌ Does NOT show pending sellers

### Email Notifications:
✅ Sent when: Approve, Reject, Block
✅ Logged to console (until email service configured)
✅ Beautiful HTML templates for each action
✅ Includes seller shop name and action details

---

## 🔍 Search & Filter Features

### Pending Approvals:
- Search by shop name or email/phone

### Seller Management:
- Search by shop name
- Filter by category dropdown
- Clear button to reset filters

### Rejected Applications:
- Search by shop name or email/phone
- Shows both rejected and blocked sellers

---

## 💡 Visual Indicators

### Status Badges:
- **PENDING**: Yellow/Orange badge
- **APPROVED**: Green badge
- **REJECTED**: Red badge
- **BLOCKED**: Orange "🚫 BLOCKED" badge (additional to REJECTED)

### Modal Actions:
- **PENDING seller**: Approve + Reject buttons
- **APPROVED seller**: Block Seller button
- **REJECTED seller**: Close button only (read-only)

---

## 📧 Email Notification Details

### When Sent:
1. **Approve**: When admin clicks "Accept" in Pending Approvals
2. **Reject**: When admin clicks "Reject" in Pending Approvals
3. **Block**: When admin clicks "Block Seller" for approved seller

### Email Content:
- **Approval**: Congratulations, next steps, login instructions
- **Rejection**: Polite message, option to reapply, contact info
- **Block**: Block duration, reason, contact support info

### Current Status:
- ✅ Email system implemented
- 📝 Emails logged to console
- ⚠️ Actual sending requires email service configuration
- 📖 See `services/EMAIL_SETUP.md` for setup instructions

---

## 🧪 Testing Checklist

### Test Pending Approvals:
- [ ] New seller appears in Pending Approvals
- [ ] Count shows correct number
- [ ] Accept button moves seller to Seller Management
- [ ] Reject button moves seller to Rejected Applications
- [ ] Email logged to console for both actions

### Test Seller Management:
- [ ] Only approved sellers shown
- [ ] Count shows only approved sellers
- [ ] Search by name works
- [ ] Category filter works
- [ ] Block button appears in modal
- [ ] Blocked seller moves to Rejected Applications

### Test Rejected Applications:
- [ ] Rejected sellers appear here
- [ ] Blocked sellers appear here with BLOCKED badge
- [ ] Count includes both rejected and blocked
- [ ] Search works
- [ ] Modal shows Close button only (read-only)

### Test Email Notifications:
- [ ] Approval email logged to console
- [ ] Rejection email logged to console
- [ ] Block email logged to console
- [ ] Email includes correct shop name
- [ ] Email includes correct action details

---

**Last Updated**: February 19, 2026
**Version**: 3.0
**Status**: Production Ready
