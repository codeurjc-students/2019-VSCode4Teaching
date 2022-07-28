package com.group5.definitions.restcontrollers;

import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.group5.definitions.services.ImageService;

@RestController
@RequestMapping("/api")
public class RestImageController {

	@Autowired
	private ImageService imageService;

	@GetMapping("/concepts/{id}/image")
	public ResponseEntity<byte[]> getImage(@PathVariable long id) {
		try {
			Path image = imageService.handleFileDownload(id);
			final HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.IMAGE_JPEG);
			return new ResponseEntity<>(Files.readAllBytes(image), headers, HttpStatus.OK);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}

	@PostMapping(value = "/concepts/{id}/image", consumes = "multipart/form-data")
	public ResponseEntity<byte[]> getImage(@PathVariable long id, @RequestParam("file") MultipartFile file) {
		try {
			imageService.handleFileUpload(id, file);
			final HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.IMAGE_JPEG);
			return new ResponseEntity<>(file.getBytes(), headers, HttpStatus.CREATED);
		} catch (Exception e) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
}
