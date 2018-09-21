const TableCfg = require('./TableCfg');
const OperationEnum = require('./OperationEnum');
const TransParams = require('./TransParams');
const DsParams = require('./DsParams');
const uuid = require('node-uuid');

var Public = {

    /**
     * 生成参数化SQL语句
     * @param {*} obj 实体类/实体类数组
     * @param {*} operationType 操作类型
     */
    OperationSQLParams(obj, operationType) {
        let tableName = "";
        let pkNames = "";
        if (obj instanceof Array) {
            if (obj.length > 0) {
                tableName = TableCfg[obj[0].constructor.name].name;
                pkNames = TableCfg[obj[0].constructor.name].pk;
            } else {
                return null;
            }
        } else {
            tableName = TableCfg[obj.constructor.name].name;
            pkNames = TableCfg[obj.constructor.name].pk;
            obj = [obj];
        }
        switch (operationType) {
            case OperationEnum.Create: return this.InsertSQLParams(obj, tableName); break;
            case OperationEnum.Delete: return this.DeleteSQLParams(obj, tableName, pkNames); break;
            case OperationEnum.Update: return this.UpdateSQLParams(obj, tableName, pkNames); break;
            case OperationEnum.UpdateNoCheck: return this.UpdateNoCheckSQLParams(obj, tableName, pkNames); break;
            default: return null; break;
        }
    },


    /**
     * 插入数据
     * @param {*} obj 实体类
     * @param {*} tableName 表名
     */
    InsertSQLParams(objlist, tableName) {
        let tparams = new TransParams();
        let params = [];
        let row = [];
        let column = [];
        objlist.forEach((obj, index) => {
            if (typeof (obj) === "object" && tableName != undefined) {
                let properties = Object.getOwnPropertyNames(obj);
                if ("EB_CREATE_DATETIME" in obj) {
                    if (properties.indexOf("EB_CREATE_DATETIME") === -1) {
                        properties.push("EB_CREATE_DATETIME");
                    }
                    obj["EB_CREATE_DATETIME"] = new Date();
                }
                if ("EB_LASTMODIFY_DATETIME" in obj) {
                    if (properties.indexOf("EB_CREATE_DATETIME") === -1) {
                        properties.push("EB_LASTMODIFY_DATETIME");
                    }
                    obj["EB_LASTMODIFY_DATETIME"] = new Date();
                }
                if (properties.length > 0) {
                    column.push("(");
                    properties.forEach(pf => {
                        if (obj[pf] === undefined) { return false; }
                        if (index === 0) { row.push(pf, ", "); }
                        column.push("@" + index + "_" + pf, ", ");
                        if (["EB_CREATE_DATETIME", "EB_LASTMODIFY_DATETIME"].indexOf(pf.toUpperCase()) > -1) {
                            params.push(new DsParams({
                                paramsname: index + "_" + pf,
                                paramsvalue: new Date()
                            }));
                        } else {
                            params.push(new DsParams({
                                paramsname: index + "_" + pf,
                                paramsvalue: obj[pf]
                            }));
                        }
                    });
                    if (index === 0) { row.pop(); }
                    column.pop();
                    column.push(")", ",");
                }
            }
        });
        row.unshift("insert into " + tableName + " (");
        row.push(") ", "values");
        column.pop();
        tparams.set({
            sql: row.join("") + column.join(""),
            l_dp: params
        });
        return tparams;
    },

    /**
     * 删除数据(物理删除)
     * @param {*} objlist 
     * @param {*} tableName 
     * @param {*} pkNames 
     */
    DeleteSQLParams(objlist, tableName, pkNames) {
        let tparams = new TransParams();
        let params = [];
        let row = [];
        objlist.forEach((obj, index) => {
            if (typeof (obj) === "object" && tableName != undefined) {
                let properties = [];
                pkNames.split(",").forEach(pk => {
                    Object.getOwnPropertyNames(obj).forEach(key => {
                        if (key === pk) { properties.push(key); }
                    });
                });
                if (properties.length > 0) {
                    let filter = [];
                    let _row = [];
                    _row.push("delete from " + tableName + " where ");
                    properties.forEach(pf => {
                        if (obj[pf] === undefined) { return false; }
                        if (filter.length !== 0) { filter.push(" and "); }
                        filter.push(pf + " = @" + index + "_" + pf);
                        params.push(new DsParams({
                            paramsname: index + "_" + pf,
                            paramsvalue: obj[pf]
                        }));
                    });
                    if (filter.length > 0) {
                        _row.push(filter.join(""));
                        row.push(_row.join(""), "; ");
                    }
                }
            }
        });
        if (row.length === 0) { return null; }
        tparams.set({
            sql: row.join(""),
            l_dp: params
        });
        return tparams;
    },


    /**
     * 更新数据（内部检查修改时间有效性）
     * @param {*} objlist 
     * @param {*} tableName 
     * @param {*} pkNames 
     */
    UpdateSQLParams(objlist, tableName, pkNames) {
        let tparams = new TransParams();
        let params = [];
        let row = [];
        objlist.forEach((obj, index) => {
            if (typeof (obj) === "object" && tableName != undefined) {
                let properties = Object.getOwnPropertyNames(obj);
                //改动点一：没有传最后修改时间不予修改
                if (!obj["EB_LASTMODIFY_DATETIME"]) { return false; }
                if (properties.length > 0) {
                    let filter = [];
                    let _row = [];
                    let _lastTime = obj["EB_LASTMODIFY_DATETIME"];//改动点二：缓存最后修改时间
                    _row.push("update " + tableName + " set ");
                    properties.forEach(pf => {
                        if (obj[pf] === undefined) { return false; }
                        if (pkNames.indexOf(pf) > -1) {
                            if (filter.length == 0) {
                                filter.push(" where " + pf + " = @" + index + "_" + pf);
                            } else {
                                filter.push(" and " + pf + " = @" + index + "_" + pf);
                            }
                            params.push(new DsParams({
                                paramsname: index + "_" + pf,
                                paramsvalue: obj[pf]
                            }));
                            if (filter.join("").indexOf("EB_LASTMODIFY_DATETIME") === -1) {//改动点三：添加最后修改时间判断
                                filter.push(" and datediff(S, EB_LASTMODIFY_DATETIME, @" + index + "_currentLastTime_" + ") = 0 ");
                                params.push(new DsParams({
                                    paramsname: index + "_currentLastTime_",
                                    paramsvalue: _lastTime
                                }));
                            }
                        } else if (["EB_CREATE_DATETIME", "EB_CREATEBY"].indexOf(pf.toUpperCase()) === -1) {
                            if (["EB_LASTMODIFY_DATETIME"].indexOf(pf.toUpperCase()) > -1) {
                                obj[pf] = new Date();
                            }
                            _row.push(pf + " = @" + index + "_" + pf, ",");
                            params.push(new DsParams({
                                paramsname: index + "_" + pf,
                                paramsvalue: obj[pf]
                            }));
                        }
                    });
                    if (filter.length > 0) {
                        _row.pop();
                        row.push(_row.join("") + filter.join(""), "; ")
                    }
                }
            }
        });
        if (row.length === 0) { return null; }
        tparams.set({
            sql: row.join(""),
            l_dp: params
        });
        return tparams;
    },


    /**
     * 更新数据，不检查修改时间有效性
     * @param {*} objlist 
     * @param {*} tableName 
     * @param {*} pkNames 
     */
    UpdateNoCheckSQLParams(objlist, tableName, pkNames) {
        let tparams = new TransParams();
        let params = [];
        let row = [];
        objlist.forEach((obj, index) => {
            if (typeof (obj) === "object" && tableName != undefined) {
                let properties = Object.getOwnPropertyNames(obj);
                if ("EB_LASTMODIFY_DATETIME" in obj) {
                    if (properties.indexOf("EB_LASTMODIFY_DATETIME") === -1) {
                        properties.push("EB_LASTMODIFY_DATETIME");
                    }
                    obj["EB_LASTMODIFY_DATETIME"] = new Date();
                }
                if (properties.length > 0) {
                    let filter = [];
                    let _row = [];
                    _row.push("update " + tableName + " set ");
                    properties.forEach(pf => {
                        if (obj[pf] === undefined) { return false; }
                        if (pkNames.indexOf(pf) > -1) {
                            if (filter.length == 0) {
                                filter.push(" where " + pf + " = @" + index + "_" + pf);
                            } else {
                                filter.push(" and " + pf + " = @" + index + "_" + pf);
                            }
                            params.push(new DsParams({
                                paramsname: index + "_" + pf,
                                paramsvalue: obj[pf]
                            }));
                        } else if (["EB_CREATE_DATETIME", "EB_CREATEBY"].indexOf(pf.toUpperCase()) === -1) {
                            if (["EB_LASTMODIFY_DATETIME"].indexOf(pf.toUpperCase()) > -1) {
                                obj[pf] = new Date();
                            }
                            _row.push(pf + " = @" + index + "_" + pf, ",");
                            params.push(new DsParams({
                                paramsname: index + "_" + pf,
                                paramsvalue: obj[pf]
                            }));
                        }
                    });
                    if (filter.length > 0) {
                        _row.pop();
                        row.push(_row.join("") + filter.join(""), "; ")
                    }
                }
            }
        });
        if (row.length === 0) { return null; }
        tparams.set({
            sql: row.join(""),
            l_dp: params
        });
        return tparams;
    },

    /**
     * 生成主键
     */
    BuildCode() {
        return uuid.v4().replace(/((-)|([a-z]))/gi, ($1, $2) => { return Number.parseInt(Math.random() * 10, 10); }).substring(0, 17);
    },


    /**
     * 字符串转日期对象
     * @param {*} datestr Newtonsoft日期字符串/UTC日期字符串
     */
    StringToDate(datestr) {
        if (datestr instanceof Date) { return datestr; }
        let reg = /^\/Date\((\d+)\)\/$/g;
        if (reg.test(datestr)) {
            return new Date(Number.parseInt(datestr.replace(reg, "$1"), 10));
        } else {
            if (/^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}.\d+Z$/gi.test(datestr)) {
                datestr = datestr.replace(/(^.+)(T)(.+)(\..+Z)/gi, "$1 $3");
                return new Date(datestr);
            } else {
                return new Date(datestr);
            }
        }
    }


};

module.exports = Public;