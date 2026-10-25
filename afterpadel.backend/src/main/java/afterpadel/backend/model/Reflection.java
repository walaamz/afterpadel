
package afterpadel.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "reflections")
public class Reflection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    @NotBlank(message = "Session type is required")
    @Column(nullable = false)
    private String sessionType;

    @NotNull(message = "Session date is required")
    @Column(name = "session_date", nullable = false)
    private LocalDate date;

    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer duration;

    private String score;

    private String sessionFocus;

    @Column(columnDefinition = "TEXT")
    private String wentWell;

    @Column(columnDefinition = "TEXT")
    private String wentWellFollowUp;

    @Column(columnDefinition = "TEXT")
    private String struggledWith;

    @Column(columnDefinition = "TEXT")
    private String struggledWithFollowUp;

    @Column(columnDefinition = "TEXT")
    private String doDifferently;

    @Column(columnDefinition = "TEXT")
    private String doDifferentlyFollowUp;

    @Column(columnDefinition = "TEXT")
    private String nextFocus;

    @Column(columnDefinition = "TEXT")
    private String nextFocusFollowUp;

    @Min(value = 1, message = "Satisfaction must be between 1 and 5")
    @Max(value = 5, message = "Satisfaction must be between 1 and 5")
    private Integer satisfaction;

    public Reflection() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSessionType() {
        return sessionType;
    }

    public void setSessionType(String sessionType) {
        this.sessionType = sessionType;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public String getSessionFocus() {
        return sessionFocus;
    }

    public void setSessionFocus(String sessionFocus) {
        this.sessionFocus = sessionFocus;
    }

    public String getWentWell() {
        return wentWell;
    }

    public void setWentWell(String wentWell) {
        this.wentWell = wentWell;
    }

    public String getStruggledWith() {
        return struggledWith;
    }

    public void setStruggledWith(String struggledWith) {
        this.struggledWith = struggledWith;
    }

    public String getDoDifferently() {
        return doDifferently;
    }

    public void setDoDifferently(String doDifferently) {
        this.doDifferently = doDifferently;
    }

    public String getNextFocus() {
        return nextFocus;
    }

    public void setNextFocus(String nextFocus) {
        this.nextFocus = nextFocus;
    }

    public Integer getSatisfaction() {
        return satisfaction;
    }

    public void setSatisfaction(Integer satisfaction) {
        this.satisfaction = satisfaction;
    }

    public String getWentWellFollowUp() {
        return wentWellFollowUp;
    }

    public void setWentWellFollowUp(String wentWellFollowUp) {
        this.wentWellFollowUp = wentWellFollowUp;
    }

    public String getStruggledWithFollowUp() {
        return struggledWithFollowUp;
    }

    public void setStruggledWithFollowUp(String struggledWithFollowUp) {
        this.struggledWithFollowUp = struggledWithFollowUp;
    }

    public String getDoDifferentlyFollowUp() {
        return doDifferentlyFollowUp;
    }

    public void setDoDifferentlyFollowUp(String doDifferentlyFollowUp) {
        this.doDifferentlyFollowUp = doDifferentlyFollowUp;
    }

    public String getNextFocusFollowUp() {
        return nextFocusFollowUp;
    }

    public void setNextFocusFollowUp(String nextFocusFollowUp) {
        this.nextFocusFollowUp = nextFocusFollowUp;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
