package com.group5.definitions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.group5.definitions.model.Concept;
import com.group5.definitions.model.Question;
import com.group5.definitions.model.User;

public interface QuestionRepository extends JpaRepository<Question, Long> {

	Page<Question> findByMarkedAndAnswer_Concept(boolean marked, Concept concept, Pageable page);

	Page<Question> findByMarkedAndAnswer_Concept_IdAndUser(boolean marked, long conceptId, User loggedUser,
			Pageable page);

	Page<Question> findByMarkedAndAnswer_Concept_Id(boolean marked, long id, Pageable page);

	Page<Question> findAllByUser(User user, Pageable page);

}
