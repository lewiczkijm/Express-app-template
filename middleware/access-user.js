/*
* Прослойка загрузки пользователя при наличии сессии.
* Добавляет req.user {User | false}
*/
var cookies = require('cookies')
var config = require('../config')
var User = require('../models/User')
const rules = require('./rules')
var createError = require('http-errors')

module.exports = async function(req, res, next) {
	let session = req.cookies.get(config.get('user:sessionName'))
	let user = {}
	if(session === undefined) session = ''
	try{
		user = await User.access(session)
		// res.cookies.set("My","{a:1}",{path:"/",httpOnly:true,maxAge: 1000})
	}catch(err){
		if(err.message === 'User not found'){
		}
	}


	let access = [rules.access.ALL]
	if(user.name !== undefined){
		access.push(rules.access.USER)
		if(user.admin) access.push(rules.access.ADMIN)
	}
	else access.push(rules.access.NOBODY)


	req.user = user
	req.access = access

  	next();
};

var until = {
	has(arr,el){
		return arr.indexOf(el) !== -1 
	},
	controlUser(ctrl){
		return function(req, res, next){
			if(until.has(req.access,ctrl))
				next()
			else{
				next(createError(401))
			}
		}
	}
}

module.exports.until = until