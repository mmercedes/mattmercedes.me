
/* SERVER STATE GLOBALS */
var ip = process.env.OPENSHIFT_NODEJS_IP;
var port = parseInt(process.env.OPENSHIFT_NODEJS_PORT) || 8080;
var fs = require('fs');
var express = require('express');
var http = require('http');
var Blog = require('./blog/blog').Blog;
var app = express();
var server = http.createServer(app);


var cache = {};
var cacheSize = 0;
var MAX_CACHE_SIZE = 2000 * 1000;

function cache_add(path, fileName, contentType){
    var stats = fs.statSync(path+fileName);
    var size = stats["size"] / 1000; // convert bytes to kb
    var obj = {};

    if(cacheSize + size > MAX_CACHE_SIZE){
        console.log("CACHE_FULL");
        return 1;
    }
    obj.file = fs.readFileSync(path+fileName);
    obj.type = contentType;

    cache[fileName] = obj;
    cacheSize += size;

    console.log("CACHED: "+fileName);
    console.log("SIZE: "+size+"kb TOTAL: "+cacheSize+"kb\n");
    return 0;
}

cache_add("", "home.html", "text/html");
cache_add("home/", "resume.html", "text/html");
cache_add("home/", "projects.html", "text/html");
cache_add("home/", "css/home.css", "text/css");
cache_add("home/", "css/resume.css", "text/css");
cache_add("home/", "css/noisy_net.png", "image/png");
cache_add("home/", "bootstrap/js/bootstrap.min.js", "application/javascript");
cache_add("home/", "bootstrap/css/bootstrap.min.css", "text/css");


if (typeof ip === "undefined") {
    console.warn('No OPENSHIFT_NODEJS_IP var, using localhost');
    ip = "localhost";
};

server.listen(port, ip, function (){
    console.log("\n STARTED SERVER ON PORT " + port + "\n");
});


blog = new Blog();


app.get( '/', function( req, res ){
    res.set('Content-Type', 'text/html');
    res.send(cache['home.html'].file);
});

app.get( '/home/*' , function( req, res, next ) {
    //This is the current file they have requested
	var file = req.params[0];

    console.log(file);

    if(file in cache){
        res.set('Content-Type', cache[file].type);
        res.send(cache[file].file);
    }
    else {
        res.sendfile( __dirname +'/home/'+ file , function(err){
            res.sendfile('home/404.html');
        });
    }
});

app.get('/blog/*', function(req, res, next){
    res.set('Content-Type', 'text/html');
    res.send(blog.getPage());
});


/* test comment */
