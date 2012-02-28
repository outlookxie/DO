/**
 * Sandbox 
 * ÿ��ģ�鶼���Լ��� Sandbox����������ģ�����϶ȣ���ģ��ֻ��ֱ�Ӻ�Sandbox�򽻵���
 * @author terence.wangt chuangui.xiecg
 * @date 2012-01-20
 */
 
!(function($){	
	
    function Sandbox(core, moduleId, options){
		
		return this.init(core, moduleId, options);
    }
	
    $.extend(Sandbox.prototype, {
		
		init: function(core, moduleId, options){
		
			this.core = core;
			this.moduleId = moduleId;
			this.options = options != null ? options : {};
		}
	});

    jEngine.Core.Sandbox = Sandbox;
	
})(jQuery);
 

 
/**
 * Mediator 
 * ʵ��ģ���ͨ�ŵĴ�����
 * @author terence.wangt
 * @date 2012-01-20
 */
 
!(function($){

    function Mediator(obj) {
		this.channels = {};
		if (obj) this.installTo(obj);
    }

	$.extend(Mediator.prototype, {
		
		/**
		* @method: on
		* @param: channel: Ҫ�����¼������ƣ�string|Array��
		* @param: fn: �����¼��Ļص�������function��
		* @param: context: ����ѡ�������������ָ��fn��������
		*/
		on: function(channel, fn, context) {
			var id, subscription, self, i, _len, _results;
			if (context == null) context = this;
			if (this.channels[channel] == null) this.channels[channel] = [];
			self = this;
			
			//����ʹ��һ���ص�����ͬʱ��������¼���
			//���磺sb.subscribe( ["event1", "event2"], messageHandler );
			if (channel instanceof Array) {
				_results = [];
				for (i = 0, _len = channel.length; i < _len; i++) {
				id = channel[i];
				_results.push(this.subscribe(id, fn, context));
			}
			return _results;
		  }else {
			subscription = {
				context: context,
				callback: fn
			};
			return {
			  attach: function() {
				self.channels[channel].push(subscription);
				return this;
			  },
			  detach: function() {
				Mediator._rm(self, channel, subscription.callback);
				return this;
			  }
			}.attach();
		  }
		},
		
		
		/**
		* @method: off���ж��ַ�ʽ�����Ƴ������¼�
		* @param: ch: Ҫ�����¼������ƣ�string|function��
		* @param: cb: Ҫ�Ƴ������Ļص���������ѡ��
		*/
		off: function(ch, cb) {
		  var id;
		  switch (typeof ch) {
			case "string":
			  if (typeof cb === "function") Mediator._rm(this, ch, cb);
			  if (typeof cb === "undefined") Mediator._rm(this, ch);
			  break;
			case "function":
			  for (id in this.channels) {
				Mediator._rm(this, id, ch);
			  }
			  break;
			case "undefined":
			  for (id in this.channels) {
				Mediator._rm(this, id);
			  }
			  break;
			case "object":
			  for (id in this.channels) {
				Mediator._rm(this, id, null, ch);
			  }
		  }
		  return this;
		},
		
		/**
		* @method: notify
		* @param: channel: Ҫ�����¼������ƣ�string��
		* @param: data: ͨ���¼����ݵ����ݣ����������飨object|Array��
		* @param: publishReference: ����ѡ��Ĭ��Ϊfalse����֤data���ݲ����޸ġ� ���Ϊtrue����data������Ϊ���ô�ֵ������ģ�飬���ܻᱻ�޸ġ�
		*/
		notify: function(channel, data, publishReference) {
		  var copy, k, subscription, v, i, _len, _ref;
		  if (this.channels[channel] != null) {
			_ref = this.channels[channel];
			for (i = 0, _len = _ref.length; i < _len; i++) {
			  subscription = _ref[i];
			  if (publishReference !== true && typeof data === "object") {
				if (data instanceof Array) {
				  copy = (function() {
					var _j, _len2, _results;
					_results = [];
					for (_j = 0, _len2 = data.length; _j < _len2; _j++) {
					  v = data[_j];
					  _results.push(v);
					}
					return _results;
				  })();
				} else {
				  copy = {};
				  for (k in data) {
					v = data[k];
					copy[k] = v;
				  }
				}
				subscription.callback.apply(subscription.context, [copy, channel]);
			  } else {
				subscription.callback.apply(subscription.context, [data, channel]);
			  }
			}
		  }
		  return this;
		},
		
		
		/**
		* @method: installTo��Ϊsandboxʵ������¼�������
		* @param: obj: sandboxʵ����object��
		*/
		installTo: function(obj) {
		  if (typeof obj === "object") {
			obj.on = this.on;
			obj.off = this.off;
			obj.notify = this.notify;
			obj.channels = this.channels;
		  }
		  return this;
		}
	});
	
	
	/**
	* @method: _rm�� �Ƴ������¼��ľ�̬����
	*/
    Mediator._rm = function(o, ch, cb, ctxt) {
      var s;
      return o.channels[ch] = (function() {
        var i, _len, _ref, _results;
        _ref = o.channels[ch];
        _results = [];
        for (i = 0, _len = _ref.length; i < _len; i++) {
          s = _ref[i];
          if ((cb != null ? s.callback !== cb : ctxt != null ? s.context !== ctxt : s.context !== o)) {
            _results.push(s);
          }
        }
        return _results;
      })();
    };
	
	jEngine.Core.Mediator = Mediator;

})(jQuery);