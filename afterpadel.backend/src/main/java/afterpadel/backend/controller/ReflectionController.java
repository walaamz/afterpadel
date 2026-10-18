
package afterpadel.backend.controller;

import afterpadel.backend.model.Reflection;
import afterpadel.backend.repository.ReflectionRepository;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDateTime;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/reflections")
public class ReflectionController {

    private final ReflectionRepository reflectionRepository;

    public ReflectionController(ReflectionRepository reflectionRepository) {
        this.reflectionRepository = reflectionRepository;
    }

    @GetMapping
    public List<Reflection> getAllReflections() {
        return reflectionRepository.findAll();
    }

    @PostMapping
    public Reflection createReflection(@Valid @RequestBody Reflection reflection) {
        reflection.setId(null);
        reflection.setCreatedAt(LocalDateTime.now());

        return reflectionRepository.save(reflection);
    }
}
