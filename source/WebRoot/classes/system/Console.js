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
	
	showWhenUpdate : true,
	
	log : '',
	
	initComponent : function(){
		var me = this;
		me.tbar = ['->',{
			text : '清空控制台',
			handler : function(){
				me.log = '';
				me.console.update('');
			}
		},'-',{
			text : '输出发生变化时弹出'
		},'-',{
			text : '输出发生错误时弹出'
		}];
		me.console = Ext.create('Ext.panel.Panel',{
			            bodyCls : 'ux-console-body',
			            autoScroll : true/*,
			            html : '<p>Leetop,基于Ext的WEB桌面程序</p><p>版权所有 &copy Leetp项目组. 保留所有权利.</p>'*/
					});
		me.items = [me.console];
		me.callParent();
	},
	
	updateConsole : function(text){
		var me = this;
		me.log += me.formatText(text);
		me.console.update(me.log);
		me.console.body.dom.scrollTop = me.console.body.dom.scrollHeight;
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