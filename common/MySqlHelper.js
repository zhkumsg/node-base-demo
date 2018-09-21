const mysql = require("mysql");
const { MySqlConnectionCfg } = require('../web.config');


class MySqlHelper {

    /**
     * 构造器
     */
    constructor() {
        this.connection = mysql.createConnection(MySqlConnectionCfg);
    }

    /**
     * 执行查询
     * @param {*} sqlstring 
     */
    GetTable(sqlstring) {
        return new Promise((resolve, reject) => {
            this.connection.connect();
            this.connection.query(sqlstring, (err, result) => {
                if (err) {
                    reject(err.message);
                } else {
                    let _result = [];
                    result.forEach(item => {
                        let obj = {};
                        for (let name in item) {
                            obj[name] = item[name];
                        }
                        _result.push(obj);
                    });
                    resolve(_result);
                }
            });
            this.connection.end();
        });
    }


    /**
     * 执行增删改
     * @param {*} sqlstring 
     */
    ExecuteNonQuery(sqlstring) {
        return new Promise((resolve, reject) => {
            this.connection.connect();
            this.connection.query(sqlstring, (err, result) => {
                if (err) {
                    reject(err.message);
                } else {
                    console.log(result)
                    resolve(result);
                }
            });
            this.connection.end();
        });
    }


}

module.exports = MySqlHelper;