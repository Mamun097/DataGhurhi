const e = require('express');
const supabase = require("../db");

exports.sendCollaborationRequest = async (req, res) => {
    const {survey_id, request_email, access_role} = req.body;
    const userId = req.jwt?.id; // Get the user ID from the JWT token
    if (!userId) {
        return res.status(401).json({ error: 'You must be logged in to send a collaboration request.' });
    }
    if (!survey_id || !request_email || !access_role) {
        return res.status(400).json({ error: 'Survey ID, request email, and access role are required.' });
    }
    try{
        //check if the survey exists and the user is the owner
        const { data: survey, error: surveyError } = await supabase
            .from('survey')
            .select('survey_id, user_id')
            .eq('survey_id', survey_id)
            .single();
        if (surveyError || !survey) {
            return res.status(404).json({ error: 'Survey not found.' });
        }
        if (survey.user_id !== userId) {
            return res.status(403).json({ error: 'You are not authorized to send collaboration requests for this survey.' });
        }
        // get the user_id from email.
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('user_id')
            .eq('email', request_email)
            .single();
        if (userError || !user) {
            return res.status(404).json({ error: 'User not found with the provided email.' });
        }
        const requestUserId = user.user_id;
        // check if the collaboration request already exists
        const { data: existingRequest, error: existingRequestError } = await supabase
            .from('survey_shared_with_collaborators')
            .select('invitation')
            .eq('survey_id', survey_id)
            .eq('user_id', requestUserId)
            .single();
        if (existingRequestError) {
            return res.status(500).json({ error: 'Error checking existing collaboration request.' });
        }
        //check whether invitation accepted or pending. else post to database.
        if (existingRequest) {
            if (existingRequest.invitation === 'accepted') {
                return res.status(409).json({ error: 'Collaboration request already accepted.' });
            } else if (existingRequest.invitation === 'pending') {
                return res.status(409).json({ error: 'Collaboration request already pending.' });
            }
        }
        // Insert the collaboration request into the database
        const { data, error } = await supabase
            .from('survey_shared_with_collaborators')
            .insert([{user_id: requestUserId, survey_id: survey_id, access_role: access_role, invitation: 'pending', invite_time: new Date()}])
            .select()
            .single();
        if (error) {
            return res.status(500).json({ error: 'Error sending collaboration request.' });
        }
        return res.status(201).json({ message: 'Collaboration request sent successfully.', data: data });
    } catch (err) {
        console.error('Error sending collaboration request:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }


}