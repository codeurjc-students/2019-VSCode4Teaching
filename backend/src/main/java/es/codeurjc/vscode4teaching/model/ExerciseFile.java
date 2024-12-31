package es.codeurjc.vscode4teaching.model;

import com.fasterxml.jackson.annotation.JsonView;
import es.codeurjc.vscode4teaching.model.views.FileViews;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file")
public class ExerciseFile {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(FileViews.GeneralView.class)
    private Long id;

    @JsonView(FileViews.GeneralView.class)
    @Column(unique = true)
    private String path;

    // If null the file is a template
    @ManyToOne
    @JsonView(FileViews.OwnerView.class)
    private User owner;

    @CreationTimestamp
    @JsonView(FileViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(FileViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public ExerciseFile(String path) {
        this.path = path;
    }

    public ExerciseFile(String path, User owner) {
        this.path = path;
        this.owner = owner;
    }

    public ExerciseFile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public LocalDateTime getUpdateDateTime() {
        return updateDateTime;
    }
}