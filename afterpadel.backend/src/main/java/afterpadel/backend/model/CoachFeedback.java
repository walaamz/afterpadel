package afterpadel.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "coach_feedback")
public class CoachFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reflection_id", nullable = false)
    private Reflection reflection;

    @Column(nullable = false, unique = true, length = 64)
    private String shareToken;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String coachName;

    @Min(1)
    @Max(5)
    private Integer positioningRating;

    @Min(1)
    @Max(5)
    private Integer shotSelectionRating;

    @Min(1)
    @Max(5)
    private Integer consistencyRating;

    @Min(1)
    @Max(5)
    private Integer communicationRating;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    // Coach's assessment of each reflection answer
    @Min(1)
    @Max(5)
    private Integer wentWellAccuracy;

    @Min(1)
    @Max(5)
    private Integer challengesAccuracy;

    @Min(1)
    @Max(5)
    private Integer doDifferentlyAccuracy;

    @Min(1)
    @Max(5)
    private Integer overallFeelingAccuracy;

    // Optional feedback for each reflection answer
    @Column(columnDefinition = "TEXT")
    private String wentWellComment;

    @Column(columnDefinition = "TEXT")
    private String challengesComment;

    @Column(columnDefinition = "TEXT")
    private String doDifferentlyComment;

    @Column(columnDefinition = "TEXT")
    private String overallFeelingComment;

    // Overall feedback from the coach
    @Column(columnDefinition = "TEXT")
    private String keyTakeaways;

    @Column(columnDefinition = "TEXT")
    private String recommendedFocus;

    @Column(columnDefinition = "TEXT")
    private String additionalNotes;

    private LocalDateTime submittedAt;

    public CoachFeedback() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reflection getReflection() {
        return reflection;
    }

    public void setReflection(Reflection reflection) {
        this.reflection = reflection;
    }

    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCoachName() {
        return coachName;
    }

    public void setCoachName(String coachName) {
        this.coachName = coachName;
    }

    public Integer getPositioningRating() {
        return positioningRating;
    }

    public void setPositioningRating(Integer positioningRating) {
        this.positioningRating = positioningRating;
    }

    public Integer getShotSelectionRating() {
        return shotSelectionRating;
    }

    public void setShotSelectionRating(Integer shotSelectionRating) {
        this.shotSelectionRating = shotSelectionRating;
    }

    public Integer getConsistencyRating() {
        return consistencyRating;
    }

    public void setConsistencyRating(Integer consistencyRating) {
        this.consistencyRating = consistencyRating;
    }

    public Integer getCommunicationRating() {
        return communicationRating;
    }

    public void setCommunicationRating(Integer communicationRating) {
        this.communicationRating = communicationRating;
    }

    public String getObservations() {
        return observations;
    }

    public void setObservations(String observations) {
        this.observations = observations;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Integer getWentWellAccuracy() {
        return wentWellAccuracy;
    }

    public void setWentWellAccuracy(Integer wentWellAccuracy) {
        this.wentWellAccuracy = wentWellAccuracy;
    }

    public Integer getChallengesAccuracy() {
        return challengesAccuracy;
    }

    public void setChallengesAccuracy(Integer challengesAccuracy) {
        this.challengesAccuracy = challengesAccuracy;
    }

    public Integer getDoDifferentlyAccuracy() {
        return doDifferentlyAccuracy;
    }

    public void setDoDifferentlyAccuracy(Integer doDifferentlyAccuracy) {
        this.doDifferentlyAccuracy = doDifferentlyAccuracy;
    }

    public Integer getOverallFeelingAccuracy() {
        return overallFeelingAccuracy;
    }

    public void setOverallFeelingAccuracy(Integer overallFeelingAccuracy) {
        this.overallFeelingAccuracy = overallFeelingAccuracy;
    }

    public String getWentWellComment() {
        return wentWellComment;
    }

    public void setWentWellComment(String wentWellComment) {
        this.wentWellComment = wentWellComment;
    }

    public String getChallengesComment() {
        return challengesComment;
    }

    public void setChallengesComment(String challengesComment) {
        this.challengesComment = challengesComment;
    }

    public String getDoDifferentlyComment() {
        return doDifferentlyComment;
    }

    public void setDoDifferentlyComment(String doDifferentlyComment) {
        this.doDifferentlyComment = doDifferentlyComment;
    }

    public String getOverallFeelingComment() {
        return overallFeelingComment;
    }

    public void setOverallFeelingComment(String overallFeelingComment) {
        this.overallFeelingComment = overallFeelingComment;
    }

    public String getKeyTakeaways() {
        return keyTakeaways;
    }

    public void setKeyTakeaways(String keyTakeaways) {
        this.keyTakeaways = keyTakeaways;
    }

    public String getRecommendedFocus() {
        return recommendedFocus;
    }

    public void setRecommendedFocus(String recommendedFocus) {
        this.recommendedFocus = recommendedFocus;
    }

    public String getAdditionalNotes() {
        return additionalNotes;
    }

    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
}