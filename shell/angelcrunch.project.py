import requests
from bs4 import BeautifulSoup
import json
import time
import random
import json

#全局
header = {
    "Referer": "http://angelcrunch.com/auth/",
    "Host": "angelcrunch.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"
}
session_requests = requests.session()


#打印标题
def PrintTitle(title):
    print("\n==========",title,"==========")


#模拟登录
def Login(account,password):
    url = "http://angelcrunch.com/auth/j/login?o={'account':'"+ account +"','password':'"+ password +"'}"
    session_requests.get(url, headers=header)


#获取项目列表
#项目数据结构：
#|---项目标题 √
#|---项目logo √
#|---项目BP √
#|---融资金额
#|---所属行业 √
#|---项目标签（后期分类标签）
#|---项目阶段 √
#|---融资轮次
#|---负责人姓名
#|---负责人手机
#|---负责人邮箱
#|---项目需求（富文本）
#|---项目概述（富文本） √
#|---项目优势（富文本）
#|---团队介绍（富文本）
#+---所属公司（后期合并公司）
#   |---公司名字 √
#   |---所在省份（三级联动）
#   |---所在城市
#   |---公司简介（富文本）
#+---相关新闻
#   |---新闻标题
#   |---新闻链接
#   |---访问时间
def GetList(pageno):
    PrintTitle("正在爬取第" + str(pageno) + "页")
    req = session_requests.get("http://angelcrunch.com/j/startup?page=" + str(pageno), headers = header)
    req.encoding = "UTF-8"
    res = req.json()[0]
    if len(res) > 0:
        for item in res:
            project = {
                "ZK_FOREIGNKEY": str(item.get("com_id","")),
                "ZK_TITLE": str(item.get("com_name","")),
                "ZK_LOGO": str(item.get("logo","")),
                "ZK_INDUSTRY": str(item.get("business","")),
                "ZK_STATUS": str(item.get("stage","")),
                "ZK_DESC": "",
                "ZK_MONEY": "",
                "ZK_TEAM": "",
                "ZK_MEMBERS": [],
                "ZK_BP": ""
            }
            GetDetail(project)
        #time.sleep(random.uniform(3, 5))
        #GetList(pageno + 1)
    else:
        PrintTitle("全部获取完成")


#获取项目详情
def GetDetail(project):
    #time.sleep(random.uniform(0.4, 1))
    print("|---" + project["ZK_TITLE"])
    GetDescAndMoney(project)
    GetTeam(project)
    GetBPInfo(project)


#获取项目详情和融资金额
def GetDescAndMoney(project):
    url = "http://angelcrunch.com/startup/"+ project["ZK_FOREIGNKEY"] +"/j/detail_info_view"
    req = session_requests.get(url, headers = header)
    req.encoding = "UTF-8"
    data = req.json()["data"]
    info = data["detail_info"]
    print(info)
    project["ZK_DESC"] = str(info.get("description",""))
    project["ZK_MONEY"] = str(info.get("user_size","")) + str(info.get("user_unit",""))


#获取机构团队信息
def GetTeam(project):
    url = "http://angelcrunch.com/startup/"+ project["ZK_FOREIGNKEY"] +"/j/team_info"
    req = session_requests.post(url, headers = header)
    req.encoding = "UTF-8"
    data = req.json()["data"]
    project["ZK_TEAM"] = data["desc"]["team_desc"]
    for member in data["members"]:
        project["ZK_MEMBERS"].append({
            "ZK_NAME": member["member_name"],
            "ZK_POSITION": member["member_title"],
            "ZK_AVATAR": "http://fs.angelcrunch.com/IMG/" + member["member_avatar"],
            "ZK_MOBILE": member["mobile"],
            "ZK_EMAIL": member["email"]
        })


#获取项目BP信息
def GetBPInfo(project):
    url = "http://angelcrunch.com/startup/" + project["ZK_FOREIGNKEY"] + "/j/bp"
    req = session_requests.get(url, headers = header)
    req.encoding = "UTF-8"
    data = req.json()["data"]
    project["ZK_BP"] = str(data.get("bp",""))
    

#插入数据库
def Insert(project):
    pass


#开始爬取
Login("tencent@crqcn.com","123456")
GetList(1)