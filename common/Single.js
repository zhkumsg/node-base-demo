const MType = require("./MType");
const MLogic = require("./MLogic");
const MOperator = require("./MOperator");
const DataAccess = require("./DataAccess");
const MemoryResult = require("./MemoryResult");

const ds = new DataAccess();

var Single = {
    /**
     * 通用查询
     * @param {*} tablename 表名
     * @param {*} condition 条件
     * @param {*} size 
     * @param {*} pagesize 
     * @param {*} pageno 
     * @param {*} isPager 是否分页
     * @param {SortParam} sp 排序
     * @param {*} flag 是否有EB_ISDELETE字段
     */
    query(tablename, condition, size, pagesize, pageno, isPager, sp, flag) {
        let sql = "select * from " + tablename;
        if (flag === "false") {
            sql += " where EB_ISDELETE = '0'";
        }
        return this.querySQL(sql, condition, size, pagesize, pageno, isPager, sp, flag);
    },


    /**
     * 执行查询(promise)
     * @param {*} sql 基础sql语句
     * @param {*} condition 条件
     * @param {*} size 
     * @param {*} pagesize 
     * @param {*} pageno 
     * @param {*} isPager 
     * @param {SortParam} sp 
     * @param {*} flag 
     */
    querySQL(sql, condition, size, pagesize, pageno, isPager, sp, flag) {
        let ms = new MemoryResult();
        sql = sql + this.getwhere(condition, flag);
        let promise = new Promise((resolve, reject) => {
            if (isPager) {
                ds.GetTable("select count(1) as sam from (" + sql + ") as myTemp").then((dt, err) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (dt.length > 0) {
                            ms.recordcount = Number.parseInt(dt[0].sam, 10);
                            ms.pagecount = Math.floor(ms.recordcount / pagesize);
                        }
                        ds.GetTable(ds.datapagerSql(pageno, pagesize, sql, sp)).then((dt, err) => {
                            if (err) {
                                reject(err);
                            } else {
                                ms.result = dt;
                                resolve(ms);
                            }
                        });
                    }
                });
            } else {
                ds.GetTable(sql).then((dt, err) => {
                    if (err) {
                        reject(err);
                    } else {
                        ms.result = dt;
                        resolve(ms);
                    }
                });
            }
        });
        return promise;
    },

    /**
     * 获取条件语句
     * @param {*} condition 条件
     * @param {*} flag 
     */
    getwhere(condition, flag) {
        let sqlwhereall = [];
        if (!condition) { return ""; }
        if (flag === null || flag === undefined) {
            sqlwhereall.push(" where (");
        } else if (flag != "true") {
            sqlwhereall.push(" and (");
        }
        sqlwhereall.push("1=1");
        condition.forEach(mc => {
            let sqlwhere = "";
            let fieldstr = mc.Field;
            switch (mc.Type) {
                case MType.Mstring: {
                    if (!mc.value && mc.Operator !== MOperator.IsNull) { return false; }
                    let tvalue = mc.value.toString();
                    let strs = tvalue.split(",");
                    if (mc.Logic === MLogic.And) {
                        switch (mc.Operator) {
                            case MOperator.Like:
                                sqlwhere += (" and " + fieldstr + " like '%" + tvalue + "%'");
                                break;
                            case MOperator.NotLike:
                                sqlwhere += (" and " + fieldstr + " not like '%" + tvalue + "%'");
                                break;
                            case MOperator.Equal:
                                sqlwhere += (" and " + fieldstr + " = '" + tvalue + "'");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" and " + fieldstr + " != '" + tvalue + "'");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" and " + fieldstr + " > '" + tvalue + "'");
                                break;
                            case MOperator.LargeEqualThan:
                                sqlwhere += (" and " + fieldstr + " >= '" + tvalue + "'");
                                break;
                            case MOperator.LessThan:
                                sqlwhere += (" and " + fieldstr + " < '" + tvalue + "'");
                                break;
                            case MOperator.LessEqualThan:
                                sqlwhere += (" and " + fieldstr + " <= '" + tvalue + "'");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" and " + fieldstr + " between '" + strs[0] + "' and '" + strs[1] + "'");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" and " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                sqlwhere += (" and " + fieldstr + " in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("'" + _item + "',");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);//去掉最后的逗号
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.NotIn: {
                                sqlwhere += (" and " + fieldstr + " not in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("'" + _item + "',");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);//去掉最后的逗号
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.LikeIn: {
                                if (strs.Length > 0) {
                                    sqlwhere += (" and (");
                                    strs.forEach(_item => {
                                        sqlwhere += (fieldstr + " like '%[" + _item + "]%' or ");
                                    });
                                    sqlwhere = sqlwhere.substring(0, sqlwhere.length - 4);//去掉最后的or
                                    sqlwhere += ")";
                                }
                            };
                                break;
                            case MOperator.NotLikeIn: {
                                if (strs.Length > 0) {
                                    strs.forEach(_item => {
                                        sqlwhere += (" and " + fieldstr + " not like '%[" + _item + "]%' ");
                                    });
                                }
                            };
                                break;
                            default: ;
                                break;
                        }
                    } else {
                        switch (mc.Operator) {
                            case MOperator.Like:
                                sqlwhere += (" or " + fieldstr + " like '%" + tvalue + "%'");
                                break;
                            case MOperator.NotLike:
                                sqlwhere += (" or " + fieldstr + " not like '%" + tvalue + "%'");
                                break;
                            case MOperator.Equal:
                                sqlwhere += (" or " + fieldstr + " = '" + tvalue + "'");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" or " + fieldstr + "!= '" + tvalue + "'");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" or " + fieldstr + "> '" + tvalue + "'");
                                break;
                            case MOperator.LargeEqualThan:
                                sqlwhere += (" or " + fieldstr + " >= '" + tvalue + "'");
                                break;
                            case MOperator.LessThan:
                                sqlwhere += (" or " + fieldstr + " < '" + tvalue + "'");
                                break;
                            case MOperator.LessEqualThan:
                                sqlwhere += (" or " + fieldstr + " <= '" + tvalue + "'");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" or " + fieldstr + " between '" + strs[0] + "' and '" + strs[1] + "'");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" or " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                sqlwhere += (" or " + fieldstr + " in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("'" + _item + "',");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.NotIn: {
                                sqlwhere += (" or " + fieldstr + " not in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("'" + _item + "',");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.LikeIn: {
                                if (strs.Length > 0) {
                                    sqlwhere += (" or (");
                                    strs.forEach(_item => {
                                        sqlwhere += (fieldstr + " like '%[" + _item + "]%' or ");
                                    });
                                    sqlwhere = sqlwhere.substring(0, sqlwhere.length - 4);
                                    sqlwhere += ")";
                                }
                            };
                                break;
                            case MOperator.NotLikeIn: {
                                if (strs.Length > 0) {
                                    sqlwhere += (" or (");
                                    strs.forEach(_item => {
                                        sqlwhere += (fieldstr + " not like '%[" + _item + "]%' and");
                                    });
                                    sqlwhere = sqlwhere.substring(0, sqlwhere.length - 4);
                                    sqlwhere += ")";
                                }
                            };
                                break;
                            default:
                                break;
                        }
                    }
                }; break;
                case MType.Mint: {
                    if (mc.value == null && mc.Operator != MOperator.IsNull) { return false; };
                    let tvalue = Number.parseInt(mc.value, 10);
                    let strs = mc.value.toString().split(',');
                    if (mc.Logic === MLogic.And) {
                        switch (mc.Operator) {
                            case MOperator.Equal:
                                sqlwhere += (" and " + fieldstr + " =" + tvalue + "");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" and " + fieldstr + " != " + tvalue + "");
                                break;
                            case MOperator.Like:
                                sqlwhere += (" and " + fieldstr + " like '%" + tvalue + "%'");
                                break;
                            case MOperator.NotLike:

                                sqlwhere += (" and " + fieldstr + " not like '%" + tvalue + "%'");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" and " + fieldstr + " > " + tvalue + "");
                                break;
                            case MOperator.LargeEqualThan:

                                sqlwhere += (" and " + fieldstr + " >= " + tvalue + "");
                                break;
                            case MOperator.LessThan:

                                sqlwhere += (" and " + fieldstr + " < " + tvalue + "");
                                break;
                            case MOperator.LessEqualThan:

                                sqlwhere += (" and " + fieldstr + " <= " + tvalue + "");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" and " + fieldstr + " between " + strs[0] + " and " + strs[1] + "");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" and " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                sqlwhere += (" and " + fieldstr + " in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("" + _item + ",");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.NotIn: {
                                sqlwhere += (" and " + fieldstr + " not in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("" + _item + ",");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            default:
                                break;
                        }
                    } else {
                        switch (mc.Operator) {
                            case MOperator.Equal:
                                sqlwhere += (" or " + fieldstr + " = " + tvalue + "");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" or " + fieldstr + " != " + tvalue + "");
                                break;
                            case MOperator.Like:
                                sqlwhere += (" or " + fieldstr + " like '%" + tvalue + "%'");
                                break;
                            case MOperator.NotLike:
                                sqlwhere += (" or " + fieldstr + " not like '%" + tvalue + "%'");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" or " + fieldstr + " > " + tvalue + "");
                                break;
                            case MOperator.LargeEqualThan:
                                sqlwhere += (" or " + fieldstr + " >= " + tvalue + "");
                                break;
                            case MOperator.LessThan:
                                sqlwhere += (" or " + fieldstr + " < " + tvalue + "");
                                break;
                            case MOperator.LessEqualThan:
                                sqlwhere += (" or " + fieldstr + " <= " + tvalue + "");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" or " + fieldstr + " between " + strs[0] + " and " + strs[1] + "");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" or " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                sqlwhere += (" or " + fieldstr + " in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("" + _item + ",");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.NotIn: {
                                sqlwhere += (" or " + fieldstr + " not in (");
                                strs.forEach(_item => {
                                    sqlwhere += "" + _item + ",";
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            default:
                                break;
                        }
                    }
                }; break;
                case MType.Mdouble: {
                    if (mc.value == null && mc.Operator != MOperator.IsNull) { return false; };
                    let tvalue = Number.parseFloat(mc.value, 10);
                    let strs = mc.value.toString().split(",");
                    if (mc.Logic == MLogic.And) {
                        switch (mc.Operator) {
                            case MOperator.Equal:
                                sqlwhere += (" and " + fieldstr + " = " + tvalue + "");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" and " + fieldstr + " != " + tvalue + "");
                                break;
                            case MOperator.Like:
                                sqlwhere += (" and " + fieldstr + " like '%" + tvalue + "%'");
                                break;
                            case MOperator.NotLike:
                                sqlwhere += (" and " + fieldstr + " not like '%" + tvalue + "%'");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" and " + fieldstr + " > " + tvalue + "");
                                break;
                            case MOperator.LargeEqualThan:
                                sqlwhere += (" and " + fieldstr + " >= " + tvalue + "");
                                break;
                            case MOperator.LessThan:
                                sqlwhere += (" and " + fieldstr + " < " + tvalue + "");
                                break;
                            case MOperator.LessEqualThan:
                                sqlwhere += (" and " + fieldstr + " <= " + tvalue + "");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" and " + fieldstr + " between " + strs[0] + " and " + strs[1] + "");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" and " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                sqlwhere += (" and " + fieldstr + " in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("" + _item + ",");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.NotIn: {
                                sqlwhere += (" and " + fieldstr + " not in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("" + _item + ",");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            default:
                                break;
                        }
                    } else {
                        switch (mc.Operator) {
                            case MOperator.Equal:
                                sqlwhere += (" or " + fieldstr + " = " + tvalue + "");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" or " + fieldstr + " = " + tvalue + "");
                                break;
                            case MOperator.Like:
                                sqlwhere += (" or " + fieldstr + " like '%" + tvalue + "%'");
                                break;
                            case MOperator.NotLike:
                                sqlwhere += (" or " + fieldstr + " not like '%" + tvalue + "%'");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" or " + fieldstr + " > " + tvalue + "");
                                break;
                            case MOperator.LargeEqualThan:
                                sqlwhere += (" or " + fieldstr + " >= " + tvalue + "");
                                break;
                            case MOperator.LessThan:
                                sqlwhere += (" or " + fieldstr + " < " + tvalue + "");
                                break;
                            case MOperator.LessEqualThan:
                                sqlwhere += (" or " + fieldstr + " <= " + tvalue + "");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" or " + fieldstr + " between " + strs[0] + " and " + strs[1] + "");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" or " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                sqlwhere += (" or " + fieldstr + " in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("" + _item + ",");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            case MOperator.NotIn: {
                                sqlwhere += (" or " + fieldstr + " not in (");
                                strs.forEach(_item => {
                                    sqlwhere += ("" + _item + ",");
                                });
                                sqlwhere = sqlwhere.substring(0, sqlwhere.length - 1);
                                sqlwhere += ")";
                            };
                                break;
                            default:
                                break;
                        }
                    }
                }; break;
                case MType.Mdatetime: {
                    if (mc.value == null && mc.Operator != MOperator.IsNull) { return false; };
                    let strs = mc.value.toString().split(",");
                    if (mc.Logic == MLogic.And) {
                        switch (mc.Operator) {
                            case MOperator.Equal:
                                sqlwhere += (" and " + fieldstr + " = " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" and " + fieldstr + "!= " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.Like:
                                sqlwhere += (" and " + fieldstr + " like " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.NotLike:
                                sqlwhere += (" and " + fieldstr + " not like " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" and " + fieldstr + " > " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LargeEqualThan:
                                sqlwhere += (" and " + fieldstr + " >= " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LessThan:
                                sqlwhere += (" and " + fieldstr + " < " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LessEqualThan:
                                sqlwhere += (" and " + fieldstr + " <= " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" and " + fieldstr + " between " + ds.parse(new Date(strs[0])) + " and " + ds.parse(strs[1]) + "");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" and " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                strs.forEach(_item => {
                                    sqlwhere += " and " + fieldstr + " like " + ds.parse(new Date(_item)) + "";
                                });
                            };
                                break;
                            case MOperator.NotIn: {
                                strs.forEach(_item => {
                                    sqlwhere += (" and " + fieldstr + " not like " + ds.parse(new Date(_item)) + "");
                                });
                            };
                                break;
                            default:
                                break;
                        }
                    } else {
                        switch (mc.Operator) {
                            case MOperator.Equal:
                                sqlwhere += (" or " + fieldstr + " = " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.NotEqual:
                                sqlwhere += (" or " + fieldstr + "!= " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.Like:
                                sqlwhere += (" or " + fieldstr + " like " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.NotLike:
                                sqlwhere += (" or " + fieldstr + " not like " + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LargeThan:
                                sqlwhere += (" or " + fieldstr + ">" + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LargeEqualThan:
                                sqlwhere += (" or " + fieldstr + " >=" + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LessThan:
                                sqlwhere += (" or " + fieldstr + " <" + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.LessEqualThan:
                                sqlwhere += (" or " + fieldstr + " <=" + ds.parse(new Date(mc.value)) + "");
                                break;
                            case MOperator.Between:
                                sqlwhere += (" or " + fieldstr + " between " + ds.parse(new Date(strs[0])) + " and " + ds.parse(new Date(strs[1])) + "");
                                break;
                            case MOperator.IsNull:
                                sqlwhere += (" or " + fieldstr + " is null");
                                break;
                            case MOperator.In: {
                                strs.forEach(_item => {
                                    sqlwhere += (" or " + fieldstr + " like " + ds.parse(new Date(_item)) + "");
                                });
                            };
                                break;
                            case MOperator.NotIn: {
                                strs.forEach(_item => {
                                    sqlwhere += (" or " + fieldstr + " not like " + ds.parse(new Date(_item)) + "");
                                });
                            };
                                break;
                            default:
                                break;
                        }
                    }
                }; break;
            }
            if (mc.subCondition) {
                if (mc.subCondition.l_Condition.length > 0) {
                    if (mc.subCondition.toParentLogic == MLogic.And) {
                        sqlwhere = " and (" + getwhere(mc.subCondition.l_Condition, "true");
                    }
                    if (mc.subCondition.toParentLogic == MLogic.Or) {
                        sqlwhere = " or (" + getwhere(mc.subCondition.l_Condition, "true");
                    }
                }
            }
            sqlwhereall.push(sqlwhere);
        });
        sqlwhereall.push(")");
        return sqlwhereall.join("");
    },

    /**
     * 通过主键快速删除
     * @param {*} sql 基础sql语句
     * @param {*} ids 主键数组
     */
    DeleteByIds(sql, ids) {
        if (ids.length === 0) { return Promise.reject("缺少条件，无法删除"); }
        let idsstr = [];
        if (ids instanceof String) { ids = ids.split(","); }
        ids.forEach(id => {
            if (id instanceof Number) {
                idsstr.push(id);
            } else {
                idsstr.push("'" + id.replace(/'/g, "‘") + "'");
            }
        });
        sql = sql + " in (" + idsstr.join(",") + ")";
        return ds.RunQuery(sql);
    }
};

module.exports = Single;