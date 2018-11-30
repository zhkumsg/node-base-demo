const express = require('express');
const router = express.Router();
const request = require('request');
const WXBizDataCrypt = require('../common/WXBizDataCrypt');
const MsgJsonHelper = require('../common/MsgJsonHelper');

router.get('/authorize', authorize);

/**
 * 授权登录
 * @param {*} req
 * @param {*} res
 */
function authorize(req, res) {
	let appid = '';
	global['SYS_PARAMINFO'].forEach(permit => {
		if (permit.ZK_KEY === 'WeiXinAppID') {
			appid = permit.ZK_VALUE;
		}
	});
	let iv = req.body.iv;
	let sessionKey = req.body.sessionKey;
	let encryptedData = req.body.encryptedData;
	let pc = new WXBizDataCrypt(appid, sessionKey);
	let wxuser = pc.decryptData(encryptedData, iv);
	//检查是否存在该用户，判断是否需要注册
	res.send(wxuser);
}

/**
 * 换取openid和sessionkey
 * @param {*} req
 * @param {*} res
 */
function code2Session(req, res) {
	let baseurl = 'https://api.weixin.qq.com/sns/jscode2session?grant_type=authorization_code';
	let appid = '';
	let secret = '';
	let code = req.query['code'];
	global['SYS_PARAMINFO'].forEach(permit => {
		if (permit.ZK_KEY === 'WeiXinAppID') {
			appid = permit.ZK_VALUE;
		}
		if (permit.ZK_KEY === 'WeiXinAppSecret') {
			secret = permit.ZK_VALUE;
		}
	});
	let options = [baseurl, 'appid=' + appid, 'secret=' + secret, 'js_code=' + code];
	request(options.join('&'), (wxerr, wxres, wxbody) => {
		if (wxerr || wxres.statusCode !== 200) {
			res.json(MsgJsonHelper.DebugJson('参数异常'));
		} else {
			res.json(MsgJsonHelper.DebugJson(wxbody));
		}
	});
}

module.exports = router;
