
package afterpadel.backend.controller;

import afterpadel.backend.model.Reflection;
import afterpadel.backend.repository.ReflectionRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import afterpadel.backend.model.User;
import afterpadel.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import afterpadel.backend.model.Notification;
import afterpadel.backend.repository.NotificationRepository;

import java.util.List;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
@RequestMapping("/api/reflections")
public class ReflectionController {

    private final ReflectionRepository reflectionRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public ReflectionController(
            ReflectionRepository reflectionRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository
    ) {
        this.reflectionRepository = reflectionRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "You must be logged in."
            );
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found."
                ));
    }

    @GetMapping
    public List<Reflection> getAllReflections(Authentication authentication) {
        User user = getCurrentUser(authentication);
        return reflectionRepository.findByUserId(user.getId());
    }

    @PostMapping
    public Reflection createReflection(
            @Valid @RequestBody Reflection reflection,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);

        reflection.setId(null);
        reflection.setCreatedAt(LocalDateTime.now());
        reflection.setUser(user);

        Reflection savedReflection = reflectionRepository.save(reflection);

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Reflection Saved");
        notification.setMessage(
                "Your " + savedReflection.getSessionType() +
                        " session reflection has been saved to your Journal."
        );
        notification.setLink("/journal");

        notificationRepository.save(notification);

        return savedReflection;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteReflection(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);

        Reflection reflection = reflectionRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reflection not found"
                ));

        reflectionRepository.delete(reflection);
    }

    @PutMapping("/{id}")
    public Reflection updateReflection(
            @PathVariable Long id,
            @Valid @RequestBody Reflection updatedReflection,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);

        Reflection existingReflection = reflectionRepository
                .findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Reflection not found"
                ));

        existingReflection.setSessionType(updatedReflection.getSessionType());
        existingReflection.setDate(updatedReflection.getDate());
        existingReflection.setDuration(updatedReflection.getDuration());
        existingReflection.setScore(updatedReflection.getScore());
        existingReflection.setSessionFocus(updatedReflection.getSessionFocus());

        existingReflection.setWentWell(updatedReflection.getWentWell());
        existingReflection.setStruggledWith(updatedReflection.getStruggledWith());
        existingReflection.setDoDifferently(updatedReflection.getDoDifferently());
        existingReflection.setNextFocus(updatedReflection.getNextFocus());

        existingReflection.setWentWellFollowUp(updatedReflection.getWentWellFollowUp());
        existingReflection.setStruggledWithFollowUp(updatedReflection.getStruggledWithFollowUp());
        existingReflection.setDoDifferentlyFollowUp(updatedReflection.getDoDifferentlyFollowUp());
        existingReflection.setNextFocusFollowUp(updatedReflection.getNextFocusFollowUp());

        existingReflection.setSatisfaction(updatedReflection.getSatisfaction());

        return reflectionRepository.save(existingReflection);
    }
}
