/**
 * @author terence.wangt
 * @version 2012-02-14
 */
/*merge start*/
(function(){
	//����Ĵ��뷢��ʱ�ᱻɾ�������ϲ���ִ�У�������debugģʽ
	ImportJavscript = {
		url:function(url){
			loadUriList +=( '\"'+url+'\" ,');
		}
	}
	setTimeout(function(){
		loadUriList = loadUriList.substring(0, loadUriList.length-1);
		eval("jEngine.Core.Loader.js("+ loadUriList +")");
	}, 100);
})();
/*merge end*/




ImportJavscript.url("http://style.china.alibaba.com/js/app/search/v4.0/module/base/searchweb.js");
ImportJavscript.url("http://style.china.alibaba.com/js/app/search/v4.0/module/base/utility.js");



ImportJavscript.url("http://style.china.alibaba.com/js/app/search/v4.0/module/business/selloffer/appstart.shopwindow.js");