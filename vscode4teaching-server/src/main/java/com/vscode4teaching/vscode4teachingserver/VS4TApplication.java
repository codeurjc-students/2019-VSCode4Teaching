package com.vscode4teaching.vscode4teachingserver;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.service.VendorExtension;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.TimeZone;

@EnableSwagger2
@SpringBootApplication
public class VS4TApplication {

	@Value("${v4t.version}")
	public String v4tVersion;

	/**
	 * API Documentation configuration (OpenAPI 3.0.3 format)
	 */
	@Bean
	public Docket apiDocumentation() {
		return new Docket(DocumentationType.OAS_30)
				.select()
				.apis(RequestHandlerSelectors.basePackage("com.vscode4teaching.vscode4teachingserver"))
				.paths(PathSelectors.ant("/api/**"))
				.build()
				.apiInfo(new ApiInfo(
						"VSCode4Teaching",
						"VSCode4Teaching REST API Documentation.",
						v4tVersion,
						"",
						new Contact("VSCode4Teaching", "https://github.com/codeurjc-students/2019-VSCode4Teaching", ""),
						"V4T License (Apache-2.0 LICENSE)",
						"https://github.com/codeurjc-students/2019-VSCode4Teaching/blob/master/LICENSE",
						new ArrayList<>()
					)
				);
	}

	public static void main(String[] args) {
		SpringApplication.run(VS4TApplication.class, args);
	}

	@PostConstruct
	public void timezoneConfiguration() {
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
	}

}
