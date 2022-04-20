const http = require('http')

const express = require('express')
const app = express()
const hostname = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain')
  res.end('Hello World\n')
})

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})



// app.METHOD(PATH, HANDLER);

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.post('/', (req, res) => {
//   res.send('Got a POST request')
// })

// app.put('/user', (req, res) => {
//   res.send('Got a PUT request at /user')
// })

// app.delete('/user', (req, res) => {
//   res.send('Got a DELETE request at /user')
// })

// app.use((req, res, next) => {
//   res.status(404).send("Sorry can't find that!")
// })

// app.use((req, res, next) => {
//   res.status(404).send("Sorry can't find that!")
// })

// app.use((err, req, res, next) => {
//   console.error(err.stack)
//   res.status(500).send('Something broke!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })