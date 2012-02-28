/**
 * 模块加载管理类，负责所有模块的注册及应用程序的初始化入口。
 * 模块的加载分为三类：
 * 1） 页面load时就需要被加载，并需要立即执行初始化的模块。										-- 普通模块(NormalModule)
 * 2） 页面load时就需要被加载，但不需要立即执行初始化，而是后期通过事件驱动才初始化的模块。 -- 延迟初始化模块(LazyInitModule)
 * 3） 页面load完成后，通过事件驱动加载的模块，譬如 曝光事件，click事件、mouseover事件等。  -- 延迟加载模块(LazyLoadModule)
 * 
 * 以上三种模块都在此类中统一定义管理，注册和初始化的触发在此类中完成。
 
 * @author terence.wangt
 * date:2012.02.01
 */
!(function($){
	
	var AppCore,
		configs = {
		lazyurl:Searchweb.Config.LazyModule,
		end:0
	};
	
	function AppStart() {
		return AppStart;
	}
	
	$.extend(AppStart,{
				
			init:function(cfg){
			
				AppCore = jEngine.Core.AppEntity;
				
				this.config = $.extend(true, {}, configs, cfg);
				
				this.normalModuleInit();
				this.lazyLoadModuleInit();
				this.lazyInitModuleInit();
			},
			
			/**
			* 所有的普通模块的注册及初始化操作定义在此函数中。
			* 默认情况下，普通模块注册时并不会自动初始化。若想改变默认值，则config中添加{init:true}参数
			*/
			normalModuleInit:function(){
				
				AppCore.register("mod-search-module1", "Searchweb.Business.Module1");
				AppCore.register("mod-search-module2", "Searchweb.Business.Module2", {callback:function(){}});
				AppCore.startAll();
			},
			
			
			/**
			* 所有的延迟加载模块的注册及初始化操作定义在此函数中。
			* a. 默认情况下，延迟加载|初始化模块注册时会自动调用模块的初始化函数，若想改变默认值，则config中添加{inti:false}参数
			* b. 当多个元素注册为同一模块的触发元素时，application core可以控制只加载一次模块，并及时移除事件。
			* c. 请保持统一的注册方式，具体的业务逻辑请放入到相应模块中，此处只负责加载和初始化。
			*/
			lazyLoadModuleInit:function(){

				AppCore.lazyRegister("mod-search-lazyload1", "Searchweb.Business.lazyloadModule1", 
					$(".domDetail"), 'exposure',{
					threshold:200,
					module:this.config.lazyurl.lazyModule1
				});
				
				AppCore.lazyRegister("mod-search-lazyload2", "Searchweb.Business.lazyloadModule2", 
				   '#mod-search-lazyload2', 'mouseover',{
					module:this.config.lazyurl.lazyModule2
				});
			},
			
			
			/**
			* 所有的延迟初始化载模块的注册及初始化操作定义在此函数中。
			* a. 默认情况下，延迟加载|初始化模块注册时会自动调用模块的初始化函数，若想改变默认值，则config中添加{inti:false}参数
			* b. 当多个元素注册为同一模块的触发元素时，application core可以控制只加载一次模块，并及时移除事件。
			* c. 请保持统一的注册方式，具体的业务逻辑请放入到相应模块中，此处只负责加载和初始化。
			*/
			lazyInitModuleInit:function(){
								
				AppCore.lazyRegister("mod-search-lazyinit", "Searchweb.Business.lazyInitModule", '#delayInitBtn', 'click');
			},
			end:0
	});
	
	Searchweb.Business.AppStart = AppStart;
	
	
	//Searchweb应用的入口函数
	 jEngine.Core.Loader.ready(function(){
		Searchweb.Business.AppStart.init();
	});
	
})(jQuery);

