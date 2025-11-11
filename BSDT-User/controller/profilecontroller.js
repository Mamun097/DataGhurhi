//controller for user profile page
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');
//get user profile

exports.profile = async (req, res) => {
    //console.log('req',req.jwt.id);
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
    
    const { data, error } = await User.fetchPassword(req.jwt.id);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'User not found' });
    }
    console.log(data);
    const password = data[0].password;
    const isPasswordValid = await bcrypt.compare(oldPassword, password);
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

exports.matchpassword = async (req, res) => {
    const { password } = req.body;
    const { data, error } = await User.fetchPassword(req.jwt.id);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    if (!data.length) {
        return res.status(404).json({ error: 'User not found' });
    }
    const storedPassword =data[0].password;
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid password' });
    }
    return res.status(200).json({ message: 'Password matched successfully' });
} 

exports.fetchSecretQuestionAndAnswer = async (req, res) => {
    const { data, error} = await User.fetchSecretQuestionAndAnswer(req.jwt.id);
     if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    console.log(data[0].secret_question, data[0].secret_answer);
    return res.status(200).json({ secret_question: data[0].secret_question, secret_answer: data[0].secret_answer });
   
};
//update secret question and answer
exports.updateSecretQuestionAndAnswer = async (req, res) => {
    const { secret_question, secret_answer } = req.body;
    const { data, error } = await User.updateSecretQuestionAndAnswer(req.jwt.id, secret_question, secret_answer);
    if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Secret question and answer updated successfully' });
};

