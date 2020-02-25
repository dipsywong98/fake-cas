const express = require('express')
const xmlparser = require('express-xml-bodyparser');
const uuid = require('node-uuid')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const URL = require('url').URL

const app = express()
app.use(xmlparser());
app.use(cookieParser())

const tickets = {}
const cookies = {}

app.get('/cas/login', function (req, res) {
  let cookie = req.cookies['fake-cas']
  console.log('get login', cookie, cookie && cookies[cookie], req.query.service)
  if (cookie && cookies[cookie]) {
    if (req.query.service) {
      const ticket = 'ST-' + uuid.v1()
      tickets[ticket] = cookies[cookie]
      const url = new URL(req.query.service)
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
  const cookie = uuid.v1()
  cookies[cookie] = req.body.login
  console.log('post login', cookie, cookie && cookies[cookie], req.query.service)
  res.cookie('fake-cas', cookie)
  if (req.query.service) {
    const ticket = 'ST-' + uuid.v1()
    tickets[ticket] = req.body.login
    const url = new URL(req.query.service)
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
  res.sendFile(process.cwd() + '/logout.html')
})

app.post('/cas/samlValidate*', function (req, res) {
  let cookie = req.cookies['fake-cas']
  console.log('samlValidate', req.method, req.originalUrl, req.query, req.body['soap-env:envelope']['soap-env:body'][0]['samlp:request'][0]['samlp:assertionartifact'][0])
  const ticket = req.body['soap-env:envelope']['soap-env:body'][0]['samlp:request'][0]['samlp:assertionartifact'][0]
  if (tickets[ticket]) {
    console.log('validate success', tickets[ticket])
    res.send(`
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
    <SOAP-ENV:Body>
        <saml1p:Response InResponseTo="_192.168.16.51.1024506224022" IssueInstant="2020-02-24T17:18:11.086Z"
                         MajorVersion="1" MinorVersion="1" ResponseID="_79e27dfb1c951addf75f960b21ddb1b5"
                         xmlns:saml1p="urn:oasis:names:tc:SAML:1.0:protocol">
            <saml1p:Status>
                <saml1p:StatusCode Value="saml1p:Success"/>
            </saml1p:Status>
            <saml1:Assertion AssertionID="_5b7e5ac6b02595fe8ea22767bf4fe3cb" IssueInstant="2020-02-24T17:18:11.086Z"
                             Issuer="localhost" MajorVersion="1" MinorVersion="1"
                             xmlns:saml1="urn:oasis:names:tc:SAML:1.0:assertion">
<!--                <saml1:Conditions NotBefore="2020-02-24T17:18:11.086Z" NotOnOrAfter="2020-02-24T17:18:41.086Z">-->
<!--                    <saml1:AudienceRestrictionCondition>-->
<!--                        <saml1:Audience>http://robotics-app.ust.hk/</saml1:Audience>-->
<!--                    </saml1:AudienceRestrictionCondition>-->
<!--                </saml1:Conditions>-->
                <saml1:AuthenticationStatement AuthenticationInstant="2020-02-24T17:18:15.257Z"
                                               AuthenticationMethod="urn:oasis:names:tc:SAML:1.0:am:unspecified">
                    <saml1:Subject>
                        <saml1:NameIdentifier>${tickets[ticket]}</saml1:NameIdentifier>
                        <saml1:SubjectConfirmation>
                            <saml1:ConfirmationMethod>urn:oasis:names:tc:SAML:1.0:cm:artifact</saml1:ConfirmationMethod>
                        </saml1:SubjectConfirmation>
                    </saml1:Subject>
                </saml1:AuthenticationStatement>
                <saml1:AttributeStatement>
                    <saml1:Subject>
                        <saml1:NameIdentifier>${tickets[ticket]}</saml1:NameIdentifier>
                        <saml1:SubjectConfirmation>
                            <saml1:ConfirmationMethod>urn:oasis:names:tc:SAML:1.0:cm:artifact</saml1:ConfirmationMethod>
                        </saml1:SubjectConfirmation>
                    </saml1:Subject>
                    <saml1:Attribute AttributeName="credentialType"
                                     AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>RememberMeUsernamePasswordCredential</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="samlAuthenticationStatementAuthMethod"
                                     AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>urn:oasis:names:tc:SAML:1.0:am:unspecified</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="uid" AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>${tickets[ticket]}</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="employeeType"
                                     AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>student</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="mail" AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>${tickets[ticket]}@connect.ust.hk</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="authenticationMethod"
                                     AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>LdapAuthenticationHandler</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="ou" AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>ADMIS User</saml1:AttributeValue>
                        <saml1:AttributeValue>Undergraduate</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="departmentNumber"
                                     AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>CSE</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="successfulAuthenticationHandlers"
                                     AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>LdapAuthenticationHandler</saml1:AttributeValue>
                    </saml1:Attribute>
                    <saml1:Attribute AttributeName="name" AttributeNamespace="http://www.ja-sig.org/products/cas/">
                        <saml1:AttributeValue>${tickets[ticket].toUpperCase()}, ${tickets[ticket]}</saml1:AttributeValue>
                    </saml1:Attribute>
                </saml1:AttributeStatement>
            </saml1:Assertion>
        </saml1p:Response>
    </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
`)
    delete tickets[req.query.ticket]
  } else {
    console.log('validate fail')
    res.send(`<Envelope>no</Envelope>`)
  }
  res.end()
})

module.exports = app
