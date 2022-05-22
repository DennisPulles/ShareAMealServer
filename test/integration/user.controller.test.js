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
const INSERT_USER3 =
	'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city`, `isActive` ) VALUES' +
	'(3, "first3", "last3", "name@emailthree.com", "Password3!", "0123456789", "street3", "city3", 0)'
const INSERT_USER4 =
	'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `phoneNumber`, `street`, `city`, `isActive` ) VALUES' +
	'(4, "first4", "last4", "name@emailfour.com", "Password4!", "0123456789", "street4", "city4", 0)'

//INSERT MEAL
const INSERT_MEAL = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (1, 1, 1, 1, 1, '2022-05-22 16:58:27', 6, 6.75, 'https://t.eu1.jwwb.nl/W682407/UYP7o9fm_Y55dSlUgrI0xDdGPu8=/0x160:1600x903/1200x557/f.eu1.jwwb.nl%2Fpublic%2Fy%2Fe%2Fp%2Ftemp-oiepihihappqmxrjsyvg%2F0w7c8x%2Fspagetti-1.jpg', 1, 'Spaghetti Bolognese', 'Italiaanse hap van deegslierten en saus.')`
const INSERT_MEAL2 = `INSERT INTO meal (id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description) VALUES (2, 0, 0, 0, 0, '2022-06-22 16:58:27', 7, 7.75, 'https://t.eu1.jwwb.nl/W682407/UYP7o9fm_Y55dSlUgrI0xDdGPu8=/0x160:1600x903/1200x557/f.eu1.jwwb.nl%2Fpublic%2Fy%2Fe%2Fp%2Ftemp-oiepihihappqmxrjsyvg%2F0w7c8x%2Fspagetti-1.jpg', 2, 'Spaghetti Bolognese 2', 'Italiaanse hap van deegslierten en saus deel 2.')`

describe('CRUD Users /api/user', () => {
	beforeEach((done) => {
		describe('UC-201 Register New User', () => {
			logger.debug('beforeEach called')
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err
				connection.query(
					'ALTER TABLE user AUTO_INCREMENT = 1',
					(error, result, field) => {
						connection.query(
							CLEAR_DB + INSERT_USER,
							function (error, results, fields) {
								connection.release()
								if (error) throw error
								logger.debug('beforeEach done')
								done()
							}
						)
					}
				)
			})
		})

		it('TC-201-1 Required field is missing /api/user', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					lastName: 'Pulles',
					street: 'Leerlooierstraat 7',
					city: 'Breda',
					password: 'Wachtwoord0!',
					emailAdress: 'dennispulles@hotmail.com',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(400)
					message.should.be
						.a('string')
						.that.equals('First Name cannot be null!')
					done()
				})
		})

		it('TC 201-2 Non-valid emailAdress /api/user', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Dennis',
					lastName: 'Pulles',
					street: 'Leerlooierstraat 7',
					city: 'Breda',
					password: 'Wachtwoord0!',
					emailAdress: 'dennispulleshotmail.com',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(400)
					message.should.be
						.a('string')
						.that.equals('Invalid emailadres !')
					done()
				})
		})

		it('TC 201-3 Non-valid password /api/user', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Dennis',
					lastName: 'Pulles',
					street: 'Leerlooierstraat 7',
					city: 'Breda',
					phoneNumber: '0123456789',
					password: 123,
					emailAdress: 'dennispulles@hotmail.com',
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

		it('TC 201-4 User already exists /api/user', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'first',
					lastName: 'last',
					isActive: 1,
					emailAdress: 'name@email.com',
					password: 'Wachtwoord0',
					phoneNumber: '0123456789',
					roles: 'editor,guest',
					street: 'street',
					city: 'city',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(409)
					message.should.be
						.a('string')
						.that.equals(
							'Email-address: name@email.com has already been taken!'
						)
					done()
				})
		})

		it('TC 201-5 User added succesfully /api/user', (done) => {
			chai.request(server)
				.post('/api/user')
				.send({
					firstName: 'Dennis',
					lastName: 'Pulles',
					isActive: 1,
					emailAdress: 'dennispulles@hotmail.com',
					password: 'Password0!',
					phoneNumber: '0640511370',
					roles: 'editor,guest',
					street: 'Leerlooierstraat 7',
					city: 'Breda',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, result } = res.body
					status.should.equals(201)
					assert.deepEqual(result, {
						id: 2,
                        firstName: 'Dennis',
                        lastName: 'Pulles',
                        isActive: 1,
                        emailAdress: 'dennispulles@hotmail.com',
                        password: 'Password0!',
                        phoneNumber: '0640511370',
                        roles: 'editor,guest',
                        street: 'Leerlooierstraat 7',
                        city: 'Breda',
					})
					logger.debug(result)
					done()
				})
		})
	})

	describe('UC-202 User Overview /api/user', () => {
		beforeEach((done) => {
			describe('UC-202-1 Show 0 users/api/user', () => {
				logger.debug('beforeEach called')
				dbconnection.getConnection(function (err, connection) {
					if (err) throw err
					connection.query(
						CLEAR_DB,
						function (error, results, fields) {
							connection.release()
							if (error) throw error
							logger.debug('beforeEach done')
							done()
						}
					)
				})
			})

			it('TC-202-2 Show 2 users /api/user', (done) => {
				chai.request(server)
					.get('/api/user')
					.set(
						'authorization',
						'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
					)
					.end((err, res) => {
						res.should.be.an('object')
						let { status, result } = res.body
						status.should.equals(200)
						assert.deepEqual(result, [])
						done()
					})
			})
		})

		beforeEach((done) => {
			describe('UC-202-2 Show 2 users/api/user', () => {
				logger.debug('beforeEach called')
				dbconnection.getConnection(function (err, connection) {
					if (err) throw err
					connection.query(
						CLEAR_DB + INSERT_USER + INSERT_USER2,
						function (error, results, fields) {
							connection.release()
							if (error) throw error
							logger.debug('beforeEach done')
							done()
						}
					)
				})
			})

			it('TC-202-2 Show 2 users /api/user', (done) => {
				chai.request(server)
					.get('/api/user')
					.set(
						'authorization',
						'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
					)
					.end((err, res) => {
						res.should.be.an('object')
						let { status, result } = res.body
						status.should.equals(200)
						assert.deepEqual(result, [
							{
								id: 1,
								firstName: 'First',
								lastName: 'Last',
								isActive: 1,
								emailAdress: 'name@email.com',
								password: 'Wachtwoord1!',
								phoneNumber: '0123456789',
								roles: 'editor,guest',
								street: 'street',
								city: 'city',
							},
							{
								id: 2,
								firstName: 'First2',
								lastName: 'Last2',
								isActive: 1,
								emailAdress: 'name@emailtwo.com',
								password: 'Password1!',
								phoneNumber: '0123456789',
								roles: 'editor,guest',
								street: 'streettwo',
								city: 'citytwo',
							},
						])
						done()
					})
			})
		})

		beforeEach((done) => {
			describe('UC-202 Remaining test cases users/api/user', () => {
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
										CLEAR_DB +
										INSERT_USER +
										INSERT_USER2 +
										INSERT_USER3 +
										INSERT_USER4,
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
			})

			it('TC-202-3 Show users for non-existing name /api/user', (done) => {
				chai.request(server)
					.get('/api/user?firstName=dfghjkiuytf')
					.set(
						'authorization',
						'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
					)
					.end((err, res) => {
						res.should.be.an('object')
						let { status, result } = res.body
						status.should.equals(200)
						result.should.be.an('array').that.lengthOf(0)
						done()
					})
			})

			it('TC-202-4 Show users for isActive=false /api/user', (done) => {
				chai.request(server)
					.get('/api/user?isActive=false')
					.set(
						'authorization',
						'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
					)
					.end((err, res) => {
						res.should.be.an('object')
						let { status, result } = res.body
						status.should.equals(200)
						result.should.be.an('array').that.lengthOf(2)
						done()
					})
			})

			it('TC-202-5 Show users for isActive=true /api/user', (done) => {
				chai.request(server)
					.get('/api/user?isActive=true')
					.set(
						'authorization',
						'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
					)
					.end((err, res) => {
						res.should.be.an('object')
						let { status, result } = res.body
						status.should.equals(200)
						result.should.be.an('array').that.lengthOf(2)
						done()
					})
			})

			it('TC-202-6 Show users for name=first /api/user', (done) => {
				chai.request(server)
					.get('/api/user?firstName=first')
					.set(
						'authorization',
						'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
					)
					.end((err, res) => {
						res.should.be.an('object')
						let { status, result } = res.body
						status.should.equals(200)
						result.should.be.an('array').that.lengthOf(1)
						done()
					})
			})
		})
	})

	beforeEach((done) => {
		describe('UC-203 Get User Profile /api/user', () => {
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
		})

		it('TC-203-1 Invalid token /api/user/profile', (done) => {
			chai.request(server)
				.get('/api/user/profile')
				.set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, 'a'))
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(401)
					message.should.be.a('string').that.equals('Not authorized')
					done()
				})
		})

		it('TC-203-2 Valid token and valid profile /api/user/profile', (done) => {
			chai.request(server)
				.get('/api/user/profile')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.send({})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, result } = res.body
					status.should.equals(200)
					assert.deepEqual(result, {
						city: 'Breda',
						emailAdress: 'name@email.nl',
						lastName: 'last',
						id: 1,
						firstName: 'first',
						isActive: 1,
						phoneNumber: '0123456789',
						password: 'Password1!',
						roles: 'editor,guest',
						street: 'street',
					})
					done()
				})
		})
	})

	beforeEach((done) => {
		describe('UC-204 Get User Details /api/user/?:id', () => {
			logger.debug('beforeEach called')
			// maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err // not connected!

				// Use the connection
				connection.query(
					CLEAR_DB + INSERT_USER,
					function (error, results, fields) {
						// When done with the connection, release it.
						connection.release()

						// Handle error after the release.
						if (error) throw error
						// Let op dat je done() pas aanroept als de query callback eindigt!
						logger.debug('beforeEach done')
						done()
					}
				)
			})
		})

		it('TC-204-1 Invalid token /api/user', (done) => {
			chai.request(server)
				.get('/api/user/1')
				.set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, 'a'))
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(401)
					message.should.be.a('string').that.equals('Not authorized')
					done()
				})
		})

		it('TC-204-2 Invalid userId /api/user', (done) => {
			chai.request(server)
				.get('/api/user/2')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(404)
					message.should.be
						.a('string')
						.that.equals('User with ID 2 not found')
					done()
				})
		})

		it('TC-204-3 Valid userId, get one user back /api/user', (done) => {
			chai.request(server)
				.get('/api/user/1')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.end((err, res) => {
					res.should.be.an('object')
					let { status, result } = res.body
					status.should.equals(200)
					assert.deepEqual(result, {
						id: 1,
						firstName: 'first',
						lastName: 'last',
						isActive: 1,
						emailAdress: 'name@email.nl',
						password: 'Password1!',
						phoneNumber: '0123456789',
						roles: 'editor,guest',
						street: 'street',
						city: 'city',
					})
					done()
				})
		})
	})

	beforeEach((done) => {
		describe('UC-205 Edit User Details /api/user', () => {
			logger.debug('beforeEach called')
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err
				connection.query(
					CLEAR_DB + INSERT_USER,
					function (error, results, fields) {
						connection.release()
						if (error) throw error
						logger.debug('beforeEach done')
						done()
					}
				)
			})
		})

		it('TC-205-1 Email missing /api/user', (done) => {
			chai.request(server)
				.put('/api/user/1')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.send({
					firstName: 'first',
					lastName: 'last',
					isActive: 1,
					password: 'Password1!',
					phoneNumber: '0123456789',
					roles: 'editor,guest',
					street: 'street',
					city: 'city',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(400)
					message.should.be
						.a('string')
						.that.equals('emailAdress cannot be null!')
					done()
				})
		})

		it('TC-205-3 Invalid phoneNumber /api/user', (done) => {
			chai.request(server)
				.put('/api/user/1')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.send({
					firstName: 'first',
					lastName: 'last',
					isActive: 1,
					emailAdress: 'name@email.com',
					password: 'Password1!',
					phoneNumber: '123',
					roles: 'editor,guest',
					street: 'street',
					city: 'city',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(400)
					message.should.be
						.a('string')
						.that.equals('Phonenumber must have 10 digits')
					done()
				})
		})

		it('TC-205-4 User does not exist /api/user', (done) => {
			chai.request(server)
				.put('/api/user/2')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.send({
					firstName: 'first',
					lastName: 'last',
					isActive: 1,
					emailAdress: 'name@email.com',
					password: 'Password0!',
					phoneNumber: '0123456789',
					roles: 'editor,guest',
					street: 'street',
					city: 'city',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(400)
					message.should.be
						.a('string')
						.that.equals(
							'Update failed, user with ID 2 does not exist'
						)
					done()
				})
		})

		it('TC-205-5 User not signed in /api/user', (done) => {
			chai.request(server)
				.put('/api/user/1')
				.set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, 'a'))
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(401)
					message.should.be.a('string').that.equals('Not authorized')
					done()
				})
		})

		it('TC-205-6 User succesfully edited /api/user', (done) => {
			chai.request(server)
				.put('/api/user/1')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.send({
					firstName: 'first',
					lastName: 'last',
					isActive: 1,
					emailAdress: 'name@email.com',
					password: 'Password1!',
					phoneNumber: '0123456789',
					roles: 'editor,guest',
					street: 'street',
					city: 'city',
				})
				.end((err, res) => {
					res.should.be.an('object')
					let { status, result } = res.body
					status.should.equals(200)
					assert.deepEqual(result, {
						id: 1,
						firstName: 'first1',
						lastName: 'last1',
						isActive: 1,
						emailAdress: 'name@email.com',
						password: 'Password2!',
						phoneNumber: '1123456789',
						roles: 'editor,guest',
						street: 'street1',
						city: 'city1',
					})
					done()
				})
		})
	})

	beforeEach((done) => {
		describe('UC-206 Delete User', () => {
			logger.debug('beforeEach called')
			dbconnection.getConnection(function (err, connection) {
				if (err) throw err
				connection.query(
					'ALTER TABLE user AUTO_INCREMENT = 1',
					function (error, result, fields) {
						connection.query(
							CLEAR_DB +
							INSERT_USER +
							INSERT_USER2 +
							INSERT_USER3,
							function (error, results, fields) {
								connection.release()
								if (error) throw error
								logger.debug('beforeEach done')
								done()
							}
						)
					}
				)
			})
		})

		it('TC-206-1 User does not exist /api/user', (done) => {
			chai.request(server)
				.delete('/api/user/999')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 3 }, jwtSecretKey)
				)
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(400)
					message.should.be
						.a('string')
						.that.equals('User does not exist')
					done()
				})
		})

		it('TC-206-2 Not logged in /api/user', (done) => {
			chai.request(server)
				.delete('/api/user/1')
				.set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, 'a'))
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(401)
					message.should.be.a('string').that.equals('Not authorized')
					done()
				})
		})

		it('TC-206-3 Actor is not owner /api/user', (done) => {
			chai.request(server)
				.delete('/api/user/3')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
				)
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(403)
					message.should.be
						.a('string')
						.that.equals('User is not the owner')
					done()
				})
		})

		it('TC-206-4 User deleted succesfully /api/user', (done) => {
			chai.request(server)
				.delete('/api/user/1')
				.set(
					'authorization',
					'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
				)
				.end((err, res) => {
					res.should.be.an('object')
					let { status, message } = res.body
					status.should.equals(200)
					message.should.be
						.a('string')
						.that.equals('User with ID 1 deleted successfuly!')
					done()
				})
		})
	})
})