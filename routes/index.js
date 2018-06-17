var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	let get = req.query
	let post = req.body


	delete req.user.salt
	delete req.user.hashedPassword
	delete req.user.session


	res.render('index', 
		{ 
			title: 'Express', 
			get: get, 
			post:post,
			user:req.user,
			menu:req.menu 
		});
});

module.exports = router;