'use client';

import { useState } from 'react';
import {
  LogIn,
  Loader2,
  CheckCircle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import Cookies from 'js-cookie';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

type View = 'auth' | 'forgot';
type ForgotStep = 'request' | 'confirm';

/** Champ avec icône à gauche + bouton de visibilité optionnel pour les mots de passe. */
function Field({
  id,
  label,
  icon: Icon,
  type = 'text',
  togglePassword = false,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  togglePassword?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  const resolvedType = togglePassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={resolvedType}
          className={cn('h-11 pl-9', togglePassword && 'pr-10')}
          {...props}
        />
        {togglePassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            tabIndex={-1}
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function LoginModal({ textColor }: { textColor?: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [view, setView] = useState<View>('auth');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('request');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');

  const resetForm = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegisterFirstName('');
    setRegisterLastName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirm('');
    setForgotEmail('');
    setForgotOtp('');
    setForgotPassword('');
    setForgotConfirm('');
    setError('');
    setInfo('');
    setRegisterSuccess(false);
    setView('auth');
    setForgotStep('request');
  };

  const extractError = (err: unknown, fallback: string): string => {
    const e = err as { response?: { data?: { message?: string | string[] } } };
    const msg = e?.response?.data?.message;
    if (msg) return Array.isArray(msg) ? msg.join(', ') : msg;
    return fallback;
  };

  const goToForgot = () => {
    setError('');
    setInfo('');
    setForgotStep('request');
    setForgotEmail(loginEmail);
    setView('forgot');
  };

  const backToAuth = () => {
    setError('');
    setInfo('');
    setView('auth');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      Cookies.set('access_token', res.accessToken, { path: '/' });
      setOpen(false);
      window.location.reload();
    } catch (err) {
      setError(extractError(err, 'Identifiants incorrects'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (registerPassword !== registerConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (registerPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: registerEmail,
        password: registerPassword,
        firstName: registerFirstName,
        lastName: registerLastName,
      });
      setRegisterSuccess(true);
    } catch (err) {
      setError(extractError(err, "Erreur lors de l'inscription"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await api.put('/auth/forget-password-request', { email: forgotEmail });
      setInfo('Un code de vérification vient de vous être envoyé par email.');
      setForgotStep('confirm');
    } catch (err) {
      setError(extractError(err, "Impossible d'envoyer le code. Réessayez."));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (forgotPassword !== forgotConfirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (forgotPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/forget-password-confirm', {
        email: forgotEmail,
        otp: forgotOtp,
        newPassword: forgotPassword,
      });
      setInfo('Mot de passe réinitialisé ! Vous pouvez vous connecter.');
      setTimeout(() => {
        setLoginEmail(forgotEmail);
        setLoginPassword('');
        setView('auth');
        setInfo('');
        setForgotStep('request');
        setForgotOtp('');
        setForgotPassword('');
        setForgotConfirm('');
      }, 1600);
    } catch (err) {
      setError(extractError(err, 'Code invalide ou expiré.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md cursor-pointer"
        >
          <LogIn className="h-4 w-4" />
          Connexion
        </button>
      </DialogTrigger>

      <DialogContent className="overflow-hidden p-0 sm:max-w-[440px]">
        {/* En-tête illustré */}
        <DialogHeader className="space-y-3 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pb-5 pt-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            {view === 'forgot' ? (
              <KeyRound className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-center text-xl font-semibold">
              {view === 'forgot' ? 'Mot de passe oublié' : 'Mon compte'}
            </DialogTitle>
            <DialogDescription className="text-center text-sm">
              {view === 'forgot'
                ? forgotStep === 'request'
                  ? 'Saisissez votre email pour recevoir un code.'
                  : 'Entrez le code reçu et votre nouveau mot de passe.'
                : 'Connectez-vous ou créez votre compte en quelques secondes.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {info}
            </div>
          )}

          {/* ---------- Vue mot de passe oublié ---------- */}
          {view === 'forgot' ? (
            <form
              onSubmit={forgotStep === 'request' ? handleForgotRequest : handleForgotConfirm}
              className="space-y-4"
            >
              <Field
                id="forgot-email"
                label="Email"
                icon={Mail}
                type="email"
                placeholder="mon@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading || forgotStep === 'confirm'}
              />

              {forgotStep === 'confirm' && (
                <>
                  <Field
                    id="forgot-otp"
                    label="Code de vérification"
                    icon={KeyRound}
                    type="text"
                    inputMode="numeric"
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    autoComplete="one-time-code"
                  />
                  <Field
                    id="forgot-password"
                    label="Nouveau mot de passe"
                    icon={Lock}
                    togglePassword
                    placeholder="Min. 6 caractères"
                    value={forgotPassword}
                    onChange={(e) => setForgotPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <Field
                    id="forgot-confirm"
                    label="Confirmer le mot de passe"
                    icon={Lock}
                    togglePassword
                    placeholder="Confirmer"
                    value={forgotConfirm}
                    onChange={(e) => setForgotConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </>
              )}

              <Button type="submit" className="h-11 w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {forgotStep === 'request' ? 'Envoyer le code' : 'Réinitialiser'}
              </Button>

              <button
                type="button"
                onClick={backToAuth}
                className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion
              </button>
            </form>
          ) : (
            /* ---------- Vue connexion / inscription ---------- */
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="mb-5 grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <Field
                    id="login-email"
                    label="Email"
                    icon={Mail}
                    type="email"
                    placeholder="mon@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                  <div className="space-y-1.5">
                    <Field
                      id="login-password"
                      label="Mot de passe"
                      icon={Lock}
                      togglePassword
                      placeholder="Votre mot de passe"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={goToForgot}
                        className="text-xs font-medium text-primary transition-opacity hover:opacity-80"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="h-11 w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                {registerSuccess ? (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-base font-semibold">Inscription réussie !</p>
                    <p className="text-sm text-muted-foreground">
                      Un email de vérification a été envoyé à{' '}
                      <strong className="text-foreground">{registerEmail}</strong>. Vérifiez
                      votre boîte mail pour activer votre compte.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        id="register-firstName"
                        label="Prénom"
                        icon={User}
                        type="text"
                        placeholder="Jean"
                        value={registerFirstName}
                        onChange={(e) => setRegisterFirstName(e.target.value)}
                        required
                        autoComplete="given-name"
                      />
                      <Field
                        id="register-lastName"
                        label="Nom"
                        icon={User}
                        type="text"
                        placeholder="Dupont"
                        value={registerLastName}
                        onChange={(e) => setRegisterLastName(e.target.value)}
                        required
                        autoComplete="family-name"
                      />
                    </div>
                    <Field
                      id="register-email"
                      label="Email"
                      icon={Mail}
                      type="email"
                      placeholder="mon@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                    <Field
                      id="register-password"
                      label="Mot de passe"
                      icon={Lock}
                      togglePassword
                      placeholder="Min. 6 caractères"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <Field
                      id="register-confirm"
                      label="Confirmer le mot de passe"
                      icon={Lock}
                      togglePassword
                      placeholder="Confirmer"
                      value={registerConfirm}
                      onChange={(e) => setRegisterConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                    <Button type="submit" className="h-11 w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer mon compte
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
