const rules = require('../middleware/rules.js') 
var User = require('../models/User')

module.exports = {
	index: {
		name: "Приложение",
		menu: true,
		path: "get /",
		view: "index",
		access: rules.access.ALL
	},
	help: {
		name: "Помощь",
		menu: true,
		path: "get /help",
		view: "help",
		access: rules.access.ALL
	},
	contacts: {
		name: "Контакты",
		menu: true,
		path: "get /contacts",
		view: "contacts",
		access: rules.access.ALL
	},
	login: {
		name: "Вход в систему",
		path: "get /login",
		view: "",
		access: rules.access.NOBODY
	},
	kabinet: {
		name: "Личный кабинет",
		path: "get /lk",
		menu: true,
		view: "lk",
		access: rules.access.USER
	},
	users: {
		name: "Пользователи",
		path: "get /userslist",
		menu: true,
		async action(req, res) {
			options = {}
			options.path = "/userslist"
			options.user = req.user.fmtUser()
			options.users = await User.findAll()
			options.title = "Пользователи"

			options.menu = req.menu

			options.menu = options.menu.filter((el)=>el.url !== options.path)
			res.render("users",options)
		},
		access: rules.access.ADMIN
	},
	userMessages: {
		name: "Сообщения пользователей",
		path: "get /users-messages",
		menu: true,
		action: "",
		access: rules.access.ADMIN
	}
}