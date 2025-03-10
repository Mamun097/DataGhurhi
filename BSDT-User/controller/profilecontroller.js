//controller for user profile page
const User = require('../model/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
//get user profile

exports.profile = async (req, res) => {
    console.log('req',req.jwt.id);
    const { data, error } = await User.findUserById(req.jwt.id);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'User not found' });
    }
    const user = data[0];
    return res.status(200).json({ user });
  
}
