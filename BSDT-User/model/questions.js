const supabase = require('../db');
const User = require('./user');

const getAllQuestion = async (req) => {
  try {
    const result = await supabase.rpc('get_user_visible_questions', { p_user_id: req.jwt.id });
    const { data, error } = result;
    if (error) {
      console.error('Error fetching questions:', error);
      return { error: 'Error fetching questions' };
    }
    return result.status === 200 ? { data } : { error: 'No questions found' };
}
    catch (error) {
        console.error('Error fetching questions:', error);
        return { error: 'Internal server error' };
    }
    };
const getSharedQuestion = async (req) => {
    try {
        const { data, error } = await supabase.rpc('get_shared_question_info', { p_user_id: req.jwt.id });
        if (error) {
            console.error('Error fetching shared questions:', error);
            return { error: 'Error fetching shared questions' };
        }
        return data;
    }
    catch (error) {
        console.error('Error fetching shared questions:', error);
        return { error: 'Internal server error' };
    }
}
const shareQuestion = async (questionId, shared_mail,res) => {
    try {
        // const { questionId } = req.params;
        // const { shared_mail } = req.body;
        // console.log('Sharing question with ID:', questionId, 'to email:', shared_mail);
        
        const { data: userData, error: userError } = await User.findUserByEmail(shared_mail);
        console.log('User data:', userData);
        if (userError) {
            console.error('Error finding user by email:', userError);
            return { error: 'Error finding user by email' };
        }
        
       
        if (!userData || userData.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
    
        const userId = userData[0].user_id;
        console.log('User ID:', userId);


        // check if the question is already shared with the user
        const { data: existingShare, error: existingShareError } = await supabase
            .from('question_shared_with_user')
            .select('*')
            .eq('question_id', questionId)
            .eq('user_id', userId);
            // console.log('Existing share data:', existingShare);
        if (existingShareError) {
            console.error('Error checking existing share:', existingShareError);
            return { error: 'Error checking existing share' };
        }
        if (existingShare && existingShare.length > 0) {
            return res.status(400).json({ error: 'Question already shared with this user' });
        }

        // Insert the shared question
        const { data, error } = await supabase
            .from('question_shared_with_user')
            .insert({ question_id: questionId, user_id: userId })
            .select();
        if (error) {
            console.error('Error sharing question:', error);
            return { error: 'Error sharing question' };
        }
        return { data };
    }
    catch (error) {
        console.error('Error sharing question:', error);
        return { error: 'Internal server error' };
    }
}

const updateQuestion = async (req) => {
    try {
        const { questionId } = req.params;
        const { text, image, correct_ans, question_type, privacy, meta_data } = req.body;
        const {  error } = await supabase
            .from('question')
            .update({ text, image, question_type,correct_ans, privacy, meta_data })
            .eq('question_id', questionId);
        if (error) {
            console.error('Error updating question:', error);
            return { error: 'Error updating question' };
        }
        return {error };
    }
    catch (error) {
        console.error('Error updating question:', error);
        return { error: 'Internal server error' };
    }
}
const deleteQuestion = async (req) => {
    try {
        const { questionId } = req.params;
        const { data, error } = await supabase
            .from('question')
            .delete()
            .eq('question_id', questionId);
        if (error) {
            console.error('Error deleting question:', error);
            return { error: 'Error deleting question' };
        }
        return  {error};
    }
    catch (error) {
        console.error('Error deleting question:', error);
        return { error: 'Internal server error' };
    }
}
// create question
const createQuestion = async (req) => {
    try {
        const { user_id,text,image,type, privacy, meta_data } = req.body;
        const { data, error } = await supabase
            .from('question')
            .insert({ user_id, text, image, type, privacy, meta_data })
            .select();
        if (error) {
            console.error('Error creating question:', error);
            return { error: 'Error creating question' };
        }
        // console.log('Question created successfully:', data);
        return { data };
    }
    catch (error) {
        console.error('Error creating question:', error);
        return { error: 'Internal server error' };
    }
}

module.exports = {
    getAllQuestion, shareQuestion, getSharedQuestion, updateQuestion, deleteQuestion, createQuestion
};

