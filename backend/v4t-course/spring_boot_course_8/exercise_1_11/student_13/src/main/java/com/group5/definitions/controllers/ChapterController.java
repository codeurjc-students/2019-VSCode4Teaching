package com.group5.definitions.controllers;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.group5.definitions.model.Chapter;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.User;
import com.group5.definitions.services.ChapterService;
import com.group5.definitions.services.ConceptService;
import com.group5.definitions.services.UserService;
import com.group5.definitions.usersession.UserSessionService;

@Controller
public class ChapterController {

	@Autowired
	private ChapterService chapterService;
	private final int DEFAULT_SIZE = 10;
	@Autowired
	private ConceptService conceptService;

	@Autowired
	private UserSessionService userSession;

	@Autowired
	private UserService userService;

	@ModelAttribute
	public void addUserToModel(Model model) {
		userSession.addUserToModel(model);
	}

	@RequestMapping("")
	public String loadHome(Model model, @RequestParam(name = "close", required = false) Long closeTab,
			HttpServletRequest req) {
		addToModelHome(model, closeTab, req);
		return "old/home";
	}

	private void addToModelHome(Model model, Long closeTab, HttpServletRequest req) {
		if (closeTab != null) {
			userSession.removeTab(closeTab);
		}
		userSession.setActive("inicio");
		model.addAttribute("tabs", userSession.getOpenTabs());
		model.addAttribute("teacher", req.isUserInRole("ROLE_TEACHER"));
		model.addAttribute("seeDiagram", req.isUserInRole("ROLE_TEACHER") || req.isUserInRole("ROLE_STUDENT"));
		if (req.isUserInRole("ROLE_TEACHER")) {
			model.addAttribute("diagramInfo", chapterService.generateDiagramInfoTeacher());
		} else if (req.isUserInRole("ROLE_STUDENT")) {
			model.addAttribute("diagramInfo", chapterService.generateDiagramInfoStudent(userSession.getLoggedUser()));
		}
		// model.addAttribute("images", imageController.getImageValues());
	}

	@RequestMapping("/loadChapters")
	public String getChapters(Model model, HttpServletRequest req,
			@PageableDefault(size = DEFAULT_SIZE) Pageable page) {
		Page<Chapter> chapters = chapterService.findAll(page);
		model.addAttribute("chapters", chapters);
		model.addAttribute("teacher", req.isUserInRole("ROLE_TEACHER"));
		return "old/chapterInfo";
	}

	@RequestMapping("/loadConcepts")
	public String getConcepts(Model model, HttpServletRequest req, @PageableDefault(size = DEFAULT_SIZE) Pageable page,
			@RequestParam("chapterId") String chapterId) {
		Page<Concept> concepts = conceptService.findByChapter_Id(Long.parseLong(chapterId), page);
		model.addAttribute("concepts", concepts);
		model.addAttribute("chapterId", chapterId);
		model.addAttribute("seeDiagram", req.isUserInRole("ROLE_TEACHER") || req.isUserInRole("ROLE_STUDENT"));
		model.addAttribute("teacher", req.isUserInRole("ROLE_TEACHER"));
		return "old/conceptInfo";
	}

	@RequestMapping("/login")
	public String loginPage(Model model) {
		model.addAttribute("loginPage", true);
		return "old/loginPage";
	}

	@RequestMapping("/addChapter")
	public String addChapter(Model model, @RequestParam String chapterName, HttpServletRequest req) {
		Chapter chap = new Chapter(chapterName);
		chapterService.save(chap);
		addToModelHome(model, null, req);
		return "old/home";
	}

	@RequestMapping("/deleteChapter/chapter/{id}")
	public String deleteChapter(Model model, @PathVariable Long id, HttpServletRequest req) {
		for (Concept c : chapterService.findById(id).getConcepts()) {
			userSession.removeTab(c.getId());
		}
		chapterService.deleteById(id);
		addToModelHome(model, null, req);
		return "old/home";
	}

	@PostMapping("/addConcept")
	public String addConcept(Model model, HttpServletRequest req, @RequestParam String conceptName,
			@RequestParam String chapterId) {
		Chapter chap = chapterService.findById(Long.parseLong(chapterId));
		Concept con = new Concept(conceptName, chap);
		chap.getConcepts().add(con);
		conceptService.save(con);
		chapterService.save(chap);
		addToModelHome(model, null, req);
		return "old/home";
	}

	@RequestMapping("/deleteConcept/concept/{id}")
	public String deleteConcept(Model model, @PathVariable Long id, HttpServletRequest req) {
		userSession.removeTab(id);
		conceptService.deleteById(id);
		addToModelHome(model, null, req);
		return "old/home";
	}

	@RequestMapping("/register")
	public String register(Model model) {
		return "old/register";
	}

	@PostMapping("/newUser")
	public String newUser(Model model, HttpServletRequest req, @RequestParam String username,
			@RequestParam String password) {
		userService.save(new User(username, password, "ROLE_STUDENT"));
		addToModelHome(model, null, req);
		return "old/loginPage";
	}
}
