package erp.system.notice.repository;

import erp.system.notice.entity.Notice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    // writer는 소프트 삭제될 수 있으므로 INNER JOIN(경로 탐색 n.writer.name)을 쓰면
    // 작성자가 퇴사한 공지 전체가 조회 결과에서 사라진다. LEFT JOIN으로 방지한다.
    // scopeDepartment가 null이면 전사공개, 값이 있으면 viewerDepartmentId가 일치할 때만(또는 관리자면 전부) 노출.
    @Query(value = """
            SELECT n FROM Notice n LEFT JOIN n.writer w
            WHERE (:keyword IS NULL OR n.title LIKE CONCAT('%', :keyword, '%') OR w.name LIKE CONCAT('%', :keyword, '%'))
            AND (:viewerIsAdmin = true OR n.scopeDepartment IS NULL OR n.scopeDepartment.departmentId = :viewerDepartmentId)
            ORDER BY n.pinned DESC, n.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(n) FROM Notice n LEFT JOIN n.writer w
            WHERE (:keyword IS NULL OR n.title LIKE CONCAT('%', :keyword, '%') OR w.name LIKE CONCAT('%', :keyword, '%'))
            AND (:viewerIsAdmin = true OR n.scopeDepartment IS NULL OR n.scopeDepartment.departmentId = :viewerDepartmentId)
            """)
    Page<Notice> search(@Param("keyword") String keyword, @Param("viewerIsAdmin") boolean viewerIsAdmin,
                         @Param("viewerDepartmentId") Long viewerDepartmentId, Pageable pageable);
}
