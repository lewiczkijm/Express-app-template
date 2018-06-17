/*
* Родительский класс для всех моделей, предусматривающих запись данных в mongodb
* Единственная на данный момент операция - создание свойства mongo с промисом подключения к выбранной коллекции
*/
var mongo = require('../lib/mongo')

class MongoCollection{
	constructor(collectionName){
	}
}

module.exports = MongoCollection