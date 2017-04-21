# 威胁可视化 1.0
双屏全球与全国实时威胁可视化系统, 组成包括后台实时威胁数据分析引擎与前端可视化引擎
## 部署手册
安装依赖库   
```
$ sudo apt-get install python3-psycopg2 -y
```
解压tv.zip, 假设为/home/ubuntu/tv   
安装与配置Nginx   
```
$ sudo apt-get install nginx -y
$ sudo vi /etc/nginx/sites-enabled/default
```
修改root指向为/home/ubuntu/tv/dist   
启动引擎   
```
$ cd /home/ubuntu/tv
$ nohup python -u threatengine.pyc > threatengine.log &
```
由于数据量较大, 初次启动引擎需要一段时间, 可使用```tail threatengine.log -f```直到输出HTTP Service Started...说明数据引擎已经初始化完毕再执行下一步

## 使用手册
打开游览器, 输入 http://ip/china.html 或 http://ip/world.html 即可访问全国或全球实时威胁展示页面

## 演示地址
国内http://192.168.223.66/china.html   
全球http://192.168.223.66/world.html