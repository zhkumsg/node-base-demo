const propertys = [
  "ZK_ID",
  "ZK_PATH",
  "ZK_COMPONENT",
  "ZK_NAME",
  "ZK_ISHIDDEN",
  "ZK_ICON",
  "ZK_ISLEAF",
  "ZK_PARENT",
  "ZK_SORT",
  "EB_ISDELETE",
  "EB_CREATEBY",
  "EB_CREATE_DATETIME",
  "EB_LASTMODIFYBY",
  "EB_LASTMODIFY_DATETIME"
];

class ZK_PERMITINFO {
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

module.exports = ZK_PERMITINFO;
