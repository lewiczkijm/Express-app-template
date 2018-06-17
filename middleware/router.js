/**
* Генерация маршрутов по шаблону
*/
var express = require('express');
var createError = require('http-errors');

var until = require('./access-user').until

var router = express.Router();

module.exports = function(data,defaultViewRenderer,defaultApiStarter){
	for(let el in data){
		if(!data.hasOwnProperty(el)) continue
		let item = data[el]

		let [method, path] = item.path.split(' ')

		let options = {}
		if(item.options) options = item.options

		options.title = item.name	
		options.path = path

		// Определение действия: рендеринг view, запуск кода или выдача заглушки 
		let action
		if(item.view){
			if(defaultViewRenderer) action = defaultViewRenderer(item.view,options)
			else {
				action = function renderer(req, res) {
					if(req.user.name)
						options.user = req.user.fmtUser()
					else
						options.user = req.user
					
					options.menu = req.menu
			
					options.menu = options.menu.filter((el)=>el.url !== options.path)
					res.render(item.view,options)
				}

			}
		}

		// Определение действия: Запуск произвольного кода в формате express middleware
		else if(item.action){
			action = item.action
		}

		// Определение действия: Запуск api. По умолчанию принимает функцию, принимающюю express`овский req
		// и возвращающую объект, посылаемый в формате json или один код статуса ответа 
		else if(item.api){
			if(defaultApiStarter) action = defaultApiStarter(item.api,options)
			else {
				action = async function apiStarter(req,res) {
					let result = await item.api(req)
					if(typeof result == "number") res.sendStatus(result)
					if(typeof result == "object" && result.status !== undefined && typeof result.status == "number")
						res.status(result.status).type('json').send(result)
					else createError(500)
				}
			}
		}
		else{
			action = function renderStub(req,res) {
				res.send(item.name)
			}
		}

		// Вызов маршрутизатора по конкретным методам. Поддерживаются все методы из библиотеки Axios
		if(method === 'get') router.get(path, until.controlUser(item.access), action) 
		if(method === 'post') router.post(path, until.controlUser(item.access), action) 
		if(method === 'put') router.put(path, until.controlUser(item.access), action) 
		if(method === 'delete') router.delete(path, until.controlUser(item.access), action) 
		if(method === 'head') router.head(path, until.controlUser(item.access), action) 
		if(method === 'options') router.options(path, until.controlUser(item.access), action) 
		if(method === 'patch') router.patch(path, until.controlUser(item.access), action)
		
	}
	return router
}
