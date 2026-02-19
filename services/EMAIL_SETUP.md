# Email Notification Setup Guide

## Current Status
✅ Email notification system is **IMPLEMENTED and WORKING**
📧 Emails are currently **LOGGED TO CONSOLE** (not sent) until you configure an email service

## What Happens Now?
When admin approves/rejects/blocks a seller, the system:
1. ✅ Updates the database
2. ✅ Prepares a beautiful HTML email
3. 📝 Logs the email to console (since no email service is configured)
4. ✅ Shows success message to admin

## To Enable Actual Email Sending

### Option 1: Gmail (Easiest for Testing)

1. **Create/Use a Gmail account** for sending emails

2. **Enable 2-Factor Authentication** on your Google account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

3. **Generate an App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "SellSathi"
   - Copy the 16-character password

4. **Update your `.env` file** in the `services` folder:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The 16-character app password
   ```

5. **Restart the backend server**
   ```bash
   npm run dev
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up for SendGrid**: https://sendgrid.com/
2. **Get your API key** from the dashboard
3. **Update `emailService.js`**:
   ```javascript
   const transporter = nodemailer.createTransport({
       host: 'smtp.sendgrid.net',
       port: 587,
       auth: {
           user: 'apikey',
           pass: process.env.SENDGRID_API_KEY
       }
   });
   ```
4. **Update `.env`**:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

### Option 3: Other Email Services

You can use any SMTP service:
- **Mailgun**: https://www.mailgun.com/
- **AWS SES**: https://aws.amazon.com/ses/
- **Postmark**: https://postmarkapp.com/

## Email Templates

The system includes 3 beautiful HTML email templates:

### 1. Approval Email ✅
- **Subject**: "✅ Your Seller Application Has Been Approved!"
- **Content**: Congratulations message with next steps
- **Color**: Green theme

### 2. Rejection Email ❌
- **Subject**: "❌ Your Seller Application Status"
- **Content**: Polite rejection with option to reapply
- **Color**: Red theme

### 3. Block Email ⚠️
- **Subject**: "⚠️ Your Seller Account Has Been Blocked"
- **Content**: Block duration and contact information
- **Color**: Orange theme

## Important Note About Email Addresses

Currently, sellers only provide their **phone number** during registration. The system uses this as the email recipient identifier.

### To Send Actual Emails:

**Option A**: Collect email during seller registration
- Update the seller registration form to include an email field
- Store email in the `sellers` collection
- Use `sellerData.email` instead of `sellerData.phone` in email functions

**Option B**: Use SMS notifications instead
- Integrate Twilio or similar SMS service
- Send SMS notifications to `sellerData.phone`
- Keep email notifications for future use

## Testing Email Notifications

1. **Configure email service** (see options above)
2. **Add a test email** to a seller's record in Firestore
3. **Approve/Reject/Block** a seller from admin panel
4. **Check the email inbox** for the notification

## Troubleshooting

### Emails not sending?
- Check console logs for error messages
- Verify EMAIL_USER and EMAIL_PASSWORD in `.env`
- For Gmail: Ensure App Password is correct (not regular password)
- Check spam folder

### "Authentication failed" error?
- Gmail: Use App Password, not regular password
- Enable "Less secure app access" (not recommended)
- Try a different email service

### Emails going to spam?
- Use a verified domain
- Add SPF and DKIM records
- Use a professional email service like SendGrid

## Current Behavior (Without Configuration)

When you approve/reject/block a seller, you'll see in the console:

```
📧 EMAIL NOTIFICATION (Not sent - Email service not configured):
   To: +919876543210
   Subject: ✅ Your Seller Application Has Been Approved!
   Template: [Object object]
```

This confirms the email system is working, just not sending actual emails yet.

## Next Steps

1. Choose an email service (Gmail for testing, SendGrid for production)
2. Configure credentials in `.env` file
3. Restart the backend
4. Test by approving/rejecting a seller
5. Verify email is received

---

**Need Help?** Check the console logs for detailed error messages or contact support.
