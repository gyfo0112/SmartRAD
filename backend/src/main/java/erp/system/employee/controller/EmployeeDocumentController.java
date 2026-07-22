package erp.system.employee.controller;

import erp.system.employee.dto.EmployeeDocumentResponse;
import erp.system.employee.service.EmployeeDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/employees/{employeeId}/documents")
@RequiredArgsConstructor
public class EmployeeDocumentController {

    private final EmployeeDocumentService employeeDocumentService;

    @GetMapping
    public List<EmployeeDocumentResponse> getList(@PathVariable Long employeeId,
                                                    @AuthenticationPrincipal Long requesterId,
                                                    Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        return employeeDocumentService.getList(employeeId, requesterId, isAdmin);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmployeeDocumentResponse> upload(
            @PathVariable Long employeeId,
            @RequestParam String documentType,
            @RequestParam MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeDocumentService.upload(employeeId, documentType, file));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> delete(@PathVariable Long employeeId, @PathVariable Long documentId) {
        employeeDocumentService.delete(employeeId, documentId);
        return ResponseEntity.noContent().build();
    }
}
