import React, { useState, useMemo } from 'react';
import { useData, TankerRecord } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const DataDashboard: React.FC = () => {
  const { records, deleteRecord } = useData();
  const { t, language } = useLanguage();
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
    if (confirm(t('dashboard.deleteConfirm'))) {
      await deleteRecord(id);
      toast.success(t('dashboard.deleted'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="brutalist-card border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase text-muted-foreground">{t('dashboard.totalLoaded')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalLoaded.toLocaleString()} L</div>
          </CardContent>
        </Card>
        <Card className="brutalist-card border-l-4 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase text-muted-foreground">{t('dashboard.totalOrdered')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{totalOrdered.toLocaleString()} L</div>
          </CardContent>
        </Card>
        <Card className="brutalist-card border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase text-muted-foreground">{t('dashboard.tankerCount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{filteredRecords.length}</div>
          </CardContent>
        </Card>
      </div>



      {/* Filters */}
      <Card className="brutalist-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase">{t('dashboard.search')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('dashboard.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 brutalist-input"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="brutalist-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="brutalist-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg font-bold uppercase">{t('dashboard.tankerNum')}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRecords.length > 0 ? (
            <div className="table-container">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-border hover:bg-transparent">
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.serialNum')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.tankerNum')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.entry')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.exit')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.bcNum')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.ordered')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.loaded')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.oldIdx')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.currentIdx')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.destination')}</TableHead>
                    <TableHead className="text-center font-bold uppercase text-xs">{t('dashboard.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record, index) => (
                    <TableRow key={record.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <TableCell className="text-center text-sm font-mono">{index + 1}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.tankerNumber}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.entryTime}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.exitTime || '-'}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.bcNumber}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.orderedQuantity}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.loadedQuantity}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.oldIndex}</TableCell>
                      <TableCell className="text-center text-sm font-mono">{record.currentIndex}</TableCell>
                      <TableCell className="text-center text-sm">{record.destination}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-destructive hover:bg-destructive/10 rounded-none"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('dashboard.noRecords')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
