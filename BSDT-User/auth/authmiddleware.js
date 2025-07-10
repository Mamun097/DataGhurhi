const jwt = require('jsonwebtoken');
const { isPasswordValid } = require('./authservice');
const supabase = require('../db');
const e = require('express');


module.exports.login = async (req, res, next) => {
    const { username, password } = req.body;
    // Fetching userData from database 
    const userInfo = "";

    const hashPass = userInfo[0].Password;

    //  Add more info if needed

    const { userId, email } = userInfo[0];

    if (hashPass && isPasswordValid(hashPass, password)) {
        req.body = {
            userId: userId,
            username: username,
            email: email
        }
        next();
    } else {
        res.status(400).send({ errors: ['Invalid email or password'] });
    }
}

module.exports.jwtAuthMiddleware = async(req, res, next) => {
        console.log('Entered jwtAuthMiddleware');
        console.log(req.headers);
        if (req.headers['authorization']) {
            try {
                let authorization = req.headers['authorization'].split(' ');
                if (authorization[0] != 'Bearer') {
                    return res.status(401).json({ error: "Unauthorized" });
                } else {
                    req.jwt = jwt.verify(authorization[1], process.env.JWT_SECRET_USER);
                    const userData = jwt.verify(authorization[1], process.env.JWT_SECRET_USER);
                    //    add necessary data to request body. Here i added only userId
                    req.body.userId = req.jwt.id;
                    console.log('User ID:', req.jwt.id);
                    // req.body.role = userData.role;

                    
                // Extract project ID if available (e.g., from route or body)
                const projectID = req.params.projectID || req.body.projectID;
                if (projectID) {
                    console.log('Project ID:', projectID);
                    // check if project is public
                    const { data: projectData, error: projectError } = await supabase
                        .from('survey_project')
                        .select('privacy_mode')
                        .eq('project_id', projectID)
                        .single();
                    // project is publisc no need to check user role
                    if (projectError) {
                        console.error('Error fetching project data:', projectError.message);
                        return res.status(500).send({ error: 'Internal server error' });
                    }
                    if (projectData && projectData.privacy_mode === 'public') {
                        console.log('Project is public, no need to check user role.');
                        req.body.role = 'viewer'; // Set role to viewer for public projects
                        console.log('User role set to viewer for public project:', projectID);
                        // Proceed to the next middleware or route handler
                        return next();
                    }
                    else if (projectData && projectData.privacy_mode === 'private') {
                    console.log('Project is private, checking user role...');
                    // If project ID is provided, check if the user has the required role for the project
                    
                    
                    // Fetch project data from the database using the project ID
                    const { data, error } = await supabase.rpc('get_user_project_role', {
                        u_id: req.body.userId,
                        p_id: projectID
                    });
                    if (error) {
                        console.error('Error fetching project data:', error.message);
                        return res.status(500).send({ error: 'Internal server error' });
                    }
                    if (data.length === 0) {
                        return res.status(403).send({ error: 'You do not have permission to access this project.' });
                    }
                    
                    // Check if the user has the required role for the project
                    const userRole = data;
                    if (userRole !== 'owner' && userRole !== 'editor' && userRole !== 'viewer') {
                        console.log(data)
                        // User does not have the required role, send a 403 Forbidden response  
                        return res.status(404).send({ error: 'You do not have permission to access this project.' });
                    }
                    else {
                        // User has the required role, proceed to the next middleware or route handler
                        console.log('User has the required role:', userRole);
                        req.body.role = userRole; // Add the role to the request body for further use
                        console.log('User role:', req.body.role);
                        console.log('User ID:', req.body.userId);
                        console.log('Project ID:', projectID);

                        // Proceed to the next middleware or route handler
                        // return res.status(200).send({ message: 'User has the required role' });
                        }}
                        return next();                        
                    }
                    next();
                }
                } catch (err) {
                    return res.status(403).send();
                }
            } else {
                const projectID = req.params.projectID || req.body.projectID;
                if (projectID) {
                    console.log('Project ID:', projectID);
                    // check if project is public
                    const { data: projectData, error: projectError } = await supabase
                        .from('survey_project')
                        .select('privacy_mode')
                        .eq('project_id', projectID)
                        .single();
                    // project is publisc no need to check user role
                    if (projectError) {
                        console.error('Error fetching project data:', projectError.message);
                        return res.status(500).send({ error: 'Internal server error' });
                    }
                    if (projectData && projectData.privacy_mode === 'public') {
                        console.log('Project is public, no need to check user role.');
                        req.body.role = 'viewer'; // Set role to viewer for public projects
                        console.log('User role set to viewer for public project:', projectID);
                        // Proceed to the next middleware or route handler
                        return next();
                    }
                }

                return res.status(401).send({ error: "Please attach access token in headers." });
        }
    }
module.exports.optionalJwtAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token provided, which is okay for this middleware.
        return next();
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
        req.user = decoded; 
        req.jwt = decoded;         
        next();
    } catch (err) {
        // This part is correct: if a token is provided, it must be valid.
        console.error('Optional Auth Error: Invalid token provided.', err.message);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};
module.exports.jwtAuthMiddlewareSurvey = async(req, res, next) => {
    console.log('Entered jwtAuthMiddlewareSurvey');
    console.log(req.headers);
    const surveyID= req.params.surveyID || req.body.surveyID;
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] != 'Bearer') {
                return res.status(401).json({ error: "Unauthorized" });
            } else {
                req.jwt = jwt.verify(authorization[1], process.env.JWT_SECRET_USER);
                const userData = jwt.verify(authorization[1], process.env.JWT_SECRET_USER);
                //    add necessary data to request body. Here i added only userId
                req.body.userId = req.jwt.id;
                console.log('User ID:', req.jwt.id);
                // req.body.role = userData.role;

                
            // Fetch survey data from the database using the survey ID
            const { data, error } = await supabase 
                .from('survey_shared_with_collaborators')
                .select('access_role, survey_id, survey(survey_id, user_id)')
                .eq('user_id', req.body.userId)
                .eq('survey_id', surveyID)
                .single();
            if (error) {
                console.error('Error fetching survey data:', error.message);
                return res.status(500).send({ error: 'Internal server error' });
            }
            if (!data) {
                return res.status(403).send({ error: 'You do not have permission to access this survey.' });
            }
            // Check if the user has the required role for the survey
            if ( data.survey.user_id === req.body.userId) {
            const userRole = 'owner'; // If the user is the owner of the survey, set role to 'owner'
            } else {
            const userRole = data.access_role; // Get the user's role from the survey data
            }

            if (userRole !== 'owner' && userRole !== 'editor' && userRole !== 'viewer') {
                console.log(data);
                // User does not have the required role, send a 403 Forbidden response  
                return res.status(404).send({ error: 'You do not have permission to access this survey.' });
            } else {
                // User has the required role, proceed to the next middleware or route handler
                req.body.surveyrole = userRole; // Add the role to the request body for further use
                
                console.log('User ID:', req.body.userId);
                console.log('User survey role:', req.body.surveyrole);
                console.log('Survey ID:', surveyID);

                // Proceed to the next middleware or route handler
                next();
            }
            }
        } catch (err) {
            console.error('Error in jwtAuthMiddlewareSurvey:', err.message);
            return res.status(403).send({ error: 'Forbidden' });
        }
    }
    else {
        return res.status(401).send({ error: "Please attach access token in headers." });
    }
}