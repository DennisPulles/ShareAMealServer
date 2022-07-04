require('dotenv').config()
process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'warn'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
const dbconnection = require('../../database/dbconnection')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require('../../src/config/config')

chai.should()
chai.use(chaiHttp)

// Clearing query's
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`'
const CLEAR_DB =
	CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

//INSERT USER
const INSERT_USER =
	'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city` ) VALUES' +
	'(1, "first", "last", "name@email.com", "Password1!", "0123456789", "street", "city")'
const INSERT_USER2 =
	'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city` ) VALUES' +
	'(2, "first2", "last2", "name@emailtwo.com", "Password2!", "0123456789", "street2", "city2")'

//INSERT MEAL
const INSERT_MEAL = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (1, 1, 1, 1, 1, '2022-05-22 16:58:27', 6, 6.75, 'https://t.eu1.jwwb.nl/W682407/UYP7o9fm_Y55dSlUgrI0xDdGPu8=/0x160:1600x903/1200x557/f.eu1.jwwb.nl%2Fpublic%2Fy%2Fe%2Fp%2Ftemp-oiepihihappqmxrjsyvg%2F0w7c8x%2Fspagetti-1.jpg', 1, 'Spaghetti Bolognese', 'Italiaanse hap van deegslierten en saus.')`
const INSERT_MEAL2 = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (2, 0, 0, 0, 0, '2022-06-22 16:58:27', 7, 7.75, 'https://t.eu1.jwwb.nl/W682407/UYP7o9fm_Y55dSlUgrI0xDdGPu8=/0x160:1600x903/1200x557/f.eu1.jwwb.nl%2Fpublic%2Fy%2Fe%2Fp%2Ftemp-oiepihihappqmxrjsyvg%2F0w7c8x%2Fspagetti-1.jpg', 2, 'Spaghetti Bolognese 2', 'Italiaanse hap van deegslierten en saus deel 2.')`

describe('Login Functionality /auth/login', () => {
	describe('UC-101 Request List of meals', () => {
	beforeEach((done) => {
		logger.debug('beforeEach called')
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err
				connection.query(
					'ALTER TABLE meal AUTO_INCREMENT = 1',
					(error, result, field) => {
						connection.query(
							'ALTER TABLE user AUTO_INCREMENT = 1',
							function (error, result, fields) {
								connection.query(
									CLEAR_DB + INSERT_USER + INSERT_MEAL,
									function (error, results, fields) {
										connection.release()
										if (error) throw error
										logger.debug('beforeEach done')
										done()
									}
								)
							}
						)
					}
				)
			})

			it('TC 101-1 Required field missing', (done) => {
				chai.request(server)
					.post('/api/auth/login')
					.send({
						password: 'Password0!',
					})
					.end((err, res) => {
						res.should.be.an('object')
						let { status, message } = res.body
						status.should.equals(400)
						message.should.be
							.a('string')
							.that.equals('Required field is missing')
						done()
					})
			})

			it('TC 101-2 Non valid ', (done) => {
				chai.request(server)
					.post('/api/auth/login')
					.send({
						emailAdress: "invalidEmail",
						password: 'Password0!',
					})
					.end((err, res) => {
						res.should.be.an('object')
						let { status, message } = res.body
						status.should.equals(400)
						message.should.be
							.a('string')
							.that.equals('Non valid email address')
						done()
					})
			})

			it('TC 101-3 Non valid password', (done) => {
				chai.request(server)
					.post('/api/auth/login')
					.send({
						emailAdress: 'name@email.nl',
						password: "a",
					})
					.end((err, res) => {
						res.should.be.an('object')
						let { status, message } = res.body
						status.should.equals(400)
						message.should.be
							.a('string')
							.that.equals(
								'Password must contain atleast 8 characters which contains at least one lower- and uppercase letter,one number, and one special character'
							)
						done()
					})
			})

			it('TC 101-4 User does not exist', (done) => {
				chai.request(server)
					.post('/api/auth/login')
					.send({
						emailAdress: 'fakeuser@hotmail.com',
						password: 'Secrets0',
					})
					.end((err, res) => {
						res.should.be.an('object')
						let { status, message } = res.body
						status.should.equals(404)
						message.should.be
							.a('string')
							.that.equals('User not found or password invalid')
						done()
					})
			})

			it('TC 101-5 User logged in succesfully', (done) => {
				chai.request(server)
					.post('/api/auth/login')
					.send({
						emailAdress: 'name@email.com',
						password: 'Password1!',
					})
					.end((err, res) => {
						res.should.be.an('object')
						let { status, result } = res.body
						status.should.equals(200)
						assert.deepEqual(result, {
							emailAdress: 'name@email.com',
							firstName: 'first',
							id: 1,
							isActive: 1,
							street: 'street',
							city: 'city',
							lastName: 'last',
							token: result.token,
						})
						done()
					})
			})

		})
	})
})