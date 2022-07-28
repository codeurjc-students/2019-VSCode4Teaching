package com.group5.definitions.controllers;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.group5.definitions.services.ImageService;

@Controller
public class ImageController {

	@Autowired
	private ImageService imageService;

	@RequestMapping(value = "/image/upload", method = RequestMethod.POST)
	public String handleFileUpload(Model model, @RequestParam("conceptId") long conceptId,
			HttpServletResponse httpServletResponse, @RequestParam("file") MultipartFile file) {
		try {
			imageService.handleFileUpload(conceptId, file);
			httpServletResponse.sendRedirect("/concept/" + conceptId);
			return null;
		} catch (Exception e) {
			model.addAttribute("statusCode", 500);
			model.addAttribute("errorMessage", e.getMessage());
			return "old/error";
		}
	}

	@RequestMapping("/image/concept/{conceptId}")
	public void handleFileDownload(@PathVariable long conceptId, HttpServletResponse res)
			throws FileNotFoundException, IOException {
		Path image = imageService.handleFileDownload(conceptId);
		res.setContentType("image/jpeg");
		res.setContentLength((int) image.toFile().length());
		FileCopyUtils.copy(Files.newInputStream(image), res.getOutputStream());
	}
}
