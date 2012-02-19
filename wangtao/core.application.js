/**
 * Application core 作用：
 * 1）控制各个模块的生命周期，创建及销毁
 * 2）允许模块间的通信
 * 3）负责对系统错误的处理
 
 * @author terence.wangt
 * @date 2012-01-20
 
 * import core.sandbox.js
 */

!(function($){
	
	var configs = {
		dataField: 'data-mod-config'
	};

    function AppEntity(cfg){
	
        this.init(cfg);
    }
	
    $.extend(AppEntity.prototype, {
		init: function(cfg){

			this.config = $.extend(true, {}, configs, cfg);
						
			this.moduleData = {};
			this.mediator = new ScaleLazyApp.Core.Mediator();
		},
		
		/**
		* @method: register 模块注册函数
		* @param: moduleId: 注册模块的名称（string）, 如果与dom节点的id相同，则会自动获取节点中的data-mod-config属性的json值
		* @param: creator: 模块的构造函数（string|function），如果为string，则会被parse成为function
		* @param: opt: （可选）可配置参数，可以传入callback或其它配置参数
		*/
		register: function(moduleId, creator, opt){
			if (opt == null) opt = {};
			try {
			  this._addModule(moduleId, creator, opt);
			  if(opt.init){
					return this.start(moduleId);
			  }
			  return true;
			} catch (ex) {
			
				if(!$.DEBUG){
					$.logger.error("could not register " + moduleId + " because: " + ex.message);
				}else{
					throw ex;
				}
			  return false;
			}
		},
		
		/**
		* @method: lazyRegister 延迟（加载|初始化）模块注册函数
		* @param: moduleId: 注册模块的名称（string）, 如果与dom节点的id相同，则会自动获取节点中的data-mod-config属性的json值
		* @param: creator: 模块的构造函数（string|function），如果为string，则会被parse成为function
		* @param: els: 触发延迟加载模块的元素，可以是id、dom、domArray(jquery dom数组对象) {string|object|array}
		* @param: event: 延迟加载的驱动事件，可以是曝光事件或其它普通事件。{exposure|normal events like: click, mouseover, focus, mouseenter}
		* @param: callback: (optional)延迟加载成功后的回调函数{Object}
		*/
		lazyRegister: function(moduleId, creator, els, event, opt){
		
			if (opt == null) opt = {};
			try {
				if(typeof(opt.module) !== 'undefined'){
					opt.module.moduleId = moduleId;
				}
				//默认情况下，延迟加载模块加载成功后会自动调用模块的初始化函数。
				if(opt.init === false){
					ScaleLazyApp.Core.LazyModule.register(els, event, opt);
				}
				else{
					var self = this;
					ScaleLazyApp.Core.LazyModule.register(els, event, opt, function(){self._lazyStart(moduleId, creator)});
				}
				return true;
				
			} catch (ex) {
				if(!$.DEBUG){
					$.logger.error("could not lazy register " + moduleId + " because: " + ex.message);
				}else{
					throw ex;
				}
				return false;
			}
		},
		
		/**
		* @method: unregister 模块卸载函数
		* @param: moduleId: 注册模块的名称（string）
		*/
		unregister: function(moduleId) {
			if (this.moduleData[moduleId] != null) {
			  delete this.moduleData[moduleId];
			  return true;
			} else {
			  return false;
			}
		},
  
		/**
		* @method: start 初始化模块
		* @param: moduleId: 注册模块的名称（string）
		*/
		start: function(moduleId){
			
			//try-catch保证了在online模式下，一个模块的异常不会影响到其它模块，消除SPOF（单点故障）。
			//在debug模式下，把错误抛给浏览器处理，一个模块失败会影响到其它模块。这样便于发现错误。
			try {
				if (this.moduleData[moduleId] == null){
					throw new Error("module " + moduleId + " does not exist");
				}
				
				var start = $.now();
				var opt = this.moduleData[moduleId].options;
				if (opt == null) opt = {};
				
				var instance = this._createInstance(moduleId, opt);
				if (instance.running === true){
					throw new Error("module " + moduleId + " was already started");
				}
				if (typeof instance.init !== "function") {
					throw new Error("module " + moduleId + " do not have an init function");
				}
				instance.init(instance.options);
				instance.running = true;
				if (typeof opt.callback === "function"){
					opt.callback();
				}
				$.logger.info(moduleId + " init finished, cost:" + + ($.now() - start) + " ms");
				return true;
			} catch (ex) {
				if(!$.DEBUG){
					$.logger.error(moduleId + " init Error: " + ex.message);
				}else{
					throw ex;
				}
			  return false;
			}
		},
		
		/**
		* @method: startAll 初始化所有已注册模块
		*/		
		startAll: function(){
		
			for (var moduleId in this.moduleData){
				if (this.moduleData.hasOwnProperty(moduleId)){
					this.start(moduleId);
				}
			}
			return true;		
		},
		
		_addModule: function(moduleId, creator, opt) {
			if (typeof moduleId !== "string") {
				throw new Error("moudule ID has to be a string");
			}
			if(typeof creator === "string"){
				creator = this._parseFunction(creator);
			}
 			if (typeof creator !== "function") {
				throw new Error("creator has to be a constructor function");
			}	
			if (typeof opt !== "object") {
				throw new Error("option parameter has to be an object");
			}
			if (this.moduleData[moduleId] != null) {
				throw new Error("module was already registered");
			}
			this.moduleData[moduleId] = {
				creator: creator,
				options: opt
			};
			return true;
		  },
		
		_createInstance: function(moduleId, opt){
						
			var sb = new ScaleLazyApp.Core.Sandbox(ScaleLazyApp.Core.AppEntity, moduleId, opt);
			this.mediator.installTo(sb);
			
			var module = this.moduleData[moduleId];
			
			//从节点中获取埋入的后端数据
			var domId = "#" + moduleId;
			var domNode = $(domId);
			if(domNode.length>0){
				var data = domNode.attr(this.config.dataField);
				if(data && data.trim()){
					opt.data = $.parseJSON(data);
				}
			}
			
			var instance = new module.creator(sb),
			name, method;
			instance.options = opt;
			
			//debug模式下try catch不起作用，交由浏览器自己处理错误。
			//online模式下可以把错误信息记录在日志服务器上。
			if (!$.DEBUG){
				for (name in instance){
					method = instance[name];
					if (typeof method == "function"){
						instance[name] = function(name, method){
							return function (){
								try { 
									return method.apply(this, arguments);
								}
								catch(ex) {
									$.logger.error(moduleId + " throw error: " +  name + "()-> " + ex.message);
								}
							};
						}(name, method);
					}
				}
			}
			return instance;
		},
		
		/**
		 * 延迟加载|初始化的模块加载成功后也会被注册到application统一管理
		 */
		_lazyStart:function(moduleId, creator){
			
			this.register(moduleId, creator);
			this.start(moduleId);	
		},
		
		/**
		 * 将字符串转化为函数
		 */
		_parseFunction:function(s){
			var a = s.split('.'),
			l=a.length,
			o = window;
			for(var i=($.isWindow(a[0])?1:0);i<l;i++){
				if($.isFunction(o[a[i]]) || $.isPlainObject(o[a[i]])){
					o = o[a[i]];
				}
				else{
					return null;
				}
			}
			if($.isFunction(o)  || $.isPlainObject(o)){
				return o;
			}
			return null;
		}

	});

	//把app实例化，一个应用默认情况下只会初始化一次
    ScaleLazyApp.Core.AppEntity = new AppEntity();
	
})(jQuery);
            