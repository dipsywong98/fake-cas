const express = require('express')
const xmlparser = require('express-xml-bodyparser');
const uuid = require('node-uuid')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

var app = express()
app.use(xmlparser());
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
  console.log('post login', cookie, cookie && cookies[cookie], req.query.service)
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

app.use('/cas/logout', function (req, res) {
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
  let cookie = req.cookies['fake-cas']
  console.log('samlValidate', req.method, req.originalUrl, req.query, req.body['soap-env:envelope']['soap-env:body'][0]['samlp:request'][0]['samlp:assertionartifact'][0])
  const ticket = req.body['soap-env:envelope']['soap-env:body'][0]['samlp:request'][0]['samlp:assertionartifact'][0]
  if (tickets[ticket]) {
    console.log('validate success', tickets[ticket])
    res.send(`
<Envelope>
    <NameIdentifier>${tickets[ticket]}</NameIdentifier>
    <Attribute AttributeName="name" AttributeNamespace="http://www.ja-sig.org/products/cas/">
      <AttributeValue>NAME, ${tickets[ticket]}</AttributeValue>
    </Attribute>
</Envelope>
`)
    delete tickets[req.query.ticket]
  } else {
    console.log('validate fail')
    res.send(`<Envelope>no</Envelope>`)
  }
  res.end()
})

app.get('/',(req,res) => {
  res.json({
    tickets,
    cookies
  })
})

module.exports = app
