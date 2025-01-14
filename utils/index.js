const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.GenerateSalt = async () => {
    return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
    enteredPassword,
    savedPassword,
    salt
) => {
    return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};  

module.exports.createJsonMessage = (messageString) => {
    return {
        "message": messageString
    }
}


module.exports.GenerateSignature = async (payload) => {
    try {
        return await jwt.sign(payload, process.env.APP_SECRET, { expiresIn: "30d" });
    } catch (error) {
        console.log("Generate signature error:",error);
        return error;
    }
};
  

module.exports.ValidateSignature = async (req) => {
    try {
        const signature = req.get("Authorization");
        if(!signature){
            return false;
        }

        const payload = await jwt.verify(signature.split(" ")[1], process.env.APP_SECRET);
        req.user = payload;
        return true;
    } catch (error) {
        console.log("Validate JWT Error: ",error);
        return false;
    }
};

module.exports.getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so we add 1.
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
  