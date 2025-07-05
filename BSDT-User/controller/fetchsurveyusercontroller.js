const supabase = require('../db');
const { jwtAuthMiddleware } = require("../auth/authmiddleware");


exports.fetchSurveyUser = async (req, res) =>{
    try {
        const { slug } = req.params;
        const userId = req.jwt?.id; // Get user ID from optional JWT

        const { data: survey, error: surveyError } = await supabase
            .from('survey')
            .select('survey_id, title, template, banner, response_user_logged_in_status, shuffle_questions')
            .eq('survey_link', slug)
            .single();

        if (surveyError || !survey) {
            return res.status(404).json({
                status: 'NOT_FOUND',
                message: 'This survey does not exist.'
            });
        }

        if (survey.response_user_logged_in_status === true) {
            if (!userId) {
                return res.status(401).json({
                    status: 'LOGIN_REQUIRED',
                    message: 'You must be logged in to access this survey.'
                });
            }            
            return res.status(200).json({ status: 'SUCCESS', data: survey });

        } else {
            return res.status(200).json({ status: 'SUCCESS', data: survey });
        }

    } catch (err) {
        console.error('Error in fetchSurveyAccessDetails:', err.message);
        return res.status(500).json({
            status: 'ERROR',
            message: 'An internal server error occurred.'
        });
    }
}
