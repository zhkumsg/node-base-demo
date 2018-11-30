import requests
from bs4 import BeautifulSoup

# 简书用户
userurl = "https://www.jianshu.com/u/819ce4ffa08c"
headers = {
    "Referer": userurl,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36"
}

# 获取文章列表


def getList(pageno):
    print("\n----------获取第" + str(pageno) + "页数据----------\n")
    r = requests.get(userurl+"?order_by=shared_at&page=" +
                     str(pageno), headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")
    total = 0
    ul = soup.find("div", id="list-container").find_all("li")
    for item in ul:
        if("data-note-id" not in item.attrs):
            continue
        total = total + 1
        img = ""
        if("have-img" in item["class"]):
            img = item.find(
                "a", class_="wrap-img").find("img")["src"].split("?")[0]
            img = "https:" + img
        obj = {
            "id": item["data-note-id"],
            "img": img,
            "title": item.find("a", class_="title").text,
            "href": "https://www.jianshu.com" + item.find("a", class_="title")["href"]
        }
        getDetail(obj)
    # if(total > 0):
    #     getList(pageno + 1)


# 获取文章详情
def getDetail(obj):
    r = requests.get(obj["href"], headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")
    article = soup.find("div", class_="article")
    obj["desc"] = str(article.find("div", class_="show-content-free"))
    print(obj["desc"])
    leadingin(obj)


# 导入文章
def leadingin(article):
    pass


getList(1)
