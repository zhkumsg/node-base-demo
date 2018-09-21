const client = require('./common/ServiceClient');
const QueryModel = require('./common/QueryModel');

//global
const Webglobal = {

    /**
     * 启动项目时调用
     */
    start() {
        global["SYS_PARAMINFO"] = [];
        client.Query(QueryModel.ZK_PARAMINFO, [], null, 0, 0, false, null).then(m => {
            global["SYS_PARAMINFO"] = m.result;
            console.log(global["SYS_PARAMINFO"]);
        }).catch(err => {
            console.log("获取系统参数异常", err);
        });
    }

};

module.exports = Webglobal;