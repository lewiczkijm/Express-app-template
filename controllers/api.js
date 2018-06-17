var config = require('../config')
const rules = require('../middleware/rules.js') 
var User = require('../models/User')
var controlUser = require('./controlUsers')

module.exports = {
	login: {
		path: "post /login",
		
		async action(req, res){
			let maxAge;
			let userData;
			if(req.body.save) maxAge = config.get('user:maxAge')
			try{
				userData = await User.login(req.body.login,req.body.password,maxAge)
			}
			catch(err){
				if(err.message === 'User not found' || err.message === 'Password is wrong'){
					res.status(400).send({message:err.message})
				}
				else {
					console.log(err)
					res.sendStatus(500)
				}
					return
			}

			res.cookies.set(
				config.get('user:sessionName'),
				userData.session,
				{
					httpOnly:true,
					maxAge:maxAge
				}
			)

			res.status(200).send(userData.fmtUser())
		},

		access: rules.access.NOBODY
	},
	logout: {
		path: "get /user/logout",
		access: rules.access.USER,
		
		async action(req,res){
			req.user.logout()
			res.cookies.set(
				config.get('user:sessionName'),
				'',
				{httpOnly:true}
			)

			res.sendStatus(200)
		}
	},

	updatePassword: {
		path: "patch /user/password",
		access: rules.access.USER,
		async action(req,res){

			req.user.updatePassword(req.body.oldpass,req.body.newpass).
			
			then(result =>{
				res.sendStatus(200)
			}).

			catch(err =>{
				res.status(400).send(err.message)
			})

		}
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