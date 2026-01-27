import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Data types based on the form
export interface TankerRecord {
  id: string;
  serialNumber: string; // N° (01-08)
  tankerNumber: string; // Numéros citernes
  entryTime: string; // Heure d'entrée
  exitTime: string; // Heure de sorties
  bcNumber: string; // Numéro B C
  orderedQuantity: number; // Quantité commandée
  loadedQuantity: number; // Quantité chargée
  oldIndex: number; // Ancien index
  currentIndex: number; // Index
  destination: string; // Destination
  date: string; // Date of entry
  createdBy: string; // User ID
  createdAt: string; // Timestamp
}

interface DataContextType {
  records: TankerRecord[];
  addRecord: (record: Omit<TankerRecord, 'id' | 'date' | 'createdBy' | 'createdAt'>) => Promise<void>;
  updateRecord: (id: string, record: Partial<TankerRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByDate: (date: string) => TankerRecord[];
  exportData: (startDate?: string, endDate?: string) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<TankerRecord[]>([]);

  // Load records from localStorage on mount
  useEffect(() => {
    const storedRecords = localStorage.getItem('scg_records');
    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    }
  }, []);

  const saveRecords = (newRecords: TankerRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('scg_records', JSON.stringify(newRecords));
  };

  const addRecord = async (recordData: Omit<TankerRecord, 'id' | 'date' | 'createdBy' | 'createdAt'>) => {
    if (!user) return;

    const newRecord: TankerRecord = {
      ...recordData,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    const updatedRecords = [newRecord, ...records];
    saveRecords(updatedRecords);
  };

  const updateRecord = async (id: string, updates: Partial<TankerRecord>) => {
    const updatedRecords = records.map(record => 
      record.id === id ? { ...record, ...updates } : record
    );
    saveRecords(updatedRecords);
  };

  const deleteRecord = async (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id);
    saveRecords(updatedRecords);
  };

  const getRecordsByDate = (date: string) => {
    return records.filter(record => record.date === date);
  };

  const exportData = (startDate?: string, endDate?: string) => {
    let filteredRecords = records;
    
    if (startDate) {
      filteredRecords = filteredRecords.filter(r => r.date >= startDate);
    }
    
    if (endDate) {
      filteredRecords = filteredRecords.filter(r => r.date <= endDate);
    }
    
    const dataStr = JSON.stringify(filteredRecords, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `situation_citerne_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <DataContext.Provider value={{ 
      records, 
      addRecord, 
      updateRecord, 
      deleteRecord,
      getRecordsByDate,
      exportData
    }}>
      {children}
    </DataContext.Provider>
  );
};
