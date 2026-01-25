const supabase = require("../db");
const axios = require('axios');

exports.submitSurvey = async (req, res) => {
    try {
        const { slug } = req.params;
        const { userResponse, metadata, recaptchaToken } = req.body;
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

        // Check if reCAPTCHA is configured
        const isRecaptchaConfigured = process.env.RECAPTCHA_SECRET_KEY && 
                                       process.env.RECAPTCHA_SECRET_KEY !== 'undefined' &&
                                       process.env.RECAPTCHA_SECRET_KEY.trim() !== '';

        // Verify reCAPTCHA for ALL users (if configured and token provided)
        if (recaptchaToken && isRecaptchaConfigured) {
            try {
                const recaptchaResponse = await axios.post(
                    'https://www.google.com/recaptcha/api/siteverify',
                    null,
                    {
                        params: {
                            secret: process.env.RECAPTCHA_SECRET_KEY,
                            response: recaptchaToken
                        }
                    }
                );

                if (!recaptchaResponse.data.success) {
                    console.warn('reCAPTCHA verification failed:', recaptchaResponse.data);
                    return res.status(400).json({ 
                        error: 'reCAPTCHA verification failed. Please try again.' 
                    });
                }
                
                console.log('reCAPTCHA verification successful for survey submission');

            } catch (recaptchaError) {
                console.error('reCAPTCHA verification error:', recaptchaError.message);
                // Log the error but allow submission to proceed
                console.warn('Proceeding with survey submission despite reCAPTCHA error');
            }
        } else {
            // Log when reCAPTCHA is skipped
            if (!isRecaptchaConfigured) {
                console.warn('reCAPTCHA not configured - survey submission proceeding without verification');
            } else if (!recaptchaToken) {
                console.warn('No reCAPTCHA token provided - survey submission proceeding without verification');
            }
        }

        if (survey.response_user_logged_in_status === true) {
            // --- PROTECTED SURVEY SUBMISSION ---
            // If login is required, a user ID must be present.
            if (!userId) {
                return res.status(401).json({ error: 'You must be logged in to submit a response to this survey.' });
            }

            // Insert the response with the user's ID
            const { data, error } = await supabase
                .from('response')
                .insert([{ survey_id: surveyId, user_id: userId, response_data: userResponse, metadata: metadata }])
                .select()
                .single();
                
            if (error) throw error;
            return res.status(201).json({ message: 'Response submitted successfully.', data });

        } else {
            // --- PUBLIC SURVEY SUBMISSION ---
            // Anyone can submit. The userId will be saved if the user happens to be logged in,
            // otherwise it will be saved as NULL.
            const { data, error } = await supabase
                .from('response')
                .insert([{ survey_id: surveyId, user_id: userId, response_data: userResponse, metadata: metadata }])
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