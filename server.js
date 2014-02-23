//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081);

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
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
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
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
server.get('/', function(req,res){
  res.render('index.jade', {
    "title" : "Gestion des candidatures",
    "applications" : applications
  });
});

server.post('/rest/application', newApplication);

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
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
