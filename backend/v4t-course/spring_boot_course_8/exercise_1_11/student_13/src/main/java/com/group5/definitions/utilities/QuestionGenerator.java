package com.group5.definitions.utilities;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.Justification;
import com.group5.definitions.model.Question;
import com.group5.definitions.services.AnswerService;
import com.group5.definitions.services.ConceptService;
import com.group5.definitions.services.JustificationService;
import com.group5.definitions.usersession.UserSessionService;

@Service
public class QuestionGenerator {

	@Autowired
	private ConceptService conceptService;

	@Autowired
	private AnswerService answerService;

	@Autowired
	private JustificationService justificationService;

	private Map<Integer, String[]> questionTypes = new ConcurrentHashMap<>();

	@Autowired
	private UserSessionService userSession;

	@PostConstruct
	public void initTypes() {
		String[] type0 = { "¿Qué es ", "?" };
		String[] type1 = { "¿Por qué no es correcto afirmar que ", " es ", "?" };
		String[] type2 = { "¿Es correcto afirmar que ", " es ", "?" };
		String[] type3 = { "¿Es cierto que ", " no es ", " porque ", "?" };
		questionTypes.put(0, type0);
		questionTypes.put(1, type1);
		questionTypes.put(2, type2);
		questionTypes.put(3, type3);
	}

	public Question generateQuestion(long conceptId) {
		return generateQuestion(conceptService.findById(conceptId));
	}

	public Question generateQuestion(Concept concept) {
		Random r = new Random();
		int type = r.nextInt(questionTypes.size());
		// Debug purposes
		// type = 3;
		return generateQuestionWithType(type, concept);
	}

	private Question generateQuestionWithType(int type, Concept concept) {
		// A Question Entity will be returned, this entity is not to be saved in the
		// repository
		// but serves to be a record for holding info to pass to the model
		String questionText = null;
		Question question = null;
		switch (type) {
		case 0:
			questionText = buildQuestion(type, concept.getConceptName());
			question = new Question(questionText.toUpperCase(), 0, null, false, userSession.getLoggedUser());
			break;
		case 1:
			Answer wrongAnswer1 = answerService.getRandomAnswer(false, concept);
			if (wrongAnswer1 == null) {
				// Handle error
				// If this type fails then generate a type 0 question
				// We could also try to generate a type 2 but it is simpler and faster to just
				// generate a type 0
				return generateQuestionWithType(0, concept);
			}
			questionText = buildQuestion(type, concept.getConceptName(), wrongAnswer1.getAnswerText());
			question = new Question(questionText.toUpperCase(), 1, wrongAnswer1, false, userSession.getLoggedUser());
			break;
		case 2:
			Answer answer = answerService.getRandomAnswer(concept);
			if (answer == null) {
				// Handle error
				return generateQuestionWithType(0, concept);
			}
			questionText = buildQuestion(type, concept.getConceptName(), answer.getAnswerText());
			question = new Question(questionText.toUpperCase(), 2, answer, true, userSession.getLoggedUser());
			break;
		case 3:
			Answer wrongAnswer3 = answerService.getRandomAnswer(false, concept); // Assuming every wrong answer has a
																					// justification
			if (wrongAnswer3 == null) {
				// Handle error
				return generateQuestionWithType(0, concept);
			}
			Justification justification = justificationService.getRandomJustification(wrongAnswer3);
			if (justification == null) {
				// Handle error
				// This should never happen
				return generateQuestionWithType(0, concept);
			}
			questionText = buildQuestion(type, concept.getConceptName(), wrongAnswer3.getAnswerText(),
					justification.getJustificationText());
			question = new Question(questionText.toUpperCase(), 3, wrongAnswer3, true, justification,
					userSession.getLoggedUser());
			break;
		}
		return question;
	}

	private String buildQuestion(int type, String... args) {
		StringBuilder sb = new StringBuilder();
		String[] typeArray = questionTypes.get(type);
		for (int i = 0; i < args.length; i++) {
			sb.append(typeArray[i]);
			sb.append(args[i]);
		}
		sb.append(typeArray[typeArray.length - 1]);
		return sb.toString();
	}

}
