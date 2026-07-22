package erp.system.auditlog.entity;

import erp.system.common.entity.CreatedAtEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "audit_log")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditLog extends CreatedAtEntity {

    public static final String ACTION_EMPLOYEE_CREATE = "EMPLOYEE_CREATE";
    public static final String ACTION_EMPLOYEE_BULK_CREATE = "EMPLOYEE_BULK_CREATE";
    public static final String ACTION_EMPLOYEE_UPDATE = "EMPLOYEE_UPDATE";
    public static final String ACTION_EMPLOYEE_DELETE = "EMPLOYEE_DELETE";
    public static final String ACTION_DEPARTMENT_CREATE = "DEPARTMENT_CREATE";
    public static final String ACTION_DEPARTMENT_UPDATE = "DEPARTMENT_UPDATE";
    public static final String ACTION_DEPARTMENT_DELETE = "DEPARTMENT_DELETE";
    public static final String ACTION_PAYROLL_BASE_SALARY_UPDATE = "PAYROLL_BASE_SALARY_UPDATE";
    public static final String ACTION_PAYROLL_BULK_EMPLOYMENT_TYPE = "PAYROLL_BULK_EMPLOYMENT_TYPE";
    public static final String ACTION_PAYROLL_BULK_BASIC_REGISTER = "PAYROLL_BULK_BASIC_REGISTER";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_log_id")
    private Long auditLogId;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_name", length = 100)
    private String actorName;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "target_description", nullable = false, length = 500)
    private String targetDescription;

    @Column(name = "detail", length = 1000)
    private String detail;

    @Builder
    public AuditLog(Long actorId, String actorName, String actionType, String targetDescription, String detail) {
        this.actorId = actorId;
        this.actorName = actorName;
        this.actionType = actionType;
        this.targetDescription = targetDescription;
        this.detail = detail;
    }
}
