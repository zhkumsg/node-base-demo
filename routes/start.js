const express = require('express');
const router = express.Router();
const MsgJsonHelper = require('../common/MsgJsonHelper');
var svgCaptcha = require('svg-captcha');
const jsmd5 = require('js-md5');
var AuthorizeLogin = require('../common/AuthorizeLogin');

router.post('/', function(req, res, next) {
	switch (req.query['method']) {
		case 'Backend_Login':
			AuthorizeLogin.Login(req, res);
			break;
		case 'Backend_Logout':
			Logout(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

router.get('/', function(req, res, next) {
	switch (req.query['method']) {
		case 'Backend_Verifylogin':
			Verifylogin(req, res);
			break;
		case 'Backend_Captcha':
			Createcaptcha(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

/**
 * 检查是否在线
 * @param {*} res
 */
function Verifylogin(req, res) {
	let user = req.UserInfo;
	if (user) {
		user['ZK_PASSWORD'] = user['ZK_PASSWORD'].replace(/^(.{5})(.+)(.{5})$/, '$1*****$3');
	}
	res.json(MsgJsonHelper.DefaultJson(user, user === undefined ? false : true, ''));
}

/**
 * 退出登录
 * @param {*} req
 * @param {*} res
 */
function Logout(req, res) {
	res.json(MsgJsonHelper.DefaultJson('', true, '请清空登录票据'));
}

/**
 * 生成图片二维码
 * @param {*} req
 * @param {*} res
 * @verify jsmd5(jsmd5.digest(captcha))
 */
function Createcaptcha(req, res) {
	let captcha = svgCaptcha.create({
		size: 4,
		noise: 2,
		color: true,
		width: 150,
		height: 50,
		background: 'transparent',
	});
	res.json(MsgJsonHelper.DefaultJson(captcha.data, true, jsmd5(jsmd5.digest(captcha.text.toLowerCase()))));
}

module.exports = router;
