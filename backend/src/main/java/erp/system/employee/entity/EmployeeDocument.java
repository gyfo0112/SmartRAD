package erp.system.employee.entity;

import erp.system.common.entity.CreatedAtEntity;
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
@Table(name = "employee_document")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EmployeeDocument extends CreatedAtEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employee_document_id")
    private Long employeeDocumentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "document_type", nullable = false, length = 30)
    private String documentType;

    @Column(name = "attachment_url", nullable = false, length = 300)
    private String attachmentUrl;

    @Column(name = "attachment_name", nullable = false, length = 200)
    private String attachmentName;

    @Builder
    public EmployeeDocument(Employee employee, String documentType, String attachmentUrl, String attachmentName) {
        this.employee = employee;
        this.documentType = documentType;
        this.attachmentUrl = attachmentUrl;
        this.attachmentName = attachmentName;
    }

    public void replace(String attachmentUrl, String attachmentName) {
        this.attachmentUrl = attachmentUrl;
        this.attachmentName = attachmentName;
    }
}
