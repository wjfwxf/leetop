<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	request.setAttribute("ctx",request.getContextPath());
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>系统桌面</title>
	<script>
		var startLoadingTime = new Date().getTime();
	</script>
	<link rel="shortcut icon" href="${ctx}/desktop/resources/images/taskbar/favicon.ico"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/desktop/resources/css/desktop.css" />
    <link rel="stylesheet" type="text/css" href="${ctx}/desktop/resources/css/shortcut.css" />
    <link rel="stylesheet" type="text/css" href="${ctx}/desktop/resources/css/icon.css" />
    <link rel="stylesheet" type="text/css" href="${ctx}/lib/ext4/resources/css/ext-all.css" />
    <script type="text/javascript" src="${ctx}/lib/ext4/ext-all-debug.js"></script>
    <script type="text/javascript" src="${ctx}/lib/ext4/locale/ext-lang-zh_CN.js"></script>
    <script type="text/javascript">
    	Ext.Loader.setConfig({
    		enabled: true
    	});
        Ext.Loader.setPath({
            "Ext" : "${ctx}/lib/ext4",
            "Leetop" : "${ctx}/desktop"
        });

        Ext.require(["Leetop.App"]);
		
        var myDesktopApp,ctx = "${ctx}";
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
            myDesktopApp = new Leetop.App({
            	user : "李球"
            });
            window.setTimeout(function(){
            	Ext.MessageBox.hide();
            },1000); 
        });
        
    </script>
</head>

<body>

    <a href="http://www.sencha.com" target="_blank" alt="Powered by Ext JS"
       id="poweredby" >
       <div>
       </div>
   </a>
</body>
</html>
