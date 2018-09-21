const MsgJsonHelper = require('../common/MsgJsonHelper');
const JsonCodeEnum = require('../common/JsonCodeEnum');
const DataAccess = require('../common/DataAccess');

const ds = new DataAccess();

/**
 * 路由权限判断
 */
module.exports = {
    /**
     * 检查是否在线
     * @param {*} req 
     * @param {*} res 
     */
    IsLogin(req, res) {
        if (req["UserInfo"]) {
            return true;
        } else {
            res.json(MsgJsonHelper.DefaultJson(null, false, "登录超时", JsonCodeEnum.Timeout));
            return false;
        }
    },


    /**
     * 检查是否具备权限
     * @param {*} req 
     * @param {*} res 
     * @param {*} permitId 权限主键
     */
    IsPermit(req, res, permitId) {
        if (req["UserPermit"]) {
            let flag = false;
            req["UserPermit"].forEach(item => {
                if (item.ZK_PERMITID === permitId) { flag = true; }
            });
            if (flag) {
                return true;
            } else {
                res.json(MsgJsonHelper.DefaultJson(null, false, "没有权限", JsonCodeEnum.Nopermit));
                return false;
            }
        } else {
            res.json(MsgJsonHelper.DefaultJson(null, false, "没有权限", JsonCodeEnum.Nopermit));
            return false;
        }
    },

    /**
     * 获取等级小于自己的角色
     * @param {*} code 
     */
    ValidRole(code) {
        return new Promise((resolve) => {
            let sqlstr = "SELECT ZK_ID, ZK_ROLE FROM ZK_ROLEINFO WHERE EB_ISDELETE = '0' AND ZK_LEAVE >= (SELECT ZK_LEAVE FROM ZK_ROLEINFO WHERE ZK_ID = " + ds.parse(code) + ")";
            ds.GetTable(sqlstr).then(dt => {
                resolve(dt);
            }).catch(err => {
                resolve([]);
            });
        });
    }
};