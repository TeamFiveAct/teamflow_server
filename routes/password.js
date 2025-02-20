// routes/password.js
const express = require('express');
const router = express.Router();
const PasswordController = require('../controllers/Cpassword');
const sendEmailMiddleware = require('../middlewares/emailMiddleware');

// Route for requesting password reset (sends email)
router.post('/request-reset', 
    sendEmailMiddleware,  // This will handle sending the email
    PasswordController.requestReset
);

// Route for displaying password reset form
router.get('/reset-password', PasswordController.renderResetPage);

// Route for processing password reset
router.post('/reset-password', PasswordController.resetPassword);

module.exports = router;
