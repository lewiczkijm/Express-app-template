/*
* Загрузка статических страниц, предусматривающих вывод главного меню и информации о пользователе
*/
module.exports = function(view, options) {
	return function renderer(req, res) {
		if(req.user.name)
			options.user = req.user.fmtUser()
		else
			options.user = req.user
		
		options.menu = req.menu

		options.menu = options.menu.filter((el)=>el.url !== options.path)
		res.render(view,options)
	}

}