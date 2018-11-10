module.exports = {
    DbConnectionString: "mssql://sa:123456@127.0.0.1:1433/AuthPublish",
    MySqlConnectionCfg: {
        host: "linux.msg.com",
        user: '账号',
        password: '密码',
        port: '3306',
        database: 'AuthPublish',
        multipleStatements: true
    },
    DbType: "MYSQL",//MSSQL,MYSQL,ORACLE,ODBC...
    TokenSecret: "msg is a handsome boy",
    HttpPort: 3000,
    WebsocketPort: 5000
};