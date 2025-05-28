const supabase = require("../db");

exports.submitSurvey = async (req, res) => {
    try {
        const slug = req.params.slug;
        const { userResponse } = req.body;
        const user_id = req.jwt.id;
        console.log('Received slug:', slug);
        console.log(userResponse);
        //fetch survey id by slug
        const { data: surveyData, error: surveyError } = await supabase
            .from('survey')
            .select('survey_id')
            .eq('survey_link', slug)
            .single();
        if (surveyError) {
            console.error('Error fetching survey by slug:', surveyError);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!surveyData) {
            console.error('Survey not found for slug:', slug);
            return res.status(404).json({ error: 'Survey not found' });
        }
        const surveyId = surveyData.survey_id;
        console.log('Survey ID:', surveyId);
        //insert the survey response
        const { data: responseData, error: responseError } = await supabase
            .from('response')
            .insert([{ survey_id: surveyId, user_id: user_id, response_data: userResponse }])
            .select();
        if (responseError) {
            console.error('Error inserting survey response:', responseError);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!responseData || responseData.length === 0) {
            console.error('No response data returned after insertion');
            return res.status(500).json({ error: 'Failed to submit survey response' });
        }
        console.log('Survey response submitted successfully:', responseData);
        res.status(200).json({ message: 'Survey response submitted successfully', data: responseData });
    } catch (err) {
        console.error('Error in submitSurvey:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
