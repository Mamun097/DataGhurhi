//controller for user profile page
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
//get user profile

exports.profile = async (req, res) => {
    console.log('req',req.jwt.id);
    const { data, error } = await User.findDesignerByid(req.jwt.id);
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
//update profile image
exports.updateProfileImage = async (req, res) => {
   
    const { imageUrl } = req.body;
    // console.log('imageUrl',imageUrl);    
    const { data, error } = await User.updateProfileImage(req.jwt.id, imageUrl);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    return res.status(200).json({ message: 'Profile image updated successfully' });
}

// update user profile
exports.updateProfile = async (req, res) => {
   
    const { data, error } = await User.updateSurveyDesigner(req.jwt.id, req.body);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Profile updated successfully' });
}
//delete user profile
exports.deleteProfile = async (req, res) => {
    const { data, error } = await User.deleteUser(req.jwt.id);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Profile deleted successfully' });
}
//update password

exports.updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { data, error } = await User.findDesignerByid(req.jwt.id);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'User not found' });
    }
    const user = data[0];
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid old password' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data: updateData, error: updateError } = await User.updatePassword(req.jwt.id, hashedPassword);
    if (updateError) {
        console.error(updateError);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Password updated successfully' });
}