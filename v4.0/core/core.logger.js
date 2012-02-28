 /**
 * ��־ģ��
 * 1����������־�ȼ� -- "error", "warn", "info", "debug", "log"
 * 2����Firefox��ͨ��firebug����̨�����־����IE��ͨ����url�����debug=true����������־��ʾ��ҳ��ײ���
 * 3������ģʽ�Ĵ�����־������¼��draggon���ϵͳ������������
 
 * @author terence.wangt  chuangui.xiecg, the original version's author: zhouquan.yezq
 * @date 2012-01-20
 */
 
!(function($){
	
	$.Logger=function(){};
	$.Logger.level=4; 	//default level
	$.Logger.errorUri="http://search.china.alibaba.com/rpc/dragoontrack/logError.json?msg="; 	//dragoon url
	$.Logger.setLevel=function(level){//set logger level to filter the logger , so just show the logger level you focus.
		$.Logger.level=level;
	};
   
	var prepared = false;
	var methods = [ "error", "warn", "info", "debug", "log"];//0-4 level
   
	$.extend($.Logger.prototype, {
		level:$.Logger.level,
		setEnableLevel: function(level) {
			if(level>4 || level<0) {
				this.error(['wrong level setting. level should be 0-4, the int type,you set ',level,", so stupided."].join(''));
			}
			this.level=parseInt(level);
		},
		enabled: function(lev) {
			if(lev>$.Logger.level) {
				return false;
			}
			return true;
		},
		name: function() {
			return this._name;
		},
		log: function() {
			this._log(4, arguments);
		},
		debug: function() {
			this._log(3, arguments);
		},
		info: function() {
			this._log(2, arguments);
		},
		warn: function() {
			this._log(1, arguments);
		},
		error: function() {
			this._log(0, arguments);
		},
		_handler: function(level, name, msg){
		 
			var method=methods[level];
			msg=[[method+"|"].join(" | ")].concat(Array.prototype.slice.call(msg));
			   
			if(self.console && !$.browser.msie){
			
			   if(console.log.apply){
				  console[method].apply(console, msg);    	  
			   }else{
				  console[console[method]?method:'log'](msg);
			   }
			}else{
				//��IE�£����url�����debug=true������־���ڽ��������ҳ��ĵײ����������ԡ�
				if($.browser.msie){
					if(/debug=true/i.test(location.search)){
						!prepared && this._prepare();	
						var msgBox = $('#DEBUG ol');
						
						var color;
						switch(method){
							case "log":{
								color="#FFFFFF";
								break;
							}
							case "debug":{
								color="#C0C0C0";
								break;
							}
							case "info":{
								color="#EBF5FF";
								break;
							}
							case "warn":{
								color="#FFFFC8";
								break;
							}
							case "error":{
								color="#FE6947";
								break;
							}
							default:{
								color="#FFFFFF";
								break;
							}
						}
						$('<li style="background-color:'+ color +';">').text('' + msg).appendTo(msgBox);				
					} 
				}
			}
			
			//onlineģʽ����Ҫ����
			if(!DEBUG_MOD){
				if(level == 0 || level == 1){
					(new Image()).src = $.Logger.errorUri + this._getBrowserInfo() + msg;
				}
			}
		},
	 
		_log: function(level, msg) {
			if (this.enabled(level)) {
				this._handler(level,this.name(),msg);
			}
		},
	
		_getBrowserInfo:function(){
			
			var info ="browser:";
			$.each(jQuery.browser, function(key, val) {
			
				if(key != 'version'){
					info = info + key + " ";
				}else{
					info = info + val + "|";
				}
			});
			return info;
		},
	
		_prepare:function(){
			$('#DEBUG').remove();
			$(document.body).append('<div id="DEBUG" style="margin-top:10px;padding:8px;border:dashed 1px #FF7300;background-color:#EEE;color:#000;"><ol></ol></div>');
			prepared = true;
		},
		end:0
   });
   
   var logs={};//logs  instance container
   $.getLogger= function(name) {
       if (!logs[name]) {
          logs[name] = new $.Logger(name);
          logs[name]._name=name;
        }
        return logs[name];
   };
   
   	//[ "error", "warn", "info", "debug", "log"]; 0-4 level
	$.logger=$.getLogger("jEngine");
	if(DEBUG_MOD){
		$.logger.setEnableLevel(4);	
	}else{
		$.logger.setEnableLevel(2);
	}
 
})(jQuery);
