const User = require('../model/user');

exports.checkEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ exists: false });

  try {
    const { data: user } = await User.findUserByEmail(email);
    res.json({ exists: user.length > 0 });
  } catch (err) {
    res.status(500).json({ exists: false });
  }
};


exports.register = async (req, res) => {
    try {
        const
        {name, email, password} = req.body;
        console.log(req.body);
        // Validate input data (check for missing fields, etc.)
        if (!name || !email || !password) {
            return res.status(404).json({error: 'All fields are required'});
        }
        // Check if user already exists
        const
        {data:user} = await User.findUserByEmail(email);
        console.log(user.length);
        if (user.length != 0) {
            // console.log(user);
            return res.status(400).json({error: 'user already exists'});
        }
        // Create a new user record in the database
        const newUser = await User.createUser({name, email, password});
        if (!newUser) {
            return res.status(500).json({error: 'Internal server error'});
        }
        return res.status(201).json({message: 'User created successfully'});
    }
    catch (err) {
        console.error('Error in register:', err);
        res.status(500).json({error: 'Internal server error'});
    }
}

