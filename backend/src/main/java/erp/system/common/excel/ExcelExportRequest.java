package erp.system.common.excel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record ExcelExportRequest(
        @NotBlank(message = "시트 이름은 필수입니다.") String sheetName,
        @NotBlank(message = "파일 이름은 필수입니다.") String fileName,
        @NotEmpty(message = "내보낼 데이터가 없습니다.") List<List<Object>> rows
) {
}
