package es.codeurjc.vscode4teaching.services.exceptions;

public class FileNotFoundException extends NotFoundException {

    private static final long serialVersionUID = 657454636231135156L;

    public FileNotFoundException(String msg) {
        super(msg);
    }
}