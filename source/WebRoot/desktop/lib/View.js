Ext.define('Leetop.lib.View', {
    extend: 'Ext.view.View',
    alias: 'widget.desktopview',
    uses : [
	        'Ext.ux.DataView.DragSelector',
	        'Ext.ux.DataView.LabelEditor',
	        'Ext.ux.DataView.Draggable',
	        'Ext.ux.DataView.Animated'
        ],
        
   itemSelector: 'div.ux-desktop-shortcut',
   
   labelSelector: 'ux-desktop-shortcut-text-inner',
   
   shortcutsPadding : 70,
   
   overItemCls: 'ux-desktop-shortcut-over',
   
   trackOver: true,
   
   multiSelect: true,
   
   shortcutsCols : 9,
   
   initComponent : function(){
   		 var me = this;
   		 me.shortCutItemMenu = new Ext.menu.Menu(me.createShortCutContextMenu());
   		 me.tpl = new Ext.XTemplate(me.createShortcutTpl());
   		 me.dragSelector = Ext.create('Ext.ux.DataView.DragSelector');
   	     me.editor = Ext.create('Ext.ux.DataView.LabelEditor', {dataIndex: 'name',labelSelector: me.labelSelector});
   		 me.plugins = [me.dragSelector,me.editor];//Ext.create('Ext.ux.DataView.Animated'),//Ext.create('Ext.ux.DataView.Draggable', {})
		 me.callParent();
   },
   
   init : function(){
   		var me = this;
		me.initShortcutEvent();
   },
   
   refresh : function(){
   		var me = this;
		me.tpl = new Ext.XTemplate(me.createShortcutTpl());
		me.callParent();
		me.initShortcutEvent();
   },
   
   sortShortCut : function(p){
    	var me = this;
    	if(me.sortType == 'ASC' &&  p == me.sortField){
    		me.store.sort(p, 'DESC');
    		me.sortType = 'DESC';
    	}else{
    		me.store.sort(p, 'ASC');
    		me.sortType = 'ASC';
    	}
    	me.sortField = p;
    	me.initShortcutEvent();
    },
    
   createShortcutTpl : function(){
   		var me = this;
   		me.shortcutsCols = Math.floor((me.desktop.getHeight() - me.desktop.taskbar.getHeight()) / me.shortcutsPadding);
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
	      	            '<tpl if="xindex % ' + me.shortcutsCols + ' == 0">',
	      	            	'</div><div class="ux-desktop-shortcut-column">',
	      	            '</tpl>',   
	              '</tpl>',
	              '</div>',
	              '<div class="x-clear"></div>'
    	      ];
    },
    
     onShortcutsRemove : function(record){
    	var me = this,record = me.getSelectedRecords()[0];
    	Ext.Msg.show({
    			title : '系统提示', 
    			msg : '您确定要删除'+record.data.name+'么?',
    			icon : Ext.Msg.QUESTION, 
    			fn : function(btn){
    				if(btn == 'ok'){
    					me.store.remove(record);
    					me.initShortcutEvent();
    				}
    			}, 
    			buttons: Ext.Msg.OKCANCEL
    	});
    },
    
    onShortcutsRename : function(record,item){
    	var me = this,record = me.getSelectedRecords()[0],item = me.getSelectedNodes()[0],
    	shortcut = Ext.fly(Ext.fly(item).first('div.ux-desktop-shortcut-text')).first('div.'+me.labelSelector);
    	if(shortcut){
    		me.editor.startEdit(shortcut, record.data[me.editor.dataIndex]);
    		me.editor.activeRecord = record;
    		//me.fireEvent(new Ext.EventObject(),shortcut);
    	}
    },
    
    onShortcutsClick: function () {
        var me = this,record = me.getSelectedRecords()[0],
           module = me.app.getModule(record.data.module),
            win = module && module.createWindow();
        if (win) {
            me.desktop.restoreWindow(win);
        }
        me.getSelectionModel().deselect(index);
    },
    
    onShortcutApplyToQuickStart: function(){
    	var me = this,record = me.getSelectedRecords()[0];
    	me.desktop.taskbar.quickStart.add(
    		{ name: record.data.name, 
    		  iconCls: me.app.createSmallIconCls(record.data.iconCls), 
    		  module: record.data.module/*,
    		  handler: me.desktop.taskbar.onQuickStartClick,
	          scope: me.desktop.taskbar*/
    		}
    	);
    	
    	me.desktop.taskbar.quickStart.doLayout();
    },
    
    onShortcutApplyToStartMenu: function(){
    	var me = this,record = me.getSelectedRecords()[0];
    	me.desktop.taskbar.startMenu.menu.add(
    		{ text: record.data.name, 
    		  iconCls: me.app.createSmallIconCls(record.data.iconCls),
    		  module: record.data.module/*,
    		  handler: me.desktop.taskbar.onQuickStartClick,
	          scope: me.desktop.taskbar*/
    		}
    	);
    	
    	me.desktop.taskbar.startMenu.menu.doLayout();
    },
    
    /**
     * 菜单展现之前，设定右键选择的图标的样式
     * */
    onShortcutsMenuBeforeShow : function(){
    	//TODO 还可以继续优化
    	if(!this.getSelectionModel().isSelected(this.selectedShortcut.index)){
    		this.selectedShortcut.item.className = 'ux-desktop-shortcut-selected';
    	}else{
    		this.getSelectionModel().deselectAll();
    		this.getSelectionModel().select(this.selectedShortcut.index);
    	}
    },
    
    /**
     * 菜单隐藏后，取消所有图标的选择
     * */
    onShortcutsMenuHide : function(){
    		this.getSelectionModel().deselectAll();
    		this.selectedShortcut.item.className = 'ux-desktop-shortcut';
    },
    
    /***
     * 点击图标右键菜单
     * */
    onShortcutsMenu: function (dataView, record ,item,index,e) {
        var me = this, menu = me.shortCutItemMenu;
        me.getSelectionModel().deselectAll();
        me.getSelectionModel().select(record);
        if (!menu.rendered) {
            //menu.on('beforeshow', me.onShortcutsMenuBeforeShow, me);
        }
        //dataView.getSelectionModel().select(index,true);
        //menu.on('deactivate', me.onShortcutsMenuHide, me);
        e.stopEvent();
        menu.showAt(e.getXY());
        menu.doConstrain();
    },
    
    createShortCutContextMenu : function(){
    	var me = this, ret = {
    			items : me.desktop.shortCutContextMenu || []
    	};
    	ret.items.push(
    		{ text : '打开(O)',
    		  scope : me ,
    		  handler : function(){
    			me.onShortcutsClick();
    		  }
    		},
    		{ text : '删除(D)',
    		  scope : me,
    		  handler: function(){
    			me.onShortcutsRemove();
    		  }
    		},
    		'-',
    		{ text : '重命名(M)',
    		  sope : me,
    		  handler : function(){
    			me.onShortcutsRename();
    		  }
    		},
    		{ text : '添加到',
    		  menu : [{
    			  text : '快速启动栏(Q)',
    			  sope : me,
    			  handler : function(){
        			  me.onShortcutApplyToQuickStart();
        		  }
    		  },{
    			  text : '开始菜单栏(S)',
    			  sope : me,
    			  handler : function(){
    				  me.onShortcutApplyToStartMenu();
    			  }
    		  }]
    		  
    		},'-',
    		{ text : '属性(R)',sope : me}
    	);
    	return ret;
    },
    
        
    initShortcutEvent : function(){
    	var me = this;
    	me.on('itemdblclick', me.onShortcutsClick, me);
        me.on('itemcontextmenu', me.onShortcutsMenu, me);
        var dd = new Ext.dd.DragDrop(me.id, "dd");
        me.all.each(function(node){
        	me.initShortcutsDD(node);
        });
    },
    
    moveShortcut : function(target,source){
    	var me = this;
    	var sourceIndex = me.indexOf(source);
    	var sourceRecord  = me.store.getAt(sourceIndex);
    	if(target){
    		var targetIndex = me.indexOf(target);
    		me.store.remove(sourceRecord);
    		me.store.insert(targetIndex,sourceRecord);
    	}else{
    		me.store.remove(sourceRecord);
    		me.store.add(sourceRecord);
    	}
    	me.initShortcutEvent();
    },
    
    initShortcutsDD : function(node){
    	var me = this;
    	var ds = new Ext.dd.DragSource(node.id, 
    		{ group: 'dd',
    		  animRepair : true,
    		  afterDragDrop : function(target, e, id) {
         	     var target = Ext.fly(e.getTarget(me.itemSelector)),source =  this.el;
        	     delete target;
    		  },
			  beforeDragDrop : function(target, e, id){
	        	     var target = Ext.fly(e.getTarget(me.itemSelector)),source =  this.el;
	        	     me.moveShortcut(target,source);
	        	     delete target;
			  },
			  getRepairXY : function(e,data){
				return [0,0];
			  }
    	});
    }
});