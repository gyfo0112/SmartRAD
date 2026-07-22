package erp.system.department.dto;

import erp.system.common.util.SoftDeleteAware;
import erp.system.department.entity.Department;

public record DepartmentResponse(
        Long departmentId,
        String departmentName,
        Long parentDepartmentId,
        String parentDepartmentName,
        Long departmentHeadId,
        String departmentHeadName
) {
    public static DepartmentResponse from(Department department) {
        Department parent = SoftDeleteAware.resolve(department.getParentDepartment(), Department::getDepartmentName);
        erp.system.employee.entity.Employee head = SoftDeleteAware.resolve(department.getDepartmentHead(), erp.system.employee.entity.Employee::getName);
        return new DepartmentResponse(
                department.getDepartmentId(),
                department.getDepartmentName(),
                SoftDeleteAware.identifierOf(parent, () -> parent.getDepartmentId()),
                parent != null ? parent.getDepartmentName() : null,
                SoftDeleteAware.identifierOf(head, () -> head.getEmployeeId()),
                head != null ? head.getName() : null
        );
    }
}
