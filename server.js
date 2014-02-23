//setup Dependencies
express = require('express')
//Setup Express
var app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server),
    port = Number(process.env.PORT || 8081)
    ;

server.listen(8081)

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

//Setup Socket.IO
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

applications = [
    {"date" : "01/02/2014", "name":"ATOS", "description":"chez ATOS"},
    {"date" : "01/02/2014", "name":"IBM", "description":"chez IBM"},
    {"date" : "02/02/2014", "name":"Google", "description":"chez Google"},
    {"date" : "03/02/2014", "name":"Facebook", "description":"chez Facebook"}
]
    app.get('/', function(req,res){
  res.render('index.jade', {
    "title" : "Gestion des candidatures",
    "applications" : applications
  });
});

app.post('/rest/application', newApplication);

function newApplication(req, res) {
    name = req.params.company
    desc = req.params.desc
    date = req.params.date
    if (name.length > 0 || desc.length == 0 || date.length == 0) {
        res.send_error("Missing parameters");
    } else {
        app = {"date" : date, "name" : name, "description" : desc}
        applications.push(app);
        res.send(app)
    }
}

//A Route for Creating a 500 Error (Useful to keep around)
app.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
