package es.codeurjc.vscode4teaching.security;

import es.codeurjc.vscode4teaching.security.jwt.JWTAuthenticationEntryPoint;
import es.codeurjc.vscode4teaching.security.jwt.JWTRequestFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.*;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;
import java.util.function.Supplier;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        final String teacherRole = "TEACHER";
        final String studentRole = "STUDENT";

        return http
            .authorizeHttpRequests((auth) ->
                auth
                    // Specific endpoints for every user (logged in or not)
                    .requestMatchers(HttpMethod.GET, "/api/courses", "/api/csrf", "/api/courses/code/*", "/api/v2/courses/code/*", "/api/courses/*/creator")
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/login", "/api/register", "/api/teachers/register", "/api/teachers/invitation")
                    .permitAll()

                    // Specific endpoints for teachers
                    .requestMatchers(HttpMethod.GET, "/api/exercises/*/info/teacher")
                    // .hasAnyRole(teacherRole)
                    .permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/courses", "/api/courses/*/exercises", "/api/courses/*/users", "/api/exercises/*/teachers/**", "/api/exercises/*/files/template", "/api/exercises/*/files/solution", "/api/v2/courses/*/exercises")
                    .hasAnyRole(teacherRole)
                    .requestMatchers(HttpMethod.PUT, "/api/courses/*", "/api/courses/*/exercises/*", "/api/exercises/*")
                    .hasAnyRole(teacherRole)
                    .requestMatchers(HttpMethod.DELETE, "/api/courses/*", "/api/courses/*/exercises/*", "/api/exercises/*")
                    .hasAnyRole(teacherRole)
                    .requestMatchers(HttpMethod.GET, "/dashboard-refresh")
                    .hasAnyRole(teacherRole)

                    // Every other endpoint in /api requires student role
                    .requestMatchers("/api/**")
                    .hasAnyRole(studentRole)
                    .anyRequest().permitAll()
            )
            .csrf(csrf ->
                csrf
                    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                    .csrfTokenRequestHandler(new CsrfTokenRequestHandler() {
                        private final CsrfTokenRequestHandler plain = new CsrfTokenRequestAttributeHandler();
                        private final CsrfTokenRequestHandler xor = new XorCsrfTokenRequestAttributeHandler();

                        @Override
                        public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
                            this.xor.handle(request, response, csrfToken);
                            csrfToken.get();
                        }

                        @Override
                        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
                            String headerValue = request.getHeader(csrfToken.getHeaderName());
                            return (StringUtils.hasText(headerValue) ? this.plain : this.xor).resolveCsrfTokenValue(request, csrfToken);
                        }
                    })
            )
            .cors((cors) -> cors.configurationSource(request -> {
                CorsConfiguration corsConfiguration = new CorsConfiguration();
                corsConfiguration.setAllowedOrigins(List.of("http://localhost:4200", "http://localhost:8080"));
                corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                corsConfiguration.setAllowedHeaders(List.of("*"));
                corsConfiguration.setAllowCredentials(true);
                return corsConfiguration;
            }))
            .exceptionHandling((exceptionHandling) -> exceptionHandling.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .sessionManagement((sessionManagement) -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManagerBean(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
