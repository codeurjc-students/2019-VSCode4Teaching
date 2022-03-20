package com.group5.definitions.services;

public class DiagramChapterInfo {
	// Class used as a record for holding necessary diagram data for easier use in
	// the template
	private String chapterName;
	private long unmarked, correct, incorrect;

	public DiagramChapterInfo(String chapterName, long unmarked, long correct, long incorrect) {
		super();
		this.chapterName = chapterName;
		this.unmarked = unmarked;
		this.correct = correct;
		this.incorrect = incorrect;
	}

	public String getChapterName() {
		return chapterName;
	}

	public void setChapterName(String chapterName) {
		this.chapterName = chapterName;
	}

	public long getUnmarked() {
		return unmarked;
	}

	public void setUnmarked(long unmarked) {
		this.unmarked = unmarked;
	}

	public long getCorrect() {
		return correct;
	}

	public void setCorrect(long correct) {
		this.correct = correct;
	}

	public long getIncorrect() {
		return incorrect;
	}

	public void setIncorrect(long incorrect) {
		this.incorrect = incorrect;
	}

	@Override
	public String toString() {
		return "DiagramChapterInfo [chapterName=" + chapterName + ", unmarked=" + unmarked + ", correct=" + correct
				+ ", incorrect=" + incorrect + "]";
	}

}
