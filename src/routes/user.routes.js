const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')

router.get('/', (req, res) => {
	res.status(200).json({
		status: 200,
		result: 'Hello World',
	})
})

//UC-201
router.post('/api/user', userController.validateUser, userController.addUser)

//UC-202
router.get('/api/user', authController.validateToken, userController.getAllUsers)

//UC-203
router.get('/api/user/profile',	authController.validateToken, userController.getUserProfileFromId)

//UC-204
router.get('/api/user/:userId',	authController.validateToken, userController.getUserFromId)

//UC-205
router.put('/api/user/:userId',	authController.validateToken, userController.validateUpdateUser, userController.updateUserFromId)

//UC-206
router.delete('/api/user/:userId',	authController.validateToken, authController.validateOwnershipUser,	userController.deleteUserFromId)

module.exports = router