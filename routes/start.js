const express = require('express');
const router = express.Router();
const client = require('../common/ServiceClient');
const MsgJsonHelper = require('../common/MsgJsonHelper');
const QueryModel = require('../common/QueryModel');
const MemoryCondition = require('../common/MemoryCondition');
const { MType, MLogic, MOperator } = require('msg-dataaccess-base');
var svgCaptcha = require('svg-captcha');
const jsmd5 = require('js-md5');
var nodemailer = require('nodemailer');
var AuthorizeLogin = require("../common/AuthorizeLogin");

router.post('/', function (req, res, next) {
	switch (req.query['method']) {
		case 'Backend_Login':
			AuthorizeLogin.Login(req, res);
			break;
		case 'Backend_Logout':
			Logout(req, res);
			break;
		case 'Backend_SendRegisterEmail':
			SendRegisterEmail(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

router.get('/', function (req, res, next) {
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

/**
 * 发送邮件验证码
 * @param {*} req
 * @param {*} res
 */
function SendRegisterEmail(req, res) {
	let email = req.body.EMAIL;
	if (!email) {
		return res.json(MsgJsonHelper.DebugJson('邮箱地址为空'));
	}
	let condition = [];
	condition.push(
		new MemoryCondition({
			Field: 'ZK_EMAIL',
			Logic: MLogic.And,
			Operator: MOperator.Equal,
			Type: MType.Mstring,
			value: email,
		})
	);
	client
		.Query(QueryModel.ZK_USERINFO, condition, null, 0, 0, false, null)
		.then(m => {
			if (m.result.length === 0) {
				let captcha = svgCaptcha.create({
					size: 4,
					noise: 2,
					color: true,
					width: 150,
					height: 50,
					background: 'transparent',
				});
				let transporter = nodemailer.createTransport({
					service: 'qq',
					port: 465,
					secureConnection: true,
					auth: {
						user: 'msg@gdtcny.com',
						pass: 'xxxxxx',
					},
				});
				let mailOptions = {
					from: '1254765721@qq.com',
					to: email,
					subject: '注册验证码',
					html: captcha.data,
				};
				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						res.json(MsgJsonHelper.DebugJson(error));
					} else {
						res.json(
							MsgJsonHelper.DefaultJson(
								jsmd5(jsmd5.digest(captcha.text.toLowerCase())),
								true,
								'发送成功，请注意查收'
							)
						);
					}
				});
			} else {
				res.json(MsgJsonHelper.DebugJson('该账号已存在，请更换邮箱'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('SendEmail接口请求异常'));
		});
}

module.exports = router;
