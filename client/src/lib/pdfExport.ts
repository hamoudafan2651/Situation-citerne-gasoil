import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TankerRecord } from '@/contexts/DataContext';
import { Language, translations } from './translations';

interface PDFExportOptions {
  records: TankerRecord[];
  language: Language;
  title?: string;
  startDate?: string;
  endDate?: string;
}

const getTranslation = (language: Language, key: string): string => {
  const trans = translations[language];
  return (trans as any)[key] || key;
};

export const exportToPDF = ({
  records,
  language,
  title,
  startDate,
  endDate,
}: PDFExportOptions) => {
  try {
    const doc = new (jsPDF as any)({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    // Set font
    doc.setFont('Arial');

    // Title
    const titleText = title || getTranslation(language, 'export.title');
    doc.setFontSize(16);
    doc.setFont('Arial', 'bold');
    doc.text(titleText, pageWidth / 2, margin + 10, { align: 'center' });

    // Organization Info
    doc.setFontSize(10);
    doc.setFont('Arial', 'normal');
    const org = getTranslation(language, 'footer.organization');
    const dept = getTranslation(language, 'footer.department');
    doc.text(org, pageWidth / 2, margin + 18, { align: 'center' });
    doc.text(dept, pageWidth / 2, margin + 24, { align: 'center' });

    // Date Range Info
    if (startDate || endDate) {
      const dateText = `${getTranslation(language, 'export.startDate')}: ${startDate || '-'} | ${getTranslation(language, 'export.endDate')}: ${endDate || '-'}`;
      doc.setFontSize(9);
      doc.text(dateText, pageWidth / 2, margin + 30, { align: 'center' });
    }

    // Table Headers
    const headers = [
      getTranslation(language, 'dashboard.serialNum'),
      getTranslation(language, 'dashboard.tankerNum'),
      getTranslation(language, 'dashboard.entry'),
      getTranslation(language, 'dashboard.exit'),
      getTranslation(language, 'dashboard.bcNum'),
      getTranslation(language, 'dashboard.ordered'),
      getTranslation(language, 'dashboard.loaded'),
      getTranslation(language, 'dashboard.oldIdx'),
      getTranslation(language, 'dashboard.currentIdx'),
      getTranslation(language, 'dashboard.destination'),
    ];

    // Table Data
    const tableData = records.map((record, index) => [
      (index + 1).toString(),
      record.tankerNumber,
      record.entryTime,
      record.exitTime || '-',
      record.bcNumber,
      record.orderedQuantity.toString(),
      record.loadedQuantity.toString(),
      record.oldIndex.toString(),
      record.currentIndex.toString(),
      record.destination,
    ]);

    // Add table using autoTable
    const autoTablePlugin = (doc as any).autoTable || require('jspdf-autotable');
    if (typeof autoTablePlugin === 'function') {
      autoTablePlugin.call(doc, {
        head: [headers],
        body: tableData,
        startY: margin + 36,
        margin: margin,
        styles: {
          font: 'Arial',
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 15 },
          2: { cellWidth: 14 },
          3: { cellWidth: 14 },
          4: { cellWidth: 14 },
          5: { cellWidth: 12 },
          6: { cellWidth: 12 },
          7: { cellWidth: 12 },
          8: { cellWidth: 12 },
          9: { cellWidth: 15 },
        },
      });
    } else {
      // Fallback: use direct method
      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: margin + 36,
        margin: margin,
        styles: {
          font: 'Arial',
          fontSize: 8,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle',
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
    }

    // Summary Section
    const totalLoaded = records.reduce((sum, r) => sum + r.loadedQuantity, 0);
    const totalOrdered = records.reduce((sum, r) => sum + r.orderedQuantity, 0);

    const finalY = ((doc as any).lastAutoTable?.finalY || 200) + 10;

    doc.setFontSize(11);
    doc.setFont('Arial', 'bold');
    doc.text(getTranslation(language, 'dashboard.totalLoaded'), margin, finalY);
    doc.text(totalLoaded.toString(), pageWidth - margin - 20, finalY, { align: 'right' });

    doc.text(getTranslation(language, 'dashboard.totalOrdered'), margin, finalY + 8);
    doc.text(totalOrdered.toString(), pageWidth - margin - 20, finalY + 8, { align: 'right' });

    doc.text(getTranslation(language, 'dashboard.tankerCount'), margin, finalY + 16);
    doc.text(records.length.toString(), pageWidth - margin - 20, finalY + 16, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont('Arial', 'normal');
    const responsible = getTranslation(language, 'footer.responsible');
    const name = getTranslation(language, 'footer.name');
    doc.text(`${responsible}: ${name}`, margin, pageHeight - 10);

    const timestamp = new Date().toLocaleString(
      language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US'
    );
    doc.text(
      `${getTranslation(language, 'footer.version')} | ${timestamp}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );

    // Save PDF
    const fileName = `situation_citerne_${new Date().toISOString().split('T')[0]}_${language}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};
