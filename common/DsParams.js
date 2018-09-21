//定义DsParams实体类（key-value）
const propertys = [
    "paramsname",
    "paramsvalue"
];

class DsParams {
    constructor() {
        propertys.forEach(name => { this[name] = undefined; });
        this.set(arguments[0]);
        if (this.paramsname === undefined) { this.paramsname = ""; }
        if (this.paramsvalue === undefined) { this.paramsvalue = null; }
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


module.exports = DsParams;