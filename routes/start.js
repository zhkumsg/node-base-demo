const express = require('express');
const router = express.Router();
const client = require('../common/ServiceClient');
const { MsgJsonHelper, QueryModel, MemoryCondition, MType, MLogic, MOperator } = require('../common/common.module');
const TokenHelper = require('../common/TokenHelper');


router.post("/", function (req, res, next) {
    switch (req.query["method"]) {
        case "Backend_Login": Login(req, res); break;
        case "Backend_Logout": Logout(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});

router.get("/", function (req, res, next) {
    switch (req.query["method"]) {
        case "Backend_Verifylogin": Verifylogin(req, res); break;
        default: res.json(MsgJsonHelper.DebugJson("接口请求错误")); break;
    }
});


/**
 * 登录
 * @param {*} req 
 * @param {*} res 
 */
function Login(req, res) {
    let id = req.body.ID;
    let pwd = req.body.PWD;
    let condition = [];
    condition.push(new MemoryCondition({
        Field: "ZK_ID",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: id
    }));
    condition.push(new MemoryCondition({
        Field: "ZK_PASSWORD",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: pwd
    }));
    client.Query(QueryModel.ZK_USERINFO, condition, null, 0, 0, false, null).then(m => {
        if (m.result.length === 0) {
            res.json(MsgJsonHelper.DebugJson("账号密码错误"));
        } else {
            VolidRole(m.result[0], res);
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("Login接口请求异常"));
    });
}

/**
 * 检查是否在线
 * @param {*} res 
 */
function Verifylogin(req, res) {
    let user = req.UserInfo;
    if (user) {
        user["ZK_PASSWORD"] = user["ZK_PASSWORD"].replace(/^(.{5})(.+)(.{5})$/, "$1*****$3");
    }
    res.json(MsgJsonHelper.DefaultJson(user, user === undefined ? false : true, ""));
}


/**
 * 退出登录
 * @param {*} req 
 * @param {*} res 
 */
function Logout(req, res) {
    res.json(MsgJsonHelper.DefaultJson("", true, "请清空登录票据"));
}


/**
 * 检查用户角色
 * @param {*} userinfo 
 * @param {*} res 
 */
function VolidRole(userinfo, res) {
    let condition = [];
    condition.push(new MemoryCondition({
        Field: "ZK_ID",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: userinfo.ZK_ROLE
    }));
    client.Query(QueryModel.ZK_ROLEINFO, condition, null, 0, 0, false, null).then(m => {
        if (m.result.length === 0) {
            res.json(MsgJsonHelper.DebugJson("角色异常"));
        } else {
            let role = m.result[0];
            if (role.ZK_ISADMIN == "1") {
                SavePermits(userinfo, res);
            } else {
                res.json(MsgJsonHelper.DebugJson("您还不是管理员，请联系管理员升级权限"));
            }
        }
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("VolidRole接口请求异常"));
    });
}


/**
 * 保存用户权限
 * @param {*} userinfo 
 * @param {*} res 
 */
function SavePermits(userinfo, res) {
    let condition = [];
    condition.push(new MemoryCondition({
        Field: "ZK_ROLE",
        Logic: MLogic.And,
        Operator: MOperator.Equal,
        Type: MType.Mstring,
        value: userinfo.ZK_ROLE
    }));
    client.Query(QueryModel.ZK_PERMITCONFIG, condition, null, 0, 0, false, null).then(m => {
        let permitIds = [];
        m.result.forEach(permit => {
            permitIds.push(permit.ZK_PERMITID);
        });
        res.json(MsgJsonHelper.DefaultJson({
            accessToken: TokenHelper.set(userinfo),
            permitToken: TokenHelper.set(m.result)
        }, true, ""));
    }).catch(err => {
        res.json(MsgJsonHelper.DebugJson("SavePermits接口请求异常"));
    });
}

module.exports = router;
