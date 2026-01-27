import React, { useState, useMemo } from 'react';
import { useData, TankerRecord } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Search, Filter, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

export const DataDashboard: React.FC = () => {
  const { records, deleteRecord, exportData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.tankerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.bcNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDate = record.date === dateFilter;
      
      return matchesSearch && matchesDate;
    });
  }, [records, searchTerm, dateFilter]);

  const chartData = useMemo(() => {
    // Group by hour for the selected date
    const hourlyData: Record<string, { loaded: number, ordered: number }> = {};
    
    filteredRecords.forEach(record => {
      const hour = record.entryTime.split(':')[0];
      if (!hourlyData[hour]) {
        hourlyData[hour] = { loaded: 0, ordered: 0 };
      }
      hourlyData[hour].loaded += record.loadedQuantity;
      hourlyData[hour].ordered += record.orderedQuantity;
    });

    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: `${hour}:00`,
        ...data
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }, [filteredRecords]);

  const totalLoaded = useMemo(() => filteredRecords.reduce((sum, r) => sum + r.loadedQuantity, 0), [filteredRecords]);
  const totalOrdered = useMemo(() => filteredRecords.reduce((sum, r) => sum + r.orderedQuantity, 0), [filteredRecords]);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      await deleteRecord(id);
      toast.success('تم حذف السجل');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="brutalist-card border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase text-muted-foreground">إجمالي الكمية المحملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalLoaded.toLocaleString()} L</div>
          </CardContent>
        </Card>
        <Card className="brutalist-card border-l-4 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase text-muted-foreground">إجمالي الكمية المطلوبة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalOrdered.toLocaleString()} L</div>
          </CardContent>
        </Card>
        <Card className="brutalist-card border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase text-muted-foreground">عدد الصهاريج</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{filteredRecords.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="brutalist-card">
          <CardHeader>
            <CardTitle>تحليل الكميات بالساعة</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Bar dataKey="loadedQuantity" name="الكمية المحملة" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orderedQuantity" name="الكمية المطلوبة" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="brutalist-card">
          <CardHeader>
            <CardTitle>اتجاه التحميل</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '0px' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Line type="monotone" dataKey="loadedQuantity" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-muted/20 p-4 border-2 border-border">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">بحث</label>
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="رقم الصهريج، الوجهة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="brutalist-input pr-9 w-full md:w-[250px]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">التاريخ</label>
            <Input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="brutalist-input w-full md:w-[180px]"
            />
          </div>
        </div>
        <Button 
          onClick={() => exportData(dateFilter, dateFilter)}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-none h-10 px-6 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          تصدير البيانات
        </Button>
      </div>

      {/* Data Table */}
      <Card className="brutalist-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-center font-bold text-foreground border-r border-border">N°</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">رقم الصهريج</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">وقت الدخول</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">وقت الخروج</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">رقم BC</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">الكمية المطلوبة</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">الكمية المحملة</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">المؤشر القديم</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">المؤشر الحالي</TableHead>
                <TableHead className="text-center font-bold text-foreground border-r border-border">الوجهة</TableHead>
                <TableHead className="text-center font-bold text-foreground">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    لا توجد سجلات لهذا التاريخ
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="text-center font-mono border-r border-border">{record.serialNumber}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border">{record.tankerNumber}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border">{record.entryTime}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border">{record.exitTime || '-'}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border">{record.bcNumber}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border">{record.orderedQuantity}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border font-bold text-primary">{record.loadedQuantity}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border">{record.oldIndex}</TableCell>
                    <TableCell className="text-center font-mono border-r border-border">{record.currentIndex}</TableCell>
                    <TableCell className="text-center border-r border-border">{record.destination}</TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
