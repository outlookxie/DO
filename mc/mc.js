/**
 * MC(Module Coding) 模块化编程Core
 *
*/

(function($,win,undefined){

	var doc = win.document, 
		moduleEventPrefix = 'module.',
		moduleEventPrefixReg = /^module.\w*/,
		mcEventType = 'MC.ready';
	
	var SandBox =  function(scope,opt){
		return new SandBox.fn.init(scope,opt);
	};

	SandBox.fn = SandBox.prototype = {
		constructor:SandBox,
		init:function(scope,opt){
			var self = this;
			self.moduleId = opt.moduleId;
			self.module = opt.module;
			self.options = opt.module.options;
			self.node = self.__getNode();
			return self;
		},
		__getEventType:function(eventType){
			var self = this;
			if(!moduleEventPrefixReg.test(eventType)&&eventType!==mcEventType){
				eventType =  moduleEventPrefix+eventType;
			}
			return eventType;
		},
		__getNode:function(){
			var self = this,
				moduleId = self.moduleId,
				nodeConfg = {},
				moduleNode,
				selecter;
				
			selecter = /^#|\./.test(moduleId) ? moduleId : '#' + moduleId;
			moduleNode = $(selecter,doc.body).first();
			if(moduleNode.length){
				nodeConfg=moduleNode.data(self.options.configField);
				MC.set(moduleId)('node',{
					jqEl:moduleNode,
					config:nodeConfg
				});
				return {
					jqEl:moduleNode,
					config:nodeConfg
				}
			}
			return {};
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
				eventType = mcEventType;
			}
	
			if($.type(eventType)==='string'){
				eventType = [eventType];
			}
			$.each(eventType,function(idx,v){
				eventType[idx] = self.__getEventType(v);
			});
			$(doc).bind(eventType.join(' '),function(event,data){
				handle.apply(scope,[event,data]);
			});
		},
		/**
		 * 时间推送
		 * @param  type {String} 事件类型
		 * @param data {Object} 事件数据
		 */
		notify:function(type,data){
			var self = this;
			type = self.__getEventType(type);
			$(doc).trigger(type,data);
		},
		get:function(moduleId){
			return MC.get(moduleId);
		},
		end:0
	};

	SandBox.fn.init.prototype = SandBox.fn;

	var MC = (function(){
	
		var __defaultOptions = {
			configField: 'mod-config',
			root: null,
			childrenAutoInit:true,
			__type:'function'
		};
	
		//无序列保存注册的模块的信息
		var __modules = {};
		//无序列保存延迟加载模块的信息		
		var __lazyModules = {};
			
		//无序列保存模块的数据
		var __modulesData = {};

		var __layoutData = {};

		var __fns = {};
		
		$.extend(__fns,{
			/**
			  *模块实例化函数
			 */
			__fnCreateInstance:function(moduleId,module){
				
				var sandbox = new SandBox(this,{
						moduleId:moduleId,
						module:module
					});
				var instance;
				if(module.options.__type == 'object'){
					instance = module.creator;
				}else{
					instance = module.creator(sandbox);
				}
				instance = 	instance||{};
				// 保证所有模块都有init和destroy方法
				!instance['init'] ? (instance['init'] = $.noop):0;
				!instance['destroy'] ? (instance['destroy'] = $.noop):0;
				
				instance.init(sandbox,module,moduleId);
				
				if($.type(instance.children)=='array' && module.options.childrenAutoInit){
				
					var children = instance.children;
					
					for(var i=0, len = children.length;i<len;i++){
					
						switch($.type(children[i])){
						
							case 'function': children[i](sandbox,module,moduleId);break;
							
							case 'object' : children[i].init&&children[i].init(sandbox,module,moduleId);break;
						}
					}
				}
				return instance;
			},
			/**
			  *触发所有模块初始化完毕事件
			 */
			__fnTriggerAllModuleReadyEvent:function(){
				$(doc).trigger(mcEventType);
			},
			end:0
		})
		
		
		return {
			module:function(moduleId,creator,options){
			
				if($.type(moduleId)!=='string'){
					options = creator;
					creator = moduleId;
					moduleId = 'module'+$.now();
				}
				
				if(__modules[moduleId]||__lazyModules[moduleId]){
					console.log('warn: module ' + moduleId + ' already exist, ignore it.');
				}
				
				
				options = $.extend({}, __defaultOptions, options);
				
				if($.type(creator) === 'object'){
					options.__type = 'object';
				}
				
				var isAutoInit = /^~\w*/.test(moduleId);
				var isLazyInit = /^@\w*/.test(moduleId);
				var targetModules = isLazyInit ? __lazyModules : __modules;
				
				
				if(isAutoInit||isLazyInit){
					moduleId = moduleId.substring(1);
				}
				targetModules[moduleId] = {
					creator:creator,
					instance:null,
					options: options
				};
				isAutoInit&&this.start(moduleId);
			},
			layout:function(layoutConfig,creater,options){
				//to do;
			},
			start:function(moduleId,type){
				var self = this;
			
				if(arguments.length==1&&arguments[0]=='*') {
					self.startAll();
					return;
				};
				var module = __modules[moduleId];
				
				if(!type&&!module){
					module = __modules[moduleId] = __lazyModules[moduleId];
				}
				if(!module){
					console.log(5,'module:'+moduleId+' doesn\'t exit!');
					return;
				}
				try{
					module.instance = __fns.__fnCreateInstance(moduleId,module);	
				}catch(e){
					
				}finally{
					return this;
				}	
			},
			startAll:function(){
				var self = this;
				$(function(){
					console.log('startAll');
					for(var module in __modules){
						
						if(__modules[module]&&!__modules[module].instance){
							
							self.start(module,'all');
						}
					}
					console.log(12,__modules);
					__fns.__fnTriggerAllModuleReadyEvent();
				});
			},
			restart:function(moduleId){
				this.stop(moduleId).start(moduleId);
				this.start(moduleId);
				return this;
			},
			stop:function(moduleId){
				var module = __modules[moduleId];
				if(!module) return false;
				module.destroy();
				module.instance = null;
				return this;
			},
			set:function(moduleId){
				var self = this;
				if(!__modules[moduleId]) return $.noop;
				
				var __moduleData = __modulesData[moduleId]||(__modulesData[moduleId]={});
				
				return function(type,data){
					__moduleData[type] = data;
					return true;
				}
			},
			get:function(moduleId){
				var module = __modules[moduleId];
				if(!module || !module.instance) return $.noop;
				var _moduleData = __modulesData[moduleId];
				return function(type){
					return _moduleData&&_moduleData[type];
				}
			}
		}
	})();
	
	win.MC = $.MC = MC;

})(jQuery,window);
