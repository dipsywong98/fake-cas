const http = require('http')
const app = require('./app')

const port = process.env.PORT || 3002

const server2 = http.createServer(app).listen(port, () => {
  console.log('http server running at ' + port)
})
