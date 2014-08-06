var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;

var host = process.env.OPENSHIFT_MONGODB_DB_HOST;
var port = process.env.OPENSHIFT_MONGODB_DB_PORT;

var header = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Matt Mercedes\' Blog"><meta name="author" content="Matt Mercedes"><link rel="icon" href="../../favicon.ico"><title>Matt Mercedes</title></head><body>';
var footer = '</body></html>';


Blog = function(user, pass){
    this.openError = true;

    this.db = new Db('home', new Server(host, port, {auto_reconnect: true, socketOptions:{keepAlive: 1}}, {}));
    this.db.open(function(error){
        this.db.authenticate(user, pass, {}, function(error, result){
            if(error) this.openError = error;
            else this.openError = false;
        });
    });
};


Blog.prototype.getCollection = function(callback){
    console.log("calling db.collection");
    this.db.collection('posts', function(error, collection){
        console.log("returned from db.collection : "+error+" "+(collection != null));
        if(error) callback(error);
        else callback(null, collection);
    });
};

Blog.prototype.findAll = function(callback){
    console.log("calling getColllection");
    this.getCollection(function(error, collection){
        if(error) callback(error);
        else {
            console.log("OE: "+this.openError);
            collection.find().toArray(function(error, results){
                console.log("findAll results :"+results);
                if(error) callback(error);
                else callback(null, results);
            });
        }
    });
};

Blog.prototype.findByUrl = function(url, callback){
    this.getCollection(function(error, collection){
        if( error ) callback(error);
        else {
            collection.findOne({url: url}, function(error, result){
                if(error) callback(error);
                else callback(null, result);
            });
        }
    });
};

Blog.prototype.addPost = function(post, callback){
    this.getCollection(function(error, collection){
        if(error) callback(error);
        else {
            post.created = new Date();
            post.comments = [];
            collection.insert(post, function(){
                callback(null);
            });
        }
    });
};

Blog.prototype.getPage = function(offset, callback){
    console.log(host);
    console.log("calling findAll");
    this.findAll(function(error, results){
            if(error) callback(error);
            else {
                callback(null, header+results.title+results.body+footer);
            }
    });
};

exports.Blog = Blog;
