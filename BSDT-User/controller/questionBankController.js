const e = require('express');
const Question= require('../model/questions');

// Get all questions from question bank

module.exports.getAllQuestion = async (req, res) => {
    try{
        const { data, error } = await Question.getAllQuestion(req);
        if (error) {
            return res.status(500).json({ error: 'Error fetching questions' });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        console.error('Error fetching questions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Get all shared questions
module.exports.getSharedQuestion = async (req, res) => {
    try{
        const { data, error } = await Question.getSharedQuestion(req);
        if (error) {
            return res.status(500).json({ error: 'Error fetching shared questions' });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        console.error('Error fetching shared questions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Share question with other users
module.exports.shareQuestion = async (req, res) => {
    try{
        console.log(req.body);
        console.log(req.params);

        const { questionId } = req.params;
        const { shared_mail } = req.body;
        console.log('Sharing question with ID:', questionId, 'to email:', shared_mail);
        const { data, error } = await Question.shareQuestion(questionId, shared_mail,res);
        if (error) {
          if (error.code === '404') {
            return res.status(404).json({ error: 'User not found' });
          }
          else if (error.code === '400') {
            return res.status(400).json({ error: 'Question already shared with this user' });
          }
            return res.status(500).json({ error: 'Error sharing question' });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        console.error('questionError sharing :', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Update question
module.exports.updateQuestion = async (req, res) => {
    try{
        const { data, error } = await Question.updateQuestion(req);
        if (error) {
            return res.status(500).json({ error: 'Error updating question' });
        }
        return res.status(200).json("Question updated successfully");
    }
    catch (error) {
        console.error('Error updating question:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// Delete question
module.exports.deleteQuestion = async (req, res) => {
    try{
        const { data, error } = await Question.deleteQuestion(req);
        if (error) {
            return res.status(500).json({ error: 'Error deleting question' });
        }
        return res.status(200).json("Question deleted successfully");
    }
    catch (error) {
        console.error('Error deleting question:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//create question
module.exports.createQuestion = async (req, res) => {
    try{
        const { data, error } = await Question.createQuestion(req);
        // console.log("create question",data);
        if (error) {
            return res.status(500).json({ error: 'Error creating question' });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        console.error('Error creating question:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

