import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col items-end font-mono text-primary">
      <div className="text-2xl font-bold tracking-widest flex items-center gap-2">
        {formatTime(time)}
        <Clock className="w-5 h-5 animate-pulse" />
      </div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {formatDate(time)}
      </div>
    </div>
  );
};
