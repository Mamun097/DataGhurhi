const supabase = require('../db');
// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
// create user
//check if user exists with supabase

async function
    findUserByEmail(email) {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
    if (error) {
        console.error(error)
        return null
    }

    return data;
}
async function
    createUser({
        name,
        email,
        password
    }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await supabase
        .from('user')
        .insert([{
            name,
            email,
            password: hashedPassword
        }])
    return newUser;
}
async function findUserById(id) {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('user_id', id)
    // return data and error togrther
    return { data, error };
}



module.exports = {
    findUserByEmail,
    createUser, findUserById
};