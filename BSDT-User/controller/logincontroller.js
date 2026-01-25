// controllers/signinController.js

// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const supabase = require('../db');
const jwt = require('jsonwebtoken');
const user = require('../model/user');
const axios = require('axios');

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }

  try {
    // Find user by email
    const { data: users, error: fetchError } = await supabase
      .from('user')
      .select('*')
      .eq('email', email);

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const { error: updateError } = await supabase
      .from('user')
      .update({ password: hashedPassword })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return res.status(500).json({ error: 'Failed to update password' });
    }

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Unexpected error occurred' });
  }
};

exports.login = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
    
    // Validate input data
    if (!email || !password) {
        return res.status(404).json({ error: 'All fields are required' });
    }

    // Verify reCAPTCHA if token is provided and secret key is configured
    const isRecaptchaConfigured = process.env.RECAPTCHA_SECRET_KEY && 
                                   process.env.RECAPTCHA_SECRET_KEY !== 'undefined' &&
                                   process.env.RECAPTCHA_SECRET_KEY.trim() !== '';
    
    if (recaptchaToken && isRecaptchaConfigured) {
        try {
            const recaptchaResponse = await axios.post(
                'https://www.google.com/recaptcha/api/siteverify',
                null,
                {
                    params: {
                        secret: process.env.RECAPTCHA_SECRET_KEY,
                        response: recaptchaToken
                    }
                }
            );

            // Check if reCAPTCHA verification was successful
            if (!recaptchaResponse.data.success) {
                console.warn('reCAPTCHA verification failed:', recaptchaResponse.data);
                return res.status(400).json({ 
                    error: 'reCAPTCHA verification failed. Please try again.' 
                });
            }
            
            console.log('reCAPTCHA verification successful');

        } catch (recaptchaError) {
            console.error('reCAPTCHA verification error:', recaptchaError.message);
            // Log the error but allow login to proceed
            console.warn('Proceeding with login despite reCAPTCHA error');
        }
    } else {
        // Log when reCAPTCHA is skipped
        if (!isRecaptchaConfigured) {
            console.warn('reCAPTCHA not configured - login proceeding without verification');
        } else if (!recaptchaToken) {
            console.warn('No reCAPTCHA token provided - login proceeding without verification');
        }
    }

    try {
        // Check if user exists
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('email', email);
        
        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        if (!data.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = data[0];
        
        // Check if password is correct
        console.log('Verifying password for user:', user.email);
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Incorrect password' });
        }
       
        // Generate JWT token
        let token = jwt.sign(
            { email: user.email, id: user.user_id }, 
            process.env.JWT_SECRET_USER
        );
        
        return res.status(200).json({ 
            message: 'Login successful', 
            token, 
            user_id: user.user_id, 
            user_type: user.user_type 
        });
        
    } catch (err) {
        console.error('Unhandled login error:', err);
        return res.status(500).json({ error: 'Unexpected error occurred' });
    }
}