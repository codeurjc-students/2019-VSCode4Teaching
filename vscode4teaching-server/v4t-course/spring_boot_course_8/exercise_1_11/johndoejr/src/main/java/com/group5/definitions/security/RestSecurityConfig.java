package com.group5.definitions.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@Order(1)
public class RestSecurityConfig extends WebSecurityConfigurerAdapter {

	@Autowired
	public UserRepositoryAuthenticationProvider userRepoAuthProvider;

	@Override
	protected void configure(HttpSecurity http) throws Exception {

		http.antMatcher("/api/**");

		http.authorizeRequests().antMatchers(HttpMethod.GET, "/api/logIn").authenticated();
		http.authorizeRequests().antMatchers(HttpMethod.GET, "/api/logOut").permitAll();

		// URLs that need authentication to access to it
		http.authorizeRequests().antMatchers(HttpMethod.POST, "/api").hasAnyRole("TEACHER");
		http.authorizeRequests().antMatchers(HttpMethod.POST, "/api/chapters/**").hasAnyRole("TEACHER");
		http.authorizeRequests().antMatchers(HttpMethod.DELETE, "/api/**").hasAnyRole("TEACHER");

		// This may need to be edited in case more URLs are done
		http.authorizeRequests().antMatchers(HttpMethod.PUT, "/api/concepts/**").hasAnyRole("TEACHER");
		http.authorizeRequests().antMatchers(HttpMethod.PUT, "/api/answers/**").hasAnyRole("TEACHER");
		http.authorizeRequests().antMatchers(HttpMethod.DELETE, "/api/answers/**").hasAnyRole("TEACHER");

		http.authorizeRequests().antMatchers(HttpMethod.GET, "/api/diagraminfo").hasAnyRole("TEACHER", "STUDENT");
		http.authorizeRequests().antMatchers(HttpMethod.GET, "/concepts/*/markedquestion").hasAnyRole("STUDENT");
		http.authorizeRequests().antMatchers(HttpMethod.GET, "/concepts/*/unmarkedquestion").hasAnyRole("STUDENT");
		http.authorizeRequests().antMatchers(HttpMethod.GET, "/concepts/*/newquestion").hasAnyRole("STUDENT");

		http.authorizeRequests().antMatchers(HttpMethod.GET, "/concepts/*").hasAnyRole("TEACHER");
		// Unnecesary but left here in case is needed in the future
		// http.authorizeRequests().antMatchers(HttpMethod.POST,
		// "/api/concept/*/image").hasAnyRole("TEACHER");

		// Other URLs can be accessed without authentication
		http.authorizeRequests().anyRequest().permitAll();

		// Disable CSRF protection (it is difficult to implement in REST APIs)
		http.csrf().disable();

		// Use Http Basic Authentication
		http.httpBasic();

		// Do not redirect when logout
		http.logout().logoutSuccessHandler((rq, rs, a) -> {
		});
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {

		// Database authentication provider
		auth.authenticationProvider(userRepoAuthProvider);
	}
}