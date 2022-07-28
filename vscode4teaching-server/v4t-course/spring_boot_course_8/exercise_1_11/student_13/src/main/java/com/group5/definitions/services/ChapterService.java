package com.group5.definitions.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.group5.definitions.model.Chapter;
import com.group5.definitions.model.User;
import com.group5.definitions.repositories.ChapterRepository;

@Service
public class ChapterService {

	@Autowired
	private ChapterRepository chapterRepository;

	public Page<Chapter> findAll(Pageable page) {
		return chapterRepository.findAll(page);
	}

	public List<Chapter> findAll() {
		return chapterRepository.findAll();
	}

	public void save(Chapter chap) {
		chapterRepository.save(chap);
	}

	public Chapter findByChapterName(String conceptName) {
		return chapterRepository.findByChapterName(conceptName);
	}

	public void deleteById(Long id) {
		chapterRepository.deleteById(id);
	}

	public long countUnmarkedTeacher(long id) {
		return chapterRepository.countByIdAndConcepts_Answers_Marked(id, false);
	}

	public long countCorrectTeacher(long id) {
		return chapterRepository.countByIdAndConcepts_Answers_MarkedAndConcepts_Answers_Correct(id, true, true);
	}

	public long countIncorrectTeacher(long id) {
		return chapterRepository.countByIdAndConcepts_Answers_MarkedAndConcepts_Answers_Correct(id, true, false);
	}

	public long countUnmarkedStudent(long id, User user) {
		return chapterRepository.countByIdAndConcepts_Answers_Questions_MarkedAndConcepts_Answers_Questions_User(id,
				false, user);
	}

	public long countCorrectStudent(long id, User user) {
		return chapterRepository
				.countByIdAndConcepts_Answers_Questions_MarkedAndConcepts_Answers_Questions_CorrectAndConcepts_Answers_Questions_User(
						id, true, true, user);
	}

	public long countIncorrectStudent(long id, User user) {
		return chapterRepository
				.countByIdAndConcepts_Answers_Questions_MarkedAndConcepts_Answers_Questions_CorrectAndConcepts_Answers_Questions_User(
						id, true, false, user);
	}

	public List<DiagramChapterInfo> generateDiagramInfoTeacher() {
		List<DiagramChapterInfo> diagramInfo = new ArrayList<>();
		for (Chapter c : this.findAll()) {
			long id = c.getId();
			diagramInfo.add(new DiagramChapterInfo(c.getChapterName(), this.countUnmarkedTeacher(id),
					this.countCorrectTeacher(id), this.countIncorrectTeacher(id)));
		}
		return diagramInfo;
	}

	public List<DiagramChapterInfo> generateDiagramInfoStudent(User user) {
		List<DiagramChapterInfo> diagramInfo = new ArrayList<>();
		for (Chapter c : this.findAll()) {
			long id = c.getId();
			diagramInfo.add(new DiagramChapterInfo(c.getChapterName(), this.countUnmarkedStudent(id, user),
					this.countCorrectStudent(id, user), this.countIncorrectStudent(id, user)));
		}
		return diagramInfo;
	}

	public Chapter findById(long id) {
		Optional<Chapter> chapter = chapterRepository.findById(id);
		if (chapter.isPresent())
			return chapter.get();
		else
			return null;
	}

	public Page<DiagramChapterInfo> generateDiagramInfoTeacherPage(Pageable page) {
		return new PageImpl<>(generateDiagramInfoTeacher());
	}

	public Page<DiagramChapterInfo> generateDiagramInfoStudentPage(Pageable page, User user) {
		return new PageImpl<>(generateDiagramInfoStudent(user));
	}
}
