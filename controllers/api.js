var config = require('../config')
var logger = require('../lib/logger')('controllers/api')
const rules = require('../middleware/rules.js') 
var User = require('../models/User')

var controlUser = require('./user')
var admin = require('./admin')


module.exports = {
	login: {
		path: "post /login",
		access: rules.access.NOBODY,
		action: controlUser.login
	},
	logout: {
		path: "get /user/logout",
		access: rules.access.USER,
		
		action: controlUser.logout
	},

	updatePassword: {
		path: "patch /user/password",
		access: rules.access.USER,
		action: controlUser.updatePassword
	},

	users:{
		path: 'get /users',
		access: rules.access.ADMIN,
		async action(req,res){
			let users = await User.findAll()
			res.status(200).send(users)
		}
	},

	createUser:{
		path: 'put /users',
		access: rules.access.ADMIN,
		action(req,res){
			req.body
			User.create(req.body.login,req.body.password).
			then(async userData =>{
				if(req.body.admin) userData.admin = true
				
				userData._id = await userData.save()
				userData.fmtUser()
				
				res.status(200).send(userData)
			}).
			catch(err=>{
				res.status(400).send(err.message)
			})
		}
	},

	updateUser:{
		path: 'patch /users/:name',
		access: rules.access.ADMIN,
		async action(req,res){
			
			let user = await User.findByLogin(req.params.name)
			
			if(!user){ 
				res.status(400).send("User not found")
				return
			}
			user = user.safeUpdate(req.body)
			user.save()
			res.sendStatus(200)
		}
	},

	deleteUser:{
		path: 'delete /users/:name',
		access: rules.access.ADMIN,
		async action(req,res){
			
			let user = await User.findByLogin(req.params.name)
			
			if(!user){ 
				res.status(400).send("User not found")
				return
			}

			user.delete()
			res.sendStatus(200)
		}
	},

	resetUserPassword:{
		path: 'patch /users/:name/password',
		access: rules.access.ADMIN,
		async action(req,res){
			let user = await User.findByLogin(req.params.name)
			
			if(!user){ 
				res.status(400).send("User not found")
				return
			}

			try {
				let result = user.resetPassword(req.body.password)
				if(result)
					res.sendStatus(200)
			}
			catch(err){
				res.status(400).send(err.message)
				return
			}
		}
	}
}