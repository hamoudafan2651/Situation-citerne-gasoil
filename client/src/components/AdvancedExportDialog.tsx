import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { exportToPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';
import { Download, X, FileText } from 'lucide-react';

interface AdvancedExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedExportDialog: React.FC<AdvancedExportDialogProps> = ({ open, onOpenChange }) => {
  const { t, language } = useLanguage();
  const { records } = useData();
  
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json'>('pdf');
  const [reportLanguage, setReportLanguage] = useState<'ar' | 'fr' | 'en'>(language);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordSelection, setRecordSelection] = useState<'all' | 'custom'>('all');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const filteredRecords = records.filter(r => r.date >= startDate && r.date <= endDate);

  const handleSelectRecord = (id: string) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map(r => r.id)));
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let recordsToExport = filteredRecords;
      if (recordSelection === 'custom') {
        recordsToExport = filteredRecords.filter(r => selectedRecords.has(r.id));
      }

      if (recordsToExport.length === 0) {
        toast.error(t('dashboard.noRecords'));
        return;
      }

      if (exportFormat === 'pdf') {
        exportToPDF({
          records: recordsToExport,
          language: reportLanguage as any,
          startDate,
          endDate,
        });
      } else {
        // JSON Export
        const dataStr = JSON.stringify(recordsToExport, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `situation_citerne_export_${new Date().toISOString().split('T')[0]}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }

      toast.success(t('export.success'));
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-none border-2 border-border shadow-[4px_4px_0px_0px_var(--color-border)]">
        <DialogHeader className="border-b-2 border-border pb-4">
          <DialogTitle className="text-xl font-bold uppercase flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('export.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[600px] overflow-y-auto">
          {/* Export Format */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase text-foreground">{t('export.selectFormat')}</Label>
            <Select value={exportFormat} onValueChange={(val: any) => setExportFormat(val)}>
              <SelectTrigger className="brutalist-input rounded-none border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-border">
                <SelectItem value="pdf">📄 PDF</SelectItem>
                <SelectItem value="json">📋 JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Language */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase text-foreground">{t('export.selectLanguage')}</Label>
            <Select value={reportLanguage} onValueChange={(val: any) => setReportLanguage(val)}>
              <SelectTrigger className="brutalist-input rounded-none border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-border">
                <SelectItem value="ar">🇸🇦 {t('lang.arabic')}</SelectItem>
                <SelectItem value="fr">🇫🇷 {t('lang.french')}</SelectItem>
                <SelectItem value="en">🇬🇧 {t('lang.english')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-3 p-4 bg-muted/30 border-l-4 border-l-primary rounded-none">
            <h4 className="font-bold uppercase text-sm">{t('export.selectDateRange')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">{t('export.startDate')}</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="brutalist-input rounded-none border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">{t('export.endDate')}</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="brutalist-input rounded-none border-2"
                />
              </div>
            </div>
          </div>

          {/* Record Selection */}
          <div className="space-y-3 p-4 bg-muted/30 border-l-4 border-l-secondary rounded-none">
            <h4 className="font-bold uppercase text-sm">{t('export.selectRecords')}</h4>
            <Select value={recordSelection} onValueChange={(val: any) => setRecordSelection(val)}>
              <SelectTrigger className="brutalist-input rounded-none border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-border">
                <SelectItem value="all">{t('export.allRecords')}</SelectItem>
                <SelectItem value="custom">{t('export.customRecords')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Record Selection */}
          {recordSelection === 'custom' && filteredRecords.length > 0 && (
            <div className="space-y-3 p-4 bg-muted/20 border-2 border-border rounded-none">
              <div className="flex items-center gap-2 mb-3">
                <Checkbox
                  id="select-all"
                  checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm font-bold cursor-pointer">
                  {selectedRecords.size === filteredRecords.length && filteredRecords.length > 0
                    ? t('dashboard.delete')
                    : 'تحديد الكل'}
                </Label>
              </div>
              <ScrollArea className="h-[200px] border-2 border-border p-3 rounded-none">
                <div className="space-y-2">
                  {filteredRecords.map(record => (
                    <div key={record.id} className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-none">
                      <Checkbox
                        id={record.id}
                        checked={selectedRecords.has(record.id)}
                        onCheckedChange={() => handleSelectRecord(record.id)}
                      />
                      <Label htmlFor={record.id} className="text-sm cursor-pointer flex-1">
                        {record.tankerNumber} - {record.date} {record.entryTime}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground font-mono">
                {selectedRecords.size} {t('dashboard.tankerCount')} {filteredRecords.length}
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-primary/10 p-4 border-l-4 border-l-primary rounded-none space-y-2">
            <p className="text-sm font-mono font-bold">
              📊 {t('dashboard.tankerCount')}: <span className="text-primary">{filteredRecords.length}</span>
            </p>
            <p className="text-sm font-mono font-bold">
              📈 {t('dashboard.totalLoaded')}: <span className="text-primary">{filteredRecords.reduce((sum, r) => sum + r.loadedQuantity, 0)} L</span>
            </p>
            <p className="text-sm font-mono font-bold">
              📋 {t('dashboard.totalOrdered')}: <span className="text-primary">{filteredRecords.reduce((sum, r) => sum + r.orderedQuantity, 0)} L</span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end border-t-2 border-border pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none border-2 h-10"
          >
            <X className="w-4 h-4 mr-2" />
            {t('export.cancel')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || (recordSelection === 'custom' && selectedRecords.size === 0)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-10 px-6 flex items-center gap-2 font-bold uppercase"
          >
            <Download className="w-4 h-4" />
            {isExporting ? '...' : t('export.exportBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
