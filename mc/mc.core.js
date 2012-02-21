/**
 * MC(Module Coding) 模块化编程Core
 *
*/

(function($,win,doc,undefined){
	
	var SandBox = $.SandBox;
	
	var MC = win.MC = $.MC = function(){
	
		var _defaultOptions = {
			entryName: 'init',
			configField: 'mod-config',
			once: true,
			root: null,
			childrenAutoInit:true,
			__type:'function'
		};
	
		//无序列保存注册的模块的信息
		var __modules = {};
		
		var __lazyModules = {};
		
		//无序列保存模块的数据
		var __modulesData = {};
		
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
				instance.__sandbox = sandbox;
				// 保证所有模块都有init和destroy方法
				!instance['init'] ? (instance['init'] = $.noop):0;
				!instance['destroy'] ? (instance['destroy'] = $.noop):0;
				
				return instance;
			},
			/**
			  *触发所有模块初始化完毕事件
			 */
			_fnTriggerAllModuleReadyEvent:function(){
				$(doc).trigger('MC.ready');
			},
			end:0
		})
		
		
		return {
			module:function(moduleId,creator,options){
			
				if($.type(moduleId)!=='string'){
					creator = moduleId;
					options = creator;
					moduleId = 'module'+$.now();
				}
				
				if(__modules[moduleId]||__lazyModules[moduleId]){
					console.log('warn: module ' + moduleId + ' already exist, ignore it.');
				}
				
				
				options = $.extend({}, _defaultOptions, options);
				
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
				module.instance = __fns.__fnCreateInstance(moduleId,module);

				module.instance.init&&module.instance.init(module.instance.__sandbox,module,moduleId);
				
				if($.type(module.instance.children)=='array' && module.options.childrenAutoInit){
				
					var children = module.instance.children;
					
					for(var i=0, len = children.length;i<len;i++){
					
						switch($.type(children[i])){
						
							case 'function': children[i](module.instance.__sandbox,module,moduleId);break;
							
							case 'object':children[i].init&&children[i].init(module.instance.__sandbox,module,moduleId);break;
						}
					}
				}
				//触发所有模块初始化完毕
				return this;
			},
			startAll:function(){
				var self = this;
				$(doc).ready(function(){
				console.log('startAll');
					for(var module in __modules){
						
						if(__modules[module]&&!__modules[module].instance){
							
							self.start(module,'all');
						}
					}
					__fns._fnTriggerAllModuleReadyEvent();
				});
			},
			restart:function(){
				
			},
			stop:function(){
				
			},
			set:function(moduleId){
				var self = this;
				if(!__modules[moduleId]) return $.noop;
				
				var __moduleData = __modulesData[moduleId]||(__modulesData[moduleId]={});
				
				return function(type,data){
					__moduleData[type] = data;
					return true;
				}
			}
		}
	}();
	
	
	
})(jQuery,this,document);