const {pool} = require('../db');
const { checkUserEmailExists, checkLoginEmailExistsInDB, addUserToDatabase } = require('../repositories/authQueries');

module.exports.checkEmailAlreadyExist = async (email) => {
    const result = await pool.query(checkUserEmailExists, [email]);

    return result.rowCount;
}

module.exports.checkLoginEmailExist = async (loginEmail) => {
    const result = await pool.query(checkLoginEmailExistsInDB, [loginEmail]);

    return result.rows[0] ? result.rows[0] : null;
}

module.exports.addUserDataToDB = async (userData) => {
    const result = await pool.query(addUserToDatabase, userData);

    return result.rows[0];
}

module.exports.validateEmailAndPasswordInput = (email, password) => {
    let validationMessage = '';

    if(!email || !password) {
        validationMessage = 'Both Email & Password are required!'
    }

    if(!isValidEmail(email)) {
        validationMessage = 'Invalid email address'
    }

    if(password.length < 6) {
        validationMessage = 'Password must be at least 6 characters long'
    }

    return validationMessage;
}

function isValidEmail(email) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);

}