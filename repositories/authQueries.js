module.exports.createUserTable = `CREATE TABLE IF NOT EXISTS Users(
    id                SERIAL PRIMARY KEY,
    name              VARCHAR(50),
    email             VARCHAR(50) NOT NULL,
    loginEmail        VARCHAR(50) UNIQUE NOT NULL,
    password          VARCHAR(150) NOT NULL,
    salt              VARCHAR(100) NOT NULL
);`


module.exports.checkUserEmailExists = `SELECT id FROM public.Users WHERE email = $1`

module.exports.checkLoginEmailExistsInDB = `SELECT id, email, loginEmail, password, salt FROM public.Users WHERE loginemail = $1`

module.exports.addUserToDatabase = `INSERT INTO public.Users (name, email, password, loginEmail, salt) 
    VALUES ($1, $2, $3, $4, $5) RETURNING name, email, loginEmail`