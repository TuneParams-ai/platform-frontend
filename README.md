# platform-frontend

# TuneParams.ai Educational Platform Frontend

This is the frontend application for TuneParams.ai educational platform, built with React and designed with a modern dark theme.

## Features

### 🎓 Course Management
- Browse available AI/ML courses
- Course details with curriculum information
- Real-time seat availability tracking
- Course reviews and ratings

### 💳 Payment & Enrollment
- PayPal integration for secure payments
- Automatic course enrollment after payment
- **Email confirmation system** with enrollment receipts
- Downloadable payment receipts (HTML format)
- **Coupon system** with configurable discount codes (optional)

### 🎟️ Coupon System (Optional)
- **Flexible discount codes** with percentage or fixed amount discounts
- **Usage limitations** per coupon and per user
- **Course-specific or general coupons** for targeted promotions
- **Admin management interface** for creating and managing coupons
- **Environment toggle** to enable/disable coupon functionality
- **100% off coupons** for free course access without payment processing

### 📧 Email Notifications
The platform includes a comprehensive email notification system for enrollment confirmations:

- **Automated enrollment emails** sent after successful payment
- **Professional email templates** with company branding
- **Detailed payment receipts** included in emails
- **Course welcome information** and next steps
- **Fallback handling** if email service is unavailable
- **Complete email tracking** stored in Firestore for admin oversight

### 📊 Email Tracking & Analytics
- **Admin email dashboard** with comprehensive analytics
- **Email delivery tracking** with success/failure rates
- **Search and filter emails** by recipient, course, or type
- **Email statistics** including course performance metrics
- **Audit trail** for all emails sent through the platform

### 🔐 User Authentication
- Firebase Authentication integration
- Role-based access control (Admin/Student)
- Protected routes and course access

### 👤 User Dashboard
- Personal course enrollment tracking
- Progress monitoring
- Payment history

### 🛡️ Admin Features
- Enrollment management
- Payment tracking
- **Email tracking and analytics dashboard**
- User role management
- Review moderation

## Email Service Setup

The platform uses EmailJS for sending enrollment confirmation emails. See [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed setup instructions.

### Quick Setup:
1. Create an account at [EmailJS.com](https://www.emailjs.com/)
2. Configure your email service (Gmail recommended)
3. Create an email template using the provided configuration
4. Add your EmailJS credentials to `.env` file
5. Test the functionality on `/paypal-test` page

### Environment Variables for Email:
```bash
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
REACT_APP_SUPPORT_EMAIL=contact@tuneparams.com
REACT_APP_WEBSITE_URL=https://www.tuneparams.ai
```

### Environment Variables for Coupons:
```bash
# Enable or disable the coupon system
# Set to 'true' to enable coupons, 'false' to disable
# When disabled, coupon input will not appear in checkout
REACT_APP_ENABLE_COUPONS=true
```

**Note:** When `REACT_APP_ENABLE_COUPONS=false`, the coupon input will be completely hidden from the checkout process, and the admin coupon manager will show a warning banner indicating that the system is disabled.

## Deployment

This app is configured for GitHub Pages deployment with support for client-side routing.

### `npm run deploy`

Builds and deploys the app to GitHub Pages.\
The app is configured to work with custom domain: www.tuneparams.ai

**Note:** The app includes special configuration for GitHub Pages SPA routing:
- `public/404.html` - Handles page reloads on non-root routes
- `public/index.html` - Includes SPA routing script
- Custom domain configuration via `CNAME` file

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
