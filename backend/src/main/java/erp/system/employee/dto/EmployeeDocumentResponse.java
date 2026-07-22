package erp.system.employee.dto;

import erp.system.employee.entity.EmployeeDocument;

import java.time.LocalDateTime;

public record EmployeeDocumentResponse(
        Long employeeDocumentId,
        String documentType,
        String attachmentUrl,
        String attachmentName,
        LocalDateTime createdAt
) {
    public static EmployeeDocumentResponse from(EmployeeDocument document) {
        return new EmployeeDocumentResponse(
                document.getEmployeeDocumentId(),
                document.getDocumentType(),
                document.getAttachmentUrl(),
                document.getAttachmentName(),
                document.getCreatedAt()
        );
    }
}
