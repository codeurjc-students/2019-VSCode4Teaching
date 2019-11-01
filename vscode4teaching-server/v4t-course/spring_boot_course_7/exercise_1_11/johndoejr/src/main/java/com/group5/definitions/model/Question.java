package com.group5.definitions.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonView;

@Entity
public class Question {
	public interface Basic {
	}

	public interface Saved extends Basic, Answer.Student, Justification.Student {
	}

	@JsonView(Saved.class)
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;
	@Column(columnDefinition = "TEXT")
	@JsonView(Basic.class)
	private String questionText;
	@JsonView(Basic.class)
	private int type;
	// Only used in Yes/No questions
	@JsonView(Basic.class)
	private boolean yesNoQuestion;
	@JsonView(Saved.class)
	private boolean userResponse; // true for yes, false for no
	@JsonView(Saved.class)
	private boolean marked;
	@JsonView(Saved.class)
	private boolean correct;
	@JsonView(Saved.class)
	@ManyToOne
	private Answer answer;
	@JsonView(Saved.class)
	@OneToOne
	private Justification justification; // Justification related to the question (type 1, 3)
	@OneToOne
	private User user;

	protected Question() {
	}

	public Question(String questionText, int type, Answer answer, boolean yesNoQuestion, User user) {
		super();
		this.yesNoQuestion = yesNoQuestion;
		this.questionText = questionText;
		this.type = type;
		this.answer = answer;
		this.user = user;
	}

	public Question(String questionText, int type, Answer answer, boolean yesNoQuestion, Justification justification,
			User user) {
		super();
		this.yesNoQuestion = yesNoQuestion;
		this.questionText = questionText;
		this.type = type;
		this.answer = answer;
		this.justification = justification;
		this.user = user;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public String getQuestionText() {
		return questionText;
	}

	public void setQuestionText(String questionText) {
		this.questionText = questionText;
	}

	public Answer getAnswer() {
		return answer;
	}

	public void setAnswer(Answer answer) {
		this.answer = answer;
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	public Justification getJustification() {
		return justification;
	}

	public void setJustification(Justification justification) {
		this.justification = justification;
	}

	public boolean isMarked() {
		return marked;
	}

	public void setMarked(boolean marked) {
		this.marked = marked;
	}

	public boolean isCorrect() {
		return correct;
	}

	public void setCorrect(boolean correct) {
		this.correct = correct;
	}

	public boolean isYesNoQuestion() {
		return yesNoQuestion;
	}

	public void setYesNoQuestion(boolean yesNoQuestion) {
		this.yesNoQuestion = yesNoQuestion;
	}

	public boolean isUserResponse() {
		return userResponse;
	}

	public void setUserResponse(boolean userResponse) {
		this.userResponse = userResponse;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	@Override
	public String toString() {
		return "Question [id=" + id + ", questionText=" + questionText + ", type=" + type + ", yesNoQuestion="
				+ yesNoQuestion + ", userResponse=" + userResponse + ", marked=" + marked + ", correct=" + correct
				+ ", answer=" + answer + ", justification=" + justification + ", user=" + user + "]";
	}

}
