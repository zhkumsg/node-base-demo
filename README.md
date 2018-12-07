# node-base-demo
![alt nodejs](https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75)  

![alt express](https://camo.githubusercontent.com/fc61dcbdb7a6e49d3adecc12194b24ab20dfa25b/68747470733a2f2f692e636c6f756475702e636f6d2f7a6659366c4c376546612d3330303078333030302e706e67)

#### 项目介绍
##### 手摸手，教你用nodejs搭建后台最小系统
基于node express框架，采用三层模式开发，具备用户管理、权限管理、文章系统、日志等常见模块，可快速拓展并适用于各种业务场景，如企业官网、管理系统、个人博客以及微信开发等。  

数据库可适配mssql和mysql（后续添加oracle、mongodb等），只需简单配置连接参数，无需手动拼接sql语句，自动按照业务逻辑实现数据库操作 *[msg-dataassess-base](https://www.npmjs.com/package/msg-dataaccess-base)*。

服务可部署在linux或window服务器上，为了规避http攻击，可配置http连接数限制，默认120条/分钟，相关请求会自动保存到logs日志中。

与前端框架无缝对接，采用token替代session，前端可以使用vue、react、angular、jq等主流框架  
* vue [https://gitee.com/zhkumsg/vue-base-demo](https://gitee.com/zhkumsg/vue-base-demo)
* react [https://gitee.com/zhkumsg/react-base-demo](https://gitee.com/zhkumsg/react-base-demo)


#### 目录结构
```
+-- bin
|   +-- www                     底层启动文件
+-- common
|   +-- AuthorizeLogin.js       授权相关
|   +-- HttpLimitConn.js        http拦截相关
|   +-- JsonCodeEnum.js         返回信息枚举
|   +-- MemoryCondition.js      查询条件
|   +-- MemoryResult.js         查询结果
|   +-- MsgJsonHelper.js        http响应帮助类
|   +-- QueryModel.js           通用查询枚举
|   +-- ServiceClient.js        通用查询实例
|   +-- SubCondition.js         子查询条件
|   +-- TokenHelper.js          token相关
|   +-- WXBizDataCrypt.js       微信小程序解密
+-- logs
|   +-- access-{date}.log       日志
+-- model                       实体类
|   +-- model.module.js         
|   +-- ZK_INFORMATION.js       文章
|   +-- ZK_INVESTMENT.js        投融事件
|   +-- ZK_INVESTOR_CASE.js     投资机构
|   +-- ZK_INVESTOR_TEAM.js     投资团队
|   +-- ZK_INVESTOR.js          投资人
|   +-- ZK_NAVTREE.js           导航
|   +-- ZK_PARAMINFO.js         系统参数
|   +-- ZK_PERMITCONFIG.js      权限配置
|   +-- ZK_PERMITINFO.js        权限
|   +-- ZK_ROLEINFO.js          角色
|   +-- ZK_USERINFO.js          用户
+-- public                      资源
|   |-- stylesheets
|   |   +-- style.css           css样式
+-- routes                      路由
|   +-- home.js                 首页路由
|   +-- information.js          文章路由
|   +-- investment.js           投资事件路由
|   +-- investor.js             投资人路由
|   +-- leadingin.js            导入路由
|   +-- main.js                 控制台路由
|   +-- navtree.js              导航树路由
|   +-- param.js                系统参数路由
|   +-- permit.js               权限路由
|   +-- permitconfig.js         权限配置路由
|   +-- role.js                 角色路由
|   +-- route.base.js           路由中间件
|   +-- start.js                入口路由
|   +-- users.js                用户路由
|   +-- weixinxcx.js            微信小程序路由
+-- shell
|   +-- dictionary_common.txt   天朝常见网站弱口令字典
|   +-- login_hack.py           登录破解
|   +-- investor.ico            exe图标
|   +-- requirements.txt        python包依赖
|   +-- sync_jianshu.py         同步简书文章
|   +-- vc.investor.py          爬取投资人
|   +-- vc.project.py           爬取投资机构
+-- views
|   +-- error.html              错误页
|   +-- index.html              首页
|-- app.js                      express程序入口
|-- package.json
|-- table.config.js             数据库表映射配置
|-- web.config.js               系统配置参数
|-- web.global.js               系统全局配置
```

1. 

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

#### shell 依赖

1. cd ./shell                       (进入shell目录)
2. pip install -r requirements.txt  (自动安装依赖)
3. pip freeze > requirements.txt    (导出最新依赖)


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
