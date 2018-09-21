const MLogic = require("./MLogic");

//定义SubCondition实体类（子查询条件）
const propertys = [
    "toParentLogic",
    "l_Condition" //为MemoryCondition数组
];

class SubCondition {
    constructor() {
        propertys.forEach(name => { this[name] = undefined; });
        this.set(arguments[0]);
        if (this.toParentLogic === undefined) { this.toParentLogic = MLogic.And; }
        if (this.l_Condition === undefined) { this.l_Condition = []; }
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


module.exports = SubCondition;