// src/utils/configUtils.js
// Utility functions for configuration management

/**
 * Check if the coupon system is enabled
 * @returns {boolean} true if coupons are enabled, false otherwise
 */
export const areCouponsEnabled = () => {
    return process.env.REACT_APP_ENABLE_COUPONS === 'true';
};

/**
 * Check if PayPal is properly configured
 * @returns {boolean} true if PayPal client ID is configured
 */
export const isPayPalConfigured = () => {
    return Boolean(process.env.REACT_APP_PAYPAL_CLIENT_ID);
};

/**
 * Get PayPal environment (sandbox or live)
 * @returns {string} PayPal environment mode
 */
export const getPayPalEnvironment = () => {
    return process.env.REACT_APP_PAYPAL_ENVIRONMENT || 'sandbox';
};

/**
 * Check if EmailJS is configured
 * @returns {boolean} true if EmailJS is properly configured
 */
export const isEmailJSConfigured = () => {
    return Boolean(
        process.env.REACT_APP_EMAILJS_SERVICE_ID &&
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID &&
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
    );
};

/**
 * Get application configuration object
 * @returns {object} Configuration object with feature flags
 */
export const getAppConfig = () => {
    return {
        features: {
            coupons: areCouponsEnabled(),
            paypal: isPayPalConfigured(),
            emailjs: isEmailJSConfigured()
        },
        paypal: {
            environment: getPayPalEnvironment(),
            clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID
        },
        company: {
            name: process.env.REACT_APP_COMPANY_NAME || 'TuneParams.ai',
            email: process.env.REACT_APP_COMPANY_EMAIL || 'contact@tuneparams.com',
            phone: process.env.REACT_APP_COMPANY_PHONE || '+1-555-0123',
            website: process.env.REACT_APP_WEBSITE_URL || 'https://www.tuneparams.ai'
        }
    };
};
