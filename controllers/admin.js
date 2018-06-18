/**
*
* Инструментарий, доступный только администраторам
*/
var config = require('../config')
var logger = require('../lib/logger')('controllers/admin')

var User = require('../models/User')


async function panelUsers(req, res) {
	options = {}
	options.path = "/userslist"
	options.user = req.user.fmtUser()
	options.users = await User.findAll()
	options.title = "Пользователи"
	options.menu = req.menu
	options.menu = options.menu.filter((el)=>el.url !== options.path)
	res.render("users",options)
}

module.exports.panelUsers = panelUsers


async function userList(req,res) {
	let users = await User.findAll()
	res.status(200).send(users)
}

module.exports.userList = userList

function createUser(req,res){
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

module.exports.createUser = createUser

async function deleteUser(req,res){
			
	let user = await User.findByLogin(req.params.name)
	
	if(!user){ 
		res.status(400).send("User not found")
		return
	}
	user.delete()
	res.sendStatus(200)
}

module.exports.deleteUser = deleteUser

async function updateUser(req,res){		
	let user = await User.findByLogin(req.params.name)
	
	if(!user){ 
		res.status(400).send("User not found")
		return
	}

	user = user.safeUpdate(req.body)
	user.save()
	res.sendStatus(200)
}

module.exports.updateUser = updateUser

async function resetUserPassword(req,res){
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

module.exports.resetUserPassword = resetUserPassword