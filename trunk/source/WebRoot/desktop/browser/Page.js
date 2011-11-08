Ext.define('Leetop.browser.Page',{
	extend : 'Ext.panel.Panel',
	
	iconCls : 'x-browser-page-icon',
	
	closable : true,
	
	title : '新标签页',
	
	layout : 'border',
	
	proxyURL : ctx + '/browser_proxy_window.jsp?url=',
	
	loadCount : 0,
	
	statusTypes : {
		INIT : 'init',
		LOADING : 'loading',
		STOP :'stop',
		COMPLETE : 'complete'
	},
	
	initComponent : function(){
		var me = this;
		me.IframePanel = Ext.create('Ext.panel.Panel',{
			border : false,
			region : 'center',
			//html : me.url ? me.buildIframeHTML(me.url) : null,
			split : true,
			listeners : {
				afterrender : me.onAfterRender,
				scope : me
			}
		});
		
		me.progressbar = Ext.create('Ext.ProgressBar',{
			text : '初始化...',
			flex : 1
		});
		me.items = [me.IframePanel,{
									xtype : 'panel',
									autoHeight : true,
									region : 'south',
									border : false,
						    		split : true,
						    		items : [me.progressbar]
								}];
		me.on({
			activate : me.onActivate,
			beforedestroy : me.onBeforDestroy,
			scope : me
		});
		me.setStatus(me.statusTypes.INIT);
		me.callParent();
	},
	
	onAfterRender : function(){
		var me = this;
		if(me.url){
			me.access(me.url);
		}
	},
	
	onBeforDestroy : function(){
		var me = this;
		if(me.browser.tab.items.getCount() == 2){
			me.browser.app.getDesktop().getActiveWindow().destroy();
		}
	},
	
	onActivate : function(text){
		var me = this;
		me.updatePageInfo(me.title,me.url);
	},
	
	buildIframeHTML : function(){
		return '<iframe  scrolling="no" frameborder="no" hidefocus="" ' +
				'allowtransparency="true" style="width: 100%; height: 100%;">';
	},
	
	onIframeLoad : function(){
		var me = this;
		if(me.loadCount == 0){
			//me.initInnerIframe();
			//FIXME 好难实现动态获取页面加载的地址
		}
		me.loadCount ++;
		me.setStatus(me.statusTypes.COMPLETE);
		me.setIconCls('x-browser-page-icon');
		me.progressbar.reset();
		me.progressbar.updateProgress(1,'完成加载'+me.url+',耗时:'+(new Date().getTime() - me.startLoadTime)+'ms.');
		me.browser.onLoad(me);
	},
	
	initIframe : function(){
    	var me = this;
    	me.IframePanel.update(me.buildIframeHTML());
		me.getIframe().onload = function(){
			me.onIframeLoad();
		};
    },
    
    initInnerIframe : function(){
    	var me = this,iframe = me.getInnerIframe();
    	iframe.onload = function(){
			me.getHttpTitle(iframe.src,function(title){
				me.updatePageInfo(Ext.String.ellipsis(title,12,true),iframe.src);
				this.setTitle(Ext.String.ellipsis(title,12,true));
			},me);
		};
    },
    
    isLoading : function(){
    	return (this.status == this.statusTypes.LOADING);
    },
    
    updatePageInfo : function(title,url){
		var me = this;
		me.browser.updateTaskButtonTooltip(title,url);
		me.browser.updateTaskButtonText(title);
		me.browser.updateAddressValue(url);
	},
    
	getIframe : function(){
		return this.IframePanel.body.first('iframe', true);
	},
	
	getInnerIframe : function(){
		return this.getProxyWindow().document.getElementsByTagName("iframe")[0];
	},
	
	setURL : function(url){
		this.getIframe().src = this.proxyURL + url;
		this.url = url;
	},
	
	getURL : function(){
		return this.url;
	},
	
	setStatus : function(status){
		this.status = status;
	},
	
	getStatus : function(){
		return this.status;
	},
	
	getProxyWindow : function(){
		return this.getIframe().contentWindow;
	},
	
	stop : function(){
		var me = this;
		me.setIconCls('x-browser-page-icon');
		me.progressbar.reset();
		me.progressbar.updateProgress(0,'用户停止加载'+me.url);
		me.setStatus(me.statusTypes.STOP);
		me.getProxyWindow().stop();
	},
	
	refresh : function(){
		var me = this;
		me.access(me.url,true);
	},
	
	getHttpTitle : function(url,callbak,scope){
		var me = this;
		Ext.Ajax.request({
		    url: ctx+'/borwser/html',
		    params: {
		        url : url
		    },
		    success: function(response){
		    	callbak.call(scope,Ext.JSON.encode(response.responseText),url,true);
		    },
		    failure : function(){
		    	callbak.call(scope,'未知标题',url,true);
		    }
		});
	},
	
	access : function(url){
		var me = this;
		if(me.isLoading()){
			me.stop();
		}
		me.startLoadTime = new Date().getTime();
		/*if(!me.getIframe()){
			me.initIframe();
		}*/
		me.browser.address.onLoading();
		var record = me.browser.historys.getById(url + 'ID');
		if(record){
			record.set('date',new Date());
			me.doHttpAccess(record.data.title,url);
		}else{
			me.progressbar.wait({
				interval : 500,
				increment : 15,
				//text : '正在获取' + url + '的标题...'
				text : '正在连接服务器...'
			});
			me.getHttpTitle(url,me.doHttpAccess,me);
		}
	},
	
	doHttpAccess : function(object,url,newAccess){
		var me = this;
		/*if(newAccess){
			me.progressbar.updateText('正在加载' + url + '...');
			me.accessRecord = {
				id : url + 'ID',
				url : url,
				date : new Date(),
				title : title
			};
			me.browser.historys.add(me.accessRecord);
		}else{*/
			me.progressbar.wait({
				interval : 500,
				increment : 15,
				text : '正在加载' + url + '...'
			});
		//}
		me.setIconCls('x-browser-load-icon');
		me.setTitle(Ext.String.ellipsis(object.title,12,true));
		me.browser.updateTaskButtonText(me.title);
		me.browser.updateTaskButtonTooltip(object.title,url);
		me.IframePanel.update(object.html);
		me.setStatus(me.statusTypes.LOADING);
		me.setURL(url);
	}
});