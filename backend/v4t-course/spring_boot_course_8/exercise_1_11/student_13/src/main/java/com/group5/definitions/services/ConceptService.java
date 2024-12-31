package com.group5.definitions.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.group5.definitions.model.Concept;
import com.group5.definitions.repositories.ConceptRepository;

@Service
public class ConceptService {

	@Autowired
	private ConceptRepository conceptRepository;

	public Concept findByConceptName(String name) {
		return conceptRepository.findByConceptName(name);
	}

	public void save(Concept con) {
		conceptRepository.save(con);
	}

	public void deleteById(Long id) {
		conceptRepository.deleteById(id);
	}

	public Concept findById(Long id) {
		return conceptRepository.findById(id).get();
	}

	public void saveURL(Long id, String url) {
		Concept con = findById(id);
		con.setURL(url);
		conceptRepository.save(con);
	}

	public Page<Concept> findByChapter_Id(long id, Pageable page) {
		return conceptRepository.findByChapter_id(id, page);
	}

}
