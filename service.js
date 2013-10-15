var express = require('express')
	http = require('http')
	url  = require('url')
	log4js = require('log4js')
	app = express()
	appPort = 3000;

app.use(express.bodyParser());

log4js.configure({
	appenders: [
		{ type: 'console' },
		{ type: 'file', filename: 'logs/rest.log', category: 'log4jslog' }
	]
});

//define logger
var logger = log4js.getLogger('log4jslog');

//express app
app.configure(function() {
	app.use(express.favicon(''));
	// app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO }));
	// app.use(log4js.connectLogger(logger, { level: 'auto', format: ':method :url :status' }));

	//### AUTO LEVEL DETECTION
	//http responses 3xx, level = WARN
	//http responses 4xx & 5xx, level = ERROR
	//else.level = INFO
	app.use(log4js.connectLogger(logger, { level: 'auto' , format: ' Type::method URL::url  Status::status Body::body  Headers::headers' }));
});

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Crazy Access, Content-Type");
    next();
});

function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}

function getUrl(req){
    var url_parts = url.parse(req.url,true);
    return req.protocol + '://' + req.host +':' + appPort + url_parts.path;
}

app.use(app.router);

app.use(function(err, req, res, next){
  // whatever you want here, feel free to populate
  // properties on `err` to treat it differently in here.
  res.send(err.status || 500, { error: err.message });
});

app.use(function(req, res){
  res.send(404, { error: "Lame, can't find that" });
});

app.get('/', function(req, res){
  res.send('hello world');
});

app.get('/endpoint*', function(req, res){
  res.send(getUrl(req));
});

app.post('/endpoint*', function(req, res){
    res.writeHead(200, { 'Content-Type': 'application/json' });
	var body = JSON.stringify(req.body);
	var defaultResponse = { success : true};
	res.write(JSON.stringify(defaultResponse));
	//console.log(getUrl(req));
	//console.log('headers: ' + JSON.stringify(req.headers));
    //console.log('body: ' + JSON.stringify(req.body));
    res.end();
});

var server = http.createServer(app).listen(appPort, function(){
 console.log("server listening on port " + appPort);
});
