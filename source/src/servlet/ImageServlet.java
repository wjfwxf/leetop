package servlet;

import java.io.IOException;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import util.ICONUtil;

public class ImageServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		this.doPost(request, response);
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		String url = ICONUtil.formatBackgroundIamgeURL(request.getParameter("url"));
		String fileName = ICONUtil.getFileNameFromURL(url);
		response.setContentType(ICONUtil.getContentType(fileName));
		response.setHeader("Cache-Control", "no-cache");
		response.setHeader("Pragma", "No-cache");
		response.setDateHeader("Expires", 0);
		/*response.setHeader("Content-Disposition", "attachment; filename=\""
				+ new String(fileName.getBytes("gb18030"), "iso8859-1") + "\"");*/
		try {
			ImageIO.write(ICONUtil.scaleImage(url), ICONUtil.getFilePostfix(url),response.getOutputStream());
		} catch (Exception e) {

		}
	}
	
	public static void main(String[] args) {
		String url = ICONUtil.formatBackgroundIamgeURL("url(http://localhost:8080/Desktop/desktop/images/qmusic.png)");
		try{
            ICONUtil.scaleImage(url);
            System.out.println("处理成功!");
		}catch(Exception e){
			e.printStackTrace();
		}
	}
}
