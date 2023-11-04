const { pool } = require("../db");
const { GeneratePassword, GenerateSalt, createJsonMessage, ValidatePassword, GenerateSignature } = require("../utils");
const { checkEmailAlreadyExist, checkLoginEmailExist, addUserDataToDB, validateEmailAndPasswordInput } = require("../utils/authUtils");

module.exports.performSignUp = async (req,res) => {
    const {name, email, password} = req.body;

    try {
        const validationMessage = validateEmailAndPasswordInput(email, password);
        if(validationMessage!='') {
            res.status(400).json(createJsonMessage(validationMessage))
        } else{
            if(!await checkEmailAlreadyExist(email)) {
                const salt = await GenerateSalt();
                const hashedPassword = await GeneratePassword(password, salt);
                const loginEmail = (email.split('@')[0]+"@multisig.com");
        
                const userData = [ name, email, hashedPassword, loginEmail, salt]
                const result = await addUserDataToDB(userData); // pool.query(addUserToDatabase, userData);
                res.status(201).json(result);
            } else {
                res.status(409).json(createJsonMessage("Email already exists"))
            }        
    
        }
    } catch (error) {
        console.log("ERROR LOG: SignUp Error: ",error);
        res.status(500).json(createJsonMessage("Interval Server Error! Please try after sometime"));
    }
}


module.exports.performLogin = async(req,res) => {

    const {loginEmail, password} = req.body;

    try {
        const validationMessage = validateEmailAndPasswordInput(loginEmail, password);
        if(validationMessage!='') {
            res.status(400).json(createJsonMessage(validateEmailAndPasswordInput))
        } else{
            const userData = await checkLoginEmailExist(loginEmail);
            if(userData && userData.id) {
                if(await ValidatePassword(password, userData.password, userData.salt)){
    
                    const payload = {
                        userId: userData.id,
                        loginEmail: loginEmail
                    }
    
                    const token = await GenerateSignature(payload);
                    res.status(201).json({
                        "message": "Login successful!",
                        "token": token
                    })
                } else {
                    res.status(401).json(createJsonMessage("Invalid credentials"))            
                }
            } else {
                res.status(401).json(createJsonMessage("Invalid credentials"))
            }            
        }
    } catch (error) {
        console.log("Login Error: " + error);
        res.status(500).json(createJsonMessage("Internal Server Error"))
    }
}