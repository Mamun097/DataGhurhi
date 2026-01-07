// controllers/signinController.js

// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
const supabase = require('../db');
const jwt = require('jsonwebtoken');
const user = require('../model/user');



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
      .eq('user_id', user.user_id); // or .eq('email', email) if preferred

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

const axios = require('axios'); // Make sure to install axios if not already: npm install axios

exports.login = async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
    
    // Validate input data (check for missing fields, etc.)
    if (!email || !password) {
        return res.status(404).json({ error: 'All fields are required' });
    }

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
        return res.status(400).json({ error: 'reCAPTCHA token is required' });
    }

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
            return res.status(400).json({ 
                error: 'reCAPTCHA verification failed. Please try again.' 
            });
        }

    } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError);
        return res.status(500).json({ error: 'reCAPTCHA verification failed' });
    }

    // Check if user exists
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email);
    
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (!data.length) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const user = data[0];
    
    // Check if password is correct
    console.log(user);
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
   
    let token = jwt.sign({ email: user.email, id: user.user_id }, process.env.JWT_SECRET_USER);
    
    return res.status(200).json({ 
        message: 'Login successful', 
        token, 
        user_id: user.user_id, 
        user_type: user.user_type 
    });
}