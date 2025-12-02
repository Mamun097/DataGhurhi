const supabase = require("../db");

exports.submitSurvey = async (req, res) => {
try {
        const { slug } = req.params;
        const { userResponse, metadata } = req.body;
        const userId = req.jwt?.id; 

        // 1. Fetch the survey's rules (ID and login requirement) in one call.
        const { data: survey, error: surveyError } = await supabase
            .from('survey')
            .select('survey_id, response_user_logged_in_status') 
            .eq('survey_link', slug)
            .single();

        if (surveyError || !survey) {
            return res.status(404).json({ error: 'Survey not found.' });
        }

        const surveyId = survey.survey_id;

        if (survey.response_user_logged_in_status === true) {
            // --- PROTECTED SURVEY SUBMISSION ---
            // If login is required, a user ID must be present.
            if (!userId) {
                return res.status(401).json({ error: 'You must be logged in to submit a response to this survey.' });
            }

            // // CRITICAL: Check for duplicate submissions to maintain data integrity.
            // const { count, error: duplicateCheckError } = await supabase
            //     .from('response') // Note: Make sure your table is named 'response' or 'survey_responses'
            //     .select('*', { count: 'exact', head: true })
            //     .eq('survey_id', surveyId)
            //     .eq('user_id', userId);

            // if (duplicateCheckError) throw duplicateCheckError;

            // if (count > 0) {
            //     return res.status(409).json({ error: 'You have already submitted a response for this survey.' });
            // }

            // If all checks pass, insert the response with the user's ID.
            const { data, error } = await supabase
                .from('response')
                .insert([{ survey_id: surveyId, user_id: userId, response_data: userResponse , metadata: metadata }])
                .select()
                .single();
                
            if (error) throw error;
            return res.status(201).json({ message: 'Response submitted successfully.', data });

        } else {
            // --- PUBLIC SURVEY SUBMISSION ---

            // Anyone can submit. The userId will be saved if the user happens to be logged in,
            // otherwise it will be saved as NULL. This is why the column must be nullable.
            const { data, error } = await supabase
                .from('response')
                .insert([{ survey_id: surveyId, user_id: userId, response_data: userResponse }])
                .select()
                .single();

            if (error) throw error;
            return res.status(201).json({ message: 'Response submitted successfully.', data });
        }

    } catch (err) {
        console.error('Error in submitSurveyResponse:', err.message);
        // Check for specific Supabase errors, like unique constraint violation
        if (err.code === '23505') {
            return res.status(409).json({ error: 'A response from this user for this survey may already exist.' });
        }
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
}
