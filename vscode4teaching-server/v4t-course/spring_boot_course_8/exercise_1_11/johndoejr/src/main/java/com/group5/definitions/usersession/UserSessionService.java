package com.group5.definitions.usersession;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import com.group5.definitions.model.User;
import com.group5.definitions.usersession.Tab;
import com.group5.definitions.usersession.UserSessionInfoComponent;

@Service
public class UserSessionService {

	@Autowired
	private UserSessionInfoComponent userSession;

	public void addUserToModel(Model model) {
		boolean logged = userSession.getLoggedUser() != null;
		model.addAttribute("logged", logged);
	}

	public void setActive(String tabName) {
		userSession.setActive(tabName);
	}

	public List<Tab> getOpenTabs() {
		return userSession.getOpenTabs();
	}

	public void addTab(Tab tab) {
		userSession.addTab(tab);
	}

	public void removeTab(long tabId) {
		userSession.removeTab(tabId);
	}

	public User getLoggedUser() {
		return userSession.getLoggedUser();
	}

	public boolean isLoggedUser() {
		return userSession.isLoggedUser();
	}
}
