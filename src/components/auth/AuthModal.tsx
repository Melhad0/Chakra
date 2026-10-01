import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  Mail,
  Calendar,
  Lock,
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
  Edit3,
  KeyRound,
  Palette,
  Award,
  CheckCircle2,
  Flame,
  LogOut,
  Swords,
  Zap,
  Upload,
  Image as ImageIcon,
  Hash as HashIcon,
  Trash2,
  FileText,
} from 'lucide-react';
import {
  ShinobiUser,
  RegistrationPayload,
  LoginPayload,
  AuthResponse,
  CheckUsernameResponse,
  PasswordCriteria,
  FULL_NAME_REGEX,
  USERNAME_REGEX,
  SPECIAL_CHAR_REGEX,
  registrationSchema,
  loginSchema,
} from '../../types/auth';
import {
  SHINOBI_AVATARS,
  AVATAR_FRAMES,
  FAVORITE_NINJAS,
  isFrameUnlocked,
  getAvatarById,
} from '../../constants/profileCustomization';
import { useGameStore } from '../../store/useGameStore';
import { getCurrentRank } from '../../constants/rankings';
import { DiscordProfileCard } from '../profile/DiscordProfileCard';
import { InsigniaBadge } from '../profile/InsigniaBadge';
import {
  SHINOBI_INSIGNIAS,
  DEFAULT_BANNER_PRESETS,
  getDefaultEquippedInsignias,
  getInsigniaById,
} from '../../constants/insignias';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: ShinobiUser) => void;
  currentUser?: ShinobiUser | null;
  onLogout?: () => void;
}

type TabMode = 'LOGIN' | 'REGISTER';
type ProfileTabMode = 'OVERVIEW' | 'CUSTOMIZE' | 'SECURITY';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  currentUser,
  onLogout,
}) => {
  const { stats, passedExams, gauntlet, setCurrentUser: setStoreCurrentUser } = useGameStore();

  // Abas para usuário não logado
  const [activeTab, setActiveTab] = useState<TabMode>('LOGIN');

  // Abas para usuário autenticado
  const [profileTab, setProfileTab] = useState<ProfileTabMode>('OVERVIEW');

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

  // Estados de Personalização de Perfil (Discord-style)
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || 'naruto');
  const [editAvatarFrame, setEditAvatarFrame] = useState(currentUser?.avatarFrame || 'frame_default');
  const [editFavoriteNinja, setEditFavoriteNinja] = useState(
    currentUser?.favoriteNinja || 'Naruto Uzumaki'
  );
  const [editCustomAvatar, setEditCustomAvatar] = useState<string>(currentUser?.customAvatar || '');
  const [editCustomBanner, setEditCustomBanner] = useState<string>(currentUser?.customBanner || 'manga_noir');
  const [editNinjaTag, setEditNinjaTag] = useState<string>(
    currentUser?.ninjaTag || `#${currentUser?.ninjaId || '0001'}`
  );
  const [editBio, setEditBio] = useState<string>(currentUser?.bio || '');
  const [editPronouns, setEditPronouns] = useState<string>(
    currentUser?.pronouns || '☆They/them or she/her☆'
  );
  const [editStatusQuote, setEditStatusQuote] = useState<string>(
    currentUser?.statusQuote || '🌪️ tornado wya'
  );
  const [editEquippedInsignias, setEditEquippedInsignias] = useState<string[]>(
    currentUser?.equippedInsignias && currentUser.equippedInsignias.length > 0
      ? currentUser.equippedInsignias
      : getDefaultEquippedInsignias()
  );

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Manipulador de Upload de Foto Pessoal (Avatar) com compressão inteligente em canvas
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEditCustomAvatar(dataUrl);
        setErrorMessage(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Manipulador de Upload de Banner com compressão inteligente em canvas
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('A imagem de banner deve ter no máximo 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 320;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEditCustomBanner(dataUrl);
        setErrorMessage(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Alternar Insígnia equipada (máximo 6)
  const handleToggleInsignia = (insigniaId: string) => {
    setEditEquippedInsignias((prev) => {
      if (prev.includes(insigniaId)) {
        return prev.filter((id) => id !== insigniaId);
      } else {
        if (prev.length >= 6) {
          return [...prev.slice(1), insigniaId];
        }
        return [...prev, insigniaId];
      }
    });
  };

  // Validação em tempo real de username de edição
  const [editUsernameStatus, setEditUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [editUsernameMessage, setEditUsernameMessage] = useState('');
  const editUsernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados de Alteração de Senha
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Validação assíncrona de username no registro
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [usernameMessage, setUsernameMessage] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados gerais de submissão e mensagens
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<ShinobiUser | null>(null);

  // Patente atual do jogador calculada pelo motor do jogo
  const playerRankDef = useMemo(() => {
    return getCurrentRank(
      stats.manualClicksAllTime,
      stats.highestCPSRecord,
      stats.totalPrestiges,
      passedExams
    );
  }, [stats.manualClicksAllTime, stats.highestCPSRecord, stats.totalPrestiges, passedExams]);

  const highestBossDefeated = gauntlet?.highestBossDefeated || 0;

  // Fecha com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sincroniza formulários ao abrir o modal ou mudar o usuário
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setProfileSuccessMsg(null);
      setPasswordSuccessMsg(null);
      setRegisteredUser(null);
      if (currentUser) {
        setEditFullName(currentUser.fullName);
        setEditUsername(currentUser.username);
        setEditAvatar(currentUser.avatar || 'naruto');
        setEditAvatarFrame(currentUser.avatarFrame || 'frame_default');
        setEditFavoriteNinja(currentUser.favoriteNinja || 'Naruto Uzumaki');
        setEditCustomAvatar(currentUser.customAvatar || '');
        setEditCustomBanner(currentUser.customBanner || 'manga_noir');
        setEditNinjaTag(currentUser.ninjaTag || `#${currentUser.ninjaId || '0001'}`);
        setEditBio(currentUser.bio || '');
        setEditPronouns(currentUser.pronouns || '☆They/them or she/her☆');
        setEditStatusQuote(currentUser.statusQuote || '🌪️ tornado wya');
        setEditEquippedInsignias(
          currentUser.equippedInsignias && currentUser.equippedInsignias.length > 0
            ? currentUser.equippedInsignias
            : getDefaultEquippedInsignias()
        );
        setProfileTab('OVERVIEW');
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmNewPasswordInput('');
      }
    }
  }, [isOpen, currentUser]);

  // Checagem em tempo real de username no cadastro (debounce 400ms)
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
        if (!response.ok) throw new Error();
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
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [username]);

  // Checagem em tempo real de novo username na personalização (debounce 400ms)
  useEffect(() => {
    if (!currentUser) return;
    const trimmed = editUsername.trim();
    if (!trimmed || trimmed.toLowerCase() === currentUser.username.toLowerCase()) {
      setEditUsernameStatus('idle');
      setEditUsernameMessage('');
      return;
    }

    if (!USERNAME_REGEX.test(trimmed)) {
      setEditUsernameStatus('invalid');
      setEditUsernameMessage('Deve ter entre 3 e 20 caracteres (apenas letras, números e _).');
      return;
    }

    setEditUsernameStatus('checking');
    setEditUsernameMessage('Verificando disponibilidade...');

    if (editUsernameTimerRef.current) clearTimeout(editUsernameTimerRef.current);

    editUsernameTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/auth/check-username?u=${encodeURIComponent(trimmed)}`
        );
        const data = await response.json();
        if (data.available) {
          setEditUsernameStatus('available');
          setEditUsernameMessage('Nome disponível para migração.');
        } else {
          setEditUsernameStatus('taken');
          setEditUsernameMessage(data.message || 'Nome de usuário já ocupado.');
        }
      } catch {
        setEditUsernameStatus('idle');
        setEditUsernameMessage('');
      }
    }, 400);

    return () => {
      if (editUsernameTimerRef.current) clearTimeout(editUsernameTimerRef.current);
    };
  }, [editUsername, currentUser]);

  // Validação dinâmica dos critérios de senha no registro
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

  // Régua de força no registro
  const passwordStrength = useMemo(() => {
    if (!registerPassword) {
      return { stage: 'Fraca', percent: 0, colorClass: 'text-zinc-500', barBg: 'bg-zinc-800' };
    }
    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar } = passwordCriteria;
    const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
    if (score === 5 && passwordCriteria.passwordsMatch) {
      return { stage: 'Inviolável', percent: 100, colorClass: 'text-cyan-400', barBg: 'bg-gradient-to-r from-emerald-500 to-cyan-400' };
    }
    if (score >= 4) return { stage: 'Forte', percent: 75, colorClass: 'text-emerald-400', barBg: 'bg-emerald-500' };
    if (score >= 3) return { stage: 'Razoável', percent: 50, colorClass: 'text-amber-400', barBg: 'bg-amber-500' };
    return { stage: 'Fraca', percent: 25, colorClass: 'text-rose-400', barBg: 'bg-rose-500' };
  }, [registerPassword, passwordCriteria]);

  // Validação dinâmica dos critérios de alteração de senha
  const newPasswordCriteria: PasswordCriteria = useMemo(() => {
    const p = newPasswordInput;
    return {
      minLength: p.length >= 8 && p.length <= 64,
      hasUppercase: /[A-Z]/.test(p),
      hasLowercase: /[a-z]/.test(p),
      hasNumber: /[0-9]/.test(p),
      hasSpecialChar: SPECIAL_CHAR_REGEX.test(p),
      passwordsMatch: p.length > 0 && p === confirmNewPasswordInput,
    };
  }, [newPasswordInput, confirmNewPasswordInput]);

  const newPasswordStrength = useMemo(() => {
    if (!newPasswordInput) {
      return { stage: 'Fraca', percent: 0, colorClass: 'text-zinc-500', barBg: 'bg-zinc-800' };
    }
    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar } = newPasswordCriteria;
    const score = [minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
    if (score === 5 && newPasswordCriteria.passwordsMatch) {
      return { stage: 'Inviolável', percent: 100, colorClass: 'text-cyan-400', barBg: 'bg-gradient-to-r from-emerald-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]' };
    }
    if (score >= 4) return { stage: 'Forte', percent: 75, colorClass: 'text-emerald-400', barBg: 'bg-emerald-500' };
    if (score >= 3) return { stage: 'Razoável', percent: 50, colorClass: 'text-amber-400', barBg: 'bg-amber-500' };
    return { stage: 'Fraca', percent: 25, colorClass: 'text-rose-400', barBg: 'bg-rose-500' };
  }, [newPasswordInput, newPasswordCriteria]);

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
        setStoreCurrentUser(data.user);
        if (onAuthSuccess) onAuthSuccess(data.user);
        onClose();
      }
    } catch {
      setErrorMessage('Erro de conexão com o servidor. O backend Flask está ativo?');
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
        setStoreCurrentUser(data.user);
        if (onAuthSuccess) onAuthSuccess(data.user);
      }
    } catch {
      setErrorMessage('Erro de rede ao registrar shinobi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão da Atualização de Perfil (Personalização Discord)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMessage(null);
    setProfileSuccessMsg(null);

    const trimmedFullName = editFullName.trim();
    if (!trimmedFullName || trimmedFullName.length < 2) {
      setErrorMessage('Informe um nome de exibição com ao menos 2 caracteres.');
      return;
    }

    if (editUsernameStatus === 'taken' || editUsernameStatus === 'invalid') {
      setErrorMessage('Escolha um nome de usuário shinobi válido e disponível.');
      return;
    }

    let sanitizedTag = editNinjaTag.trim();
    if (sanitizedTag && !sanitizedTag.startsWith('#')) {
      sanitizedTag = `#${sanitizedTag}`;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername: currentUser.username,
          fullName: trimmedFullName,
          username: editUsername.trim(),
          avatar: editAvatar,
          avatarFrame: editAvatarFrame,
          favoriteNinja: editFavoriteNinja,
          customAvatar: editCustomAvatar.trim() || null,
          customBanner: editCustomBanner.trim() || null,
          ninjaTag: sanitizedTag || null,
          bio: editBio.trim() || null,
          pronouns: editPronouns.trim() || null,
          statusQuote: editStatusQuote.trim() || null,
          equippedInsignias: editEquippedInsignias,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Erro ao atualizar personalização de perfil.');
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        setStoreCurrentUser(data.user);
        if (onAuthSuccess) onAuthSuccess(data.user);
        setProfileSuccessMsg('Perfil shinobi personalizado com sucesso!');
        setTimeout(() => setProfileSuccessMsg(null), 4000);
        setProfileTab('OVERVIEW');
      }
    } catch {
      setErrorMessage('Falha na conexão ao atualizar perfil shinobi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submissão da Alteração de Senha (Exige Senha Atual)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMessage(null);
    setPasswordSuccessMsg(null);

    if (!currentPasswordInput) {
      setErrorMessage('A confirmação da senha atual é estritamente obrigatória.');
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setErrorMessage('A confirmação da nova chave não coincide com a nova senha digitada.');
      return;
    }

    if (newPasswordInput === currentPasswordInput) {
      setErrorMessage('A nova senha não pode ser idêntica à senha atual.');
      return;
    }

    const { minLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar } = newPasswordCriteria;
    if (!minLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setErrorMessage('A nova senha não atende a todos os critérios de segurança shinobi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput,
          confirmNewPassword: confirmNewPasswordInput,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Não foi possível alterar a senha.');
        setIsSubmitting(false);
        return;
      }

      setPasswordSuccessMsg('Chave de acesso shinobi atualizada com segurança!');
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmNewPasswordInput('');
      setTimeout(() => setPasswordSuccessMsg(null), 5000);
    } catch {
      setErrorMessage('Erro de conexão ao alterar chave de acesso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;


  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-opacity duration-200 select-none"
    >
      {/* Container Principal */}
      <div
        className={`relative w-full ${
          currentUser ? 'max-w-2xl' : 'max-w-lg'
        } bg-zinc-950/95 border border-zinc-800/80 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col text-zinc-100 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh]`}
      >
        {/* Cabeçalho do Modal */}
        <div className="px-5 sm:px-6 pt-5 pb-3.5 border-b border-zinc-800/70 flex items-center justify-between flex-shrink-0 bg-zinc-900/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 shadow-inner">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-zinc-100 uppercase flex items-center gap-2">
                <span>
                  {currentUser
                    ? 'Perfil de Shinobi Autenticado'
                    : registeredUser
                    ? 'Pergaminho de Registro'
                    : 'Acesso & Alistamento Shinobi'}
                </span>
                {currentUser && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                    Nível {stats.totalPrestiges + 1}
                  </span>
                )}
              </h2>
              <span className="text-[11px] font-mono text-zinc-500 block">
                {currentUser
                  ? 'Ficha Oficial de Identificação & Personalização'
                  : 'Sistema IAM • Cockpit de Chakra v2.0'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition"
            title="Fechar (ESC)"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* FEEDBACKS GLOBAIS DE ERRO E SUCESSO */}
        {errorMessage && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-300 flex-shrink-0 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}
        {profileSuccessMsg && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-300 flex-shrink-0 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{profileSuccessMsg}</span>
          </div>
        )}
        {passwordSuccessMsg && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2.5 text-xs text-emerald-300 flex-shrink-0 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{passwordSuccessMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CENÁRIO 1: USUÁRIO JÁ AUTENTICADO - SISTEMA DE PERFIL AVANÇADO (3 ABAS)   */}
        {/* ========================================================================= */}
        {currentUser ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Barra de Abas do Perfil */}
            <div className="grid grid-cols-3 p-1.5 bg-zinc-900/60 border-b border-zinc-800/70 text-xs font-semibold flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setProfileTab('OVERVIEW');
                  setErrorMessage(null);
                }}
                className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  profileTab === 'OVERVIEW'
                    ? 'bg-zinc-800 text-cyan-300 shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <User className="w-3.5 h-3.5 stroke-[2]" />
                <span>Ficha Shinobi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileTab('CUSTOMIZE');
                  setErrorMessage(null);
                }}
                className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  profileTab === 'CUSTOMIZE'
                    ? 'bg-zinc-800 text-cyan-300 shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5 stroke-[2]" />
                <span>Personalização</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileTab('SECURITY');
                  setErrorMessage(null);
                }}
                className={`py-2 px-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  profileTab === 'SECURITY'
                    ? 'bg-zinc-800 text-cyan-300 shadow-sm border border-zinc-700/50'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[2]" />
                <span>Segurança</span>
              </button>
            </div>

            {/* Conteúdo Dinâmico das Abas de Perfil (com Rolagem Independente) */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
              {/* ------------------------------------------------------------- */}
              {/* SUB-ABA 1: FICHA SHINOBI (ESTILO DISCORD PROFILE)            */}
              {/* ------------------------------------------------------------- */}
              {profileTab === 'OVERVIEW' && (
                <div className="space-y-5 animate-in fade-in-50 duration-200">
                  {/* Cartão de Perfil Estilo Discord Mobile */}
                  <DiscordProfileCard
                    user={currentUser}
                    onEditProfile={() => setProfileTab('CUSTOMIZE')}
                    onEditClanProfile={() => setProfileTab('CUSTOMIZE')}
                  />

                  {/* Resumo de Proezas Shinobi */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-inner">
                      <Swords className="w-4 h-4 text-rose-400 mx-auto mb-1 stroke-[1.75]" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Chefes Gauntlet
                      </span>
                      <span className="text-sm font-mono font-bold text-rose-300">
                        #{highestBossDefeated}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-inner">
                      <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1 stroke-[1.75]" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Cliques Totais
                      </span>
                      <span className="text-sm font-mono font-bold text-amber-300">
                        {stats.manualClicksAllTime.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 shadow-inner">
                      <Flame className="w-4 h-4 text-cyan-400 mx-auto mb-1 stroke-[1.75]" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Renascimentos
                      </span>
                      <span className="text-sm font-mono font-bold text-cyan-300">
                        {stats.totalPrestiges}
                      </span>
                    </div>
                  </div>

                  {/* Botões Rápidos de Ação Inferiores */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProfileTab('CUSTOMIZE')}
                        className="px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/60 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Personalizar Perfil</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setProfileTab('SECURITY')}
                        className="px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-zinc-100 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Mudar Senha</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onLogout) onLogout();
                          onClose();
                        }}
                        className="px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/40 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair</span>
                      </button>

                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition shadow-md cursor-pointer"
                      >
                        Voltar ao Jogo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-ABA 2: PERSONALIZAÇÃO AVANÇADA (DISCORD STYLE)          */}
              {/* ------------------------------------------------------------- */}
              {profileTab === 'CUSTOMIZE' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in-50 duration-200">
                  {/* Inputs de Arquivo Ocultos */}
                  <input
                    type="file"
                    ref={avatarFileInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />

                  {/* SEÇÃO 1: FOTO PESSOAL & AVATAR */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Foto Pessoal / Avatar do Usuário</span>
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Upload pessoal ou avatares anime
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      {/* Preview do Avatar Selecionado */}
                      <div className="relative group flex-shrink-0">
                        <div className="w-20 h-20 rounded-full p-1 bg-zinc-950 border-2 border-cyan-500/50 shadow-xl overflow-hidden flex items-center justify-center">
                          {editCustomAvatar ? (
                            <img
                              src={editCustomAvatar}
                              alt="Foto Pessoal"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-full h-full rounded-full bg-gradient-to-br ${
                                getAvatarById(editAvatar).bgGradient
                              } flex items-center justify-center text-3xl shadow-inner`}
                            >
                              <span>{getAvatarById(editAvatar).emojiIcon}</span>
                            </div>
                          )}
                        </div>

                        {editCustomAvatar && (
                          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-[9px] font-mono font-bold text-zinc-950 shadow">
                            Pessoal
                          </div>
                        )}
                      </div>

                      {/* Botões de Ação para Foto Pessoal */}
                      <div className="flex-1 space-y-2 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                            type="button"
                            onClick={() => avatarFileInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Enviar Foto do Computador</span>
                          </button>

                          {editCustomAvatar && (
                            <button
                              type="button"
                              onClick={() => setEditCustomAvatar('')}
                              className="px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/60 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remover Foto Pessoal</span>
                            </button>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-400">
                          {editCustomAvatar ? (
                            <span className="text-emerald-400 font-mono">
                              ✓ Sua foto pessoal está selecionada e será salva no seu perfil.
                            </span>
                          ) : (
                            <span>
                              Envie sua foto pessoal (PNG, JPG, WebP) ou escolha um dos personagens de anime abaixo.
                            </span>
                          )}
                        </div>

                        {/* Opção de Colar URL de Imagem */}
                        <div className="pt-1">
                          <input
                            type="url"
                            value={editCustomAvatar.startsWith('data:') ? '' : editCustomAvatar}
                            onChange={(e) => setEditCustomAvatar(e.target.value)}
                            placeholder="Ou cole a URL direta de uma imagem na web..."
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-600 rounded-xl px-3 py-1.5 text-xs font-mono transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Grade de Avatares Canônicos Shinobi Alternativos */}
                    <div className="pt-2 border-t border-zinc-800/60">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                        Avatares Oficiais Shinobi (12 Opções)
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {SHINOBI_AVATARS.map((avatar) => {
                          const isSelected = !editCustomAvatar && editAvatar === avatar.id;
                          return (
                            <button
                              key={avatar.id}
                              type="button"
                              onClick={() => {
                                setEditCustomAvatar('');
                                setEditAvatar(avatar.id);
                              }}
                              className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer relative ${
                                isSelected
                                  ? 'bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                                  : 'bg-zinc-950/50 hover:bg-zinc-900 border-zinc-850 hover:border-zinc-700'
                              }`}
                            >
                              <div
                                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-lg shadow-inner`}
                              >
                                <span>{avatar.emojiIcon}</span>
                              </div>
                              <span className="text-[9px] font-semibold text-zinc-300 truncate w-full">
                                {avatar.name.split(' ')[0]}
                              </span>
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-cyan-400 text-zinc-950 flex items-center justify-center">
                                  <Check className="w-2 h-2 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 2: BANNER DE PERFIL */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                        <span>Banner Superior do Perfil (Estilo Discord)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Banner</span>
                      </button>
                    </div>

                    {/* Preview do Banner Ativo */}
                    <div className="relative w-full h-24 rounded-xl overflow-hidden border border-zinc-700/60 shadow-md">
                      <img
                        src={(() => {
                          if (editCustomBanner) {
                            if (editCustomBanner.startsWith('data:') || editCustomBanner.startsWith('http')) {
                              return editCustomBanner;
                            }
                            const p = DEFAULT_BANNER_PRESETS.find((b) => b.id === editCustomBanner);
                            if (p) return p.imageUrl;
                          }
                          return DEFAULT_BANNER_PRESETS[0].imageUrl;
                        })()}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex items-end p-2.5">
                        <span className="text-[11px] font-mono font-medium text-white/90 drop-shadow">
                          {DEFAULT_BANNER_PRESETS.find((b) => b.id === editCustomBanner)?.name || 'Banner Personalizado'}
                        </span>
                      </div>
                    </div>

                    {/* Presets de Banner (Incluindo Mangá Noir da Referência) */}
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                        Temas e Presets Disponíveis:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {DEFAULT_BANNER_PRESETS.map((preset) => {
                          const isSelected = editCustomBanner === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setEditCustomBanner(preset.id)}
                              className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-950/40 border-purple-400 ring-2 ring-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                                  : 'bg-zinc-950/60 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                              }`}
                            >
                              <div className="w-full h-12 rounded-lg overflow-hidden mb-1.5 relative">
                                <img
                                  src={preset.imageUrl}
                                  alt={preset.name}
                                  className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-400 text-zinc-950 flex items-center justify-center shadow">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-bold block truncate">{preset.name}</span>
                              <span className="text-[9px] font-mono text-zinc-500 block truncate">
                                {preset.theme}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SEÇÃO 3: SISTEMA DE INSÍGNIAS (BADGES DISCORD) */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Insígnias de Perfil (Badges estilo Discord)</span>
                      </label>
                      <span className="text-[10px] font-mono font-bold text-cyan-400">
                        {editEquippedInsignias.length}/6 Equipadas
                      </span>
                    </div>

                    {/* Faixa de Pré-visualização das Insígnias Equipadas */}
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar min-h-[46px]">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase mr-1">Preview:</span>
                      {editEquippedInsignias.length === 0 ? (
                        <span className="text-xs text-zinc-500 italic">Nenhuma insígnia equipada. Clique abaixo para equipar!</span>
                      ) : (
                        editEquippedInsignias.map((id) => {
                          const ins = getInsigniaById(id);
                          if (!ins) return null;
                          return <InsigniaBadge key={ins.id} insignia={ins} size="md" />;
                        })
                      )}
                    </div>

                    {/* Grade com Todas as 8 Insígnias Shinobi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SHINOBI_INSIGNIAS.map((insignia) => {
                        const isEquipped = editEquippedInsignias.includes(insignia.id);
                        return (
                          <button
                            key={insignia.id}
                            type="button"
                            onClick={() => handleToggleInsignia(insignia.id)}
                            className={`p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer relative ${
                              isEquipped
                                ? 'bg-zinc-900/90 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                                : 'bg-zinc-950/40 hover:bg-zinc-900/50 border-zinc-850 hover:border-zinc-750 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <InsigniaBadge insignia={insignia} size="md" />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-zinc-200 truncate">
                                  {insignia.name}
                                </span>
                                <span
                                  className={`text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${
                                    isEquipped
                                      ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-400'
                                      : 'bg-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  {isEquipped ? 'Equipada' : 'Equipar'}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                                {insignia.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SEÇÃO 4: IDENTIDADE VISUAL (# NOME E # TAG) */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                      <HashIcon className="w-4 h-4 text-emerald-400" />
                      <span>Identidade Visual: Nome de Exibição & Tag (#)</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {/* Nome de Exibição (# Name) */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                          <span>Nome de Exibição (#)</span>
                          <span className="text-[10px] text-zinc-500 font-normal">Ex: your mama</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-bold text-sm">
                            #
                          </div>
                          <input
                            type="text"
                            required
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            placeholder="your mama"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 font-bold rounded-xl pl-8 pr-3 py-2 text-xs transition"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Aparece como o título principal do seu perfil Discord.
                        </span>
                      </div>

                      {/* Tag Shinobi Personalizada (#0001, #7777) */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1 flex items-center justify-between">
                          <span>Tag Shinobi (#)</span>
                          <span className="text-[10px] text-zinc-500 font-normal">Ex: #0001 ou #7777</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-bold text-sm">
                            #
                          </div>
                          <input
                            type="text"
                            value={editNinjaTag.startsWith('#') ? editNinjaTag.slice(1) : editNinjaTag}
                            onChange={(e) => setEditNinjaTag(`#${e.target.value}`)}
                            placeholder={String(currentUser.ninjaId || '0001')}
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-cyan-400 font-mono font-bold rounded-xl pl-8 pr-3 py-2 text-xs transition"
                          />
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Sua hashtag oficial de shinobi exibida ao lado do seu @username.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {/* Nome de Usuário (@username) com Migração de Save */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                            Nome de Usuário (@)
                          </label>
                          {editUsernameStatus === 'checking' && (
                            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Verificando...
                            </span>
                          )}
                          {editUsernameStatus === 'available' && (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> Disponível
                            </span>
                          )}
                          {editUsernameStatus === 'taken' && (
                            <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
                              <X className="w-2.5 h-2.5" /> Ocupado
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                            @
                          </div>
                          <input
                            type="text"
                            required
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="trulycasper"
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 rounded-xl pl-8 pr-3 py-2 text-xs transition font-mono"
                          />
                        </div>
                        {editUsernameMessage && (
                          <span
                            className={`text-[10px] mt-1 block font-mono ${
                              editUsernameStatus === 'available'
                                ? 'text-emerald-400'
                                : editUsernameStatus === 'taken'
                                ? 'text-rose-400'
                                : 'text-zinc-400'
                            }`}
                          >
                            {editUsernameMessage}
                          </span>
                        )}
                      </div>

                      {/* Pronomes / Subtítulo Estético */}
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                          Pronomes / Subtítulo
                        </label>
                        <input
                          type="text"
                          value={editPronouns}
                          onChange={(e) => setEditPronouns(e.target.value)}
                          placeholder="☆They/them or she/her☆"
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-200 font-serif rounded-xl px-3 py-2 text-xs transition"
                        />
                        <span className="text-[10px] text-zinc-500 mt-1 block">
                          Frase curta ou pronomes exibidos abaixo do @handle.
                        </span>
                      </div>
                    </div>

                    {/* Frase de Status Shinobi */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                        Frase de Status Shinobi
                      </label>
                      <input
                        type="text"
                        value={editStatusQuote}
                        onChange={(e) => setEditStatusQuote(e.target.value)}
                        placeholder="🌪️ tornado wya"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-200 rounded-xl px-3 py-2 text-xs transition"
                      />
                    </div>
                  </div>

                  {/* SEÇÃO 5: ABOUT ME (CAIXA TRACEJADA ESTILO DISCORD) */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>About Me (Biografia Estilo Discord)</span>
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {editBio.length}/350 caracteres
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/80 border border-dashed border-zinc-700/80 focus-within:border-cyan-500/80 transition-colors">
                      <textarea
                        rows={3}
                        maxLength={350}
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder={'* ₊ ✦ Pinterest: trulycasper\n* ₊ ✧ matching pfps w/ jed\n* ₊ ˚ # live laugh love cgs'}
                        className="w-full bg-transparent border-none focus:outline-none text-zinc-200 placeholder-zinc-600 text-xs font-mono resize-none leading-relaxed"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      Suporta quebras de linha e símbolos estéticos exatamente como o Discord mobile.
                    </span>
                  </div>

                  {/* SEÇÃO 6: MOLDURA ELEMENTAL & NINJA FAVORITO */}
                  <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
                    {/* Moldura Elemental */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Moldura Elemental</span>
                        </label>
                        <span className="text-[10px] font-mono text-zinc-500">
                          Patente & Chefes
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {AVATAR_FRAMES.map((frame) => {
                          const isUnlocked = isFrameUnlocked(
                            frame,
                            playerRankDef.id,
                            highestBossDefeated
                          );
                          const isSelected = editAvatarFrame === frame.id;

                          return (
                            <button
                              key={frame.id}
                              type="button"
                              disabled={!isUnlocked}
                              onClick={() => {
                                if (isUnlocked) setEditAvatarFrame(frame.id);
                              }}
                              className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all relative ${
                                !isUnlocked
                                  ? 'bg-zinc-950/60 border-zinc-900 opacity-60 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer'
                                  : 'bg-zinc-950/40 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg bg-zinc-900 border-2 ${frame.borderClass} flex items-center justify-center text-xs flex-shrink-0`}
                              >
                                {isUnlocked ? (
                                  <span>{getAvatarById(editAvatar).emojiIcon}</span>
                                ) : (
                                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-zinc-200 truncate">
                                    {frame.name}
                                  </span>
                                  {isUnlocked && isSelected && (
                                    <span className="text-[9px] font-mono font-bold text-cyan-400">
                                      Ativa
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-mono text-zinc-500 block truncate">
                                  {frame.requirementLabel}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ninja Favorito */}
                    <div className="pt-2 border-t border-zinc-800/60">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ninja Favorito & Citação</span>
                      </label>

                      <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                        {FAVORITE_NINJAS.map((ninja) => {
                          const isSelected =
                            editFavoriteNinja === ninja.name || editFavoriteNinja === ninja.id;
                          return (
                            <button
                              key={ninja.id}
                              type="button"
                              onClick={() => setEditFavoriteNinja(ninja.name)}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-amber-950/30 border-amber-500/80 ring-1 ring-amber-400/40 text-amber-200'
                                  : 'bg-zinc-950/40 hover:bg-zinc-900 border-zinc-800 text-zinc-300'
                              }`}
                            >
                              <span className="text-base flex-shrink-0">{ninja.insignia}</span>
                              <div className="min-w-0 flex-1">
                                <span className="text-[11px] font-bold block truncate">{ninja.name}</span>
                                <span className="text-[8px] font-mono text-zinc-500 block truncate">
                                  Clã {ninja.clan}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-3 h-3 text-amber-400 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Botões do Formulário de Personalização */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileTab('OVERVIEW')}
                      className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || editUsernameStatus === 'taken' || editUsernameStatus === 'invalid'}
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Gravando Alterações...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Salvar Perfil Discord</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-ABA 3: SEGURANÇA & ALTERAÇÃO DE SENHA (EXIGE SENHA ATUAL) */}
              {/* ------------------------------------------------------------- */}
              {profileTab === 'SECURITY' && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300 flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Por motivos de segurança e integridade do seu selo de chakra, informe sua{' '}
                      <strong>senha atual</strong> para autorizar a redefinição de chave.
                    </p>
                  </div>

                  {/* Campo: Senha Atual (OBRIGATÓRIO) */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1 flex items-center justify-between">
                      <span>Senha Atual do Shinobi *</span>
                      <span className="text-[10px] text-zinc-500 font-normal">Identificação</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Lock className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="Digite sua senha atual"
                        className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-10 py-2.5 text-xs transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Campo: Nova Senha */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                        Nova Chave Secreta (Nova Senha)
                      </label>
                      <span
                        className={`text-[10px] font-mono font-bold ${newPasswordStrength.colorClass}`}
                      >
                        Força: {newPasswordStrength.stage}
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Lock className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-10 py-2.5 text-xs transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Barra de Força */}
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${newPasswordStrength.barBg}`}
                        style={{ width: `${newPasswordStrength.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Campo: Confirmar Nova Senha */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-300 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Lock className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPasswordInput}
                        onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                        placeholder="Repita a nova senha exatamente"
                        className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-10 py-2.5 text-xs transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Checklist Dinâmico de Requisitos */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 ${
                        newPasswordCriteria.minLength ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {newPasswordCriteria.minLength ? (
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        newPasswordCriteria.hasUppercase ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {newPasswordCriteria.hasUppercase ? (
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>1 Letra maiúscula</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        newPasswordCriteria.hasLowercase ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {newPasswordCriteria.hasLowercase ? (
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>1 Letra minúscula</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        newPasswordCriteria.hasNumber ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {newPasswordCriteria.hasNumber ? (
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>1 Número</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        newPasswordCriteria.hasSpecialChar ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {newPasswordCriteria.hasSpecialChar ? (
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>1 Caractere especial</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${
                        newPasswordCriteria.passwordsMatch ? 'text-emerald-400 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {newPasswordCriteria.passwordsMatch ? (
                        <Check className="w-3.5 h-3.5 stroke-[2]" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>Senhas idênticas</span>
                    </div>
                  </div>

                  {/* Botões do Formulário de Senha */}
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setProfileTab('OVERVIEW')}
                      className="px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition"
                    >
                      Voltar à Ficha
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || !currentPasswordInput || !newPasswordCriteria.passwordsMatch}
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Atualizando Chave...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Confirmar Nova Senha</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : registeredUser ? (
          /* ========================================================================= */
          /* CENÁRIO 2: PERGAMINHO DE REGISTRO NINJA PÓS-CADASTRO                      */
          /* ========================================================================= */
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
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Entrar no Cockpit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* ========================================================================= */
          /* CENÁRIO 3: ABAS DE LOGIN E CADASTRO PARA USUÁRIOS NÃO AUTENTICADOS        */
          /* ========================================================================= */
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

            {/* ABA LOGIN */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
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
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

            {/* ABA REGISTRO SHINOBI */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5 max-h-[72vh] overflow-y-auto custom-scrollbar">
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
                        <X className="w-3 h-3" /> Ocupado
                      </span>
                    )}
                    {usernameStatus === 'invalid' && (
                      <span className="text-[10px] font-mono text-amber-400">Inválido</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 font-mono text-xs">
                      @
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="kakashi_hatake"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-8 pr-3 py-2 text-xs transition font-mono"
                    />
                  </div>
                  {usernameMessage && (
                    <span
                      className={`text-[10px] mt-1 block font-mono ${
                        usernameStatus === 'available'
                          ? 'text-emerald-400'
                          : usernameStatus === 'taken'
                          ? 'text-rose-400'
                          : 'text-zinc-400'
                      }`}
                    >
                      {usernameMessage}
                    </span>
                  )}
                </div>

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
                      placeholder="exemplo@chakra.ninja"
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 placeholder-zinc-500 rounded-lg pl-9 pr-3 py-2 text-xs transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Data de Nascimento
                    </label>
                    <span className="text-[10px] text-zinc-500">Mínimo 6 anos</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Calendar className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-zinc-100 rounded-lg pl-9 pr-3 py-2 text-xs transition font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      Chave Secreta (Senha)
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${passwordStrength.colorClass}`}>
                      {passwordStrength.stage}
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

                  <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.barBg}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                </div>

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
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
