const https = require('https')
const app = require('./app')
const fs = require('fs')

const port = process.env.PORT || 3030

const httpsOptions = {
  key: fs.readFileSync('./privatekey.pem'),
  cert: fs.readFileSync('./certificate.pem')
}

const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('https server running at ' + port)
})
