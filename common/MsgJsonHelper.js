var JsonCodeEnum = require('./JsonCodeEnum');

const MsgJsonHelper = {

    /**
     * json字符串转对象
     * @param {*} str 
     * @param {*} model 
     */
    JsonToObj(str, model) {
        if (model === undefined) {
            return JSON.parse(str);
        }
        let result = new model();
        let strjson = JSON.parse(str);
        if (strjson instanceof Array) { return strjson };
        let properties = Object.getOwnPropertyNames(result);
        for (let name in strjson) {
            if (properties.indexOf(name) > -1) {
                result[name] = strjson[name];
            }
        }
        return result;
    },

    /**
     * json转数组
     * @param {*} str 
     * @param {*} model 
     */
    JsonToList(str, model) {
        if (model === undefined) {
            return JSON.parse(str);
        }
        let result = [];
        let strjson = JSON.parse(str);
        if (!(strjson instanceof Array)) { return result; };
        let properties = Object.getOwnPropertyNames(new model);
        strjson.forEach(item => {
            let _obj = Object.create(new model);
            for (let name in item) {
                if (properties.indexOf(name) > -1) {
                    _obj[name] = item[name];
                }
            }
            result.push(_obj);
        });
        return result;
    },

    /**
     * 默认json转换
     * @param {Object} obj 对象
     * @param {Boolean} flag 标识位
     * @param {String} message 信息
     * @param {JsonCodeEnum} code 枚举
     */
    DefaultJson(obj, flag, message, code) {
        return {
            flag: flag ? "True" : "False",
            message: message,
            result: obj || null,
            code: code === undefined ? JsonCodeEnum.Normal : code
        };
    },

    /**
     * 调试json转换
     * @param {String} message 信息
     * @param {JsonCodeEnum} code 枚举
     */
    DebugJson(message, code) {
        return {
            flag: "False",
            message: message,
            result: null,
            code: code === undefined ? JsonCodeEnum.Error : code
        }
    }
}

module.exports = MsgJsonHelper;