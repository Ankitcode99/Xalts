const { ValidateSignature, createJsonMessage } = require("../utils")

module.exports.ensureAuthrizedUser = async (req,res,next) => {
    const isAuthorized = await ValidateSignature(req);

    if(isAuthorized) {
        next();
    }
    else{ 
        res.status(403).json(createJsonMessage("You are not authorized to perform this action!"));
    }
}