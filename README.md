# node-base-demo

#### 项目介绍
手摸手，教你用nodejs搭建后台最小系统

#### 软件架构
nodejs、express、sql server 2008r2、mysql

#### 准备工作
1. 在项目根目录创建web.config.js配置文件（[可从附件中下载模板](https://gitee.com/zhkumsg/node-base-demo/attach_files)），内容如下


```
module.exports = {
  DbConnectionString: "mssql://账号:密码@ip地址:1433/数据库名",
  MySqlConnectionCfg: {
    host: "ip地址",
    user: "账号",
    password: "密码",
    port: "3306",
    database: "数据库名",
    multipleStatements: true,
    useConnectionPooling: true
  },
  DbType: "MYSQL", //MSSQL,MYSQL,ORACLE,ODBC...
  TokenSecret: "msg is a handsome boy",
  HttpPort: 3000,
  WebsocketPort: 5000
};
```




#### 安装教程

1. npm install
2. npm run dev

#### 使用说明

1. [手摸手，教你用nodejs搭建后台最小系统（大量图文）系列一](https://www.jianshu.com/p/ebef9ffb7851)
2. [手摸手，教你用nodejs搭建后台最小系统（大量图文）系列二](https://www.jianshu.com/p/60d6dc2d901a)
3. [数据库结构与数据脚本](https://gitee.com/zhkumsg/node-base-demo/attach_files)
4. [vue管理系统](https://gitee.com/zhkumsg/vue-base-demo)
5. 测试账号：admin、测试密码：123456
6. sqlserver：默认本机127.0.0.1，账号sa，密码123456
7. mysql： 默认linux.msg.com，账号：***，密码***


# 接口文档

## 环境域名
协议: `http`

* 正式域名: `*.ijunhai.com`
* 预发布域名： `*.ijunhai.com`
* 测试域名: `*.ijunhai.com`

## 接口列表

### 用户列表接口

* 功能描述：

```
该接口用于获取所有用户列表
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getAllUserRoles`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  page_size  |   分页大小   |   非必填 缺省值为10     | 整型
|  page   |   页数     |     非必填 缺省值为1   | 整型


* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
            "current_page" : 2,//当前页数
            "data": [
                  {
                       "id": 10,//用户id
                       "user_id": 1000,//单点登陆用户id
                       "user_name": "xxxx",//用户名
                       "real_name": "xxxx",//真名
                       "status": 1,//用户状态
                       "email": "",//用户邮箱
                       "last_login_ip": "",//最后登陆
                       "last_login_at": "2018-09-10 02:31:43",//最后登陆时间
                       "tel": "",//用户电话
                       "create_time": "2018-09-10 02:31:43",//创建时间
                       "update_time": "2018-09-10 02:31:43",//更新时间
                       "role": [
                              {
                                        "id": 4,//角色id
                                        "role_name": "channel",//角色名
                                        "description": "渠道",//角色描述
                                        "status": 1,//角色状态
                                        "create_time": "2018-08-01 08:50:21",//创建时间
                                        "update_time": "2018-08-01 08:50:21",//更新时间
                                        "pivot": {
                                                 "user_id": 10,
                                                 "role_id": 4
                                        }
                              }
                       ]
                  },
               "......"
            ],
    "first_page_url" : "http://cloud-dist.test/api/getAllUserRoles?page=1",//首页地址
    "from" : 4, //起始位置
    "last_page" : 3,
    "last_page_url" : "http://cloud-dist.test/api/getAllUserRoles?page=3",//最后一页   
    "next_page_url": "http://cloud-dist.test/api/getAllUserRoles?page=3",//下一页地址
    "path": "http://cloud-dist.test/api/getAllUserRoles",//请求地址
    "per_page": 3,//页面大小
    "prev_page_url": "http://cloud-dist.test/api/getAllUserRoles?page=1",//上一页地址
    "to": 6,//终止位置
    "total": 7 //数据总述      
    }
}
```

失败响应:

```json
{
    "message": "422 Unprocessable Entity",//错误信息
     "errors": {
            "page_size": [ //错误参数
                "分页大小 不能为空。" //错误原因
            ]
        },
     "status_code": 422 //错误响应状态码
}
```
