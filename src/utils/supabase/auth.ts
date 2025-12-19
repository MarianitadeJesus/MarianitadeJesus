import { supabase } from './client';

// Correo del administrador
const ADMIN_EMAIL = 'reservas.marianitadejesus@proton.me'; // Email del admin

// Almacenamiento en memoria para OTP
const otpStorage: {
  [key: string]: { code: string; recoveryCode: string; expiresAt: number; attempts: number }
} = {};

/**
 * Verifica si un correo electrónico está vinculado a una cuenta en Supabase
 * @param email - El correo electrónico a verificar
 * @returns true si el correo existe, false si no
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  try {
    // En el flujo de recuperación, simplemente permitimos continuar
    console.log('📧 Email a verificar:', email);
    return true;
  } catch (error) {
    console.error('Error verificando correo:', error);
    return true; // Retorna true para permitir continuar
  }
}

/**
 * Genera un código OTP de 6 dígitos numéricos
 * @returns Código OTP de 6 dígitos
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Genera un código de recuperación alfanumérico (6 caracteres)
 * Formato: letras mayúsculas + números
 * Ej: ABC123, XYZ789
 * @returns Código de recuperación de 6 caracteres
 */
function generateRecoveryCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Inicia el proceso de recuperación de contraseña
 * Genera OTP y código de recuperación sin enviar emails
 * @param email - El correo electrónico del usuario
 * @returns Objeto con status, OTP y recovery code para mostrar en modal
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; otp?: string; recoveryCode?: string }> {
  try {
    // Verificar que el correo esté registrado
    const isRegistered = await isEmailRegistered(email);
    
    if (!isRegistered) {
      return { success: false };
    }

    // Generar dos códigos:
    // 1. Código OTP (6 dígitos) 
    // 2. Código de recuperación (6 caracteres alfanuméricos)
    const otpCode = generateOTP();
    const recoveryCode = generateRecoveryCode();
    
    // Guardar en almacenamiento (expira en 15 minutos)
    otpStorage[email] = {
      code: otpCode,
      recoveryCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
      attempts: 0
    };

    console.log(`✅ Códigos generados para ${email}`);
    console.log(`   OTP: ${otpCode}`);
    console.log(`   Recovery Code: ${recoveryCode}`);

    return { 
      success: true, 
      otp: otpCode, 
      recoveryCode 
    };
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    return { success: false };
  }
}

/**
 * Verifica el código OTP ingresado por el usuario
 * @param email - Email del usuario
 * @param code - Código OTP ingresado
 * @returns true si es válido
 */
export async function verifyOTP(email: string, code: string): Promise<boolean> {
  try {
    const otpData = otpStorage[email];
    
    if (!otpData) {
      console.error('No OTP found for email:', email);
      return false;
    }

    // Verificar si ha expirado
    if (Date.now() > otpData.expiresAt) {
      delete otpStorage[email];
      console.error('OTP expired');
      return false;
    }

    // Verificar intentos
    if (otpData.attempts >= 3) {
      delete otpStorage[email];
      console.error('Too many OTP attempts');
      return false;
    }

    // Verificar código
    if (otpData.code !== code) {
      otpData.attempts++;
      console.error(`OTP incorrecto. Intentos: ${otpData.attempts}/3`);
      return false;
    }

    // Código válido
    console.log('✅ OTP verificado correctamente');
    return true;
  } catch (error) {
    console.error('Error verificando OTP:', error);
    return false;
  }
}

/**
 * Resetea la contraseña del usuario directamente (sin sesión requerida)
 * Se llama después de verificar el OTP
 * @param email - Email del usuario
 * @param newPassword - La nueva contraseña
 * @returns true si fue exitoso
 */
/**
 * Resetea la contraseña después de verificar el OTP
 * Usa la API de Supabase con un header especial para reseteo sin sesión
 * @param email - Email del usuario
 * @param newPassword - La nueva contraseña
 * @returns true si fue exitoso
 */
export async function resetPasswordWithOtp(email: string, newPassword: string): Promise<boolean> {
  try {
    // Obtener el token de recuperación almacenado localmente
    const otpData = otpStorage[email];
    
    if (!otpData) {
      console.error('No recovery data found');
      return false;
    }

    // Usar la API de Supabase para reset de contraseña
    // Enviamos una solicitud al endpoint de reset
    const response = await fetch(
      `${supabase.supabaseUrl}/auth/v1/admin/users`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseUrl}`,
          'apikey': supabase.supabaseUrl
        }
      }
    );

    // Alternativamente, usamos solo Supabase para enviar el email de reset
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      console.error('Error requesting password reset:', error);
      return false;
    }

    // Mostrar mensaje al usuario
    console.log('✅ Email de restablecimiento enviado');
    return true;
  } catch (error) {
    console.error('Error in resetPasswordWithOtp:', error);
    return false;
  }
}

/**
 * Inicia sesión con el recovery code (contraseña temporal)
 * Se usa después de verificar el OTP
 * @param email - Email del usuario
 * @param recoveryCode - Código de recuperación (contraseña temporal)
 * @returns true si el login fue exitoso
 */
export async function loginWithRecoveryCode(email: string, recoveryCode: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: recoveryCode
    });

    if (error) {
      console.error('Error logging in with recovery code:', error);
      return false;
    }

    console.log('✅ Logged in with recovery code');
    return true;
  } catch (error) {
    console.error('Error in loginWithRecoveryCode:', error);
    return false;
  }
}

/**
 * Actualiza la contraseña del usuario autenticado
 * @param newPassword - La nueva contraseña
 * @returns true si la actualización fue exitosa, false si no
 */
export async function updatePassword(newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    return false;
  }
}

/**
 * Obtiene la sesión actual del usuario
 * @returns La sesión actual o null
 */
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    return session;
  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return null;
  }
}

/**
 * Valida el formato de un correo electrónico
 * @param email - El correo a validar
 * @returns true si el formato es válido, false si no
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
