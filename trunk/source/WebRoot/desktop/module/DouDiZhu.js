
Ext.define('Leetop.module.DouDiZhu', {
    extend: 'Leetop.lib.Module',

    id:'qq_doudizhu',
    windowId: 'qq_doudizhu_win',

    tipWidth: 160,
    tipHeight: 96,

    init : function(){
        this.launcher = {
            text: '欢乐斗地主',
            handler : this.createWindow,
            scope: this
        };
    },

    createWindow : function(){
        var me = this, desktop = me.app.getDesktop(),
            win = desktop.getWindow(me.windowId);

        if (!win) {
            win = desktop.createWindow({
                id: me.windowId,
                title: '欢乐斗地主',
                iconCls : me.app.createSmallIconCls('plugin-shortcut'),
                width: desktop.view.getWidth() -100,
                height: desktop.view.getHeight() -50,
                animCollapse: false,
                maximizable : true,
                border: false,
                layout: 'fit',
                items: [
                    {
                    	xtype : 'panel',
                    	html : '<iframe id="qqmap_iframe" scrolling="auto" ' + 
                    		'frameborder="no" hidefocus="" allowtransparency="true" ' + 
                    		'src="http://yxs.qq.com/"' +  
                    		'style="width: 100%; height: 100%;">'
                    }
                ],
                listeners : {
                	'afterrender' : function(){
                		var panel = win.items.get(0);
                		panel.el.mask('正在欢乐斗地主,请稍候...');
                		panel.body.first('iframe', true).onload = function(){
                			panel.el.unmask();
                		};
                	}
                }
            });
        }

        win.show();
        //win.maximize();

        return win;
    }
});
