const dotenv = require('dotenv');
dotenv.config({path: './config/config.env'})
const express = require('express');
const { createTablesInDatabase } = require('./db');
const app = express();
const axios = require('axios');
const PORT = process.env.PORT || 5000;
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig'); 

const morgan = require('morgan');
const { getCurrentDateTime } = require('./utils');

createTablesInDatabase().then(()=>{
    console.log(`DB Connection established`)
    console.log(`Created tables in database`);
});

app.use(express.json());
app.use(morgan('dev'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Multi Sign API Documentation',
    swaggerOptions: {
      validatorUrl: null, // Disable validation
      displayOperationId: true, // Show operation ID
      docExpansion: 'list', // Display all endpoints by default
    },
    oauth: {
      clientId: 'your-client-id',
      appName: 'Your App Name',
      usePkceWithAuthorizationCodeGrant: true,
    }
}));


app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/process', require('./routes/processRoutes'))

app.get("/keep-alive",(req,res)=>{
    res.json({
        "Keep-Alive": getCurrentDateTime()
    })
})

// Keep-Alive utility to keep server always running!
setInterval(()=>{
    axios.get('https://multisign-backend.onrender.com/keep-alive')
        .then((data)=>{
            console.log(data.data);
        })
        .catch((err) => {
            console.log("ERROR LOG: Keep Alive ERROR: ",err);
        })
},890000)

app.use('*', (req,res)=>{
    res.status(404).json({
        "message": 'Error 404!'
    })    
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT - ${PORT}`)
})
