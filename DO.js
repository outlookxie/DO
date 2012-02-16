/**
 *	DO 一个Core Applation
 */
 
(function($,win,doc){
	
	var SandBox = $.SandBox;
	
	var DO = win.DO = $.DO = function(){
		var __apps = {},__appsData={};
		
		var _createInstance = function(appId,config){
			var instance = __apps[appId].creator(new SandBox(this,{
					appId:appId,
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
										win.console.log('APP:'+appId+' ',name+'() '+e.message);
									}
								}
							}
						}(name,method)
					}
				}
			}
			return instance;
		};
		
		var triggerAppEvent = function(){
			$(doc).trigger('DO.ready');
		};
		
		return {
			register:function(appId,creator){
				if($.type(appId)==='function'){
					creator = appId;
					appId = 'app'+$.now();
				}
				
				var isAutoInit = /^~\w*/.test(appId);
				if(isAutoInit){
					appId = appId.substring(1);
				}
				
				__apps[appId] = {
					creator:creator,
					instance:null
				};
				
				isAutoInit&&this.start(appId);
			},
			start:function(appId){
				__apps[appId].instance = _createInstance(appId,__apps[appId]);
				__apps[appId].instance.init&&__apps[appId].instance.init();
				if($.type(__apps[appId].instance.children)=='object'){
					var children = __apps[appId].instance.children;
					for(var child in children){
						if($.type(children[child].init)=='function'){
							children[child].init(appId,child);
						}
					}
				}
				//触发所有模块初始化完毕
				return this;
			},
			stop:function(appId){
				var data = __apps[appId];
				if(data&&data.instance&&$type(data.instance.destory)=='function'){
					data.instance.destory();
					data.instance = null;
				}
				return this;
			},
			startAll:function(){
				var self = this;
				$(doc).ready(function(){
					for(var appId in __apps){
						if(__apps[appId]&&!__apps[appId].instance){
							self.start(appId);
						}
					}
					triggerAppEvent();
				});
			},
			stopAll:function(){
				for(var appId in __apps){
					if(__apps[appId]){
						this.stop(appId);
					}
				}
			},
			refresh:function(appId){
				__apps[appId].instance.init&&__apps[appId].instance.init();
				return this;
			},
			get:function(appId,type){
				return __appsData[appId]&&__appsData[appId][type];
			},
			set:function(type,appId,data){
				var self = this;
				if(!appId) {
					appId = type;
					data = appId;
					type = 'node';
				}
				if(!__appsData[appId]){
					__appsData[appId] = {};
				}
				__appsData[appId][type] = data;
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