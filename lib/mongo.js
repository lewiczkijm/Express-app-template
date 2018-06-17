// Подключение к mongodb для последующей работы других модулей
"use strict"
var mongo = require("mongodb");
var config = require('../config');

var path = process.env.MONGODB_URI || config.get('mongodb:uri') 
var db = config.get('mongodb:db')

let connection = mongo.connect(path).
	then(database=> database.db(db)).
		catch(err=>{
			console.log("Mongodb connection is failed")
			process.exit(255);
		})
module.exports=connection;