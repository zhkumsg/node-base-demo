//定义MemoryResult实体类（查询结果）
const propertys = [
    "recordcount",
    "pagecount",
    "result",
    "ErrorMsg"
];

class MemoryResult {
    constructor() {
        propertys.forEach(name => { this[name] = undefined; });
        this.set(arguments[0]);
        if (this["recordcount"] === undefined) { this["recordcount"] = 0; }
        if (this["pagecount"] === undefined) { this["pagecount"] = 0; }
        if (this["result"] === undefined) { this["result"] = []; }
        if (this["ErrorMsg"] === undefined) { this["ErrorMsg"] = ""; }
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


module.exports = MemoryResult;