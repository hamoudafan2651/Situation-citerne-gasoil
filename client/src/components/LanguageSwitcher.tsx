import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={language} onValueChange={(val) => setLanguage(val as any)}>
        <SelectTrigger className="w-[140px] h-9 rounded-none border-2 border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-none border-2 border-border">
          <SelectItem value="ar">{t('lang.arabic')}</SelectItem>
          <SelectItem value="fr">{t('lang.french')}</SelectItem>
          <SelectItem value="en">{t('lang.english')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
