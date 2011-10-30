
Ext.define('Leetop.browser.Browser', {
    extend: 'Leetop.lib.Module',

    id:'browser',
    windowId: 'browser-window',

    tipWidth: 160,
    tipHeight: 96,
    protocol : 'http://',
    blankAddress :  'http://www.baidu.com',
    
    requires: [
    	'Leetop.browser.AddressField',
    	'Leetop.browser.History',
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
			http : 'http://www.baidu.com/s?wd='
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
		me.doAccess(me.activeAccess.http);
	},
    
	doStop : function(){
		var me = this;
		me.progressbar.reset();
		me.progressbar.updateText('取消加载'+me.activeAccess.http);
		me.getActiveTab().loadstatus = 'cancel';
		me.getActiveTab().setIconCls('x-browser-page-icon');
		window.stop();
	},
	
	doSearch : function(){
		var me = this;
		me.doAccess(encodeURI( me.searcher.http + me.address.getValue()));
	},
	
	onLoad : function(p){
		var me = this;
		p.loadTime = new Date().getTime();
		p.loadstatus = 'complete';
		p.loadtimes = p.loadTime - p.accessTime;
		p.setIconCls('x-browser-page-icon');
		if(me.getActiveTab() == p){
			me.progressbar.reset();
			me.progressbar.updateProgress(1,'完成加载'+me.activeAccess.http+',耗时:'+(p.loadtimes)+'ms.');
			if(!me.address.getValue()){
				me.address.setValue(me.activeAccess.http);
			}
			me.address.onLoad();
		}
	},
	
	doAccess : function(http){
		var me = this;
		http = http  ? http : me.blankAddress;
		if(http.indexOf(me.protocol) == -1 && http.indexOf('https') == -1){
			http = me.protocol + http;
		}
		me.address.setRawValue(http);
		var record = me.historys.getById(http + 'ID');
		if (record) {
			record.set('date', new Date());
			me.activeAccess = {
				id : record.get('id'),
				http : record.get('http'),
				date : record.get('date'),
				title : record.get('title')
			};
			me.access(me.getActiveTab());
		} else {
			me.initAccess(me.getActiveTab(),http);
		}
	},
	
	initAccess : function(p,http){
		var me = this;
		me.getHttpTitle(http, p);
	},
	
	getHttpTitle : function(http,p){
		var me = this;
		me.progressbar.wait({
			interval : 500,
			increment : 15,
			text : '正在获取' + http + '的标题...'
		});
		Ext.Ajax.request({
		    url: ctx+'/servlet/BrowserServlet',
		    params: {
		        http : http
		    },
		    success: function(response){
		    	me.addHistory(response.responseText,http);
		    	me.access(p);
		    },
		    failure : function(){
		    	me.addHistory('未知标题',http);
		    	me.access(p);
		    }
		});
	},
	
	addHistory : function(title,http){
		var me = this;
		me.activeAccess = {
			id : http + 'ID',
			http : http,
			date : new Date(),
			title : title
		};
		me.historys.add(me.activeAccess);
	},
	
	access : function(p){
		var me = this;
		p.loadstatus = 'loading';
		p.setIconCls('x-browser-load-icon');
		me.address.onLoading();
		me.progressbar.updateText('正在加载'+me.activeAccess.http+'...');
		p.accessTime = new Date().getTime();
		/*var subtitle = me.activeAccess.title.substring(0,12);
		if(me.activeAccess.title > 12){
			subtitle += "...";
		}
		p.setTitle(subtitle);*/
		p.setTitle(me.activeAccess.title);
		p.tabTip = me.activeAccess.title;
		var iframe = me.getBodyIframe(p);
		if(!iframe){
			iframe = me.initBodyIframe(p);
		}
		iframe.src = me.activeAccess.http;
	},
	
    createWindow : function(){
        var me = this, desktop = me.app.getDesktop(),
            win = desktop.getWindow(me.windowId);
            Ext.QuickTips.init();
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
                    me.createTabPanel(),
                    me.createStatusBar()
                ]
            });
        }
        win.show();
        me.doAccess();
        return win;
    },
    
    getBodyIframe : function(p){
    	return p.body.first('iframe', true);
    },
    
    initBodyIframe : function(p){
    	var me = this;
    	p.update('<iframe id="qqmap_iframe" scrolling="auto" ' + 
            		'frameborder="no" hidefocus="" allowtransparency="true" ' + 
            		'style="width: 100%; height: 100%;">');
        var iframe = me.getBodyIframe(p);
		iframe.onload = function(){
			me.onLoad(p);
		};
		return iframe;
    },
    getActiveTab : function(){
		return this.tab.getActiveTab();
	},
    createNewTab : function(){
    	var me = this;
	    var panel = Ext.create('Ext.Panel',{
			xtype : 'panel',
			iconCls : 'x-browser-page-icon',
			title : '新建选项卡',
			closable : true,
    		listeners : {
    			'activate' : function(p){
    				var iframe = me.getBodyIframe(p);
    				if(iframe){
    					me.address.setRawValue(iframe.src);
    					if(p.loadstatus == 'complete'){
    						me.progressbar.reset();
    						me.progressbar.updateProgress(1,'完成加载'+iframe.src+',耗时:'+(p.loadtimes)+'ms.');
	    					me.address.onLoad();
	    				}else if(p.loadstatus == 'loading'){
	    					me.progressbar.wait({
								interval: 500,
								increment: 15,
					            text: '正在加载'+iframe.src+'...'
					        });
	    					me.address.onLoading();
	    				}else if(p.loadstatus == 'init'){
	    					me.progressbar.updateProgress(0,'准备就绪....');
	    					me.address.onInit();
	    				}else if(p.loadstatus == 'cancel'){
	    					me.progressbar.updateProgress(0,'取消加载'+iframe.src);
	    					me.address.onInit();
	    				}
    				}else{
    					me.address.setRawValue('');
    					me.address.onInit();
    					me.progressbar.updateProgress(0,'准备就绪...');
    				}
    				
    			}
    		}
		});
		return panel;
    },
    
    createPlusTab : function(){
    	var me = this;
    	return {
    		xtype : 'panel',
    		iconCls : 'x-browser-add-icon',
    		title : '新建选项卡',
    		tabTip : '添加选项卡',
    		reorderable : false,
    		listeners : {
    			'activate' : function(){
    				var panel = me.createNewTab();
    				panel.loadstatus = 'init';
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
                    	xtype : 'tabpanel',
                    	activItem : 1,
                    	region : 'center',
                    	split  : true,
                    	tabWidth : 115,
                    	enableTabScroll : true,
                    	animScroll  : true,
                    	minTabWidth : 115,
                    	autoScroll : false,
                    	resizeTabs : true,
                    	items :[
                    		me.createNewTab(),
	                    	me.createPlusTab()
                    	],
				        plugins: [
				        	Ext.create('Ext.ux.TabReorderer')
				        ]
                    });
        return me.tab;       
    },
    
	createAddressField : function(){
		var me = this;
		me.address = Ext.create('Leetop.browser.AddressField',{
            		store : me.createHistorys(),
            		browser : me,
            		flex : 1,
            		cls : 'x-browser-white',
            		displayField : 'domain',
            		valueField : 'http',
            		triggerAction : 'all',
            		listeners : {
            			'select' : function(){
            				me.doAccess(this.getValue());
            			}
            		}
                });
        return me.address;     
	},
	
	createProgressBar : function(){
		var me = this;
		me.progressbar = Ext.create('Ext.ProgressBar', {
		       text:'初始化...',
		       flex : 1
		});
		return me.progressbar;
	},
	
	createStatusBar : function(){
		var me = this;
		return {
			xtype : 'panel',
			region : 'south',
			autoHeight : true,
			border : false,
    		split : true,
    		items : [me.createProgressBar()]
		};
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
	            me.createAddressField(),
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
