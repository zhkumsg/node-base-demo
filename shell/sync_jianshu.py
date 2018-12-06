# -*- coding: UTF-8 -*-

import requests
from bs4 import BeautifulSoup

# 简书用户
userurl = "https://www.jianshu.com/u/819ce4ffa08c"
navid = "reptilejianshu"
headers = {
    "Referer": userurl,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36"
}

# 获取文章列表


def getList(pageno):
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
            "ZK_ID": "jianshu_" + item["data-note-id"],
            "ZK_AUTHOR": "",
            "ZK_COVERIMG": img,
            "ZK_NAVID": navid,
            "ZK_PUBDATE": "",
            "ZK_TITLE": item.find("a", class_="title").text,
            "ZK_DESC": "",
        }
        href = "https://www.jianshu.com" + \
            item.find("a", class_="title")["href"]
        getDetail(obj, href)
    if(total > 0):
        getList(pageno + 1)


# 获取文章详情
def getDetail(obj, href):
    r = requests.get(href, headers=headers)
    soup = BeautifulSoup(r.text, "html.parser")
    article = soup.find("div", class_="article")
    obj["ZK_AUTHOR"] = article.find("div", class_="author").find(
        "span", class_="name").text
    obj["ZK_PUBDATE"] = article.find("div", class_="author").find(
        "span", class_="publish-time").text.split(" ")[0]
    obj["ZK_DESC"] = str(article.find("div", class_="show-content-free"))
    leadingin(obj)


# 导入文章
def leadingin(article):
    print(article["ZK_TITLE"])
    r = requests.post(
        "http://localhost:3000/api/leadingin/information", article)
    print(r.status_code)


getList(1)
