package com.group5.definitions.controllers;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;

import com.group5.definitions.usersession.UserSessionService;

@Controller
public class CustomErrorController implements ErrorController {

	@Autowired
	private UserSessionService userSession;

	@ModelAttribute
	public void addUserToModel(Model model) {
		userSession.addUserToModel(model);
	}

	@RequestMapping("/error")
	public String handleError(Model model, HttpServletRequest request) {
		Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
		Exception exception = (Exception) request.getAttribute("javax.servlet.error.exception");
		String statusMessage = (String) request.getAttribute("javax.servlet.error.message");
		model.addAttribute("statusCode", statusCode);
		model.addAttribute("statusMessage", statusMessage);
		String errorMessage;
		if (exception == null)
			errorMessage = "";
		else
			errorMessage = exception.getMessage();
		model.addAttribute("errorMessage", errorMessage);
		userSession.setActive(null);
		model.addAttribute("tabs", userSession.getOpenTabs());
		return "old/error";
	}

	@Override
	public String getErrorPath() {
		return "/error";
	}
}
