
package afterpadel.backend.controller;

import afterpadel.backend.model.Notification;
import afterpadel.backend.model.User;
import afterpadel.backend.repository.NotificationRepository;
import afterpadel.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getNotifications(
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(notification -> Map.<String, Object>of(
                        "id", notification.getId(),
                        "title", notification.getTitle(),
                        "message", notification.getMessage(),
                        "link", notification.getLink(),
                        "read", notification.isRead(),
                        "createdAt", notification.getCreatedAt().toString()
                ))
                .toList();
    }

    @PatchMapping("/{id}/read")
    public Map<String, String> markAsRead(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getCurrentUser(authentication);

        Notification notification = notificationRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found."
                ));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Notification not found."
            );
        }

        notification.setRead(true);
        notificationRepository.save(notification);

        return Map.of("message", "Notification marked as read.");
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
}
