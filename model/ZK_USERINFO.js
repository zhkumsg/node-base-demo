//定义ZK_USERINFO实体类
const propertys = [
  "ZK_ID",
  "ZK_OPENID",
  "ZK_PASSWORD",
  "ZK_NAME",
  "ZK_SEX",
  "ZK_PHONE",
  "ZK_EMAIL",
  "ZK_ROLE",
  "ZK_DEPARTMENT",
  "ZK_REMARK",
  "ZK_HEAD_PORTRAIT",
  "ZK_USERSOURCE",
  "EB_CREATE_DATETIME",
  "EB_CREATEBY",
  "EB_LASTMODIFYBY",
  "EB_LASTMODIFY_DATETIME"
];

class ZK_USERINFO {
  constructor() {
    propertys.forEach(name => {
      this[name] = undefined;
    });
    this.set(arguments[0]);
  }
  get(key) {
    return this[key];
  }
  set() {
    if (typeof arguments[0] === "object") {
      for (let name in arguments[0]) {
        if (propertys.indexOf(name) > -1) {
          this[name] = arguments[0][name];
        }
      }
    }
  }
}

module.exports = ZK_USERINFO;
