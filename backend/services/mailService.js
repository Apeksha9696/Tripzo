/**
 * Mail Service Module
 * Handles all email sending functionality using Nodemailer
 * Configuration: Gmail SMTP with App Password
 */

const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g., apekshat@gmail.com
    pass: process.env.EMAIL_PASS  // Gmail App Password (not regular password)
  }
});

/**
 * Verify transporter connection
 * Run once on server startup to ensure email configuration is correct
 */
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service configured and ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    console.log('Please ensure EMAIL_USER and EMAIL_PASS are set in .env file');
    return false;
  }
};

/**
 * Professional booking confirmation email template
 * @param {Object} bookingData - Contains passenger, bus, and booking details
 * @returns {String} HTML email content
 */
const generateBookingEmailHTML = (bookingData) => {
  const {
    passengerName,
    passengerEmail,
    busName,
    busOperator,
    busType,
    from,
    to,
    departureDate,
    departureTime,
    arrivalTime,
    seats,
    totalPrice,
    bookingId,
    bookingDate
  } = bookingData;

  const seatsDisplay = Array.isArray(seats) ? seats.join(', ') : seats;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .email-header {
            background: linear-gradient(135deg, #0f766e 0%, #166534 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .email-header p {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .email-content {
            padding: 30px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #333;
          }
          .greeting strong {
            color: #0f766e;
          }
          .section {
            margin: 25px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #0f766e;
            border-radius: 6px;
          }
          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #0f766e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #555;
            flex: 1;
          }
          .detail-value {
            font-weight: 500;
            color: #0f766e;
            text-align: right;
            flex: 1;
          }
          .journey-info {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f8f7 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0f766e;
          }
          .journey-route {
            font-size: 18px;
            font-weight: 700;
            color: #0f766e;
            margin-bottom: 10px;
          }
          .route-detail {
            font-size: 14px;
            color: #555;
            margin: 5px 0;
          }
          .seats-box {
            background-color: #0f766e;
            color: white;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            font-weight: 700;
            font-size: 16px;
          }
          .price-box {
            background-color: #166534;
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            font-size: 14px;
          }
          .price-amount {
            font-size: 28px;
            font-weight: 700;
            margin: 10px 0;
          }
          .confirmation-status {
            background-color: #d1e7dd;
            border: 2px solid #198754;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            font-weight: 700;
          }
          .important-note {
            background-color: #fff3cd;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 6px;
            font-size: 14px;
            color: #856404;
          }
          .important-note strong {
            display: block;
            margin-bottom: 5px;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
          }
          .footer-link {
            color: #0f766e;
            text-decoration: none;
            font-weight: 600;
          }
          .booking-id {
            font-family: 'Courier New', monospace;
            background-color: #e0e0e0;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: 700;
            display: inline-block;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="email-header">
            <h1>🎟️ Booking Confirmed!</h1>
            <p>Your bus ticket has been successfully booked</p>
          </div>

          <!-- Main Content -->
          <div class="email-content">
            <!-- Greeting -->
            <div class="greeting">
              Hello <strong>${passengerName}</strong>,
              <br><br>
              Thank you for booking with us! Your ticket confirmation is ready.
            </div>

            <!-- Confirmation Status -->
            <div class="confirmation-status">
              ✓ Booking Status: CONFIRMED
            </div>

            <!-- Journey Details -->
            <div class="section">
              <div class="section-title">🚌 Bus & Journey Details</div>
              <div class="detail-row">
                <span class="detail-label">Bus Operator:</span>
                <span class="detail-value"><strong>${busOperator}</strong></span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Bus Name:</span>
                <span class="detail-value">${busName || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Bus Type:</span>
                <span class="detail-value">${busType}</span>
              </div>
            </div>

            <!-- Route Information -->
            <div class="journey-info">
              <div class="journey-route">
                ${from} ➜ ${to}
              </div>
              <div class="route-detail">📅 Date: <strong>${departureDate}</strong></div>
              <div class="route-detail">⏰ Departure: <strong>${departureTime}</strong></div>
              <div class="route-detail">🎯 Arrival: <strong>${arrivalTime}</strong></div>
            </div>

            <!-- Seat Information -->
            <div class="section">
              <div class="section-title">💺 Booked Seats</div>
              <div class="seats-box">
                ${seatsDisplay}
              </div>
              <div style="text-align: center; font-size: 14px; color: #666; margin-top: 10px;">
                ${seats.length === 1 ? '1 Seat Booked' : `${seats.length} Seats Booked`}
              </div>
            </div>

            <!-- Price Information -->
            <div class="price-box">
              <div style="font-size: 14px;">Total Amount Paid</div>
              <div class="price-amount">₹ ${totalPrice.toLocaleString('en-IN')}</div>
            </div>

            <!-- Booking Reference -->
            <div class="section">
              <div class="section-title">📋 Booking Reference</div>
              <div style="text-align: center; padding: 15px 0;">
                <div style="color: #666; font-size: 14px; margin-bottom: 8px;">Booking ID:</div>
                <div class="booking-id">${bookingId}</div>
                <div style="color: #666; font-size: 12px; margin-top: 10px;">
                  Booked on: ${bookingDate}
                </div>
              </div>
            </div>

            <!-- Important Notes -->
            <div class="important-note">
              <strong>📌 Important - Please Read</strong>
              ✓ Please arrive at the boarding point 15-30 minutes before departure<br>
              ✓ Carry a valid ID proof as per bus operator requirements<br>
              ✓ Keep your booking reference handy for check-in<br>
              ✓ Contact support if you need to reschedule or cancel
            </div>

            <!-- Support Message -->
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                If you have any questions or need to modify your booking,<br>
                please don't hesitate to <a href="mailto:support@bustrack.com" style="color: #0f766e; text-decoration: none; font-weight: 600;">contact our support team</a>.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0;">
              © 2026 Bus Tracking System. All rights reserved.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 11px; color: #999;">
              This is an automated email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Send booking confirmation email
 * @param {Object} bookingData - Booking details including passenger, bus, and seats
 * @returns {Promise<boolean>} - Returns true if email sent successfully
 */
const sendBookingConfirmationEmail = async (bookingData) => {
  try {
    // Validate required fields
    if (!bookingData.passengerEmail) {
      throw new Error('Passenger email is required');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: bookingData.passengerEmail,
      subject: '🎟️ Bus Ticket Confirmation - Your Booking is Confirmed!',
      html: generateBookingEmailHTML(bookingData),
      // Optional: Add plain text version for clients that don't support HTML
      text: `
        Bus Ticket Confirmation
        
        Hello ${bookingData.passengerName},
        
        Your booking has been confirmed!
        
        Journey Details:
        From: ${bookingData.from}
        To: ${bookingData.to}
        Date: ${bookingData.departureDate}
        Departure: ${bookingData.departureTime}
        Arrival: ${bookingData.arrivalTime}
        
        Bus: ${bookingData.busOperator} - ${bookingData.busType}
        Booked Seats: ${Array.isArray(bookingData.seats) ? bookingData.seats.join(', ') : bookingData.seats}
        Total Price: ₹${bookingData.totalPrice}
        Booking ID: ${bookingData.bookingId}
        
        Please arrive 15-30 minutes before departure and carry a valid ID proof.
        
        Thank you for booking with us!
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Booking confirmation email sent:', {
      to: bookingData.passengerEmail,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', {
      error: error.message,
      to: bookingData.passengerEmail,
      timestamp: new Date().toISOString()
    });

    // Don't throw error - booking should succeed even if email fails
    return false;
  }
};

/**
 * Send generic email (reusable for other purposes)
 * @param {Object} mailData - Contains to, subject, html/text content
 * @returns {Promise<boolean>}
 */
const sendEmail = async (mailData) => {
  try {
    const { to, subject, html, text } = mailData;

    if (!to || !subject) {
      throw new Error('Email recipient and subject are required');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: html || undefined,
      text: text || undefined
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', {
      to,
      subject,
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('❌ Error sending email:', {
      error: error.message,
      to: mailData.to,
      timestamp: new Date().toISOString()
    });

    return false;
  }
};

/**
 * Send password reset email
 * @param {String} email - User's email
 * @param {String} resetUrl - The password reset URL
 * @param {String} name - User's name
 * @returns {Promise<boolean>}
 */
const sendPasswordResetEmail = async (email, resetUrl, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #0f766e; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Password Reset Request</h2>
          <p>Hello ${name || 'User'},</p>
          <p>You recently requested to reset your password for your Tripzo account. Click the button below to reset it.</p>
          <a href="${resetUrl}" class="btn" style="color: #ffffff; text-decoration: none;">Reset Your Password</a>
<a href="${resetUrl}" class="btn" style="color: #ffffff; text-decoration: none;">Reset Your Password</a>          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>This password reset link is only valid for the next hour.</p>
          <p>Thanks,<br>The Tripzo Team</p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Tripzo - Password Reset Request',
    html: html
  });
};

// Export functions
module.exports = {
  transporter,
  verifyEmailConfig,
  sendBookingConfirmationEmail,
  sendEmail,
  generateBookingEmailHTML,
  sendPasswordResetEmail
};
