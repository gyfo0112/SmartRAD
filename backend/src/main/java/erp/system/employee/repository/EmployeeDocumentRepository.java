package erp.system.employee.repository;

import erp.system.employee.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findAllByEmployee_EmployeeIdOrderByCreatedAtDesc(Long employeeId);

    Optional<EmployeeDocument> findByEmployee_EmployeeIdAndDocumentType(Long employeeId, String documentType);
}
