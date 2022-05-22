const express = require('express')
const app = express()

const logger = require('./src/config/config').logger

require('dotenv').config()
const port = process.env.PORT

const bodyParser = require('body-parser')
app.use(bodyParser.json())

const userRouter = require('./src/routes/user.routes')
const mealRoutes = require('./src/routes/meal.routes')
const authRoutes = require('./src/routes/auth.routes')

//Log all requests
app.all('*', (req, res, next) => {
	const method = req.method
	logger.debug(`Method ${method} is aangeroepen`)
	next()
})

app.use(userRouter)
app.use(mealRoutes)
app.use(authRoutes)

//All unvalid routes
app.all('*', (req, res) => {
	res.status(404).json({
		status: 404,
		result: 'End-point not found',
	})
})

//Error Handling
app.use((err, req, res, next) => {
	logger.debug('Error handler called.')
	res.status(err.status).json(err)
})

//Start server
app.listen(port, () => {
	logger.debug(`Example app listening on port ${port}`)
})

process.on('SIGINT', () => {
	logger.debug('SIGINT signal received: stopping HTTP server')
	dbconnection.end((err) => {
		logger.debug('Database connection closed')
	})
	app.close(() => {
		logger.debug('HTTP server closed')
	})
})

module.exports = app