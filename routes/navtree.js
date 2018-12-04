const express = require('express');
const router = express.Router();
const MySqlHelper = require('../common/MySqlHelper');
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
const { ZK_NAVTREE } = require('../model/model.module');

const ds = new DataAccess();

router.get('/', function(req, res, next) {
	if (!Routebase.IsLogin(req, res)) {
		return;
	}
	if (!Routebase.IsPermit(req, res, '00032')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_GetNavtree':
			GetNavtree(req, res);
			break;
		case 'Backend_GetNavtreeDetail':
			GetNavtreeDetail(req, res);
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
	if (!Routebase.IsPermit(req, res, '00032')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_DeleteNavtree':
			DeleteNavtree(req, res);
			break;
		case 'Backend_InsertNavtree':
			InsertNavtree(req, res);
			break;
		case 'Backend_UpdateNavtree':
			UpdateNavtree(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

/**
 * 获取导航树列表
 * @param {*} req
 * @param {*} res
 */
function GetNavtree(req, res) {
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
	client
		.Query(
			QueryModel.ZK_NAVTREE,
			condition,
			null,
			Number.parseInt(pagesize, 10),
			Number.parseInt(pageno, 10),
			true,
			sort
		)
		.then(m => {
			if (m.result.length > 0) {
				res.json(MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString()));
			} else {
				res.json(MsgJsonHelper.DebugJson('暂无更多信息'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('GetNavtree接口请求异常'));
		});
}

/**
 * 获取导航节点详情
 * @param {*} req
 * @param {*} res
 */
function GetNavtreeDetail(req, res) {
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
		.Query(QueryModel.ZK_NAVTREE, condition, null, 0, 0, false, new SortParam())
		.then(m => {
			if (m.result.length > 0) {
				res.json(MsgJsonHelper.DefaultJson(m.result[0], true, m.recordcount.toString()));
			} else {
				res.json(MsgJsonHelper.DebugJson('暂无更多信息'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('GetNavtreeDetail接口请求异常'));
		});
}

/**
 * 删除导航节点
 * @param {*} req
 * @param {*} res
 */
function DeleteNavtree(req, res) {
	let ids = req.body['IDS'] === undefined ? '' : req.body['IDS'].toString();
	client
		.DeleteByIds(ZK_NAVTREE, ids.split(','))
		.then(m => {
			if (m) {
				res.json(MsgJsonHelper.DefaultJson(null, true, ''));
			} else {
				res.json(MsgJsonHelper.DebugJson('删除失败，请重新尝试'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('DeleteNavtree接口请求异常'));
		});
}

/**
 * 新增导航树节点
 * @param {*} req
 * @param {*} res
 */
function InsertNavtree(req, res) {
	let record = new ZK_NAVTREE();
	record.EB_CREATEBY = req.UserInfo.ZK_ID;
	record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	record.ZK_ID = req.body['ZK_ID'] || '';
	record.ZK_ISHIDDEN = req.body['ZK_ISHIDDEN'] || '';
	record.ZK_ISLEAF = req.body['ZK_ISLEAF'] || '';
	record.ZK_NAME = req.body['ZK_NAME'] || '';
	record.ZK_PARENT = req.body['ZK_PARENT'] || '';
	record.ZK_SORT = Number.parseInt(req.body['ZK_SORT'] || '0');
	record.EB_ISDELETE = '0';
	if (!/^[A-Za-z0-9]{1,32}$/g.test(record.ZK_ID)) {
		res.json(MsgJsonHelper.DebugJson('键不符合规则，请重新输入'));
		return false;
	}
	ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Create))
		.then(flag => {
			res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '新增失败，请检查数据后重新提交'));
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('InsertNavtree接口请求异常'));
		});
}

/**
 * 更新导航树节点
 * @param {*} req
 * @param {*} res
 */
function UpdateNavtree(req, res) {
	let record = new ZK_NAVTREE();
	record.EB_CREATEBY = req.UserInfo.ZK_ID;
	record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	record.ZK_ID = req.body['ZK_ID'] || '';
	record.ZK_ISHIDDEN = req.body['ZK_ISHIDDEN'] || '';
	record.ZK_ISLEAF = req.body['ZK_ISLEAF'] || '';
	record.ZK_NAME = req.body['ZK_NAME'] || '';
	record.ZK_PARENT = req.body['ZK_PARENT'] || '';
	record.ZK_SORT = Number.parseInt(req.body['ZK_SORT'] || '0');
	if (!/^[A-Za-z0-9]{1,32}$/g.test(record.ZK_ID)) {
		res.json(MsgJsonHelper.DebugJson('键不符合规则，请重新输入'));
		return false;
	}
	ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.UpdateNoCheck))
		.then(flag => {
			res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '修改失败，请检查数据后重新提交'));
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('UpdateNavtree接口请求异常'));
		});
}

module.exports = router;
