// src/services/emailService.js
// Service for sending enrollment confirmation emails
import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// Company information
const COMPANY_NAME = process.env.REACT_APP_COMPANY_NAME || 'TuneParams.ai';
const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || 'support@tuneparams.ai';
const WEBSITE_URL = process.env.REACT_APP_WEBSITE_URL || 'https://www.tuneparams.ai';

/**
 * Initialize EmailJS with public key
 */
const initializeEmailJS = () => {
    if (EMAILJS_PUBLIC_KEY) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }
};

/**
 * Generate enrollment confirmation email content
 * @param {Object} enrollmentData - Enrollment details
 * @returns {Object} Email template parameters
 */
const generateEnrollmentEmailContent = (enrollmentData) => {
    const {
        userName,
        userEmail,
        courseTitle,
        amount,
        paymentId,
        orderId,
        enrollmentDate
    } = enrollmentData;

    const firstName = userName ? userName.split(' ')[0] : 'Student';

    const subject = `🎉 Welcome to ${courseTitle}! Your AI learning journey starts now`;

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ${COMPANY_NAME}!</h1>
                <p style="color: #e3f2fd; margin: 10px 0 0 0; font-size: 16px;">Your AI learning journey starts now</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${firstName},</p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6;">
                    Thank you for registering for our AI Training Course — we're excited to have you on board! 🚀
                </p>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="color: #333; margin-top: 0;">📋 Enrollment Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #666; font-weight: bold;">Course:</td>
                            <td style="padding: 8px 0; color: #333;">${courseTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666; font-weight: bold;">Amount Paid:</td>
                            <td style="padding: 8px 0; color: #333;">$${amount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666; font-weight: bold;">Payment ID:</td>
                            <td style="padding: 8px 0; color: #333; font-family: monospace; font-size: 14px;">${paymentId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666; font-weight: bold;">Order ID:</td>
                            <td style="padding: 8px 0; color: #333; font-family: monospace; font-size: 14px;">${orderId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666; font-weight: bold;">Enrollment Date:</td>
                            <td style="padding: 8px 0; color: #333;">${enrollmentDate}</td>
                        </tr>
                    </table>
                </div>

                <h3 style="color: #333; margin-top: 30px;">Here's what you can expect:</h3>
                <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
                    <li><strong>Live lessons</strong> covering machine learning, deep learning, NLP, and large language models (LLMs).</li>
                    <li><strong>Hands-on coding exercises</strong> and assignments to strengthen your skills.</li>
                    <li><strong>Projects and labs</strong> that bring AI concepts to life with real-world applications.</li>
                    <li><strong>A supportive learning community</strong> to ask questions, share progress, and get feedback.</li>
                </ul>

                <h3 style="color: #333; margin-top: 30px;">Next Steps:</h3>
                <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
                    <li>Log in to your account at <a href="${WEBSITE_URL}" style="color: #667eea; text-decoration: none;">${WEBSITE_URL}</a>.</li>
                    <li>Check out the course schedule and upcoming sessions on our website.</li>
                </ul>

                <p style="color: #333; line-height: 1.6; margin-top: 25px;">
                    We're thrilled to have you join our community of learners. If you have any questions, feel free to reply to this email or reach out at 
                    <a href="mailto:${SUPPORT_EMAIL}" style="color: #667eea; text-decoration: none;">${SUPPORT_EMAIL}</a>.
                </p>

                <p style="color: #333; line-height: 1.6; margin-top: 20px;">
                    Let's make your AI journey an exciting and rewarding one! 🌟
                </p>

                <p style="color: #333; margin-top: 30px;">
                    Best,<br>
                    <strong>TuneParams Team</strong>
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
                <p>© 2025 ${COMPANY_NAME}. All rights reserved.</p>
                <p>This email was sent to ${userEmail} regarding your course enrollment.</p>
            </div>
        </div>
    `;

    const textContent = `
Hi ${firstName},

Thank you for registering for our AI Training Course — we're excited to have you on board! 🚀

Here's what you can expect:

• Live lessons covering machine learning, deep learning, NLP, and large language models (LLMs).

• Hands-on coding exercises and assignments to strengthen your skills.

• Projects and labs that bring AI concepts to life with real-world applications.

• A supportive learning community to ask questions, share progress, and get feedback.

Next Steps:

• Log in to your account at ${WEBSITE_URL}.

• Check out the course schedule and upcoming sessions on our website.

We're thrilled to have you join our community of learners. If you have any questions, feel free to reply to this email or reach out at ${SUPPORT_EMAIL}.

Let's make your AI journey an exciting and rewarding one! 🌟

Best,
TuneParams Team

---
ENROLLMENT DETAILS:
- Course: ${courseTitle}
- Amount Paid: $${amount}
- Payment ID: ${paymentId}
- Order ID: ${orderId}
- Enrollment Date: ${enrollmentDate}

This email was sent to ${userEmail} regarding your course enrollment.
© 2025 ${COMPANY_NAME}. All rights reserved.
    `;

    return {
        subject,
        htmlContent,
        textContent,
        recipientEmail: userEmail,
        recipientName: userName || firstName
    };
};

/**
 * Send enrollment confirmation email
 * @param {Object} enrollmentData - Enrollment details
 * @returns {Promise<Object>} Success/error response
 */
export const sendEnrollmentConfirmationEmail = async (enrollmentData) => {
    try {
        // Check if EmailJS is configured
        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
            console.warn('EmailJS not configured. Email will not be sent.');
            return {
                success: false,
                error: 'Email service not configured',
                skipped: true
            };
        }

        // Initialize EmailJS
        initializeEmailJS();

        // Generate email content
        const emailContent = generateEnrollmentEmailContent(enrollmentData);

        // Prepare template parameters for EmailJS
        const templateParams = {
            to_email: emailContent.recipientEmail,
            to_name: emailContent.recipientName,
            from_name: COMPANY_NAME,
            subject: emailContent.subject,
            html_content: emailContent.htmlContent,
            text_content: emailContent.textContent,
            course_title: enrollmentData.courseTitle,
            user_name: enrollmentData.userName,
            amount: enrollmentData.amount,
            payment_id: enrollmentData.paymentId,
            order_id: enrollmentData.orderId,
            enrollment_date: enrollmentData.enrollmentDate,
            website_url: WEBSITE_URL,
            support_email: SUPPORT_EMAIL
        };

        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        console.log('Email sent successfully:', response);

        return {
            success: true,
            messageId: response.text,
            emailContent
        };

    } catch (error) {
        console.error('Error sending enrollment confirmation email:', error);
        return {
            success: false,
            error: error.message || 'Failed to send email'
        };
    }
};

/**
 * Generate receipt data for download
 * @param {Object} enrollmentData - Enrollment details
 * @returns {Object} Receipt data
 */
export const generateReceiptData = (enrollmentData) => {
    const {
        userName,
        userEmail,
        courseTitle,
        amount,
        paymentId,
        orderId,
        enrollmentDate,
        paymentMethod = 'PayPal'
    } = enrollmentData;

    return {
        receiptNumber: `RCP-${orderId}`,
        date: enrollmentDate,
        customer: {
            name: userName,
            email: userEmail
        },
        items: [{
            description: `Course Enrollment: ${courseTitle}`,
            quantity: 1,
            unitPrice: amount,
            total: amount
        }],
        payment: {
            method: paymentMethod,
            transactionId: paymentId,
            orderId: orderId
        },
        totals: {
            subtotal: amount,
            tax: 0,
            total: amount
        },
        company: {
            name: COMPANY_NAME,
            email: SUPPORT_EMAIL,
            website: WEBSITE_URL
        }
    };
};

/**
 * Generate a downloadable receipt PDF content (as HTML)
 * @param {Object} receiptData - Receipt data
 * @returns {string} HTML content for PDF generation
 */
export const generateReceiptHTML = (receiptData) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payment Receipt - ${receiptData.receiptNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .receipt-container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #667eea; margin: 0; }
        .receipt-title { font-size: 18px; margin: 10px 0 0 0; }
        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .receipt-info div { flex: 1; }
        .label { font-weight: bold; color: #666; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .totals { text-align: right; margin-top: 20px; }
        .total-line { margin: 5px 0; }
        .total-final { font-size: 18px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1 class="company-name">${receiptData.company.name}</h1>
            <p class="receipt-title">Payment Receipt</p>
        </div>

        <div class="receipt-info">
            <div>
                <p><span class="label">Receipt Number:</span><br>${receiptData.receiptNumber}</p>
                <p><span class="label">Date:</span><br>${receiptData.date}</p>
            </div>
            <div>
                <p><span class="label">Customer:</span><br>${receiptData.customer.name}<br>${receiptData.customer.email}</p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${receiptData.items.map(item => `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.unitPrice}</td>
                        <td>$${item.total}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-line"><span class="label">Subtotal:</span> $${receiptData.totals.subtotal}</div>
            <div class="total-line"><span class="label">Tax:</span> $${receiptData.totals.tax}</div>
            <div class="total-line total-final"><span class="label">Total:</span> $${receiptData.totals.total}</div>
        </div>

        <div class="receipt-info" style="margin-top: 30px;">
            <div>
                <p><span class="label">Payment Method:</span><br>${receiptData.payment.method}</p>
                <p><span class="label">Transaction ID:</span><br>${receiptData.payment.transactionId}</p>
            </div>
            <div>
                <p><span class="label">Order ID:</span><br>${receiptData.payment.orderId}</p>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for your enrollment!</p>
            <p>For questions or support, contact us at ${receiptData.company.email}</p>
            <p>${receiptData.company.website}</p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Download receipt as HTML file
 * @param {Object} enrollmentData - Enrollment details
 */
export const downloadReceipt = (enrollmentData) => {
    try {
        const receiptData = generateReceiptData(enrollmentData);
        const htmlContent = generateReceiptHTML(receiptData);

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `Receipt-${receiptData.receiptNumber}.html`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Error downloading receipt:', error);
        return { success: false, error: error.message };
    }
};
