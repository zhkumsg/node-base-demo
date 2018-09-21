const propertys = [
    "ZK_ID",
    "ZK_ROLE",
    "ZK_PERMITID"
];

class ZK_PERMITCONFIG {
    constructor() {
        propertys.forEach(name => { this[name] = undefined; });
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


module.exports = ZK_PERMITCONFIG;