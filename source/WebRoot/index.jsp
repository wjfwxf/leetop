<%@ page language="java" pageEncoding="UTF-8" import="java.net.InetAddress" %>
<%
	request.setAttribute("ctx",request.getContextPath());
	request.setAttribute("theme","ext-all");
	request.setAttribute("isDebug","-debug");
%>
<html>
  <head>
	<title>系统桌面</title>
	<script type="text/javascript" src="${ctx}/classes/system/Bootstrap.js"></script>
	<script>
		var startLoadingTime = new Date().getTime(),
			ctx = "${ctx}",theme = "${theme}";
		Leetop.Bootstrap.loadCallback = function(){
			Ext.Loader.setConfig({
	    		enabled: true
	    	});
	        Ext.Loader.setPath({
	            "Ext" : "${ctx}/lib/ext4",
	            "Leetop" : "${ctx}/classes"
	        });
	        Ext.Loader.require(["Leetop.system.logger.LoggerFactory",
			                    "Leetop.desktop.Desktop",
			                    "Leetop.system.Console"
			                   ]);
	        
	        Ext.onReady(function () {
	        	Ext.MessageBox.show({
	                title : "正在加载桌面, 请稍候...",
	                msg: "<br/>加载系统基础组件....",
	                progressText: "20%",
	                width:300,
	                progress:true,
	                closable:false,
	                icon:"ext-mb-download"
	            });
	        	Ext.MessageBox.updateProgress(0.2);
	        	Leetop.Desktop = Ext.create("Leetop.desktop.Desktop",{
	            	user : "李球"
	            });
	        	Leetop.getLogger = function(){
	        		return Leetop.system.logger.LoggerFactory.getLogger(arguments[0]);
	        	};
	        	Leetop.Console = Ext.create("Leetop.system.Console");
	            window.setTimeout(function(){
	            	Ext.MessageBox.hide();
	            },1000); 
	        });
		};
		Leetop.Bootstrap.loadRequires([{
			type : Leetop.Bootstrap.resTypes.SHORTCUT,
			url : ctx + "/classes/resources/images/taskbar/favicon.ico"
		  },{
			id : "themecss",
			type : Leetop.Bootstrap.resTypes.CSS,
			url : ctx + "/lib/ext4/resources/css/"+ theme +".css"
		  },{
			id : "desktopcss",
			type : Leetop.Bootstrap.resTypes.CSS,
			url : ctx + "/classes/resources/css/desktop.css" 
		  },{
			id : "shortcutcss",
			type : Leetop.Bootstrap.resTypes.CSS,
			url : ctx + "/classes/resources/css/shortcut.css"
		  },{
			id : "iconcss",
			type : Leetop.Bootstrap.resTypes.CSS,
			url : ctx + "/classes/resources/css/icon.css"
		  },{
			type : Leetop.Bootstrap.resTypes.JAVASCRIPT,
			url : ctx + "/lib/ext4/ext-all${isDebug}.js"
		  },{
			type : Leetop.Bootstrap.resTypes.JAVASCRIPT,
			url : ctx + "/lib/ext4/locale/ext-lang-zh_CN.js"
		  }]);
    </script>
</head>
<body>

    <a href="http://leetop.5d6d.com/" target="_blank" alt="Powered by Ext JS"
       id="poweredby" >
       <div>
       </div>
   </a>
</body>
</html>
