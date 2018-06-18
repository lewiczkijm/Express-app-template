/**
 * #Пользователь 
 * Здесь хранится модель пользователя - субъекта, создающего задания, аккаунты учеников
 * и контролирующего выполнение заданий.
 * TODO Сделать безопасную функцию добавления ключа admin
 */
"use strict"
var crypto = require('crypto')
var ObjectID = require('mongodb').ObjectID
var config = require('../config')
var mongo = require('../lib/mongo').then(res => res.collection(config.get('mongodb:collections:users')))


class User {

	constructor(){
	}

	/**
	* Кодирование пароля с криптографической солью
	*/
	encryptPassword(password) {
  		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	}

	/**
	* Генерация пароля и криптографической соли. Происходит при создании пользователя и смене пароля
	*/
	set password(password){
		this._plainPassword = password;
    	this.salt = Math.random() + '';
    	this.hashedPassword = this.encryptPassword(password);
	}

	/**
	* Геттер пароля, существует на всякий случай 
	*/
	get password(){
		return this._plainPassword
	}


	/**
	* Сохранение данных нового пользователя в базу или обновление данных существующего пользователя 
	* Данные обновляются с полным их переписыванием в базе
	*/
	async save(){
		if(this._plainPassword !== undefined)
			delete this._plainPassword;
		try{
			if(this._id === undefined){
				let res = await User.collection.insert(this);
				return res.ops[0]._id
			}
			else{

				
				this._id = User.ObjectID(this._id)
				let res = await User.collection.update({"_id": User.ObjectID(this._id)},this)

			}
			return true
		}catch(err){
			console.log(err)
			throw new Error("Database is not available")
		}
	}

	async delete(){
		User.collection.deleteOne({"_id":this._id})
	}

	/**
	* Обновление пароля. Эту операцию выполняет пользователь	
	*/
	async updatePassword(oldPassword,newPassword){
		if(this.encryptPassword(oldPassword) !== this.hashedPassword)
			throw new Error("Old password is wrong")
		if(!validatePassword(newPassword))
			throw new Error("New password not good")
		this.password = newPassword;
		this.save()
		return true
	}

	async resetPassword(newPassword){
		this.password = newPassword;
		this.save()
		return true
	}

	/**
	* Выход из системы. Осуществляется путем удаления идентификатора сессии
	* Cookie на клиенте также требуют удаления
	*/
	async logout(){
		delete this.session
		this.save()
	}

	safeUpdate(data){
		if( 
			data.hasOwnProperty('salt')            || 
			data.hasOwnProperty('hashedPassword')  || 
			data.hasOwnProperty('session')
		)
			throw new Error("forbidden propertys")

			delete data.online

			let salt = this.salt
			let hashedPassword = this.hashedPassword
			let session = this.session

			for(let el in this){
				if(!this.hasOwnProperty(el)) continue
				delete this[el]
			}

			for(let el in data){
				if(!data.hasOwnProperty(el)) continue

				this[el] = data[el]
			}
			return this
	}

	fmtUser(){
		delete this.salt
		delete this.hashedPassword
		if(this.session) this.online = true;	
		delete this.session
		return this
	}

	/*
	* Создание нового пользователя с проверкой по базе на уникальное имя, корректность имени и пароля
	*/
	static async create(login, password){
		let out = new User()
		if(validateLogin(login))
			out.name = login
		else throw new Error("Login is uncorrect")
		if(await User.findByLogin(login))
			throw new Error("This login alrady used")

		if(validatePassword(password))
			out.password = password
		else throw new Error("Password is uncorrect")

		return out;
	}

	/**
	* Выдача всех доступных пользователей
	*/
	static async findAll(){
		let res = await User.collection.find()
		res = await res.toArray()
		// console.log(res.length)
		res = res.map(el=>{
			let user = User.load(el)
			return user.fmtUser()
		})
		
		return res
	}
	
	/**
	* Поиск пользователя по уникальному идентификатору _id mongodb ObjectID()
	*/
	static async findById(id){
		let res = await User.collection.findOne({"_id":User.ObjectId(id)})
		if(res === null) return false
		return User.load(res);
	}

	/**
	* Поиск по логину
	*/
	static async findByLogin(login){
		let res = await User.collection.findOne({"name":login})
		if(res === null) return false
		return User.load(res);
	}

	/**
	* Поиск по идентификатору сессии
	*/
	static async findBySession(session){
		let res = await User.collection.findOne({"session":session})
		if(res === null) return false
		let user = User.load(res);
		return user
	}


	/**
	* Авторизация пользоавтеля. Проверяет наличие пользователя в базе, его пароль
	* Возвращает пользователя, а заодно добавляет уникальный идентификатор сессии
	* и сохраняет пользователя с ним 
	*/
	static async login(username,password,maxAge){
		let user = await User.findByLogin(username);
		if(!user) throw new Error("User not found")
		if(user.encryptPassword(password) === user.hashedPassword){
			user.session = crypto.randomBytes(8).toString("hex")
			user.touch = Date.now();
			if(maxAge === undefined) maxAge = config.get('user:sessionMaxAge')
			user.maxAge = maxAge
			user.save()
			return user
		}
		else throw new Error("Password is wrong")
	}
	
	/**
	* Преобразование данных о пользователе, взятых из базы в объект пользователя
	* с поддержкой всех методов
	*/
	static load(userData){
		let user = new User()
		for(let key in userData){
			if(!userData.hasOwnProperty(key))	continue
			user[key] = userData[key]
		}

		return user;
	}

	/**
	* оступ к пользователю по идентификатору сессии и обновление последнего его посещения
	*/
	static async access(session){
		let user = await User.findBySession(session)
		if(!user) throw new Error("User not found")
		user.touch = Date.now();
		user.save()
		return user
	}
}

/**
*
* #Расширение функционала класса User: 
* ##внедрение зависимости collection - 
* дающий доступ к коллекции mongodb, необходимый для сохранения данных 
*
*/
async function ext(){
	User.collection = await mongo.catch(err=>{
		console.log(err)
		process.exit(222)
	})
	User.ObjectID = ObjectID
}

ext()

/**
* Валидация логина
*/
function validateLogin(login){
	return typeof login === "string" && login.length >= 3
}

/**
* Валидация пароля
*/
function validatePassword(password){
	return password.length > 3
}

module.exports = User;