import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  Mail,
  Calendar,
  Lock,
  Hash,
  ShieldCheck,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Loader2,
  ScrollText,
  ArrowRight,
  Sparkles,
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: ShinobiUser) => void;
  currentUser?: ShinobiUser | null;
  onLogout?: () => void;
}

type TabMode = 'LOGIN' | 'REGISTER';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('LOGIN');

  // Estados de formulário de Login
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados de formulário de Cadastro
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de validação de username assíncrona (debounce)
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados gerais de submissão
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<ShinobiUser | null>(null);

  // Fecha com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reseta estados ao abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setRegisteredUser(null);
    }
  }, [isOpen]);

  // Checagem em tempo real de username com debounce de 400ms
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameMessage('Deve ter entre 3 e 20 caracteres (apenas letras, números e _).');
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
        if (!response.ok) {
          throw new Error('Falha na resposta do servidor.');
        }
        const data: CheckUsernameResponse = await response.json();
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMessage('Nome de usuário shinobi disponível.');
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(data.message || 'Nome de usuário já cadastrado.');
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

  // Validação dinâmica dos critérios de senha
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

  // Cálculo da régua de força (4 estágios: Fraca, Razoável, Forte, Inviolável)
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

  // Submissão do Login
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
        setErrorMessage(data.message || 'Falha ao autenticar credenciais.');
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      }
    } catch {
      setErrorMessage('Erro de conexão com a API shinobi. Verifique se o backend Flask está ativo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão do Cadastro
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
      setErrorMessage(parsed.error.issues[0]?.message || 'Dados inválidos no formulário.');
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
        setErrorMessage(data.message || 'Não foi possível concluir o alistamento.');
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        setRegisteredUser(data.user);
        if (onAuthSuccess) onAuthSuccess(data.user);
      }
    } catch {
      setErrorMessage('Erro de rede ao registrar shinobi. O backend Flask está operante?');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200 select-none"
    >
      {/* Container Principal Estilo Painel Shinobi */}
      <div className="relative w-full max-w-lg bg-zinc-950/95 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col text-zinc-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho do Modal */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
                {currentUser ? 'Perfil de Shinobi Autenticado' : registeredUser ? 'Pergaminho de Registro Concluído' : 'Acesso & Alistamento Shinobi'}
              </h2>
              <span className="text-[11px] font-mono text-zinc-500 block">
                Sistema IAM • Cockpit de Chakra
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60 transition"
            title="Fechar (ESC)"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* MENSAGEM DE ERRO GLOBAL */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* CENÁRIO 1: USUÁRIO JÁ AUTENTICADO */}
        {currentUser ? (
          <div className="p-6 space-y-5">
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                    Shinobi Conectado
                  </span>
                  <h3 className="text-base font-semibold text-zinc-100">
                    {currentUser.fullName}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    @{currentUser.username}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-right">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 block">
                    ID Oficial Shinobi
                  </span>
                  <span className="text-sm font-mono font-bold text-cyan-300">
                    #{currentUser.ninjaId}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/50 text-xs">
                <div>
                  <span className="text-zinc-500 block font-mono text-[10px] uppercase">E-mail</span>
                  <span className="text-zinc-300 font-mono">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block font-mono text-[10px] uppercase">Alistamento</span>
                  <span className="text-zinc-300 font-mono">
                    {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('pt-BR') : 'Ativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 rounded-lg transition"
              >
                Desconectar Sessão
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-medium text-zinc-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition font-semibold"
              >
                Voltar ao Cockpit
              </button>
            </div>
          </div>
        ) : registeredUser ? (
          /* CENÁRIO 2: PERGAMINHO DE REGISTRO NINJA PÓS-CADASTRO */
          <div className="p-6 space-y-6">
            <div className="p-6 rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400">
                  <ScrollText className="w-5 h-5 stroke-[1.75]" />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Certificado de Alistamento
                  </span>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800 text-[10px] font-mono text-cyan-300">
                  OFICIAL • KONOHA
                </div>
              </div>

              {/* ID Ninja em Destaque */}
              <div className="text-center py-3 bg-zinc-950/60 rounded-lg border border-zinc-800/80">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block mb-1">
                  Registro de Identificação Shinobi
                </span>
                <span className="text-3xl font-mono font-black tracking-wider text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
                  #{registeredUser.ninjaId}
                </span>
              </div>

              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between py-1 border-b border-zinc-800/40">
                  <span className="text-zinc-500">Nome Completo:</span>
                  <span className="font-semibold text-zinc-200">{registeredUser.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/40">
                  <span className="text-zinc-500">Nome de Usuário:</span>
                  <span className="font-mono text-cyan-300">@{registeredUser.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/40">
                  <span className="text-zinc-500">E-mail:</span>
                  <span className="font-mono text-zinc-300">{registeredUser.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500">Data de Alistamento:</span>
                  <span className="font-mono text-zinc-300">
                    {new Date(registeredUser.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>Entrar no Jogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* CENÁRIO 3: ABAS DE LOGIN E CADASTRO */
          <>
            {/* Alternador de Abas */}
            <div className="grid grid-cols-2 p-1.5 bg-zinc-900/60 border-b border-zinc-800/60 text-xs font-semibold">
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
                <span>Registro Shinobi</span>
              </button>
            </div>

            {/* CONTEÚDO DA ABA 1: ACESSAR SELO (LOGIN) */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                {/* Identificador (Username ou E-mail) */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Usuário ou E-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <User className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Ex: naruto_uzumaki ou ninja@konoha.ninja"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2.5 text-xs transition"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Chave Secreta (Senha)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-10 py-2.5 text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[1.75]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[1.75]" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Desbloquear Cockpit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* CONTEÚDO DA ABA 2: REGISTRO SHINOBI (CADASTRO) */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[72vh] overflow-y-auto">
                {/* Nome Completo */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Nome Completo
                    </label>
                    <span className="text-[10px] text-zinc-500">Prenome e Sobrenome</span>
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
                      placeholder="Ex: Minato Namikaze"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2 text-xs transition"
                    />
                  </div>
                  {fullName && !FULL_NAME_REGEX.test(fullName.trim()) && (
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      Informe nome e sobrenome usando apenas letras.
                    </span>
                  )}
                </div>

                {/* Nome de Usuário com Validação em Tempo Real */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Nome de Usuário
                    </label>
                    {/* Badge reativo de status */}
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
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2 text-xs transition font-mono"
                    />
                  </div>
                </div>

                {/* E-mail e Data de Nascimento em Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* E-mail */}
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
                        className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2 text-xs transition"
                      />
                    </div>
                  </div>

                  {/* Data de Nascimento */}
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
                        className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 rounded-lg pl-9 pr-3 py-2 text-xs transition font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Senha */}
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
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-10 py-2 text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Barra Dinâmica de Força da Senha */}
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
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-10 py-2 text-xs transition"
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

                {/* Checkmarks Reativos de Requisitos de Senha */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.minLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Mínimo 8 dígitos</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUppercase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Letra maiúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasLowercase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasLowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Letra minúscula</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Número</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.hasSpecialChar ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>1 Caractere especial</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordCriteria.passwordsMatch ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordCriteria.passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Senhas idênticas</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
