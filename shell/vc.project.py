import requests
from bs4 import BeautifulSoup
import json
import time
import random
import json

#全局
header = {
    "Referer": "https://www.vc.cn/startups",
    "Host": "www.vc.cn",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
}


#打印标题
def PrintTitle(title):
    print("\n==========",title,"==========")


#获取项目列表
#项目数据结构：
#|---项目标题 
#|---项目logo 
#|---项目BP 
#|---融资金额
#|---所属行业 
#|---项目标签（后期分类标签）
#|---项目阶段 
#|---融资轮次
#|---负责人姓名
#|---负责人手机
#|---负责人邮箱
#|---项目需求（富文本）
#|---项目概述（富文本） 
#|---项目优势（富文本）
#|---团队介绍（富文本）
#+---所属公司（后期合并公司）
#   |---公司名字 
#   |---所在省份（三级联动）
#   |---所在城市
#   |---公司简介（富文本）
#+---相关新闻
#   |---新闻标题
#   |---新闻链接
#   |---访问时间
def GetList(pageno):
    PrintTitle("正在爬取第" + str(pageno) + "页")
    req = requests.get("https://www.vc.cn/startups?page="+ str(pageno), headers = header)
    req.encoding = "UTF-8"
    soup = BeautifulSoup(req.text, "html.parser")
    trs = soup.find("tbody", id="startup-list").find_all("tr")
    print(trs)







#开始爬取
GetList(1)