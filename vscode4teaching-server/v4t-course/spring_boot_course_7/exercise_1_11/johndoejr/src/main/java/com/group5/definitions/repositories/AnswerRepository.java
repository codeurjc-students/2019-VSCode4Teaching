package com.group5.definitions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.User;

public interface AnswerRepository extends JpaRepository<Answer, Long> {

	public Page<Answer> findByConcept(Concept concept, Pageable page);

	public Page<Answer> findByConceptAndUser(Concept concept, User user, Pageable page);

	public long countByMarkedAndCorrectAndConcept(boolean marked, boolean correct, Concept concept);

	public Page<Answer> findByMarkedAndCorrectAndConcept(boolean marked, boolean correct, Concept concept,
			Pageable page);

	public Answer findByAnswerText(String answerText);

	public Page<Answer> findByMarkedAndConceptId(boolean marked, long id, Pageable page);

	public Page<Answer> findByConceptAndJustifications_Marked(Concept concept, boolean justMarked, Pageable page);

	public Page<Answer> findByMarkedAndConceptIdAndJustifications_Marked(boolean marked, long id, boolean justMarked,
			Pageable page);

}
