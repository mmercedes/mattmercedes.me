
/* SERVER STATE GLOBALS */
var ip = process.env.OPENSHIFT_NODEJS_IP;
var port = parseInt(process.env.OPENSHIFT_NODEJS_PORT) || 8080;
var fs = require('fs');
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);


var cache = {};
cache['home.html'] = fs.readFileSync('home.html');
cache['resume.html'] = fs.readFileSync('resume.html');
cache['home.css'] = fs.readFileSync('home.css');
cache['resume.css'] = fs.readFileSync('resume.css');


if (typeof ip === "undefined") {
    console.warn('No OPENSHIFT_NODEJS_IP var, using localhost');
    ip = "localhost";
};

server.listen(port, ip, function (){
    console.log("\n STARTED SERVER ON PORT " + port + "\n");
});

app.get( '/', function( req, res ){
    res.sendfile('home.html');
});

app.get( '/*' , function( req, res, next ) {
    //This is the current file they have requested
	var file = req.params[0];

    if(file in cache){
        res.setHeader('Content-Type', 'text/html');
        res.send(cache[file]);
    }
    else {
        res.sendfile( __dirname + '/' + file );
    }
});
