package afterpadel.backend.controller;

import afterpadel.backend.model.CoachFeedback;
import afterpadel.backend.model.Reflection;
import afterpadel.backend.model.User;
import afterpadel.backend.repository.CoachFeedbackRepository;
import afterpadel.backend.repository.ReflectionRepository;
import afterpadel.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.time.LocalDateTime;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import afterpadel.backend.model.Notification;
import afterpadel.backend.repository.NotificationRepository;


@RestController
@RequestMapping("/api/coach")
public class CoachController {

    private final CoachFeedbackRepository coachFeedbackRepository;
    private final ReflectionRepository reflectionRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public CoachController(
            CoachFeedbackRepository coachFeedbackRepository,
            ReflectionRepository reflectionRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository
    ) {
        this.coachFeedbackRepository = coachFeedbackRepository;
        this.reflectionRepository = reflectionRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping("/share/{reflectionId}")
    public Map<String, String> createShareLink(
            @PathVariable Long reflectionId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "You must be logged in."
            );
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found."
                ));

        Reflection reflection = reflectionRepository
                .findByIdAndUserId(reflectionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reflection not found."
                ));

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        CoachFeedback feedback = new CoachFeedback();
        feedback.setReflection(reflection);
        feedback.setShareToken(token);

        coachFeedbackRepository.save(feedback);

        return Map.of(
                "shareUrl",
                "http://localhost:5173/coach/review/" + token
        );
    }

    @GetMapping("/review/{token}")
    public Map<String, Object> getSharedReflection(
            @PathVariable String token
    ) {
        CoachFeedback feedback = coachFeedbackRepository
                .findByShareToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Sharing link not found."
                ));

        Reflection reflection = feedback.getReflection();

        return Map.of(
                "reflection", Map.ofEntries(
                        Map.entry("id", reflection.getId()),
                        Map.entry("sessionType", reflection.getSessionType()),
                        Map.entry("date", reflection.getDate().toString()),
                        Map.entry(
                                "duration",
                                reflection.getDuration() == null ? 0 : reflection.getDuration()
                        ),
                        Map.entry("wentWell", reflection.getWentWell() == null ? "" : reflection.getWentWell()),
                        Map.entry("struggledWith", reflection.getStruggledWith() == null ? "" : reflection.getStruggledWith()),
                        Map.entry("doDifferently", reflection.getDoDifferently() == null ? "" : reflection.getDoDifferently()),
                        Map.entry("nextFocus", reflection.getNextFocus() == null ? "" : reflection.getNextFocus()),
                        Map.entry("satisfaction", reflection.getSatisfaction() == null ? 0 : reflection.getSatisfaction())
                ),
                "submitted", feedback.getSubmittedAt() != null
        );
    }

    @PostMapping("/review/{token}/submit")
    public Map<String, String> submitCoachFeedback(
            @PathVariable String token,
            @Valid @RequestBody CoachFeedbackRequest request
    ) {
        CoachFeedback feedback = coachFeedbackRepository
                .findByShareToken(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Sharing link not found."
                ));

        if (feedback.getSubmittedAt() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Feedback has already been submitted."
            );
        }

        feedback.setCoachName(request.coachName().trim());
        feedback.setWentWellAccuracy(request.wentWellAccuracy());
        feedback.setChallengesAccuracy(request.challengesAccuracy());
        feedback.setDoDifferentlyAccuracy(request.doDifferentlyAccuracy());
        feedback.setOverallFeelingAccuracy(request.overallFeelingAccuracy());

        feedback.setWentWellComment(request.wentWellComment());
        feedback.setChallengesComment(request.challengesComment());
        feedback.setDoDifferentlyComment(request.doDifferentlyComment());
        feedback.setOverallFeelingComment(request.overallFeelingComment());

        feedback.setKeyTakeaways(request.keyTakeaways());
        feedback.setRecommendedFocus(request.recommendedFocus());
        feedback.setAdditionalNotes(request.additionalNotes());
        feedback.setSubmittedAt(LocalDateTime.now());

        coachFeedbackRepository.save(feedback);

        Reflection reflection = feedback.getReflection();

        Notification notification = new Notification();
        notification.setUser(reflection.getUser());
        notification.setTitle("Coach Review Completed");
        notification.setMessage(
                "Your coach has reviewed your " +
                        reflection.getSessionType() +
                        " session. View their feedback."
        );
        notification.setLink(
                "/coach/compare/" +
                        reflection.getId() +
                        "/" +
                        feedback.getId()
        );

        notificationRepository.save(notification);

        return Map.of("message", "Coach feedback submitted successfully.");
    }

    public record CoachFeedbackRequest(
            @jakarta.validation.constraints.NotBlank
            String coachName,

            @jakarta.validation.constraints.NotNull
            @Min(1) @Max(5)
            Integer wentWellAccuracy,

            @jakarta.validation.constraints.NotNull
            @Min(1) @Max(5)
            Integer challengesAccuracy,

            @jakarta.validation.constraints.NotNull
            @Min(1) @Max(5)
            Integer doDifferentlyAccuracy,

            @jakarta.validation.constraints.NotNull
            @Min(1) @Max(5)
            Integer overallFeelingAccuracy,

            String wentWellComment,
            String challengesComment,
            String doDifferentlyComment,
            String overallFeelingComment,

            String keyTakeaways,
            String recommendedFocus,
            String additionalNotes
    ) {}

    @GetMapping("/feedback/{reflectionId}")
    public List<Map<String, Object>> getCoachFeedback(
            @PathVariable Long reflectionId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "You must be logged in."
            );
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found."
                ));

        reflectionRepository.findByIdAndUserId(reflectionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reflection not found."
                ));

        return coachFeedbackRepository.findByReflectionId(reflectionId)
                .stream()
                .filter(feedback -> feedback.getSubmittedAt() != null)
                .map(feedback -> {
                    Map<String, Object> result = new HashMap<>();

                    result.put("requestId", feedback.getId());
                    result.put("coachName", feedback.getCoachName());

                    result.put("wentWellAccuracy", feedback.getWentWellAccuracy());
                    result.put("challengesAccuracy", feedback.getChallengesAccuracy());
                    result.put("doDifferentlyAccuracy", feedback.getDoDifferentlyAccuracy());
                    result.put("overallFeelingAccuracy", feedback.getOverallFeelingAccuracy());

                    result.put("wentWellComment", feedback.getWentWellComment());
                    result.put("challengesComment", feedback.getChallengesComment());
                    result.put("doDifferentlyComment", feedback.getDoDifferentlyComment());
                    result.put("overallFeelingComment", feedback.getOverallFeelingComment());

                    result.put("keyTakeaways", feedback.getKeyTakeaways());
                    result.put("recommendedFocus", feedback.getRecommendedFocus());
                    result.put("additionalNotes", feedback.getAdditionalNotes());

                    result.put("submittedAt", feedback.getSubmittedAt().toString());
                    return result;
                })
                .toList();
    }
    @GetMapping("/requests")
    public List<Map<String, Object>> getCoachRequests(
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "You must be logged in."
            );
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found."
                ));

        List<Map<String, Object>> results = new ArrayList<>();

        for (Reflection reflection : reflectionRepository.findByUserId(user.getId())) {
            for (CoachFeedback feedback :
                    coachFeedbackRepository.findByReflectionId(reflection.getId())) {

                Map<String, Object> result = new HashMap<>();

                result.put("requestId", feedback.getId());
                result.put("reflectionId", reflection.getId());
                result.put("sessionType", reflection.getSessionType());
                result.put("date", reflection.getDate().toString());
                result.put("shareUrl",
                        "http://localhost:5173/coach/review/" + feedback.getShareToken());
                result.put("status",
                        feedback.getSubmittedAt() == null ? "PENDING" : "COMPLETED");

                results.add(result);
            }
        }

        return results;
    }

    @DeleteMapping("/requests/{requestId}")
    public Map<String, String> cancelCoachRequest(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "You must be logged in."
            );
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found."
                ));

        CoachFeedback feedback = coachFeedbackRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Coach request not found."
                ));

        // Only the player who owns the reflection can cancel its request.
        if (!feedback.getReflection().getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Coach request not found."
            );
        }

        // Completed reviews cannot be cancelled.
        if (feedback.getSubmittedAt() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Completed reviews cannot be cancelled."
            );
        }

        coachFeedbackRepository.delete(feedback);

        return Map.of("message", "Coach review request cancelled.");
    }
}