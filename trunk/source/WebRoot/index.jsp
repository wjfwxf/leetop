<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
	request.setAttribute("ctx",request.getContextPath());
%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>系统桌面</title>

	<link rel="shortcut icon" href="http://mat1.gtimg.com/www/icon/favicon.ico"/>
    <link rel="stylesheet" type="text/css" href="${ctx}/resources/css/ext-all.css" />
    <link rel="stylesheet" type="text/css" href="${ctx}/desktop/resource/css/desktop.css" />
    <link rel="stylesheet" type="text/css" href="${ctx}/desktop/resource/css/shortcut.css" />
    <link rel="stylesheet" type="text/css" href="${ctx}/desktop/resource/css/icon.css" />
    <script type="text/javascript" src="${ctx}/ext-all-debug.js"></script>
    <script type="text/javascript" src="${ctx}/locale/ext-lang-zh_CN.js"></script>
    <script type="text/javascript">
    	Ext.Loader.setConfig({
    		enabled: true
    	});
        Ext.Loader.setPath({
            "Ext.ux" : "${ctx}/ux",
            "Leetop.desktop" : "${ctx}/desktop",
            "Leetop" : "${ctx}/desktop"
        });

        Ext.require("Leetop.desktop.App");
		
        var myDesktopApp,ctx = "${ctx}";
        Ext.onReady(function () {
            myDesktopApp = new Leetop.desktop.App({
            	user : "李球"
            });
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
