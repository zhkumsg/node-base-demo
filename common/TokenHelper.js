const jwt = require('jsonwebtoken');
const { TokenSecret } = require('../web.config');

const TokenHelper = {
    /**
     * 设置token(加密)
     * @param {object} obj 对象
     * @param {*} expires 默认60分钟有效期
     */
    set(obj, expires) {
        if (obj instanceof Array || obj instanceof String) {
            obj = { "__self__": obj };
        }
        return jwt.sign(obj, TokenSecret, {
            expiresIn: expires || 60 * 60
        });
    },

    /**
     * 获取token(解密)
     * @param {*} obj 
     */
    get(obj) {
        return new Promise(function (resolve, reject) {
            jwt.verify(obj, TokenSecret, function (err, decode) {
                if (err) {
                    resolve(undefined);
                } else {
                    if (Object.getOwnPropertyNames(decode).indexOf("__self__") > -1) {
                        decode = decode["__self__"];
                    }
                    resolve(decode);
                }
            });
        });
    },
};

module.exports = TokenHelper;