package com.group5.definitions.model;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonView;

@Entity
public class Concept {
	public interface Basic {
	}

	public interface Answers {
	}

	public interface Chapters {
	}

	public interface Url extends Basic {
	}

	@JsonView(Basic.class)
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;
	@JsonView(Basic.class)
	private String conceptName;
	@JsonView(Url.class)
	private String URL = "http://www.urldelconcepto.com";
	@JsonView(Chapters.class)
	@ManyToOne
	private Chapter chapter;
	@JsonView(Answers.class)
	@OneToMany(mappedBy = "concept", fetch = FetchType.EAGER, cascade = CascadeType.REMOVE)
	private List<Answer> answers = new ArrayList<>();

	protected Concept() {
	}

	public Concept(String conceptName, Chapter chapter) {
		super();
		this.conceptName = conceptName;
		this.chapter = chapter;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getConceptName() {
		return conceptName;
	}

	public void setConceptName(String conceptName) {
		this.conceptName = conceptName;
	}

	public List<Answer> getAnswers() {
		return answers;
	}

	public void setAnswers(List<Answer> answers) {
		this.answers = answers;
	}

	public void addAnswer(Answer answer) {
		this.answers.add(answer);
	}

	public String getURL() {
		return URL;
	}

	public void setURL(String uRL) {
		URL = uRL;
	}

	public Chapter getChapter() {
		return chapter;
	}

	public void setChapter(Chapter chapter) {
		this.chapter = chapter;
	}

	@Override
	public String toString() {
		return "Concept [id=" + id + ", conceptName=" + conceptName + ", URL=" + URL + ", answers=" + answers + "]";
	}

}
