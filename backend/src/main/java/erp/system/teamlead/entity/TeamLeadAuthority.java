package erp.system.teamlead.entity;

import erp.system.common.entity.BaseEntity;
import erp.system.employee.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "team_lead_authority")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeamLeadAuthority extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_lead_authority_id")
    private Long teamLeadAuthorityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Builder
    public TeamLeadAuthority(Employee employee) {
        this.employee = employee;
        setActive(true);
    }
}
