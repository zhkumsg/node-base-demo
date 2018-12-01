const jsmd5 = require('js-md5');
const TokenHelper = require('./TokenHelper');
const client = require('./ServiceClient');
const MsgJsonHelper = require('./MsgJsonHelper');
const QueryModel = require('./QueryModel');
const MemoryCondition = require('./MemoryCondition');
const { MType, MLogic, MOperator } = require('msg-dataaccess-base');

module.exports = {
    /**
     * 账号密码登陆
     * @param {*} req 
     * @param {*} res 
     * @verify jsmd5(jsmd5.digest(captcha))
     */
    Login(req, res) {
        let id = req.body.ID;
        let pwd = req.body.PWD;
        let captcha = req.body.CAPTCHA;
        let _captcha = req.body._CAPTCHA;
        if (!id || !pwd || !captcha || !_captcha) {
            return res.json(MsgJsonHelper.DebugJson('参数异常'));
        }
        if (jsmd5(jsmd5.digest(captcha.toLowerCase())) !== _captcha) {
            return res.json(MsgJsonHelper.DebugJson('验证码错误'));
        }
        let condition = [];
        condition.push(
            new MemoryCondition({
                Field: 'ZK_ID',
                Logic: MLogic.And,
                Operator: MOperator.Equal,
                Type: MType.Mstring,
                value: id,
            })
        );
        condition.push(
            new MemoryCondition({
                Field: 'ZK_PASSWORD',
                Logic: MLogic.And,
                Operator: MOperator.Equal,
                Type: MType.Mstring,
                value: pwd,
            })
        );
        client
            .Query(QueryModel.ZK_USERINFO, condition, null, 0, 0, false, null)
            .then(m => {
                if (m.result.length === 0) {
                    res.json(MsgJsonHelper.DebugJson('账号密码错误'));
                } else {
                    this.VolidRole(m.result[0], res);
                }
            })
            .catch(() => {
                res.json(MsgJsonHelper.DebugJson('Login接口请求异常'));
            });
    },

    /**
     * 校验角色
     * @param {*} userinfo 
     * @param {*} res 
     */
    VolidRole(userinfo, res) {
        let condition = [];
        condition.push(
            new MemoryCondition({
                Field: 'ZK_ID',
                Logic: MLogic.And,
                Operator: MOperator.Equal,
                Type: MType.Mstring,
                value: userinfo.ZK_ROLE,
            })
        );
        client
            .Query(QueryModel.ZK_ROLEINFO, condition, null, 0, 0, false, null)
            .then(m => {
                if (m.result.length === 0) {
                    res.json(MsgJsonHelper.DebugJson('角色异常'));
                } else {
                    let role = m.result[0];
                    if (role.ZK_ISADMIN == '1') {
                        this.SavePermits(userinfo, res);
                    } else {
                        res.json(MsgJsonHelper.DebugJson('您还不是管理员，请联系管理员升级权限'));
                    }
                }
            })
            .catch(() => {
                res.json(MsgJsonHelper.DebugJson('VolidRole接口请求异常'));
            });
    },

    /**
     * 保存权限
     * @param {*} userinfo 
     * @param {*} res 
     */
    SavePermits(userinfo, res) {
        let condition = [];
        condition.push(
            new MemoryCondition({
                Field: 'ZK_ROLE',
                Logic: MLogic.And,
                Operator: MOperator.Equal,
                Type: MType.Mstring,
                value: userinfo.ZK_ROLE,
            })
        );
        client
            .Query(QueryModel.ZK_PERMITCONFIG, condition, null, 0, 0, false, null)
            .then(m => {
                let permitIds = [];
                m.result.forEach(permit => {
                    permitIds.push(permit.ZK_PERMITID);
                });
                res.json(
                    MsgJsonHelper.DefaultJson(
                        {
                            accessToken: TokenHelper.set(userinfo),
                            permitToken: TokenHelper.set(m.result),
                        },
                        true,
                        ''
                    )
                );
            })
            .catch(() => {
                res.json(MsgJsonHelper.DebugJson('SavePermits接口请求异常'));
            });
    },

    /**
     * 检查微信用户是否存在
     * @param {*} openid 
     */
    CheckWxExist(openid) {
        return new Promise((resolve, reject) => {
            let condition = [
                new MemoryCondition({
                    Field: 'ZK_OPENID',
                    Logic: MLogic.And,
                    Operator: MOperator.Equal,
                    Type: MType.Mstring,
                    value: openid,
                })
            ];
            client
                .Query(QueryModel.ZK_USERINFO, condition, null, 0, 0, false, null)
                .then(m => {
                    if (m.result.length > 0) {
                        resolve(m.result[0]);
                    } else {
                        resolve(null);
                    }
                }).catch(() => {
                    reject();
                });
        });
    }
}