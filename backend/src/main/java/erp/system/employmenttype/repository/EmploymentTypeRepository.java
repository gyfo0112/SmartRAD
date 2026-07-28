package erp.system.employmenttype.repository;

import erp.system.employmenttype.entity.EmploymentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmploymentTypeRepository extends JpaRepository<EmploymentType, Long> {
    Optional<EmploymentType> findByEmploymentTypeName(String employmentTypeName);
}
