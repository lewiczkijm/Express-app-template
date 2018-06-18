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
		action: admin.userList
	},

	createUser:{
		path: 'put /users',
		access: rules.access.ADMIN,
		action: admin.createUser
	},

	updateUser:{
		path: 'patch /users/:name',
		access: rules.access.ADMIN,
		action: admin.updateUser
	},

	deleteUser:{
		path: 'delete /users/:name',
		access: rules.access.ADMIN,
		action: admin.deleteUser
	},

	resetUserPassword:{
		path: 'patch /users/:name/password',
		access: rules.access.ADMIN,
		action: admin.resetUserPassword
	}
}