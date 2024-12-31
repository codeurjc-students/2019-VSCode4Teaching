package com.group5.definitions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Justification;

public interface JustificationRepository extends JpaRepository<Justification, Long> {

	// Page<Justification> findByAnswer(Answer answer, Pageable page);

	long countByAnswer(Answer answer);

	Justification findByJustificationText(String justificationText);

	long countByAnswer_Id(long answerId);

	Page<Justification> findByAnswer_Id(long id, Pageable page);

	Page<Justification> findByAnswer(Answer ans, Pageable page);
	
	Page<Justification> findByMarkedAndAnswer_Concept_IdAndAnswer_MarkedAndAnswer_Id(boolean justMarked, 
			long id, boolean marked, long answerId, Pageable page);
	
	Page<Justification> findByMarkedAndAnswer_Concept_IdAndAnswer_Marked(boolean justMarked, 
			long id, boolean marked, Pageable page);

}
