const supabase = require('../db');
const { jwtAuthMiddleware } = require("../auth/authmiddleware");


exports.fetchSurveyUser = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.jwt?.id;

        const { data: survey, error: surveyError } = await supabase
            .from('survey')
            .select('survey_id, title, template, banner, response_user_logged_in_status, shuffle_questions, collect_response, ending_date')
            .eq('survey_link', slug)
            .single();

        if (surveyError || !survey) {
            return res.status(404).json({
                status: 'NOT_FOUND',
                message: 'This survey does not exist.'
            });
        }
        const isPastEndingDate = survey.ending_date && new Date(survey.ending_date) < new Date();

        if (!survey.collect_response || isPastEndingDate) {
            return res.status(403).json({
                status: 'SURVEY_CLOSED',
                message: 'This survey is no longer accepting responses.'
            });
        }
        if (survey.response_user_logged_in_status === true) {
            if (!userId) {
                return res.status(401).json({
                    status: 'LOGIN_REQUIRED',
                    message: 'You must be logged in to access this survey.'
                });
            }
        }
        return res.status(200).json({ status: 'SUCCESS', data: survey });

    } catch (err) {
        console.error('Error in fetchSurveyUser:', err.message);
        return res.status(500).json({
            status: 'ERROR',
            message: 'An internal server error occurred.'
        });
    }
}

