const express = require('express');
const router = express.Router();
const DataAccess = require('../common/DataAccess');
const client = require('../common/ServiceClient');
const { MsgJsonHelper, QueryModel, MemoryCondition, MType, MLogic, MOperator, SortParam, Direction, OperationEnum, Public } = require('../common/common.module');
const Routebase = require('./route.base');
const ZK_INVESTMENT = require('../model/ZK_INVESTMENT');

const ds = new DataAccess();

router.get("/", function (req, res, next) {
    if (!Routebase.IsLogin(req, res)) { return; }
    if (!Routebase.IsPermit(req, res, "00053")) { return; }
    switch (req.query["method"]) {
        case "Backend_GetInvestmentList": GetInvestmentList(req, res); break;
        case "Backend_GetInvestmentDetail": GetInvestmentDetail(req, res); break;
        case "Backend_DeleteInvestment": DeleteInvestment(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});


router.post("/", function (req, res, next) {
    if (!Routebase.IsLogin(req, res)) { return; }
    if (!Routebase.IsPermit(req, res, "00053")) { return; }
    switch (req.query["method"]) {
        case "Backend_DeleteInvestment": DeleteInvestment(req, res); break;
        case "Backend_UpdateInvestment": UpdateInvestment(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});


/**
 * 获取投融事件列表
 * @param {*} req 
 * @param {*} res 
 */
function GetInvestmentList(req, res) {
    let keyword = req.query["KEYWORD"] === undefined ? "" : req.query["KEYWORD"].toString();
    let type = req.query["TYPE"] === undefined ? "" : req.query["TYPE"].toString();
    let prop = req.query["PROP"] === undefined ? "" : req.query["PROP"].toString();
    let order = req.query["ORDER"] === undefined ? "" : req.query["ORDER"].toString();
    let pagesize = req.query["PAGESIZE"] === undefined ? "1" : req.query["PAGESIZE"].toString();
    let pageno = req.query["PAGENO"] === undefined ? "1" : req.query["PAGENO"].toString();
    let sort = null;
    let condition = [];
    if (keyword) {
        condition.push(new MemoryCondition({
            Field: type,
            Logic: MLogic.And,
            Operator: MOperator.Like,
            Type: MType.Mstring,
            value: keyword
        }));
    }
    if (prop && order) {
        sort = new SortParam({
            Field: prop,
            SortDirection: order == "descending" ? Direction.DESC : Direction.ASC
        });
    } else {
        sort = new SortParam({
            Field: "EB_CREATE_DATETIME",
            SortDirection: Direction.DESC
        });
    }
    client.Query(QueryModel.ZK_INVESTMENT, condition, null, Number.parseInt(pagesize, 10), Number.parseInt(pageno, 10), true, sort).then(m => {
        if (m.result.length > 0) {
            res.json(MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString()));
        }
        else {
            res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("GetInvestmentList接口请求异常"));
    });
}

/**
 * 获取投融事件详情
 * @param {*} req 
 * @param {*} res 
 */
function GetInvestmentDetail(req, res) {
    let id = req.query["UID"] === undefined ? "" : req.query["UID"].toString();
    let condition = [];
    condition.push(new MemoryCondition({
        Field: "ZK_ID",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: id
    }));
    client.Query(QueryModel.ZK_INVESTMENT, condition, null, 0, 0, false, new SortParam()).then(m => {
        if (m.result.length > 0) {
            res.json(MsgJsonHelper.DefaultJson(m.result[0], true, m.recordcount.toString()));
        }
        else {
            res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("GetInvestmentList接口请求异常"));
    });
}


/**
 * 删除投融事件
 * @param {*} req 
 * @param {*} res 
 */
function DeleteInvestment(req, res) {
    let ids = req.body["IDS"] === undefined ? "" : req.body["IDS"].toString();
    client.DeleteByIds(ZK_INVESTMENT, ids.split(",")).then(m => {
        if (m) {
            res.json(MsgJsonHelper.DefaultJson(null, true, ""));
        } else {
            res.json(MsgJsonHelper.DebugJson("删除失败，请重新尝试"));
        }
    });
}


/**
 * 更新投融事件信息
 * @param {*} req 
 * @param {*} res 
 */
function UpdateInvestment(req, res) {
    let record = new ZK_INVESTMENT();
    record.ZK_ID = req.body["ZK_ID"] || "";
    record.ZK_LOGO = req.body["ZK_LOGO"] || "";
    record.ZK_TITLE = req.body["ZK_TITLE"] || "";
    record.ZK_INDUSTRY = req.body["ZK_INDUSTRY"] || "";
    record.ZK_ROUNDS = req.body["ZK_ROUNDS"] || "";
    record.ZK_MONEY = req.body["ZK_MONEY"] || "";
    record.ZK_TIME = req.body["ZK_TIME"] || "";
    record.ZK_INVESTORS = req.body["ZK_INVESTORS"] || "";
    record.ZK_DESC = req.body["ZK_DESC"] || "";
    record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;

    ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.UpdateNoCheck)).then(m => {
        if (m) {
            res.json(MsgJsonHelper.DefaultJson(null, true, ""));
        } else {
            res.json(MsgJsonHelper.DebugJson("修改失败，请检查数据后重新提交"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("UpdateInvestment接口异常"));
    });
}

module.exports = router;
