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

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.Justification;
import com.group5.definitions.model.Question;
import com.group5.definitions.model.User;
import com.group5.definitions.services.AnswerService;
import com.group5.definitions.services.ConceptService;
import com.group5.definitions.services.JustificationService;
import com.group5.definitions.services.QuestionService;
import com.group5.definitions.usersession.UserSessionService;

@Controller
public class TeacherController {

	@Autowired
	private AnswerService answerService;

	@Autowired
	private JustificationService justificationService;

	@Autowired
	private ConceptService conceptService;

	@Autowired
	private QuestionService questionService;

	@Autowired
	private UserSessionService userSession;

	private final int DEFAULT_SIZE = 10;

	@PostMapping("/modifyAnswer/concept/{conceptId}/answer/{id}")
	public String addModifiedAnswer(Model model, @PathVariable String conceptId, @PathVariable long id,
			@RequestParam String answerText, @RequestParam(value = "correct", required = false) String cAnswer,
			@RequestParam(value = "justificationTextNew", required = false) String justificationText,
			@RequestParam(value = "validNew", required = false) String jValid,
			@RequestParam(value = "errorNew", required = false) String error, HttpServletResponse httpServletResponse)
			throws IOException {
		Answer ans = answerService.getOne(id);
		ans.setAnswerText(answerText.toUpperCase());
		Justification newJ = null;
		if (cAnswer != null) {
			ans.setCorrect(cAnswer.equals("yes"));
			if (cAnswer.equals("yes")) {
				// It is needed to delete the justifications from the DB
				for (Justification j : ans.getJustifications()) {
					justificationService.deleteById(j.getId());
				}
				ans.getJustifications().clear(); // In case, we clear the answer justifications
			} else {
				if (ans.getJustifications().size() == 0) {
					newJ = new Justification(justificationText.toUpperCase(), true, userSession.getLoggedUser());
					newJ.setValid(jValid.equals("yes"));
					if (jValid.equals("no"))
						newJ.setError(error.toUpperCase());
					ans.addJustification(newJ);
				}
			}
		}
		answerService.save(ans);
		if (newJ != null) {
			newJ.setAnswer(ans);
			justificationService.save(newJ);
		}
		httpServletResponse.sendRedirect("/concept/" + conceptId);
		return null;
	}

	@RequestMapping("/delete/concept/{conceptId}/answer/{id}")
	public String deleteAnswer(Model model, @PathVariable String conceptId, @PathVariable long id,
			HttpServletResponse httpServletResponse) throws IOException {
		Answer ans = answerService.getOne(id);
		for (Justification j : ans.getJustifications())
			justificationService.deleteById(j.getId());
		answerService.deleteById(id);
		httpServletResponse.sendRedirect("/concept/" + conceptId);
		return null;
	}

	@PostMapping("/concept/{conceptId}/mark/{answerId}")
	public String markAnswer(Model model, @PathVariable long conceptId, @PathVariable long answerId,
			@RequestParam String correct, @RequestParam(required = false) String justificationTextNew,
			HttpServletResponse httpServletResponse) throws IOException {
		Answer ans = answerService.getOne(answerId);
		ans.setMarked(true);
		ans.setCorrect(correct.equals("yes"));
		answerService.save(ans);
		if ((justificationTextNew != null) && (correct.equals("no"))) {
			Justification justification = new Justification(justificationTextNew.toUpperCase(), true,
					userSession.getLoggedUser());
			justification.setValid(true);
			justification.setAnswer(ans);
			justificationService.save(justification);
		}
		for (Question q : ans.getQuestions()) {
			if (!q.isMarked() && (q.getType() == 0)) {
				q.setMarked(true);
				q.setCorrect(correct.equals("yes"));
				questionService.save(q);
			}
		}
		httpServletResponse.sendRedirect("/concept/" + conceptId);
		return null;
	}

	@RequestMapping("/concept/{conceptId}/loadMarkedAnswers")
	public String loadMarkedAnswers(Model model, HttpServletRequest req,
			@PageableDefault(size = DEFAULT_SIZE) Pageable page, @PathVariable long conceptId) {
		Page<Answer> markedAnswers = answerService.findByMarkedAndConceptId(true, conceptId, page);
		model.addAttribute("answers", markedAnswers);
		return "old/showanswer";
	}

	@RequestMapping("/concept/{conceptId}/loadJust")
	public String loadCorrectJust(Model model, HttpServletRequest req,
			@PageableDefault(size = DEFAULT_SIZE) Pageable page, @PathVariable long conceptId,
			@RequestParam("answerId") String answerId) {
		Page<Justification> correctJust = justificationService.findByAnswer_Id(Long.parseLong(answerId), page);
		model.addAttribute("justifications", correctJust);
		model.addAttribute("id", answerId);
		if ((page.getPageNumber() == correctJust.getTotalPages()) && (correctJust.getTotalPages() != 0))
			model.addAttribute("nothingMore", true);
		return "old/showjustification";
	}

	@RequestMapping("/concept/{conceptId}/loadUnmarkedAnswers")
	public String loadUnmarkedAnswers(Model model, HttpServletRequest req,
			@PageableDefault(size = DEFAULT_SIZE) Pageable page, @PathVariable long conceptId) {
		Page<Answer> unmarkedAnswers = answerService.findByMarkedAndConceptId(false, conceptId, page);
		model.addAttribute("answers", unmarkedAnswers);
		return "old/showanswer";
	}

	@RequestMapping("/concept/{id}/loadUnmarkedJustifications")
	public String loadUnmarkedJustifications(Model model, HttpServletRequest req, @PathVariable long id,
			@PageableDefault(size = DEFAULT_SIZE) Pageable page) {
		Page<Answer> unmarkedJustifications = answerService
				.findByConceptAndJustifications_Marked(conceptService.findById(id), false, page);
		model.addAttribute("unmarkedJustifications", unmarkedJustifications);
		return "old/showJustificationsUnmarked";
	}

	@PostMapping("/concept/{conceptId}/addAnswer")
	public String addAnswer(Model model, @PathVariable long conceptId, @RequestParam String answerText,
			@RequestParam String correct, @RequestParam(required = false) String justificationText,
			@RequestParam(required = false) String validity, @RequestParam(required = false) String error,
			HttpServletResponse httpServletResponse) throws IOException {
		Concept c = conceptService.findById(conceptId);
		User user = userSession.getLoggedUser();
		Answer answer = new Answer(answerText.toUpperCase(), true, user, c);
		answer.setCorrect(correct.equals("yes"));
		answerService.save(answer);
		if ((justificationText != null) && (correct.equals("no"))) {
			Justification justification = new Justification(justificationText.toUpperCase(), true, user);
			justification.setValid(validity.equals("yes"));
			if ((error != null) && (validity.equals("no"))) {
				justification.setError(error.toUpperCase());
			}
			justification.setAnswer(answer);
			justificationService.save(justification);
		}
		httpServletResponse.sendRedirect("/concept/" + conceptId);
		return null;
	}

	@RequestMapping("/modifyJust/concept/{conceptId}/justification/{id}")
	public void modifyJustification(Model model, @PathVariable String conceptId, @PathVariable String id,
			@RequestParam String jText, @RequestParam String valid, @RequestParam(required = false) String error,
			HttpServletResponse httpServletResponse) throws IOException {
		Justification j = justificationService.findById(Long.parseLong(id));
		j.setJustificationText(jText.toUpperCase());
		if (valid.equals("yes")) {
			j.setValid(true);
		} else {
			j.setValid(false);
			j.setError(error.toUpperCase());
		}
		justificationService.save(j);
		httpServletResponse.sendRedirect("/concept/" + conceptId);
	}

	@RequestMapping("/deleteJust/concept/{conceptId}/justification/{id}")
	public void deleteJustification(Model model, @PathVariable String conceptId, @PathVariable long id,
			HttpServletResponse httpServletResponse) throws IOException {
		Justification j = justificationService.findById(id);
		String error = "";
		if (j.getAnswer().countMarkedJustifications() > 1) {
			justificationService.deleteById(id);
		} else {
			error = "?justerror=true";
		}
		httpServletResponse.sendRedirect("/concept/" + conceptId + error);
	}

	@PostMapping("/concept/{conceptId}/saveURL")
	public void saveURL(Model model, @PathVariable Long conceptId, @RequestParam String url,
			HttpServletResponse httpServletResponse) throws IOException {
		conceptService.saveURL(conceptId, url);
		httpServletResponse.sendRedirect("/concept/" + conceptId);
	}

	@PostMapping("/concept/{conceptId}/markJust/{justId}")
	public String addJustification(Model mode, @PathVariable long conceptId, @PathVariable long justId,
			@RequestParam String validUnmarked, @RequestParam(required = false) String errorUnmarked,
			HttpServletResponse httpServletResponse) throws IOException {
		Justification just = justificationService.findById(justId);
		just.setMarked(true);
		just.setValid(validUnmarked.equals("yes"));
		if ((errorUnmarked != null) && (validUnmarked.equals("no"))) {
			just.setError(errorUnmarked.toUpperCase());
		}
		justificationService.save(just);
		httpServletResponse.sendRedirect("/concept/" + conceptId);
		return null;
	}

	@RequestMapping("/extraJustification/concept/{conceptId}/answer/{answerId}")
	public String extraJustification(Model model, @RequestParam String jText, @RequestParam String valid,
			@RequestParam(required = false) String error, @PathVariable String conceptId, @PathVariable long answerId,
			HttpServletResponse httpServletResponse) throws IOException {
		Justification justification = new Justification(jText.toUpperCase(), true, userSession.getLoggedUser());
		justification.setValid(valid.equals("yes"));
		justification.setAnswer(answerService.getOne(answerId));
		if (valid.equals("no")) {
			justification.setError(error.toUpperCase());
		}
		justificationService.save(justification);
		httpServletResponse.sendRedirect("/concept/" + conceptId);
		return null;
	}
}
