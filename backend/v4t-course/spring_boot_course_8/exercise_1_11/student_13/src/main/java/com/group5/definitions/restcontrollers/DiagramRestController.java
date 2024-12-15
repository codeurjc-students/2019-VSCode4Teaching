package com.group5.definitions.restcontrollers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group5.definitions.model.User;
import com.group5.definitions.services.ChapterService;
import com.group5.definitions.services.DiagramChapterInfo;
import com.group5.definitions.usersession.UserSessionService;

@RestController
@RequestMapping("/api")
public class DiagramRestController {

	@Autowired
	private UserSessionService userSession;

	@Autowired
	private ChapterService chapterService;
	private final int DEFAULT_SIZE = 10;

	@GetMapping("/diagraminfo")
	public Page<DiagramChapterInfo> getDiagramInfo(@PageableDefault(size = DEFAULT_SIZE) Pageable page) {
		User user = userSession.getLoggedUser();
		if (user.getRoles().contains("ROLE_TEACHER"))
			return chapterService.generateDiagramInfoTeacherPage(page);
		else {
			return chapterService.generateDiagramInfoStudentPage(page, userSession.getLoggedUser());
		}
	}
}
