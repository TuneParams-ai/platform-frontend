// src/services/emailService.js
// Service for sending enrollment confirmation emails
import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// Company information
const COMPANY_NAME = process.env.REACT_APP_COMPANY_NAME || 'TuneParams AI Learning Platform';
const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || 'contact@tuneparams.com';
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
        enrollmentDate,
        paymentMethod,
        payerName,
        payerEmail,
        transactionStatus,
        // paymentSource, // Contains detailed payment source info but not used in basic email
        fundingSource
    } = enrollmentData;

    // Safely extract first name - handle various data types
    let firstName = 'Student';
    if (userName) {
        if (typeof userName === 'string') {
            firstName = userName.split(' ')[0];
        } else if (typeof userName === 'object' && userName.given_name) {
            // PayPal sometimes returns name as object
            firstName = userName.given_name;
        } else if (typeof userName === 'object' && userName.firstName) {
            firstName = userName.firstName;
        }
    }

    const subject = `Welcome to ${courseTitle} Your AI learning journey starts now`;

    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000;">
            <div style="background: linear-gradient(135deg, #1D7E99 0%, #C3C7CA 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to ${COMPANY_NAME}!</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your AI learning journey starts now</p>
            </div>

            <div style="background: #000000; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid rgba(29, 126, 153, 0.2);">
                <p style="font-size: 16px; color: #ffffff; margin-bottom: 20px;">Hi ${firstName},</p>

                <p style="font-size: 16px; color: #ffffff; line-height: 1.6;">
                    Thank you for registering for our AI Training Course — we're excited to have you on board! 🚀
                </p>

                <div style="background: rgba(29, 126, 153, 0.1); padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid rgba(29, 126, 153, 0.2);">
                    <h3 style="color: #ffffff; margin-top: 0;">📋 Enrollment Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Course:</td>
                            <td style="padding: 8px 0; color: #ffffff;">${courseTitle}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Amount Paid:</td>
                            <td style="padding: 8px 0; color: #ffffff;">$${amount}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Payment Method:</td>
                            <td style="padding: 8px 0; color: #ffffff;">${paymentMethod || 'PayPal'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Transaction Status:</td>
                            <td style="padding: 8px 0; color: #ffffff; text-transform: capitalize;">${transactionStatus || 'Completed'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Payment ID:</td>
                            <td style="padding: 8px 0; color: #ffffff; font-family: monospace; font-size: 14px;">${paymentId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Order ID:</td>
                            <td style="padding: 8px 0; color: #ffffff; font-family: monospace; font-size: 14px;">${orderId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Enrollment Date:</td>
                            <td style="padding: 8px 0; color: #ffffff;">${enrollmentDate}</td>
                        </tr>
                        ${payerName && payerName !== userName ? `
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Payer Name:</td>
                            <td style="padding: 8px 0; color: #ffffff;">${payerName}</td>
                        </tr>
                        ` : ''}
                        ${payerEmail && payerEmail !== userEmail ? `
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Payment Email:</td>
                            <td style="padding: 8px 0; color: #ffffff;">${payerEmail}</td>
                        </tr>
                        ` : ''}
                        ${fundingSource ? `
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold;">Funding Source:</td>
                            <td style="padding: 8px 0; color: #ffffff; text-transform: capitalize;">${fundingSource}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>

                <h3 style="color: #ffffff; margin-top: 30px;">Here's what you can expect:</h3>
                <ul style="color: #ffffff; line-height: 1.8; padding-left: 20px;">
                    <li><strong>Live lessons</strong> covering machine learning, deep learning, NLP, and large language models (LLMs).</li>
                    <li><strong>Hands-on coding exercises</strong> and assignments to strengthen your skills.</li>
                    <li><strong>Projects and labs</strong> that bring AI concepts to life with real-world applications.</li>
                    <li><strong>A supportive learning community</strong> to ask questions, share progress, and get feedback.</li>
                </ul>

                <h3 style="color: #ffffff; margin-top: 30px;">Next Steps:</h3>
                <ul style="color: #ffffff; line-height: 1.8; padding-left: 20px;">
                    <li>Log in to your account at <a href="${WEBSITE_URL}" style="color: #1D7E99; text-decoration: none;">${WEBSITE_URL}</a>.</li>
                    <li>Check out the course schedule and upcoming sessions on our website.</li>
                </ul>

                <p style="color: #ffffff; line-height: 1.6; margin-top: 25px;">
                    We're thrilled to have you join our community of learners. If you have any questions, feel free to reply to this email or reach out at
                    <a href="mailto:${SUPPORT_EMAIL}" style="color: #1D7E99; text-decoration: none;">${SUPPORT_EMAIL}</a>.
                </p>

                <p style="color: #ffffff; line-height: 1.6; margin-top: 20px;">
                    Let's make your AI journey an exciting and rewarding one!
                </p>

                <p style="color: #ffffff; margin-top: 30px;">
                    Best,<br>
                    <strong>TuneParams Team</strong>
                </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #C3C7CA; font-size: 14px; background-color: #000000;">
                <p>© 2025 ${COMPANY_NAME}. All rights reserved.</p>
                <p>This email was sent to ${userEmail} regarding your course enrollment.</p>
            </div>
        </div>
    `;

    const textContent = `
Hi ${firstName},

Thank you for registering for our AI Training Course — we're excited to have you on board! 🚀

ENROLLMENT DETAILS:
- Course: ${courseTitle}
- Amount Paid: $${amount}
- Payment Method: ${paymentMethod || 'PayPal'}
- Transaction Status: ${transactionStatus || 'Completed'}
- Payment ID: ${paymentId}
- Order ID: ${orderId}
- Enrollment Date: ${enrollmentDate}
${payerName && payerName !== userName ? `- Payer Name: ${payerName}` : ''}
${payerEmail && payerEmail !== userEmail ? `- Payment Email: ${payerEmail}` : ''}
${fundingSource ? `- Funding Source: ${fundingSource}` : ''}

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
            from_name: `${COMPANY_NAME} Team`,
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
            support_email: SUPPORT_EMAIL,
            // Additional payment details
            payment_method: enrollmentData.paymentMethod || 'PayPal',
            payer_name: enrollmentData.payerName || '',
            payer_email: enrollmentData.payerEmail || '',
            transaction_status: enrollmentData.transactionStatus || 'Completed',
            funding_source: enrollmentData.fundingSource || ''
        };

        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams
        );

        return {
            success: true,
            messageId: response.text,
            emailContent,
            rawTextContent: emailContent.textContent
        };

    } catch (error) {

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
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #ffffff; background-color: #000000; }
        .receipt-container { max-width: 600px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #1D7E99; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #1D7E99; margin: 0; }
        .receipt-title { font-size: 18px; margin: 10px 0 0 0; color: #ffffff; }
        .receipt-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .receipt-info div { flex: 1; }
        .label { font-weight: bold; color: #C3C7CA; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(29, 126, 153, 0.3); }
        .items-table th { background-color: rgba(29, 126, 153, 0.1); font-weight: bold; color: #ffffff; }
        .items-table td { color: #ffffff; }
        .totals { text-align: right; margin-top: 20px; }
        .total-line { margin: 5px 0; color: #ffffff; }
        .total-final { font-size: 18px; font-weight: bold; color: #1D7E99; border-top: 2px solid #1D7E99; padding-top: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(29, 126, 153, 0.3); text-align: center; color: #C3C7CA; font-size: 14px; }
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

        return { success: false, error: error.message };
    }
};

/**
 * Sends a coupon code via email
 * @param {Object} couponEmailData - Coupon email details
 * @param {string} userId - User ID for tracking (optional)
 * @returns {Promise<Object>} Email sending result
 */
export const sendCouponEmail = async (couponEmailData, userId = null) => {
    // Import email tracking service
    const { recordEmailSent } = await import('./emailTrackingService');

    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {

        // Still record the attempt for tracking
        try {
            await recordEmailSent({
                userId: userId,
                recipientEmail: couponEmailData.recipientEmail,
                recipientName: couponEmailData.recipientName,
                emailType: 'coupon_notification',
                subject: `🎫 Your Exclusive Coupon Code: ${couponEmailData.couponCode}`,
                courseId: couponEmailData.courseId || null,
                courseTitle: couponEmailData.courseTitle || null,
                success: false,
                error: 'Email service not configured',
                metadata: {
                    couponCode: couponEmailData.couponCode,
                    couponName: couponEmailData.couponName,
                    discountType: couponEmailData.discountType,
                    discountValue: couponEmailData.discountValue
                }
            });
        } catch (trackingError) {

        }

        return {
            success: false,
            skipped: true,
            message: 'Email service not configured'
        };
    }

    try {
        // Initialize EmailJS
        initializeEmailJS();

        const emailContent = generateCouponEmailContent(couponEmailData);

        // Prepare template parameters for EmailJS (similar to enrollment email format)
        const templateParams = {
            to_email: emailContent.to_email,
            to_name: emailContent.to_name,
            from_name: emailContent.from_name,
            subject: emailContent.subject,
            html_content: emailContent.html_content,
            text_content: emailContent.text_content,
            coupon_code: emailContent.coupon_code,
            coupon_name: emailContent.coupon_name,
            discount_type: emailContent.discount_type,
            discount_value: emailContent.discount_value,
            website_url: WEBSITE_URL,
            support_email: SUPPORT_EMAIL,
            course_id: emailContent.course_id || '',
            course_title: couponEmailData.courseTitle || '',
            recipient_name: emailContent.to_name,
            sender_name: couponEmailData.senderName || '',
            admin_message: couponEmailData.adminMessage || ''
        };

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID, // You might want a separate template for coupons
            templateParams
        );

        // Record successful email sending
        try {
            await recordEmailSent({
                userId: userId,
                recipientEmail: couponEmailData.recipientEmail,
                recipientName: couponEmailData.recipientName,
                emailType: 'coupon_notification',
                subject: emailContent.subject,
                courseId: couponEmailData.courseId || null,
                courseTitle: couponEmailData.courseTitle || null,
                emailServiceResponse: response,
                success: true,
                rawTextContent: emailContent.text_content,
                metadata: {
                    couponCode: couponEmailData.couponCode,
                    couponName: couponEmailData.couponName,
                    discountType: couponEmailData.discountType,
                    discountValue: couponEmailData.discountValue,
                    validUntil: couponEmailData.validUntil,
                    minOrderAmount: couponEmailData.minOrderAmount,
                    senderName: couponEmailData.senderName
                }
            });
        } catch (trackingError) {

        }

        return {
            success: true,
            response: response,
            emailId: response.text,
            emailContent: emailContent,
            rawTextContent: emailContent.text_content
        };

    } catch (error) {

        // Record failed email attempt
        try {
            await recordEmailSent({
                userId: userId,
                recipientEmail: couponEmailData.recipientEmail,
                recipientName: couponEmailData.recipientName,
                emailType: 'coupon_notification',
                subject: `🎫 Your Exclusive Coupon Code: ${couponEmailData.couponCode}`,
                courseId: couponEmailData.courseId || null,
                courseTitle: couponEmailData.courseTitle || null,
                success: false,
                error: error.message || 'Failed to send coupon email',
                metadata: {
                    couponCode: couponEmailData.couponCode,
                    couponName: couponEmailData.couponName,
                    discountType: couponEmailData.discountType,
                    discountValue: couponEmailData.discountValue
                }
            });
        } catch (trackingError) {

        }

        return {
            success: false,
            error: error.message || 'Failed to send coupon email'
        };
    }
};

/**
 * Generate coupon email content
 * @param {Object} couponData - Coupon email details
 * @returns {Object} Email template parameters
 */
const generateCouponEmailContent = (couponData) => {
    const {
        recipientName,
        recipientEmail,
        couponCode,
        couponName,
        discountType,
        discountValue,
        courseTitle,
        courseId,
        validUntil,
        minOrderAmount,
        adminMessage
    } = couponData;

    // Format discount display
    const discountDisplay = discountType === 'percentage'
        ? `${discountValue}% off`
        : `$${discountValue} off`;

    // Format expiry date
    const expiryText = validUntil
        ? `Valid until ${new Date(validUntil).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`
        : 'No expiry date';

    // Format minimum order requirement
    const minOrderText = minOrderAmount
        ? `Minimum order amount: $${minOrderAmount}`
        : 'No minimum order requirement';

    // Course-specific message and links
    let enrollmentUrl = `${WEBSITE_URL}/courses`;
    let courseSpecificMessage = '';

    if (courseTitle && courseId) {
        enrollmentUrl = `${WEBSITE_URL}/courses/${courseId}`;
        courseSpecificMessage = `
            <div style="background: rgba(29, 126, 153, 0.15); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1D7E99;">
                <h4 style="color: #1D7E99; margin: 0 0 8px 0; font-size: 16px;">Course Specific Coupon</h4>
                <p style="color: #ffffff; margin: 0; font-size: 14px;">This coupon is exclusively for <strong>${courseTitle}</strong></p>
            </div>
        `;
    } else {
        courseSpecificMessage = `
            <div style="background: rgba(29, 126, 153, 0.15); padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1D7E99;">
                <h4 style="color: #1D7E99; margin: 0 0 8px 0; font-size: 16px;">General Coupon</h4>
                <p style="color: #ffffff; margin: 0; font-size: 14px;">This coupon can be used for any of our AI & Machine Learning courses</p>
            </div>
        `;
    }

    // Create beautiful HTML email content matching enrollment email style
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000000;">
            <div style="background: linear-gradient(135deg, #1D7E99 0%, #C3C7CA 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Your Exclusive Coupon</h1>
                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Special discount for ${COMPANY_NAME} courses</p>
            </div>

            <div style="background: #000000; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid rgba(29, 126, 153, 0.2);">
                <p style="font-size: 16px; color: #ffffff; margin-bottom: 20px;">Dear ${recipientName || 'Student'},</p>

                <p style="font-size: 16px; color: #ffffff; line-height: 1.6;">
                    Here is your exclusive coupon code for ${COMPANY_NAME}! Get ready to advance your AI and machine learning skills at a special discounted price.
                </p>

                ${courseSpecificMessage}

                <div style="background: rgba(29, 126, 153, 0.1); padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid rgba(29, 126, 153, 0.2); text-align: center;">
                    <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 20px;">Your Coupon Details</h3>
                    
                    <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 6px; margin: 15px 0; border: 2px dashed #1D7E99;">
                        <div style="font-family: monospace; font-size: 24px; font-weight: bold; color: #1D7E99; letter-spacing: 2px; text-align: center;">
                            ${couponCode}
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold; text-align: left;">Coupon Name:</td>
                            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${couponName || 'Special Discount'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold; text-align: left;">Discount:</td>
                            <td style="padding: 8px 0; color: #00ff88; font-weight: bold; text-align: right; font-size: 18px;">${discountDisplay}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold; text-align: left;">Valid Until:</td>
                            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${expiryText}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #C3C7CA; font-weight: bold; text-align: left;">Minimum Order:</td>
                            <td style="padding: 8px 0; color: #ffffff; text-align: right;">${minOrderText}</td>
                        </tr>
                    </table>
                </div>

                ${adminMessage ? `
                <div style="background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #FFD700;">
                    <h4 style="color: #FFD700; margin: 0 0 10px 0; font-size: 16px;">Personal Message</h4>
                    <p style="color: #ffffff; margin: 0; font-style: italic; line-height: 1.5;">"${adminMessage}"</p>
                </div>
                ` : ''}

                <h3 style="color: #ffffff; margin-top: 30px;">How to Redeem Your Coupon:</h3>
                <ol style="color: #ffffff; line-height: 1.8; padding-left: 20px;">
                    <li>Visit ${courseTitle && courseId ? 'the course page' : 'our courses'}: <a href="${enrollmentUrl}" style="color: #1D7E99; text-decoration: none;">${enrollmentUrl}</a></li>
                    <li>Click <strong>"Enroll Now"</strong> ${courseTitle && courseId ? '' : 'on your chosen course'}</li>
                    <li>At checkout, look for <strong>"Have a coupon code?"</strong> section</li>
                    <li>Enter your coupon code: <strong>${couponCode}</strong></li>
                    <li>Click <strong>"Apply"</strong> to see your discount applied instantly</li>
                    <li>Complete payment with your discounted price</li>
                    <li>Start learning immediately after enrollment!</li>
                </ol>

                <h3 style="color: #ffffff; margin-top: 30px;">Why Choose TuneParams.ai?</h3>
                <ul style="color: #ffffff; line-height: 1.8; padding-left: 20px;">
                    <li><strong>Expert-led courses</strong> by industry professionals</li>
                    <li><strong>Hands-on projects</strong> and real-world applications</li>
                    <li><strong>Small batch sizes</strong> for personalized attention</li>
                    <li><strong>Comprehensive curriculum</strong> from foundations to advanced topics</li>
                    <li><strong>Career support</strong> and networking opportunities</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${enrollmentUrl}" style="display: inline-block; background: linear-gradient(135deg, #1D7E99 0%, #C3C7CA 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        ${courseTitle && courseId ? `Enroll in ${courseTitle} Now →` : 'Browse All Courses →'}
                    </a>
                </div>

                <p style="color: #ffffff; line-height: 1.6; margin-top: 25px;">
                    If you have any questions or need help redeeming your coupon, feel free to reach out to us at
                    <a href="mailto:${SUPPORT_EMAIL}" style="color: #1D7E99; text-decoration: none;">${SUPPORT_EMAIL}</a>.
                </p>

                <p style="color: #ffffff; line-height: 1.6; margin-top: 20px;">
                    We're excited to have you join our community of AI learners!
                </p>

                <p style="color: #ffffff; margin-top: 30px;">
                    Best regards,<br>
                    <strong>The ${COMPANY_NAME} Team</strong>
                </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #C3C7CA; font-size: 14px; background-color: #000000;">
                <p style="margin: 0 0 10px 0;">
                    <strong>Important:</strong> This coupon code is unique to you - please don't share it
                </p>
                <p style="margin: 0 0 15px 0;">© 2025 ${COMPANY_NAME}. All rights reserved.</p>
                <p style="margin: 0; font-size: 12px;">
                    Follow us: 
                    <a href="${WEBSITE_URL}" style="color: #1D7E99; text-decoration: none;">Website</a> | 
                    <a href="https://linkedin.com/company/tuneparams-ai" style="color: #1D7E99; text-decoration: none;">LinkedIn</a> | 
                    <a href="https://twitter.com/tuneparamsai" style="color: #1D7E99; text-decoration: none;">Twitter</a>
                </p>
            </div>
        </div>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
Your Exclusive Coupon Code: ${couponCode}

Dear ${recipientName || 'Student'},

Here is your exclusive coupon code for ${COMPANY_NAME}!

COUPON DETAILS:
- Code: ${couponCode}
- Discount: ${discountDisplay}
- Name: ${couponName || 'Special Discount'}
- Validity: ${expiryText}
- ${minOrderText}

${courseTitle ? `This coupon is for: ${courseTitle}` : 'This coupon can be used for any course'}

HOW TO REDEEM:
1. Visit: ${enrollmentUrl}
2. Select your course and click "Enroll Now"
3. At checkout, enter coupon code: ${couponCode}
4. Click "Apply" to see your discount
5. Complete payment and start learning!

${adminMessage ? `Personal Message: "${adminMessage}"` : ''}

Need help? Email us at ${SUPPORT_EMAIL}

Best regards,
The ${COMPANY_NAME} Team
${WEBSITE_URL}
    `;

    // Create dynamic subject line based on discount and course
    let subjectLine;
    if (courseTitle && courseId) {
        // Course-specific coupon
        if (discountType === 'percentage' && discountValue === 100) {
            subjectLine = `Free Access: ${courseTitle} - Use Code ${couponCode}`;
        } else if (discountType === 'percentage') {
            subjectLine = `${discountValue}% Off ${courseTitle} - Code ${couponCode}`;
        } else {
            subjectLine = `$${discountValue} Off ${courseTitle} - Code ${couponCode}`;
        }
    } else {
        // General coupon
        if (discountType === 'percentage' && discountValue === 100) {
            subjectLine = `Free Course Access - Your Code: ${couponCode}`;
        } else if (discountType === 'percentage') {
            subjectLine = `${discountValue}% Off TuneParams.ai Courses - Code ${couponCode}`;
        } else {
            subjectLine = `$${discountValue} Off AI Courses - Code ${couponCode}`;
        }
    }

    return {
        to_email: recipientEmail,
        to_name: recipientName || 'Student',
        from_name: COMPANY_NAME,
        reply_to: SUPPORT_EMAIL,
        subject: subjectLine,
        html_content: htmlContent,
        text_content: textContent,

        // Additional metadata for tracking
        email_type: 'coupon_notification',
        coupon_code: couponCode,
        coupon_name: couponName,
        discount_type: discountType,
        discount_value: discountValue,
        course_id: courseId,
        timestamp: new Date().toISOString()
    };
};


