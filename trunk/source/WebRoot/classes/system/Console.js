Ext.define('Leetop.system.Console',{
	extend : 'Ext.window.Window',
	
	uses: [ 
	        'Leetop.desktop.FitAllLayout'
   	],
	
	title : '控制台',
	
	iconCls : 'icon-console',
	
	layout: 'fitall',
	
	height : 450,
	
	width : 700,
	
	borde : false,
	
	closeAction : 'hide',
	
	plain:true,
	
	showWhenUpdate : false,
	
	showWhenError : false,
	
	log : [],
	
	lockScroll : false,
	
	initComponent : function(){
		var me = this;
		me.tbar = ['->',{
			iconCls : 'icon-console-clear',
			text : '清空控制台',
			tooltip : '清空控制台',
			handler : function(){
				me.log = [];
				me.console.update('');
			}
		},'-',{
			iconCls : 'icon-console-update-show',
			text : '输出发生变化时弹出',
			tooltip : '输出发生变化时弹出',
			enableToggle : true,
			toogle : me.showWhenUpdate,
			listeners : {
				toggle : function(btn,toggle){
					if(toggle){
						me.showWhenUpdate = true;
					}else{
						me.showWhenUpdate = false;
					}
				}
			}
		},'-',{
			iconCls : 'icon-console-error-show',
			text : '输出发生错误时弹出',
			tooltip : '输出发生错误时弹出',
			enableToggle : true,
			toogle : me.showWhenError,
			listeners : {
				toggle : function(btn,toggle){
					if(toggle){
						me.showWhenError = true;
					}else{
						me.showWhenError = false;
					}
				}
			}
		},'-',{
			iconCls : 'icon-console-lock',
			text : '锁定滚动',
			tooltip : '锁定滚动',
			enableToggle : true,
			listeners : {
				toggle : function(btn,toggle){
					if(toggle){
						this.setIconCls('icon-console-unlock');
						this.setText('解除锁定');
						this.setTooltip('解除锁定');
						me.lockScroll = true;
					}else{
						this.setIconCls('icon-console-lock');
						this.setText('锁定滚动');
						this.setTooltip('锁定滚动');
						me.lockScroll = false;
					}
				}
			}
		}];
		me.console = Ext.create('Ext.panel.Panel',{
			            bodyCls : 'ux-console-body',
			            autoScroll : true/*,
			            html : '<p>Leetop,基于Ext的WEB桌面程序</p><p>版权所有 &copy Leetp项目组. 保留所有权利.</p>'*/
					});
		me.items = [me.console];
		me.callParent();
		me.on('show',me.onShow,me);
	},
	
	onShow : function(){
		var me = this;
		me.console.body.dom.scrollTop = me.console.body.dom.scrollHeight;
	},
	
	updateConsole : function(text){
		var me = this;
		me.log.push(me.formatText(text));
		me.console.update(me.log.join(""));
		if(!me.lockScroll){
			if(me.console.body){
				me.console.body.dom.scrollTop = me.console.body.dom.scrollHeight;
			}
		}
		if(me.showWhenUpdate){
			if(me.isHidden()){
				me.show();
			}else{
				me.toFront();
			}
		}
		
	},
	
	formatText : function(text){
		return '<p>' + text + '</p>';
	}
});