var express = require("express"),
    hbs = require('hbs'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    auth = require('http-auth'),
    basic = auth({ authRealm : 'admin', authList : ['testu:{SHA}MEH0hUYamKWrgKNL+3jcYmbJlPo='] }),
    moment = require('moment'),
    nodemailer = require('nodemailer'),
    http = require('http'),
    mailgun = require('mailgun-js')('key-6fdc0icgerlje98n0hndwz41dhoff183', 'martinben.mailgun.org'),
    fs = require('fs');

var app = express();
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', __dirname);
app.use(express.bodyParser());

// Database
mongoose.connect('mongodb://localhost/martinben');

var Post = mongoose.model('Post', new mongoose.Schema({
	title: String,
	body: String,
	date: Date
}));

// Routing



app.get('/admin/delete', function(req, res) {
	if (req.query.post_id) {
		Post.findById(req.query.post_id).remove();
		res.redirect('/admin');
	} else {
		res.send('No post_id specified.')
	}
});
	
app.get('/partials/_posts.html', function(req, res) {

	Post.find(function(err, data) {

		var postIncrement = 1;
	
		var html = "";
		
		html += "<h5>The blogging home of Objective-Ben.<br />Writing the solutions I wish I had while learning iOS.</h5>"
		for (var i = data.length-1; i >= 0; i--) {
		
			html += '<a href="/blog/' + data[i].title.replace(/\s/g, "-")  + '" class="blog-post-title"><article><h3>' + data[i].title + '</h3></a> <h4>' + moment(data[i].date).format('dddd, MMMM Do, YYYY') + "</h4><section>" + data[i].body.split("</p>")[0] + '</p></section></article>';
			
			postIncrement++;
		}	
		
		postIncrement = 1;
		
		res.send(html)
	});
});


app.get('/blog/:name', function(req,res) {
	
	if (req.params.name.indexOf("-navigation-true") != -1) {
	
		var newString = req.params.name.replace("-navigation-true", "");
	
		var title = newString.replace(/-/g, " ");
		
		Post.findOne({ 'title': title }, function(err, doc) {
			
			var html;
		
			html = '<article><h3>' + doc.title + '</h3></a> <h4>' + moment(doc.date).format('dddd, MMMM Do, YYYY') + "</h4><section>" + doc.body + '</section></article>';
	
			res.send(html);
			
		});
	}
	
	else {
	
		var newString = req.params.name.replace("-navigation-true", "");
	
		var title = newString.replace(/-/g, " ");
		
		Post.findOne({ 'title': title }, function(err, doc) {
			
			var html;
		
			html = '<article><h3>' + doc.title + '</h3></a> <h4>' + moment(doc.date).format('dddd, MMMM Do, YYYY') + "</h4><section>" + doc.body + '</section></article>';
	
			res.render('public_html/index.html', {partial: html});
			
		});
		
	}
	
});




app.get('/admin', function(req, res) {

	basic.apply(req, res, function(username){
		
		Post.find(function(err, data) {
		
			res.render('public_html/admin.html', { posts:data, layout: none});
			
		});

	});
	
});




app.post('/insert', function(req, res) {
	var post = new Post({ title: req.body.title, body: req.body.body, date: new Date() });
	post.save(function (err) {
	  if (err) {
	    console.log('error saving post');
	  } else {
	    console.log('saved post!');
		  res.redirect('/admin')
	  }
	});
});

app.post('/mail', function(req, res) {

	console.log(req.body);

	var data = {
	  from: req.body.email,
	  to: 'ben@martinben.com',
	  subject: req.body.subject,
	  text: req.body.body
	};
	
	mailgun.messages.send(data, function (error, response, body) {
		console.log(body);
		res.end();
	});
		
});

app.get('/admin/edit', function(req, res) {


	Post.findById(req.query.post_id, function(err, doc){
	
		res.render('public_html/edit.html', {post: doc, layout: none });
		
	});
	
	console.log('\n\n\n');
	
	console.log(Post.findById(req.query.post_id));

	/*
Post.find(function(err, data) {
		
		
		
		console.log(data[0].title);
			
	
	});
*/
	
/* 	console.log(Post.findById(req.query.post_id)); */
	
	
});

app.post('/admin/edit', function(req, res) {

	Post.findById(req.query.post_id).update({body:req.body.body});	
	
	/* Did not work:
Post.findById(req.query.post_id, function(err, doc){
	
		doc.update({body:req.body.body});
	
	});
*/
	
	res.redirect('/admin');	

});

app.get('/mail', function(req, res) {

	res.redirect('https://s17-dallas.accountservergroup.com:2096');
	
});


function getFile(req, res) {

	
	
	if (req.params.something == 'blog') {
		Post.find(function(err, data) {

		var postIncrement = 1;
	
		var html = "";
		
		html += "<h5>The blogging home of Objective-Ben.<br />Writing the solutions I wish I had while learning iOS.</h5>"
		for (var i = data.length-1; i >= 0; i--) {
		
			html += '<a href="/blog/' + data[i].title.replace(/\s/g, "-")  + '" class="blog-post-title"><article><h3>' + data[i].title + '</h3></a> <h4>' + moment(data[i].date).format('dddd, MMMM Do, YYYY') + "</h4><section>" + data[i].body.split("</p>")[0] + '</p></section></article>';
			
			postIncrement++;
		}	
		
		postIncrement = 1;
		
		res.render('public_html/index.html', {partial: html})
	})
		
	} else {
	
		if (req.params.something == undefined) req.params.something = 'home'
	
		fs.readFile("public_html/partials/_" + req.params.something + ".html", function read(err, data) {
		
		    if (err) {
		        res.send(data);
		    } 
		    
		    else {
			    var content = data.toString();
			    res.render("public_html/index.html", {partial: content})
		    }
		
		});	
	}
}


app.get('/', getFile);

app.get('/:something', getFile);





// Run
app.listen(3000);
console.log("Yes, I'm listening on port 3000.");
app.use(express.static(__dirname + "/public_html"));