package erp.system.department.entity;

import erp.system.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Setter
@Entity
@Table(name = "department")
@SQLRestriction("deleted=false")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Department extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "department_name", nullable = false, length = 100)
    private String departmentName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_department_id")
    private Department parentDepartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_head_id")
    private erp.system.employee.entity.Employee departmentHead;

    @Builder
    public Department(String departmentName, Department parentDepartment, erp.system.employee.entity.Employee departmentHead) {
        this.departmentName = departmentName;
        this.parentDepartment = parentDepartment;
        this.departmentHead = departmentHead;
    }

    public void update(String departmentName, Department parentDepartment, erp.system.employee.entity.Employee departmentHead) {
        this.departmentName = departmentName;
        this.parentDepartment = parentDepartment;
        this.departmentHead = departmentHead;
    }
}
