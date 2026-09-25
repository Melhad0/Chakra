import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  Mail,
  Calendar,
  Lock,
  Hash,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Loader2,
  ScrollText,
  ArrowRight,
  Sparkles,
  Flame,
  SunMedium,
} from 'lucide-react';
import {
  ShinobiUser,
  RegistrationPayload,
  LoginPayload,
  AuthResponse,
  CheckUsernameResponse,
  PasswordCriteria,
  PasswordStrengthStage,
  FULL_NAME_REGEX,
  USERNAME_REGEX,
  SPECIAL_CHAR_REGEX,
  registrationSchema,
  loginSchema,
} from '../../types/auth';

interface LoginPageProps {
  onAuthSuccess: (user: ShinobiUser) => void;
  onGuestAccess?: () => void;
}

type TabMode = 'LOGIN' | 'REGISTER';

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthSuccess,
  onGuestAccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('LOGIN');

  // Estados de Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados de Cadastro
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validação assíncrona do username com debounce
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados gerais
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<ShinobiUser | null>(null);

  // Checagem em tempo real de username (400ms debounce)
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameMessage('3 a 20 caracteres (apenas letras, números e _).');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('Consultando registros shinobi...');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/auth/check-username?u=${encodeURIComponent(trimmed)}`
        );
        if (!response.ok) throw new Error('Falha no servidor');
        const data: CheckUsernameResponse = await response.json();
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage('Nome disponível para alistamento.');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(data.message || 'Nome já cadastrado.');
        }
      } catch {
        setUsernameStatus('idle');
        setUsernameMessage('');
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [username]);

  // Critérios de senha reativos
  const passwordCriteria: PasswordCriteria = useMemo(() => {
    const p = registerPassword;
    return {
      minLength: p.length >= 8 && p.length <= 64,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecialChar: SPECIAL_CHAR_REGEX.test(p),
      passwordsMatch: p.length > 0 && p === confirmPassword,
    };
  }, [registerPassword, confirmPassword]);

  // Força da senha (4 estágios: Fraca, Razoável, Forte, Inviolável)
  const passwordStrength: { stage: PasswordStrengthStage; percent: number; colorClass: string; barBg: string } = useMemo(() => {
    if (!registerPassword) {
      return { stage: 'Fraca', percent: 0, colorClass: 'text-zinc-500', barBg: 'bg-zinc-800' };
    }

    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar } = passwordCriteria;
    const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (score === 5 && passwordCriteria.passwordsMatch) {
      return { stage: 'Inviolável', percent: 100, colorClass: 'text-cyan-400', barBg: 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]' };
    }
    if (score >= 4) {
      return { stage: 'Forte', percent: 75, colorClass: 'text-emerald-400', barBg: 'bg-emerald-500' };
    }
    if (score >= 3) {
      return { stage: 'Razoável', percent: 50, colorClass: 'text-amber-400', barBg: 'bg-amber-500' };
    }
    return { stage: 'Fraca', percent: 25, colorClass: 'text-rose-400', barBg: 'bg-rose-500' };
  }, [registerPassword, passwordCriteria]);

  // Submissão de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: LoginPayload = {
      loginIdentifier: loginIdentifier.trim(),
      password: loginPassword,
    };

    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message || 'Preencha os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Credenciais inválidas. Verifique usuário e senha.');
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        onAuthSuccess(data.user);
      }
    } catch {
      setErrorMessage('Não foi possível conectar ao servidor Flask (porta 5000). Certifique-se de que o backend está ativo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão de Cadastro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: RegistrationPayload = {
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      birthDate: birthDate.trim(),
      password: registerPassword,
      confirmPassword,
    };

    const parsed = registrationSchema.safeParse(payload);
    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message || 'Corrija os campos do formulário.');
      return;
    }

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      setErrorMessage('Escolha um nome de usuário shinobi válido e disponível.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Falha ao registrar novo shinobi.');
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        setRegisteredUser(data.user);
      }
    } catch {
      setErrorMessage('Erro de rede ao registrar. O servidor Flask está rodando na porta 5000?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-shinobi-bg text-shinobi-text flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Decorativo com Chakra Neon Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Card Central Glassmorphic */}
      <div className="relative w-full max-w-lg bg-zinc-950/90 border border-zinc-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Banner do Portal Shinobi */}
        <div className="px-8 pt-8 pb-6 border-b border-zinc-800/60 text-center relative">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800/90 flex items-center justify-center text-orange-400 mb-3 shadow-[0_0_20px_rgba(255,107,0,0.25)]">
            <SunMedium className="w-8 h-8 stroke-[1.75]" />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-zinc-100 uppercase font-sans">
            Chakra Clicker
          </h1>
          <p className="text-xs font-mono tracking-widest text-zinc-400 uppercase mt-1">
            Portal de Alistamento & Acesso Shinobi
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono text-zinc-400 mt-2">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>SISTEMA DE AUTENTICAÇÃO OFICIAL • KONOHA</span>
          </div>
        </div>

        {/* Notificação de Erro */}
        {errorMessage && (
          <div className="mx-8 mt-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* CENÁRIO A: REGISTRO CONCLUÍDO (PERGAMINHO DE ALISTAMENTO) */}
        {registeredUser ? (
          <div className="p-8 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                  <ScrollText className="w-5 h-5 stroke-[1.75]" />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Certificado de Alistamento Shinobi
                  </span>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700 text-[10px] font-mono text-cyan-300">
                  CONFIRMADO
                </div>
              </div>

              {/* ID Ninja em Destaque */}
              <div className="text-center py-4 bg-zinc-950/70 rounded-xl border border-zinc-800/80">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                  Identificador Oficial Shinobi (ID)
                </span>
                <span className="text-4xl font-mono font-black tracking-widest text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                  #{registeredUser.ninjaId}
                </span>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <span className="text-zinc-500 font-mono">Nome Completo:</span>
                  <span className="font-semibold text-zinc-200">{registeredUser.fullName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <span className="text-zinc-500 font-mono">Usuário:</span>
                  <span className="font-mono text-cyan-300">@{registeredUser.username}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <span className="text-zinc-500 font-mono">E-mail:</span>
                  <span className="font-mono text-zinc-300">{registeredUser.email}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500 font-mono">Data do Alistamento:</span>
                  <span className="font-mono text-zinc-300">
                    {new Date(registeredUser.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAuthSuccess(registeredUser)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Entrar no Cockpit Shinobi</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* CENÁRIO B: ABAS DE LOGIN E CADASTRO */
          <>
            {/* Alternador de Abas */}
            <div className="grid grid-cols-2 p-1.5 mx-8 mt-5 bg-zinc-900/60 border border-zinc-800/60 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('LOGIN');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === 'LOGIN'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Acessar Selo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('REGISTER');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                  activeTab === 'REGISTER'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Alistamento Ninja</span>
              </button>
            </div>

            {/* FORMULÁRIO 1: LOGIN */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="p-8 space-y-4">
                {/* Usuário ou E-mail */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Nome de Usuário ou E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="naruto_uzumaki ou ninja@konoha.ninja"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-3 py-2.5 text-xs transition"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Chave Secreta (Senha)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-10 py-2.5 text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4 stroke-[1.75]" /> : <Eye className="w-4 h-4 stroke-[1.75]" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Desbloquear Cockpit Shinobi</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                {/* Acesso Convidado Opcional */}
                {onGuestAccess && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={onGuestAccess}
                      className="text-[11px] font-mono text-zinc-500 hover:text-zinc-400 transition underline underline-offset-4"
                    >
                      Jogar como Convidado (Modo Offline Temporário)
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* FORMULÁRIO 2: CADASTRO */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="p-8 space-y-3.5 max-h-[65vh] overflow-y-auto">
                {/* Nome Completo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Nome Completo
                    </label>
                    <span className="text-[10px] text-zinc-500 font-mono">Prenome e Sobrenome</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Minato Namikaze"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 text-xs transition"
                    />
                  </div>
                  {fullName && !FULL_NAME_REGEX.test(fullName.trim()) && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      Informe nome e sobrenome usando apenas letras.
                    </span>
                  )}
                </div>

                {/* Nome de Usuário com Debounce */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Nome de Usuário
                    </label>
                    {usernameStatus === 'checking' && (
                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Verificando...
                      </span>
                    )}
                    {usernameStatus === 'available' && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Disponível
                      </span>
                    )}
                    {usernameStatus === 'taken' && (
                      <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> Indisponível
                      </span>
                    )}
                    {usernameStatus === 'invalid' && (
                      <span className="text-[10px] font-mono text-amber-400">{usernameMessage || '3-20 caracteres'}</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Hash className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="minato_hokage"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 text-xs transition font-mono"
                    />
                  </div>
                </div>

                {/* E-mail e Data de Nascimento em Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      E-mail Ninja
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Mail className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ninja@konoha.ninja"
                        className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-3 py-2 text-xs transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      Data de Nascimento
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Calendar className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type="date"
                        required
                        value={birthDate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 rounded-xl pl-9 pr-3 py-2 text-xs transition font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Senha e Medidor de Força */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Chave de Acesso
                    </label>
                    <span className={`text-[10px] font-mono font-semibold ${passwordStrength.colorClass}`}>
                      Força: {passwordStrength.stage}
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-10 py-2 text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Barra de Força */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.barBg}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                    Confirmar Chave
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-10 py-2 text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Grade de Requisitos */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Mínimo 8 dígitos</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUppercase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Maiúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLowercase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Número</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecialChar ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Especial</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.passwordsMatch ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Senhas coincidem</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Emitindo Registro Shinobi...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Concluir Alistamento</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
