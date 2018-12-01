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


#递归获取机构列表
#机构数据结构：
#|---机构标题
#|---机构logo
#|---机构详情
#|---案例摘要
#+---案例详情
#   |---案例标题
#   |---投资金额
#   |---所属行业
#   |---所属轮次
#   |---投资时间
#+---团队伙伴
#   |---姓名
#   |---头像
#   |---职位
def GetList(pageno):
    PrintTitle("正在爬取第" + str(pageno) + "页")
    req = requests.get("https://www.vc.cn/institutions?page="+ str(pageno), headers = header)
    req.encoding = "UTF-8"
    soup = BeautifulSoup(req.text, "html.parser")
    trs = soup.find("tbody", id="institution-list").find_all("tr")
    if len(trs) > 0:
        for tr in trs:
            logo = ""
            if(tr.find("img") != None):
                logo = tr.find("img")["data-echo"].split("?")[0]
            company = {
                "ZK_FOREIGNKEY": tr.find("div", class_="name").a["href"].split("/")[-1],
                "_href": "https://www.vc.cn" + tr.find("div", class_="name").a["href"],
                "ZK_TITLE": tr.find("div", class_="name").a.text,
                "ZK_LOGO": logo,
                "ZK_DESC": tr.find("div", class_="pstn").text
            }
            GetDetail(company)
        time.sleep(random.uniform(3, 5))
        if(repeatTotal > 30):
            print("重复次数过多，停止获取下一页")
        else:
            GetList(pageno + 1)
    else:
        PrintTitle("全部获取完成")


#获取机构详情
def GetDetail(company):
    time.sleep(random.uniform(0.1, 1))
    print("|---" + company["ZK_TITLE"])
    req = requests.get(company["_href"], headers = header)
    req.encoding = "UTF-8"
    if(req.status_code != 200):
        print("该机构已下线或不存在，跳过搜索")
        return False
    soup = BeautifulSoup(req.text, "html.parser")
    if(soup.find("div", id="module_intro").find("div", class_="cont") != None):
        company["ZK_DESC"] = soup.find("div", id="module_intro").find("div", class_="cont").text
    cases = []
    teams = []
    if(soup.find("div", id="working-member-list") != None):
        partners = soup.find("div", id="working-member-list").find_all("div", class_="member-item")
        for partner in partners:
            avatar = ""
            position = ""
            if(partner.find("div", class_="avatar").find("img") != None):
                avatar = partner.find("div", class_="avatar").find("img")["src"]
            if(partner.find("div", class_="name").find("span") != None):
                position = partner.find("div", class_="name").find("span").text
            teams.append({
                "ZK_NAME": partner.find("div", class_="name").find("a").text,
                "ZK_AVATAR": avatar,
                "ZK_POSITION": position
            })
    if(soup.find("div", id="invest_cases") != None):
        trs = soup.find("div", id="invest_cases").find_all("div", class_="case_card")
        for tr in trs:
            cases.append({
                "ZK_TITLE": tr.find("div", class_="name").a.text,
                "ZK_MONEY": tr.find("div", class_="money").text,
                "ZK_INDUSTRY": tr.find("div", class_="name").span.text,
                "ZK_ROUNDS": tr.find("div", class_="round").text,
                "ZK_TIME": tr.find("div", class_="cell date").text
            })
    Insert(company, cases, teams)

#插入数据库
def Insert(company, cases, partners):
    global repeatTotal
    #url = "http://localhost:15187/Http/Msg/LeadinServer.ashx?method=investor"
    url = "http://127.0.0.1:3000/Http/Msg/LeadinServer.ashx?method=investor"
    data = {
        "company": json.dumps(company), 
        "cases": json.dumps(cases), 
        "partners": json.dumps(partners)
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