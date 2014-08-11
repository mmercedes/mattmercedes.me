
/* SERVER STATE GLOBALS */
var ip = process.env.OPENSHIFT_NODEJS_IP;
var port = parseInt(process.env.OPENSHIFT_NODEJS_PORT) || 8080;
var fs = require('fs');
var express = require('express');
var http = require('http');
var Blog = require('./blog/blog').Blog;
var keys = require('./verification/keys.js').keys;
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
cache_add("", "bootstrap/js/bootstrap.min.js", "application/javascript");
cache_add("", "bootstrap/css/bootstrap.min.css", "text/css");
cache_add("blog/", "css/noisy_net.png", "image/png");
cache_add("blog/", "css/blog.css", "text/css");


if (typeof ip === "undefined") {
    console.warn('No OPENSHIFT_NODEJS_IP var, using localhost');
    ip = "localhost";
};


blog = new Blog(keys.dbUser, keys.dbPass);

server.listen(port, ip, function (){
    console.log("\n STARTED SERVER ON PORT " + port + "\n");
});

app.get('/', function(req, res ){
    res.set('Content-Type', 'text/html');
    res.send(cache['home.html'].file);
});

app.get('/404', function(req, res, next){
    res.sendfile('404.html');
})

app.get('/home/*' , function(req, res, next ){
	var file = req.params[0];

    if(file in cache){
        res.set('Content-Type', cache[file].type);
        res.send(cache[file].file);
    }
    else {
        res.sendfile( __dirname +'/home/'+ file, function(err){
            res.status(404).redirect('http://mattmercedes.me/404');
        });
    }
});

app.get('/blog', function(req, res, next){
    blog.getPage(0, function(error, page){
        res.set('Content-Type', 'text/html');
        if(error){
            console.log(error);
            res.send("error : "+error.toString());
        }
        else {
            res.send(page);
        }
    });
});

app.get('/blog/posts/:url', function(req, res, next){
    console.log(req.params.url);

    blog.getPost(req.params.url, function(error, post){
        if(error) res.status(404).redirect('http://mattmercedes.me/404');
        else {
            res.set('Content-Type', 'text/html');
            res.send(post);
        }
    });
});

app.get('/blog/*' , function(req, res, next ) {
    console.log("HERE");

    var file = req.params[0];

    if(file in cache){
        res.set('Content-Type', cache[file].type);
        res.send(cache[file].file);
    }
    else {
        res.sendfile( __dirname +'/blog/'+ file, function(err){
            res.status(404).redirect('http://mattmercedes.me/404');
        });
    }
});

app.get('/bootstrap/*', function(req, res, next){
    var file = req.params[0];

    if(file in cache){
        res.set('Content-Type', cache[file].type);
        res.send(cache[file].file);
    }
    else {
        res.sendfile( __dirname +'/bootstrap/'+ file, function(err){
            res.status(404).redirect('http://mattmercedes.me/404');
        });
    }
})

app.get('/*', function(req, res, next){
    res.status(404).redirect('http://mattmercedes.me/404');
});
