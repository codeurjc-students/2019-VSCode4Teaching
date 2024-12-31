package com.group5.definitions.utilities;

import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Page;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;

@Configuration
public class JacksonAdapter implements WebMvcConfigurer {

	@Bean
	public Jackson2ObjectMapperBuilder jacksonBuilder() {
		return new Jackson2ObjectMapperBuilder().failOnUnknownProperties(false).serializerByType(Page.class,
				new JsonPageSerializer());
		// Note: .serializationInclusion(Include.NON_EMPTY) to exclude empty
		// collection.
	}

	public class JsonPageSerializer extends JsonSerializer<Page> {

		@Override
		public void serialize(Page page, JsonGenerator jsonGen, SerializerProvider serializerProvider)
				throws IOException, JsonProcessingException {

			ObjectMapper om = new ObjectMapper().disable(MapperFeature.DEFAULT_VIEW_INCLUSION);
//                    .setSerializationInclusion(Include.NON_EMPTY);
			jsonGen.writeStartObject();
			jsonGen.writeFieldName("size");
			jsonGen.writeNumber(page.getSize());
			jsonGen.writeFieldName("number");
			jsonGen.writeNumber(page.getNumber());
			jsonGen.writeFieldName("totalElements");
			jsonGen.writeNumber(page.getTotalElements());
			jsonGen.writeFieldName("last");
			jsonGen.writeBoolean(page.isLast());
			jsonGen.writeFieldName("totalPages");
			jsonGen.writeNumber(page.getTotalPages());
			jsonGen.writeObjectField("sort", page.getSort());
			jsonGen.writeFieldName("first");
			jsonGen.writeBoolean(page.isFirst());
			jsonGen.writeFieldName("numberOfElements");
			jsonGen.writeNumber(page.getNumberOfElements());
			jsonGen.writeFieldName("content");
			jsonGen.writeRawValue(
					om.writerWithView(serializerProvider.getActiveView()).writeValueAsString(page.getContent()));
			jsonGen.writeEndObject();
		}

	}
}