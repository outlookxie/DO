/**
 * @author terence.wangt
 * @version 2012-01-19
 */
/*merge start*/
(function(){
	loadUriList = '';
	ImportJavscript = {
		url:function(url){
			loadUriList +=( '\"'+url+'\" ,');
		}
	}
})();
/*merge end*/

ImportJavscript.url("http://style.china.alibaba.com/js/lib/fdev-v4/core/fdev-min.js");
ImportJavscript.url("http://style.china.alibaba.com/js/app/search/v4.0/core/core.logger.js");
ImportJavscript.url("http://style.china.alibaba.com/js/app/search/v4.0/core/core.sandbox.js");
ImportJavscript.url("http://style.china.alibaba.com/js/app/search/v4.0/core/core.lazymodule.js");
ImportJavscript.url("http://style.china.alibaba.com/js/app/search/v4.0/core/core.application.js");