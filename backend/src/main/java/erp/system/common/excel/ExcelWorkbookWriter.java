package erp.system.common.excel;

import erp.system.common.exception.BusinessException;
import erp.system.common.exception.ErrorCode;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

public final class ExcelWorkbookWriter {

    private static final int DEFAULT_COLUMN_WIDTH = 4200;

    private ExcelWorkbookWriter() {
    }

    /** rows의 첫 번째 줄을 헤더로 간주해 굵게/배경색으로 강조하고, 나머지는 데이터 행으로 그대로 기록한다. */
    public static byte[] build(String sheetName, List<List<Object>> rows) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet(sanitizeSheetName(sheetName));
            CellStyle headerStyle = headerStyle(workbook);

            int maxColumns = 0;
            for (int r = 0; r < rows.size(); r++) {
                List<Object> cells = rows.get(r);
                Row row = sheet.createRow(r);
                for (int c = 0; c < cells.size(); c++) {
                    Cell cell = row.createCell(c);
                    writeCellValue(cell, cells.get(c));
                    if (r == 0) {
                        cell.setCellStyle(headerStyle);
                    }
                }
                maxColumns = Math.max(maxColumns, cells.size());
            }

            for (int c = 0; c < maxColumns; c++) {
                sheet.setColumnWidth(c, DEFAULT_COLUMN_WIDTH);
            }

            return toBytes(workbook);
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "엑셀 파일 생성에 실패했습니다.");
        }
    }

    private static void writeCellValue(Cell cell, Object value) {
        if (value == null) {
            return;
        }
        if (value instanceof Number number) {
            cell.setCellValue(number.doubleValue());
        } else if (value instanceof Boolean bool) {
            cell.setCellValue(bool);
        } else {
            cell.setCellValue(String.valueOf(value));
        }
    }

    private static CellStyle headerStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private static String sanitizeSheetName(String sheetName) {
        String cleaned = sheetName.replaceAll("[\\\\/?*\\[\\]:]", "").trim();
        if (cleaned.isEmpty()) {
            cleaned = "Sheet1";
        }
        return cleaned.length() > 31 ? cleaned.substring(0, 31) : cleaned;
    }

    private static byte[] toBytes(XSSFWorkbook workbook) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.INTERNAL_ERROR, "엑셀 파일 생성에 실패했습니다.");
        }
    }
}
