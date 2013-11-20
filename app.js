// Index.js default file to be used when no file specified

// Define my dependencies and other variables needed for the app.
var express 	= require("express"),
    variables 	= require(__dirname + "/variables.json"),
    hbs 		= require('hbs'),
    mongoose 	= require('mongoose'),
    Schema 		= mongoose.Schema,
    ObjectId 	= Schema.ObjectId,
    auth 		= require('http-auth');
    console.log(auth);
    basic 		= auth({ authRealm : 'admin', authList : ['testu:'+variables.adminPass] }),
    moment 		= require('moment'),
    nodemailer 	= require('nodemailer'),
    http 		= require('http'),
    mailgun 	= require('mailgun-js')(variables.mailgunPass, 'martinben.mailgun.org'),
    fs 			= require('fs');

// Set up Express app/
var app = express();
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.set('views', __dirname);
app.use(express.bodyParser());

// Connect to MongoDB with Mongoose adapter
mongoose.connect('mongodb://localhost/martinben');

var Post = mongoose.model('Post', new mongoose.Schema({
	title: String,
	body: String,
	date: Date
}));


// All routes for my app
var admin = {
	del: function(req, res) {
		if (req.query.post_id) {
			Post.findById(req.query.post_id).remove();
			res.redirect('/admin');
		} else {
			res.send('No post_id specified.')
		}
	}
}

// Delete a post from my admin panel
app.get('/admin/delete', admin.del);
	
// Display all posts when /blog is loaded
app.get('/partials/_posts.html', function(req, res) {

	Post.find(function(err, data) {

		var postIncrement = 1;
	
		var html = "";
		
		/* html += "<h5>The blogging home of Benjamin Martin.<br />Writing the solutions I wish I had while learning mobile and web development.</h5>" */
		for (var i = data.length-1; i >= 0; i--) {
		
			html += '<a href="' + ( data[i].title.indexOf('My First Month') > -1 ? 'https:\/\/medium.com\/p\/6691f0b663ad' : '/blog/' + data[i].title.replace(/\s/g, "-") )   + '" class="blog-post-title"><article><h3>' + data[i].title + '</h3></a> <h4>' + moment(data[i].date).format('dddd, MMMM Do, YYYY') + "</h4><section>" + data[i].body.split("</p>")[0] + '</p></section></article>';
			
			postIncrement++;
		}	
		
		postIncrement = 1;
		
		res.send(html)
	});
});

// Load a specific blog post
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
		
		console.log(title);
		
		Post.findOne({ 'title' : title }, function(err, doc) {
		
			if (doc == null) {
				res.status(404).render('client/404.html', {});	
			}
			
			else {
			
				var html;
			
				html = '<article><h3>' + doc.title + '</h3></a> <h4>' + moment(doc.date).format('dddd, MMMM Do, YYYY') + "</h4><section>" + doc.body + '</section></article>';
		
				res.render('client/index.html', {partial: html});
			
			}
			
		});
		
	}
	
});


// Load my admin panel
app.get('/admin', function(req, res) {

	basic.apply(req, res, function(username){
		
		Post.find(function(err, data) {
		
			res.render(__dirname + '/client/admin.html', { posts:data });
			
		});

	});
	
});


// The form in my admin panel routes here to insert a post
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

// A post to mail is encountered when someone contacts me through the form at /contact
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

// The page linked from the admin panel that allows me to edit a post.
app.get('/admin/edit', function(req, res) {


	Post.findById(req.query.post_id, function(err, doc){
	
		res.render(__dirname + '/client/edit.html', {post: doc});
		
	});

	
});

// Post an edit to a blog post.
app.post('/admin/edit', function(req, res) {

	Post.findById(req.query.post_id).update({body:req.body.body});	
	
	res.redirect('/admin');	

});

// Convenience for accessing my mail server when I don't have my laptop with Mac Mail.
app.get('/mail', function(req, res) {

	res.redirect('https://s17-dallas.accountservergroup.com:2096');
	
});

// Render a template onto the view
function getFile(req, res) {
	
	if (req.params.something == 'blog') {
		Post.find(function(err, data) {

		var postIncrement = 1;
	
		var html = "";
		
		/* html += "<h5>The blogging home of Objective-Ben.<br />Writing the solutions I wish I had while learning iOS.</h5>" */
		for (var i = data.length-1; i >= 0; i--) {
		
			html += '<a href="/blog/' + data[i].title.replace(/\s/g, "-")  + '" class="blog-post-title"><article><h3>' + data[i].title + '</h3></a> <h4>' + moment(data[i].date).format('dddd, MMMM Do, YYYY') + "</h4><section>" + data[i].body.split("</p>")[0] + '</p></section></article>';
			
			postIncrement++;
		}	
		
		postIncrement = 1;
		
		res.render('client/index.html', {partial: html})
	})
		
	} 
	
	else {
	
		if (req.params.something == undefined) req.params.something = 'home'
	
		fs.readFile("client/partials/_" + req.params.something + ".html", function read(err, data) {
		
		    if (err) {
   				res.status(404).render('client/404.html', {});	
		    } 
		    
		    else {
			    var content = data.toString();
			    res.render("client/index.html", {partial: content})
		    }
		
		});	
	}
}

// Root route
app.get('/', getFile);

// Handling /contact, /blog, and 404 errors if not a legitimate URL.
app.get('/:something', getFile);

// Run the app and define the path we'll be using.


app.set('port', process.env.PORT || 3000); //config
app.use(express.static(__dirname + "/client")); //config
app.listen(app.get('port')); //execution
console.log("Yes, I'm listening on port " + app.get('port'));
/* console.log("Yes, I'm listening on port 3000."); */

