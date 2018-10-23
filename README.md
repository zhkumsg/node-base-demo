# node-base-demo

#### 项目介绍
手摸手，教你用nodejs搭建后台最小系统

#### 软件架构
nodejs、express、sql server 2008r2


#### 安装教程

1. npm install
2. npm run dev

#### 使用说明

1. [手摸手，教你用nodejs搭建后台最小系统（大量图文）系列一](https://www.jianshu.com/p/ebef9ffb7851)
2. [手摸手，教你用nodejs搭建后台最小系统（大量图文）系列二](https://www.jianshu.com/p/60d6dc2d901a)
3. [数据库结构与数据脚本](https://gitee.com/zhkumsg/node-base-demo/attach_files)
4. [vue管理系统](https://gitee.com/zhkumsg/vue-base-demo)


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

### 角色列表接口

* 功能描述：

```
该接口用于获取所有角色列表
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getAllRolesPerm`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:| :------:|
|  page_size  |   分页大小   |   非必填 缺省值为10     | 整型
|  page   |   页数     |     非必填 缺省值为1   | 整型


* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
        "current_page": 1,//当前页数
        "data": [
            {
                "id": 3,//角色id
                "role_name": "commerce",//角色名
                "description": "商务",//角色描述
                "status": 1,//角色状态
                "create_time": "2018-08-01 08:49:46",//创建时间
                "update_time": "2018-09-10 02:40:32",//更新时间
                "ability": "工作台、项目管理"//功能说明
            },
            "...."
        ],
        "first_page_url": "http://cloud-dist.test/api/getAllRolesPerm?page=1",//首页地址
        "from": 1,//起始位置
        "last_page": 1,//最后一页页数
        "last_page_url": "http://cloud-dist.test/api/getAllRolesPerm?page=1",//最后一页url
        "next_page_url": null,//下一页
        "path": "http://cloud-dist.test/api/getAllRolesPerm",//请求路径
        "per_page": 10,//页面大小
        "prev_page_url": null,//上一页url
        "to": 8,//终止位置
        "total": 8 //总数
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

### 角色权限详情接口

```
该接口用于获取指定角色的所有权限
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getRolesPermDetail`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  role_id  |   角色id   |   必填 | 整型


* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
        "id": 3, //角色id
        "role_name": "commerce_111122", //角色名
        "description": "商务",//角色描述
        "status": 1,//角色状态
        "create_time": "2018-08-01 08:49:46",//创建时间
        "update_time": "2018-09-13 11:18:14",//更新时间
        "perms": [
            {
                "id": 3,//权限id
                "permission_name": "examined",//权限名
                "description": "待审查",//权限描述
                "pid": 1,//权限父id
                "pdescription": "工作台",//权限父描述
                "status": 1,//状态
                "create_time": "2018-07-23 07:33:47",//创建时间
                "update_time": "2018-09-12 11:24:58",//更新时间
                "pivot": {
                    "role_id": 3,//角色id
                    "permission_id": 3 //权限id
                }
            },
             "....."
        ]
    }
}
```

失败响应:

```json
{
    "message": "角色不存在", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```


### 编辑角色及权限接口

```
该接口用于编辑指定角色及其权限
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/editRolePerm`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  role_id  |   角色id   |   必填 | 整型
|  role_name  |   角色名   |   必填 | 字符串
|  permission_ids  |   权限id   |   必填 | 数组


* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
      
    }
}
```

失败响应:

```json
{
    "message": "角色不存在", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```


### 新增角色及权限接口

```
该接口用于编辑指定角色及其权限
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/addRolePerm`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  role_name  |   角色名   |   必填 | 字符串
|  permission_ids  |   权限id   |   必填 | 数组


* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
      
    }
}
```

失败响应:

```json
{
    "message": "数据库异常,操作失败", //错误信息
    "code": 500,//错误返回码
    "status_code": 500 //http返回码
}
```
### 用户游戏列表获取接口

```
该接口用于获取所有游戏列表
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getUserGameList`

* 参数列表:


* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": [
        {
            "company_id": 2,//公司id
            "company_name": "大蓝",//公司名称
            "create_time": 1487731933,//创建时间
            "game_ext1": "",//拓展字段1
            "game_ext2": "",//拓展字段2
            "game_ext3": "",//拓展字段3
            "game_ext4": "",//拓展字段4
            "game_icon_path_md5": "default_icon",//游戏图标icon
            "game_id": 118,//游戏id
            "game_name": "大蓝平台",//游戏名称
            "game_name_pinyin": "dlpt",//游戏拼音
            "game_pay_sign": "2666667d36ccf002ea4ff52def71b7fe",//游戏支付签名
            "game_secret": "8ab5da5c9ba0bc1c2d7cecb60e49e451",//游戏密钥
            "game_union_id": 100000249,//游戏联合渠道id
            "game_union_pay_sign": "7b6d8d546b77897d565fd684293e171d",//游戏联合支付签名
            "game_union_secret": "a54a5750fb31235d742e93baad4e0ac7",//游戏联合密钥
            "group_id": 0,//组id
            "h5_game_url": null,//h5游戏url
            "id": 123,//游戏pid
            "is_outside_valid": true,//外部提包验证
            "keystore": "",//
            "node_id": 0,//
            "orientation": 1,//
            "outside_captcha": "",//外部提包验证
            "splash_file_path_md5": "default_splash",//闪屏文件
            "union_game_pid": 264,//联合id
            "update_time": 1487731933,//更新时间
            "user_id": 1 //用户id
        },
        "...."
    ]
     
}
```
失败响应:

```json
{
    "message": "返回格式中data不存在", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```

```json
{
    "message": "系统异常", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```

### 游戏渠道列表获取接口

```
该接口根据指定的游戏pid获取游戏下所有的渠道及渠道包
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getGameChannelList`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  game_pid  |   游戏pid   |   必填 | 整型

* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
        "6": [//渠道pid
            {
                "analysis_pid": 0,//统计pid
                "channel_name": "37玩-安卓",//渠道名称
                "channel_pid": 6,//渠道pid
                "config_status": 1,//配置文件状态
                "description": "37玩-6137-jh37jh8-玄天修仙（其他渠道包）",//渠道包名
                "game_pid": 39,//游戏pid
                "id": 1239,//渠道包id
                "is_params_update": 0,//参数是否更新
                "online_lock": 0,//上线
                "oversea_union_game_pid": 0,//海外联合id
                "pay_callback_url": [//支付回调url
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/1239"
                ],
                "platform": 0,//渠道类型
                "union_game_pid": 0 //联合渠道id
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37包7-6136-仙骨尘缘",
                "game_pid": 39,
                "id": 1187,
                "is_params_update": 0,
                "online_lock": 0,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/1187"
                ],
                "platform": 0,
                "union_game_pid": 0
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37玩 - 6135-御剑诛仙",
                "game_pid": 39,
                "id": 1093,
                "is_params_update": 0,
                "online_lock": 1,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/1093"
                ],
                "platform": 0,
                "union_game_pid": 0
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37玩 -6134-玄天修仙（应用宝包）",
                "game_pid": 39,
                "id": 1092,
                "is_params_update": 0,
                "online_lock": 1,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/1092"
                ],
                "platform": 0,
                "union_game_pid": 0
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37玩 - 6133-热血仙侠",
                "game_pid": 39,
                "id": 1062,
                "is_params_update": 0,
                "online_lock": 1,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/1062"
                ],
                "platform": 0,
                "union_game_pid": 0
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37玩 - 6132-剑网焚天",
                "game_pid": 39,
                "id": 1011,
                "is_params_update": 0,
                "online_lock": 0,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/1011"
                ],
                "platform": 0,
                "union_game_pid": 0
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37玩 - 全民修仙2-6131",
                "game_pid": 39,
                "id": 944,
                "is_params_update": 0,
                "online_lock": 1,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/944"
                ],
                "platform": 0,
                "union_game_pid": 0
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37应用宝1-  6130  - 山海经：轮回",
                "game_pid": 39,
                "id": 931,
                "is_params_update": 0,
                "online_lock": 1,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/931"
                ],
                "platform": 0,
                "union_game_pid": 0
            },
            {
                "analysis_pid": 0,
                "channel_name": "37玩-安卓",
                "channel_pid": 6,
                "config_status": 1,
                "description": "37玩- 110 - 我欲封仙    版本(2.2.1)",
                "game_pid": 39,
                "id": 749,
                "is_params_update": 0,
                "online_lock": 1,
                "oversea_union_game_pid": 0,
                "pay_callback_url": [
                    "https://agent.ijunhai.com/pay/payFinish/game_id/44/game_channel_id/749"
                ],
                "platform": 0,
                "union_game_pid": 0
            }
        ],
        ".....": []
    }  
}     
```

失败响应:

```json
{
    "message": "返回格式中data不存在", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```

```json
{
    "message": "系统异常", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```

### 用户游戏权限详情接口

```
该接口根据用户id获取该用户的游戏权限及角色详情
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getUserGameDetail`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  id  |   用户id   |   必填 | 整型

* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
        "id": 7,//用户id
        "user_id": 310,//单点登陆id
        "user_name": "xx",//用户名
        "real_name": "xx",//真名
        "status": 1,//状态
        "email": "xx@ijunhai.com",//邮箱
        "last_login_ip": "",//最后登陆ip
        "last_login_at": "2018-07-31 10:39:24",//最后登录时间
        "tel": "",//电话
        "create_time": "2018-07-31 10:39:24",//创建时间
        "update_time": "2018-07-31 10:39:24",//更新时间
        "roles": {
            "id": 6,//角色id
            "role_name": "outsidePerson",//角色名
            "description": "外部人员",//角色描述
            "status": 1,//状态
            "create_time": "2018-08-01 08:52:19",//角色创建时间
            "update_time": "2018-08-01 08:52:19",//角色更新时间
            "pivot": {
                "user_id": 7,
                "role_id": 6
            }
        },
        "game_perm": {//游戏权限
            "id": 1,//游戏权限id
            "game_channel_pack_list": {//游戏权限详情
                "44": {//游戏pid
                    "game_pid": "44",//游戏pid
                    "game_id": "39",//游戏id
                    "game_name": "我欲封仙",//游戏名称
                    "channel_pid": {//渠道设置
                        "6": {//渠道pid
                            "1": {//数字索引无特殊含义
                                "id": "1239",//渠道包id
                                "platform": "0",//渠道类型
                                "description": "37玩-6137-jh37jh8-玄天修仙（其他渠道包）",//渠道包名
                                "channel_name": "37玩-安卓"//渠道名称
                            },
                            "2": {
                                "id": "1187",
                                "platform": "0",
                                "description": "37玩 - 6135-御剑诛仙",
                                "channel_name": "37玩-安卓"
                            }
                        },
                        "8": {//渠道pid
                            "channel_name": "虫虫助手-安卓",//渠道名称
                            "description": "虫虫助手- 版本(1.4.0)",//渠道包名
                            "id": 838,//渠道包id
                            "platform": 0 //渠道类型
                        }
                    }
                },
                "...":{
                  "....":"..."
                }
            },
            "users_id": 7,//用户id
            "status": 1,//状态
            "create_time": "2018-09-14 10:31:57",//创建时间
            "update_time": "2018-09-17 02:55:17" //更新时间
        }
    }
}
```


失败响应:

```json
{
    "message": "没有该用户", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```


### 用户游戏权限编辑接口


```
该接口为指定用户分配游戏权限及角色
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/editUserGameAuth`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  id  |   用户id   |   必填 | 整型 
|  role_id |  角色id |  必填 |  整型
| game_perm | 游戏权限 | 必填 | 数组 

* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": []
}
```

失败响应：

```json
{
    "message": "数据库异常,操作失败", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```

### 根据用户权限获取游戏列表

```
该接口为当前登陆用户授权的游戏列表
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getGameList`

* 参数列表:

* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
        "44": {//游戏pid
            "game_pid": "44",//游戏pid
            "game_id": "39",//游戏id
            "game_name": "我欲封仙"//游戏名
        },
        "....": {}
    }
}
```


失败响应：

```json
{
    "message": "数据库异常,操作失败", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```

### 渠道类型获取接口


```
该接口根据任务类型获取渠道类型
```

* 请求方式: POST / GET

* 请求头: `application/json`

* 路径: `api/getGamePlatformType`

* 参数列表:

| 参数名称  |   参数说明  |  备注 | 类型|
|:-------:|:----------:|:------:|:------:|
|  release_type  |   任务类型   |   必填 | 整型 
|  game_pid |  游戏pid |  必填 |  整型


* 响应

成功响应:

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": {
        "6": {//渠道pid
            "1": {//数字索引无特殊含义
                "id": "1239",//渠道包id
                "platform": "0",//渠道类型
                "description": "37玩-6137-jh37jh8-玄天修仙（其他渠道包）",//渠道包名称
                "channel_name": "37玩-安卓"//渠道名称
            },
            "2": {
                "id": "1187",
                "platform": "0",
                "description": "37玩 - 6135-御剑诛仙",
                "channel_name": "37玩-安卓"
            }
        },
        "8": {
            "channel_name": "虫虫助手-安卓",
            "description": "虫虫助手- 版本(1.4.0)",
            "id": 838,
            "platform": 0
        }
    }
}
```

```json
{
    "code": 200,//返回结果码
    "message": "success",//返回的结果信息
    "content": [
        {
            "id": 1,//云发行渠道类型id
            "name": "安卓手游",//云发行渠道名称
            "platform": 0,//渠道类型
            "status": 1,//状态
            "create_time": "2018-09-17 07:44:51",//创建时间
            "update_time": "2018-09-17 07:44:51"//更新时间
        },
        {
            "id": 2,
            "name": "安卓微端",
            "platform": 7,
            "status": 1,
            "create_time": "2018-09-17 07:45:04",
            "update_time": "2018-09-17 07:45:04"
        },
        {
            "id": 3,
            "name": "安卓渠道壳",
            "platform": 8,
            "status": 1,
            "create_time": "2018-09-17 07:48:31",
            "update_time": "2018-09-17 07:49:08"
        },
        {
            "id": 4,
            "name": "ios手游",
            "platform": 6,
            "status": 1,
            "create_time": "2018-09-17 07:45:21",
            "update_time": "2018-09-17 07:49:20"
        },
        {
            "id": 5,
            "name": "ios微端",
            "platform": 9,
            "status": 1,
            "create_time": "2018-09-17 07:46:05",
            "update_time": "2018-09-17 07:49:23"
        },
        {
            "id": 6,
            "name": "ios渠道壳",
            "platform": 8,
            "status": 1,
            "create_time": "2018-09-17 07:49:45",
            "update_time": "2018-09-17 07:49:45"
        },
        {
            "id": 7,
            "name": "纯h5",
            "platform": 8,
            "status": 1,
            "create_time": "2018-09-17 07:55:07",
            "update_time": "2018-09-17 07:55:07"
        }
    ]
}
```


失败响应：

```json
{
    "message": "数据库异常,操作失败", //错误信息
    "code": 400,//错误返回码
    "status_code": 500 //http返回码
}
```




