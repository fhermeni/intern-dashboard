//setup Dependencies
express = require('express')
//Setup Express
var app = express(),
    http = require('http'),
    server = http.createServer(app),
    port = Number(process.env.PORT || 5000),
    backend = require('./applications.js'),
    templatizer = require('templatizer')

console.log("Compiling client templates")
templatizer(__dirname + '/views', __dirname + '/static/js/templates.js');
server.listen(port)

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view options', { layout: false });
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: "shhhhhhhhh!"}));
    app.use(express.static(__dirname + '/static'));
    app.use(app.router);
    app.use(express.errorHandler());
    app.locals.pretty = true;
});

//setup the errors
app.use(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

app.get('/', getDashboard)
app.post('/users/:user/', newApplication);
app.put('/users/:user/:appId/interviews', addInterview);
app.put('/users/:user/:appId/status', setStatus);
app.get('/users/:user/', getApplications)
app.get('/applications/', getAllApplications)
app.get('/users/', getAllUsers)
app.put('/users/:user/:appId', updateApplication)
app.post('/login', login)
app.post('/logout', logout)

function getDashboard(req, res) {
    if (!req.session["user"]) {
        console.log("not-logged user")
        res.redirect("/login.html");
    } else {
        console.log(req.session.user["login"] + " already logged in")
        if (req.session.isAdmin) {
            console.log("Redirection to the administrator dashboard")
            res.redirect("/admin-dashboard.html");
        } else {
            console.log("Redirection to the student dashboard")
            res.redirect("/student-dashboard.html");
        }
    }
}
function login(req, res) {
    backend.isRegistered(req.body.login, req.body.password, function(err, user) {
        if (err) {
            res.send(403, err.message)
            console.log("Access denied for " + req.body.login + ": " + err.message)
        } else {
            req.session["user"] = user
            console.log(user.login + " logged in ")
            res.send({id : user.id, email : user.login, major: user.major})
        }
    })
}

function logout(req, res) {
    if (req.session["user"]) {
        //will be req.session.destroy()
        req.session = null
    }
    res.redirect("/")
}
function getApplications(req, res) {
    backend.getApplications(req.params.user, function(err, apps) {
        if (err) {
            res.send(400, err.message)
        } else {
            res.set("Content-type", "text/json")
            res.send(200, apps)
        }
    })
}

function getAllApplications(req, res) {
    backend.getAllApplications(function(err, apps) {
        if (err) {
            res.send(400, err.message)
        } else {
            res.set("Content-type", "text/json")
            res.send(200, apps)
        }
    })
}

function getAllUsers(req, res) {
    backend.getAllUsers(function(err, users) {
        if (err) {
            res.send(400, err.message)
        } else {
            res.set("Content-type", "text/json")
            res.send(200, users)
        }
    })
}

function updateApplication(req, res) {
    backend.updateApplication(req.params.user, req.params.appId, req.body, function(err) {
        if (err) {
            res.send(400, err.message)
        } else {
            res.send(204)
        }
    })
}

function newApplication(req, res) {
    backend.newApplication(req.params.user, req.body.date, req.body.company, req.body.note,
    function (err, app) {
        if (err) {
            res.send(400, err.message)
        } else {
            res.location("rest/users/" + req.params.user + "/" + app.id)
            res.set("Content-type", "text/json")
            res.send(201, app)
        }
    });
}

function addInterview(req, res) {
    backend.incInterview(req.params.user, req.params.appId, function (err, nb) {
        if (err) {
            res.send(400, err.message)
        } else {
            res.send(200, ""+nb)
        }
    })
}

function setStatus(req, res) {
    backend.setStatus(req.params.user, req.params.appId, req.body.status, function (err, nb) {
        if (err) {
            res.send(400, err.message)
        } else {
            res.send(204)
        }
    })
}

app.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

app.get('/*', function(req, res){
    throw new NotFound(req);
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}

//Sample workload
for (var i = 1; i < 100; i++) {
    m = "CSSR"
    if (i%5 == 0) {
        m = "IHM"
    } else if (i%3 == 0) {
        m = "IHM"
    }else if (i%2 == 0) {
        m = "ALD"
    }
    var u = backend.newUser("User " + i, "u-" + i + "@unice.fr", "p" + i, m)
    for (var j = 0; j < 20; j++) {
        backend.newApplication(u.id, (j + 1) + "/02/2014", "company-" + j, "sample note from user u-" + u.id + " about application " + j, function(err, app){
            if (i % 7 == 0 && j == 17) { //Some granted
                backend.setStatus(u.id, app.id, "granted", function(err) {if (err) {console.log(err.message)}})
            } else if (i % 5 == 0 && j % 3 == 0) {
                backend.incInterview(u.id, app.id, function(err) {if (err) {console.log(err.message)}})
                if (j == 3) {
                    backend.setStatus(u.id, app.id, "denied", function(err) {if (err) {console.log(err.message)}})
                }
            }
        })
    }

}

console.log('Listening on http://0.0.0.0:' + port );
