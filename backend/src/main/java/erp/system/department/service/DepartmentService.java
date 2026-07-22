package erp.system.department.service;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.department.dto.DepartmentCreateRequest;
import erp.system.department.dto.DepartmentResponse;
import erp.system.department.dto.DepartmentUpdateRequest;
import erp.system.department.entity.Department;
import erp.system.department.repository.DepartmentRepository;
import erp.system.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public List<DepartmentResponse> getAll() {
        return departmentRepository.findAll().stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    @Transactional
    public DepartmentResponse create(DepartmentCreateRequest request) {
        Department parent = resolveParent(request.parentDepartmentId());

        Department department = Department.builder()
                .departmentName(request.departmentName())
                .parentDepartment(parent)
                .build();

        return DepartmentResponse.from(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentUpdateRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

        if (Objects.equals(id, request.parentDepartmentId())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "자기 자신을 상위 부서로 지정할 수 없습니다.");
        }

        Department parent = resolveParent(request.parentDepartmentId());
        
        // 순환 참조 방지를 위해 parent가 현재 부서의 하위 부서인지 검사하는 로직이 필요할 수 있지만, 
        // 간단한 1 depth 에서는 위 체크로 충분하거나, 향후 트리를 순회하는 검증이 추가될 수 있음

        erp.system.employee.entity.Employee head = null;
        if (request.departmentHeadId() != null) {
            head = employeeRepository.findById(request.departmentHeadId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.VALIDATION_ERROR, "해당 직원을 찾을 수 없습니다."));
            if (head.getDepartment() == null || !head.getDepartment().getDepartmentId().equals(id)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "해당 부서에 소속된 직원만 부서장으로 지정할 수 있습니다.");
            }
        }

        department.update(request.departmentName(), parent, head);
        return DepartmentResponse.from(department);
    }

    @Transactional
    public void delete(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));

        if (employeeRepository.existsByDepartment_DepartmentId(id)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "소속된 직원이 있어 삭제할 수 없습니다.");
        }

        if (departmentRepository.existsByParentDepartment_DepartmentId(id)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "하위 부서가 존재하여 삭제할 수 없습니다.");
        }

        department.markDeleted();
    }

    private Department resolveParent(Long parentDepartmentId) {
        if (parentDepartmentId == null) {
            return null;
        }
        return departmentRepository.findById(parentDepartmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DEPARTMENT_NOT_FOUND));
    }
}
