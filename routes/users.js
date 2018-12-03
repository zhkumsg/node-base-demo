const express = require('express');
const router = express.Router();
const client = require('../common/ServiceClient');
const MsgJsonHelper = require('../common/MsgJsonHelper');
const QueryModel = require('../common/QueryModel');
const MemoryCondition = require('../common/MemoryCondition');
const {
	DataAccess,
	MType,
	MLogic,
	MOperator,
	SortParam,
	Direction,
	OperationEnum,
	Public,
} = require('msg-dataaccess-base');
const Routebase = require('./route.base');
const ZK_USERINFO = require('../model/ZK_USERINFO');

const ds = new DataAccess();

router.get('/', function(req, res, next) {
	if (!Routebase.IsLogin(req, res)) {
		return;
	}
	if (!Routebase.IsPermit(req, res, '00005')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_GetUserList':
			GetUserList(req, res);
			break;
		case 'Backend_GetUserInfo':
			GetUserInfo(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

router.post('/', function(req, res, next) {
	if (!Routebase.IsLogin(req, res)) {
		return;
	}
	if (!Routebase.IsPermit(req, res, '00005')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_DeleteUser':
			DeleteUser(req, res);
			break;
		case 'Backend_InsertUser':
			InsertUser(req, res);
			break;
		case 'Backend_UpdateUser':
			UpdateUser(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

/**
 * 获取用户列表
 * @param {*} req
 * @param {*} res
 */
function GetUserList(req, res) {
	let keyword = req.query['KEYWORD'] === undefined ? '' : req.query['KEYWORD'].toString();
	let type = req.query['TYPE'] === undefined ? '' : req.query['TYPE'].toString();
	let prop = req.query['PROP'] === undefined ? '' : req.query['PROP'].toString();
	let order = req.query['ORDER'] === undefined ? '' : req.query['ORDER'].toString();
	let pagesize = req.query['PAGESIZE'] === undefined ? '1' : req.query['PAGESIZE'].toString();
	let pageno = req.query['PAGENO'] === undefined ? '1' : req.query['PAGENO'].toString();
	let sort = null;
	let condition = [];
	if (keyword) {
		condition.push(
			new MemoryCondition({
				Field: type,
				Logic: MLogic.And,
				Operator: MOperator.Like,
				Type: MType.Mstring,
				value: keyword,
			})
		);
	}
	if (prop && order) {
		sort = new SortParam({
			Field: prop,
			SortDirection: order == 'descending' ? Direction.DESC : Direction.ASC,
		});
	} else {
		sort = new SortParam({
			Field: 'EB_CREATE_DATETIME',
			SortDirection: Direction.DESC,
		});
	}
	Routebase.ValidRole(req.UserInfo.ZK_ROLE).then(roles => {
		if (roles.length === 0) {
			res.json(MsgJsonHelper.DebugJson('您当前角色无权查看其它用户信息'));
			return;
		}
		let keys = [];
		roles.forEach(r => {
			keys.push(r.ZK_ID);
		});
		condition.push(
			new MemoryCondition({
				Field: 'ZK_ROLE',
				Logic: MLogic.And,
				Operator: MOperator.In,
				Type: MType.Mstring,
				value: keys.join(','),
			})
		);
		client
			.Query(
				QueryModel.ZK_USERINFO,
				condition,
				null,
				Number.parseInt(pagesize, 10),
				Number.parseInt(pageno, 10),
				true,
				sort
			)
			.then(m => {
				if (m.result.length > 0) {
					m.result.forEach(user => {
						user.ZK_ROLE = roles[keys.indexOf(user.ZK_ROLE)].ZK_ROLE;
					});
					res.json(MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString()));
				} else {
					res.json(MsgJsonHelper.DebugJson('暂无更多信息'));
				}
			})
			.catch(err => {
				res.json(MsgJsonHelper.DebugJson('GetUserList接口请求异常'));
			});
	});
}

/**
 * 获取用户详情
 * @param {*} req
 * @param {*} res
 */
function GetUserInfo(req, res) {
	let id = req.query['UID'] === undefined ? '' : req.query['UID'].toString();
	let condition = [];
	condition.push(
		new MemoryCondition({
			Field: 'ZK_ID',
			Logic: MLogic.And,
			Operator: MOperator.Equal,
			Type: MType.Mstring,
			value: id,
		})
	);
	client
		.Query(QueryModel.ZK_USERINFO, condition, null, 0, 0, false, new SortParam())
		.then(m => {
			if (m.result.length > 0) {
				res.json(MsgJsonHelper.DefaultJson(m.result[0], true, m.recordcount.toString()));
			} else {
				res.json(MsgJsonHelper.DebugJson('暂无更多信息'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('GetUserInfo接口请求异常'));
		});
}

/**
 * 删除用户信息
 * @param {*} req
 * @param {*} res
 */
function DeleteUser(req, res) {
	let ids = req.body['IDS'] === undefined ? '' : req.body['IDS'].toString();
	if (ids.split(',').indexOf('admin') > -1) {
		res.json(MsgJsonHelper.DebugJson('该用户禁止被删除！'));
		return false;
	}
	client.DeleteByIds(ZK_USERINFO, ids.split(',')).then(m => {
		if (m) {
			res.json(MsgJsonHelper.DefaultJson(null, true, ''));
		} else {
			res.json(MsgJsonHelper.DebugJson('删除失败，请重新尝试'));
		}
	});
}

/**
 * 新增用户
 * @param {*} req
 * @param {*} res
 */
function InsertUser(req, res) {
	let user = new ZK_USERINFO();
	user.ZK_ID = Public.BuildCode();
	user.EB_CREATE_DATETIME = new Date();
	user.EB_CREATEBY = req.UserInfo.ZK_ID;
	user.EB_LASTMODIFY_DATETIME = new Date();
	user.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	user.ZK_DEPARTMENT = req.body['ZK_DEPARTMENT'] || '';
	user.ZK_EMAIL = req.body['ZK_EMAIL'] || '';
	user.ZK_HEAD_PORTRAIT = req.body['ZK_HEAD_PORTRAIT'] || '';
	user.ZK_NAME = req.body['ZK_NAME'] === undefined || '';
	user.ZK_PASSWORD = req.body['ZK_PASSWORD_MD5'] || '';
	user.ZK_PHONE = req.body['ZK_PHONE'] || '';
	user.ZK_REMARK = req.body['ZK_REMARK'] || '';
	user.ZK_ROLE = req.body['ZK_ROLE'] || '';
	user.ZK_SEX = req.body['ZK_SEX'] || '';
	user.ZK_USERSOURCE = '普通注册';

	ds.TransRunQuery(Public.OperationSQLParams(user, OperationEnum.Create))
		.then(flag => {
			res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '新增失败，请检查数据后重新提交'));
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('InsertUser接口请求异常'));
		});
}

/**
 * 更新用户信息
 * @param {*} req
 * @param {*} res
 */
function UpdateUser(req, res) {
	let user = new ZK_USERINFO();
	user.ZK_ID = req.body['ZK_ID'] || '';
	user.EB_LASTMODIFY_DATETIME = new Date();
	user.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	user.ZK_DEPARTMENT = req.body['ZK_DEPARTMENT'] || '';
	user.ZK_EMAIL = req.body['ZK_EMAIL'] || '';
	user.ZK_HEAD_PORTRAIT = req.body['ZK_HEAD_PORTRAIT'] || '';
	user.ZK_NAME = req.body['ZK_NAME'] || '';
	user.ZK_PASSWORD = req.body['ZK_PASSWORD_MD5'] || undefined;
	user.ZK_PHONE = req.body['ZK_PHONE'] || '';
	user.ZK_REMARK = req.body['ZK_REMARK'] || '';
	user.ZK_ROLE = req.body['ZK_ROLE'] || '';
	user.ZK_SEX = req.body['ZK_SEX'] || '';

	ds.TransRunQuery(Public.OperationSQLParams(user, OperationEnum.UpdateNoCheck))
		.then(flag => {
			res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '修改失败，请检查数据后重新提交'));
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('UpdateUser接口调用失败'));
		});
}

module.exports = router;
