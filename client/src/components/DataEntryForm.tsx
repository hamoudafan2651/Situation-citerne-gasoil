import React, { useState } from 'react';
import { useData, TankerRecord } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, Truck, Hash, Clock, FileText, Scale, MapPin } from 'lucide-react';

export const DataEntryForm: React.FC = () => {
  const { addRecord } = useData();
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
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

      toast.success('تم حفظ السجل بنجاح');
      
      // Reset form but keep serial number incremented if possible
      const nextSerial = String(Number(formData.serialNumber) + 1).padStart(2, '0');
      setFormData({
        serialNumber: Number(nextSerial) <= 8 ? nextSerial : '01',
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
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="brutalist-card border-l-4 border-l-primary">
      <CardHeader className="bg-muted/30 border-b-2 border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="w-6 h-6 text-primary" />
          تسجيل حركة صهريج جديد
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Row 1 */}
            <div className="space-y-2">
              <Label htmlFor="serialNumber" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Hash className="w-3 h-3" /> N° التسلسلي
              </Label>
              <Select 
                value={formData.serialNumber} 
                onValueChange={(val) => handleSelectChange('serialNumber', val)}
              >
                <SelectTrigger className="brutalist-input font-mono">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {['01', '02', '03', '04', '05', '06', '07', '08'].map(num => (
                    <SelectItem key={num} value={num}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label htmlFor="tankerNumber" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Truck className="w-3 h-3" /> رقم الصهريج
              </Label>
              <Input
                id="tankerNumber"
                name="tankerNumber"
                value={formData.tankerNumber}
                onChange={handleChange}
                className="brutalist-input font-mono"
                placeholder="مثال: 1234-AB"
                required
              />
            </div>

            {/* Row 2 */}
            <div className="space-y-2">
              <Label htmlFor="entryTime" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Clock className="w-3 h-3" /> وقت الدخول
              </Label>
              <Input
                id="entryTime"
                name="entryTime"
                type="time"
                value={formData.entryTime}
                onChange={handleChange}
                className="brutalist-input font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitTime" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Clock className="w-3 h-3" /> وقت الخروج
              </Label>
              <Input
                id="exitTime"
                name="exitTime"
                type="time"
                value={formData.exitTime}
                onChange={handleChange}
                className="brutalist-input font-mono"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="bcNumber" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <FileText className="w-3 h-3" /> رقم BC
              </Label>
              <Input
                id="bcNumber"
                name="bcNumber"
                value={formData.bcNumber}
                onChange={handleChange}
                className="brutalist-input font-mono"
                placeholder="BC-2026-..."
                required
              />
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <Label htmlFor="orderedQuantity" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Scale className="w-3 h-3" /> الكمية المطلوبة
              </Label>
              <Input
                id="orderedQuantity"
                name="orderedQuantity"
                type="number"
                value={formData.orderedQuantity}
                onChange={handleChange}
                className="brutalist-input font-mono"
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loadedQuantity" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Scale className="w-3 h-3" /> الكمية المحملة
              </Label>
              <Input
                id="loadedQuantity"
                name="loadedQuantity"
                type="number"
                value={formData.loadedQuantity}
                onChange={handleChange}
                className="brutalist-input font-mono"
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oldIndex" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Hash className="w-3 h-3" /> المؤشر القديم
              </Label>
              <Input
                id="oldIndex"
                name="oldIndex"
                type="number"
                value={formData.oldIndex}
                onChange={handleChange}
                className="brutalist-input font-mono"
                placeholder="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentIndex" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <Hash className="w-3 h-3" /> المؤشر الحالي
              </Label>
              <Input
                id="currentIndex"
                name="currentIndex"
                type="number"
                value={formData.currentIndex}
                onChange={handleChange}
                className="brutalist-input font-mono"
                placeholder="0"
                required
              />
            </div>

            {/* Row 4 */}
            <div className="space-y-2 lg:col-span-4">
              <Label htmlFor="destination" className="flex items-center gap-1 text-xs uppercase font-bold text-muted-foreground">
                <MapPin className="w-3 h-3" /> الوجهة
              </Label>
              <Input
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="brutalist-input font-mono"
                placeholder="الموقع / المحطة"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border-2 border-transparent hover:border-secondary transition-all flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ السجل'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
