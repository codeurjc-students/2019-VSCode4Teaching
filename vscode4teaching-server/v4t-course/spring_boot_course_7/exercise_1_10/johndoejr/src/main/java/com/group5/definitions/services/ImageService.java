package com.group5.definitions.services;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageService {

	private static final Path FILES_FOLDER = Paths.get(System.getProperty("user.dir"), "images");

	@PostConstruct
	public void init() throws IOException {
		if (!Files.exists(FILES_FOLDER)) {
			Files.createDirectories(FILES_FOLDER);
		}
	}

	public Path handleFileDownload(long conceptId) throws FileNotFoundException, IOException {

		String fileName = "image-" + conceptId + ".jpg";

		Path image = FILES_FOLDER.resolve(fileName);

		if (!Files.exists(image)) {
			image = FILES_FOLDER.resolve("imagePlaceholder.png");
		}

		return image;
	}

	public void handleFileUpload(long conceptId, MultipartFile file) throws Exception {

		String fileName = "image-" + conceptId + ".jpg";

		if (!file.isEmpty()) {
			File uploadedFile = new File(FILES_FOLDER.toFile(), fileName);
			file.transferTo(uploadedFile);
		} else
			throw new RuntimeException("File is empty");
	}
}
