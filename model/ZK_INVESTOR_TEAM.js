const propertys = [
  "ZK_ID",
  "ZK_PARENTID",
  "ZK_NAME",
  "ZK_AVATAR",
  "ZK_POSITION",
  "EB_ISDELETE",
  "EB_CREATE_DATETIME",
  "EB_CREATEBY",
  "EB_LASTMODIFYBY",
  "EB_LASTMODIFY_DATETIME"
];

class ZK_INVESTOR_TEAM {
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

module.exports = ZK_INVESTOR_TEAM;
