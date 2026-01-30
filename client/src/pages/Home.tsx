import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DigitalClock } from '@/components/DigitalClock';
import { DataEntryForm } from '@/components/DataEntryForm';
import { DataDashboard } from '@/components/DataDashboard';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AdvancedExportDialog } from '@/components/AdvancedExportDialog';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Truck, Fuel, ShieldCheck, Download, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can add to home screen
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'truck': return <Truck className="h-5 w-5" />;
      case 'fuel': return <Fuel className="h-5 w-5" />;
      case 'shield': return <ShieldCheck className="h-5 w-5" />;
      default: return <UserIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b-2 border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto py-3 px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-1 shadow-[2px_2px_0px_0px_var(--color-secondary)] border border-secondary">
              <img src="/images/snim-logo.jpg" alt="SNIM Logo" className="w-8 h-8 object-cover rounded-none" />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight leading-none">
                {t('header.title')}
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest">{t('header.subtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <DigitalClock />
            </div>
            
            {showInstallBtn && (
              <Button 
                onClick={handleInstallClick}
                variant="outline" 
                className="hidden sm:flex items-center gap-2 border-2 border-primary text-primary font-bold animate-pulse"
              >
                <PlusCircle className="w-4 h-4" />
                {t('lang.arabic') === 'العربية' ? 'تثبيت التطبيق' : 'Install App'}
              </Button>
            )}

            <LanguageSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary p-0 hover:bg-primary/10">
                  <Avatar className="h-full w-full rounded-full">
                    <AvatarFallback className="bg-transparent text-primary font-bold">
                      {getIcon(user?.icon || 'user')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-none border-2 border-border shadow-[4px_4px_0px_0px_var(--color-border)]" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground font-mono">
                      {t('header.userId')}: {user?.jobCardNumber}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto py-8 px-4 space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-none overflow-hidden h-48 border-2 border-border group">
          <img 
            src="/images/hero-background.jpg" 
            alt="Dashboard Hero" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent flex items-center px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold uppercase mb-2 text-foreground">
                {t('home.dashboardTitle')}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {t('home.dashboardDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Data Entry Section */}
        <section>
          <DataEntryForm />
        </section>

        {/* Dashboard Section */}
        <section>
          <div className="flex items-center justify-between mb-6 border-b-2 border-border pb-2">
            <h3 className="text-2xl font-bold uppercase flex items-center gap-2">
              <span className="w-3 h-8 bg-primary inline-block"></span>
              {t('home.recordsTitle')}
            </h3>
            <Button
              onClick={() => setExportDialogOpen(true)}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-none h-10 px-6 flex items-center gap-2 font-bold uppercase"
            >
              <Download className="w-4 h-4" />
              {t('export.title')}
            </Button>
          </div>
          <DataDashboard />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t-2 border-border py-6 mt-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
          <div>
            <p>{t('footer.organization')}</p>
            <p>{t('footer.department')}</p>
          </div>
          <div className="text-center">
            <p>{t('footer.responsible')}</p>
            <p className="font-bold text-foreground mt-1">{t('footer.name')}</p>
          </div>
          <div className="text-right">
            <p>{t('footer.version')}</p>
            <p>{t('footer.rights')}</p>
          </div>
        </div>
      </footer>

      {/* Export Dialog */}
      <AdvancedExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </div>
  );
}
