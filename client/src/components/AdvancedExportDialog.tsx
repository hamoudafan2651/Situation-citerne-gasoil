import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData, TankerRecord } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { exportToPDF } from '@/lib/pdfExport';
import { toast } from 'sonner';
import { Download, X } from 'lucide-react';

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
      toast.error(t('export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-none border-2 border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t('export.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase">{t('export.selectFormat')}</Label>
            <Select value={exportFormat} onValueChange={(val: any) => setExportFormat(val)}>
              <SelectTrigger className="brutalist-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-border">
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Report Language */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase">{t('export.selectLanguage')}</Label>
            <Select value={reportLanguage} onValueChange={(val: any) => setReportLanguage(val)}>
              <SelectTrigger className="brutalist-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-border">
                <SelectItem value="ar">{t('lang.arabic')}</SelectItem>
                <SelectItem value="fr">{t('lang.french')}</SelectItem>
                <SelectItem value="en">{t('lang.english')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('export.startDate')}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="brutalist-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('export.endDate')}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="brutalist-input"
              />
            </div>
          </div>

          {/* Record Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold uppercase">{t('export.selectRecords')}</Label>
            <Select value={recordSelection} onValueChange={(val: any) => setRecordSelection(val)}>
              <SelectTrigger className="brutalist-input">
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="select-all"
                  checked={selectedRecords.size === filteredRecords.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm cursor-pointer">
                  {selectedRecords.size === filteredRecords.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                </Label>
              </div>
              <ScrollArea className="h-[200px] border-2 border-border p-4 rounded-none">
                <div className="space-y-2">
                  {filteredRecords.map(record => (
                    <div key={record.id} className="flex items-center gap-2">
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
              <p className="text-xs text-muted-foreground">
                {selectedRecords.size} من {filteredRecords.length} محدد
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-muted/30 p-4 border-l-4 border-l-primary rounded-none">
            <p className="text-sm font-mono">
              <strong>{t('dashboard.tankerCount')}:</strong> {filteredRecords.length}
            </p>
            <p className="text-sm font-mono">
              <strong>{t('dashboard.totalLoaded')}:</strong> {filteredRecords.reduce((sum, r) => sum + r.loadedQuantity, 0)} L
            </p>
            <p className="text-sm font-mono">
              <strong>{t('dashboard.totalOrdered')}:</strong> {filteredRecords.reduce((sum, r) => sum + r.orderedQuantity, 0)} L
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none border-2"
          >
            <X className="w-4 h-4 mr-2" />
            {t('export.cancel')}
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || (recordSelection === 'custom' && selectedRecords.size === 0)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-10 px-6 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'جاري التصدير...' : t('export.exportBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
