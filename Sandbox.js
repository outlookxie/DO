/**
 *	Sandbox 
 */

(function($,win,doc){
	var SandBox =  $.SandBox =function(scope,extra){
		this.extra = extra;
		this.moduleId = this.extra.moduleId;
		this.node = this._getNode();
		return this;
	};
	SandBox.prototype={
		constructor:SandBox,
		_config:{
			modulePrefix:'module.',
			modulePrefixReg:/^module.\w*/,
			doPrefix:'DO.ready'
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
				conf = self.extra.config,
				moduleIdFix = self.extra.moduleId,
				nodeConfg = {},
				moduleNode,
				moduleClass;
			if(/^~\w*/.test(conf.moduleId)){
				moduleIdFix  = moduleIdFix.substring(1);
			}
			moduleClass = '.'+moduleIdFix+'[data-mod-config]';
			moduleNode = $(moduleClass,document.body).first();
			if(moduleNode.length){
				nodeConfg=moduleNode.data('mod-config');
				DO.set(moduleIdFix)('node',{
					el:moduleNode,
					config:nodeConfg
				});
				return {
					el:moduleNode,
					config:nodeConfg
				}
			}
			return {};
		},
		/**
		 * ע������¼���֧�������¼��ļ���
		 * @param  eventType {String|Array} �¼�����
		 * @param handle {Function} �¼���Ӧ֮��Ļص�����
		 * @param  scope
		 */
		listen:function(eventType,handle,scope){
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
		 * ʱ������
		 * @param  type {String} �¼�����
		 * @param data {Object} �¼�����
		 */
		notify:function(type,data){
			var self = this;
				type = self._getEventType(type);
			$(doc).trigger(type,data);
		}
	};
	
})(jQuery,window,document);


jQuery.extendIf(jQuery.SandBox.prototype,{
	extraTest:function(){
		console.log(2,'Sandbox-->EXTRA:'+'extraTest');
	}
});