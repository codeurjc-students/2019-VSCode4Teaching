package com.group5.definitions;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.group5.definitions.model.Answer;
import com.group5.definitions.model.Chapter;
import com.group5.definitions.model.Concept;
import com.group5.definitions.model.Justification;
import com.group5.definitions.model.Question;
import com.group5.definitions.model.User;
import com.group5.definitions.repositories.AnswerRepository;
import com.group5.definitions.repositories.ChapterRepository;
import com.group5.definitions.repositories.ConceptRepository;
import com.group5.definitions.repositories.JustificationRepository;
import com.group5.definitions.repositories.QuestionRepository;
import com.group5.definitions.repositories.UserRepository;

@Component
public class DatabaseInfoLoader {

	@Autowired
	private ChapterRepository chapterRepository;

	@Autowired
	private ConceptRepository conceptRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private AnswerRepository answerRepository;

	@Autowired
	private QuestionRepository questionRepository;

	@Autowired
	private JustificationRepository justificationRepository;

	@PostConstruct
	private void initDatabase() {
		// Init placeholder data
		// Users
		User student = new User("user", "pass", "ROLE_STUDENT");
		User student2 = new User("user2", "pass2", "ROLE_STUDENT");
		User admin = new User("admin", "adminpass", "ROLE_STUDENT", "ROLE_TEACHER");
		userRepository.save(student);
		userRepository.save(student2);
		userRepository.save(admin);
		// Home page
		Chapter chapter1 = new Chapter("Tema 1: Desarrollo web servidor");
		Chapter chapter2 = new Chapter("Tema 2: Despliegue de webs");
		Chapter chapter3 = new Chapter("Tema 3: Desarrollo web de cliente avanzado: SPA");
		Chapter chapter4 = new Chapter("Tema 4");
		Chapter chapter5 = new Chapter("Tema 5");
		Chapter chapter6 = new Chapter("Tema 6");
		Chapter chapter7 = new Chapter("Tema 7");
		Chapter chapter8 = new Chapter("Tema 8");
		Chapter chapter9 = new Chapter("Tema 9");
		Chapter chapter10 = new Chapter("Tema 10");
		Chapter chapter11 = new Chapter("Tema 11");
		Concept c11 = new Concept("Spring", chapter1);
		Concept c12 = new Concept("APIs REST", chapter1);
		Concept c13 = new Concept("Java EE", chapter1);
		Concept c14 = new Concept("Javascript", chapter1);
		Concept c15 = new Concept("HTML", chapter1);
		Concept c16 = new Concept("CSS", chapter1);
		Concept c17 = new Concept("Base de datos", chapter1);
		Concept c18 = new Concept("Adobe Flash", chapter1);
		Concept c19 = new Concept("TCP", chapter1);
		Concept c110 = new Concept("Navegador", chapter1);
		Concept c111 = new Concept("Servidor", chapter1);
		chapter1.getConcepts().add(c11);
		chapter1.getConcepts().add(c12);
		chapter1.getConcepts().add(c13);
		chapter1.getConcepts().add(c14);
		chapter1.getConcepts().add(c15);
		chapter1.getConcepts().add(c16);
		chapter1.getConcepts().add(c17);
		chapter1.getConcepts().add(c18);
		chapter1.getConcepts().add(c19);
		chapter1.getConcepts().add(c110);
		chapter1.getConcepts().add(c111);
		Concept c21 = new Concept("Docker", chapter2);
		chapter2.getConcepts().add(c21);
		Concept c31 = new Concept("Angular", chapter3);
		chapter3.getConcepts().add(c31);
		chapterRepository.save(chapter1);
		chapterRepository.save(chapter2);
		chapterRepository.save(chapter3);
		chapterRepository.save(chapter4);
		chapterRepository.save(chapter5);
		chapterRepository.save(chapter6);
		chapterRepository.save(chapter7);
		chapterRepository.save(chapter8);
		chapterRepository.save(chapter9);
		chapterRepository.save(chapter10);
		chapterRepository.save(chapter11);
		conceptRepository.save(c11);
		conceptRepository.save(c12);
		conceptRepository.save(c13);
		conceptRepository.save(c14);
		conceptRepository.save(c15);
		conceptRepository.save(c16);
		conceptRepository.save(c17);
		conceptRepository.save(c18);
		conceptRepository.save(c19);
		conceptRepository.save(c110);
		conceptRepository.save(c111);
		conceptRepository.save(c21);
		conceptRepository.save(c31);

		Answer[] answers = new Answer[12];
		answers[0] = new Answer(
				"UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB",
				true, student, c11);
		answers[0].setCorrect(true);
		answers[1] = new Answer("UN FRAMEWORK DE DESARROLLO DE APLICACIONES WEB", true, student, c11);
		answers[1].setCorrect(false);

		answers[2] = new Answer("UN FRAMEWORK DE DESARROLLO DE APLICACIONES EMPRESARIALES BASADO EN JAVA", false,
				student, c11);
		answers[3] = new Answer("UN FRAMEWORK COMERCIAL", true, admin, c11);
		answers[3].setCorrect(false);
		answers[4] = new Answer(
				"UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR WEB COMO EN UN SERVIDOR DE APLICACIONES",
				true, student, c11);
		answers[4].setCorrect(true);
		answers[5] = new Answer("UN FRAMEWORK BASADO EN JAVA EE", true, student, c11);
		answers[5].setCorrect(true);
		answers[6] = new Answer("UN FRAMEWORK QUE PERMITE DESARROLLAR APLICACIONES DE SERVIDOR", true, student, c11);
		answers[6].setCorrect(true);
		answers[7] = new Answer(
				"UN FRAMEWORK PARA DESARROLLAR APLICACIONES WEB, SERVICIOS REST, WEBSOCKETS, ANÁLISIS DE BIG DATA...",
				true, student, c11);
		answers[7].setCorrect(true);
		answers[8] = new Answer(
				"UN FRAMEWORK QUE SOPORTA ACCESO A BASES DE DATOS TANTO RELACIONALES COMO NO RELACIONALES", true,
				student, c11);
		answers[8].setCorrect(true);
		answers[9] = new Answer("UN FRAMEWORK QUE SOPORTA GROOVY", true, student, c11);
		answers[9].setCorrect(true);
		answers[10] = new Answer("UN FRAMEWORK QUE SOPORTA REACTOR", true, student, c11);
		answers[10].setCorrect(true);
		answers[11] = new Answer("UN FRAMEWORK CUYAS APLICACIONES SE SUELEN EJECUTAR EN TOMCAT O JETTY", true, student,
				c11);
		answers[11].setCorrect(true);
		for (Answer a : answers) {
			answerRepository.save(a);
		}
		Justification j1 = new Justification("SÓLO SE PUEDE UTILIZAR PARA DESARROLLAR SERVICIOS REST", true, student);
		j1.setValid(false);
		j1.setError(
				"SPRING PERMITE EL DESARROLLO DE DIVERSOS TIPOS DE APLICACIONES DE SERVIDOR: APLICACIONES WEB, SERVICIOS REST, ANÁLISIS DE DATOS BIG DATA...");

		Justification j2 = new Justification("ES UN FRAMEWORK DE SOFTWARE LIBRE", true, student);
		j2.setValid(true);

		j1.setAnswer(answers[1]);
		j2.setAnswer(answers[3]);

		justificationRepository.save(j1);
		justificationRepository.save(j2);

		Question[] questions = new Question[13];
		questions[0] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[0].setMarked(true);
		questions[0].setUserResponse(true);
		questions[0].setCorrect(true);
		questions[1] = new Question(
				"¿ES CIERTO QUE SPRING NO ES UN FRAMEWORK DE DESARROLLO DE APLICACIONES WEB PORQUE SÓLO SE PUEDE UTILIZAR PARA DESARROLLAR SERVICIOS REST?",
				3, answers[1], true, j1, student);
		questions[1].setMarked(true);
		questions[1].setUserResponse(true);
		questions[1].setCorrect(false);
		questions[2] = new Question("¿QUÉ ES SPRING?", 0, answers[2], false, student);
		Justification j3 = new Justification("ES UNA IMPLEMENTACIÓN DE JPA", false, student);
		j3.setAnswer(answers[3]);
		justificationRepository.save(j3);
		questions[3] = new Question("¿POR QUÉ NO ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK COMERCIAL?", 1,
				answers[3], false, j3, student);
		questions[4] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[4].setMarked(true);
		questions[4].setUserResponse(true);
		questions[4].setCorrect(true);
		questions[5] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[5].setMarked(true);
		questions[5].setUserResponse(true);
		questions[5].setCorrect(true);
		questions[6] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[6].setMarked(true);
		questions[6].setUserResponse(true);
		questions[6].setCorrect(true);
		questions[7] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[7].setMarked(true);
		questions[7].setUserResponse(true);
		questions[7].setCorrect(true);
		questions[8] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[8].setMarked(true);
		questions[8].setUserResponse(true);
		questions[8].setCorrect(true);
		questions[9] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[9].setMarked(true);
		questions[9].setUserResponse(true);
		questions[9].setCorrect(true);
		questions[10] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[10].setMarked(true);
		questions[10].setUserResponse(true);
		questions[10].setCorrect(true);
		questions[11] = new Question(
				"¿ES CORRECTO AFIRMAR QUE SPRING ES UN FRAMEWORK QUE PERMITE A UNA APLICACIÓN EJECUTARSE TANTO EN UN SERVIDOR DE APLICACIONES COMO EN UN SERVIDOR WEB?",
				2, answers[0], true, student);
		questions[11].setMarked(true);
		questions[11].setUserResponse(true);
		questions[11].setCorrect(true);
		questions[12] = new Question(
				"¿ES CIERTO QUE SPRING NO ES UN FRAMEWORK DE DESARROLLO DE APLICACIONES WEB PORQUE SÓLO SE PUEDE UTILIZAR PARA DESARROLLAR SERVICIOS REST?",
				3, answers[1], true, j1, student);
		questions[12].setMarked(true);
		questions[12].setUserResponse(true);
		questions[12].setCorrect(false);
		for (Question q : questions) {
			questionRepository.save(q);
		}

	}

}