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

router.post('/information', (req, res, next) => {
	let record = new ZK_INFORMATION();
	record.EB_LASTMODIFYBY = 'cmd';
	record.EB_CREATEBY = 'cmd';
	record.ZK_AUTHOR = req.body['ZK_AUTHOR'] || '';
	record.ZK_COVERIMG = req.body['ZK_COVERIMG'] || '';
	record.ZK_NAVID = req.body['ZK_NAVID'] || '';
	record.ZK_PUBDATE = req.body['ZK_PUBDATE'] || '';
	record.ZK_SORT = Number.parseInt(req.body['ZK_SORT'] || '0');
	record.ZK_TITLE = req.body['ZK_TITLE'] || '';
	record.ZK_DESC = req.body['ZK_DESC'] || '';
	record.EB_ISDELETE = '0';
	record.ZK_ID = req.body['ZK_ID'];
	if (!record.ZK_ID) {
		res.json(MsgJsonHelper.DebugJson('缺少参数'));
		return false;
	}
	let condition = [];
	condition.push(
		new MemoryCondition({
			Field: 'ZK_ID',
			Logic: MLogic.And,
			Operator: MOperator.Equal,
			Type: MType.Mstring,
			value: record.ZK_ID,
		})
	);
	client
		.Query(QueryModel.ZK_INFORMATION, condition, null, 0, 0, false, new SortParam())
		.then(m => {
			if (m.result.length > 0) {
				ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Update)).then(flag => {
					res.json(
						MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '修改失败，请检查数据后重新提交')
					);
				});
			} else {
				ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Create)).then(flag => {
					res.json(
						MsgJsonHelper.DefaultJson(null, flag, flag ? '保存成功' : '新增失败，请检查数据后重新提交')
					);
				});
			}
		})
		.catch(err => {
			res.json(MsgJsonHelper.DebugJson('information接口请求异常'));
		});
});

module.exports = router;
