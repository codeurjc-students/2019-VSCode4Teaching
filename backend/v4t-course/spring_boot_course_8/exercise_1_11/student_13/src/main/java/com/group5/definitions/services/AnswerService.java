package com.group5.definitions.services;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.User;
import com.group5.definitions.repositories.AnswerRepository;

@Service
public class AnswerService {

	@Autowired
	private AnswerRepository answerRepository;

	public Answer getOne(Long id) {
		return answerRepository.findById(id).get();
	}

	public void save(Answer ans) {
		answerRepository.save(ans);
	}

	public void deleteById(Long id) {
		answerRepository.deleteById(id);
	}

	public Page<Answer> findByConcept(Concept concept, Pageable page) {
		return answerRepository.findByConcept(concept, page);
	}

	public Page<Answer> findByConceptAndUser(Concept concept, User user, Pageable page) {
		return answerRepository.findByConceptAndUser(concept, user, page);
	}

	public Answer getRandomAnswer(boolean correct, Concept c) {
		long n = answerRepository.countByMarkedAndCorrectAndConcept(true, correct, c);
		int index = (int) (Math.random() * n);
		Page<Answer> answerPage = answerRepository.findByMarkedAndCorrectAndConcept(true, correct, c,
				PageRequest.of(index, 1));
		Answer a = null;
		if (answerPage.hasContent()) {
			a = answerPage.getContent().get(0);
		}
		return a;
	}

	public Answer getRandomAnswer(Concept c) {
		Random r = new Random();
		boolean correct = r.nextInt(2) == 0;
		return getRandomAnswer(correct, c);
	}

	public Answer findByAnswerText(String answerText) {
		return answerRepository.findByAnswerText(answerText);
	}

	public Page<Answer> findByMarkedAndConceptId(boolean marked, long id, Pageable page) {
		return answerRepository.findByMarkedAndConceptId(marked, id, page);
	}

	public Page<Answer> findByConceptAndJustifications_Marked(Concept concept, boolean justMarked, Pageable page) {
		return answerRepository.findByConceptAndJustifications_Marked(concept, justMarked, page);
	}

	public Page<Answer> findByMarkedAndConceptIdAndJustifications_Marked(boolean marked, long id, boolean markedJust,
			Pageable page) {
		return answerRepository.findByMarkedAndConceptIdAndJustifications_Marked(marked, id, markedJust, page);
	}

}
