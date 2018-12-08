# node-base-demo
![alt nodejs](https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=1841004364,244945169&fm=58&bpow=121&bpoh=75)  

![alt express](https://camo.githubusercontent.com/fc61dcbdb7a6e49d3adecc12194b24ab20dfa25b/68747470733a2f2f692e636c6f756475702e636f6d2f7a6659366c4c376546612d3330303078333030302e706e67)

## 项目介绍
##### 手摸手，教你用nodejs搭建后台最小系统
基于node express框架，采用三层模式开发，具备用户管理、权限管理、文章系统、日志等常见模块，可快速拓展并适用于各种业务场景，如企业官网、管理系统、个人博客以及微信开发等。  

数据库可适配mssql和mysql（后续添加oracle、mongodb等），只需简单配置连接参数，无需手动拼接sql语句，自动按照业务逻辑实现数据库操作 *[msg-dataassess-base](https://www.npmjs.com/package/msg-dataaccess-base)*（已发布到npm）。

服务可部署在linux或window服务器上，为了规避http攻击，可配置http连接数限制，默认120条/分钟，相关请求会自动保存到logs日志中。

与前端框架无缝对接，采用token替代session，前端可以使用vue、react、angular、jq等主流框架  
* vue [https://gitee.com/zhkumsg/vue-base-demo](https://gitee.com/zhkumsg/vue-base-demo)
* react [https://gitee.com/zhkumsg/react-base-demo](https://gitee.com/zhkumsg/react-base-demo)

----
## 开发环境
* linux or window
* mssql or mysql
* nodejs
* express
----
## 目录结构
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
|-- web.config.js               系统配置
|-- web.global.js               系统全局
```
### 简要说明
1. bin/www  
express框架底层启动文件(物理入口)，在里面可配置监听端口与启动全局命令（默认端口`3000`）  

2. common/ServiceClient.js  
通用查询实体类，通过枚举实现`快速查询  `

3. model/...  
实体类，与数据库表一一对应，需要注意五个默认字段，分别是`EB_ISDELETE`、`EB_CREATE_DATETIME`、`EB_CREATEBY`、`EB_LASTMODIFYBY`、`EB_LASTMODIFY_DATETIME`，分别代表是否逻辑删除和操作信息等，与[msg-dataaccess-base](https://www.npmjs.com/package/msg-dataaccess-base)模块配套使用（*原则上每个表都需要具备*）  

4. routes/route.base.js  
路由中间件，在各个路由中使用，用于检测登陆状态以及权限信息  

5. app.js  
express框架入口文件（逻辑入口），在这里配置路由以及中间件  

6. table.config.js  
数据库表`映射`配置，程序会读取该文件获取到数据库的表名和主键，再通过同名实体类获取到数据库相关字段  

7. web.config.js  
程序配置文件，常用于保存相关参数，如数据库连接字符串、数据库类型、token密钥、服务端口以及websocket端口等。此文件为私密文件，故不对外开发，注意做好保密工作。*默认不存在,需要新建，详细看后续说明*  

8. web.global.js  
系统全局，用于在系统启动是触发，缓存系统参数
----

## Installation
### 数据库
数据库暂支持mssql与mysql，需要的创建核心表如下:  
0. `通用字段` 默认每个表都有

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| EB_ISDELETE | nvarchar | 2 | 0 | 0/1 是否逻辑删除 |
| EB_CREATE_DATETIME | datetime | - | - | 创建时间 |
| EB_CREATEBY | nvarchar | 50 | - | 创建人主键 |
| EB_LASTMODIFYBY | nvarchar | 50 | - | 最后修改人主键 |
| EB_LASTMODIFY_DATETIME | datetime | - | - | 最后修改时间 |

1. ZK_USERINFO `用户表`  

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| ZK_ID | nvarchar | 50 | - | 主键 |
| ZK_OPENID | nvarchar | 50 | - | 微信openid |
| ZK_PASSWORD | nvarchar | 50 | - | md5 |
| ZK_NAME | nvarchar | 50 | - | - |
| ZK_SEX | nvarchar | 10 | - | 男/女 |
| ZK_PHONE | nvarchar | 50 | - | - |
| ZK_EMAIL | nvarchar | 50 | - | - |
| ZK_ROLE | nvarchar | 50 | - | 角色主键 |
| ZK_DEPARTMENT | nvarchar | 50 | - | - |
| ZK_REMARK | nvarchar | 200 | - | 备注 |
| ZK_HEAD_PORTRAIT | nvarchar | 250 | - | 头像 |
| ZK_USERSOURCE | nvarchar | 200 | - | 来源 |
| `通用字段` | - | - | - | - |

2. ZK_ROLEINFO `角色表`  

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| ZK_ID | nvarchar | 50 | - | 主键 |
| ZK_ROLE | nvarchar | 50 | - | 角色名 |
| ZK_DESC | nvarchar | 200 | - | 描述 |
| ZK_LEAVE | int | - | - | 级别 0代表最高 |
| ZK_ISADMIN | nvarchar | 2 | - | 0/1 是否管理员 |
| `通用字段` | - | - | - | - |

3. ZK_PARAMINFO `公共维度表`  

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| ZK_ID | nvarchar | 50 | - | 主键 |
| ZK_KEY | nvarchar | 50 | - | 参数名 |
| ZK_VALUE | nvarchar | 250 | - | 参数值 |
| ZK_DESC | nvarchar | 200 | - | 描述 |
| `通用字段` | - | - | - | - |

4. ZK_PERMITINFO `权限信息表`  

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| ZK_ID | nvarchar | 50 | - | 主键 |
| ZK_PATH | nvarchar | 250 | - | 路由路径 |
| ZK_COMPONENT | nvarchar | 50 | - | 组件 |
| ZK_NAME | nvarchar | 50 | - | 名称 |
| ZK_ISHIDDEN | nvarchar | 2 | - | 0/1 是否隐藏 |
| ZK_ICON | nvarchar | 50 | - | icon图表 |
| ZK_ISLEAF | nvarchar | 2 | - | 0/1 是否为叶子节点 |
| ZK_PARENT | nvarchar | 50 | - | 父级主键 |
| ZK_SORT | nvarchar | int | 0 | 排序 0最高 |
| `通用字段` | - | - | - | - |

5. ZK_PERMITCONFIG `权限配置表`  

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| ZK_ID | nvarchar | 50 | - | 主键 |
| ZK_ROLE | nvarchar | 250 | - | 角色主键 |
| ZK_PERMITID | nvarchar | 50 | - | 权限主键 |

6. ZK_NAVTREE `文章目录表` *[选用]*  

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| ZK_ID | nvarchar | 50 | - | 主键 |
| ZK_NAME | nvarchar | 50 | - | 名称 |
| ZK_ISLEAF | nvarchar | 2 | - | 0/1 是否叶子节点 |
| ZK_PARENT | nvarchar | 50 | - | 父级主键 |
| ZK_SORT | int | - | 0 | 排序 |
| ZK_ISHIDDEN | nvarchar | 2 | 0 | 0/1 是否隐藏 |
| `通用字段` | - | - | - | - |

7. ZK_INFORMATION `文章信息表` *[选用]*  

| 字段名 | 字段类型 | 字段长度 | 默认 | 备注 |
|:------:|:------:|:------:|:------:|:------:|
| ZK_ID | nvarchar | 50 | - | 主键 |
| ZK_TITLE | nvarchar | 200 | - | 标题 |
| ZK_DESC | text | max | - | 详情 富文本 |
| ZK_AUTHOR | nvarchar | 50 | - | 作者名 |
| ZK_PUBDATE | datetime | - | - | 发布时间 |
| ZK_SORT | int | - | 0 | 排序 |
| ZK_COVERIMG | nvarchar | 250 | - | 封面 |
| ZK_NAVID | nvarchar | 50 | - | 所属目录id |
| `通用字段` | - | - | - | - |

### 配置文件
默认情况下，配置文件web.config.js是不存在的，需要手动创建  
window环境：  
``` cmd
type nul>web.config.js
```

linux环境：  
``` linux
$ touch web.config.js
```
配置中有五个`关键参数`，分别是mssql连接字符串DbConnectionString、mysql连接配置MySqlConnectionCfg、数据库类型DbType、token密钥TokenSecret、服务端口HttpPort，代码如下：
``` js
module.exports = {
    DbConnectionString: "mssql://账号:密码@ip:端口/数据库",
    MySqlConnectionCfg: {
        host: "ip",
        user: '账号',
        password: '密码',
        port: '端口',
        database: '数据库',
        multipleStatements: true
    },
    DbType: "MYSQL",//MSSQL,MYSQL,ORACLE,ODBC...
    TokenSecret: "msg is a handsome boy",
    HttpPort: 3000
};
```
*ps：也可到附件中下载[模板](https://gitee.com/zhkumsg/node-base-demo/attach_files)*

### npm 依赖与启动
``` bash
$ npm install
$ npm run dev
```
express默认是不支持热更新的，这里使用了nodemon模块实现热更新  

----
## 使用说明
### 如何使用通用查询？
通用查询使用common/ServiceClient，比如需要`查找全部`的用户信息（单表），我们可以这样执行下面的代码
``` js
const client = require('@/common/ServiceClient');
const QueryModel = require('@/common/QueryModel');

client.Query(
    QueryModel.ZK_USERINFO, //查询枚举
    [], //查询条件
    null, //类型
    0, //pagesize
    0, //pageno
    false, //是否分页
    null //排序类型
).then(m => {
    console.log(m); //结果
}).catch(err => {
    //todo
});
```
如果需要查询需要`匹配特定信息`，如账号为admin的用户，我们需要加上MemoryCondition条件实体类作为Query的第二个参数，如下
``` js
const MemoryCondition = require('@/common/MemoryCondition');
const {MType, MLogic, MOperator} = require('msg-dataaccess-base');

let condition = [];
condition.push(new MemoryCondition({
	Field: 'ZK_ID',
	Logic: MLogic.And,
	Operator: MOperator.In,
	Type: MType.Mstring,
	value: 'admin'
}));
client.Query(
    QueryModel.ZK_USERINFO, 
    condition,
    ...
).then(m => {
    //todo
});
```
这是如果需要排序，我们可以再添加一个SortParam对象作为Query的最后一个参数，如按照创建时间`降序排列`，如下
``` js
const {..., SortParam, Direction} = require('msg-dataaccess-base');

...
let sort = new SortParam({
	Field: 'EB_CREATE_DATETIME',
	SortDirection: Direction.DESC
});
client.Query(
    ...,
    sort
).then(m => {
    //todo
});
```
更多情况下，我们需要服务端进行`分页处理`获取列表，这时候我们就需要配置Query的4/5/6个参数了，如希望一页15条数据而且获取第一页的数据，那么代码如下
``` js
...
client.Query(
    ...,
    15,
    1,
    true
    ...
).then(m => {
    //todo
});
```
在逻辑较复杂的情况下，我们往往需要做联表操作，这时候我们需要带通用查询中添加一条带join的基础语句case，这里不做详细展开，具体可看源码。

### 如何自动执行增删改？
除了快速的通用查询外，我们还有快速执行单表的增删改方法，我们需要调用`Public.OperationSQLParams`方法把实体类转换成sql语句和参数，使用`OperationEnum`枚举选择操作类型，再调用底层的TransRunQuery实现操作，如我们要新增一个用户，快速操作如下
``` js
const ZK_USERINFO = require('@/model/ZK_USERINFO');
const {DataAccess, Public, OperationEnum} = require('msg-dataaccess-base');
const ds = new DataAccess();

let user = new ZK_USERINFO({ ... });
ds.TransRunQuery(Public.OperationSQLParams(user, OperationEnum.Create)).then(flag => {
    console.log(flag); //操作结果
}).catch(err => {
    //todo
});
```
* `OperationEnum.Create`：新增  
* `OperationEnum.Delete`：更新（不常用）  
* `OperationEnum.Update`：更新（检测最后修改时间）  
* `OperationEnum.UpdateNoCheck`：更新（不检测修改时间）  

当然不同业务使用不同枚举即可实现，需要注意的是实体类的相关参数需要补充完成，如新增和删除时主键不为空，更新时会检测最后修改时间是否有效。  

除了单个实体类的外，`Public.OperationSQLParams`还支持数组的转换，如批量新增，只需要把第一个参数换成数组即可，如
``` js
ds.TransRunQuery(Public.OperationSQLParams([user],...));
```

### 如何自定义查询？
如果普通的通用查询无法满足要求，我们也提供了原生的查询方式，这里需要调用DataAccess实例下的GetTable方法，如希望获取前10条用户信息（SQL servr），我们可以这样用
``` js
const {DataAccess} = require('msg-dataaccess-base');
const ds = new DataAccess();

ds.GetTable("select top 10 * from zk_userinfo").then(table => {
    console.log(table)
});
```
### 如何自定义增删改？
如果快速操作无法满足业务需求，我们也提供了原生的增删改方法，这里需要调用DataAccess实例下的RunQuery方法，如希望更新一条用户信息，如下
``` js
const {DataAccess} = require('msg-dataaccess-base');
const ds = new DataAccess();

ds.RunQuery("update zk_userinfo set zk_name = 'abc' where zk_id='admin'").then(flag => {
    console.log(flag)
});
```
切记update和delete需要加`匹配参数`，避免`删库`到跑路
### 如何删除数据？
如果需要删除一条记录，前面也提到两种方式
* 使用ds.TransRunQuery
* 使用ds.RunQuery  

除此之外，我们还可以使用ServiceClient实例下的`DeleteByIds`方法，它接受三个参数，分别是实体类型、主键/主键数组、是否物理删除（默认false，逻辑删除），如需要删除id为admin的用户，操作如下，
``` js
const client = require('@/common/ServiceClient');
const ZK_USERINFO = require('@/model/ZK_USERINFO');

client.DeleteByIds(ZK_USERINFO, "admin").then(flag => {
    console.log(flag)
})
```
主键参数还可以接受数组，如`['admin']`  

逻辑删除与物理删除的区别在于是否把数据真正从数据库中删除，逻辑删除是把`EB_ISDELETE`字段置为1，底层查询时会自动过滤EB_ISDELETE等于1的记录；物理删除是把数据从数据库中清除，无法恢复。 

### 如何使用参数化查询？
为了避免sql注入攻击，如果适用自定义查询的时候，可以用DataAccess实例下的parse方法过滤参数，如：
``` js
let id = ...;
let sqlstr = "select * from zk_userinfo where zk_id = '" + ds.parse(id) + "'";
```
如果适用的是快速操作，默认情况下是适用参数化查询
### 如何开启事务？
默认均`已开启`事务操作（除了mysql）
### 增加一个表后如何配置？
如果业务变动，新增了一个表，如课程表ZK_COURSE（假设主键为ZK_ID），那么在数据库新增完表后，我们需在在代码中做以下操作  

1. table.config.js 下增加ZK_COURSE节点
``` js
ZK_COURSE: {//节点名
	name: 'ZK_COURSE',//表名
	pk: 'ZK_ID',//主键名
}
```
2. model/ 下新建ZK_COURSE实体类
``` js
const propertys = [
    'ZK_ID',
    ...
];

class ZK_COURSE {
	constructor() {
		propertys.forEach(name => {
			this[name] = undefined;
		});
		this.set(arguments[0]);
	}
	get(key) {
		...
	}
	set() {
        ...
	}
}

module.exports = ZK_COURSE;
```
3. common/QueryModel.js 下增加ZK_COURSE枚举
``` js
ZK_COURSE: 'ZK_COURSE'
```
4. common/ServiceClient.js 下添加case
``` js
const ZK_COURSE = require('@/model/ZK_COURSE');
...
case QueryModel.ZK_COURSE: result = this.getqueryPara(ZK_COURSE); break;
```
如果希望实现复杂查询，如希望课程表与用户表联表查询，可以做如下修改
``` js
case QueryModel.ZK_COURSE: 
    return Single.querySQL('select * from zk_course T1 left join zk_userinfo T2 on T1.ZK_ID = T2.ZK_ID', condition, size, pagesize, pageno, isPager, sp); 
    break;
```
连表sql参考
``` sql
select * from zk_course T1 left join zk_userinfo T2 on T1.ZK_ID = T2.ZK_ID
```
### 如何登陆及判断权限？
在web开发中，用户身份很重要，我们往往是通过session来保存用户信息和登陆状态的，但是在前后端分离的情况下，请求会存在跨域，所以我们采用token的形式来实现保存登陆状态。  

在用户登陆后，会返回access_token和permit_token两个参数，前端需要自行缓存，然后在后续的每一个请求中携带在请求头中，同时正常响应时，响应头中也会返回最新的access_token，避免登陆超时，下面是具体流程：  

1. 发起login请求  
``` json
{
    "ID": "账号",
    "PWD": "密码",
    "CAPTCHA": "验证码",
    "_CAPTCHA": "验证码密文"
}
```
* 密码需要使用md5加密
* _CAPTCHA为调用`/Http/Msg/MsgStart.ashx？method=Backend_Captcha`获取图片验证码后返回的密文  
2. 登陆成功返回token
``` json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJaS19JRCI6ImFkbWluIiwiWktfT1BFTklEI....",
    "permit_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfX3NlbGZfXyI6W3siWktfSUQiOiIwMDgxM...."
}
```
3. 前端缓存token
``` js
//localStorage
//sessionStorage
```
4. 发起请求时请求头携带token
``` json
headers: {
    "Access-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJaS19JRCI6ImFkbWluIiwiWktfT1BFTklEI....",
    "Permit-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfX3NlbGZfXyI6W3siWktfSUQiOiIwMDgxM...." 
}
```
5. 响应时更新token
``` js
//response.headers中返回最新的access_token
//缓存
```
### 如何设置http连接限制？
为了避免网站被攻击，如暴力破解登陆，我们增加了http连接限制，默认情况下是同ip1分钟最多连接120次  
``` js
var httpLimit = new HttpLimitConn({ limit: 120, space: '30 * * * * *' });
```
如果需要更改，需要把app.js下的HttpLimitConn实例修改即可，`limit`代表次数，`space`代表间隔，`30 * * * * *`的意思的每分钟的第30秒为分界

----
## shell脚本
* python
1. cd ./shell                       (进入shell目录)
2. pip install -r requirements.txt  (自动安装依赖)
3. pip freeze > requirements.txt    (导出最新依赖)


----
## 接口文档

### 环境域名
协议: `http`

* 正式域名: `*.*.com`
* 预发布域名： `*.*.com`
* 测试域名： `localhost:3000`

### 接口介绍

* 请求方式: POST / GET / OPTION

* 请求头: `application/x-www-form-urlencoded`

* 路径: `xxx/xxx`

* 成功响应:  
```json
{
    "code": -1,
    "flag": "True",
    "message": "",
    "result": ...
}
```

* 失败响应:

```json
{
    "code": 0,
    "flag": "False",
    "message": "...",
    "result": null
}
```
* code类型：
``` js
  Normal: -1, //正常
  Error: 0, //错误警告
  Timeout: 1, //登录超时
  Nopermit: 2 //无权限
```

----
## 参考链接
1. [手摸手，教你用nodejs搭建后台最小系统（大量图文）系列一](https://www.jianshu.com/p/ebef9ffb7851)  

2. [手摸手，教你用nodejs搭建后台最小系统（大量图文）系列二](https://www.jianshu.com/p/60d6dc2d901a)  

3. [数据库结构与数据脚本](https://gitee.com/zhkumsg/node-base-demo/attach_files)  

4. [vue管理系统](https://gitee.com/zhkumsg/vue-base-demo)  
