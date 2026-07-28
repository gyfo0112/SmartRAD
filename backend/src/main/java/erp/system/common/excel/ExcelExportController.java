package erp.system.common.excel;

import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;

/** 화면에 이미 표시된 표 형태 데이터를 실제 .xlsx 바이너리로 변환해주는 범용 다운로드 엔드포인트. */
@RestController
@RequestMapping("/api/excel")
public class ExcelExportController {

    private static final MediaType XLSX_MEDIA_TYPE =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    @PostMapping("/export")
    public ResponseEntity<byte[]> export(@Valid @RequestBody ExcelExportRequest request) {
        byte[] bytes = ExcelWorkbookWriter.build(request.sheetName(), request.rows());

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(sanitizeFileName(request.fileName()), StandardCharsets.UTF_8)
                .build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(disposition);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(XLSX_MEDIA_TYPE)
                .body(bytes);
    }

    private static String sanitizeFileName(String rawFileName) {
        String cleaned = rawFileName.replaceAll("[\\r\\n\\\\/]", "_").trim();
        if (cleaned.isEmpty()) {
            cleaned = "export";
        }
        return cleaned.endsWith(".xlsx") ? cleaned : cleaned + ".xlsx";
    }
}
