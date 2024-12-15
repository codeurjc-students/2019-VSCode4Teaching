package com.group5.definitions.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.group5.definitions.model.Concept;

public interface ConceptRepository extends JpaRepository<Concept, Long> {

	Concept findByConceptName(String name);

	Page<Concept> findByChapter_id(long id, Pageable page);

}
