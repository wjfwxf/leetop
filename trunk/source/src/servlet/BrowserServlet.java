package servlet;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class BrowserServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		this.doPost(request, response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String uri = request.getParameter("url");
		try {
			String html = "";
			StringBuffer sb = new StringBuffer();
			String encode = "utf-8";
			URL url = new URL(uri);
			URLConnection urlcon = url.openConnection();
			String contentType = urlcon.getContentType();
			if (contentType != null && contentType.length() > 0) {
				String[] contentTypeArray = contentType.split(";");
				if (contentTypeArray.length >= 2) {
					String chartset = contentTypeArray[1];
					int charsetIndex = chartset.indexOf("=");
					if (charsetIndex > 0) {
						encode = chartset.substring(charsetIndex + 1,
								chartset.length());
					}
				}
			}
			response.setContentType("text/html;charset=" + encode);
			response.setCharacterEncoding(encode);
			InputStreamReader isr = new InputStreamReader(
					urlcon.getInputStream(), encode);
			BufferedReader br = new BufferedReader(isr);
			String str;
			while ((str = br.readLine()) != null) {
				sb.append(str);
			}
			html = sb.toString();
			br.close();
			isr.close();
			html += this.initLinksTarget();
			response.getWriter().write(html);
		} catch (Exception e) {
			response.getWriter().write(buildErrorHTML(uri,"无法连接互联网."));
		} finally {
			response.getWriter().close();
		}
	}

	public String initLinksTarget() {
		return "<script type='text/javascript'>"
				+ "var links = document.getElementsByName('a');"
				+ "for( var i = 0; i < links.length; i++ ){"
				+ "var link = links[i];alert(link.target);"
				+ "link.target = '_self'}" + "</script";
	}

	public String buildErrorHTML(String url, String message) {
		return "<html><head><title>无法访问  "+url+" </title><style type='text/css'>"
				+ "body{background-color: #ccc;font-size: 12px;}"
				+ ".errorPanel{border: #ccc 1px  solid;margin: 20 40 40 0;width: 800;"
				+ "background-color: #fff;text-align: left;padding: 10 40;}</style></head> "
				+ "<body><div align='center'><div class='errorPanel'>"
				+ "<h2>无法访问 " + url + "</h2><span>错误信息:" + message + "</span>"
				+ "</div></div></body></html>";
	}
}
