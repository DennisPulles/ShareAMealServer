const routes = require('express').Router()
const AuthController = require('../controllers/auth.controller')

//UC-101
routes.post('/auth/login', AuthController.validateLogin, AuthController.login)

module.exports = routes