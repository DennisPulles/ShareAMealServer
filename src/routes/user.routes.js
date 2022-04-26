const express = require('express');
const router = express.Router();

let database = []
let id = 0

router.get('/', (req, res) => {
    res.status(200).json({
      status: 200,
      result: 'Hello world',
    })
})

router.post("/api/user", (req, res) => {
  let user = req.body;
  console.log(user);
  let email = user.emailAdress;
  if (email == undefined) {
    res.status(400).json({
      status: 400,
      result: "No email inserted.",
    });
  } else {
        let userArray = database.filter((item) => item.emailAdress == email);
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
      console.log(database);
      res.status(201).json({
        status: 201,
        result: `User with email: ${email} was added.`,
      });
    }
  }
});

router.get('/api/user', (req, res) => {
  res.status(200).json({
      status: 200,
      result: database,
  });
}); 

router.get('/api/user/:userId', (req, res) => {
  const userId = req.params.userId;
  let user = database.filter((item) => (item.id == userId));
  if(user.length > 0) {
      console.log(user);
      res.status(200).json({
          status: 200,
          result: user,
      })
  }else{
      res.status(404).json({
          status: 404,
          result: `User with ID ${userId} not found`,
      })
  }
  
})

router.get("/api/user/profile", (req, res) => {
  res.status(503).json({
    status: 503,
    result: "This feature has not been implemented yet.",
  });
});

router.put("/api/user/:id", (req, res) => {
  const id = req.params.id;
  let userArray = database.filter((item) => item.id == id);
  if (userArray.length > 0) {
      console.log(userArray);
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
});

router.delete("/api/user/:userId", (req, res) => {
  const userId = req.params.userId;
  let userArray = database.filter((item) => item.id == userId);
  if (userArray.length > 0) {
        console.log(userArray);
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
});

module.exports = router;