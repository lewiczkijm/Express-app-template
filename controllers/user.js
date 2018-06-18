/**
* Контроллеры входа в систему и выхода из нее, а также смены пароля и 
* внесения других изменений в учетную запись, если такие потребуются
*/
var config = require('../config')
var logger = require('../lib/logger')('controllers/user')

var User = require('../models/User')

/**
*
*/
async function login(req,res) {
    let maxAge;
    let userData;
    if (req.body.save) maxAge = config.get('user:maxAge')
    try {
        userData = await User.login(req.body.login, req.body.password, maxAge)
    }
    catch (err) {
        if (err.message === 'User not found' || err.message === 'Password is wrong') {
            logger.warn('login data error')
            res.status(400).send({message: err.message})
        }
        else {
            logger.error("login system error:\n" + err)
            res.sendStatus(500)
        }
        return
    }

    res.cookies.set(
        config.get('user:sessionName'),
        userData.session,
        {
            httpOnly: true,
            maxAge: maxAge})
       
    logger.info("login " + userData.name)
    res.status(200).send(userData.fmtUser())
}

module.exports.login = login

/**
* 
*/
function logout(req,res) {

	logger.info("logout " + req.user.name)
	req.user.logout()
	res.cookies.set(
		config.get('user:sessionName'),
		'',
		{httpOnly:true})
	res.sendStatus(200)
}

module.exports.logout = logout

function updatePassword(req,res){
	req.user.updatePassword(req.body.oldpass,req.body.newpass).
	
	then(result =>{
		logger.info("password update " + req.user.name)
		res.sendStatus(200)
	}).
	catch(err =>{
		logger.warn("password update error " + req.user.name)
		res.status(400).send(err.message)
	})
}

module.exports.updatePassword = updatePassword;