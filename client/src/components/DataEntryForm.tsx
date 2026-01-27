import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, AlertCircle } from 'lucide-react';

export const DataEntryForm: React.FC = () => {
  const { addRecord } = useData();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    serialNumber: '01',
    tankerNumber: '',
    entryTime: '',
    exitTime: '',
    bcNumber: '',
    orderedQuantity: '',
    loadedQuantity: '',
    oldIndex: '',
    currentIndex: '',
    destination: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.tankerNumber || !formData.entryTime || !formData.bcNumber || 
          !formData.orderedQuantity || !formData.loadedQuantity || !formData.oldIndex || 
          !formData.currentIndex || !formData.destination) {
        toast.error(t('login.fillAllFields'));
        setIsSubmitting(false);
        return;
      }

      await addRecord({
        serialNumber: formData.serialNumber,
        tankerNumber: formData.tankerNumber,
        entryTime: formData.entryTime,
        exitTime: formData.exitTime,
        bcNumber: formData.bcNumber,
        orderedQuantity: Number(formData.orderedQuantity),
        loadedQuantity: Number(formData.loadedQuantity),
        oldIndex: Number(formData.oldIndex),
        currentIndex: Number(formData.currentIndex),
        destination: formData.destination
      });

      toast.success(t('form.success'));
      
      // Reset form
      setFormData({
        serialNumber: String(parseInt(formData.serialNumber) + 1).padStart(2, '0'),
        tankerNumber: '',
        entryTime: '',
        exitTime: '',
        bcNumber: '',
        orderedQuantity: '',
        loadedQuantity: '',
        oldIndex: '',
        currentIndex: '',
        destination: ''
      });
    } catch (error) {
      toast.error(t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="brutalist-card">
      <CardHeader className="border-b-2 border-border">
        <CardTitle className="text-xl font-bold uppercase">{t('form.title')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert */}
          <div className="flex gap-3 p-4 bg-primary/10 border-l-4 border-l-primary rounded-none">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              {t('form.title')} - {new Date().toLocaleDateString('ar-SA')}
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Serial Number */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.serialNumber')}</Label>
              <Input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                disabled
                className="brutalist-input bg-muted"
              />
            </div>

            {/* Tanker Number */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.tankerNumber')}</Label>
              <Input
                type="text"
                name="tankerNumber"
                value={formData.tankerNumber}
                onChange={handleChange}
                placeholder="TQ-001"
                className="brutalist-input"
                required
              />
            </div>

            {/* Entry Time */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.entryTime')}</Label>
              <Input
                type="time"
                name="entryTime"
                value={formData.entryTime}
                onChange={handleChange}
                className="brutalist-input"
                required
              />
            </div>

            {/* Exit Time */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.exitTime')}</Label>
              <Input
                type="time"
                name="exitTime"
                value={formData.exitTime}
                onChange={handleChange}
                placeholder={t('dashboard.exit')}
                className="brutalist-input"
              />
            </div>

            {/* BC Number */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.bcNumber')}</Label>
              <Input
                type="text"
                name="bcNumber"
                value={formData.bcNumber}
                onChange={handleChange}
                placeholder="BC-2026-001"
                className="brutalist-input"
                required
              />
            </div>

            {/* Ordered Quantity */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.orderedQuantity')}</Label>
              <Input
                type="number"
                name="orderedQuantity"
                value={formData.orderedQuantity}
                onChange={handleChange}
                placeholder="0"
                className="brutalist-input"
                required
              />
            </div>

            {/* Loaded Quantity */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.loadedQuantity')}</Label>
              <Input
                type="number"
                name="loadedQuantity"
                value={formData.loadedQuantity}
                onChange={handleChange}
                placeholder="0"
                className="brutalist-input"
                required
              />
            </div>

            {/* Old Index */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.oldIndex')}</Label>
              <Input
                type="number"
                name="oldIndex"
                value={formData.oldIndex}
                onChange={handleChange}
                placeholder="0"
                className="brutalist-input"
                required
              />
            </div>

            {/* Current Index */}
            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase">{t('form.currentIndex')}</Label>
              <Input
                type="number"
                name="currentIndex"
                value={formData.currentIndex}
                onChange={handleChange}
                placeholder="0"
                className="brutalist-input"
                required
              />
            </div>

            {/* Destination */}
            <div className="space-y-2 lg:col-span-3">
              <Label className="text-sm font-bold uppercase">{t('form.destination')}</Label>
              <Input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder={t('form.destination')}
                className="brutalist-input"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4 border-t-2 border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-none h-10 px-8 flex items-center gap-2 font-bold uppercase"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? t('form.saving') : t('form.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
