const conf_env = process.env.CONF_ENV;
const login_url = [
    '^/member/?',
    '^/notification/?',
    '^/mobile/member/?',
    '^/mobile/home/?',
    '^/mobile/notification/?',
]

const conf = {}
//开发环境
conf["dev"] ={
    login_url : login_url,
    wsHost : '',
    wsUsername : 'woodo',
    wsTokenSecret : '2G0pFI9S3y7Uaf0q',
    wsTokenExpiresIn : 360,
}
//测试环境
conf["test"] = {
    login_url : login_url,
    wsHost : '',
    wsUsername : 'woodo',
    wsTokenSecret : '2G0pFI9S3y7Uaf0q',
    wsTokenExpiresIn : 360,
}
//测试环境
conf["ptest"] = {
    login_url : login_url,
    wsHost : '',
    wsUsername : 'woodo',
    wsTokenSecret : '2G0pFI9S3y7Uaf0q',
    wsTokenExpiresIn : 360,
}
//测试环境
conf["onlinetest"] = {
    login_url : login_url,
    wsHost : '',
    wsUsername : 'woodo',
    wsTokenSecret : 'B97FTFEE7tvwNV0g',
    wsTokenExpiresIn : 360,
}
conf["grayproduct"] = {
    login_url : login_url,
    wsHost : '',
    wsUsername : 'woodo',
    wsTokenSecret : '71rXO0y9w7DWzMoO',
    wsTokenExpiresIn : 360,
}
//线上环境
conf["production"] = {
    login_url : login_url,
    wsHost : '',
    wsUsername : 'woodo',
    wsTokenSecret : '71rXO0y9w7DWzMoO',
    wsTokenExpiresIn : 360,
}

module.exports = conf[conf_env] || conf["dev"]