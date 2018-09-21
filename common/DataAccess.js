const sql = require('mssql');
const { DbConnectionString } = require('../web.config');
const TransParams = require('./TransParams');

class DataAccess {
    constructor(config) {
        try {
            if (!global["globalConnection"]) {
                if (config !== undefined) { sql.close(); }
                global["globalConnection"] = sql.connect(config || DbConnectionString);
            }
            this.connection = global["globalConnection"];
        } catch (err) {
            throw err;
        }
    }

    /**
     * 执行查询
     * @param {*} sqlstring 
     */
    GetTable(sqlstring) {
        return new Promise((resolve, reject) => {
            this.connection.then(pool => {
                return pool.request().query(sqlstring);
            }).then(result => {
                resolve(result.recordset);
            }).catch(err => {
                reject(err);
            });
            sql.on("error", err => { reject(err); });
        });
    }



    /**
     * 执行增删改
     * @param {*} sqlstring 
     */
    RunQuery(sqlstring) {
        return new Promise((resolve, reject) => {
            this.connection.then(pool => {
                let transaction = pool.transaction();
                transaction.begin(err => {
                    let request = transaction.request();
                    request.query(sqlstring, (err, result) => {
                        if (err) {
                            transaction.rollback();
                            resolve(false);
                        } else {
                            transaction.commit();
                            resolve(result.rowsAffected[0] > 0);
                        }
                    });
                });
            });
            sql.on("error", err => { reject(err); });
        });
    }

    /**
     * 自动执行增删改sql
     * @param {TransParams} transParams
     */
    TransRunQuery(transParams) {
        if (!transParams) { return Promise.reject("参数不能为空"); }
        return new Promise((resolve, reject) => {
            this.connection.then(pool => {
                let transaction = pool.transaction();
                transaction.begin(err => {
                    let request = transaction.request();
                    transParams.l_dp.forEach(dp => {
                        if (dp.paramsvalue instanceof Date) {
                            dp.paramsvalue = this.RemoveDateMsec(dp.paramsvalue);
                            request = request.input(dp.paramsname, dp.paramsvalue);
                        } else {
                            request = request.input(dp.paramsname, dp.paramsvalue);
                        }
                    });
                    request.query(transParams.sql, (err, result) => {
                        if (err) {
                            transaction.rollback();
                            resolve(false);
                        } else {
                            transaction.commit();
                            resolve(result.rowsAffected[0] > 0);
                        }
                    });
                });
            });
            sql.on("error", err => { reject(err); });
        });
    }

    /**
     * 过滤参数
     * @param {*} data 日期对象或者字符串 
     */
    parse(data) {
        if (data) {
            if (data instanceof Date) {
                let datestr = this.RemoveDateMsec(data);
                return "CONVERT(varchar(20),'" + datestr + "',20)";
            } else {
                data = data.trim();
                return "'" + data.replace("'", "’") + "'";
            }
        }
        else {
            return "null";
        }
    }

    /**
     * 过滤参数
     * @param {*} data 字符串
     */
    parsetext(data) {
        return "'" + data.replace("'", "’") + "'";
    }

    /**
     * 检查是否可以转换成日期
     * @param {*} asdate 日期对象或字符串
     */
    CheckDateString(asdate) {
        if (asdate instanceof Date) {
            return true;
        } else if (new Date(asdate) !== "Invalid Date") {
            return true;
        }
        return false;
    }

    /**
     * 生成转换数值的sql语句
     * @param {*} num 
     */
    parseNumber(num) {
        if (num instanceof Number) {
            return "cast(" + data + " as int)";
        } else {
            throw new Error("无法转换成数数值类型");
        }
    }

    /**
     * 生成转换时间的sql语句
     * @param {*} data 
     */
    parseTime(data) {
        //todo
        return data;
    }


    /**
     * 把日期的毫秒去掉、并转换成本地时间
     * @param {*} date 日期对象（UTC或者北京时间）
     * @returns 返回去掉毫秒的本地时间字符串
     */
    RemoveDateMsec(date) {
        if (date instanceof Date) {
            let year = date.getFullYear();
            let mon = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
            let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
            let hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
            let mm = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            let ss = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
            date = "" + year + "-" + mon + "-" + day + " " + hh + ":" + mm + ":" + ss + "";
        }
        return date;
    }

    /**
     * 生成分页sql
     * @param {*} pageno 页码
     * @param {*} pagesize 页数
     * @param {*} sqlstr 原sql语句
     * @param {SortParam} sp 排序参数
     */
    datapagerSql(pageno, pagesize, sqlstr, sp) {
        if (sqlstr) {
            if (pageno > 0 && pagesize > 0 && sp) {
                return "select TMPTABLE2.* from (select TMPTABLE1.*,ROW_NUMBER() OVER(ORDER BY TMPTABLE1." + sp.Field + " " + sp.SortDirection + " ) ROWNUM_tmp from (" + sqlstr + ") TMPTABLE1) TMPTABLE2 where TMPTABLE2.ROWNUM_tmp between " + ((pageno - 1) * pagesize + 1).toString() + " and " + (pageno * pagesize).toString();
            }
        }
        return sqlstr;
    }
}

module.exports = DataAccess;
