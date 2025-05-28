const supabase = require('../db');
const { jwtAuthMiddleware } = require("../auth/authmiddleware");


exports.fetchSurveyUser = async (req, res) =>{
    try{
        const {slug} = req.params;
        const user_id = req.jwt.id;
        const user_email = req.jwt.email;
        
        //verify if the user really exists
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('*')
            .eq('user_id', user_id).eq('email', user_email)
            .single();
        if (userError) {
            console.error('Error fetching user:', userError);
            return res.status(500).json({ error: 'Failed to fetch user' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        //fetch the survey
        const { data: survey, error: surveyError } = await supabase
            .from('survey')
            .select('*')
            .eq('survey_link', slug)
            .select('survey_id, banner, template, title');
        if (surveyError) {
            console.error('Error fetching survey:', surveyError);
            return res.status(500).json({ error: 'Failed to fetch survey' });
        }
        if (!survey) {
            return res.status(404).json({ message: 'Survey not found' });
        }
        //return the survey
        return res.status(200).json({
            message: 'Survey fetched successfully',
            data: survey[0],
        });
    }catch (err) {
        console.error('Error in fetchSurveyUser:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
