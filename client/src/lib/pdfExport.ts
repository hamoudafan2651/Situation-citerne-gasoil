import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TankerRecord } from '@/contexts/DataContext';
import { Language, translations } from './translations';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any;
  }
}

interface PDFExportOptions {
  records: TankerRecord[];
  language: Language;
  title?: string;
  startDate?: string;
  endDate?: string;
}

const getTranslation = (language: Language, key: string): string => {
  const trans = (translations as any)[language];
  return trans[key] || key;
};

export const exportToPDF = async ({
  records,
  language,
  title,
  startDate,
  endDate,
}: PDFExportOptions) => {
  try {
    // Create PDF in landscape mode
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const isRtl = language === 'ar';
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Set Font - Using a standard font that supports basic Latin/French
    // Note: For full Arabic support in jsPDF, a custom font (TTF) must be embedded.
    // Since we are in a browser environment, we'll use standard fonts and 
    // focus on structure. For production Arabic, the user should add a .ttf font.
    doc.setFont("helvetica");

    // Header
    doc.setTextColor(27, 77, 140); // #1b4d8c
    doc.setFontSize(22);
    const headerTitle = title || getTranslation(language, 'export.title');
    doc.text(headerTitle, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const subHeader = `${getTranslation(language, 'footer.organization')} | ${getTranslation(language, 'footer.department')}`;
    doc.text(subHeader, pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(10);
    const dateRange = `${getTranslation(language, 'export.startDate')}: ${startDate || '-'} | ${getTranslation(language, 'export.endDate')}: ${endDate || '-'}`;
    doc.text(dateRange, pageWidth / 2, 35, { align: 'center' });

    // Draw a line
    doc.setDrawColor(27, 77, 140);
    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40);

    // Table Columns
    const columns = [
      { header: getTranslation(language, 'dashboard.serialNum'), dataKey: 'index' },
      { header: getTranslation(language, 'dashboard.tankerNum'), dataKey: 'tankerNumber' },
      { header: getTranslation(language, 'dashboard.entry'), dataKey: 'entryTime' },
      { header: getTranslation(language, 'dashboard.exit'), dataKey: 'exitTime' },
      { header: getTranslation(language, 'dashboard.bcNum'), dataKey: 'bcNumber' },
      { header: getTranslation(language, 'dashboard.ordered'), dataKey: 'orderedQuantity' },
      { header: getTranslation(language, 'dashboard.loaded'), dataKey: 'loadedQuantity' },
      { header: getTranslation(language, 'dashboard.oldIdx'), dataKey: 'oldIndex' },
      { header: getTranslation(language, 'dashboard.currentIdx'), dataKey: 'currentIndex' },
      { header: getTranslation(language, 'dashboard.destination'), dataKey: 'destination' },
    ];

    // Reverse columns for RTL
    const finalColumns = isRtl ? [...columns].reverse() : columns;

    // Table Data
    const tableData = records.map((record, idx) => {
      const row: any = {
        index: idx + 1,
        tankerNumber: record.tankerNumber,
        entryTime: record.entryTime,
        exitTime: record.exitTime || '-',
        bcNumber: record.bcNumber,
        orderedQuantity: record.orderedQuantity.toLocaleString(),
        loadedQuantity: record.loadedQuantity.toLocaleString(),
        oldIndex: record.oldIndex.toLocaleString(),
        currentIndex: record.currentIndex.toLocaleString(),
        destination: record.destination,
      };
      return isRtl ? Object.values(row).reverse() : Object.values(row);
    });

    // Generate Table
    doc.autoTable({
      startY: 45,
      head: [finalColumns.map(col => col.header)],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [27, 77, 140],
        textColor: [255, 255, 255],
        fontSize: 10,
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: isRtl ? 'right' : 'left',
        font: "helvetica" // Standard font
      },
      columnStyles: {
        0: { halign: 'center' }
      }
    });

    // Summary Section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalLoaded = records.reduce((sum, r) => sum + r.loadedQuantity, 0);
    const totalOrdered = records.reduce((sum, r) => sum + r.orderedQuantity, 0);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    
    const summaryX = isRtl ? pageWidth - 20 : 20;
    const summaryAlign = isRtl ? 'right' : 'left';

    doc.text(`${getTranslation(language, 'dashboard.totalLoaded')}: ${totalLoaded.toLocaleString()} L`, summaryX, finalY, { align: summaryAlign });
    doc.text(`${getTranslation(language, 'dashboard.totalOrdered')}: ${totalOrdered.toLocaleString()} L`, summaryX, finalY + 7, { align: summaryAlign });
    doc.text(`${getTranslation(language, 'dashboard.tankerCount')}: ${records.length}`, summaryX, finalY + 14, { align: summaryAlign });

    // Signature
    const sigX = isRtl ? 20 : pageWidth - 20;
    const sigAlign = isRtl ? 'left' : 'right';
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(getTranslation(language, 'footer.responsible'), sigX, finalY, { align: sigAlign });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(getTranslation(language, 'footer.name'), sigX, finalY + 7, { align: sigAlign });

    // Footer
    const timestamp = new Date().toLocaleString();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${getTranslation(language, 'footer.version')} | ${timestamp}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    // Save
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const fileName = `situation_citerne_${dateStr}_${language}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};
