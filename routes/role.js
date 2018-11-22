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
const ZK_ROLEINFO = require("../model/ZK_ROLEINFO");

const ds = new DataAccess();

router.get("/", function(req, res, next) {
  if (!Routebase.IsLogin(req, res)) {
    return;
  }
  if (!Routebase.IsPermit(req, res, "00026")) {
    return;
  }
  switch (req.query["method"]) {
    case "Backend_GetRoleList":
      GetRoleList(req, res);
      break;
    case "Backend_GetRoleDetail":
      GetRoleDetail(req, res);
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
  if (!Routebase.IsPermit(req, res, "00026")) {
    return;
  }
  switch (req.query["method"]) {
    case "Backend_DeleteRole":
      DeleteRole(req, res);
      break;
    case "Backend_InsertRole":
      InsertRole(req, res);
      break;
    case "Backend_UpdateRole":
      UpdateRole(req, res);
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
function GetRoleList(req, res) {
  let keyword =
    req.query["KEYWORD"] === undefined ? "" : req.query["KEYWORD"].toString();
  let type =
    req.query["TYPE"] === undefined ? "" : req.query["TYPE"].toString();
  let prop =
    req.query["PROP"] === undefined ? "" : req.query["PROP"].toString();
  let order =
    req.query["ORDER"] === undefined ? "" : req.query["ORDER"].toString();
  let pagesize =
    req.query["PAGESIZE"] === undefined
      ? "1"
      : req.query["PAGESIZE"].toString();
  let pageno =
    req.query["PAGENO"] === undefined ? "1" : req.query["PAGENO"].toString();
  let sort = null;
  let condition = [];
  if (keyword) {
    condition.push(
      new MemoryCondition({
        Field: type,
        Logic: MLogic.And,
        Operator: MOperator.Like,
        Type: MType.Mstring,
        value: keyword
      })
    );
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
  Routebase.ValidRole(req.UserInfo.ZK_ROLE).then(roles => {
    if (roles.length === 0) {
      res.json(MsgJsonHelper.DebugJson("您当前角色无权查看其它角色信息"));
      return;
    }
    let keys = [];
    roles.forEach(r => {
      keys.push(r.ZK_ID);
    });
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
      .Query(
        QueryModel.ZK_ROLEINFO,
        condition,
        null,
        Number.parseInt(pagesize, 10),
        Number.parseInt(pageno, 10),
        true,
        sort
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
        res.json(MsgJsonHelper.DebugJson("GetRoleList接口请求异常"));
      });
  });
}

/**
 * 获取角色详情
 * @param {*} req
 * @param {*} res
 */
function GetRoleDetail(req, res) {
  let id = req.query["UID"] === undefined ? "" : req.query["UID"].toString();
  let condition = [];
  condition.push(
    new MemoryCondition({
      Field: "ZK_ID",
      Logic: MLogic.And,
      Operator: MOperator.Equal,
      Type: MType.Mstring,
      value: id
    })
  );
  client
    .Query(
      QueryModel.ZK_ROLEINFO,
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
          MsgJsonHelper.DefaultJson(m.result[0], true, m.recordcount.toString())
        );
      } else {
        res.json(MsgJsonHelper.DebugJson("暂无更多信息"));
      }
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("GetRoleDetail接口请求异常"));
    });
}

/**
 * 删除角色信息
 * @param {*} req
 * @param {*} res
 */
function DeleteRole(req, res) {
  let ids = req.body["IDS"] === undefined ? "" : req.body["IDS"].toString();
  if (ids.split(",").indexOf("00001") > -1) {
    res.json(MsgJsonHelper.DebugJson("禁止删除超级管理员！"));
    return false;
  }
  if (ids.split(",").indexOf("00004") > -1) {
    res.json(MsgJsonHelper.DebugJson("禁止删除该记录！s"));
    return false;
  }
  client.DeleteByIds(ZK_ROLEINFO, ids.split(",")).then(m => {
    if (m) {
      res.json(MsgJsonHelper.DefaultJson(null, true, ""));
    } else {
      res.json(MsgJsonHelper.DebugJson("删除失败，请重新尝试"));
    }
  });
}

/**
 * 新增角色
 * @param {*} req
 * @param {*} res
 */
function InsertRole(req, res) {
  let record = new ZK_ROLEINFO();
  record.ZK_ID = Public.BuildCode();
  record.EB_CREATE_DATETIME = new Date();
  record.EB_CREATEBY = req.UserInfo.ZK_ID;
  record.EB_LASTMODIFY_DATETIME = new Date();
  record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
  record.ZK_ROLE = req.body["ZK_ROLE"] || "";
  record.ZK_DESC = req.body["ZK_DESC"] || "";
  record.ZK_ISADMIN = req.body["ZK_ISADMIN"] || "0";
  record.ZK_LEAVE = Number.parseInt(req.body["ZK_LEAVE"] || "-1", 10);
  record.EB_ISDELETE = "0";
  if (record.ZK_LEAVE < 0) {
    res.json(MsgJsonHelper.DebugJson("等级不规范，请重新填写"));
    return false;
  }
  ds.GetTable(
    "select * from ZK_ROLEINFO where (ZK_ROLE = " +
      ds.parse(record.ZK_ROLE) +
      " OR ZK_LEAVE = " +
      record.ZK_LEAVE +
      ") and EB_ISDELETE = '0'"
  )
    .then(dt => {
      if (dt.length > 0) {
        res.json(MsgJsonHelper.DebugJson("角色或等级已存在,请修改相关数据"));
      } else {
        ds.TransRunQuery(
          Public.OperationSQLParams(record, OperationEnum.Create)
        )
          .then(flag => {
            res.json(
              MsgJsonHelper.DefaultJson(
                null,
                flag,
                flag ? "保存成功" : "新增失败，请检查数据后重新提交"
              )
            );
          })
          .catch(err => {
            res.json(MsgJsonHelper.DebugJson("保存失败，请检查数据"));
          });
      }
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("InsertRole接口请求异常"));
    });
}

/**
 * 更新角色信息
 * @param {*} req
 * @param {*} res
 */
function UpdateRole(req, res) {
  let record = new ZK_ROLEINFO();
  record.ZK_ID = req.body["ZK_ID"] || "";
  record.EB_LASTMODIFYBY = req.UserInfo.ZK_ID;
  record.ZK_ROLE = req.body["ZK_ROLE"] || "";
  record.ZK_DESC = req.body["ZK_DESC"] || "";
  record.ZK_ISADMIN = req.body["ZK_ISADMIN"] || "0";
  record.ZK_LEAVE = Number.parseInt(req.body["ZK_LEAVE"] || "-1", 10);
  if (record.ZK_LEAVE < 0) {
    res.json(MsgJsonHelper.DebugJson("等级不规范，请重新填写"));
    return false;
  }
  if (record.ZK_ID === "00001") {
    delete record.ZK_LEAVE;
  }
  ds.TransRunQuery(
    Public.OperationSQLParams(record, OperationEnum.UpdateNoCheck)
  )
    .then(flag => {
      res.json(
        MsgJsonHelper.DefaultJson(
          null,
          flag,
          flag ? "保存成功" : "保存失败，请检查数据后重新提交"
        )
      );
    })
    .catch(err => {
      res.json(MsgJsonHelper.DebugJson("UpdateRole接口请求异常"));
    });
}

module.exports = router;
