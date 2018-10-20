const express = require('express');
const router = express.Router();
const DataAccess = require('../common/DataAccess');
const MySqlHelper = require('../common/MySqlHelper');
const client = require('../common/ServiceClient');
const { MsgJsonHelper, QueryModel, MemoryCondition, MType, MLogic, MOperator, SortParam, Direction, OperationEnum, Public } = require('../common/common.module');
const Routebase = require('./route.base');
const { ZK_INVESTOR } = require('../model/model.module');

const ds = new DataAccess();

router.get("/", function (req, res, next) {
    if (!Routebase.IsLogin(req, res)) { return; }
    if (!Routebase.IsPermit(req, res, "00052")) { return; }
    switch (req.query["method"]) {
        case "Backend_GetInvestorList": GetInvestorList(req, res); break;
        case "Backend_GetInvestorDetail": GetInvestorDetail(req, res); break;
        case "Backend_GetTargetDetail": GetTargetDetail(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});

router.post("/", function (req, res, next) {
    if (!Routebase.IsLogin(req, res)) { return; }
    if (!Routebase.IsPermit(req, res, "00052")) { return; }
    switch (req.query["method"]) {
        case "Backend_DeleteInvestor": DeleteInvestor(req, res); break;
        case "Backend_UpdateInvestor": UpdateInvestor(req, res); break;
        case "Backend_SyncTarget": SyncTarget(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});




router.post("/", function (req, res, next) {
    if (!Routebase.IsLogin(req, res)) { return; }
    if (!Routebase.IsPermit(req, res, "00052")) { return; }
    switch (req.query["method"]) {
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});


/**
 * 获取投融机构列表
 * @param {*} req 
 * @param {*} res 
 */
function GetInvestorList(req, res) {
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
    client.Query(QueryModel.ZK_INVESTOR, condition, null, Number.parseInt(pagesize, 10), Number.parseInt(pageno, 10), true, sort).then(m => {
        if (m.result.length > 0) {
            res.json(MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString()));
        }
        else {
            res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("GetInvestorList接口请求异常"));
    });
}


/**
 * 获取投融机构详情
 * @param {*} req 
 * @param {*} res 
 */
function GetInvestorDetail(req, res) {
    let id = req.query["UID"] === undefined ? "" : req.query["UID"].toString();
    let condition = [];
    condition.push(new MemoryCondition({
        Field: "ZK_ID",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: id
    }));
    condition.push(new MemoryCondition({
        Field: "ZK_PARENTID",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: id
    }));
    client.Query(QueryModel.ZK_INVESTOR, [condition[0]], null, 0, 0, false, new SortParam()).then(m1 => {
        console.log(123456,m1);
        if (m1.result.length > 0) {
            client.Query(QueryModel.ZK_INVESTOR_CASE, [condition[1]], null, 0, 0, false, new SortParam()).then(m2 => {
                client.Query(QueryModel.ZK_INVESTOR_TEAM, [condition[1]], null, 0, 0, false, new SortParam()).then(m3 => {
                    res.json(MsgJsonHelper.DefaultJson({
                        "ZK_INVESTOR": m1.result[0],
                        "ZK_INVESTOR_CASES": m2.result,
                        "ZK_INVESTOR_TEAMS": m3.result
                    }, true, m1.recordcount.toString()));
                });
            });
        }
        else {
            res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("GetInvestorDetail接口请求异常"));
    });
}


/**
 * 删除投融机构
 * @param {*} req 
 * @param {*} res 
 */
function DeleteInvestor(req, res) {
    let ids = req.body["IDS"] === undefined ? "" : req.body["IDS"].toString();
    client.DeleteByIds(ZK_INVESTOR, ids.split(",")).then(m => {
        if (m) {
            res.json(MsgJsonHelper.DefaultJson(null, true, ""));
        } else {
            res.json(MsgJsonHelper.DebugJson("删除失败，请重新尝试"));
        }
    });
}


/**
 * 更新投资机构
 * @param {*} req 
 * @param {*} res 
 */
function UpdateInvestor(req, res) {
    let record = new ZK_INVESTOR();
    record.ZK_ID = req.body["ZK_ID"] || "";
    record.ZK_LOGO = req.body["ZK_LOGO"] || "";
    record.ZK_TITLE = req.body["ZK_TITLE"] || "";
    record.ZK_DESC = req.body["ZK_DESC"] || "";
    record.EB_LASTMODIFY_DATETIME = Public.StringToDate(req.body["EB_LASTMODIFY_DATETIME"]);
    record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
    ds.TransRunQuery(Public.OperationSQLParams(record, OperationEnum.Update)).then(flag => {
        if (flag) {
            res.json(MsgJsonHelper.DefaultJson(null, true, ""));
        } else {
            res.json(MsgJsonHelper.DebugJson("修改失败，请刷新页面重新提交或检查数据"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("UpdateInvestor接口异常"));
    });
}


/**
 * 获取目标数据库的机构详情
 * @param {*} req 
 * @param {*} res 
 */
function GetTargetDetail(req, res) {
    let id = req.query["UID"] === undefined ? "" : req.query["UID"].toString();
    let condition = [];
    condition.push(new MemoryCondition({
        Field: "ZK_ID",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: id
    }));
    client.Query(QueryModel.ZK_INVESTOR, condition, null, 0, 0, false, new SortParam()).then(m => {
        if (m.result.length > 0) {
            let name = m.result[0].ZK_TITLE;
            new MySqlHelper().GetTable("select * from mc_investor_org where status = 1 and name like '%" + name + "%'").then(dt => {
                let result = [];
                if (dt.length > 0) {
                    dt.forEach(item => {
                        let _item = { ZK_INVESTOR: {}, ZK_INVESTOR_CASES: [], ZK_INVESTOR_TEAMS: [] };
                        _item.ZK_INVESTOR = {
                            ZK_ID: item.id.toString(),
                            ZK_LOGO: item.icon.toString(),
                            ZK_TITLE: item.name.toString(),
                            ZK_DESC: item.description.toString()
                        };
                        if (item.case_detail[0] === "[") {
                            JSON.parse(item.case_detail).forEach(caseitem => {
                                _item.ZK_INVESTOR_CASES.push({
                                    ZK_TITLE: caseitem.name,
                                    ZK_MONEY: caseitem.money,
                                    ZK_INDUSTRY: caseitem.industry,
                                    ZK_ROUNDS: caseitem.rounds,
                                    ZK_TIME: caseitem.update_time
                                });
                            });
                        }
                        if (item.team[0] === "[") {
                            JSON.parse(item.team).forEach(teamitem => {
                                _item.ZK_INVESTOR_TEAMS.push({
                                    ZK_NAME: teamitem.name,
                                    ZK_AVATAR: teamitem.avatar,
                                    ZK_POSITION: teamitem.position
                                });
                            });
                        }
                        result.push(_item);
                    });
                }
                res.json(MsgJsonHelper.DefaultJson(result, true, ""));
            });
        }
        else {
            res.json(MsgJsonHelper.DebugJson("记录不存在"));
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("GetTargetDetail接口请求异常"));
    });
}


/**
 * 同步数据到目标数据库
 * @param {*} req 
 * @param {*} res 
 */
function SyncTarget(req, res) {
    res.json(MsgJsonHelper.DebugJson("接口准备中"));
}


module.exports = router;