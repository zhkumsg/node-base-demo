const express = require("express");
const router = express.Router();
const client = require("../common/ServiceClient");
const MsgJsonHelper = require("../common/MsgJsonHelper");
const QueryModel = require("../common/QueryModel");
const MemoryCondition = require("../common/MemoryCondition");
const { MType, MLogic, MOperator } = require("msg-dataaccess-base");
const Routebase = require("./route.base");

router.get("/", function(req, res, next) {
  if (!Routebase.IsLogin(req, res)) {
    return;
  }
  if (!Routebase.IsPermit(req, res, "00001")) {
    return;
  }
  switch (req.query["method"]) {
    case "Backend_MenuTree":
      GetMenuTree(req, res);
      break;
    case "Backend_BindUserList":
      BindUserList(req, res);
      break;
    case "Backend_BindRoleList":
      BindRoleList(req, res);
      break;
    default:
      res.json(MsgJsonHelper.DebugJson("接口请求错误"));
      break;
  }
});

/**
 * 获取菜单树
 * @param {*} req
 * @param {*} res
 */
function GetMenuTree(req, res) {
  let keys = [];
  let condition = [];
  condition.push(
    new MemoryCondition({
      Field: "ZK_ID",
      Logic: MLogic.And,
      Operator: MOperator.In,
      Type: MType.Mstring,
      value: keys.join(",")
    })
  );
  client
    .Query(QueryModel.ZK_PERMITINFO, condition, null, 0, 0, false, null)
    .then(m => {
      if (m.result.length === 0) {
        res.json(MsgJsonHelper.DebugJson("暂无权限数据"));
      } else {
        res.json(MsgJsonHelper.DefaultJson(m.result, true, ""));
      }
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("GetMenuTree接口请求异常"));
    });
}

/**
 * 获取用户下拉
 * @param {*} req
 * @param {*} res
 */
function BindUserList(req, res) {
  res.json(MsgJsonHelper.DebugJson("暂未开发用户下拉列表"));
}

/**
 * 获取角色下拉
 * @param {*} req
 * @param {*} res
 */
function BindRoleList(req, res) {
  Routebase.ValidRole(req.UserInfo.ZK_ROLE)
    .then(roles => {
      if (roles.length === 0) {
        res.json(MsgJsonHelper.DebugJson("暂无您能获取的权限信息"));
      } else {
        res.json(MsgJsonHelper.DefaultJson(roles, true, ""));
      }
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("BindRoleList接口请求异常"));
    });
}

module.exports = router;
