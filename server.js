
/* SERVER STATE GLOBALS */
var ip = process.env.OPENSHIFT_NODEJS_IP;
var port = parseInt(process.env.OPENSHIFT_NODEJS_PORT) || 8080;
var fs = require('fs');
var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);


var cache = {};
var cacheSize = 0;
var MAX_CACHE_SIZE = 256 * 1000000;

function cache_add(fileName, contentType){
    var stats = fs.statSync(fileName);
    var size = stats["size"] / 1000000; // convert bytes to mb
    var obj = {};

    if(cacheSize + size > MAX_CACHE_SIZE){
        console.log("CACHE_FULL");
        return 1;
    }
    obj.file = fs.readFileSync(fileName);
    obj.type = contentType;

    cache[fileName] = obj;
    cacheSize += size;

    console.log("CACHED: "+fileName);
    console.log("SIZE: "+size+"mb TOTAL: "+cacheSize+"mb");
    return 0;
}

cache_add("home.html", "text/html");
cache_add("home.css", "text/css");
cache_add("resume.html", "text/html");
cache_add("resume.css", "text/css");
cache_add("img/noisy_net.png", "image/png");

cache_add("bootstrap/js/bootstrap.min.js", "application/javascript");
cache_add("bootstrap/css/bootstrap.min.css", "text/css");


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
        res.setHeader('Content-Type', cache[file].type);
        res.send(cache[file].file);
    }
    else {
        res.sendfile( __dirname + '/' + file );
    }
});
