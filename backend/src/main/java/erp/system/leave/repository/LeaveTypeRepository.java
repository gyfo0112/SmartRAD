package erp.system.leave.repository;

import erp.system.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {
    Optional<LeaveType> findByLeaveTypeName(String leaveTypeName);
}
