const supabase = require("../db");

exports.submitSurvey = async (req, res) => {
    try {
        const { slug } = req.params;
        const { userResponse, calculatedMarks } = req.body;
        const userId = req.jwt?.id;

        const { data: survey, error: surveyError } = await supabase
            .from('survey')
            .select('survey_id, response_user_logged_in_status, collect_response, ending_date')
            .eq('survey_link', slug)
            .single();

        if (surveyError || !survey) {
            return res.status(404).json({ error: 'Survey not found.' });
        }

        const isPastEndingDate = survey.ending_date && new Date(survey.ending_date) < new Date();
        if (!survey.collect_response || isPastEndingDate) {
            return res.status(403).json({ error: 'This survey is no longer accepting responses.' });
        }

        if (survey.response_user_logged_in_status === true && !userId) {
            return res.status(401).json({ error: 'You must be logged in to submit a response to this survey.' });
        }
        if (userId) {
            const { count, error: duplicateCheckError } = await supabase
                .from('response')
                .select('*', { count: 'exact', head: true })
                .eq('survey_id', survey.survey_id)
                .eq('user_id', userId);

            if (duplicateCheckError) throw duplicateCheckError;

            if (count > 0) {
                return res.status(409).json({ error: 'You have already submitted a response for this survey.' });
            }
        }

        const { data, error } = await supabase
            .from('response')
            .insert([{
                survey_id: survey.survey_id,
                user_id: userId,
                response_data: userResponse,
                marks: calculatedMarks
            }])
            .select()
            .single();
            
        if (error) throw error;

        return res.status(201).json({ message: 'Response submitted successfully.', data });

    } catch (err) {
        console.error('Error in submitSurvey:', err.message);
        if (err.code === '23505') {
            return res.status(409).json({ error: 'You have already submitted a response for this survey.' });
        }
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
}