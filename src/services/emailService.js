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
        if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {return {
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

        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID, // You might want a separate template for coupons
            emailContent
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
                rawTextContent: generateCouponEmailText(couponEmailData),
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
            emailId: response.text
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
        adminMessage,
        senderName
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
    let courseInfo = '';
    let courseLinks = '';
    let enrollmentUrl = `${WEBSITE_URL}/courses`;

    if (courseTitle && courseId) {
        courseInfo = `This coupon is specifically for: **${courseTitle}**`;
        enrollmentUrl = `${WEBSITE_URL}/courses/${courseId}`;
        courseLinks = `
📚 **Course Information**: ${WEBSITE_URL}/courses/${courseId}
🎯 **Direct Enrollment**: ${enrollmentUrl}
        `;
    } else {
        courseInfo = 'This coupon can be used for any of our courses';
        courseLinks = `
📚 **Browse All Courses**: ${WEBSITE_URL}/courses
🎯 **AI Foundations Course**: ${WEBSITE_URL}/courses/FAAI
🤖 **Reinforcement Learning**: ${WEBSITE_URL}/courses/RLAI
        `;
    }

    // Step-by-step instructions
    const detailedInstructions = courseTitle && courseId ?
        `
**How to Redeem Your Coupon:**

1. 🌐 **Visit the course page**: ${enrollmentUrl}
2. 📝 **Click "Enroll Now"** to start the enrollment process
3. 💳 **At checkout**, look for "Have a coupon code?" section
4. 🎫 **Enter your coupon code**: \`${couponCode}\`
5. ✅ **Click "Apply"** to see your discount applied instantly
6. 💰 **Complete payment** with your discounted price
7. 🎉 **Start learning immediately** after enrollment

**Need Help?**
- 📧 Email us at: ${SUPPORT_EMAIL}
- 🌐 Visit our help center: ${WEBSITE_URL}/support
- 💬 Live chat available on our website
        ` :
        `
**How to Redeem Your Coupon:**

1. 🌐 **Browse our courses**: ${WEBSITE_URL}/courses
2. 📚 **Select any course** that interests you
3. 📝 **Click "Enroll Now"** on your chosen course
4. 💳 **At checkout**, look for "Have a coupon code?" section
5. 🎫 **Enter your coupon code**: \`${couponCode}\`
6. ✅ **Click "Apply"** to see your discount applied instantly
7. 💰 **Complete payment** with your discounted price
8. 🎉 **Start learning immediately** after enrollment

**Need Help?**
- 📧 Email us at: ${SUPPORT_EMAIL}
- 🌐 Visit our help center: ${WEBSITE_URL}/support
- 💬 Live chat available on our website
        `;

    return {
        to_email: recipientEmail,
        to_name: recipientName || 'Student',
        from_name: COMPANY_NAME,
        reply_to: SUPPORT_EMAIL,

        subject: `🎫 Your Exclusive Coupon Code: ${couponCode}`,

        // Email content
        message_title: `🎉 You've Received a Special Discount!`,

        greeting: `Dear ${recipientName || 'Student'},`,

        main_content: `${senderName ? `${senderName} has sent you` : 'You have received'} an exclusive coupon code for ${COMPANY_NAME}! Get ready to advance your AI and machine learning skills at a discounted price.`,

        // Coupon details section
        coupon_section: `
🎫 **Your Coupon Code**: \`${couponCode}\`
🎁 **Discount**: ${discountDisplay}
📝 **Coupon Name**: ${couponName || 'Special Discount'}
⏰ **Validity**: ${expiryText}
💰 **${minOrderText}**
        `,

        course_info: courseInfo,
        course_links: courseLinks,

        // Detailed instructions
        instructions: detailedInstructions,

        // Personal message from admin if provided
        admin_message: adminMessage ? `
**Personal Message:**
"${adminMessage}"
        ` : '',

        // Call to action
        cta_section: `
🚀 **Ready to Start Learning?**

${courseTitle && courseId ?
                `[**Enroll in ${courseTitle} Now →**](${enrollmentUrl})` :
                `[**Browse All Courses →**](${WEBSITE_URL}/courses)`
            }

[**Visit TuneParams.ai →**](${WEBSITE_URL})
        `,

        // Social proof and trust signals
        trust_section: `
**Why Choose TuneParams.ai?**
✅ Expert-led courses by industry professionals
✅ Hands-on projects and real-world applications
✅ Small batch sizes for personalized attention
✅ Comprehensive curriculum from foundations to advanced topics
✅ Career support and networking opportunities
        `,

        // Footer information
        footer_info: `
**Important Information:**
• This coupon code is unique to you - please don't share it
• Discount will be applied automatically at checkout
• For technical issues, contact ${SUPPORT_EMAIL}
• Terms and conditions apply

Follow us for updates:
📱 **Website**: ${WEBSITE_URL}
💼 **LinkedIn**: [TuneParams AI](https://linkedin.com/company/tuneparams-ai)
🐦 **Twitter**: [@TuneParamsAI](https://twitter.com/tuneparamsai)

Thank you for choosing TuneParams.ai for your AI learning journey!

Best regards,
The ${COMPANY_NAME} Team
        `,

        support_email: SUPPORT_EMAIL,
        website_url: WEBSITE_URL,
        company_name: COMPANY_NAME,
        enrollment_url: enrollmentUrl,

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

/**
 * Generate plain text version of coupon email for tracking
 * @param {Object} couponData - Coupon email details
 * @returns {string} Plain text email content
 */
const generateCouponEmailText = (couponData) => {
    const {
        recipientName,
        couponCode,
        couponName,
        discountType,
        discountValue,
        courseTitle,
        courseId,
        validUntil,
        minOrderAmount,
        adminMessage,
        senderName
    } = couponData;

    const discountDisplay = discountType === 'percentage'
        ? `${discountValue}% off`
        : `$${discountValue} off`;

    const expiryText = validUntil
        ? `Valid until ${new Date(validUntil).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`
        : 'No expiry date';

    const enrollmentUrl = courseId ? `${WEBSITE_URL}/courses/${courseId}` : `${WEBSITE_URL}/courses`;

    return `
Your Exclusive Coupon Code: ${couponCode}

Dear ${recipientName || 'Student'},

${senderName ? `${senderName} has sent you` : 'You have received'} an exclusive coupon code for ${COMPANY_NAME}!

COUPON DETAILS:
- Code: ${couponCode}
- Discount: ${discountDisplay}
- Name: ${couponName || 'Special Discount'}
- Validity: ${expiryText}
- ${minOrderAmount ? `Minimum order: $${minOrderAmount}` : 'No minimum order requirement'}

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
};
