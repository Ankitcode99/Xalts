const express = require('express');
const { performSignUp, performLogin } = require('../controllers/authControllers');
const router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignUpInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *          description: Email already exists
 *       500:
 *          description: Internal Server Error 
 *     tags:
 *       - Authentication
*/
router.post('/signup', performSignUp)


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       201:
 *         description: Login Successful!
 *       400:
 *         description: Both loginEmail and password are required
 *       401:
 *          description: Invalid credentials
 *       500:
 *          description: Internal Server Error 
 *     tags:
 *       - Authentication
*/
router.post('/login', performLogin)

module.exports = router;