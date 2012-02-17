/**
 *	DO 一个Core modulelation
 */
 
(function($,win,doc){
	
	var SandBox = $.SandBox;
	
	var DO = win.DO = $.DO = function(){
		var __modules = {},__modulesData={};
		
		var _createInstance = function(moduleId,config){
			var instance = __modules[moduleId].creator(new SandBox(this,{
					moduleId:moduleId,
					config:config
				})),
				name,
				method;
			if($.DEBUG){
				for(name in instance){
					method = instance[name];
					if(typeof method === 'function'){
						instance[name] = function(name,method){
							return function(){
								try{
									return method.apply(this,arguments)
								}catch(e){
									if(win.console&&win.console.log){
										win.console.log(9,'module:'+moduleId+' ',name+'() '+e.message);
									}
								}
							}
						}(name,method);
					}
				}
			}
			return instance;
		};
		
		var triggermoduleEvent = function(){
			$(doc).trigger('DO.ready');
		};
		
		return {
			register:function(moduleId,creator){
				if($.type(moduleId)==='function'){
					creator = moduleId;
					moduleId = 'module'+$.now();
				}
				
				var isAutoInit = /^~\w*/.test(moduleId);
				if(isAutoInit){
					moduleId = moduleId.substring(1);
				}
				
				__modules[moduleId] = {
					creator:creator,
					instance:null
				};
				
				isAutoInit&&this.start(moduleId);
			},
			start:function(moduleId){
				__modules[moduleId].instance = _createInstance(moduleId,__modules[moduleId]);
				__modules[moduleId].instance.init&&__modules[moduleId].instance.init(moduleId);
				if($.type(__modules[moduleId].instance.children)=='object'){
					var children = __modules[moduleId].instance.children;
					for(var child in children){
						if($.type(children[child].init)=='function'){
							children[child].init(moduleId,child);
						}
					}
				}
				//触发所有模块初始化完毕
				return this;
			},
			stop:function(moduleId){
				var data = __modules[moduleId];
				if(data&&data.instance&&$type(data.instance.destory)=='function'){
					data.instance.destory(moduleId);
					data.instance = null;
				}
				return this;
			},
			startAll:function(){
				var self = this;
				$(doc).ready(function(){
					for(var moduleId in __modules){
						if(__modules[moduleId]&&!__modules[moduleId].instance){
							self.start(moduleId);
						}
					}
					triggermoduleEvent();
				});
			},
			stopAll:function(){
				for(var moduleId in __modules){
					if(__modules[moduleId]){
						this.stop(moduleId);
					}
				}
			},
			refresh:function(moduleId){
				__modules[moduleId].instance.init&&__modules[moduleId].instance.init();
				return this;
			},
			get:function(moduleId){
				var _moduleData = __modulesData[moduleId];
				return function(type){
					return _moduleData&&_moduleData[type];
				}
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
			debug:function(v){
				$.DEBUG = Boolean(v);
			}
		}
	}() ;
	
})(jQuery,window,document);


jQuery.extendIf(jQuery.DO,{
	extraTest:function(){
		console.log(1,'DO-->EXTRA:'+'extraTest');
	}
});