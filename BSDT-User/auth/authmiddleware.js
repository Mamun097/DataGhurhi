const jwt = require('jsonwebtoken');
const { isPasswordValid } = require('./authservice');

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
// module.exports.jwtAuthMiddleware = (req, res, next) => {
//     // console.log('Entered jwtAuthMiddleware');
//     console.log(req.headers);
//     if (req.headers['authorization']) {
//         try {
//             let authorization = req.headers['authorization'].split(' ');
//             if (authorization[0] != 'Bearer') {
//                 console.log('unauthorized');
//                 return res.status(401).json({ error: "Unauthorized" });
//             } else {
//                 req.jwt = jwt.verify(authorization[1], process.env.JWT_SECRET_TEACHER);
//                 const userData = jwt.decode(authorization[1], process.env.JWT_SECRET_TEACHER);
//                 //    add necessary data to request body. Here i added only userId
//                 req.body.userId = userData.userId;
//                 console.log('Authorization successful');
//                 next();
//             }
//         } catch (err) {
//             return res.status(403).send();
//         }
//     } else {
//         return res.status(401).send({ error: "Please attach access token in headers." });
//     }
// }

module.exports.jwtAuthMiddleware = (req, res, next) => {
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
                    req.body.userId = userData.userId;
                    req.body.role = userData.role;
                    next();
                }
            } catch (err) {
                return res.status(403).send();
            }
        } else {
            return res.status(401).send({ error: "Please attach access token in headers." });
        }
    }