package afterpadel.backend.controller;

import afterpadel.backend.model.User;
import afterpadel.backend.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public record RegisterRequest(
            @NotBlank String fullName,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String password
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email is already registered."));
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        User savedUser = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                        "id", savedUser.getId(),
                        "fullName", savedUser.getFullName(),
                        "email", savedUser.getEmail()
                )
        );
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        String email = request.email().trim().toLowerCase();

        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(
                        request.password(),
                        user.getPasswordHash()
                ))
                .<ResponseEntity<?>>map(user -> {

                    var authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user.getEmail(),
                                    null,
                                    java.util.List.of()
                            );

                    SecurityContext context =
                            SecurityContextHolder.createEmptyContext();

                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);

                    httpRequest.getSession(true);
                    httpRequest.changeSessionId();

                    new HttpSessionSecurityContextRepository()
                            .saveContext(context, httpRequest, null);

                    return ResponseEntity.ok(Map.of(
                            "id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail()
                    ));
                })
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                        "error", "Invalid email or password."
                                ))
                );
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in."));
        }

        return userRepository.findByEmail(authentication.getName())
                .<ResponseEntity<?>>map(user ->
                        ResponseEntity.ok(Map.of(
                                "id", user.getId(),
                                "fullName", user.getFullName(),
                                "email", user.getEmail()
                        ))
                )
                .orElseGet(() ->
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "User not found."))
                );
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        var session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(Map.of(
                "message", "Logged out successfully."
        ));
    }
}