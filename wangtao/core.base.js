/**
 * ������ 
 * �����ռ估ȫ����������Ϣ����������
 * @author terence.wangt
 * @date 2012-01-29
 
 * import core.logger.js
*/
 
!(function($) {
	
	/**
	 * 	�����ռ�����
	 */
	jQuery.namespace(
		'ScaleLazyApp', 	
		'ScaleLazyApp.Core'
	);
	
	/**
	 * 	���Կ���, �򿪺������־
	 *  onlineģʽ�£��쳣��Ϣ����¼��draggon�������ϱ���
	 *  window.dmtrack �˱���ֻ��onlineģʽ�Ŵ��ڣ���˿�����������debug/online
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
