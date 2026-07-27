package erp.system.notice.entity;

import erp.system.common.entity.BaseEntity;
import erp.system.department.entity.Department;
import erp.system.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Entity
@Table(name = "notice")
@SQLRestriction("deleted=false")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_id")
    private Long noticeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    private Employee writer;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "pinned", nullable = false)
    private boolean pinned;

    @Column(name = "view_count", nullable = false)
    private int viewCount;

    // null이면 전사공개. 값이 있으면 해당 부서 소속 직원에게만 노출된다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scope_department_id")
    private Department scopeDepartment;

    @Builder
    public Notice(Employee writer, String title, String content, boolean pinned, Department scopeDepartment) {
        this.writer = writer;
        this.title = title;
        this.content = content;
        this.pinned = pinned;
        this.viewCount = 0;
        this.scopeDepartment = scopeDepartment;
    }

    public void update(String title, String content, boolean pinned, Department scopeDepartment) {
        this.title = title;
        this.content = content;
        this.pinned = pinned;
        this.scopeDepartment = scopeDepartment;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }
}
