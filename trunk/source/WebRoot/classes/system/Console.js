Ext.define('Leetop.system.Console',{
	
	extend : 'Leetop.system.Module',
	
	init : function(){
		var me = this;
		if(!me.win){
			me.initWindow();
		}
	},
	
	open : function(){
		var me = this;
		if(!me.win){
			me.initWindow();
		}
		me.win.show();
	},
	
	initWindow : function(){
		var me = this;
		me.console = Ext.create('Ext.panel.Panel',{
	            bodyCls : 'ux-console-body',
	            autoScroll : true,
	            html : me.output.join('')
			});
			me.win = Ext.create('Ext.window.Window',{
				title : '控制台',
				iconCls : 'icon-console',
				layout: 'fit',
				height : 450,
				width : 700,
				borde : false,
				closeAction : 'hide',
				plain:true,
				tbar : ['->',{
					iconCls : 'icon-console-clear',
					text : '清空控制台',
					tooltip : '清空控制台',
					handler : function(){
						me.output = [];
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
								me.scrollConsole();
							}
						}
					}
				}],
				items : [me.console],
				listeners : {
					show : me.onShow,
					scope : me
				}
			});
			return me.win;
	},
	
	showWhenUpdate : false,
	
	showWhenError : false,
	
	output : [],
	
	lockScroll : false,
	
	scrollConsole : function(){
		var me = this;
		if(me.console.body){
			me.console.body.dom.scrollTop = me.console.body.dom.scrollHeight;
		}
	},
	
	onShow : function(){
		var me = this;
		me.console.body.dom.scrollTop = me.console.body.dom.scrollHeight;
	},
	
	println : function(output){
		var me = this;
		me.output.push(me.format(output));
		me.console.update(me.output.join(''));
		if(!me.lockScroll){
			me.scrollConsole();
		}
		if(me.showWhenUpdate){
			if(me.win.isHidden()){
				me.win.show();
			}else{
				me.win.toFront();
			}
		}
	},
	
	format: function(output){
		return '<p>' + output + '</p>';
	}
});