/**
 * Email Service Test File
 * Use this to verify your email configuration is working correctly
 * 
 * Run: node test-email.js
 */

require('dotenv').config();
const { sendBookingConfirmationEmail, verifyEmailConfig } = require('./services/mailService');

console.log('🧪 Bus Booking Email Service Test\n');
console.log('━'.repeat(60));

// Step 1: Verify email configuration
console.log('\n📋 Step 1: Verifying Email Configuration...\n');

if (!process.env.EMAIL_USER) {
  console.error('❌ EMAIL_USER not set in .env');
  console.error('   Add to .env: EMAIL_USER=your-email@gmail.com');
  process.exit(1);
}

if (!process.env.EMAIL_PASS) {
  console.error('❌ EMAIL_PASS not set in .env');
  console.error('   Add to .env: EMAIL_PASS=your-app-password');
  console.error('   Get from: https://myaccount.google.com/apppasswords');
  process.exit(1);
}

console.log('✓ EMAIL_USER:', process.env.EMAIL_USER);
console.log('✓ EMAIL_PASS: ' + '*'.repeat(process.env.EMAIL_PASS.length - 4) + process.env.EMAIL_PASS.slice(-4));

// Step 2: Verify SMTP connection
console.log('\n📋 Step 2: Testing SMTP Connection...\n');

verifyEmailConfig()
  .then(async (isValid) => {
    if (!isValid) {
      console.error('\n❌ Email configuration failed. Check your credentials.');
      process.exit(1);
    }

    console.log('✓ SMTP connection successful!\n');

    // Step 3: Send test email
    console.log('━'.repeat(60));
    console.log('\n📋 Step 3: Sending Test Booking Confirmation Email...\n');

    const testBookingData = {
      passengerName: 'Test User',
      passengerEmail: process.env.EMAIL_USER, // Send to yourself
      busName: 'Volvo AC Sleeper',
      busOperator: 'Premium Bus Travels',
      busType: 'AC Sleeper',
      from: 'Delhi',
      to: 'Chandigarh',
      departureDate: '2026-04-15',
      departureTime: '22:00',
      arrivalTime: '06:00',
      seats: ['A1', 'A2', 'A3'],
      totalPrice: 1500,
      bookingId: '507f1f77bcf86cd799439011',
      bookingDate: new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    console.log('Test Data:');
    console.log('  Passenger:', testBookingData.passengerName);
    console.log('  Email:', testBookingData.passengerEmail);
    console.log('  Route:', testBookingData.from, '→', testBookingData.to);
    console.log('  Seats:', testBookingData.seats.join(', '));
    console.log('  Total Price: ₹' + testBookingData.totalPrice);
    console.log('\nSending email...\n');

    const emailSent = await sendBookingConfirmationEmail(testBookingData);

    console.log('\n' + '━'.repeat(60));
    if (emailSent) {
      console.log('\n✅ SUCCESS! Email test completed.\n');
      console.log('✓ Check your inbox for the confirmation email');
      console.log('✓ The email was sent to: ' + testBookingData.passengerEmail);
      console.log('\n✨ Your email service is ready for production!');
    } else {
      console.log('\n⚠️  Email sending failed. Check the error logs above.');
      console.log('   Verify your email credentials and try again.');
    }

    console.log('\n' + '━'.repeat(60));
    console.log('\n📝 Notes:\n');
    console.log('  • The email should arrive within 1-2 seconds');
    console.log('  • Check spam/junk folder if not in inbox');
    console.log('  • Once verified, bookings will auto-send to users');
    console.log('  • Email failures won\'t break the booking process\n');

    process.exit(emailSent ? 0 : 1);
  })
  .catch((err) => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
