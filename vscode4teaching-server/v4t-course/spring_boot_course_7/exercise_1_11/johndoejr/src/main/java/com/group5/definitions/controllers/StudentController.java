package com.group5.definitions.controllers;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.group5.definitions.model.Question;
import com.group5.definitions.services.ConceptService;
import com.group5.definitions.services.QuestionService;
import com.group5.definitions.usersession.UserSessionService;
import com.group5.definitions.utilities.QuestionMarker;

@Controller
public class StudentController {

	@Autowired
	private ConceptService conceptService;

	@Autowired
	private QuestionService questionService;

	@Autowired
	private QuestionMarker questionMarker;

	@Autowired
	private UserSessionService userSession;

	private final int DEFAULT_SIZE = 10;

	@PostMapping("/saveAnswer/concept/{conceptId}")
	public String saveAnswer(Model model, @PathVariable long conceptId, HttpServletResponse httpServletResponse,
			@RequestParam String questionText, @RequestParam int questionType,
			@RequestParam(required = false) String answerText, @RequestParam(required = false) String answerOption,
			@RequestParam(required = false) Long answerQuestionId,
			@RequestParam(required = false) Long justificationQuestionId) throws IOException {
		boolean open = answerText != null;
		String answerFinalText = open ? answerText : answerOption;
		questionMarker.saveQuestion(conceptService.findById(conceptId), answerFinalText, questionText, questionType,
				answerQuestionId, justificationQuestionId);
		httpServletResponse.sendRedirect("/concept/" + conceptId);
		return null;
	}

	@RequestMapping("/concept/{conceptId}/loadUnmarkedQuestions")
	public String loadUnmarkedQuestions(Model model, HttpServletRequest req,
			@PageableDefault(size = DEFAULT_SIZE) Pageable page, @PathVariable long conceptId) {
		Page<Question> unmarkedQuestions = questionService.findByMarkedAndAnswer_Concept_IdAndUser(false, conceptId,
				userSession.getLoggedUser(), page);
		model.addAttribute("questions", unmarkedQuestions);
		return "old/showquestion";
	}

	@RequestMapping("/concept/{conceptId}/loadMarkedQuestions")
	public String loadMarkedQuestions(Model model, HttpServletRequest req,
			@PageableDefault(size = DEFAULT_SIZE) Pageable page, @PathVariable long conceptId) {
		Page<Question> markedQuestions = questionService.findByMarkedAndAnswer_Concept_IdAndUser(true, conceptId,
				userSession.getLoggedUser(), page);
		model.addAttribute("questions", markedQuestions);
		return "old/showquestion";
	}
}
