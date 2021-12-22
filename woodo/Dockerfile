#基于nodejs 10.13构建
FROM registry.cn-shenzhen.aliyuncs.com/woodo_base/nodejs:10.13.0
MAINTAINER woodo huangcanhui <huangcanhui@woodo.cn>
#时间同步
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
#全局设置
RUN npm config set registry http://registry.npm.taobao.org && npm config get registry
RUN npm install pm2 -g
#更新代码 
RUN mkdir /home/www && \
	mkdir /home/www/woodo_nodejs
ADD woodo_nodejs.tar.gz /home/www/woodo_nodejs
#代码构建
RUN cd /home/www/woodo_nodejs && npm install  --unsafe-perm && npm run build
RUN rm -rf /home/www/woodo_nodejs/src/
WORKDIR /home/www/woodo_nodejs
EXPOSE 9191
CMD ["npm", "start"]