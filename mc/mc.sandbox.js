/**
  * MC(Module Coding) 模块化编程Sandbox
 */

(function($,win,doc,undefined){
	var SandBox =  win.Sandbox = $.SandBox =function(scope,opt){
		this.moduleId = opt.moduleId;
		this.module = opt.module;
		this.options = opt.module.options;
		this.node = this.__getNode();
		return this;
	};
	
	$.extend(SandBox.prototype,{
		constructor:SandBox,
		__config:{
			modulePrefix:'module.',
			modulePrefixReg:/^module.\w*/,
			mcPrefix:'MC.ready'
		},
		__getEventType:function(eventType){
			var self = this;
			if(!self.__config.modulePrefixReg.test(eventType)&&eventType!==self.__config.mcPrefix){
				eventType =  self.__config.modulePrefix+eventType;

			}
			return eventType;
		},
		__getNode:function(){
			var self = this,
				moduleIdFix = self.moduleId,
				nodeConfg = {},
				moduleNode,
				selecter;
				
			selecter = /^#|\./.test(moduleIdFix) ? moduleIdFix : '#' + moduleIdFix;
			moduleNode = $(selecter,doc.body).first();
			if(moduleNode.length){
				nodeConfg=moduleNode.data(self.options.configField);
				MC.set(moduleIdFix)('node',{
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
				eventType = self.__config.mcPrefix;
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
		}
	});
	
})(jQuery,this,document);;
