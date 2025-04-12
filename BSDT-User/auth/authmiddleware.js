const jwt = require('jsonwebtoken');
const { isPasswordValid } = require('./authservice');
const supabase = require('../db');


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
                    
                    
                        next();
                    }
                } catch (err) {
                    return res.status(403).send();
                }
            } else {
                return res.status(401).send({ error: "Please attach access token in headers." });
        }
    }