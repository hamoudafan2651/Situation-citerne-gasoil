import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Fuel, ShieldCheck, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const { login, register } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Login Form State
  const [loginJobCard, setLoginJobCard] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');

  // Register Form State
  const [regJobCard, setRegJobCard] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regName, setRegName] = useState('');
  const [regIcon, setRegIcon] = useState('truck');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginJobCard.length !== 4) {
      toast.error(t('login.jobCard'));
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await login(loginJobCard, loginPasscode);
      if (success) {
        toast.success(t('form.success'));
        setLocation('/');
      } else {
        toast.error(t('login.invalidCredentials'));
      }
    } catch (error) {
      toast.error(t('form.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regJobCard.length !== 4) {
      toast.error(t('login.jobCard'));
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await register(regJobCard, regPasscode, regName, regIcon);
      if (success) {
        toast.success(t('form.success'));
        setLocation('/');
      } else {
        toast.error(t('login.userExists'));
      }
    } catch (error) {
      toast.error(t('form.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/login-bg.jpg" 
          alt="Industrial Background" 
          className="w-full h-full object-cover opacity-40 grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]"></div>
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="w-full max-w-md z-10 px-4">
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <Button
            onClick={() => setLanguage('ar')}
            variant={language === 'ar' ? 'default' : 'outline'}
            className="rounded-none border-2 h-8 px-3 text-xs font-bold uppercase"
          >
            العربية
          </Button>
          <Button
            onClick={() => setLanguage('fr')}
            variant={language === 'fr' ? 'default' : 'outline'}
            className="rounded-none border-2 h-8 px-3 text-xs font-bold uppercase"
          >
            Français
          </Button>
          <Button
            onClick={() => setLanguage('en')}
            variant={language === 'en' ? 'default' : 'outline'}
            className="rounded-none border-2 h-8 px-3 text-xs font-bold uppercase"
          >
            English
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary text-primary-foreground mb-4 shadow-[4px_4px_0px_0px_var(--color-secondary)] border-2 border-secondary">
            <img src="/images/snim-logo.jpg" alt="SNIM Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase font-display">
            {t('login.title').split(' ').slice(0, 2).join(' ')} <span className="text-primary">{t('login.title').split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">
            {t('login.subtitle')}
          </p>
        </div>

        <Card className="brutalist-card border-2 border-secondary/20 bg-card/95 backdrop-blur-sm">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-muted/50 p-1">
              <TabsTrigger value="login" className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase">{t('login.existingAccount')}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-none data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-none font-bold uppercase">{t('login.newAccount')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="text-xl">{t('login.welcome')}</CardTitle>
                  <CardDescription>{language === 'ar' ? 'أدخل رقم بطاقة الوظيفة ورمز المرور للمتابعة' : language === 'fr' ? 'Entrez votre numéro de carte et mot de passe' : 'Enter your job card number and passcode'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobCard" className="font-bold uppercase text-xs tracking-wider">{t('login.jobCard')}</Label>
                    <div className="relative">
                      <Input 
                        id="jobCard" 
                        type="text" 
                        placeholder="0000" 
                        maxLength={4}
                        className="brutalist-input font-mono text-lg tracking-widest text-center [direction:ltr]"
                        value={loginJobCard}
                        onChange={(e) => setLoginJobCard(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                      <ShieldCheck className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passcode" className="font-bold uppercase text-xs tracking-wider">{t('login.password')}</Label>
                    <Input 
                      id="passcode" 
                      type="password" 
                      className="brutalist-input font-mono text-lg tracking-widest text-center [direction:ltr]"
                      value={loginPasscode}
                      onChange={(e) => setLoginPasscode(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-12 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-none border-2 border-transparent hover:border-secondary transition-all" disabled={isLoading}>
                    {isLoading ? (language === 'ar' ? 'جاري التحقق...' : 'Vérification...') : t('login.login')}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle className="text-xl">{t('login.register')}</CardTitle>
                  <CardDescription>{language === 'ar' ? 'سجل بياناتك للوصول إلى النظام' : language === 'fr' ? 'Enregistrez vos données pour accéder au système' : 'Register your data to access the system'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regName" className="font-bold uppercase text-xs tracking-wider">{t('login.name')}</Label>
                    <Input 
                      id="regName" 
                      type="text" 
                      placeholder={t('login.name')} 
                      className="brutalist-input"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regJobCard" className="font-bold uppercase text-xs tracking-wider">{t('login.jobCard').split(' ')[0]}</Label>
                      <Input 
                        id="regJobCard" 
                        type="text" 
                        placeholder="0000" 
                        maxLength={4}
                        className="brutalist-input font-mono text-center"
                        value={regJobCard}
                        onChange={(e) => setRegJobCard(e.target.value.replace(/\D/g, ''))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="regPasscode" className="font-bold uppercase text-xs tracking-wider">{t('login.password')}</Label>
                      <Input 
                        id="regPasscode" 
                        type="password" 
                        className="brutalist-input font-mono text-center"
                        value={regPasscode}
                        onChange={(e) => setRegPasscode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-xs tracking-wider">{t('login.icon')}</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['truck', 'fuel', 'user', 'shield'].map((icon) => (
                        <div 
                          key={icon}
                          onClick={() => setRegIcon(icon)}
                          className={`cursor-pointer p-2 border-2 flex items-center justify-center transition-all ${
                            regIcon === icon 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-muted bg-muted/20 hover:border-primary/50'
                          }`}
                        >
                          {icon === 'truck' && <Truck size={20} />}
                          {icon === 'fuel' && <Fuel size={20} />}
                          {icon === 'user' && <div className="font-bold text-lg">👤</div>}
                          {icon === 'shield' && <ShieldCheck size={20} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-none border-2 border-transparent hover:border-primary transition-all" disabled={isLoading}>
                    {isLoading ? (language === 'ar' ? 'جاري التسجيل...' : 'Inscription...') : t('login.register')}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-8 text-center text-xs text-muted-foreground font-mono">
          <p>SYSTEM STATUS: ONLINE</p>
          <p>VERSION: 1.0.0-STABLE</p>
        </div>
      </div>
    </div>
  );
}
