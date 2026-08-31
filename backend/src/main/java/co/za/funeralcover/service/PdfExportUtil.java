package co.za.funeralcover.service;

import org.openpdf.text.Document;
import org.openpdf.text.DocumentException;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

final class PdfExportUtil {

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.ITALIC);
    private static final Font HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
    private static final Font CELL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9);
    private static final DateTimeFormatter GENERATED_AT_FORMAT =
            DateTimeFormatter.ofPattern("d MMM yyyy, HH:mm").withZone(ZoneId.systemDefault());

    private PdfExportUtil() {
    }

    static byte[] buildReport(String title, String scopeDescription, List<String> headers, List<List<String>> rows) {
        return buildReport(title, scopeDescription, headers, rows, null);
    }

    static byte[] buildReport(String title, String scopeDescription, List<String> headers, List<List<String>> rows,
                               float[] relativeColumnWidths) {
        Document document = new Document(PageSize.A4.rotate(), 24, 24, 32, 24);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph(title, TITLE_FONT));
            Paragraph subtitle = new Paragraph(scopeDescription
                    + " — generated " + GENERATED_AT_FORMAT.format(java.time.Instant.now()), SUBTITLE_FONT);
            subtitle.setSpacingAfter(12);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(headers.size());
            table.setWidthPercentage(100);
            table.setHeaderRows(1);
            if (relativeColumnWidths != null) {
                table.setWidths(relativeColumnWidths);
            }

            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Paragraph(header, HEADER_FONT));
                cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                cell.setPadding(5);
                table.addCell(cell);
            }

            for (List<String> row : rows) {
                for (String value : row) {
                    PdfPCell cell = new PdfPCell(new Paragraph(value == null ? "" : value, CELL_FONT));
                    cell.setPadding(4);
                    table.addCell(cell);
                }
            }

            if (rows.isEmpty()) {
                PdfPCell empty = new PdfPCell(new Paragraph("No records match this filter.", CELL_FONT));
                empty.setColspan(headers.size());
                empty.setPadding(8);
                table.addCell(empty);
            }

            document.add(table);
        } catch (DocumentException e) {
            throw new IllegalStateException("Could not generate PDF report", e);
        } finally {
            document.close();
        }
        return out.toByteArray();
    }
}
