var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var MongoClient = require('mongodb').MongoClient
var Jade = require('jade');

var host = process.env.OPENSHIFT_MONGODB_DB_HOST;
var port = process.env.OPENSHIFT_MONGODB_DB_PORT;

var jade_posts;
var jade_post;


Blog = function(user, pass){
    var connectUrl = "mongodb://"+user+":"+pass+"@"+host+":"+port+"/home";

    MongoClient.connect(connectUrl, {native_parser:true}, function(err, db) {
        Blog.prototype.db = db;
    });

    jade_posts = Jade.compileFile('blog/posts.jade', {compileDebug: false});
    jade_post = Jade.compileFile('blog/post.jade', {compileDebug: false});
};


Blog.prototype.getCollection = function(callback){
    this.db.collection('posts', function(error, collection){
        if(error) callback(error);
        else callback(null, collection);
    });
};

Blog.prototype.findAll = function(callback){
    this.getCollection(function(error, collection){
        if(error) callback(error);
        else {
            collection.find().toArray(function(error, results){
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
    this.findAll(function(error, results){
            if(error) callback(error);
            else {
                page = jade_posts({ posts: results});

                callback(null, page);
            }
    });
};

Blog.prototype.getPost = function(url, callback){
    this.findByUrl(url, function(error, results){
            if(error){
                callback(error);
            }
            else if(results === null){
                callback("no results");
            }
            else {
                post = jade_post({post: results});
                callback(null, post);
            }
    });
};

exports.Blog = Blog;
