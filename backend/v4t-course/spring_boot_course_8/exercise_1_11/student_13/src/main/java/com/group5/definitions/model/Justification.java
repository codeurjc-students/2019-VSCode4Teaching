package com.group5.definitions.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonView;

@Entity
public class Justification {

	public interface Basic extends Student {
	}

	public interface Student {
	}

	public interface AnswerView extends Basic {
	}

	@JsonView(Student.class)
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;
	@JsonView(Student.class)
	private String justificationText;
	@JsonView(Basic.class)
	private boolean marked;
	@JsonView(Basic.class)
	private boolean valid;
	@JsonView(Basic.class)
	private String error;
	@JsonView(AnswerView.class)
	@ManyToOne
	private Answer answer;
	@OneToOne
	private User user;

	protected Justification() {
	}

	public Justification(String justificationText, boolean marked, User user) {
		super();
		this.justificationText = justificationText;
		this.marked = marked;
		this.user = user;
	}

	public String getJustificationText() {
		return justificationText;
	}

	public void setJustificationText(String justificationText) {
		this.justificationText = justificationText;
	}

	public boolean isValid() {
		return valid;
	}

	public void setValid(boolean valid) {
		this.valid = valid;
	}

	public String getError() {
		return error;
	}

	public void setError(String error) {
		this.error = error;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	public Answer getAnswer() {
		return answer;
	}

	public void setAnswer(Answer answer) {
		this.answer = answer;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public boolean isMarked() {
		return marked;
	}

	public void setMarked(boolean marked) {
		this.marked = marked;
	}

	@Override
	public String toString() {
		return "Justification [id=" + id + ", justificationText=" + justificationText + ", marked=" + marked
				+ ", valid=" + valid + ", error=" + error + ", answer=" + answer + ", user=" + user + "]";
	}

}
