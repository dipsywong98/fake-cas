const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('node-uuid')
const cookieParser = require('cookie-parser')

var app = express()
app.use(cookieParser())

var tickets = {}
var cookies = {}

app.get('/cas/login', function (req, res) {
  let cookie = req.cookies['fake-cas']
  console.log('get login', cookie, cookie && cookies[cookie], req.query.service)
  if (cookie && cookies[cookie]) {
    if (req.query.service) {
      var ticket = 'ST-' + uuid.v1()
      tickets[ticket] = cookies[cookie]
      var url = new URL(req.query.service)
      url.searchParams.append('ticket', ticket)
      res.writeHead(302, {
        Location: url.toString()
      })
      res.end()
    } else {
      res.sendFile(process.cwd() + '/already.html')
    }
  } else {
    res.sendFile(process.cwd() + '/form.html')
  }
})

app.post('/cas/login', bodyParser.urlencoded(), function (req, res) {
  var cookie = uuid.v1()
  cookies[cookie] = req.body.login
  res.cookie('fake-cas', cookie)
  if (req.query.service) {
    var ticket = 'ST-' + uuid.v1()
    tickets[ticket] = req.body.login
    var url = new URL(req.query.service)
    url.searchParams.append('ticket', ticket)
    res.writeHead(302, {
      Location: url.toString()
    })
    res.end()
  } else {
    res.sendFile(process.cwd() + '/already.html')
  }
})

app.post('/cas/logout', function (req, res) {
  let cookie = req.cookies['fake-cas']
  console.log('log out', cookie, cookie && cookies[cookie])
  if (cookie && cookies[cookie]) {
    delete cookies[cookie]
  }
  res.cookie('fake-cas', '')
  res.send('logged out')
  res.end()
})

app.post('/cas/samlValidate*', function (req, res) {
  console.log('samlValidate', req.method, req.originalUrl, req.query, req.body)
  if (tickets[req.query.ticket]) {
    res.send(`yes\n${tickets[req.query.ticket]}`)
    delete tickets[req.query.ticket]
  } else {
    res.send(`
<Envelope>
    <NameIdentifier>~laravel</NameIdentifier>
</Envelope>
`)
  }
  res.end()
})

module.exports = app
