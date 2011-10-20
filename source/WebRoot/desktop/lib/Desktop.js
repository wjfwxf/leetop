Ext.define('Leetop.lib.Desktop', {
    extend: 'Ext.panel.Panel',

    alias: 'widget.desktop',

    uses: [
        'Ext.util.MixedCollection',
        'Ext.menu.Menu',
        'Ext.view.View', // dataview
        'Ext.window.Window',

        'Leetop.lib.TaskBar',
        'Leetop.lib.Wallpaper',
        'Leetop.lib.FitAllLayout',
        'Ext.ux.DataView.DragSelector',
        'Ext.ux.DataView.LabelEditor',
        'Ext.ux.DataView.Draggable',
        'Ext.ux.DataView.Animated'
    ],

    activeWindowCls: 'ux-desktop-active-win',
    inactiveWindowCls: 'ux-desktop-inactive-win',
    lastActiveWindow: null,

    border: false,
    html: '&#160;',
    layout: 'fitall',

    xTickSize: 1,
    yTickSize: 1,

    app: null,

    shortcuts: null,
    
    shortcutItemSelector: 'div.ux-desktop-shortcut',
    
    labelSelector: 'ux-desktop-shortcut-text-inner',
    
    shortcutsRows : 9,
    
    shortcutsPadding : 70,
    
    ghostTpl: [
			//'<div class="ux-desktop-shortcut-column">',          
			'<tpl for=".">',
			        '<div class="ux-desktop-shortcut" id="{name}-shortcut">',
			            '<div class="ux-desktop-shortcut-icon {iconCls}">',
			                '<img src="',Ext.BLANK_IMAGE_URL,'" title="{name}">',
			            '</div>',
			            '<div class="ux-desktop-shortcut-text">',
			            	'<div class="ux-desktop-shortcut-text-inner">{name}</div>',
			            '</div>',
			            //'<span class="ux-desktop-shortcut-text">{name}</span>',
			        '</div>',
			        '<tpl if="xindex % 9 == 0">',
			        	'</div><div class="ux-desktop-shortcut-column">',
			        '</tpl>',   
			'</tpl>'
			//'</div>'
    ],


    taskbarConfig: null,

    windowMenu: null,

    initComponent: function () {
    	
        var me = this;

        me.windowMenu = new Ext.menu.Menu(me.createWindowMenu());
        me.quickStartMenu = new Ext.menu.Menu(me.createQuicStartMenu());
        me.startContextMenu = new Ext.menu.Menu(me.createStartContextMenu());
        me.bbar = me.taskbar = new Leetop.lib.TaskBar(me.taskbarConfig);
        me.taskbar.windowMenu = me.windowMenu;
        me.taskbar.quickStartMenu = me.quickStartMenu;
        me.taskbar.startMenu.startContextMenu = me.startContextMenu;
        

        me.windows = new Ext.util.MixedCollection();

        me.contextMenu = new Ext.menu.Menu(me.createDesktopMenu());
        me.shortCutItemMenu = new Ext.menu.Menu(me.createShortCutItemMenu());

        me.items = [
            { xtype: 'wallpaper', id: me.id+'_wallpaper' }/*,
            me.createDataView()*/
        ];
        
        me.callParent();

        var wallpaper = me.wallpaper;
        me.wallpaper = me.items.getAt(0);
        if (wallpaper) {
            me.setWallpaper(wallpaper, me.wallpaperStretch);
        }
        
        Ext.EventManager.onWindowResize(me.refreshView, this, {delay:100});
    },
    
    afterRender: function () {
        var me = this;
        me.callParent();
        me.el.on('contextmenu', me.onDesktopMenu, me);
    },
    
    initView : function(){
    	var me = this;
    	me.shortcutsRows = Math.floor((me.getHeight() - me.taskbar.getHeight()) / me.shortcutsPadding);
    	me.add(me.createDataView());
    	me.shortcutsView = me.items.getAt(1);
    	me.initShortcutEvent();
    },
    
    refreshView : function(){
    	var me = this;
    	me.shortcutsRows = Math.floor(me.shortcutsView.getHeight() / me.shortcutsPadding);
		me.shortcutsView.tpl = new Ext.XTemplate(me.createShortcutTpl());
		me.shortcutsView.refresh();
		me.initShortcutEvent();
    },
    
    createShortcutTpl : function(){
    	return [
	              '<div class="ux-desktop-shortcut-column">',          
	              '<tpl for=".">',
	      	            '<div class="ux-desktop-shortcut" id="{name}-shortcut">',
	      	                '<div class="ux-desktop-shortcut-icon {iconCls}">',
	      	                    '<img src="',Ext.BLANK_IMAGE_URL,'" title="{name}">',
	      	                '</div>',
	      	                '<div class="ux-desktop-shortcut-text">',
	      	                	'<div class="ux-desktop-shortcut-text-inner">{name}</div>',
	      	                '</div>',
	      	            '</div>',
	      	            '<tpl if="xindex % ' + this.shortcutsRows + ' == 0">',
	      	            	'</div><div class="ux-desktop-shortcut-column">',
	      	            '</tpl>',   
	              '</tpl>',
	              '</div>',
	              '<div class="x-clear"></div>'
    	      ];
    },
    
    initShortcutEvent : function(){
    	var me = this;
    	me.shortcutsView.on('itemdblclick', me.onShortcutItemClick, me);
        me.shortcutsView.on('itemcontextmenu', me.onShortcutItemMenu, me);
        var dd = new Ext.dd.DragDrop(me.shortcutsView.id, "dd");
        me.shortcutsView.all.each(function(node){
        	me.createShortcutDragSource(node);
        });
    },
    
    moveShortcut : function(target,source){
    	//var targetXY = target.getXY();
    	//var sourceXY = source.getXY();
    	//target.moveTo(sourceXY[0],sourceXY[1],true);
    	var me = this;
    	var sourceIndex = me.shortcutsView.indexOf(source);
    	var sourceRecord  = me.shortcutsView.store.getAt(sourceIndex);
    	if(target){
    		var targetIndex = me.shortcutsView.indexOf(target);
    		me.shortcutsView.store.remove(sourceRecord);
    		me.shortcutsView.store.insert(targetIndex,sourceRecord);
    	}else{
    		me.shortcutsView.store.remove(sourceRecord);
    		me.shortcutsView.store.add(sourceRecord);
    	}
    	me.initShortcutEvent();
    	//source.moveTo(targetXY[0],targetXY[1],true);
    },
    
    createShortcutDragSource : function(node){
    	var me = this;
    	var ds = new Ext.dd.DragSource(node.id, 
    		{ group: 'dd',
    		  animRepair : true,
    		  afterDragDrop : function(target, e, id) {
         	     var target = Ext.fly(e.getTarget(me.shortcutItemSelector)),source =  this.el;
        	     //if(target){
        	     		// me.moveShortcut(target,source);
        	    // }
        	     delete target;
    		  },
			  beforeDragDrop : function(target, e, id){
	        	     var target = Ext.fly(e.getTarget(me.shortcutItemSelector)),source =  this.el;
	        	     me.moveShortcut(target,source);
	        	     delete target;
				  //var proxy = this.proxy;
				  //alert(proxy.el.query('div.ux-desktop-shortcut ux-desktop-shortcut-over'));
			  },
			  getRepairXY : function(e,data){
				return [0,0];
			  }
    	});
    },
    
    createDataView: function () {
        var me = this;
        return {
            xtype: 'dataview',
            overItemCls: 'ux-desktop-shortcut-over',
            trackOver: true,
            itemSelector: me.shortcutItemSelector,
            store: me.shortcuts,
            multiSelect: true,
            tpl: new Ext.XTemplate(me.createShortcutTpl()),
            desktop : me,
            plugins: [
                      Ext.create('Ext.ux.DataView.DragSelector', {}),
                      Ext.create('Ext.ux.DataView.LabelEditor', {dataIndex: 'name',
                    	  										 labelSelector: me.labelSelector
                    	  										})
                      //Ext.create('Ext.ux.DataView.Animated')  										
                      //Ext.create('Ext.ux.DataView.Draggable', {})
                  ],
            listeners : {
            	//beforerefresh : me.initShortcutEvent,
            	//scope : me
            }
        };
    },
    
    createShortCutItemMenu : function(){
    	var me = this, ret = {
    			items : me.shortCutContextMenu || []
    	};
    	ret.items.push(
    		{ text : '打开(O)',
    		  scope : me ,
    		  handler : function(){
    			me.onShortcutItemClick(me.shortcutsView, me.contextMenuSelectedShortcut.record, me.contextMenuSelectedShortcut.item, me.contextMenuSelectedShortcut.index);
    		  }
    		},
    		{ text : '删除(D)',
    		  scope : me,
    		  handler: function(){
    			me.onShortcutItemRemove(me.contextMenuSelectedShortcut.record);
    		  }
    		},
    		'-',
    		{ text : '重命名(M)',
    		  sope : me,
    		  handler : function(){
    			me.onShortcutItemRename(me.contextMenuSelectedShortcut.record,me.contextMenuSelectedShortcut.item);
    		  }
    		},
    		{ text : '添加到',
    		  menu : [{
    			  text : '快速启动栏(Q)',
    			  sope : me,
    			  handler : function(){
        			  me.onShortcutAddToQuickStart(me.contextMenuSelectedShortcut.record);
        		  }
    		  },{
    			  text : '开始菜单栏(S)',
    			  sope : me,
    			  handler : function(){
    				  me.onShortcutAddToStartMenu(me.contextMenuSelectedShortcut.record);
    			  }
    		  }]
    		  
    		},'-',
    		{ text : '属性(R)',sope : me}
    	);
    	return ret;
    },

    createDesktopMenu: function () {
        var me = this, ret = {
            items: me.contextMenuItems || []
        };

		ret.items.push([{text : '查看',
	       					menu : [{text : '图标'
	       							},{
	       							  text : '卡片'
	       						   }]
	       					},
	       				  {text: '窗口布局',
	       				   iconCls : 'icon-layout-shortcut',
		    			   menu:[{ text: '平铺', 
		    			   		 iconCls : 'icon-title-shortcut',
		    				 	 handler: me.tileWindows, 
		    				 	 scope: me, 
		    				 	 minWindows: 1 
		    				 },{ text: '重叠', 
		    				 	 iconCls : 'icon-cascade-shortcut',
		    					 handler: me.cascadeWindows, 
		    				     scope: me, 
		    				     minWindows: 1 
		    				 }
		    			   ]},
		    			   {   text: '排序方式',
		    			   	   iconCls : 'icon-sort-shortcut',
		        			   menu:[{ text: '名称', 
		      				 	 handler: function(){
		      				 		 me.sortShortCut('name');
		      				 	 }, 
		      				 	 scope: me
		      				 },{ text: '时间', 
		      					handler: function(){
		     				 		 me.sortShortCut('iconCls');
		     				 	 },
		      				     scope: me
		      				 },{ text: '类型', 
		      					 handler: function(){
		      						me.sortShortCut('module');
		      					 },
		      				     scope: me
		      				 },{ text: '位置', 
		      					 handler: function(){
		      						me.sortShortCut('index');
		      					 },
		      				     scope: me
		      				 }]
		      				}]);
		ret.items.push({text : '刷新',
						iconCls : 'icon-refresh',
						menu : [{
		    				text : '桌面',
		    				handler : me.refreshDesktop,
		    				scope: me
		    			},{
		    				text : '页面',
		    				handler : function(){
		    					window.location.reload();
		    				},
		    				scope: me
		    			}]}
            );
		ret.items.push('-'); 
        ret.items.push([{text: '新建',
			        	 menu:[{   text: '文件夹',
			        	 		   iconCls : 'icon-folder',
			        	 		   handler : function(){
			        	 		   		me.shortcutsView.store.add({
			        	 		   			name : '新建文件夹',
			        	 		   			iconCls : 'folder-shortcut',
			        	 		   			handler : function(){
			        	 		   				Ext.Msg.alert('这是一个文件夹!');
			        	 		   			}
			        	 		   		})
			        	 		   },
		  				 	  	   scope: me
			      			   },{ text: '文档',
			      			       iconCls : 'icon-word',
			      				   scope: me
			      			   },{ text: '表格', 
			      			       iconCls : 'icon-excel',
			      				   scope: me
			      			   },{ text: '演示文稿', 
			      			       iconCls : 'icon-ppt',
			      				   scope: me
			      			}]
			      		},{   text: '添加',
			        		  menu:[{ text: '应用程序',
			        		  		  iconCls : 'icon-app',
			      				 	  scope: me
					      			},{ text: '网址', 	
					      				iconCls : 'icon-net-address',
					      				scope: me
					      			}]
			      		}]);
  		ret.items.push('-');		
        ret.items.push({ text: '个性化', 
        				 iconCls : 'icon-personality',
         				 handler: me.app.onSettings, 
         				 scope: me.app 
         			}
            );
         
        return ret;
    },
    
    sortShortCut : function(p){
    	var me = this;
    	if(me.sortType == 'ASC' &&  p == me.sortField){
    		me.shortcutsView.store.sort(p, 'DESC');
    		me.sortType = 'DESC';
    	}else{
    		me.shortcutsView.store.sort(p, 'ASC');
    		me.sortType = 'ASC';
    	}
    	me.sortField = p;
    	me.initShortcutEvent();
    },

    createWindowMenu: function () {
        var me = this;
        return {
            defaultAlign: 'br-tr',
            items: [
                { text: '初始化', 
                  handler: me.onWindowMenuRestore, 
                  scope: me },
                { text: '最小化', 
                  handler: me.onWindowMenuMinimize, 
                  scope: me },
                { text: '最大化', 
                  handler: me.onWindowMenuMaximize, 
                  scope: me 
                },'-',
                { text: '关&nbsp;&nbsp;&nbsp;&nbsp;闭', 
                  handler: me.onWindowMenuClose, 
                  scope: me 
                }
            ],
            listeners: {
                beforeshow: me.onWindowMenuBeforeShow,
                hide: me.onWindowMenuHide,
                scope: me
            }
        };
    },
    
    createQuicStartMenu: function () {
        var me = this;
        return {
            defaultAlign: 'br-tr',
            items: [
                /*{ text: '打开', 
                  handler: function(){
                	  me.onQuickStartBtnClick(me.quickStartMenu.theBtn);
                  }, 
                  scope: me 
                },*/{ 
                   text: '从快速启动栏中移除', 
                   handler: function(){
                	   me.onQuickStartBtnRemove(me.quickStartMenu.theBtn);
                   },
                   scope: me 
                }
            ]
        };
    },
    
    createStartContextMenu: function () {
        var me = this;
        return {
            defaultAlign: 'br-tr',
            items: [
                { text: '打开', 
                  handler: function(){
                	  me.onQuickStartBtnClick(me.quickStartMenu.theBtn);
                  }, 
                  scope: me 
                },{ 
                   text: '移除', 
                   handler: function(){
                	   me.onQuickStartBtnRemove(me.quickStartMenu.theBtn);
                   },
                   scope: me 
                }
            ]
        };
    },

    //------------------------------------------------------
    // Event handler methods

    onQuickStartBtnClick : function(btn){
    	if(Ext.isFunction(btn.handler)){
    		Ext.Function.defer(btn.handler,1,btn.scope);
    	}
    },
    
    onQuickStartBtnRemove : function(btn){
    	var me = this;
    	me.taskbar.quickStart.remove(btn);
    	me.taskbar.quickStart.doLayout();
    },
    onDesktopMenu: function (e) {
        var me = this, menu = me.contextMenu;
        e.stopEvent();
        if (!menu.rendered) {
            menu.on('beforeshow', me.onDesktopMenuBeforeShow, me);
        }
        menu.showAt(e.getXY());
        menu.doConstrain();
    },

    onDesktopMenuBeforeShow: function (menu) {
        var me = this, count = me.windows.getCount();
        menu.items.get(1).menu.items.each(function (item) {
            var min = item.minWindows || 0;
            item.setDisabled(count < min);
        });
    },

    onShortcutItemRemove : function(record){
    	var me = this;
    	Ext.Msg.show({
    			title : '系统提示', 
    			msg : '您确定要删除'+record.data.name+'么?',
    			icon : Ext.Msg.QUESTION, 
    			fn : function(btn){
    				if(btn == 'ok'){
    					me.shortcutsView.store.remove(record);
    					me.initShortcutEvent();
    				}
    			}, 
    			buttons: Ext.Msg.OKCANCEL
    	});
    },
    
    onShortcutItemRename : function(record,item){
    	var me = this,shortcut = Ext.fly(Ext.fly(item).first('div.ux-desktop-shortcut-text')).first('div.'+me.labelSelector)
    	,editor = me.shortcutsView.plugins[1];
    	if(shortcut){
    		editor.startEdit(shortcut, record.data[editor.dataIndex]);
    		editor.activeRecord = record;
    		//me.shortcutsView.fireEvent(new Ext.EventObject(),shortcut);
    	}
    },
    
    onShortcutItemClick: function (dataView, record,item,index) {
        var me = this, module = me.app.getModule(record.data.module),
            win = module && module.createWindow(record.data.iconCls);
        if (win) {
            me.restoreWindow(win);
        }
        dataView.getSelectionModel().deselect(index);
    },
    
    onShortcutAddToQuickStart: function(record){
    	var me = this;
    	me.taskbar.quickStart.add(
    		{ name: record.data.name, 
    		  iconCls: me.createSmallIconCls(record.data.iconCls), 
    		  module: record.data.module/*,
    		  handler: me.taskbar.onQuickStartClick,
	          scope: me.taskbar*/
    		}
    	);
    	
    	me.taskbar.quickStart.doLayout();
    },
    
    onShortcutAddToStartMenu: function(record){
    	var me = this;
    	me.taskbar.startMenu.menu.add(
    		{ text: record.data.name, 
    		  iconCls: me.createSmallIconCls(record.data.iconCls),
    		  module: record.data.module/*,
    		  handler: me.taskbar.onQuickStartClick,
	          scope: me.taskbar*/
    		}
    	);
    	
    	me.taskbar.startMenu.menu.doLayout();
    },
    
    /**
     * 菜单展现之前，设定右键选择的图标的样式
     * */
    onShortcutItemMenuBeforeShow : function(){
    	//TODO 还可以继续优化
    	if(!this.shortcutsView.getSelectionModel().isSelected(this.contextMenuSelectedShortcut.index)){
    		this.contextMenuSelectedShortcut.item.className = 'ux-desktop-shortcut-selected';
    	}else{
    		this.shortcutsView.getSelectionModel().deselectAll();
    		this.shortcutsView.getSelectionModel().select(this.contextMenuSelectedShortcut.index);
    	}
    },
    
    /**
     * 菜单隐藏后，取消所有图标的选择
     * */
    onShortcutItemMenuHide : function(){
    		this.shortcutsView.getSelectionModel().deselectAll();
    		this.contextMenuSelectedShortcut.item.className = 'ux-desktop-shortcut';
    },
    
    /***
     * 点击图标右键菜单
     * */
    onShortcutItemMenu: function (dataView, record ,item,index,e) {
        var me = this, menu = me.shortCutItemMenu;
        me.contextMenuSelectedShortcut = {
        		record : record,
        		item : item,
        		index : index
        };
        if (!menu.rendered) {
            menu.on('beforeshow', me.onShortcutItemMenuBeforeShow, me);
        }
        //dataView.getSelectionModel().select(index,true);
        menu.on('deactivate', me.onShortcutItemMenuHide, me);

        e.stopEvent();
        menu.showAt(e.getXY());
        menu.doConstrain();
    },

    onWindowClose: function(win) {
        var me = this;
        me.windows.remove(win);
        me.taskbar.removeTaskButton(win.taskButton);
        me.updateActiveWindow();
    },

    //------------------------------------------------------
    // Window context menu handlers

    onWindowMenuBeforeShow: function (menu) {
        var items = menu.items.items, win = menu.theWin;
        items[0].setDisabled(win.maximized !== true && win.hidden !== true); // Restore
        items[1].setDisabled(win.minimized === true); // Minimize
        items[2].setDisabled(win.maximized === true || win.hidden === true || !win.maximiable === true); // Maximize
    },

    onWindowMenuClose: function () {
        var me = this, win = me.windowMenu.theWin;

        win.close();
    },

    onWindowMenuHide: function (menu) {
        menu.theWin = null;
    },

    onWindowMenuMaximize: function () {
        var me = this, win = me.windowMenu.theWin;
        if(win.maximizable){
        	win.maximize();
        }
    },

    onWindowMenuMinimize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.minimize();
    },

    onWindowMenuRestore: function () {
        var me = this, win = me.windowMenu.theWin;

        me.restoreWindow(win);
    },

    //------------------------------------------------------
    // Dynamic (re)configuration methods

    refreshDesktop : function(){
    	var me = this;
    	//this.shortcutsView.getSelectionModel().deselectAll();
    	//this.shortcutsView.refresh();
    	me.el.mask('正在刷新页面...');
    	me.shortcutsView.store.loadData(me.app.shortcutsData);
    	me.shortcutsView.store.sort('index', 'ASC');
    	me.el.unmask();
    },
    getWallpaper: function () {
        return this.wallpaper.wallpaper;
    },

    setTickSize: function(xTickSize, yTickSize) {
        var me = this,
            xt = me.xTickSize = xTickSize,
            yt = me.yTickSize = (arguments.length > 1) ? yTickSize : xt;

        me.windows.each(function(win) {
            var dd = win.dd, resizer = win.resizer;
            dd.xTickSize = xt;
            dd.yTickSize = yt;
            resizer.widthIncrement = xt;
            resizer.heightIncrement = yt;
        });
    },

    setWallpaper: function (wallpaper, stretch) {
        this.wallpaper.setWallpaper(wallpaper, stretch);
        return this;
    },

    //------------------------------------------------------
    // Window management methods

    cascadeWindows: function() {
        var x = 0, y = 0,
            zmgr = this.getDesktopZIndexManager();

        zmgr.eachBottomUp(function(win) {
            if (win.isWindow && win.isVisible() && !win.maximized) {
                win.setPosition(x, y);
                x += 20;
                y += 20;
            }
        });
    },

    createWindow: function(config, cls) {
        var me = this, win, cfg = Ext.applyIf(config || {}, {
                stateful: false,
                isWindow: true,
                constrainHeader: true,
                minimizable: true,
                maximizable: true
            });

        cls = cls || Ext.window.Window;
        win = me.add(new cls(cfg));

        me.windows.add(win);

        win.taskButton = me.taskbar.addTaskButton(win);
        win.animateTarget = win.taskButton.el;

        win.on({
            activate: me.updateActiveWindow,
            beforeshow: me.updateActiveWindow,
            deactivate: me.updateActiveWindow,
            minimize: me.minimizeWindow,
            destroy: me.onWindowClose,
            scope: me
        });

        win.on({
            afterrender: function () {
                win.dd.xTickSize = me.xTickSize;
                win.dd.yTickSize = me.yTickSize;

                if (win.resizer) {
                    win.resizer.widthIncrement = me.xTickSize;
                    win.resizer.heightIncrement = me.yTickSize;
                }
            },
            single: true
        });

        // replace normal window close w/fadeOut animation:
        win.doClose = function ()  {
            win.el.disableShadow();
            win.el.fadeOut({
                listeners: {
                    afteranimate: function () {
                        win.destroy();
                    }
                }
            });
        };

        return win;
    },

    getActiveWindow: function () {
        var win = null,
            zmgr = this.getDesktopZIndexManager();

        if (zmgr) {
            // We cannot rely on activate/deactive because that fires against non-Window
            // components in the stack.

            zmgr.eachTopDown(function (comp) {
                if (comp.isWindow && !comp.hidden) {
                    win = comp;
                    return false;
                }
                return true;
            });
        }

        return win;
    },

    getDesktopZIndexManager: function () {
        var windows = this.windows;
        // TODO - there has to be a better way to get this...
        return (windows.getCount() && windows.getAt(0).zIndexManager) || null;
    },

    getWindow: function(id) {
        return this.windows.get(id);
    },

    minimizeWindow: function(win) {
        win.minimized = true;
        win.hide();
    },

    restoreWindow: function (win) {
        if (win.isVisible()) {
            win.restore();
            win.toFront();
        } else {
            win.show();
        }
        return win;
    },

    tileWindows: function() {
        var me = this, availWidth = me.body.getWidth(true);
        var x = me.xTickSize, y = me.yTickSize, nextY = y;

        me.windows.each(function(win) {
            if (win.isVisible() && !win.maximized) {
                var w = win.el.getWidth();

                // Wrap to next row if we are not at the line start and this Window will
                // go off the end
                if (x > me.xTickSize && x + w > availWidth) {
                    x = me.xTickSize;
                    y = nextY;
                }

                win.setPosition(x, y);
                x += w + me.xTickSize;
                nextY = Math.max(nextY, y + win.el.getHeight() + me.yTickSize);
            }
        });
    },

    updateActiveWindow: function () {
        var me = this, activeWindow = me.getActiveWindow(), last = me.lastActiveWindow;
        if (activeWindow === last) {
            return;
        }
        if (last) {
            if (last.el.dom) {
                last.addCls(me.inactiveWindowCls);
                last.removeCls(me.activeWindowCls);
            }
            last.active = false;
        }

        me.lastActiveWindow = activeWindow;

        if (activeWindow) {
            activeWindow.addCls(me.activeWindowCls);
            activeWindow.removeCls(me.inactiveWindowCls);
            activeWindow.minimized = false;
            activeWindow.active = true;
        }

        me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
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
    }
});
