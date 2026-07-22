package erp.system.department.repository;

import erp.system.department.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByParentDepartment_DepartmentId(Long parentDepartmentId);
}
