// Создание тестовых пользователей в базе данных users
var config = require('./config');
var mongo = require('./lib/mongo');
var User = require('./models/User');

async function newUser(login,password) {
	console.log(login)
	let user = await User.create(login,password)
	user.save()
	return true
}

async function createUsers() {
	let db = await mongo;
	await db.dropDatabase()
// 	// let db = await mongo;
// 	// await db.dropDatabase()
// 	console.log("start inserted")
	let write = await Promise.all([
		newUser('Niko','1234'),
		newUser('Alex','F89ed4'),
		newUser('Viktoria','0pek'),
	])

	let isWrited = write.every(el=>el === true)
	if(isWrited)
		console.log("ok")

}

createUsers();