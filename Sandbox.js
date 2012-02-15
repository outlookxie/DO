/**
 *	Sandbox 
 */

(function($,win,doc){
	var SandBox =  $.SandBox =function(scope,extra){
		this.extra = extra;
		this.node = this._getNode();
		return this;
	};
	SandBox.prototype={
		_config:{
			appPrefix:'APP.',
			appPrefixReg:/^APP.\w*/,
			doPrefix:'DO.ready'
		},
		_getEventType:function(eventType){
			var self = this;
			if(!self._config.appPrefixReg.test(eventType)&&eventType!==self._config.doPrefix){
				eventType =  self._config.appPrefix+eventType;
			}
			return eventType;
		},
		listen:function(eventType,handle,scope){
			var self = this;
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
		notify:function(type,data){
			var self = this;
				type = self._getEventType(type);
			$(doc).trigger(type,data);
		},
		_getNode:function(){
			var self = this,
				conf = self.extra.config,
				appIdFix = self.extra.appId,
				nodeConfg = {},
				appNode,
				appClass;
			if(/^~\w*/.test(conf.appId)){
				appIdFix  = appIdFix.substring(1);
			}
			appClass = '.'+appIdFix+'[data-app-config]';
			appNode = $(appClass,document.body).first();
			if(appNode){
				nodeConfg=appNode.data('app-config');
				DO.set('node',appIdFix,{
					el:appNode,
					config:nodeConfg
				});
				return {
					el:appNode,
					config:nodeConfg
				}
			}
			return {};
		}
	};
	
})(jQuery,window,document);


jQuery.extendIf(jQuery.SandBox.prototype,{
	extraTest:function(){
		console.log(2,'Sandbox-->EXTRA:'+'extraTest');
	}
});