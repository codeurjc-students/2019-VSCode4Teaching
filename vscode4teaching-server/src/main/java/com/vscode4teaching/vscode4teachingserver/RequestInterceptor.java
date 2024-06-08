package com.vscode4teaching.vscode4teachingserver;

import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Configuration
public class RequestInterceptor implements WebMvcConfigurer {

    private final ApplicationContext applicationContext;

    public RequestInterceptor(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    private static final Set<Pattern> pathsHandledBySpring = new HashSet<>() {{
        // VSCode4Teaching app defined resources (all both API and WS endpoints)
        add(Pattern.compile("/api/.*"));
        add(Pattern.compile("/dashboard-refresh.*"));
        add(Pattern.compile("/liveshare.*"));

        // Spring Boot documentation (OpenAPI auto-generated doc and Swagger UI)
        add(Pattern.compile("/swagger-.*"));
        add(Pattern.compile("/v3/api-docs.*"));
    }};

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
                String requestURI = request.getRequestURI();

                // If incoming request maps to any path handled by Spring or to a static resource, let framework handle it
                if (pathsHandledBySpring.stream().anyMatch(pattern -> pattern.matcher(requestURI).matches())
                    || isStaticResource(requestURI)
                ) {
                    return true;
                }
                // Otherwise, request should be handled by Angular frontend
                else {
                    request.getRequestDispatcher("/index.html").forward(request, response);
                    return false;
                }
            }

            private boolean isStaticResource(String requestURI) {
                String staticResourcePath = "classpath:/static" + requestURI;
                Resource resource = applicationContext.getResource(staticResourcePath);
                try {
                    return resource.exists() && resource.isReadable();
                } catch (Exception e) {
                    return false;
                }
            }
        });
    }

}
