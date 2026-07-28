package erp.system.employee.service;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import erp.system.department.repository.DepartmentRepository;
import erp.system.employee.dto.EmployeeCreateRequest;
import erp.system.employee.repository.EmployeeRepository;
import erp.system.employmenttype.repository.EmploymentTypeRepository;
import erp.system.position.repository.PositionRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class EmployeeExcelParser {

    private static final String COL_NAME = "이름";
    private static final String COL_BIRTH_DATE = "생년월일(YYYY-MM-DD)";
    private static final String COL_PHONE = "연락처";
    private static final String COL_EMAIL = "이메일";
    private static final String COL_ADDRESS = "주소";
    private static final String COL_DEPARTMENT = "부서";
    private static final String COL_POSITION = "직급";
    private static final String COL_EMPLOYMENT_TYPE = "고용형태";
    private static final String COL_MANAGER_NO = "직속관리자 사번";
    private static final String COL_HIRE_DATE = "입사일(YYYY-MM-DD)";

    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmploymentTypeRepository employmentTypeRepository;
    private final EmployeeRepository employeeRepository;

    public record ParsedRow(int rowNumber, String name, EmployeeCreateRequest request, String error) {
    }

    public List<ParsedRow> parse(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "업로드할 엑셀 파일이 없습니다.");
        }

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            return parseSheet(workbook.getSheetAt(0));
        } catch (IOException | RuntimeException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "엑셀 파일을 읽을 수 없습니다. 양식을 확인해주세요.");
        }
    }

    private List<ParsedRow> parseSheet(Sheet sheet) {
        List<ParsedRow> rows = new ArrayList<>();
        if (sheet == null) {
            return rows;
        }

        Row headerRow = sheet.getRow(sheet.getFirstRowNum());
        if (headerRow == null) {
            return rows;
        }

        DataFormatter formatter = new DataFormatter();
        Map<String, Integer> columnIndex = new HashMap<>();
        for (Cell cell : headerRow) {
            String header = formatter.formatCellValue(cell).trim();
            if (StringUtils.hasText(header)) {
                columnIndex.put(header, cell.getColumnIndex());
            }
        }

        int lastRow = sheet.getLastRowNum();
        for (int rowIdx = headerRow.getRowNum() + 1; rowIdx <= lastRow; rowIdx++) {
            Row row = sheet.getRow(rowIdx);
            if (row == null || isBlankRow(row, columnIndex, formatter)) {
                continue;
            }

            int rowNumber = rowIdx + 1;
            String name = readText(row, columnIndex, COL_NAME, formatter);
            String departmentName = readText(row, columnIndex, COL_DEPARTMENT, formatter);
            String positionName = readText(row, columnIndex, COL_POSITION, formatter);

            LocalDate birthDate;
            try {
                birthDate = readDate(row, columnIndex, COL_BIRTH_DATE, formatter);
            } catch (DateTimeParseException e) {
                rows.add(new ParsedRow(rowNumber, name, null, "생년월일 형식이 올바르지 않습니다. (YYYY-MM-DD)"));
                continue;
            }

            if (!StringUtils.hasText(name) || birthDate == null
                    || !StringUtils.hasText(departmentName) || !StringUtils.hasText(positionName)) {
                rows.add(new ParsedRow(rowNumber, name, null, "이름/생년월일/부서/직급은 필수입니다."));
                continue;
            }

            Long departmentId = departmentRepository.findByDepartmentName(departmentName)
                    .map(department -> department.getDepartmentId())
                    .orElse(null);
            if (departmentId == null) {
                rows.add(new ParsedRow(rowNumber, name, null, "\"" + departmentName + "\" 부서를 찾을 수 없습니다."));
                continue;
            }

            Long positionId = positionRepository.findByPositionName(positionName)
                    .map(position -> position.getPositionId())
                    .orElse(null);
            if (positionId == null) {
                rows.add(new ParsedRow(rowNumber, name, null, "\"" + positionName + "\" 직급을 찾을 수 없습니다."));
                continue;
            }

            String employmentTypeName = readText(row, columnIndex, COL_EMPLOYMENT_TYPE, formatter);
            Long employmentTypeId = null;
            if (StringUtils.hasText(employmentTypeName)) {
                employmentTypeId = employmentTypeRepository.findByEmploymentTypeName(employmentTypeName)
                        .map(type -> type.getEmploymentTypeId())
                        .orElse(null);
                if (employmentTypeId == null) {
                    rows.add(new ParsedRow(rowNumber, name, null, "\"" + employmentTypeName + "\" 고용형태를 찾을 수 없습니다."));
                    continue;
                }
            }

            String managerNo = readText(row, columnIndex, COL_MANAGER_NO, formatter);
            Long managerId = null;
            if (StringUtils.hasText(managerNo)) {
                managerId = employeeRepository.findByEmployeeNo(managerNo)
                        .map(manager -> manager.getEmployeeId())
                        .orElse(null);
                if (managerId == null) {
                    rows.add(new ParsedRow(rowNumber, name, null, "직속관리자 사번 \"" + managerNo + "\"을(를) 찾을 수 없습니다."));
                    continue;
                }
            }

            LocalDate hireDate;
            try {
                hireDate = readDate(row, columnIndex, COL_HIRE_DATE, formatter);
            } catch (DateTimeParseException e) {
                rows.add(new ParsedRow(rowNumber, name, null, "입사일 형식이 올바르지 않습니다. (YYYY-MM-DD)"));
                continue;
            }

            EmployeeCreateRequest request = new EmployeeCreateRequest(
                    null,
                    departmentId,
                    positionId,
                    employmentTypeId,
                    managerId,
                    name,
                    birthDate,
                    emptyToNull(readText(row, columnIndex, COL_PHONE, formatter)),
                    emptyToNull(readText(row, columnIndex, COL_EMAIL, formatter)),
                    emptyToNull(readText(row, columnIndex, COL_ADDRESS, formatter)),
                    hireDate,
                    null,
                    null,
                    null,
                    null,
                    birthDate.toString().replace("-", ""),
                    null
            );
            rows.add(new ParsedRow(rowNumber, name, request, null));
        }

        return rows;
    }

    private LocalDate readDate(Row row, Map<String, Integer> columnIndex, String header, DataFormatter formatter) {
        Integer idx = columnIndex.get(header);
        if (idx == null) {
            return null;
        }
        Cell cell = row.getCell(idx);
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }
        String text = formatter.formatCellValue(cell).trim();
        if (!StringUtils.hasText(text)) {
            return null;
        }
        return LocalDate.parse(text);
    }

    private String readText(Row row, Map<String, Integer> columnIndex, String header, DataFormatter formatter) {
        Integer idx = columnIndex.get(header);
        if (idx == null) {
            return null;
        }
        Cell cell = row.getCell(idx);
        if (cell == null) {
            return null;
        }
        return formatter.formatCellValue(cell).trim();
    }

    private boolean isBlankRow(Row row, Map<String, Integer> columnIndex, DataFormatter formatter) {
        for (Integer idx : columnIndex.values()) {
            Cell cell = row.getCell(idx);
            if (cell != null && StringUtils.hasText(formatter.formatCellValue(cell))) {
                return false;
            }
        }
        return true;
    }

    private String emptyToNull(String value) {
        return StringUtils.hasText(value) ? value : null;
    }
}
