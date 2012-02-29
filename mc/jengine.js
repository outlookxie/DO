/**
 * JEngine(Module Coding) Front-End Application Framework
 * @author:terence.wangt chuangui.xiecg
 * @date 2012-01-20
 * @version 1.0
 *
*/

(function($,win,undefined){

	// 定义一些全局变量

	var DOC = win.document, 
		MODULE_EVENT_PREFIX = 'module.',
		MODULE_EVENT_PREFIX_REG = /^module.\w*/,
		JENGINE_READY_EVENT_NAME = 'JEngine.ready',
		MODULE_EVNET_MAP = {
			'scroll':'scroll.lazymodule',
			'resize':'resize.lazymodule'
		},
		AUTO_INIT_REG = /^~/,
		LAZY_INIT_REG = /^@/,
		MODULE_PREFIX_REG = /^#|\./,
		DRAGROON_MONITOR_URL = 'http://checktoken1.alibaba.com/monitor-ex/browser.servlet?method=error',
		PRODUCT_MODE = typeof window.dmtrack ==="undefined" ? true : false,
		DEBUG_MODE = /debug=true/i.test(win.location.search),
		DEBUG_READY = false;
	
	/**
	 * 沙箱
	 * @param {Object} scope 作用域,这里固定值为'JEngine'
	 * @param {Object} module 通过JEngine定义的module
	 */	
	var SandBox =  function(scope,module){
		return new SandBox.fn.init(scope,module);
	};
	
	/**
	 * 获取自定义事件的命名空间，这里做了2层处理：(1)如果传递了moudleId，则采取on模式,需要在自定义事件中跟上自己的memberId,否则采取nitify模式，需要被广播;(2)对于JEngine事件，不做任何处理
	 * @param {String} eventType 事件的type
	 * @param {String} moduleId 模块的ID
	 */
	function getEventNamespace(eventType,moduleId){
		if(!MODULE_EVENT_PREFIX_REG.test(eventType)&&eventType!==JENGINE_READY_EVENT_NAME){
			eventType =  MODULE_EVENT_PREFIX+eventType;
			if(moduleId){
				moduleId = moduleId.replace('#','_').replace('.','__');
				eventType = eventType + '.' + moduleId;
			}else{
				eventType = eventType + '.*';
			}
		}
		return eventType;
	}

	SandBox.fn = SandBox.prototype = {
		constructor:SandBox,
		/**
		 * 沙箱初始化，做基本的赋值操作
		 * @param {Object} scope
		 * @param {Object} module
		 */
		init:function(scope,module){
			var self = this;
			self.__jengine = scope;
			self.module = module;
			self.moduleId = module.moduleId;
			return self;
		},
		/**
		 * 注册监听事件，支持批量事件的监听
		 * @param  eventType {String|Array} 事件类型
		 * @param handle {Function} 事件响应之后的回调函数
		 * @param  scope
		 */
		on:function(eventType,handle,scope){
 			var self = this;
			scope = scope || window;
			
			if($.type(eventType)==='function'){
				scope = handle;
				handle = eventType;
				eventType = JENGINE_READY_EVENT_NAME;
			}
	
			if($.type(eventType)==='string'){
				eventType = [eventType];
			}
			$.each(eventType,function(idx,v){
				eventType[idx] = getEventNamespace(v,self.moduleId);
			});
			$(win).bind(eventType.join(' '),function(event,data){
				handle.apply(scope,[event,data]);
			});
		},
		/**
		 * 事件解绑
		 * @param  eventType {String|Array} 事件类型
		 * @param handle {Function} 事件响应之后的回调函数
		 * @param  scope
		 */
		off:function(eventType){
			if($.type(eventType)==='string'){
				eventType = [eventType];
				$(win).unbind(getEventNamespace(eventType));
			}
			if($.type(eventType)=='array'){
				$.each(eventType,function(idx,v){
					$(win).unbind(getEventNamespace(v));
				})
			}
		},
		/**
		 * 事件推送
		 * @param  type {String} 事件类型
		 * @param data {Object} 事件数据
		 */
		notify:function(type,data){
			var self = this;
			type = getEventNamespace(type);
			$(win).trigger(type,data);
		},
		/**
		 * 获取指定模块的信息
		 * @param  moduleId {String} 模块标识
		 */
		getModuleData:function(moduleId){
			var self = this;
			return self.__jengine.__get(moduleId);
		},
		/**
		 * 获取布局的自定义数据
		 * @param {String} key
		 */
		layout:function(key){
			var self = this;
			return self.__jengine.__getLayoutData(key);
		},
		/**
		 * 获取静态数据，JEngine维护一个简单的数据模型,数据结构是一个简单的json
		 * @param {String} k
		 * @param {Object} v
		 */
		data:function(k,v){
			var self = this;
			return self.__jengine.__data(k,v);
		},
		/**
		 * 获取JEngine所有的数据，便于debug
		 */
		dump:function(){
			var self = this;
			return self.__jengine.__dump();
		},
		/**
		 * log的info模式
		 * @param 参考console.info()
		 */
		info:function(){
			var self = this;
			return self.__log('info',arguments);
		},
		/**
		 * log的error模式
		 * @param 参考console.info()
		 */
		error:function(){
			var self = this;
			return self.__log('error',arguments);
		},
		/**
		 * log模式
		 * @param 参考console.info()
		 */
		log:function(){
			var self = this;
			return self.__log('log',arguments);
		},
		/**
		 * log的debug模式
		 * @param 参考console.info()
		 */
		debug:function(){
			var self = this;
			return self.__log('debug',arguments);
		},
		/**
		 * log私有函数，会去统一调用JEngine的log,实现一个简单的引用
		 * @param {Object} type
		 * @param {Object} msg
		 */
		__log:function(type,msg){
			var self = this;
			return self.__jengine.__log(type,self.moduleId,msg);
		},
		end:0
	};

	SandBox.fn.init.prototype = SandBox.fn;
	
	/**
	 * 
	 */
	var JEngine = (function(){
	
		var __defaultOptions = {
			configField: 'mod-config',
			childrenAutoInit:true,
			__type:'function'
		};
		var __defaultLazyOptions = {
			threshold : 200
		};
	
		//无序列保存注册的模块的信息
		var __modules = {};
		
		//无序列保存延迟加载模块的信息		
		var __lazyModules = {};
		
		//无序列保存注册的模块ID，初始化依赖队列，保证顺序
		var __moduleIds = [];
			
		//无序列保存模块的数据
		var __modulesData = {};
	
		//无序列保存布局的数据
		var __layoutData = {};
		
		//无序列保存静态的数据，维护一个简单的数据模型
		var __staticData = {};
		
		var __exposurePool = [];

		var __fns = {};
		
		var __hasBind = false;
		
		var __docBody = $(win);
		
		var __viewportHeight = 0;
		
		
		$.extend(__fns,{
			/**
			  *模块实例化函数
			  * @param  moduleId {String} 模块ID
			  * @param module {Object} 模块数据模型
			 */
			__createInstance:function(module){
				var self = this,
					moduleId = module.moduleId,
					sandbox,
					instance;
				
				self.__node(module);
				
				sandbox = new SandBox(self,module);
				
				if(module.options.__type == 'object'){
					instance = module.creator;
				}else{
					instance = module.creator(sandbox);
				}
				instance = 	instance||{};
				
				// 保证所有模块都有init和destroy方法
				!instance['init'] ? (instance['init'] = $.noop):0;
				!instance['destroy'] ? (instance['destroy'] = $.noop):0;
				
				instance.init(sandbox,module);
				
				if($.type(instance.children)=='array' && module.options.childrenAutoInit){
				
					var children = instance.children;
					
					for(var i=0, len = children.length;i<len;i++){
					
						switch($.type(children[i])){
						
							case 'function': children[i](sandbox,module);break;
							
							case 'object' : children[i].init&&children[i].init(sandbox,module);break;
						}
					}
				}
				return instance;
			},
			/**
			 * 获取当前模块对应节点上的配置信息,对于当前模块的ID or ClassName不存在页面上，则不做任何处理
			 * @param {Object} module
			 */
			__node:function(module){
				var self = this,
					moduleId = module.moduleId,
					options = module.options,
					nodeConfg = {},
					moduleNode;
					
				moduleNode = $(moduleId,DOC.body).first();
				if(moduleNode.length){
					nodeConfg=moduleNode.data(options.configField);
					self.__set(moduleId)('node',{
						jqEl:moduleNode,
						config:nodeConfg
					});
				}
			},
			/**
			  *触发所有模块初始化完毕事件
			 */
			__triggerAllModuleReadyEvent:function(){
				$(win).trigger(JENGINE_READY_EVENT_NAME);
			},
			/**
			 * 将元素及对应的module到数组中
			 */
			__handleExposureEvent:function(jqEl,module){
				var self = this;
				var item =  [].slice.apply(arguments);
				
				__exposurePool.push(item);
						
				if(!__hasBind){
					__viewportHeight = self.__getViewportHeight();
					self.__bindExposureEvent();
				}
				this.__loadModules();
			},
			/**
			 * 获取视窗大小
			 */
			__getViewportHeight:function(){
				return __docBody.height();
			},
			/**
			 * 绑定曝光事件，元素在页面上曝光时，事件触发
			 */
			__bindExposureEvent:function(){
			
				if(__hasBind){
					return;
				}
				
				var self = this;
				__docBody.bind(MODULE_EVNET_MAP['scroll'], function(e){
					self.__exposureCall(self.__loadModules, self);
				}); 
				__docBody.bind(MODULE_EVNET_MAP['resize'], function(e){
					__viewportHeight = self.__getViewportHeight();
					self.__exposureCall(self._loadModules, self);
				});
				_hasBind = true;
			},
			/**
			 * 加载函数
			 */
			__exposureCall:function(method, context){
				if(!method) return;
				
				method.tId&&clearTimeout(method.tId);
				
				method.tId = setTimeout(function(){
					method.call(context);
				},100);
			},
			/**
			 * 获取满足条件的modules
			 */
			__loadModules:function(){
				var self = this;
				self.__filter(__exposurePool, self.__runCallback, self);
				
				//如果已无模块需要延迟加载，则移除曝光事件
				if(__exposurePool.length===0){
					self.__removeEvent();
				}
			},
			/**
			 * 过滤模块
			 * @param {Array} arr
			 * @param {Function} method
			 * @param {Object} context
			 */
			__filter:function(arr, method, context){
				var item;
				for(var i=0;i<arr.length;) {
					item = arr[i];
					if($.isArray(item) && this.__checkPosition(item)){
						arr.splice(i, 1);
						method.call(context,item);
					}
					else{
						i++;
					}
				}
			},
			/**
			 * 执行回调函数
			 * @param {Array} arr 保存module的一组信息
			 */
			__runCallback:function(arr){
				var moudle = arr[1];
				!moudle.instance&&(moudle.instance = this.__createInstance(moudle));
			},
			/**
			 * 判断元素是否已经到了可以加载的地方
			 * @param {Array} item
			 */
			__checkPosition:function(item){
				var ret = false,
					threshold = item[1].options.threshold,
					currentScrollTop = $(DOC).scrollTop(),
					benchmark = currentScrollTop + __viewportHeight + threshold,
					currentOffsetTop = $(item[0]).offset().top;
				
				if(currentOffsetTop <= benchmark){
					ret = true;
				}
				return ret;
			},
			/**
			 * 移除曝光事件
			 */
			__removeEvent:function(){
				if(!__hasBind){
					return;
				}
				__docBody.unbind(MODULE_EVNET_MAP['scroll']);
				__docBody.unbind(MODULE_EVNET_MAP['resize']);
				__hasBind = false;
			},
			/**
			  *	set模块数据
			  * @param  moduleId {String} 模块ID
			 */
			__set:function(moduleId){
				var self = this;
				moduleId = /^#|\./.test(moduleId) ? moduleId : '#' + moduleId;
				
				if(!__modules[moduleId]) return $.noop;
				
				var __moduleData = __modulesData[moduleId]||(__modulesData[moduleId]={});
				
				return function(type,data){
					__moduleData[type] = data;
					return true;
				}
			},
			/**
			  *	get模块数据
			  * @param  moduleId {String} 模块ID
			 */
			__get:function(moduleId){
				
				 moduleId = /^#|\./.test(moduleId) ? moduleId : '#' + moduleId;
				
				
				var module = __modules[moduleId];
				
				if(!module || !module.instance) return $.noop;
				var moduleData = __modulesData[moduleId];
				
				/**
				*	在获取到指定模块的情况下，指明要获取的数据
				* @param  type {String} 数据类型
				*/
				return function(type){
					return moduleData&&moduleData[type];
				}
			},
			/**
			 * 获取布局的对应信息
			 * @param {String} key
			 */
			__getLayoutData:function(key){
				if(!key){
					return {};
				}
				return __layoutData&&__layoutData[key];
			},
			/**
			 *	简单的数据模型操作
			 * @param  k {String} 模块ID
			 */
			__data:function(k,v){
				if(!v){
					return __staticData[k];
				}
				if($.type(v)==='string') return __staticData[k] = v;
				
				return false;
			},
			/**
			 * 输出所有JEngine的数据
			 */
			__dump:function(){
				var self = this;
				return {
					'lazyModules' : __lazyModules,
					'modules' : __modules,
					'modulesData' : __modulesData,
					'layoutData' : __layoutData,
					'staticData' : __staticData,
					'moduleIds': __moduleIds
				}
			},
			/**
			 * 日志处理
			 * @param {String} type
			 * @param {Object} moduleId
			 * @param {String} msg
			 */
			__log:function(type,moduleId,msg){
				
				var lever = {
					'error':[0,'#FE6947'],
					'wran':[1,'#FFFFC8'],
					'info':[2,'#EBF5FF'],
					'debug':[3,'C0C0C0'],
					'log':[4,'#FFFFFF']
				};
				var msg =['mdouleId:'+moduleId+'>'].concat([].slice.call(msg)).join('');
				
				function getApplationName(){
					
					if(__layoutData&&__layoutData['config']&&__layoutData['config']['applation']){
						return __layoutData['config']['applation'];
					}
					var appNameReg = /[http|https]:\/\/([\w-]*)\./;
					
					var v = win.location.href.match(appNameReg);
					
					if(v&&v.length==2){
						return v[1];
					}
					return 'unknown';
				}
				
				if(PRODUCT_MODE&&!DEBUG_MODE){
					var applation = getApplationName();
					if($.type(lever[type])=='array'&&lever[type][0]<=1){
						var obj = {
							'AppNum':applation,
							'PageId':win.dmtrack_pageid?win.dmtrack_pageid:'',
							'url':encodeURIComponent(win.location.href),
							'ua':navigator.userAgent,
							'errName':'',
							'errFileName':'',
							'errUrl':'',
							'errLineNum':'',
							'errMsg':msg,
							'errStack':'',
							'errOtherData':'',
							'session':'',
							'pageSeed':''
						};
						(new Image()).src = DRAGROON_MONITOR_URL+$.param(obj);
					}
					return;
				}else if(win.console&&win.console.log&&!$.browser.msie){
					
					console[console[type]?type:'log'](msg);
					
				}else if($.browser.msie&&DEBUG_MODE){
					if(!DEBUG_READY){
						$('#JEngine-DEBUG').remove();
						$('<div id="JEngine-DEBUG" style="margin-top:10px;padding:8px;border:dashed 1px;#FF7300;background-color:#fff;color:#000;"></div>').html('<ol></ol>').appendTo($(DOC.body));
						DEBUG_READY = true;
					}
					var msgBox = $('#JEngine-DEBUG ol'),
						color;
						
					if($.type(lever[type])=='array'){
						color = lever[type][1];
					}else{
						color = lever['log'][1];
					}
					$('<li style="background-color:'+ color +';">').text('' + msg.join('')).appendTo(msgBox);
				}
				
			},
			end:0
		})
		
		
		return {
			/**
			  *触发所有模块初始化完毕事件
			  * @param  moduleId {String} 模块ID
			  * @param  creator {Function|Object} 模块需要实例化的功能
			  * @param  options {Object} 模块的配置参数
			 */
			module:function(moduleId,creator,options){
				var self = this;
				if($.type(moduleId)!=='string'){
					options = creator;
					creator = moduleId;
					moduleId = '#module'+$.now();
				}
				
				if(__modules[moduleId]||__lazyModules[moduleId]){
					//console.log('warn: module ' + moduleId + ' already exist, ignore it.');
				}
				
				options = $.extend({}, __defaultOptions, options);
				
				if($.type(creator) === 'object'){
					options.__type = 'object';
				}
				
				var isAutoInit = AUTO_INIT_REG.test(moduleId);
				var isLazyInit = LAZY_INIT_REG.test(moduleId);
				var targetModules = isLazyInit ? __lazyModules : __modules;
				
				
				if(isAutoInit||isLazyInit){
					moduleId = moduleId.substring(1);
				}
				
				if(isLazyInit){
					options = $.extend({}, __defaultLazyOptions, options);
				}
				
				
				moduleId = MODULE_PREFIX_REG.test(moduleId) ? moduleId : '#' + moduleId;
				
				targetModules[moduleId] = {
					creator:creator,
					instance:null,
					options: options,
					moduleId:moduleId
				};
				isAutoInit&&self.start(moduleId);
				
				if(isLazyInit){
					self.lazyStart(moduleId);
				}else{
					__moduleIds.push(moduleId);
				}
			},
			/**
			 * 布局定义
			 * @param {String} datatype
			 * @param {Object|Function} value
			 */
			layout:function(datatype,value){
				
				if($.type(value)=='function'){
					try{
						value = value();
					}catch(e){
						throw 'layout data init error';
					}
					
				}
				if($.type(value)=='object'){
					if(__layoutData[datatype]){
						__layoutData[datatype] = $.extend({},__layoutData[datatype],value);
					}else{
						__layoutData[datatype] = value;
					} 
				}
			},
			/**
			  *	初始化模块
			  * @param  moduleId {String} 模块ID，如果为 '*'，表示所有模块初始化，并且是在onDOMReady时刻
			  * @param  type {String} 初始化标识，目前只有'all'一个值类型
			 */
			start:function(moduleId,type){
				var self = this;
			
				if(arguments.length==1&&arguments[0]=='*') {
					self.startAll();
					return;
				};
				moduleId = MODULE_PREFIX_REG.test(moduleId) ? moduleId : '#' + moduleId;
				var module = __modules[moduleId];
				
				if(!type&&!module){
					module = __modules[moduleId] = __lazyModules[moduleId];
				}
				if(!module){
					//console.log(5,'module:'+moduleId+' doesn\'t exit!');
					return;
				}
				try{
					!module.instance&&(module.instance = __fns.__createInstance(module));	
				}catch(e){
					__fns.__log('error',moduleId,['module init error']);
				}finally{
					return this;
				}	
			},
			/**
			  *	延迟初始化模块
			  * @param  moduleId {String} 模块ID，如果为 '*'，表示所有模块初始化，并且是在onDOMReady时刻
			 */
			lazyStart:function(moduleId){
				if(LAZY_INIT_REG.test(moduleId)){
					moduleId.substring(1);
				}
				selecter = MODULE_PREFIX_REG.test(moduleId) ? moduleId : '#' + moduleId;
				jqEl = $(selecter).first();
				
				var module = __lazyModules[moduleId],
					evt = module.options.event;
				
				if(evt=='exposure'){
					__fns.__handleExposureEvent(jqEl,module);
				}else{
					var handler = function() {
						module.instance = __fns.__createInstance(module);
						jqEl.unbind(evt,handler);						
					};
					jqEl.bind(evt, handler);
				}
			},
			/**
			  *	初始化所有模块
			  * @param  moduleId {String} 模块ID，如果为 '*'，表示所有模块初始化，并且是在onDOMReady时刻
			  * @param  type {String} 初始化标识，目前只有'all'一个值类型
			 */
			startAll:function(){
				var self = this;
				$(function(){
					//console.log('JEngine-->startAll');
					var moduleId;
					
					for(var i=0,len = __moduleIds.length;i<len;i++){
						moduleId = __moduleIds[i];
						if(__modules[moduleId]&&!__modules[moduleId].instance){
							
							self.start(moduleId,'all');
						}
					}
					__fns.__triggerAllModuleReadyEvent();
					return self;
				});
			},
			/**
			  *	模块重新初始化，会销毁以前的实例
			  * @param  moduleId {String} 模块ID
			 */
			restart:function(moduleId){
				var self = this;
				self.stop(moduleId);
				self.start(moduleId);
				return self;
			},
			/**
			  *	销毁模块
			  * @param  moduleId {String} 模块ID
			 */
			stop:function(moduleId){
				var self = this;
				var module = __modules[moduleId];
				if(!module) return false;
				module.destroy();
				module.instance = null;
				return self;
			},
			end:0
		}
	})();
	
	win.JEngine = $.JEngine = JEngine;
	
})(jQuery,window);
