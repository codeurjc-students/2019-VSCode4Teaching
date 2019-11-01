package com.group5.definitions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.group5.definitions.model.Chapter;
import com.group5.definitions.model.User;

public interface ChapterRepository extends JpaRepository<Chapter, Long> {

	Chapter findByChapterName(String chapterName);

	long countByIdAndConcepts_Answers_Marked(long id, boolean marked);

	long countByIdAndConcepts_Answers_MarkedAndConcepts_Answers_Correct(long id, boolean marked, boolean correct);

	long countByIdAndConcepts_Answers_Questions_MarkedAndConcepts_Answers_Questions_User(long id, boolean marked,
			User user);

	long countByIdAndConcepts_Answers_Questions_MarkedAndConcepts_Answers_Questions_CorrectAndConcepts_Answers_Questions_User(
			long id, boolean marked, boolean correct, User user);
}
