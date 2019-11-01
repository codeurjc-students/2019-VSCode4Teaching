package com.group5.definitions.usersession;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

import com.group5.definitions.model.User;

@Component
@SessionScope
public class UserSessionInfoComponent {

	private User user;
	private List<Tab> openTabs;

	public UserSessionInfoComponent() {
		openTabs = new CopyOnWriteArrayList<>();
		openTabs.add(new Tab(0, "inicio", "/", false));
	}

	public List<Tab> getOpenTabs() {
		return openTabs;
	}

	public void addTab(Tab tab) {
		openTabs.add(tab);
		setActive(tab.getTabName());
	}

	public void setActive(String tabName) {
		for (Tab t : openTabs) {
			if (t.isActive()) {
				t.setActive(false);
			}
			if (t.getTabName().equals(tabName)) {
				t.setActive(true);
			}
		}
	}

	public void removeTab(long id) {
		openTabs.remove(new Tab(id, null, null, false));

	}

	public void resetTabs() {
		openTabs = new ArrayList<>();
		openTabs.add(new Tab(0, "inicio", "/", false));
	}

	public User getLoggedUser() {
		return user;
	}

	public void setLoggedUser(User user) {
		this.user = user;
	}

	public boolean isLoggedUser() {
		return this.user != null;
	}

	@Override
	public String toString() {
		return "UserComponent [user=" + (user != null ? user.toString() : "null") + "]";
	}
}
