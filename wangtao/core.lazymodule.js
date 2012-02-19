/**
 * 数据模块懒加载类：应用中有一些功能模块并不是在页面初始化的时候就加载的，
 * 它们是在页面节点曝光时或是触发了某些页面事件时才需要被加载。该类完成的就是
 * 对此类模块延迟加载功能的实现，便于使用并提升站点性能。
 * @author terence.wangt
 * date:2012.01.30
 */
!(function($){
	
	var configs = {
		threshold:200,
		end:0
	};
	
	var _hasBind		= false;
	var _docBody 		= $(window);
	var _viewportHeight = 0;
	var _exposurePool   = [];
	
	function LazyModule() {

		return LazyModule;
	}
	
	//单实例类
	$.extend(LazyModule,{
	
			/**
			 * @param  els 触发延迟加载模块的元素，可以是id、dom、domArray(jquery dom数组对象) {string|object|array}
			 * @param: event 延迟加载的驱动事件，可以是曝光事件或其它普通事件。{exposure|normal events like: click, mouseover, focus, mouseenter}
			 * @param: cfg (optional)配置延迟加载的参数，例如对应的threshold等{Object}
			 * @param: callback (optional)延迟加载成功后的回调函数{Object}
			*/
			register:function(els, event, cfg, callback){

				var configs = $.extend(true, {}, configs, cfg);
				
				var doms;
				if($.isArray(els)){
					doms = els;
				}else{
					doms = $(els);
				}
				if(!doms || !event){
					return;
				}
				
				var self = this;
				if(event === "exposure"){				
					this._handleExposureEvent(doms, configs, callback);
				}else{
					
					var handle = function() {
						self._getModule(doms, configs, callback);
						doms.unbind(event, handle);
					};
					doms.bind(event, handle);
				}
			 },
			
			/**
			 * 处理曝光延迟加载的模块
			 */
			_handleExposureEvent:function(doms, cfg, callback){
			
				var els = this._pushToArray(doms, cfg, callback);
				this._uniqueMerge(_exposurePool,els);
								
				if(!_hasBind){
					_viewportHeight = this._getViewportHeight();
					this._bindExposureEvent();
				}
				this._loadModules();
			},
			
			/**
			 * 将元素及对应的callback和config先push到数组中
			 */
			_pushToArray:function(els, cfg, fn){
				var arr = [];
				
				if(!els.length){
					return arr;
				}
				for(var i=0;i<els.length;i++){
					arr.push([els[i], cfg, fn]);
				}
				return arr;
			},
			
			/**
			 * 合并数组，去除重复项。
			 */
			_uniqueMerge:function(des,a){
				for(var i=0;i<a.length;i++){
					for(var j=0,len=des.length;j<len;j++){
						if(a[i] === des[j]){
							a.splice(i,1);
							break;
						}
					}
				}
				$.merge(des,a);
			},
			

			/**
			 * 绑定曝光事件，元素在页面上曝光时，事件触发
			 */
			_bindExposureEvent:function(){
				if(_hasBind){
					return;
				}
				
				var self = this;
				_docBody.bind('scroll.lazymodule', function(e){
					self._exposureCall(self._loadModules, self);
				}); 
				_docBody.bind('resize.lazymodule', function(e){
					_viewportHeight = self._getViewportHeight();
					self._exposureCall(self._loadModules, self);
				});
				_hasBind = true;
			},
			
			/**
			 * 移除曝光事件
			 */
			_removeEvent:function(){
				if(!_hasBind){
					return;
				}
				_docBody.unbind('scroll.lazymodule');
				_docBody.unbind('resize.lazymodule');
				_hasBind = false;
			},
						
			/**
			 * 加载函数
			 */
			_exposureCall:function(method, context){
				clearTimeout(method.tId);
				method.tId = setTimeout(function(){
					method.call(context);
				},100);
			},
			
			/**
			 * 加载曝光模块
			 */
			_loadModules:function(){
			
				this._filter(_exposurePool, this._runCallback, this);
				//如果已无模块需要延迟加载，则移除曝光事件
				if(_exposurePool.length===0){
					this._removeEvent();
				}
			},
		
			 /**
			 * 遍历资源数组，满足加载条件的曝光模块执行加载，并从数组中移除
			 */
			_filter:function(array, method, context){
				var item;
				for(var i=0;i<array.length;) {
					item = array[i];
					if($.isArray(item) && this._checkPosition(item)){
						array.splice(i, 1);
						method.call(context,item);
						
						//防止同一模块被重复加载
						if(item[1].module){
							var moduleId = item[1].module.moduleId;
							for(var j=0; j<array.length;){
								
								var ele = array[j];
								if(ele[1].module && moduleId === ele[1].module.moduleId ){
									array.splice(j, 1);
								}
								else{
									j++;
								}
							}
						}
					}
					else{
						i++;
					}
				}
			},
			/*
			 * 执行回调函数
			 */
			_runCallback:function(arr){
				var el,fn,cfg;
			
				el 	= arr[0];
				cfg = arr[1];
				fn 	= arr[2];
				
				this._getModule(el, cfg, fn);
			},
			
			_getModule:function(el, cfg, fn){
			
				var module = cfg.module;
				
				if(module){
					var moduleId = module.moduleId;
					$.add(moduleId, {
							js: module.js,
							css: module.css
					});
					if(fn){
						$.use(moduleId, function(){fn(el)});
					}else{
						$.use(moduleId);
					}
				}else{
					if(fn){
						fn(el);
					}
				}
			},
			
			/**
			 * 获取当前视窗高度
			 */
			_getViewportHeight:function(){
				return _docBody.height();
			},
			
			/**
			 * 判断元素是否已经到了可以加载的地方
			 */
			_checkPosition: function(el){
				var ret = false;
				var threshold = el[1].threshold;
				var currentScrollTop = $(document).scrollTop();
				var benchmark = currentScrollTop + _viewportHeight + threshold;
				var currentOffsetTop = $(el).offset().top;
				
				if(currentOffsetTop <= benchmark){
					ret = true;
				}
				return ret;
			},
			end:0
	});
	
	ScaleLazyApp.Core.LazyModule = LazyModule;
	
})(jQuery);