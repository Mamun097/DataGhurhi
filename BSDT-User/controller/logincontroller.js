// controllers/signinController.js

const bcrypt = require('bcrypt');
const supabase = require('../db');
const jwt = require('jsonwebtoken');
const user = require('../model/user');





exports.login = async (req, res) => {
    const { email, password } = req.body;
    // Validate input data (check for missing fields, etc.)
    if (!email || !password) {
        return res.status(404).json({ error: 'All fields are required' });
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
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Incorrect password' });
    }
   let token = jwt.sign({ email: user.email, id: user.user_id }, process.env.JWT_SECRET_USER);
    return res.status(200).json({ message: 'Login successful', token });
}
    