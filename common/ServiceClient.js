const { TableCfg, QueryModel, Single } = require('./common.module');
const {
    ZK_USERINFO,
    ZK_PERMITINFO,
    ZK_PERMITCONFIG,
    ZK_ROLEINFO,
    ZK_PARAMINFO,
    ZK_INVESTMENT
} = require('../model/model.module');

var ServiceClient = {
    /**
     * 通用查询
     * @param {*} model 实体枚举
     * @param {*} condition 条件
     * @param {*} size 类型
     * @param {*} pagesize 每页条数
     * @param {*} pageno 页码
     * @param {*} isPager 是否分页
     * @param {SortParam} sp 排序
     */
    Query(model, condition, size, pagesize, pageno, isPager, sp) {
        let result = new Array();
        switch (model) {
            case QueryModel.ZK_USERINFO: result = this.getqueryPara(ZK_USERINFO); break;
            case QueryModel.ZK_PERMITINFO: result = this.getqueryPara(ZK_PERMITINFO); break;
            case QueryModel.ZK_PERMITCONFIG: result = this.getqueryPara(ZK_PERMITCONFIG); break;
            case QueryModel.ZK_ROLEINFO: result = this.getqueryPara(ZK_ROLEINFO); break;
            case QueryModel.ZK_PARAMINFO: result = this.getqueryPara(ZK_PARAMINFO); break;
            case QueryModel.ZK_INVESTMENT: result = this.getqueryPara(ZK_INVESTMENT); break;
        }
        if (result.length > 0) {
            return Single.query(result[0], condition, size, pagesize, pageno, isPager, sp, result[1]);
        } else {
            return Promise.reject("实体枚举错误");
        }
    },

    /**
     * 读取配置文件，获取表名以和主键
     * @param {*} m 实体类
     */
    getqueryPara(m) {
        let result = new Array();
        if (TableCfg[m.name] != undefined) {
            result.push(TableCfg[m.name].name);
            result.push(Object.getOwnPropertyNames(new m).indexOf("EB_ISDELETE") > -1 ? "false" : null);
        }
        return result;
    },


    /**
     * 通过主键快速删除
     * @param {*} model 实体类（非枚举）
     * @param {Array} ids 主键数组/主键字符串
     * @param {boolean} flag 是否物理删除（默认逻辑删除）
     */
    DeleteByIds(model, ids, flag) {
        let result = this.getqueryPara(model);
        if (result.length === 0) {
            return Promise.reject("实体错误");
        }
        let sqlstr = "";
        if (flag !== true && result[1] === "false") {
            sqlstr = "UPDATE " + TableCfg[model.name].name + " SET EB_ISDELETE = '1' WHERE " + TableCfg[model.name].pk;
        } else {
            sqlstr = "DELETE FROM " + TableCfg[model.name].name + " WHERE " + TableCfg[model.name].pk;
        }
        return Single.DeleteByIds(sqlstr, ids);

    }
};

module.exports = ServiceClient;