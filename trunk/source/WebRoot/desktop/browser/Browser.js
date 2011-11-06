
Ext.define('Leetop.browser.Browser', {
    extend: 'Leetop.lib.Module',

    id:'browser',
    windowId: 'browser-window',

    tipWidth: 160,
    tipHeight: 96,
    
    standardProtocol : 'http://',
    
    securityProtocol : 'https://',
    
    blankAddress :  'http://www.baidu.com',
    
    requires: [
    	'Leetop.browser.Address',
    	'Leetop.browser.History',
    	'Leetop.browser.Page',
    	'Ext.ux.TabReorderer',
    	'Ext.ux.TabScrollerMenu'
    ],

    init : function(){
        this.launcher = {
            text: '浏览器',
            iconCls:'tt-shortcut-small',
            handler : this.createWindow,
            scope: this
        },
        this.searcher = {
			name : '百度',
			url : 'http://www.baidu.com/s?wd='
        };
    },
	
	createHistorys : function(){
		var me = this;
		me.historys = Ext.create('Ext.data.Store',{
        	model : 'Leetop.browser.History'
        });
        return me.historys;
	},
	
	doRefresh : function(){
		var me = this;
		me.getActivePage().refresh();
	},
    
	doStop : function(){
		var me = this;
		me.getActivePage().stop();
	},
	
	doSearch : function(){
		var me = this;
		me.access( me.searcher.url + me.address.getValue());
	},
	
	onLoad : function(p){
		var me = this;
		if(me.getActivePage() == p){
			if(!me.address.getValue()){
				me.address.setValue(p.src);
			}
			me.address.onLoad();
		}
	},
	
	access : function(url){
		var me = this;
		url = url || me.blankAddress;
		if(url.indexOf(me.standardProtocol) == -1 && url.indexOf(me.securityProtocol) == -1){
			url = me.standardProtocol + url;
		}
		me.address.setRawValue(url);
		me.getActivePage().access(url);
	},
	
	updateTaskButtonTooltip : function(title,url){
		this.app.getDesktop().getWindow(this.windowId).taskButton.setTooltip({
			title : title,
			text : url || title,
			align: 'bl-tl'
		});
	},
	
	updateTaskButtonText : function(title){
		this.app.getDesktop().getWindow(this.windowId).taskButton.setText(title);
	},
	
	updateAddressValue : function(value){
		this.address.setRawValue(value);
	},
	
    createWindow : function(){
        var me = this, desktop = me.app.getDesktop(),
        win = desktop.getWindow(me.windowId);
		me.historys = me.createHistorys();	
        if (!win) {
            win = desktop.createWindow({
                id: me.windowId,
                title: '浏览器',
                width: desktop.view.getWidth() - 100,
                height: desktop.view.getHeight() - 100,
                iconCls: 'tt-shortcut-small',
                animCollapse: false,
                maximizable : true,
                border: false,
                layout : 'border',
                items: [
                    me.createNavBar(),
                    me.createTabPanel()
                ]
            });
        }
        win.show();
        me.access(me.customeURL);
        return win;
    },
    
    getActivePage : function(){
		return this.tab.getActiveTab();
	},
    
    createPlusTab : function(){
    	var me = this;
    	return {
    		xtype : 'panel',
    		iconCls : 'x-browser-add-icon',
    		reorderable : false,
    		listeners : {
    			'activate' : function(){
    				var panel = Ext.create('Leetop.browser.Page',{browser : me});
    				me.address.onInit();
					me.tab.insert(me.tab.items.length - 1,panel);
					me.tab.setActiveTab(panel);
    			}
    		}
    	};
    },
    
    createTabPanel : function(){
    	var me = this;
    	me.tab = Ext.create('Ext.TabPanel',{
                    	activItem : 1,
                    	region : 'center',
                    	split  : true,
                    	tabWidth : 115,
                    	enableTabScroll : true,
                    	animScroll  : true,
                    	minTabWidth : 35,
                    	autoScroll : false,
                    	resizeTabs : true,
                    	items :[
                    		Ext.create('Leetop.browser.Page',{browser : me}),
	                    	me.createPlusTab()
                    	],
				        plugins: [
				        	Ext.create('Ext.ux.TabReorderer')
				        ]
                    });
        return me.tab;       
    },
    
	createAddress : function(){
		var me = this;
		me.address = Ext.create('Leetop.browser.Address',{
            		store : me.historys,
            		browser : me,
            		flex : 1,
            		cls : 'x-browser-white',
            		displayField : 'domain',
            		valueField : 'url',
            		triggerAction : 'all',
            		listeners : {
            			'select' : function(){
            				me.access(this.getValue());
            			}
            		}
                });
        return me.address;     
	},
	
    
    createNavBar : function(){
    	var me = this;
    	return {
    		xtype : 'panel',
    		region : 'north',
    		autoHeight : true,
    		split : true,
    		tbar : Ext.create('Ext.toolbar.Toolbar', {
	            items: [' ',{
	                iconCls : 'x-browser-back-icon',
	                tooltip : {
	                	text : '后退'
	                }
	            },'-',{
	                iconCls : 'x-browser-next-icon',
	                tooltip : {
	                	text : '前进'
	                }
	            },' ',
	            me.createAddress(),
	            ' ',
	            {
	            	iconCls : 'x-browser-home-icon',
	                tooltip : {
	                	text : '首页'
	                }	
	            },'-',{
	            	iconCls : 'x-browser-favorites-icon',
	                tooltip : {
	                	text : '收藏夹'
	                }	
	            },'-',{
	            	iconCls : 'x-browser-gear-icon',
	                tooltip : {
	                	text : '设置'
	                }	
	            },'-',{
	            	iconCls : 'x-browser-plugin-icon',
	                tooltip : {
	                	text : '插件管理'
	                }	
	            }]
            })
    	};
    }
});
