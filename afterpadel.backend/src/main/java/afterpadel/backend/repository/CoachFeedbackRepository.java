package afterpadel.backend.repository;

import afterpadel.backend.model.CoachFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoachFeedbackRepository
        extends JpaRepository<CoachFeedback, Long> {

    Optional<CoachFeedback> findByShareToken(String shareToken);

    List<CoachFeedback> findByReflectionId(Long reflectionId);
}