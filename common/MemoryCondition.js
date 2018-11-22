const { MType, MLogic, MOperator } = require("msg-dataaccess-base");

//定义MemoryCondition实体类（查询条件）
const propertys = [
  "Type",
  "Field",
  "Operator",
  "value",
  "Logic",
  "subCondition"
];

class MemoryCondition {
  constructor() {
    propertys.forEach(name => {
      this[name] = undefined;
    });
    this.set(arguments[0]);
    if (this.Type === undefined) {
      this.Type = MType.Mstring;
    }
    if (this.Field === undefined) {
      this.Field = "";
    }
    if (this.Operator === undefined) {
      this.Operator = MOperator.Like;
    }
    if (this.Logic === undefined) {
      this.Logic = MLogic.And;
    }
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

module.exports = MemoryCondition;
