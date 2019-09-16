# Granblue Integrated Raid Finder

存放已经关停的GBF辅助程序（外挂）Granblue Integrated Raid Finder相关的代码的地方

整个项目的结构如图

![Project Structure](/zh.jpg)

我未授权任何人，任何看到的人可以自行修改发布，不受限制。

项目里部分敏感信息已经进行了脱敏，同时部分配置依赖于特殊的目录结构（没有使用docker部署），所以直接运行跑不起来，请自行修改。

已知问题：
* 调用GBF的API时，所需的参数之一据说是一个全局自增的变量，但是我未作处理，直接传了一个随机数，可能导致被检查代码查到。
* 服务器经常出现假死的情况，dmesg显示为只要进来连接马上返回reset，程序对此无感知，或者无法收到任何twitter的响应导致长时间无更新，至今未解决。
