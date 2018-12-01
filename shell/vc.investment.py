import requests
from bs4 import BeautifulSoup
import json
import time
import random
import json

#全局
header = {
    "Referer": "https://www.vc.cn/investments",
    "Host": "www.vc.cn",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
}
repeatTotal = 0


#打印标题
def PrintTitle(title):
    print("\n==========",title,"==========")



#获取列表
#投融事件数据结构：
#|---logo
#|---项目名字
#|---所属行业
#|---融资轮次
#|---融资金额
#|---投资方
#|---融资时间
#|---融资信息（项目介绍）
def GetList(pageno):
    PrintTitle("正在爬取第" + str(pageno) + "页")
    req = requests.get("https://www.vc.cn/investments?page="+ str(pageno), headers = header)
    req.encoding = "UTF-8"
    soup = BeautifulSoup(req.text, "html.parser")
    trs = soup.find("tbody", id="investment-list").find_all("tr")
    if len(trs) > 0:
        for tr in trs:
            id = ""
            logo = ""
            industry = ""
            _time = ""
            if(tr.find("div", class_="avatar").find("img") != None):
                logo = tr.find("div", class_="avatar").find("img")["data-echo"].split("?")[0]
            if(tr.find("div", class_="taglist") != None):
                if(tr.find("div", class_="taglist").find("span") != None):
                    industry = tr.find("div", class_="taglist").find("span").text
            if(tr.find("td", class_="invest-time") != None):
                _time = tr.find("td", class_="invest-time").text
            id = tr.find("div", class_="name").a["href"].split("?")[0].split("/")[-1] + "_" + _time 
            investment = {
                "ZK_FOREIGNKEY": id,
                "_href": "https://www.vc.cn" + tr.find("div", class_="name").a["href"],
                "ZK_LOGO": logo,
                "ZK_TITLE": tr.find("div", class_="avatar").find("a")["title"],
                "ZK_INDUSTRY": industry,
                "ZK_ROUNDS": tr.find("li", class_="round").text,
                "ZK_MONEY": tr.find("td", class_="number").text,
                "ZK_INVESTORS": tr.find_all("td", class_="link-list")[1].text,
                "ZK_TIME": _time,
                "ZK_DESC": ""
            }
            GetDetail(investment)
        time.sleep(random.uniform(3, 5))
        if(repeatTotal > 30):
            print("重复次数过多，停止获取下一页")
        else:
            GetList(pageno + 1)
    else:
        PrintTitle("全部获取完成")


#获取详情
def GetDetail(investment):
    time.sleep(random.uniform(0.1, 1))
    print("|---" + investment["ZK_TITLE"])
    req = requests.get(investment["_href"], headers = header)
    req.encoding = "UTF-8"
    if(req.status_code != 200):
        print("该事件已下线或不存在，跳过搜索")
        return False
    soup = BeautifulSoup(req.text, "html.parser")
    if(soup.find("div", id="basic_info").find("div", class_="item-content") != None):
        investment["ZK_DESC"] = soup.find("div", id="basic_info").find("div", class_="item-content").text
    Insert(investment)
    


#插入数据库
def Insert(investment):
    global repeatTotal
    #url = "http://localhost:15187/Http/Msg/LeadinServer.ashx?method=investment"
    url = "http://127.0.0.1:3000/Http/Msg/LeadinServer.ashx?method=investment"
    data = {
        "investment": json.dumps(investment)
    }
    req = requests.post(url, data = data)
    result = json.loads(req.text)
    if(result["flag"] == "True"):
        repeatTotal = 0
    else:
        repeatTotal = repeatTotal + 1
    print(result["message"])



#开始爬取
GetList(1)