const bodyParser = require("body-parser");
const uuid = require("node-uuid");
const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");

const port = process.env.PORT || 3030;

var app = express();
app.use(cookieParser());

var tickets = {};
var cookies = {};

app.get("/cas/login", function(req, res) {
  if (req.cookies["fake-cas"] && cookies[req.cookies["fake-cas"]]) {
    if (req.query.service) {
      var ticket = "ST-" + uuid.v1() + `-user=${cookies[req.cookies["fake-cas"]]}`;
      tickets[ticket] = cookies[req.cookies["fake-cas"]];
      res.writeHead(302, {
        Location: `${req.query.service}?ticket=${ticket}`
      });
      res.end();
    } else {
      res.sendFile(process.cwd() + "/already.html");
    }
  } else {
    res.sendFile(process.cwd() + "/form.html");
  }
});

app.post("/cas/login", bodyParser.urlencoded(), function(req, res) {
  var cookie = uuid.v1();
  cookies[cookie] = req.body.login;
  res.cookie("fake-cas", cookie);
  if (req.query.service) {
    var ticket = "ST-" + uuid.v1() + `-user=${cookies[req.cookies["fake-cas"]]}`;
    tickets[ticket] = req.body.login;
    res.writeHead(302, {
      Location: `${req.query.service}?ticket=${ticket}`
    });
    res.end();
  } else {
    res.sendFile(process.cwd() + "/already.html");
  }
});

app.use("/cas/logout", function(req, res) {
  if (req.cookies["fake-cas"] && cookies[req.cookies["fake-cas"]]) {
    delete cookies[req.cookies["fake-cas"]];
  }
  res.cookie("fake-cas", "");
  res.writeHead(302, {
    Location: "/cas/login"
  });
  res.end();
});

app.use("/cas/samlValidate", function(req, res) {
  console.log('samlValidate',req.method,req.originalUrl,req.query,req.body);
  if (tickets[req.query.ticket]) {
    res.send(`yes\n${tickets[req.query.ticket]}`);
    delete tickets[req.query.ticket];
  } else {
    res.send(`<Envelope>
    <NameIdentifier>~laravel</NameIdentifier>
</Envelope>
`);
  }
  res.end();
});

app.get('/cookies', (req,res)=>{
  res.json({
    tickets,
    cookies
  })
})

const server2 = http.createServer(app).listen(port, () => {
  console.log("server running at " + port);
});
