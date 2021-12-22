import axios from "axios";

/**配置**/

//SEARCH_URL1 推荐图
//SEARCH_URL2 搜索图

/**pexels**/
let PEXELS_API_URL = "https://api.pexels.com/";
let PEXELS_API_DIRECTORY = {
	SEARCH_URL1 : PEXELS_API_URL + "v1/curated",
    SEARCH_URL2 : PEXELS_API_URL + "v1/search"
};
let PEXELS_API_KEY = "563492ad6f91700001000001b3a8355e8c314bedb4a7c0b8ba842b6d";

/**unsplash**/
let UNSPLASH_URL = "/third/unsplash/";
// let UNSPLASH_URL = "https://unsplash.com/";
let UNSPLASH_DIRECTORY = {
	SEARCH_URL1 : UNSPLASH_URL + "napi/photos",
	SEARCH_URL2 : UNSPLASH_URL + "napi/search/photos"
}

let UNSPLASH_API_URL = "https://api.unsplash.com/";
let UNSPLASH_API_DIRECTORY = {
	SEARCH_URL1 : UNSPLASH_API_URL + "photos",
	SEARCH_URL2 : UNSPLASH_API_URL + "search/photos"
}
let UNSPLASH_API_KEY = "Client-ID 8634136728abb261153db7c4eb899fd7a643ba5509d89fda488349a4d5f1a463";

/**giphy**/
let GIPHY_API_URL = "https://api.giphy.com/";
let GIPHY_API_DIRECTORY = {
	SEARCH_URL1 : GIPHY_API_URL + "v1/gifs/trending",
    SEARCH_URL2 : GIPHY_API_URL + "v1/gifs/search"
};
let GIPHY_API_KEY = "72fG2y5HTpNUY97Ui5k0QgmFXTR8hwL1";

/**初始化**/
//类型(pexels、unsplash、giphy)
function OutSideMaterialApi(type){
	if(type !== 'pexels' && type !== 'unsplash' && type !== 'giphy'){
		return;
	}
	let self = this;
	self.type = type;
	if(self.type === 'pexels'){
		self.directory = PEXELS_API_DIRECTORY;
		self.headers = {'Authorization': PEXELS_API_KEY};
		self.params = {};
	}else if(self.type === 'unsplash'){
		/*self.directory = UNSPLASH_DIRECTORY;
		self.headers = {};
		self.params = {};*/
		self.directory = UNSPLASH_API_DIRECTORY;
		self.headers = {'Authorization': UNSPLASH_API_KEY};
		self.params = {};
	}else if(self.type === 'giphy'){
		self.directory = GIPHY_API_DIRECTORY;
		self.headers = {};
		self.params = {api_key:GIPHY_API_KEY};
	}
}

/**首页(推荐图)**/
//一页数据量(unsplash最大30,pexels最大80),页码,成功回调,失败回调,是否直接返回原数据
OutSideMaterialApi.prototype.index = function(perPage, page, success_callback, error_callback, original){
	let self = this;
	let url = getUrl(self, self.directory.SEARCH_URL1, '', perPage, page);
	return request(self, url, success_callback, error_callback, original);
}

/**搜索**/
//查询关键字,一页数据量(unsplash最大30,pexels最大80),页码,成功回调,失败回调
OutSideMaterialApi.prototype.search = function(query, perPage, page, success_callback, error_callback, original){
	let self = this;
	if(query === ''){
		//如果query为空则查询推荐图
		let url = getUrl(self, self.directory.SEARCH_URL1, query, perPage, page);
		return request_service(self, url, success_callback, error_callback, original, query, perPage, page);
	}else{
		return translateRequest(query,function(data){
			query = data;
			let url = getUrl(self, self.directory.SEARCH_URL2, query, perPage, page);
			return request_service(self, url, success_callback, error_callback, original, query, perPage, page);
		});
	}
}

/**获取请求url**/
//当前实例,请求地址,查询参数,一页数量,页码
function getUrl(self, url, query, perPage, page) {
	query = query ? (query ? encodeURIComponent(query) : "") : "";
	perPage = ((perPage && !isNaN(perPage)) ? perPage : 10);
	page = ((page && !isNaN(page)) ? page : 1);
	if(self.type === 'pexels' || self.type === 'unsplash'){
		return `${url}?query=${query}&perPage=${perPage}&page=${page}`;
	}else if(self.type === 'giphy'){
		page = ((page - 1) * perPage);
		return `${url}?q=${query}&limit=${perPage}&offset=${page}`;
	}else{
	}
}

/**处理数据**/
//类型,数据
function handleData(type, data){
	let newData = {};
	let results = [];
	if(type === 'pexels'){
		results = handlePexelsData(data);
	}else if(type === 'unsplash'){
		results = handleUnsplashData(data);
	}else if(type === 'giphy'){
		results = handleGiphyData(data);
	}
	newData.results = results;
	return newData;
}

function handlePexelsData(data){
	//获取标题
	let getTitle = function(str){
		let title = str.split('/')[str.split('/').length-2];
		title.substring(0, title.lastIndexOf('-')).replace(new RegExp('-','g'), ' ');
		return title;
	}
	let results = [];
	if(data.status === 200){
		data = data.data;
		$.each(data.photos, function(i, item){
			let result = {};
			result.id = item.id;
			result.title = getTitle(item.url);
			result.imageWidth = item.width;
			result.imageHeight = item.height;
			result.from = item.photographer;
			result.image = getImageProxy(item.src.large, 'pexels');
			result.images = {
				original : getImageProxy(item.src.original, 'pexels'),
				large : getImageProxy(item.src.large, 'pexels'),
				small : getImageProxy(item.src.small, 'pexels'),
				tiny : getImageProxy(item.src.tiny, 'pexels')
			}
			result.tags = [];
			results.push(result);
		});
	}
	return results;
}

function handleUnsplashData(data){
	let results = [];
	if(data.status === 200){
		data = data.data;
		if(typeof(data.results) !== 'undefined'){
			data = data.results;
		}
		$.each(data,function(i, item){
			let result = {};
			result.id = item.id;
			result.title = item.alt_description;
			result.imageWidth = item.width;
			result.imageHeight = item.height;
			result.from = item.user.name;
			result.image = getImageProxy(item.urls.small, 'unsplash');
			result.images = {
				original : getImageProxy(item.urls.full.substring(0,item.urls.full.indexOf("?")), 'unsplash'),
				large : getImageProxy(item.urls.regular, 'unsplash'),
				small : getImageProxy(item.urls.small, 'unsplash'),
				tiny : getImageProxy(item.urls.thumb, 'unsplash')
			}
			let tags = [];
			$.each(item.tags,function(j, jtem){
				tags.push(jtem.title);
			});
			result.tags = tags;
			results.push(result);
		});
	}
	return results;
}

function handleGiphyData(data){
	let results = [];
	if(data.status === 200){
		data = data.data.data;
		$.each(data,function(i, item){
			let result = {};
			result.id = item.id;
			result.title = item.title;
			result.imageWidth = item.images.original_still.width;
			result.imageHeight = item.images.original_still.height;
			result.from = item.user ? item.user.display_name : 'visitor';
			result.image = getImageProxy(item.images.downsized.url || item.images.original.url, 'giphy');
			result.gif_img = result.image;
			result.images = {
				original : getImageProxy(item.images.downsized.url || item.images.original.url, 'giphy'),
				large : getImageProxy(item.images.downsized.url || item.images.original.url, 'giphy'),
				small : getImageProxy(item.images.downsized.url || item.images.original.url, 'giphy'),
				tiny : getImageProxy(item.images.downsized.url || item.images.original.url, 'giphy')
			}
			result.tags = [];
			results.push(result);
		});
	}
	return results;
}

//获取代理图片
function getImageProxy(url,type){
	return url;
	/*let newUrl = url.replace(/^http(s)?:\/\/(.*?)\//, location.protocol + '//' + location.host + '/third/' + type + '/image_proxy/');
	if(type === 'giphy' && url){
		let reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/);
		let result = url.match(reg);
		if(newUrl.indexOf('?') === -1){
			newUrl += '?'
		}
		newUrl += `&domain=${result[2]}&protocol=${result[1]}`;
	}
	return newUrl;*/
}

//翻译(有道)
let translate_cache = {};//翻译缓存
function translateRequest(word,callback){
	if($validate){
		//英文不翻译
		if(!$validate(word).chinese()){
			return callback(word);
		}
		//已翻译的不翻译
		if(translate_cache[word]){
			word = translate_cache[word];
			return callback(word);
		} 
	}
	const CancelToken = axios.CancelToken;
	let cancel_axios;
	axios({
        url : "/third/youdao/translate?&doctype=json&type=ZH_CN2EN&i=" + word,
        method : 'GET',
        cancelToken:new CancelToken(function executor(c){
            cancel_axios = c;
        })
    }).then(function(data){
    	if(data.data.errorCode === 0){
    		let newWord = data.data.translateResult[0][0].tgt;
    		if(typeof(newWord) !== 'undefined'){
    			translate_cache[word] = newWord;
    			word = newWord;
    		}
    	}
    	if(typeof(callback) === 'function'){
        	callback(word);
        }
    }).catch(function(e){
    	console.log(e);
    	if(axios.isCancel(e)){
            return;
        }
        if(typeof(callback) === 'function'){
        	callback(word);
        }
    });
    return cancel_axios;
}

//请求
//中断请求
let request_cancel_axios = function(){}

/**unsplash站外元素请求**/
//当前实例，请求地址，成功回调，失败回调，查询参数，一页数量，页码
function request_service(self, url, success_callback, error_callback, original, query, perPage, page){
	let new_error;
	if(self.type === 'unsplash') {
		new_error = function(e) {
			// 当连接请求限制时更换请求地址，并重新请求
			if (e.response.status == 403) {
				self.headers = '';
				self.directory = UNSPLASH_DIRECTORY;
				url = getUrl(self, self.directory.SEARCH_URL1, query, perPage, page);
				return request(self, url, success_callback, new_error, original);
			}
			error_callback(e);
		}
	} else {
		new_error = error_callback;
	}
	return request(self, url, success_callback, new_error, original);
}
function request(self, url, success_callback, error_callback, original){
	request_cancel_axios();
	request_cancel_axios = function(){};
	const CancelToken = axios.CancelToken;
	if(url.indexOf("?") === -1){
		url += '?';
	}
	url += ('&t='+new Date().getTime());
	axios({
        url : url,
        method : 'GET',
        headers : self.headers,
        cancelToken:new CancelToken(function executor(c){
        	request_cancel_axios = c;
        }),
        params: self.params
    }).then(function(data){
    	if(typeof(success_callback) === 'function'){
    		if(!original){
    			data = handleData(self.type, data);
    		}
    		success_callback(data);
    	}
    }).catch(function(e){
        if(axios.isCancel(e)){
            return;
		}

		console.error(e);

    	if(typeof(error_callback) === 'function'){
    		error_callback(e);
    	}
    });
    return request_cancel_axios;
};

export default OutSideMaterialApi;