const express = require('express');
const router = express.Router();
const request = require('request');
const jsmd5 = require('js-md5');
const WXBizDataCrypt = require('../common/WXBizDataCrypt');
const MsgJsonHelper = require('../common/MsgJsonHelper');
const AuthorizeLogin = require('../common/AuthorizeLogin');
const ZK_USERINFO = require('../model/ZK_USERINFO');
const { DataAccess, OperationEnum, Public } = require('msg-dataaccess-base');

const ds = new DataAccess();

router.post('/authorize', authorize);

/**
 * 微信授权登录
 * @param {*} req
 * @param {*} res
 */
function authorize(req, res) {
	let appid = '',
		secret = '';
	global['SYS_PARAMINFO'].forEach(permit => {
		if (permit.ZK_KEY === 'WeiXinAppID') {
			appid = permit.ZK_VALUE;
		}
		if (permit.ZK_KEY === 'WeiXinAppSecret') {
			secret = permit.ZK_VALUE;
		}
	});
	let code = req.body.code;
	code2Session(appid, secret, code)
		.then(({ sessionkey }) => {
			let iv = req.body.iv;
			let encryptedData = req.body.encryptedData;
			let pc = new WXBizDataCrypt(appid, sessionkey);
			let wxuser = pc.decryptData(encryptedData, iv);
			AuthorizeLogin.CheckWxExist(wxuser.openId).then(user => {
				if (user) {
					req.body.ID = user.ZK_ID;
					req.body.CAPTCHA = 'random';
					req.body.PWD = jsmd5(jsmd5.digest(wxuser.openId));
					req.body._CAPTCHA = jsmd5(jsmd5.digest(req.body.CAPTCHA));
					AuthorizeLogin.Login(req, res);
				} else {
					registerWxUser(wxuser).then(user => {
						if (user) {
							req.body.ID = user.ZK_ID;
							req.body.CAPTCHA = 'random';
							req.body.PWD = jsmd5(jsmd5.digest(wxuser.openId));
							req.body._CAPTCHA = jsmd5(jsmd5.digest(req.body.CAPTCHA));
							AuthorizeLogin.Login(req, res);
						} else {
							res.send(MsgJsonHelper.DebugJson('注册失败'));
						}
					});
				}
			});
		})
		.catch(wxerr => {
			res.send(MsgJsonHelper.DebugJson('授权失败:' + wxerr));
		});
}

/**
 * 换取openid和sessionkey
 * @param {*} appid
 * @param {*} secret
 * @param {*} code
 */
function code2Session(appid, secret, code) {
	let baseurl = 'https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code';
	let options = [baseurl, 'appid=' + appid, 'secret=' + secret, 'js_code=' + code];
	return new Promise((resolve, reject) => {
		request(options.join('&'), (wxerr, wxres, wxbody) => {
			if (wxres.statusCode === 200) {
				wxbody = JSON.parse(wxbody);
				if ('openid' in wxbody) {
					resolve({
						openid: wxbody.openid,
						sessionkey: wxbody.session_key,
						expiresin: wxbody.expires_in,
					});
				} else {
					reject(wxbody.errmsg);
				}
			} else {
				reject('网络异常');
			}
		});
	});
}

/**
 * 微信用户注册
 * @param {*} wxuser
 * @param {*} res
 */
function registerWxUser(wxuser) {
	return new Promise((resolve, reject) => {
		let user = new ZK_USERINFO();
		user.ZK_ID = Public.BuildCode();
		user.ZK_OPENID = wxuser.openId;
		user.EB_CREATE_DATETIME = new Date();
		user.EB_LASTMODIFY_DATETIME = new Date();
		(user.ZK_HEAD_PORTRAIT = wxuser.avatarUrl), (user.ZK_NAME = wxuser.nickName);
		user.ZK_PASSWORD = jsmd5(jsmd5.digest(wxuser.openId));
		user.ZK_SEX = wxuser.gender === 1 ? '男' : '女';
		user.ZK_USERSOURCE = '微信小程序注册';
		global['SYS_PARAMINFO'].forEach(permit => {
			if (permit.ZK_KEY === 'WeiXinAppRole') {
				user.ZK_ROLE = permit.ZK_VALUE;
			}
		});
		ds.TransRunQuery(Public.OperationSQLParams(user, OperationEnum.Create))
			.then(flag => {
				resolve(flag ? user : null);
			})
			.catch(() => {
				reject();
			});
	});
}

module.exports = router;
