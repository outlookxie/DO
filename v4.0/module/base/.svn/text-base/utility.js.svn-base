/**
 * @overview:搜索名字空间
 *
 * @author: hpapple.hep
 * @date: 2012-02-01
*/
!(function($) {
 
 	$.extend(Searchweb.Utility,{
				
		/**
		 * 搜索打点
		 * @method aliclick
		 * @param {HTMLElement} u
		 * @param {String} param 打点参数,注:带?
		 */
		aliclick:function(u, param){
			if(typeof window.dmtrack!="undefined"){
				setTimeout(function(){dmtrack.clickstat("http://stat.china.alibaba.com/search/queryreport.html",param);}, 10);
			}else{
			    if (document.images)
			        (new Image()).src = "http://stat.china.alibaba.com/search/queryreport.html" + param + "&time=" + (+new Date);
			}
		    return true;
		},
		/**
		 * p4p扣费函数
		 * @param {String} url
		 * @param {Boolean} type 注:如果是阿里旺旺,则在非IE下不扣费
		 */
		p4pClick:function(url, type) {
		    var d = new Date;
		    if (document.images &&(!arguments[1] || arguments[1] && $.browser.msie)){
		        (new Image).src = url + "&j=1&time=" + d.getTime();
		    }
		    return true;
		},
		/**
		 * 搜索打点
		 * @method statAdClick
		 * @param {HTMLElement} u
		 * @param {String} param 打点参数,注:带?
		 */
		statAdClick:function(u, param){
			if(typeof window.dmtrack!="undefined"){
				dmtrack.clickstat("http://stat.china.alibaba.com/ad.html",param);
			}else{
			    if (document.images)
			        (new Image()).src = "http://stat.china.alibaba.com/ad.html" + param + "&time=" + (+new Date);
			}
		    return true;
		},
		/*曝光打点*/
		 exposureClick:function(sectionexp){
			if(typeof window.dmtrack!="undefined"){
				setTimeout(function(){dmtrack.clickstat("http://stat.china.alibaba.com/sectionexp.html",('?sectionexp='+sectionexp));}, 100);
			}else{
				if (document.images){
									(new Image).src="http://stat.china.alibaba.com/sectionexp.html?sectionexp="+sectionexp+"&time="+(+new Date);
				}
			}
		},
	
		/**
		 * 打点
		 * @param {Object} o
		 */
		traceEnquiryClick:function(o){
			var fromId = '',params = [];
			fromId = this.getCookie('__last_loginid__');
			if(fromId!=''){
				params.push('?fromId='+fromId);
				params.push('toId='+(o.toId||''));
				params.push('offerId='+(o.offerId||''));
				params.push('source='+(o.source||1));
				params.push('cna='+(this.getCookie('cna')||''));
				var offerUrl = '';
				if(o.offerId&&o.offerId!=''){
					offerUrl = 'http://detail.china.alibaba.com/buyer/offerdetail/'+o.offerId+'.html';
				}
				params.push('sourceUrl='+offerUrl);
				if(typeof window.dmtrack!="undefined"){
					dmtrack.clickstat("http://interface.xp.china.alibaba.com/eq/enquiry/traceEnquiry.json",params.join('&'));
				}else{
					d = new Date();
				    if(document.images) {
				        (new Image()).src="http://interface.xp.china.alibaba.com/eq/enquiry/traceEnquiry.json" + params.join('&') + "&time=" + d.getTime();
				    }
				}
			    return true;
			}
		},

		/**
		 * 获取cookie
		 * @method getCookie
		 * @public
		 * @param {String} name cookie键名称
		 */		
		getCookie:function(name) {
			var value = document.cookie.match('(?:^|;)\\s*'+name+'=([^;]*)');
			return value ? unescape(value[1]): '';
		},
		/**
		 * 添加cookie
		 * @method addCookie
		 * @puiblic
		 * @param {String} name cookie的名称
		 * @param {String} v cookie的value
		 * @param {String} domainName
		 */
		addCookie:function(name,v,domainName){
		    var expDate = new Date;
		    expDate.setYear(expDate.getFullYear() + 1);
		    document.cookie = name + ("=" + escape(v) + ";expires=" + expDate.toGMTString() + ";path=/;" + "domain=" + domainName);
		},
		/**
		 * 获取前端指定cookie的名字(alicnweb)的值
		 * eg:
		 * alicnweb=firstv=1|a=2
		 * @method getFDCookie
		 * @param {String} name 
		 */
		getFDCookie:function(name){
			var alicnweb  = this.getCookie("alicnweb");
			var reg = new RegExp("(^|)"+ name +"=([^|]*)", "i");
			if(reg.test(alicnweb)) {
				return unescape(RegExp.$2.replace(/\+/g, " "));
			}
			return "";
		},
		/**
		 * 设置前端指定cookie的名字(alicnweb)的值
		 * @param {String} name 
		 * @param {String|int|Boolean} v 
		 */
		setFDCookie:function(name,v){
			var alicnweb = this.getCookie('alicnweb');
			if(alicnweb.indexOf(name)==-1){
				alicnweb+=(name+'='+v+'|');
				this.addCookie('alicnweb',alicnweb,'.china.alibaba.com');
			}
		},
			
		/**
		 * 获取pageId
		 * @method getSearchPageId
		 */
		getSearchPageId:function(){
			return typeof window.dmtrack_pageid=='undefined' ? -1 : dmtrack_pageid;
		},
		
		/**
		 * 统一的异步JSONP请求函数
		 * @method getJsonp
		 */
		getRPCJsonp:function(url,o){
			$.ajax(url, {
				data: o.data,
				dataType: 'jsonp',
				success: function(data){
					if(data.hasError){
						return ;
					}else{
						o.success(data.content);
					}
				}
			});	
		},
		
		renderHTML:function(template,data,node){
			
			$.use('web-sweet', function(){
				var html = FE.util.sweet(template).applyData(data);
				node.html(html);
			});	

		},
		end:0
	});
	
 })(jQuery);	