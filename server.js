//setup Dependencies
express = require('express')
//Setup Express
var app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    port = Number(process.env.PORT || 5000)

server.listen(port)

//Global variables
applications = {
    "0" : {id:0, date : "01/02/2014", company:"ATOS", description:"chez ATOS", nbInterviews : 0, status:"open"},
    "1" : {id:1, date : "01/02/2014", company:"IBM", description:"chez IBM", nbInterviews : 1, status:"open"},
    "2" : {id:2, date : "02/02/2014", company:"Google", description:"chez Google", nbInterviews : 0, status:"open"},
    "3" : {id:3, date : "03/02/2014", company:"Facebook", description:"chez Facebook", nbInterviews : 0, status:"open"}
}
nbApplications = 4;

user = {"name" : "Fabien Hermenier", "email" : "fabien.hermenier@unice.fr", major : "AL"};

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

app.get('/', function(req,res){
  res.render('student_dashboard.jade', {
    "title" : "Gestion des candidatures",
    "applications" : applications,
    "user" : user
  });
});

app.post('/rest/applications', newApplication);
app.put('/rest/applications/:applicationId/interviews', addInterview);
app.put('/rest/applications/:applicationId/status', setStatus);
app.get('/rest/applications', getApplications)
app.get('/rest/applications/:id', getApplication)


function getApplications(req, res) {
    res.set("Content-type", "text/json");
    res.send(200, applications)
}

function getApplication(req, res) {
    appId = req.params.applicationId
    if (applications.hasOwnProperty(appId)) {
        res.set("Content-type", "text/json")
        res.send(applications[appId])
    } else {
        res.send(404, "Unknown application '" + appId + "'")
    }

}

function newApplication(req, res) {
    company = req.body.hasOwnProperty("company") ? req.body.company : "";
    description = req.body.hasOwnProperty("description") ? req.body.description : "";
    date = req.body.hasOwnProperty("date") ? req.body.date : "";
    if (company.length == 0 || description.length == 0 || date.length == 0) {
        return res.send(400, "Missing parameters");
    } else {
        var id = nbApplications++;
        console.log("id=" + id)
        app = {"id" : id, date : date, company : company, description : description, nbInterviews: 0, status : "open"}
        console.log(JSON.stringify(app))
        applications[id] = app
        res.location("rest/applications/" + id)
        res.send(201, app)
    }
}

function addInterview(req, res) {
    appId = req.params.applicationId
    if (applications.hasOwnProperty(appId)) {
        applications[appId].nbInterviews++;
        console.log("Update nb of interviews for " + appId + " to " + applications[appId].nbInterviews)
        res.send(""+applications[appId].nbInterviews)
    } else {
        res.send(404, "Unknown application '" + appId + "'")
    }
}

function setStatus(req, res) {
    appId = req.params.applicationId;
    status = req.body.hasOwnProperty("status") ? req.body.status : "";
    console.log("Update status of " + appId + " to " + status)
    if (applications.hasOwnProperty(appId)) {
        if (status == "denied" || status == "granted" || status == "open") {
            applications[appId].status = status;
            res.send(200, status)
        } else {
            res.send(400, "Unsupported status '" + status + "'")
        }
    } else {
        res.send(404, "Unknown application '" + appId + "'")
    }
}

app.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

app.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
