const express = require("express");
const router = express.Router();
const client = require("../common/ServiceClient");
const MsgJsonHelper = require("../common/MsgJsonHelper");
const Routebase = require("./route.base");
const child_process = require("child_process"); //可以使用shelljs运行cmd命令

router.post("/", function(req, res, next) {
  if (!Routebase.IsLogin(req, res)) {
    return;
  }
  if (!Routebase.IsPermit(req, res, "00002")) {
    return;
  }
  switch (req.query["method"]) {
    case "reptile_investment":
      ReptileInvestment(req, res);
      break;
    case "reptile_investor":
      ReptileInvestor(req, res);
      break;
    default:
      res.json(MsgJsonHelper.DebugJson("接口请求错误"));
      break;
  }
});

/**
 * 调用投融事件爬虫程序
 * @param {*} req
 * @param {*} res
 */
function ReptileInvestment(req, res) {
  let localPath = "";
  let paramsCache = global["SYS_PARAMINFO"];
  paramsCache.forEach(permit => {
    if (permit.ZK_KEY === "ReptileInvestmentExe") {
      localPath = permit.ZK_VALUE;
    }
  });
  try {
    let fullpath = (process.cwd() + localPath).replace(/\\/g, "/");
    child_process.execFile(fullpath, (error, stdout, stderr) => {
      if (error !== null) {
        console.log("--------->· 外部应用程序调用失败 ·<---------");
        console.log(error);
      } else {
        console.log("--------->· 外部应用程序调用成功 ·<---------");
      }
    });
  } catch (err) {}
  res.json(
    MsgJsonHelper.DefaultJson(
      null,
      true,
      "程序启动成功，正在爬取投融事件信息（可在投融事件页面查看最新数据）"
    )
  );
}

/**
 * 调用投融机构爬虫程序
 * @param {*} req
 * @param {*} res
 */
function ReptileInvestor(req, res) {
  let localPath = "";
  let paramsCache = global["SYS_PARAMINFO"];
  paramsCache.forEach(permit => {
    if (permit.ZK_KEY === "ReptileInvestorExe") {
      localPath = permit.ZK_VALUE;
    }
  });
  try {
    let fullpath = (process.cwd() + localPath).replace(/\\/g, "/");
    child_process.execFile(fullpath, (error, stdout, stderr) => {
      if (error !== null) {
        console.log("--------->· 外部应用程序调用失败 ·<---------");
        console.log(error);
      } else {
        console.log("--------->· 外部应用程序调用成功 ·<---------");
      }
    });
  } catch (err) {}
  res.json(
    MsgJsonHelper.DefaultJson(
      null,
      true,
      "程序启动成功，正在爬取投资机构信息（可在投资机构页面查看最新数据）"
    )
  );
}

module.exports = router;
