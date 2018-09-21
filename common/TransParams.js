//定义TransParams实体类（翻译sql参数实体类）
const propertys = [
    "sql",
    "CheckEffectRow",
    "Errmsg",
    "l_dp" //DsParams实体类数组
];

class TransParams {
    constructor() {
        propertys.forEach(name => { this[name] = undefined; });
        this.set(arguments[0]);
        if (this.sql === undefined) { this.sql = ""; }
        if (this.CheckEffectRow === undefined) { this.CheckEffectRow = false; }
        if (this.Errmsg === undefined) { this.Errmsg = "数据已被其它操作员处编辑，请刷新数据后重试"; }
        if (this.l_dp === undefined) { this.l_dp = []; }
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


module.exports = TransParams;