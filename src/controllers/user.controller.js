const assert = require('assert')
const { title } = require('process')
const logger = require('../config/config').logger

// let database = require('../../database/inmemdb')
let database = []
const dbconnection = require('../../database/dbconnection')
let id = 0

let controller = {

    validateUser:(req, res, next)=>{
        let user = req.body;
        let{firstName, lastName, email, password} = user;

        try{
            assert(typeof firstName === 'string', 'firstName must be a string!');
            assert(typeof lastName === 'string', 'lastName must be a string!');
            assert(typeof email === 'string', 'email must be a string!');
            assert(typeof password === 'string', 'password must be a string!');
            next();
        }catch(error){
            const err = {
                status: 406,
                result: error.message,
            }
            logger.error(error);
            next(err);
        }
    },

    addUser:(req, res)=>{
        let user = req.body;
        logger.info(user);
        let email = user.email;
        if (email == undefined) {
          res.status(400).json({
            status: 400,
            result: "No email inserted.",
          });
        } else {
              let userArray = database.filter((item) => item.email == email);
              if (userArray.length > 0) {
                res.status(401).json({
                    status: 401,
                    result: `There allready is a user with email:  ${email}`,
            });
          } else {
            user = {
              id,
              ...user,
            };
            id++;



            database.push(user);
            logger.debug(database);
            res.status(201).json({
              status: 201,
              result: `User with email: ${email} was added.`,
            });
          }
        }
    },

    getAllUsers:(req, res)=>{
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query('SELECT name, id FROM meal', function (error, results, fields) {
              // When done with the connection, release it.
              connection.release();
           
              // Handle error after the release.
              if (error) throw error;
           
              // Don't use the connection here, it has been returned to the dbconnection.
              logger.debug('result = ', results)
        
              res.status(200).json({
                  statusCode: 200,
                  results: results
              })
            });
        });
    },

    getUserById:(req, res, next)=>{
        const userId = req.params.userId;
        let user = database.filter((item) => (item.id == userId));
        if(user.length > 0) {
            logger.debug(user);
            res.status(200).json({
                status: 200,
                result: user,
            })
        }else{
            const error={
                status: 404,
                result: `User with ID ${userId} not found`,
            };
            next(error);
        }

    },

    registerProfile:(req, res)=>{
        res.status(503).json({
          status: 503,
          result: "This feature has not been implemented yet.",
        });
    },

    updateUser:(req, res)=>{
        const id = req.params.id;
        let userArray = database.filter((item) => item.id == id);
        if (userArray.length > 0) {
            logger.debug(userArray);
            let user = req.body;
            user = {
                id,
                ...user,
              };
                database[database.indexOf(userArray[0])] = user;
                res.status(201).json({
                status: 201,
                result: `User with id ${id} had been updated.`,
            });
        } else {
              res.status(404).json({
                status: 404,
                result: `User with id ${id} not found`,
              });
        }
    },

    deleteUser:(req, res)=>{
        const userId = req.params.userId;
        let userArray = database.filter((item) => item.id == userId);
        if (userArray.length > 0) {
            logger.debug(userArray);
            database.splice(database.indexOf(userArray[0]), 1);
            res.status(201).json({
                status: 201,
                result: `User with id ${userId} was deleted.`,
            });
        } else {
            res.status(404).json({
                status: 404,
                result: `User with id ${userId} not found`,
            });
        }
    },

}

module.exports = controller;