const express = require('express');
const router = express.Router();
const DataAccess = require('../common/DataAccess');
const client = require('../common/ServiceClient');
const { MsgJsonHelper, QueryModel, MemoryCondition, MType, MLogic, MOperator, SortParam, Direction, OperationEnum, Public } = require('../common/common.module');
const Routebase = require('./route.base');
const ZK_PERMITINFO = require('../model/ZK_PERMITINFO');

const ds = new DataAccess();

router.get("/", function (req, res, next) {
    if (!Routebase.IsLogin(req, res)) { return; }
    if (!Routebase.IsPermit(req, res, "00028")) { return; }
    switch (req.query["method"]) {
        case "Backend_GetPermitList": GetPermitList(req, res); break;
        case "Backend_GetPermitDetail": GetPermitDetail(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});

router.post("/", function (req, res, next) {
    if (!Routebase.IsLogin(req, res)) { return; }
    if (!Routebase.IsPermit(req, res, "00028")) { return; }
    switch (req.query["method"]) {
        case "Backend_DeletePermit": DeletePermit(req, res); break;
        case "Backend_InsertPermit": InsertPermit(req, res); break;
        case "Backend_UpdatePermit": UpdatePermit(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});


/**
 * 获取权限列表
 * @param {*} req 
 * @param {*} res 
 */
function GetPermitList(req, res) {
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
    client.Query(QueryModel.ZK_PERMITINFO, condition, null, Number.parseInt(pagesize, 10), Number.parseInt(pageno, 10), true, sort).then(m => {
        if (m.result.length > 0) {
            res.json(MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString()));
        }
        else {
            res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("GetPermitList接口请求异常"));
    });
}


/**
 * 获取权限详情
 * @param {*} req 
 * @param {*} res 
 */
function GetPermitDetail(req, res) {
    let id = req.query["UID"] === undefined ? "" : req.query["UID"].toString();
    let condition = [];
    condition.push(new MemoryCondition({
        Field: "ZK_ID",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: id
    }));
    client.Query(QueryModel.ZK_PERMITINFO, condition, null, 0, 0, false, new SortParam()).then(m => {
        if (m.result.length > 0) {
            res.json(MsgJsonHelper.DefaultJson(m.result[0], true, m.recordcount.toString()));
        }
        else {
            res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("GetPermitDetail接口请求异常"));
    });
}


/**
 * 删除权限
 * @param {*} req 
 * @param {*} res 
 */
function DeletePermit(req, res) {
    let ids = req.body["IDS"] === undefined ? "" : req.body["IDS"].toString();
    client.DeleteByIds(ZK_PERMITINFO, ids.split(",")).then(m => {
        if (m) {
            res.json(MsgJsonHelper.DefaultJson(null, true, ""));
        } else {
            res.json(MsgJsonHelper.DebugJson("删除失败，请重新尝试"));
        }
    });
}


/**
 * 新增权限
 * @param {*} req 
 * @param {*} res 
 */
function InsertPermit(req, res) {
    let record = new ZK_PERMITINFO();
    record.EB_CREATE_DATETIME = new Date();
    record.EB_CREATEBY = req.UserInfo.ZK_ID;
    record.EB_LASTMODIFY_DATETIME = new Date();
    record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
    record.ZK_ID = req.body["ZK_ID"] || "";
    record.ZK_COMPONENT = req.body["ZK_COMPONENT"] || "";
    record.ZK_ICON = req.body["ZK_ICON"] || "";
    record.ZK_ISHIDDEN = req.body["ZK_ISHIDDEN"] || "";
    record.ZK_ISLEAF = req.body["ZK_ISLEAF"] || "";
    record.ZK_NAME = req.body["ZK_NAME"] || "";
    record.ZK_PARENT = req.body["ZK_PARENT"] || "";
    record.ZK_PATH = req.body["ZK_PATH"] || "";
    record.ZK_SORT = Number.parseInt(req.body["ZK_SORT"] || "0", 10);
    record.EB_ISDELETE = "0";
    if (!(/^[A-Za-z0-9]{1,32}$/g.test(record.ZK_ID))) {
        res.json(MsgJsonHelper.DebugJson("主键键不符合规则，请输入数字和英文"));
        return false;
    }
    ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Create)).then(flag => {
        res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? "保存成功" : "新增失败，请检查数据后重新提交"));
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("保存失败(请特别注意主键是否重复)"));
    });
}


/**
 * 更新权限
 * @param {*} req 
 * @param {*} res 
 */
function UpdatePermit(req, res) {
    let record = new ZK_PERMITINFO();
    record.EB_LASTMODIFY_DATETIME = new Date();
    record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
    record.ZK_ID = req.body["ZK_ID"] || "";
    record.ZK_COMPONENT = req.body["ZK_COMPONENT"] || "";
    record.ZK_ICON = req.body["ZK_ICON"] || "";
    record.ZK_ISHIDDEN = req.body["ZK_ISHIDDEN"] || "";
    record.ZK_ISLEAF = req.body["ZK_ISLEAF"] || "";
    record.ZK_NAME = req.body["ZK_NAME"] || "";
    record.ZK_PARENT = req.body["ZK_PARENT"] || "";
    record.ZK_PATH = req.body["ZK_PATH"] || "";
    record.ZK_SORT = Number.parseInt(req.body["ZK_SORT"] || "0", 10);
    record.EB_ISDELETE = "0";
    
    if (!(/^[A-Za-z0-9]{1,32}$/g.test(record.ZK_ID))) {
        res.json(MsgJsonHelper.DebugJson("主键键不符合规则，请输入数字和英文"));
        return false;
    }
    ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.UpdateNoCheck)).then(flag => {
        res.json(MsgJsonHelper.DefaultJson(null, flag, flag ? "保存成功" : "修改失败，请检查数据后重新提交"));
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("保存失败(请特别注意主键是否重复)"));
    });
}

module.exports = router;
