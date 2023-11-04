const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
    openapi: '3.0.0',
    info: {
        title: 'Multi Sign Backend API',
        version: '1.0.0',
        description: 'API Documentation for Multi Sign backend',
    },
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
        SignUpInput: {
            type: 'object',
            properties: {
            name: {
                type: 'string',
                example: 'user',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'user@example.com',
            },
            password: {
                type: 'string',
                example: '123456',
            },
            },
            required: ['name', 'email', 'password'],
        },
        LoginInput: {
            type: 'object',
            properties: {
                loginEmail: {
                type: 'string',
                format: 'email',
                example: 'user@multisig.com',
                },
                password: {
                type: 'string',
                example: '123456',
                },
            },
            required: ['email', 'password'],
        },
        ProcessInput: {
            type: 'object',
            properties: {
                description: {
                type: 'string',
                example: 'sample process',
                },
                participants: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'email',
                    example: 'user1@multisig.com',
                },
                },
                commentVisibility: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'email',
                    example: 'user1@multisig.com',
                },
                },
            },
            required: ['description', 'participants', 'commentVisibility'],
        },
        CommentViewerInput: {
            type: 'object',
            properties: {
                commentVisibility: {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'email',
                    example: 'user2@multisig.com',
                },
                },
            },
            required: ['commentVisibility'],
        },
        SignOffInput: {
            type: 'object',
            properties: {
                comment: {
                type: 'string',
                example: 'Sample Comment',
                },
                picture_url: {
                type: 'string',
                format: 'url',
                example: 'https://sample_url.jpg',
                },
            },
            required: ['comment', 'picture_url'],
        },
        },
    },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
    apis: ['./routes/authRoutes.js', './routes/processRoutes.js'], // Path to the API routes in your project
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
