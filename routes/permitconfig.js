const express = require("express");
const router = express.Router();
const client = require("../common/ServiceClient");
const MsgJsonHelper = require("../common/MsgJsonHelper");
const QueryModel = require("../common/QueryModel");
const MemoryCondition = require("../common/MemoryCondition");
const {
  DataAccess,
  MType,
  MLogic,
  MOperator,
  SortParam,
  Direction,
  OperationEnum,
  Public
} = require("msg-dataaccess-base");
const Routebase = require("./route.base");

const ds = new DataAccess();

router.get("/", function(req, res, next) {
  if (!Routebase.IsLogin(req, res)) {
    return;
  }
  if (!Routebase.IsPermit(req, res, "00021")) {
    return;
  }
  switch (req.query["method"]) {
    case "Backend_BindRoleList":
      BindRoleList(req, res);
      break;
    case "Backend_BindPermitList":
      BindPermitList(req, res);
      break;
    default:
      res.json(MsgJsonHelper.DebugJson("接口请求错误"));
      break;
  }
});

router.post("/", function(req, res, next) {
  if (!Routebase.IsLogin(req, res)) {
    return;
  }
  if (!Routebase.IsPermit(req, res, "00021")) {
    return;
  }
  switch (req.query["method"]) {
    case "Backend_GetPermitList":
      GetPermitList(req, res);
      break;
    case "Backend_UpdatePermitConfig":
      UpdatePermitConfig(req, res);
      break;
    default:
      res.json(MsgJsonHelper.DebugJson("接口请求错误"));
      break;
  }
});

/**
 * 获取角色列表
 * @param {*} req
 * @param {*} res
 */
function BindRoleList(req, res) {
  let condition = [];
  condition.push(
    new MemoryCondition({
      Field: "EB_ISDELETE",
      Logic: MLogic.And,
      Operator: MOperator.Equal,
      Type: MType.Mstring,
      value: "0"
    })
  );
  let sort = new SortParam({
    Field: "ZK_LEAVE",
    SortDirection: Direction.DESC
  });
  client
    .Query(QueryModel.ZK_ROLEINFO, condition, null, 0, 0, false, sort)
    .then(m => {
      if (m.result.length > 0) {
        res.json(
          MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString())
        );
      } else {
        res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
      }
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("BindRoleList接口请求异常"));
    });
}

/**
 * 获取权限列表
 * @param {*} req
 * @param {*} res
 */
function BindPermitList(req, res) {
  let condition = [];
  condition.push(
    new MemoryCondition({
      Field: "EB_ISDELETE",
      Logic: MLogic.And,
      Operator: MOperator.Equal,
      Type: MType.Mstring,
      value: "0"
    })
  );
  client
    .Query(
      QueryModel.ZK_PERMITINFO,
      condition,
      null,
      0,
      0,
      false,
      new SortParam()
    )
    .then(m => {
      if (m.result.length > 0) {
        res.json(
          MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString())
        );
      } else {
        res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
      }
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("BindPermitList接口请求异常"));
    });
}

/**
 * 获取对应角色的权限列表
 * @param {*} req
 * @param {*} res
 */
function GetPermitList(req, res) {
  let condition = [];
  condition.push(
    new MemoryCondition({
      Field: "ZK_ROLE",
      Logic: MLogic.And,
      Operator: MOperator.Equal,
      Type: MType.Mstring,
      value: req.body["ROLE"]
    })
  );
  client
    .Query(
      QueryModel.ZK_PERMITCONFIG,
      condition,
      null,
      0,
      0,
      false,
      new SortParam()
    )
    .then(m => {
      if (m.result.length > 0) {
        res.json(
          MsgJsonHelper.DefaultJson(m.result, true, m.recordcount.toString())
        );
      } else {
        res.json(MsgJsonHelper.DebugJson("暂无该权限的配置信息"));
      }
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("GetPermitList接口请求异常"));
    });
}

/**
 * 更新权限配置
 * @param {*} req
 * @param {*} res
 */
function UpdatePermitConfig(req, res) {
  let permits = req.body["PERMITS"].split(",");
  let role = req.body["ROLE"];
  if (!role) {
    res.json(MsgJsonHelper.DebugJson("缺少条件更新"));
    return false;
  }
  let sqlstr = [];
  sqlstr.push("DELETE from ZK_PERMITCONFIG WHERE ZK_ROLE = " + ds.parse(role));
  if (permits.length > 0) {
    permits.forEach(item => {
      sqlstr.push(
        "INSERT INTO ZK_PERMITCONFIG (ZK_ID, ZK_PERMITID, ZK_ROLE) VALUES(" +
          ds.parse(Public.BuildCode()) +
          "," +
          ds.parse(item) +
          "," +
          ds.parse(role) +
          ")"
      );
    });
  }
  ds.RunQuery(sqlstr.join(";"))
    .then(flag => {
      if (flag) {
        res.json(MsgJsonHelper.DefaultJson("", true, "更新成功"));
      } else {
        res.json(MsgJsonHelper.DebugJson("更新失败，请重新尝试"));
      }
    })
    .catch(err => {
      console.log(err);
      res.json(MsgJsonHelper.DebugJson("UpdatePermitConfig接口请求异常"));
    });
}

module.exports = router;
