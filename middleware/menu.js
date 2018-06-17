/*
* Автоматическое меню. Собирается из списка документов, подаваемого на роутер
* Поддерживает разграничение прав пользователей и выдает только те пункты, 
* которые пользователь данного уровня имеет право смотреть
*/
var until = require('./access-user').until

module.exports = function(menuData,menuKey,name) {

	return function(req, res, next) {
		let elements = []
		if(menuData === undefined || res.req.headers['x-requested-with'] == 'XMLHttpRequest'){
			next();	
		}


		for(let el in menuData){
			if(!menuData.hasOwnProperty(el)) continue
			let item = menuData[el]

			if(menuKey === undefined || !menuKey || menuKey === '') 
				menuKey = "menu"

			if(!item[menuKey] || item[menuKey] ===undefined) continue

			if(until.has(req.access,item.access))
				elements.push(
					{
						name : item.name,
						url : item.path.split(' ')[1]
					}) 
		}
		if(name === undefined)
			req.menu = elements
		else req.menu[name] = elements
  		next();
	};
} 