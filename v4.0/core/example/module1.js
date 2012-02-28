!(function($){
	
	var Sandbox,
		configs = {
			end:0
		};
	
	function Module1(sb) {
		Sandbox = sb;
		return Module1;
	}
	
	$.extend(Module1,{
				
			init:function(cfg){
			
				this.config = $.extend(true, {}, configs, cfg);
				this._bindEvent();
			},
			
			//���׵�MVC�ֲ�ģʽ���������������ֱ��Ӧcontroller��modal��view�㡣
			//ģ�鿪��ʱ��ʹ����ͬ�ĺ������ƣ������ŶӺ���������
			_bindEvent:function(){
			
				var data={msg:"send from Module1"};
				$('#sandboxBtn').bind('click', function(){Sandbox.notify(Searchweb.Config.Events.DELETE, data);});
				alert(xx.xx);
			},
			
			_fetchdata:function(){
				
				Searchweb.Utility.getRPCJsonp(url,{
					data:"name=John&location=Boston",
					success:function(content){
						
					
					}
				});
			},
			
			_renderView:function(node, data){
			
				var template = '<% for ( var i = 0; i < $data.length; i++ ) { %>\
					<dl>\
						<dt>\
							<a href="javascript:;">\
								<img alt="" src="<%= $data[i].src %>" width="100" />\
							</a>\
						</dt>\
						<dd class="title"><a href="javascript:;" title="<%= $data[i].title %>"><%= $data[i].title.cut(14,"...") %></a></dd>\
						<dd class="price"><span class="cny">��</span> <em><%= $data[i].price.toFixed(2) %></em></dd>\
						<dd class="describe"><%= $util.trim($data[i].describe) %></dd>\
					</dl>\
					<% } %>';

				Searchweb.Config.renderHTML(template,data,node);
			},
			
			end:0
	});
	
	Searchweb.Business.Module1 = Module1;
		
})(jQuery);

