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

	public BrowserServlet() {
		super();
	}

	public void destroy() {
		super.destroy(); // Just puts "destroy" string in log
		// Put your code here
	}

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		this.doPost(request, response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String url = request.getParameter("url");
		try {
			response.setCharacterEncoding("utf-8");
			response.getWriter().write(this.html(url));
		} catch (Exception e) {
			response.getWriter().write( "{ title : 未知标题"+ 
					" html : 无法访问改页面}");
		} finally {
			response.getWriter().close();
		}
	}

	private String html(String uri) {
		String title = "未知标题",html = "";
		try {
			StringBuffer sb = new StringBuffer();
			String encode = "utf-8";
			URL url = new URL(uri);
			URLConnection urlcon = url.openConnection();
			String contentType = urlcon.getContentType();
			String[] contentTypeArray = contentType.split(";");
			if (contentTypeArray.length >= 2) {
				String chartset = contentTypeArray[1];
				int charsetIndex = chartset.indexOf("=");
				if (charsetIndex > 0) {
					encode = chartset.substring(charsetIndex + 1,
							chartset.length());
				}
			}
			InputStreamReader isr = new InputStreamReader(urlcon.getInputStream(), encode);
			BufferedReader br = new BufferedReader(isr);
			String str;
			while ((str = br.readLine()) != null) {
				sb.append(str);
			}
			if (sb.indexOf("<title>") > 0) {
				title = sb.substring(sb.indexOf("<title>") + 7,
						sb.indexOf("</title>"));
			}
			html = sb.toString();
			br.close();
			isr.close();
		} catch (Exception e) {
			return "{ title : " + title + 
					" html : " + html + "}";
		}
		return "{ title : " + title + 
		" html : " + html + "}";
	}

	public void init() throws ServletException {
	}

}
