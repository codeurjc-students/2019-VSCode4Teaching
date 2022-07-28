package com.vscode4teaching.vscode4teachingserver.security;

import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTAuthenticationEntryPoint;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTRequestFilter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private JWTAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private UserDetailsService jwtUserDetailsService;

    @Autowired
    private JWTRequestFilter jwtRequestFilter;

    @Autowired
    public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(jwtUserDetailsService).passwordEncoder(passwordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        final String teacherRole = "TEACHER";
        final String studentRole = "STUDENT";
        http.authorizeRequests()
                .antMatchers(HttpMethod.GET, "/api/courses", "/api/csrf", "/api/courses/code/*", "/api/v2/courses/code/*", "/api/courses/*/creator")
                .permitAll()
                .antMatchers(HttpMethod.POST, "/api/login", "/api/register", "/api/teachers/register", "/api/teachers/invitation")
                .permitAll()
                .antMatchers(HttpMethod.POST, "/api/exercises/*/teachers/**", "/api/courses", "/api/courses/*/exercises", "/api/v2/courses/*/exercises", "/api/courses/*/users")
                .hasAnyRole(teacherRole)
                .antMatchers(HttpMethod.PUT, "/api/courses/*", "/api/courses/*/exercises/*", "/api/exercises/*")
                .hasAnyRole(teacherRole)
                .antMatchers(HttpMethod.DELETE, "/api/courses/*", "/api/courses/*/exercises/*", "/api/exercises/*")
                .hasAnyRole(teacherRole)
                .antMatchers(HttpMethod.POST, "/api/exercises/*/files/template")
                .hasAnyRole(teacherRole)
                .antMatchers(HttpMethod.GET, "/api/exercises/*/info/teacher")
                .hasAnyRole(teacherRole)
                .antMatchers("/api/**")
                .hasAnyRole(studentRole)
                .anyRequest().permitAll().and()
                .csrf().csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()).and().exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint).and().sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
