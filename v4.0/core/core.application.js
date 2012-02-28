/**
 * Application core ���ã�
 * 1�����Ƹ���ģ����������ڣ�����������
 * 2������ģ����ͨ��
 * 3�������ϵͳ����Ĵ���
 
 * @author terence.wangt  chuangui.xiecg
 * @date 2012-01-20
 
 * import core.logger.js
 * import core.sandbox.js
 * import core.lazymodule.js
 */

!(function($){
	
	var configs = {
		dataField:    'data-mod-config',	//server�˵�����ͨ������������뵽ģ���Ӧdom�ڵ��У���ܻḺ��ȡ���ڵ������ݲ�����ģ���this.config.data������
											//���磺<div data-mod-config='{"name":"title","url":"http://china.alibaba.com/offer/json/validate.htm"}'/></div>
		combineField: 'combine-mod-config',	//���ӳټ���ģ���У���ʱҳ���ϵ�һ������ģ���в�ͬ��չ�ַ�ʽ��Ҫ���ز�ͬ��js��css�ļ���server��ͨ������ڵ����
											//��������֪ǰ��Ӧ�ü��ص���Դ�ļ�����ϡ���ܻḺ����������ԵĻ�ȡ��
		AllReadyEvent:'jEngine.ready',
		end:0
	};

    function AppEntity(cfg){
	
        this.init(cfg);
    }
	
    $.extend(AppEntity.prototype, {
		init: function(cfg){

			this.config = $.extend(true, {}, configs, cfg);
						
			this.moduleData = {};
			this.mediator = new jEngine.Core.Mediator();
		},
		
		/**
		* @method: register ģ��ע�ắ��
		* @param: moduleId: ע��ģ������ƣ�string��, �����dom�ڵ��id��ͬ������Զ���ȡ�ڵ��е�data-mod-config���Ե�jsonֵ
		* @param: creator: ģ��Ĺ��캯����string|function�������Ϊstring����ᱻparse��Ϊfunction
		* @param: opt: ����ѡ�������ò��������Դ���callback���������ò���
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
			
				if(!DEBUG_MOD){
					$.logger.error("could not register " + moduleId + " because: " + ex.message);
				}else{
					throw ex;
				}
			  return false;
			}
		},
		
		/**
		* @method: lazyRegister �ӳ٣�����|��ʼ����ģ��ע�ắ��
		* @param: moduleId: ע��ģ������ƣ�string��, �����dom�ڵ��id��ͬ������Զ���ȡ�ڵ��е�data-mod-config���Ե�jsonֵ
		* @param: creator: ģ��Ĺ��캯����string|function�������Ϊstring����ᱻparse��Ϊfunction
		* @param: els: �����ӳټ���ģ���Ԫ�أ�������id��dom��domArray(jquery dom�������) {string|object|array}
		* @param: event: �ӳټ��ص������¼����������ع��¼���������ͨ�¼���{exposure|normal events like: click, mouseover, focus, mouseenter}
		* @param: callback: (optional)�ӳټ��سɹ���Ļص�����{Object}
		*/
		lazyRegister: function(moduleId, creator, els, event, opt){
		
			if (opt == null) opt = {};
			try {

				if(typeof(opt.module) !== 'undefined'){
								
					//��dom�ڵ��л�ȡģ��չʾ����Ϻ� combine-mod-config="combine1"
					//�����Ӧ�����ǲ���Ҫcombine-mod-config�ڵ�ģ���һЩ����Ӧ�ã�һ��ģ�����
					//��ͬ��չʾ��ʽ����Ӧ��js��css�ļ�Ҳ�Ͳ�ͬ�������Ҫͨ����ȡdom�ϵ������ȷ��������Щ�ļ���
					var domId = "#" + moduleId;
					var domNode = $(domId);
					if(domNode.length>0){
						var combine = domNode.attr(this.config.combineField);
						if(combine && combine.trim()){
							opt.module = opt.module[combine];
						}
					}
					opt.module.moduleId = moduleId;
				}
				var succeed = false;
				//Ĭ������£��ӳټ���ģ����سɹ�����Զ�����ģ��ĳ�ʼ��������
				if(opt.init === false){
					succeed = jEngine.Core.LazyModule.register(els, event, opt);
				}
				else{
					var self = this;
					succeed = jEngine.Core.LazyModule.register(els, event, opt, function(){self._lazyStart(moduleId, creator)});
				}
				return succeed;
				
			} catch (ex) {
				if(!DEBUG_MOD){
					$.logger.error("could not lazyregister " + moduleId + " because: " + ex.message);
				}else{
					throw ex;
				}
				return false;
			}
		},
		
		/**
		* @method: unregister ģ��ж�غ���
		* @param: moduleId: ע��ģ������ƣ�string��
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
		* @method: start ��ʼ��ģ��
		* @param: moduleId: ע��ģ������ƣ�string��
		*/
		start: function(moduleId){
			
			//try-catch��֤����onlineģʽ�£�һ��ģ����쳣����Ӱ�쵽����ģ�飬����SPOF��������ϣ���
			//��debugģʽ�£��Ѵ����׸����������һ��ģ��ʧ�ܻ�Ӱ�쵽����ģ�顣�������ڷ��ִ���
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
				this.moduleData[moduleId].instance = instance;
				if (typeof opt.callback === "function"){
					opt.callback();
				}
				$.logger.info(moduleId + " init finished, cost:" + + ($.now() - start) + " ms");
				return true;
			} catch (ex) {
				if(!DEBUG_MOD){
					$.logger.error(moduleId + " init Error: " + ex.message);
				}else{
					throw ex;
				}
			  return false;
			}
		},
		
		/**
		* @method: startAll ��ʼ��������ע��ģ��
		*/		
		startAll: function(){
		
			var moduleId, _results;
			_results = [];
			for (moduleId in this.moduleData){
				if (this.moduleData.hasOwnProperty(moduleId)){
					_results.push(this.start(moduleId));
				}
			}
			//֪ͨ���е�ģ���Լ���ʼ����ϣ�����Ҫ�������¼���ģ����Դ���callback������
			this.mediator.notify(this.config.AllReadyEvent);
			return _results;		
		},
		
		/**
		* @method: stop ֹͣһ��ģ�������
		* @param: moduleId: ע��ģ������ƣ�string��
		*/		
		stop:function(moduleId) {
			var module = this.moduleData[moduleId];
			if (module.instance) {
				if($.isFunction(module.instance.destroy)){
					module.instance.destroy();
				}
				module.instance.running = false;
				module.instance = null;
				return true;
			} else {
				return false;
			}
		},
		
  		/**
		* @method: stopAll ֹͣ����ģ�������
		*/	
		stopAll:function() {
			
			var moduleId, _results;
			_results = [];
			for (moduleId in this.moduleData){
				if (this.moduleData.hasOwnProperty(moduleId)){
					_results.push(this.stop(moduleId));
				}
			}
			return _results;
		},
		
  		/**
		* @method: reStart ��������һ��ģ��
		* @param: moduleId: ע��ģ������ƣ�string��
		*/		
		restart:function(moduleId){
			if(this.stop(moduleId)){
				return this.start(moduleId);
			}
			return false;
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
		
			var module = this.moduleData[moduleId];
			if (module.instance != null){
				return module.instance;
			}
			
			var sb = new jEngine.Core.Sandbox(jEngine.Core.AppEntity, moduleId, opt);
			this.mediator.installTo(sb);
			
			//��dom�ڵ��л�ȡ����ĺ������ data-mod-config={"date":"1965-09-01","time":"19:30"}
			var domId = "#" + moduleId;
			var domNode = $(domId);
			
			
			//���ｨ�����.data�ķ�ʽ����ܰ��㴦����һ��
			
			
			/*
			
			if(domNode.length>0){
				opt.data  = domNode.data(this.config.dataField);
			}

			*/
			
			if(domNode.length>0){
				var data = domNode.attr(this.config.dataField);
				if(data && data.trim()){
					opt.data = $.parseJSON(data);
				}
			}
			
			var instance = new module.creator(sb),
			name, method;
			instance.options = opt;
			
			//debugģʽ��try catch�������ã�����������Լ��������
			//onlineģʽ�¿��԰Ѵ�����Ϣ��¼����־�������ϡ�
			if (!DEBUG_MOD){
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
		 * �ӳټ���|��ʼ����ģ����سɹ���Ҳ�ᱻע�ᵽapplicationͳһ����
		 */
		_lazyStart:function(moduleId, creator){
			
			if(this.register(moduleId, creator)){
				return this.start(moduleId);
			}
			return false;
		},
		
		/**
		 * ���ַ���ת��Ϊ����
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
			if($.isFunction(o)){
				return o;
			}
			return null;
		},
		end:0
	});

	//��appʵ������һ��Ӧ��Ĭ�������ֻ���ʼ��һ��
    jEngine.Core.AppEntity = new AppEntity();
	
})(jQuery);
            