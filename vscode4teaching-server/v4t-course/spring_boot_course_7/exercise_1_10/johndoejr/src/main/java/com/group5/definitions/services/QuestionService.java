package com.group5.definitions.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.group5.definitions.model.Concept;
import com.group5.definitions.model.Question;
import com.group5.definitions.model.User;
import com.group5.definitions.repositories.QuestionRepository;

@Service
public class QuestionService {

	@Autowired
	private QuestionRepository questionRepository;

	public void save(Question question) {
		questionRepository.save(question);
	}

	public Page<Question> findByMarkedAndAnswer_Concept(boolean marked, Concept concept, Pageable page) {
		return questionRepository.findByMarkedAndAnswer_Concept(marked, concept, page);
	}

	public Page<Question> findByMarkedAndAnswer_Concept_IdAndUser(boolean marked, long conceptId, User loggedUser,
			Pageable page) {
		return questionRepository.findByMarkedAndAnswer_Concept_IdAndUser(marked, conceptId, loggedUser, page);
	}

	public Page<Question> findByMarkedAndAnswer_Concept_Id(boolean marked, long id, Pageable page) {
		// TODO Auto-generated method stub
		return questionRepository.findByMarkedAndAnswer_Concept_Id(marked, id, page);
	}

	public Page<Question> findAllByUser(User user, Pageable page) {

		return questionRepository.findAllByUser(user, page);
	}

	public Question findById(long questionId) {
		return questionRepository.getOne(questionId);
	}

}
