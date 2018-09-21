const MType = require("./MType");
const Direction = require("./Direction")

//定义SortParam实体类（排序字段）
const propertys = [
    "Type",
    "Field",
    "SortDirection"
];

class SortParam {
    constructor() {
        propertys.forEach(name => { this[name] = undefined; });
        this.set(arguments[0]);
        if (this.Type === undefined) { this.Type = MType.Mstring; }
        if (this.Field === undefined) { this.Field = ""; }
        if (this.SortDirection === undefined) { this.SortDirection = Direction.ASC; }
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


module.exports = SortParam;