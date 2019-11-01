package com.group5.definitions.utilities;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.Justification;
import com.group5.definitions.model.Question;
import com.group5.definitions.services.AnswerService;
import com.group5.definitions.services.JustificationService;
import com.group5.definitions.services.QuestionService;
import com.group5.definitions.usersession.UserSessionService;

@Service
public class QuestionMarker {

	@Autowired
	private QuestionService questionService;
	@Autowired
	private AnswerService answerService;
	@Autowired
	private UserSessionService userSession;
	@Autowired
	private JustificationService justificationService;

	public Question saveQuestion(Concept concept, String answerText, String questionText, int type, Long answerQuestionId,
			Long justificationQuestionId) {
		Answer answer = null;
		Question question = null;
		Justification justification = null;
		switch (type) {
		case 0:
			answer = new Answer(answerText.toUpperCase(), false, userSession.getLoggedUser(), concept);
			question = new Question(questionText.toUpperCase(), 0, answer, false, userSession.getLoggedUser());
			break;
		case 1:
			answer = answerService.getOne(answerQuestionId);
			justification = new Justification(answerText.toUpperCase(), false, userSession.getLoggedUser());
			question = new Question(questionText.toUpperCase(), 1, answer, false, justification,
					userSession.getLoggedUser());
			break;
		case 2:
			answer = answerService.getOne(answerQuestionId);
			question = new Question(questionText.toUpperCase(), 2, answer, true, userSession.getLoggedUser());
			question.setMarked(true);
			question.setUserResponse(answerText.equals("yes"));
			question.setCorrect((answer.isCorrect() && answerText.equals("yes")
					|| (!answer.isCorrect() && answerText.equals("no"))));
			break;
		case 3:
			answer = answerService.getOne(answerQuestionId);
			justification = justificationService.findById(justificationQuestionId);
			question = new Question(questionText.toUpperCase(), 2, answer, true, justification,
					userSession.getLoggedUser());
			question.setMarked(true);
			question.setUserResponse(answerText.equals("yes"));
			question.setCorrect((justification.isValid() && answerText.equals("yes")
					|| (!justification.isValid() && answerText.equals("no"))));
			break;
		}
		answerService.save(answer);
		if (justification != null) {
			justification.setAnswer(answer);
			justificationService.save(justification);
			answer.addJustification(justification);
		}
		questionService.save(question);
		return question;
	}
}
