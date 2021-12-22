/**
 * ttf格式转woff2 
 * run: node ttf2woff2
 * tips: 使用前，请先npm install ttf2woff2,因为ttf2woff2默认未安装
 */
try{
    var path = require('path');
    var fs = require('fs');
    var ttf2woff2 = require('ttf2woff2');
    // 文件读取路径
    var readpath = path.join(__dirname, '../public/fonts/source/');             // 读取路径
    var exportpath = path.join(__dirname, '../public/fonts/result/');           // 导出路径

    fs.readdir(readpath, (err, files)=>{
        if (err) {
            throw err;
        }
        files.forEach((item)=>{
            var before = item.split('.')[0];
            var after = item.split('.')[1];
            if (after === 'ttf') {
                var file = fs.readFileSync(readpath + item);
                var file_name = exportpath + before + '.woff2';
                fs.writeFileSync(file_name, ttf2woff2(file));
            }
        });
    });   
}catch(e){
    console.error("字体转换错误");
}
