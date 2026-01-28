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
    // Initialize document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    // Helper for RTL text (simple reversal for basic Arabic support without complex shaping)
    const fixRTL = (text: string) => {
      if (language !== 'ar') return text;
      // This is a very basic fix for Arabic text in jsPDF which doesn't support RTL natively well
      return text.split(' ').reverse().join(' ');
    };

    // Title
    const titleText = title || getTranslation(language, 'export.title');
    doc.setFontSize(16);
    doc.text(fixRTL(titleText), pageWidth / 2, margin + 10, { align: 'center' });

    // Organization Info
    doc.setFontSize(10);
    const org = getTranslation(language, 'footer.organization');
    const dept = getTranslation(language, 'footer.department');
    doc.text(fixRTL(org), pageWidth / 2, margin + 18, { align: 'center' });
    doc.text(fixRTL(dept), pageWidth / 2, margin + 24, { align: 'center' });

    // Date Range Info
    if (startDate || endDate) {
      const dateText = `${getTranslation(language, 'export.startDate')}: ${startDate || '-'} | ${getTranslation(language, 'export.endDate')}: ${endDate || '-'}`;
      doc.setFontSize(9);
      doc.text(fixRTL(dateText), pageWidth / 2, margin + 30, { align: 'center' });
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
    ].map(h => fixRTL(h));

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
      fixRTL(record.destination),
    ]);

    // Add table using autoTable
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: margin + 36,
      margin: margin,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [27, 77, 140], // SNIM Blue
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Summary Section
    const totalLoaded = records.reduce((sum, r) => sum + r.loadedQuantity, 0);
    const totalOrdered = records.reduce((sum, r) => sum + r.orderedQuantity, 0);

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.text(fixRTL(getTranslation(language, 'dashboard.totalLoaded') + ': ' + totalLoaded + ' L'), margin, finalY);
    doc.text(fixRTL(getTranslation(language, 'dashboard.totalOrdered') + ': ' + totalOrdered + ' L'), margin, finalY + 8);
    doc.text(fixRTL(getTranslation(language, 'dashboard.tankerCount') + ': ' + records.length), margin, finalY + 16);

    // Footer
    doc.setFontSize(8);
    const responsible = getTranslation(language, 'footer.responsible');
    const name = getTranslation(language, 'footer.name');
    doc.text(fixRTL(`${responsible}: ${name}`), margin, pageHeight - 10);

    const timestamp = new Date().toLocaleString(
      language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US'
    );
    doc.text(
      fixRTL(`${getTranslation(language, 'footer.version')} | ${timestamp}`),
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
    // Fallback to a simple alert if something goes wrong
    alert('Error exporting PDF. Please check console for details.');
    throw error;
  }
};
