package com.petwellness.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.petwellness.dto.PetResponse;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class PdfReportService {

    public byte[] generateHealthReport(PetResponse pet) throws DocumentException {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, out);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
        Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
        Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        Font tableBodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        // Header Table
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        try {
            headerTable.setWidths(new float[] { 1.5f, 1f });
        } catch (DocumentException e) {
            e.printStackTrace();
        }

        // Left Cell (Title & Date)
        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        Paragraph title = new Paragraph("Pet Health Report", titleFont);
        title.setSpacingBefore(20);
        leftCell.addElement(title);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        Paragraph date = new Paragraph("Generated on: " + LocalDate.now().format(formatter), subTitleFont);
        date.setSpacingBefore(10);
        leftCell.addElement(date);
        headerTable.addCell(leftCell);

        // Right Cell (Pet Details)
        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph petName = new Paragraph("Pet Name: " + pet.getName(),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        petName.setAlignment(Element.ALIGN_RIGHT);
        petName.setSpacingBefore(20);
        rightCell.addElement(petName);

        Paragraph breed = new Paragraph("Breed: " + (pet.getBreed() != null ? pet.getBreed() : pet.getSpecies()),
                subTitleFont);
        breed.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(breed);

        Paragraph age = new Paragraph("Age: " + pet.getAge() + " years", subTitleFont);
        age.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(age);

        Paragraph gender = new Paragraph("Gender: " + pet.getGender(), subTitleFont);
        gender.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(gender);

        headerTable.addCell(rightCell);
        document.add(headerTable);

        // Separator line
        document.add(new Paragraph("\n"));

        // Medical History
        Paragraph medTitle = new Paragraph("Medical History", sectionFont);
        medTitle.setSpacingBefore(20);
        medTitle.setSpacingAfter(10);
        document.add(medTitle);

        PdfPTable medTable = new PdfPTable(5);
        medTable.setWidthPercentage(100);

        addTableHeader(medTable, new String[] { "Visit Date", "Doctor", "Diagnosis", "Treatment", "Follow-up" },
                tableHeaderFont);

        if (pet.getMedicalHistories() != null && !pet.getMedicalHistories().isEmpty()) {
            for (PetResponse.MedicalHistoryResponse mh : pet.getMedicalHistories()) {
                addTableCell(medTable, mh.getVisitDate() != null ? mh.getVisitDate().toString() : "-", tableBodyFont);
                addTableCell(medTable, mh.getVetName() != null ? mh.getVetName() : "-", tableBodyFont);
                addTableCell(medTable, mh.getDiagnosis() != null ? mh.getDiagnosis() : "-", tableBodyFont);
                addTableCell(medTable, mh.getTreatment() != null ? mh.getTreatment() : "-", tableBodyFont);
                addTableCell(medTable, "-", tableBodyFont); // No explicit follow-up in schema, using -
            }
        } else {
            PdfPCell emptyCell = new PdfPCell(new Phrase("No medical history available.", tableBodyFont));
            emptyCell.setColspan(5);
            emptyCell.setPadding(8);
            emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            medTable.addCell(emptyCell);
        }
        document.add(medTable);

        // Vaccination History
        Paragraph vacTitle = new Paragraph("Vaccination History", sectionFont);
        vacTitle.setSpacingBefore(30);
        vacTitle.setSpacingAfter(10);
        document.add(vacTitle);

        PdfPTable vacTable = new PdfPTable(6);
        vacTable.setWidthPercentage(100);

        addTableHeader(vacTable, new String[] { "Vaccine", "Dose", "Doctor", "Given Date", "Next Due", "Status" },
                tableHeaderFont);

        if (pet.getVaccinations() != null && !pet.getVaccinations().isEmpty()) {
            for (PetResponse.VaccinationResponse vac : pet.getVaccinations()) {
                addTableCell(vacTable, vac.getVaccineName() != null ? vac.getVaccineName() : "-", tableBodyFont);
                addTableCell(vacTable, "1", tableBodyFont); // Hardcoded dose for layout match
                addTableCell(vacTable, vac.getAdministeredBy() != null ? vac.getAdministeredBy() : "-", tableBodyFont);
                addTableCell(vacTable, vac.getDateGiven() != null ? vac.getDateGiven().toString() : "-", tableBodyFont);
                addTableCell(vacTable, vac.getNextDueDate() != null ? vac.getNextDueDate().toString() : "-",
                        tableBodyFont);

                String status = vac.isCompleted() ? "COMPLETED" : "UPCOMING";
                PdfPCell statusCell = new PdfPCell(
                        new Phrase(status, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                statusCell.setPadding(8);
                statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                statusCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                vacTable.addCell(statusCell);
            }
        } else {
            PdfPCell emptyCell = new PdfPCell(new Phrase("No vaccination history available.", tableBodyFont));
            emptyCell.setColspan(6);
            emptyCell.setPadding(8);
            emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            vacTable.addCell(emptyCell);
        }
        document.add(vacTable);

        document.close();
        return out.toByteArray();
    }

    private void addTableHeader(PdfPTable table, String[] headers, Font font) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, font));
            cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            cell.setPadding(8);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }
    }

    private void addTableCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(cell);
    }
}
