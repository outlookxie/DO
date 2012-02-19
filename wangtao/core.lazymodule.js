/**
 * ����ģ���������ࣺӦ������һЩ����ģ�鲢������ҳ���ʼ����ʱ��ͼ��صģ�
 * ��������ҳ��ڵ��ع�ʱ���Ǵ�����ĳЩҳ���¼�ʱ����Ҫ�����ء�������ɵľ���
 * �Դ���ģ���ӳټ��ع��ܵ�ʵ�֣�����ʹ�ò�����վ�����ܡ�
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
	
	//��ʵ����
	$.extend(LazyModule,{
	
			/**
			 * @param  els �����ӳټ���ģ���Ԫ�أ�������id��dom��domArray(jquery dom�������) {string|object|array}
			 * @param: event �ӳټ��ص������¼����������ع��¼���������ͨ�¼���{exposure|normal events like: click, mouseover, focus, mouseenter}
			 * @param: cfg (optional)�����ӳټ��صĲ����������Ӧ��threshold��{Object}
			 * @param: callback (optional)�ӳټ��سɹ���Ļص�����{Object}
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
			 * �����ع��ӳټ��ص�ģ��
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
			 * ��Ԫ�ؼ���Ӧ��callback��config��push��������
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
			 * �ϲ����飬ȥ���ظ��
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
			 * ���ع��¼���Ԫ����ҳ�����ع�ʱ���¼�����
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
			 * �Ƴ��ع��¼�
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
			 * ���غ���
			 */
			_exposureCall:function(method, context){
				clearTimeout(method.tId);
				method.tId = setTimeout(function(){
					method.call(context);
				},100);
			},
			
			/**
			 * �����ع�ģ��
			 */
			_loadModules:function(){
			
				this._filter(_exposurePool, this._runCallback, this);
				//�������ģ����Ҫ�ӳټ��أ����Ƴ��ع��¼�
				if(_exposurePool.length===0){
					this._removeEvent();
				}
			},
		
			 /**
			 * ������Դ���飬��������������ع�ģ��ִ�м��أ������������Ƴ�
			 */
			_filter:function(array, method, context){
				var item;
				for(var i=0;i<array.length;) {
					item = array[i];
					if($.isArray(item) && this._checkPosition(item)){
						array.splice(i, 1);
						method.call(context,item);
						
						//��ֹͬһģ�鱻�ظ�����
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
			 * ִ�лص�����
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
			 * ��ȡ��ǰ�Ӵ��߶�
			 */
			_getViewportHeight:function(){
				return _docBody.height();
			},
			
			/**
			 * �ж�Ԫ���Ƿ��Ѿ����˿��Լ��صĵط�
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