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
const { ZK_INFORMATION } = require('../model/model.module');

const ds = new DataAccess();

router.get('/', function(req, res, next) {
	if (!Routebase.IsLogin(req, res)) {
		return;
	}
	if (!Routebase.IsPermit(req, res, '00033')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_GetInfotmationList':
			GetInfotmationList(req, res);
			break;
		case 'Backend_GetInfotmationDetail':
			GetInfotmationDetail(req, res);
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
	if (!Routebase.IsPermit(req, res, '00033')) {
		return;
	}
	switch (req.query['method']) {
		case 'Backend_UpdateInformation':
			UpdateInformation(req, res);
			break;
		case 'Backend_InsertInformation':
			InsertInformation(req, res);
			break;
		case 'Backend_DeleteInformation':
			DeleteInformation(req, res);
			break;
		case 'Backend_UploadCoverImg':
			UploadCoverImg(req, res);
			break;
		default:
			res.json(MsgJsonHelper.DebugJson('接口请求错误'));
			break;
	}
});

/**
 * 获取文章列表
 * @param {*} req
 * @param {*} res
 */
function GetInfotmationList(req, res) {
	let navid = req.query['NAVID'] === undefined ? '' : req.query['NAVID'].toString();
	let keyword = req.query['KEYWORD'] === undefined ? '' : req.query['KEYWORD'].toString();
	let type = req.query['TYPE'] === undefined ? '' : req.query['TYPE'].toString();
	let prop = req.query['PROP'] === undefined ? '' : req.query['PROP'].toString();
	let order = req.query['ORDER'] === undefined ? '' : req.query['ORDER'].toString();
	let pagesize = req.query['PAGESIZE'] === undefined ? '1' : req.query['PAGESIZE'].toString();
	let pageno = req.query['PAGENO'] === undefined ? '1' : req.query['PAGENO'].toString();
	let sort = null;
	if (!navid) {
		return res.json(MsgJsonHelper.DebugJson('参数异常'));
	}
	let condition = [];
	condition.push(
		new MemoryCondition({
			Field: 'ZK_NAVID',
			Logic: MLogic.And,
			Operator: MOperator.Equal,
			Type: MType.Mstring,
			value: navid,
		})
	);
	condition.push(
		new MemoryCondition({
			Field: 'EB_ISDELETE',
			Logic: MLogic.And,
			Operator: MOperator.Equal,
			Type: MType.Mstring,
			value: '0',
		})
	);
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
			QueryModel.ZK_INFORMATION_BASE,
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
			res.json(MsgJsonHelper.DebugJson('GetInfotmationList接口请求异常'));
		});
}

/**
 * 获取文章详情
 * @param {*} req
 * @param {*} res
 */
function GetInfotmationDetail(req, res) {
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
		.Query(QueryModel.ZK_INFORMATION, condition, null, 0, 0, false, new SortParam())
		.then(m => {
			if (m.result.length > 0) {
				res.json(MsgJsonHelper.DefaultJson(m.result[0], true, m.recordcount.toString()));
			} else {
				res.json(MsgJsonHelper.DebugJson('暂无更多信息'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('GetInfotmationDetail接口请求异常'));
		});
}

/**
 * 更新文章
 * @param {*} req
 * @param {*} res
 */
function UpdateInformation(req, res) {
	let record = new ZK_INFORMATION();
	record.EB_LASTMODIFY_DATETIME = req.body['EB_LASTMODIFY_DATETIME'];
	record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	record.ZK_AUTHOR = req.body['ZK_AUTHOR'] || '';
	record.ZK_COVERIMG = req.body['ZK_COVERIMG'] || '';
	record.ZK_NAVID = req.body['ZK_NAVID'] || '';
	record.ZK_PUBDATE = req.body['ZK_PUBDATE'] || '';
	record.ZK_SORT = Number.parseInt(req.body['ZK_SORT'] || '0');
	record.ZK_TITLE = req.body['ZK_TITLE'] || '';
	record.ZK_DESC = req.body['ZK_DESC'] || '';
	record.ZK_ID = req.body['ZK_ID'] || '';
	if (!record.ZK_ID) {
		res.json(MsgJsonHelper.DebugJson('缺少参数'));
		return false;
	}
	ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Update))
		.then(flag => {
			//todo 分词搜索处理
			res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '修改失败，请检查数据后重新提交'));
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('UpdateInformation接口请求异常'));
		});
}

/**
 * 新增文章
 * @param {*} req
 * @param {*} res
 */
function InsertInformation(req, res) {
	let record = new ZK_INFORMATION();
	record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
	record.EB_CREATEBY = req.UserInfo.ZK_ID;
	record.ZK_AUTHOR = req.body['ZK_AUTHOR'] || '';
	record.ZK_COVERIMG = req.body['ZK_COVERIMG'] || '';
	record.ZK_NAVID = req.body['ZK_NAVID'] || '';
	record.ZK_PUBDATE = req.body['ZK_PUBDATE'] || '';
	record.ZK_SORT = Number.parseInt(req.body['ZK_SORT'] || '0');
	record.ZK_TITLE = req.body['ZK_TITLE'] || '';
	record.ZK_DESC = req.body['ZK_DESC'] || '';
	record.EB_ISDELETE = '0';
	record.ZK_ID = Public.BuildCode();
	ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Create))
		.then(flag => {
			//todo 分词搜索处理
			res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '新增失败，请检查数据后重新提交'));
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('InsertInformation接口请求异常'));
		});
}

/**
 * 删除文章
 * @param {*} req
 * @param {*} res
 */
function DeleteInformation(req, res) {
	let ids = req.body['IDS'] === undefined ? '' : req.body['IDS'].toString();
	client
		.DeleteByIds(ZK_INFORMATION, ids.split(','))
		.then(m => {
			if (m) {
				res.json(MsgJsonHelper.DefaultJson(null, true, ''));
			} else {
				res.json(MsgJsonHelper.DebugJson('删除失败，请重新尝试'));
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('DeleteInformation接口请求异常'));
		});
}

/**
 * 上传封面图片
 * @param {*} req
 * @param {*} res
 */
function UploadCoverImg(req, res) {
	//todo 上传文件
	res.json(
		MsgJsonHelper.DefaultJson(
			'https://upload.jianshu.io/users/upload_avatars/13908708/22237056-7986-477c-b647-e45929096a1f.jpg',
			true,
			''
		)
	);
}

module.exports = router;
