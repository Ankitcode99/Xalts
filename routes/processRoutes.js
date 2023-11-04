const express = require('express');
const { ensureAuthrizedUser } = require('../middlewares/authMiddleware');
const { createNewProcess, getProcessDetails, addProcessCommentors, performProcessSignOff } = require('../controllers/processControllers');
const router = express.Router();

/**
 * @swagger
 * /api/process/create:
 *   post:
 *      summary: Create a new process
 *      security:
 *          - BearerAuth: []
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/ProcessInput'
 *      responses:
 *          '201':
 *              description: Process created successfully
 *          '400':
 *              description: Invalid input
 *          '500':
 *              description: Internal Server Error
 *      tags:
 *          - Process
 */
router.post('/create', ensureAuthrizedUser, createNewProcess);

/**
 * @swagger
 * /api/process/{id}:
 *   get:
 *     summary: Get process details by ID
 *     security:
 *       - BearerAuth: []  # Include your security definition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the process to retrieve
 *     responses:
 *       '200':
 *         description: Process details retrieved successfully
 *       '404':
 *         description: Process not found
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Internal Server Error
 *     tags:
 *       - Process
 */
router.get('/:id', ensureAuthrizedUser, getProcessDetails);


// assuming we can only add comment viewers and only process creator can add them
/**
 * @swagger
 * /api/process/{id}/comment-viewer:
 *   post:
 *     summary: Add comment viewers to a process
 *     security:
 *       - BearerAuth: []  # Include your security definition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the process to which comment viewers will be added
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentViewerInput'
 *     responses:
 *       201:
 *         description: Comment viewers added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Action Forbidden 
 *       500:
 *         description: Internal Server Error
 *     tags:
 *       - Process
 */
router.post('/:id/comment-viewer', ensureAuthrizedUser, addProcessCommentors);


/**
 * @swagger
 * /api/process/{id}/sign-off:
 *   post:
 *     summary: Perform process sign-off
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the process to sign off
 *     requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  $ref: '#/components/schemas/SignOffInput'
 *     responses:
 *       200:
 *         description: Process signed off successfully
 *       204:
 *         description: Action already performed successfully 
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Action Forbidden  
 *       500:
 *         description: Internal Server Error 
 *     tags:
 *       - Process
 */
 router.post('/:id/sign-off', ensureAuthrizedUser, performProcessSignOff);


module.exports = router;