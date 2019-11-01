package com.group5.definitions.controllers;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.Justification;
import com.group5.definitions.model.Question;
import com.group5.definitions.model.User;
import com.group5.definitions.services.ChapterService;
import com.group5.definitions.services.ConceptService;
import com.group5.definitions.usersession.Tab;
import com.group5.definitions.usersession.UserSessionService;
import com.group5.definitions.utilities.QuestionGenerator;

@Controller
public class ConceptController {

	@Autowired
	private ChapterService chapterService;

	@Autowired
	private ConceptService conceptService;

	@Autowired
	private UserSessionService userSession;

	@Autowired
	private QuestionGenerator questionGenerator;

	private final int DEFAULT_SIZE = 10;

	@ModelAttribute
	public void addUserToModel(Model model) {
		userSession.addUserToModel(model);
	}

	@RequestMapping("/concept/{id}")
	public String conceptPage(Model model, HttpServletRequest req, @PathVariable long id,
			@RequestParam(name = "close", required = false) Long closeTab,
			@RequestParam(name = "justerror", required = false) String errorJust,
			HttpServletResponse httpServletResponse,
			@PageableDefault(size = DEFAULT_SIZE, sort = { "id" }) Pageable page) throws IOException {
		Concept concept = conceptService.findById(id);
		String name = concept.getConceptName();
		// If close tab button was pressed, remove the tab
		if (closeTab != null) {
			userSession.removeTab(closeTab);
			// If user is in the tab that is being closed, redirect to home page
			if (closeTab.equals(id)) {
				httpServletResponse.sendRedirect("/");
				return null;
			}
		}
		// Open a new tab if it doesn't exist.
		Tab tab = new Tab(id, name, "/concept/" + id, true);
		if (!userSession.getOpenTabs().contains(tab))
			userSession.addTab(tab);
		else
			userSession.setActive(name);
		model.addAttribute("tabs", userSession.getOpenTabs());
		model.addAttribute("conceptName", name);
		model.addAttribute("conceptId", id);
		// if user is a teacher get all answers and return the teacher template
		User user;
		if (req.isUserInRole("ROLE_TEACHER")) {
			// Page<Answer> markedAnswers = answerService.findByMarkedAndConceptId(true, id,
			// page);
			// Page<Answer> unmarkedAnswers = answerService.findByMarkedAndConceptId(false,
			// id, page);
			String url = concept.getURL();
			model.addAttribute("conceptURL", url);
			// model.addAttribute("markedAnswers", markedAnswers);
			// model.addAttribute("unmarkedAnswers", unmarkedAnswers);
			if (errorJust != null) {
				model.addAttribute("deleteError", true);
			}
			return "old/teacher";
		} else {
			user = userSession.getLoggedUser();
			model.addAttribute("diagramInfo", chapterService.generateDiagramInfoStudent(user));
			addQuestionInfoToModel(model, concept);
			return "old/concept";
		}
	}

	private void addQuestionInfoToModel(Model model, Concept concept) {
		Question question = questionGenerator.generateQuestion(concept);
		Answer answer = question.getAnswer();
		Justification justification = question.getJustification();
		if (answer != null)
			model.addAttribute("answerId", answer.getId());
		if (justification != null)
			model.addAttribute("justificationId", justification.getId());
		model.addAttribute("questionText", question.getQuestionText());
		model.addAttribute("openQuestion", !question.isYesNoQuestion());
		model.addAttribute("questionType", question.getType());
	}

}
