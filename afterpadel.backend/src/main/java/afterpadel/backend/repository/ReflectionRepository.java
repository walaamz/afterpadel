
package afterpadel.backend.repository;

import afterpadel.backend.model.Reflection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReflectionRepository extends JpaRepository<Reflection, Long> {

    List<Reflection> findByUserId(Long userId);
    Optional<Reflection> findByIdAndUserId(Long id, Long userId);
}
