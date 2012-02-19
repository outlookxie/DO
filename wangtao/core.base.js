/**
 * 基础类 
 * 命名空间及全局配置类信息定义在这里
 * @author terence.wangt
 * @date 2012-01-29
 
 * import core.logger.js
*/
 
!(function($) {
	
	/**
	 * 	命名空间设置
	 */
	jQuery.namespace(
		'ScaleLazyApp', 	
		'ScaleLazyApp.Core'
	);
	
	/**
	 * 	调试开发, 打开后将输出日志
	 *  online模式下，异常信息将记录到draggon服务器上报警
	 *  window.dmtrack 此变量只有online模式才存在，因此可以用于区分debug/online
	 */
	$.DEBUG = (typeof window.dmtrack ==="undefined") ? false : false;
	
	//[ "error", "warn", "info", "debug", "log"]; 0-4 level
	$.logger=$.getLogger("searchweb");
	if($.DEBUG){
		$.logger.setEnableLevel(4);	
	}else{
		$.logger.setEnableLevel(2);
	}

})(jQuery);
