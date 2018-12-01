# 如何实现版本回退
### 第一步：git reflog
查找提交记录，前面的内容是commit-id
改成git log可以查看全部的提交信息，更全面


### 第二步：git reset --hard  commit-id
确定需要回退到的版本

### 第三步：完成回退