/**
  * MC(Module Coding) 模块化编程Sandbox
 */


(function($,win,doc,undefined){
	var SandBox =  $.SandBox =function(scope,opt){
		this.moduleId = opt.moduleId;
		this.module = opt.module;
		this.options = opt.module.options;
		this.node = this._getNode();
		return this;
	};
	
	$.extend(SandBox.prototype,{
		constructor:SandBox,
		_config:{
			modulePrefix:'module.',
			modulePrefixReg:/^module.\w*/,
			doPrefix:'MC.ready'
		},
		_getEventType:function(eventType){
			var self = this;
			if(!self._config.modulePrefixReg.test(eventType)&&eventType!==self._config.doPrefix){
				eventType =  self._config.modulePrefix+eventType;
			}
			return eventType;
		},
		_getNode:function(){
			var self = this,
				moduleIdFix = self.moduleId,
				nodeConfg = {},
				moduleNode,
				selecter;
				
			selecter = /^#|\./.test(moduleIdFix) ? moduleIdFix : '#' + moduleIdFix;
				
				
			moduleNode = $(selecter,document.body).first();
			console.log(selecter);
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
			if($.type(eventType)==='string'){
				eventType = [eventType];
			}
			$.each(eventType,function(idx,v){
				eventType[idx] = self._getEventType(v);
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
				type = self._getEventType(type);
			$(doc).trigger(type,data);
		}
	});
	
})(jQuery,this,document);;