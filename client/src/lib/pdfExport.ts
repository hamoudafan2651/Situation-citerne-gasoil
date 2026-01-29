import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

export const exportToPDF = async ({
  records,
  language,
  title,
  startDate,
  endDate,
}: PDFExportOptions) => {
  try {
    // Create a temporary container for the report
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1100px'; // Landscape width
    container.style.padding = '40px';
    container.style.backgroundColor = '#ffffff';
    container.style.color = '#000000';
    container.style.fontFamily = 'Arial, sans-serif';
    container.dir = language === 'ar' ? 'rtl' : 'ltr';

    // Header Section
    const headerHtml = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1b4d8c; padding-bottom: 20px;">
        <h1 style="font-size: 28px; color: #1b4d8c; margin: 0; text-transform: uppercase;">${title || getTranslation(language, 'export.title')}</h1>
        <p style="font-size: 14px; color: #666; margin: 5px 0;">${getTranslation(language, 'footer.organization')} | ${getTranslation(language, 'footer.department')}</p>
        <p style="font-size: 12px; color: #888; margin: 5px 0;">${getTranslation(language, 'export.startDate')}: ${startDate || '-'} | ${getTranslation(language, 'export.endDate')}: ${endDate || '-'}</p>
      </div>
    `;

    // Table Section
    let tableRows = '';
    records.forEach((record, index) => {
      tableRows += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; text-align: center;">${index + 1}</td>
          <td style="padding: 10px; text-align: center; font-weight: bold;">${record.tankerNumber}</td>
          <td style="padding: 10px; text-align: center;">${record.entryTime}</td>
          <td style="padding: 10px; text-align: center;">${record.exitTime || '-'}</td>
          <td style="padding: 10px; text-align: center;">${record.bcNumber}</td>
          <td style="padding: 10px; text-align: center;">${record.orderedQuantity}</td>
          <td style="padding: 10px; text-align: center;">${record.loadedQuantity}</td>
          <td style="padding: 10px; text-align: center;">${record.oldIndex}</td>
          <td style="padding: 10px; text-align: center;">${record.currentIndex}</td>
          <td style="padding: 10px; text-align: ${language === 'ar' ? 'right' : 'left'};">${record.destination}</td>
        </tr>
      `;
    });

    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px;">
        <thead>
          <tr style="background-color: #1b4d8c; color: #ffffff;">
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.serialNum')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.tankerNum')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.entry')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.exit')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.bcNum')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.ordered')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.loaded')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.oldIdx')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.currentIdx')}</th>
            <th style="padding: 12px; border: 1px solid #1b4d8c;">${getTranslation(language, 'dashboard.destination')}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    // Summary Section
    const totalLoaded = records.reduce((sum, r) => sum + r.loadedQuantity, 0);
    const totalOrdered = records.reduce((sum, r) => sum + r.orderedQuantity, 0);
    
    const summaryHtml = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background-color: #f8f9fa; padding: 20px; border: 1px solid #eee;">
        <div>
          <p style="margin: 5px 0; font-weight: bold;">${getTranslation(language, 'dashboard.totalLoaded')}: <span style="color: #1b4d8c;">${totalLoaded.toLocaleString()} L</span></p>
          <p style="margin: 5px 0; font-weight: bold;">${getTranslation(language, 'dashboard.totalOrdered')}: <span style="color: #1b4d8c;">${totalOrdered.toLocaleString()} L</span></p>
          <p style="margin: 5px 0; font-weight: bold;">${getTranslation(language, 'dashboard.tankerCount')}: <span style="color: #1b4d8c;">${records.length}</span></p>
        </div>
        <div style="text-align: ${language === 'ar' ? 'left' : 'right'};">
          <p style="margin: 5px 0; font-size: 12px; color: #666;">${getTranslation(language, 'footer.responsible')}</p>
          <p style="margin: 5px 0; font-weight: bold; font-size: 16px;">${getTranslation(language, 'footer.name')}</p>
        </div>
      </div>
    `;

    // Footer Section
    const timestamp = new Date().toLocaleString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US');
    const footerHtml = `
      <div style="display: flex; justify-content: space-between; font-size: 10px; color: #999; border-top: 1px solid #eee; pt: 10px;">
        <span>${getTranslation(language, 'footer.version')}</span>
        <span>${timestamp}</span>
        <span>${getTranslation(language, 'footer.rights')}</span>
      </div>
    `;

    container.innerHTML = headerHtml + tableHtml + summaryHtml + footerHtml;
    document.body.appendChild(container);

    // Use html2canvas to capture the container
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Save PDF with precise date and time
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.getHours().toString().padStart(2, '0') + '-' + now.getMinutes().toString().padStart(2, '0');
    const fileName = `situation_citerne_${dateStr}_${timeStr}_${language}.pdf`;
    
    pdf.save(fileName);

    // Cleanup
    document.body.removeChild(container);
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};
