// const bcrypt = require('bcrypt');
const bcrypt = require('bcryptjs');
module.exports.makeHash = async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, 10);
    return hash;
}

module.exports.isPasswordValid = async (hashPassword, plaintextPassword) => {
    const result = await bcrypt.compare(plaintextPassword, hashPassword);
    return result;
}