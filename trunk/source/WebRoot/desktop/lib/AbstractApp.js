/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('Leetop.lib.AbstractApp', {
    mixins: {
        observable: 'Ext.util.Observable'
    },

    requires: [
        'Ext.container.Viewport',

        'Leetop.lib.Desktop'
    ],

    isReady: false,
    modules: null,
    useQuickTips: true,

    constructor: function (config) {
        var me = this;
        me.addEvents(
            'ready',
            'beforeunload'
        );

        me.mixins.observable.constructor.call(this, config);

        if (Ext.isReady) {
            Ext.Function.defer(me.init, 10, me);
        } else {
            Ext.onReady(me.init, me);
        }
    },

    init: function() {
        var me = this, desktopCfg;

        if (me.useQuickTips) {
            Ext.QuickTips.init();
        }

        me.modules = me.getModules();
        if (me.modules) {
            me.initModules(me.modules);
        }
        desktopCfg = me.getDesktopConfig();
        Ext.MessageBox.updateProgress(0.25,'25%','<br/>正在初始化桌面...');
        me.desktop = new Leetop.lib.Desktop(desktopCfg);
        me.viewport = new Ext.container.Viewport({
            layout: 'fit',
            items: [ me.desktop ],
            listeners : {
            	'afterrender' : function(){
            		me.desktop.initView();
            		var costTime = (new Date().getTime()) - startLoadingTime;
            		Ext.MessageBox.updateProgress(1,'100%','<br/>桌面加载完成,耗时:' + costTime + 'ms');
            	}
            }
        });
		
		Ext.getBody().on('contextmenu', function(e){
        	e.stopEvent();
        });
        Ext.getBody().on('keydown', function(e){
        	var me = this;
        	if(e.getKey() == e.ESC){
        		me.onLogout();
        	}
        	else if(e.getKey() == e.F5){
        		e.stopEvent();
        		Ext.Msg.confirm('系统提示', '您确定要刷新页面么?',function(btn){
        			if(btn == 'yes'){
        				window.location.reload();
        			}
        		});
        	}
        	else if(e.getKey() == e.F1){
        		e.stopEvent();
        		Ext.Msg.alert('系统提示', '查看帮助!');
        	}
        	
        	else if(e.getKey() == e.F3){
        		e.stopEvent();
        		Ext.Msg.alert('系统提示', '查询程序!');
        	}
        	
        	else if(e.getKey() == e.F2){
	    		e.stopEvent();
	    		var view = me.desktop.view,nodes = view.getSelectedNodes();
	    		if(nodes.length == 1){
	    			var shortcut = Ext.fly(Ext.fly(nodes[0]).first('div.ux-desktop-shortcut-text')).first('div.'+me.desktop.view.labelSelector),
	    			record = view.getSelectedRecords()[0],editor = view.editor;
	    			if(shortcut){
			    		editor.startEdit(shortcut, record.data[editor.dataIndex]);
			    		editor.activeRecord = record;
			    	}
	    		}
	    	}
	    	else if(e.getKey() == e.DELETE){
	    		e.stopEvent();
	    		var view = me.desktop.view,records = view.getSelectedRecords();
	    		if(records.length > 0){
		    		Ext.Msg.confirm('系统提示', '您确定删除'+ (records.length > 1 ? '这' + records.length + '个应用程序' : records[0].data.name )+'么?',function(btn){
		    			if(btn == 'yes'){
		    				view.store.remove(records);
		    			}
		    		});
	    		}
	    	}
	    	else if(e.getKey() == e.UP || e.getKey() == e.DOWN || 
	    			e.getKey() == e.LEFT || e.getKey() == e.RIGHT || 
	    			e.getKey() == e.HOME || e.getKey() == e.END || e.getKey() == e.ENTER){
	    		e.stopEvent();
	    		var view = me.desktop.view,records = view.getSelectedRecords(),selector = view.getSelectionModel();
	    		if(records.length > 0){
		    		var index = view.store.indexOf(records[records.length - 1]);
	    			if( e.getKey() == e.UP ){
		    			if((index - 1) >= 0 ){
		    				selector.select((index - 1));
		    			}
	    			}else if(e.getKey() == e.DOWN){
	    				if((index + 1) <= view.store.getCount() - 1 ){
		    				selector.select((index + 1));
		    			}
	    			}else if(e.getKey() == e.LEFT || e.getKey() == e.RIGHT){
	    				var rows = me.desktop.view.shortcutsCols;
	    				if(e.getKey() == e.LEFT){
		    				if((index - rows) >= 0){
			    				selector.select((index - rows));
			    			}
		    			}else if(e.getKey() == e.RIGHT){
		    				if((index + rows) <= view.store.getCount() - 1 ){
			    				selector.select((index + rows));
			    			}
		    			}
	    			}else if(e.getKey() == e.HOME){
		    			selector.select(0);
	    			}else if(e.getKey() == e.END){
	    				selector.select(view.store.getCount() - 1);
	    			}else if(e.getKey() == e.ENTER){
	    				Ext.each(records,function(record){
	    					me.desktop.onShortcutItemClick(view,record,null,view.store.indexOf(record));
	    				});
	    			}
    			}
	    	}
        },me);
        Ext.EventManager.on(window, 'beforeunload', me.onUnload, me);

        me.isReady = true;
        me.fireEvent('ready', me);
    },

    /**
     * This method returns the configuration object for the Desktop object. A derived
     * class can override this method, call the base version to build the config and
     * then modify the returned object before returning it.
     */
    getDesktopConfig: function () {
        var me = this, cfg = {
            app: me,
            taskbarConfig: me.getTaskbarConfig()
        };

        Ext.apply(cfg, me.desktopConfig);
        return cfg;
    },

    getModules: Ext.emptyFn,

    /**
     * This method returns the configuration object for the Start Button. A derived
     * class can override this method, call the base version to build the config and
     * then modify the returned object before returning it.
     */
    getStartConfig: function () {
        var me = this, cfg = {
            app: me,
            menu: []
        };

        Ext.apply(cfg, me.startConfig);

        Ext.each(me.modules, function (module) {
            /*if (module.launcher) {
                cfg.menu.push(module.launcher);
            }*/
            cfg.menu.push(module);
        });

        return cfg;
    },

    /**
     * This method returns the configuration object for the TaskBar. A derived class
     * can override this method, call the base version to build the config and then
     * modify the returned object before returning it.
     */
    getTaskbarConfig: function () {
        var me = this, cfg = {
            app: me,
            startConfig: me.getStartConfig()
        };

        Ext.apply(cfg, me.taskbarConfig);
        return cfg;
    },

    initModules : function(modules) {
        var me = this;
        Ext.each(modules, function (module) {
        	module.handler = function(){
        		me.createWindow(module.module,module.text);
        	};
            module.app = me;
        });
    },
    
    createWindow : function(module,text){
    	var me = this;
    	if(!Ext.ClassManager.isCreated(module)){
	    		Ext.require(module,function(){
	    			var win = Ext.create(module,{app : me}).createWindow();
	    		});
    	}else{
    		var win = Ext.create(module,{app : me}).createWindow();
    		if (win) {
	            me.desktop.restoreWindow(win);
	        }
    	}
    },

    getModule : function(name) {
    	var ms = this.modules;
        for (var i = 0, len = ms.length; i < len; i++) {
            var m = ms[i];
            if (m.id == name || m.appType == name) {
                return m;
            }
        }
        return null;
    },

    onReady : function(fn, scope) {
        if (this.isReady) {
            fn.call(scope, this);
        } else {
            this.on({
                ready: fn,
                scope: scope,
                single: true
            });
        }
    },
    
    
    createSmallIconCls : function(iconCls){
    	if(!Ext.util.CSS.getRule('.'+iconCls + "-small")){
    		var rule = Ext.util.CSS.getRule('.'+iconCls);
    		if(rule){
		    	var cssText = "."+iconCls+"-small {" +
									"background: url('"+ctx+"/makeIcon?url="+rule.style.backgroundImage+"') repeat;}";
		    	Ext.util.CSS.createStyleSheet(cssText);
	    	}
    	}
    	return iconCls + "-small";
    },

    getDesktop : function() {
        return this.desktop;
    },

    onUnload : function(e) {
        if (this.fireEvent('beforeunload', this) === false) {
            e.stopEvent();
        }
    }
});
