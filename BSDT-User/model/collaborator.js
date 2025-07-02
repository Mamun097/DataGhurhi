const supabase = require('../db');
const bcrypt = require('bcryptjs');

async function acceptInvitation(userId, projectID) {
    const { data, error } = await supabase
        .from('project_shared_with_collaborator')
        .update({ invitation: 'accepted' })
        .eq('user_id', userId)
        .eq('project_id', projectID)
        .select('*');    
    if (error) {
        console.error('Error accepting invitation:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}


async function rejectInvitation(userId, projectID) {
    const { data, error } = await supabase
        .from('project_shared_with_collaborator')
        .update({ invitation: 'declined' })
        .eq('user_id', userId)
        .eq('project_id', projectID)
        .select('*');
    if (error) {
        console.error('Error rejecting invitation:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

async function getAllInvitations(userId) {
    const { data, error } = await supabase.rpc('get_collab_requests', { target_user_id: userId });
    console.log('Data:', data);
    if (error) {
        console.error('Error fetching invitations:', error.message);
        return { data: null, error };
    }
    
    return { data, error: null };
}
async function allprojectviewCollaborator(userId) {
    const { data, error } = await supabase
        .from('project_shared_with_collaborator')
        .select('user_id,access_role, project_id, survey_project(project_id,user_id, title, field, description, user!survey_project_user_id_fkey(user_id, name, email))') 
        .eq('user_id', userId)
        .eq('invitation', 'accepted');
    if (error) {
        console.error('Error fetching projects:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}
// async function inviteSurveyCollaborator(projectId, userId,access_role) {
//     const { data, error } = await supabase
//         .from('survey_shared_with_collaborators')
//         .insert({
//             survey_id: projectId,
//             user_id: userId,
//             access_role: access_role,
//             invitation: 'pending'
//         })
//         .select('*');
//     if (error) {
//         console.error('Error inviting survey collaborator:', error.message);
//         return { data: null, error };
//     }
//     return { data, error: null };
    
// }

async function rejectSurveyCollaborator(userId, surveyId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .update({ invitation: 'declined' })
        .eq('user_id', userId)
        .eq('survey_id', surveyId)
        .select('*');
    if (error) {
        console.error('Error rejecting survey collaborator:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

async function acceptSurveyCollaborator(userId, surveyId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .update({ invitation: 'accepted' })
        .eq('user_id', userId)
        .eq('survey_id', surveyId)
        .select('*');
    if (error) {
        console.error('Error accepting survey collaborator:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}

async function getAllSurveyInvitations(userId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .select('user_id, access_role, survey_id, survey(survey_id, user_id, title, user(user_id, name, email))')
        .eq('user_id', userId)
        .eq('invitation', 'pending');
}
async function allSurveyCollaborator(userId) {
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .select('user_id, access_role, survey_id, survey(survey_id, user_id, title, user(user_id, name, email))')
        .eq('user_id', userId)
        .eq('invitation', 'accepted');
    if (error) {
        console.error('Error fetching survey collaborators:', error.message);
        return { data: null, error };
    }
    return { data, error: null };
}


async function sendSurveyCollaborationRequest(survey_id, request_email, access_role, userId) {
    try {
        // 1. Check if the survey exists and the user is the owner
        const { data: survey, error: surveyError } = await supabase
            .from('survey')
            .select('survey_id, user_id')
            .eq('survey_id', survey_id)
            .single();

        if (surveyError || !survey) {
            return { data: null, error: { message: 'Survey not found.', status: 404 } };
        }
        if (survey.user_id !== userId) {
            return { data: null, error: { message: 'You are not authorized to send collaboration requests for this survey.', status: 403 } };
        }

        // 2. Get the user_id from the provided email
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('user_id')
            .eq('email', request_email)
            .single();

        if (userError || !user) {
            return { data: null, error: { message: 'User not found with the provided email.', status: 404 } };
        }
        const requestUserId = user.user_id;

        // 3. Prevent user from sending a request to themselves
        if (requestUserId === userId) {
            return { data: null, error: { message: 'You cannot send a collaboration request to yourself.', status: 400 } };
        }

        // 4. Check if a collaboration request already exists
        const { data: existingRequest, error: existingRequestError } = await supabase
            .from('survey_shared_with_collaborators')
            .select('invitation')
            .eq('survey_id', survey_id)
            .eq('user_id', requestUserId)
            .maybeSingle(); // Use maybeSingle() to avoid errors when no record is found

        if (existingRequestError) {
            console.error('Error checking existing collaboration request:', existingRequestError);
            return { data: null, error: { message: 'Error checking existing collaboration request.', status: 500 } };
        }

        if (existingRequest) {
            if (existingRequest.invitation === 'accepted') {
                return { data: null, error: { message: 'Collaboration request already accepted.', status: 409 } };
            } else if (existingRequest.invitation === 'pending') {
                return { data: null, error: { message: 'Collaboration request already pending.', status: 409 } };
            }
        }

        // 5. Insert the new collaboration request into the database
        const { data, error } = await supabase
            .from('survey_shared_with_collaborators')
            .insert([{ user_id: requestUserId, survey_id: survey_id, access_role: access_role, invitation: 'pending', invite_time: new Date() }])
            .select()
            .single();

        if (error) {
            console.error('Error inserting collaboration request:', error);
            return { data: null, error: { message: 'Error sending collaboration request.', status: 500 } };
        }

        // 6. On success, return the new data and a null error
        return { data: data, error: null };

    } catch (err) {
        // Catch any other unexpected errors
        console.error('Unexpected error in sendSurveyCollaborationRequest:', err);
        return { data: null, error: { message: 'Internal server error.', status: 500 } };
    }
};

async function getSurveyCollaborators(surveyID, userId) {
    // 1. Check if the user is the owner of the survey for authorization
    const { data: survey, error: surveyError } = await supabase
        .from('survey')
        .select('user_id')
        .eq('survey_id', surveyID)
        .single();

    if (surveyError || !survey) {
        const errorMessage = surveyError ? surveyError.message : 'Survey not found';
        console.error('Error checking survey ownership:', errorMessage);
        return { data: null, error: { message: 'Survey not found', status: 404 } };
    }

    // 2. Compare the survey's owner ID with the ID of the user making the request.
    if (survey.user_id !== userId) {
        console.error('Authorization failed: User is not the owner of the survey.');
        return { data: null, error: { message: 'You are not authorized to view these collaborators.', status: 403 } };
    }

    // 3. If authorized, fetch the collaborators and their associated user data.
    const { data, error } = await supabase
        .from('survey_shared_with_collaborators')
        .select('invitation, access_role, user(*)')
        .eq('survey_id', surveyID)
        .in('invitation', ['accepted', 'pending']); // Fetch both accepted and pending collaborators

    if (error) {
        console.error('Error fetching survey collaborators:', error.message);
        return { data: null, error };
    }

    // 4. Return the list of collaborators.
    return { data, error: null };
}

module.exports = {
    acceptInvitation,
    rejectInvitation,
    getAllInvitations,
    allprojectviewCollaborator,
    allSurveyCollaborator,
    acceptSurveyCollaborator,
    rejectSurveyCollaborator,
    getAllSurveyInvitations,
    sendSurveyCollaborationRequest,
    getSurveyCollaborators
};