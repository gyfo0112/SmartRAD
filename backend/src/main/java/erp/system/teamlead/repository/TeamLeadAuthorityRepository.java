package erp.system.teamlead.repository;

import erp.system.teamlead.entity.TeamLeadAuthority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TeamLeadAuthorityRepository extends JpaRepository<TeamLeadAuthority, Long> {

    Optional<TeamLeadAuthority> findByEmployee_EmployeeId(Long employeeId);

    @Query("SELECT t FROM TeamLeadAuthority t JOIN FETCH t.employee e LEFT JOIN FETCH e.department "
            + "WHERE t.active = true ORDER BY t.createdAt DESC")
    List<TeamLeadAuthority> findAllByActiveTrue();

    @Query("SELECT t.employee.employeeId FROM TeamLeadAuthority t WHERE t.active = true")
    List<Long> findActiveEmployeeIds();
}
