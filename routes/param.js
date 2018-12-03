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
const ZK_PARAMINFO = require('../model/ZK_PARAMINFO');

const ds = new DataAccess();

router.get('/', function(req, res, next) {
	if (!Routebase.IsLogin(req, res)) {
		return;
	}
	if (!Routebase.IsPermit(req, res, '00017')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_GetParamList':
			GetParamList(req, res);
			break;
		case 'Backend_GetParamDetail':
			GetParamDetail(req, res);
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
	if (!Routebase.IsPermit(req, res, '00017')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_DeleteParams':
			DeleteParams(req, res);
			break;
		case 'Backend_InsertParam':
			InsertParam(req, res);
			break;
		case 'Backend_UpdateParam':
			UpdateParam(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

/**
 * 获取系统参数列表
 * @param {*} req
 * @param {*} res
 */
function GetParamList(req, res) {
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
			QueryModel.ZK_PARAMINFO,
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
			res.json(MsgJsonHelper.DebugJson('GetParamList接口请求异常'));
		});
}

/**
 * 删除系统参数
 * @param {*} req
 * @param {*} res
 */
function DeleteParams(req, res) {
	let ids = req.body['IDS'] === undefined ? '' : req.body['IDS'].toString();
	client.DeleteByIds(ZK_PARAMINFO, ids.split(',')).then(m => {
		if (m) {
			global['SYS_PARAMINFO'].forEach(p => {
				if (ids.indexOf(p.ZK_ID) > -1) {
					p.EB_ISDELETE = '1';
				}
			});
			res.json(MsgJsonHelper.DefaultJson(null, true, ''));
		} else {
			res.json(MsgJsonHelper.DebugJson('删除失败，请重新尝试'));
		}
	});
}

/**
 * 获取系统参数详情
 * @param {*} req
 * @param {*} res
 */
function GetParamDetail(req, res) {
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
		.Query(QueryModel.ZK_PARAMINFO, condition, null, 0, 0, false, new SortParam())
		.then(m => {
			if (m.result.length > 0) {
				res.json(MsgJsonHelper.DefaultJson(m.result[0], true, m.recordcount.toString()));
			} else {
				res.json(MsgJsonHelper.DebugJson('暂无更多信息'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('GetParamDetail接口请求异常'));
		});
}

/**
 * 新增系统参数
 * @param {*} req
 * @param {*} res
 */
function InsertParam(req, res) {
	let record = new ZK_PARAMINFO();
	record.EB_CREATEBY = req.UserInfo.ZK_ID;
	record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	record.ZK_ID = Public.BuildCode();
	record.ZK_KEY = req.body['ZK_KEY'] || '';
	record.ZK_VALUE = req.body['ZK_VALUE'] || '';
	record.ZK_DESC = req.body['ZK_DESC'] || '';
	record.EB_ISDELETE = '0';
	if (!/^[A-Za-z0-9]{1,32}$/g.test(record.ZK_KEY)) {
		res.json(MsgJsonHelper.DebugJson('键不符合规则，请重新输入'));
		return false;
	}
	ds.GetTable('select * from ZK_PARAMINFO where ZK_KEY = ' + ds.parse(record.ZK_KEY))
		.then(dt => {
			if (dt.length > 0) {
				res.json(MsgJsonHelper.DebugJson('键要保证全局唯一，不能重复，请修改数据'));
			} else {
				ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Create))
					.then(flag => {
						if (flag) {
							global['SYS_PARAMINFO'].push(record);
						}
						res.json(
							MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '新增失败，请检查数据后重新提交')
						);
					})
					.catch(err => {
						res.json(MsgJsonHelper.DebugJson('保存失败'));
					});
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('InsertParam接口请求异常'));
		});
}

/**
 * 更新系统参数
 * @param {*} req
 * @param {*} res
 */
function UpdateParam(req, res) {
	let record = new ZK_PARAMINFO();
	record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	record.ZK_ID = req.body['ZK_ID'] || '';
	record.ZK_KEY = req.body['ZK_KEY'] || '';
	record.ZK_VALUE = req.body['ZK_VALUE'] || '';
	record.ZK_DESC = req.body['ZK_DESC'] || '';
	record.EB_LASTMODIFY_DATETIME = Public.StringToDate(req.body['EB_LASTMODIFY_DATETIME']);
	record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	if (!/^[A-Za-z0-9]{1,32}$/g.test(record.ZK_KEY)) {
		res.json(MsgJsonHelper.DebugJson('键不符合规则，请重新输入'));
		return false;
	}
	ds.GetTable(
		'select * from ZK_PARAMINFO where ZK_KEY = ' +
			ds.parse(record.ZK_KEY) +
			' and ZK_ID !=' +
			ds.parse(record.ZK_ID)
	)
		.then(dt => {
			if (dt.length > 0) {
				res.json(MsgJsonHelper.DebugJson('键要保证全局唯一，不能重复，请修改数据'));
			} else {
				ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Update))
					.then(flag => {
						if (flag) {
							global['SYS_PARAMINFO'].push(record);
						}
						res.json(
							MsgJsonHelper.DefaultJson(null, flag, flag ? '更新成功' : '更新失败，请检查数据后重新提交')
						);
					})
					.catch(err => {
						res.json(MsgJsonHelper.DebugJson('更新失败'));
					});
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('UpdateParam接口请求异常'));
		});
}

module.exports = router;
