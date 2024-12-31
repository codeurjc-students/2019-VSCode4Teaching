package com.group5.definitions.usersession;

public class Tab {
	private long id;
	private String tabName, tabURL;
	private boolean closable, active;

	public Tab(long id, String tabName, String tabURL, boolean closable) {
		super();
		this.id = id;
		this.tabName = tabName;
		this.tabURL = tabURL;
		this.closable = closable;
		this.active = true;
	}

	public String getTabName() {
		return tabName;
	}

	public void setTabName(String tabName) {
		this.tabName = tabName;
	}

	public String getTabURL() {
		return tabURL;
	}

	public void setTabURL(String tabURL) {
		this.tabURL = tabURL;
	}

	public boolean isClosable() {
		return closable;
	}

	public void setClosable(boolean closable) {
		this.closable = closable;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public long getId() {
		return id;
	}

	public void setId(long id) {
		this.id = id;
	}

	@Override
	public String toString() {
		return "Tab [id=" + id + ", tabName=" + tabName + ", tabURL=" + tabURL + ", closable=" + closable + ", active="
				+ active + "]";
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (int) (id ^ (id >>> 32));
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Tab other = (Tab) obj;
		if (id != other.id)
			return false;
		return true;
	}

}
