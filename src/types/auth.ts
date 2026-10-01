import { z } from 'zod';

export interface ShinobiUser {
  ninjaId: number;           // ID numérico aleatório único de até 8 dígitos (ex: 1222133)
  fullName: string;          // Nome completo do ninja
  username: string;          // Nome de usuário único (case-insensitive para login)
  email: string;             // E-mail válido e formatado
  birthDate: string;         // Data de nascimento (formato ISO: YYYY-MM-DD)
  createdAt: string;         // Timestamp ISO da criação
  avatar?: string;           // ID do avatar selecionado (ex: 'naruto', 'kakashi') ou 'custom'
  avatarFrame?: string;      // ID da borda selecionada (ex: 'frame_fire', 'frame_hokage')
  favoriteNinja?: string;    // ID do ninja favorito (ex: 'itachi', 'naruto')
  customAvatar?: string;     // Imagem pessoal customizada (Base64 data:image/... ou URL)
  customBanner?: string;     // Imagem de banner personalizada (Base64 ou URL ou preset ID)
  ninjaTag?: string;         // Tag hashtag customizada (ex: '#0001', '#7777')
  bio?: string;              // "About Me" / Sobre Mim
  pronouns?: string;         // Pronomes / Subtítulo estético (ex: '☆They/them or she/her☆')
  statusQuote?: string;      // Frase de status / Lema (ex: '🌪️ tornado wya')
  equippedInsignias?: string[]; // IDs das insígnias selecionadas para exibição no perfil
}

export interface UpdateProfilePayload {
  fullName: string;
  username: string;
  avatar?: string;
  avatarFrame?: string;
  favoriteNinja?: string;
  customAvatar?: string;
  customBanner?: string;
  ninjaTag?: string;
  bio?: string;
  pronouns?: string;
  statusQuote?: string;
  equippedInsignias?: string[];
}

export interface ChangePasswordPayload {
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RegistrationPayload {
  fullName: string;
  username: string;
  email: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  loginIdentifier: string;   // Pode ser o username ou o e-mail
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: ShinobiUser;
  token?: string;
}

export interface CheckUsernameResponse {
  available: boolean;
  message: string;
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  passwordsMatch: boolean;
}

export type PasswordStrengthStage = 'Fraca' | 'Razoável' | 'Forte' | 'Inviolável';

// Regex canônica de nome completo (prenome e sobrenome sem números/símbolos)
export const FULL_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ]+)+$/;

// Regex canônica de username (3 a 20 caracteres alfanuméricos e sublinhados)
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Regex estrita RFC 5322 para e-mail
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regex para caracteres especiais de senha
export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/;

// Função utilitária de cálculo de idade
export function calculateAge(birthDateString: string): number {
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Schema de validação Zod para Cadastro
export const registrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, 'O nome deve ter ao menos 3 caracteres.')
      .max(70, 'O nome não pode exceder 70 caracteres.')
      .regex(FULL_NAME_REGEX, 'Informe nome e sobrenome válidos (apenas letras).'),
    username: z
      .string()
      .trim()
      .min(3, 'O usuário deve ter ao menos 3 caracteres.')
      .max(20, 'O usuário não pode exceder 20 caracteres.')
      .regex(USERNAME_REGEX, 'Apenas letras, números e sublinhados (_).'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .regex(EMAIL_REGEX, 'Formato de e-mail inválido.'),
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD).')
      .refine((val) => {
        const d = new Date(val);
        const now = new Date();
        return !isNaN(d.getTime()) && d <= now;
      }, 'A data de nascimento não pode estar no futuro.')
      .refine((val) => {
        const age = calculateAge(val);
        return age >= 6;
      }, 'A idade mínima de ingresso na Academia Ninja é de 6 anos.')
      .refine((val) => {
        const age = calculateAge(val);
        return age <= 120;
      }, 'Data de nascimento fora do limite plausível (máximo 120 anos).'),
    password: z
      .string()
      .min(8, 'A senha deve ter no mínimo 8 caracteres.')
      .max(64, 'A senha não pode exceder 64 caracteres.')
      .regex(/[A-Z]/, 'Ao menos uma letra maiúscula necessária.')
      .regex(/[a-z]/, 'Ao menos uma letra minúscula necessária.')
      .regex(/[0-9]/, 'Ao menos um número necessário.')
      .regex(SPECIAL_CHAR_REGEX, 'Ao menos um caractere especial necessário.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

// Schema de validação Zod para Login
export const loginSchema = z.object({
  loginIdentifier: z
    .string()
    .trim()
    .min(3, 'Informe seu usuário ou e-mail cadastrado.'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória.'),
});

// Schema de validação Zod para Atualização de Perfil
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'O nome de exibição deve ter ao menos 2 caracteres.')
    .max(70, 'O nome de exibição não pode exceder 70 caracteres.'),
  username: z
    .string()
    .trim()
    .min(3, 'O usuário deve ter ao menos 3 caracteres.')
    .max(20, 'O usuário não pode exceder 20 caracteres.')
    .regex(USERNAME_REGEX, 'Apenas letras, números e sublinhados (_).'),
  avatar: z.string().optional(),
  avatarFrame: z.string().optional(),
  favoriteNinja: z.string().optional(),
  customAvatar: z.string().optional(),
  customBanner: z.string().optional(),
  ninjaTag: z.string().optional(),
  bio: z.string().max(350, 'A biografia não pode exceder 350 caracteres.').optional(),
  pronouns: z.string().max(50, 'Pronomes não podem exceder 50 caracteres.').optional(),
  statusQuote: z.string().max(80, 'O status não pode exceder 80 caracteres.').optional(),
  equippedInsignias: z.array(z.string()).optional(),
});

// Schema de validação Zod para Alteração de Senha
export const changePasswordSchema = z
  .object({
    username: z.string(),
    currentPassword: z.string().min(1, 'A senha atual é obrigatória.'),
    newPassword: z
      .string()
      .min(8, 'A nova senha deve ter no mínimo 8 caracteres.')
      .max(64, 'A nova senha não pode exceder 64 caracteres.')
      .regex(/[A-Z]/, 'Ao menos uma letra maiúscula necessária.')
      .regex(/[a-z]/, 'Ao menos uma letra minúscula necessária.')
      .regex(/[0-9]/, 'Ao menos um número necessário.')
      .regex(SPECIAL_CHAR_REGEX, 'Ao menos um caractere especial necessário.'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As novas senhas não coincidem.',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'A nova senha não pode ser idêntica à senha atual.',
    path: ['newPassword'],
  });

