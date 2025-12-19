import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { 
  isEmailRegistered, 
  isValidEmail,
  requestPasswordReset,
  verifyOTP,
  resetPasswordWithOtp,
  updatePassword,
  loginWithRecoveryCode
} from '../utils/supabase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'forgot';
  onSuccess: (session: any, user: any, isAdmin: boolean) => void;
  onSwitchMode: (mode: 'login' | 'signup' | 'forgot') => void;
}

export function AuthModal({ isOpen, onClose, mode, onSuccess, onSwitchMode }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // OTP Flow
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    // Check if admin login
    if (email === 'marianitadejesusadmin') {
      // Manual admin validation - in production, use secure method
      if (password === 'admin123') { // Change this to a secure password
        const mockSession = { access_token: 'admin-token', user: { email } };
        onSuccess(mockSession, { email }, true);
        onClose();
        resetForm();
        toast.success('¡Bienvenido Administrador!');
      } else {
        toast.error('Credenciales de administrador incorrectas');
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('¡Bienvenido!');
      onSuccess(data.session, data.user, false);
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    if (email === 'marianitadejesusadmin') {
      toast.error('No se puede registrar con este correo electrónico');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (error) throw error;

      // Si se creó la sesión sin esperar confirmación
      if (data.session) {
        toast.success('¡Cuenta creada exitosamente!');
        onSuccess(data.session, data.user, false);
        onClose();
        resetForm();
      } else {
        // Si necesita confirmación
        toast.success('¡Cuenta creada! Revisa tu correo para confirmar.');
        resetForm();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!email) {
      toast.error('Por favor, ingresa tu correo electrónico');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setLoading(true);
    try {
      // Verify that the email is linked to an account
      const emailExists = await isEmailRegistered(email);
      
      if (!emailExists) {
        toast.error('Este correo electrónico no está vinculado a ninguna cuenta');
        setLoading(false);
        return;
      }

      // Request password reset - generates OTP locally
      const result = await requestPasswordReset(email);
      
      if (!result.success || !result.otp || !result.recoveryCode) {
        toast.error('Error al procesar la solicitud de recuperación');
        setLoading(false);
        return;
      }

      // Store codes
      setDemoOtp(result.otp); // OTP para mostrar en la interfaz
      setResetToken(result.recoveryCode); // Recovery code guardado
      
      setOtpSent(true);
      toast.success('✓ Códigos generados\n📋 Ingresa el código OTP para continuar');
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Por favor, ingresa el código OTP');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP code
      const isValid = await verifyOTP(email, otp);
      
      if (!isValid) {
        toast.error('Código OTP inválido o expirado');
        setLoading(false);
        return;
      }

      setOtpVerified(true);
      toast.success('✓ Código verificado. Ahora establece tu nueva contraseña');
    } catch (error: any) {
      toast.error(error.message || 'Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Por favor, completa ambos campos de contraseña');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Login with recovery code to get a valid session
      const loginSuccess = await loginWithRecoveryCode(email, resetToken);
      
      if (!loginSuccess) {
        throw new Error('No se pudo autenticar con el código de recuperación');
      }

      // Step 2: Update password with the new session
      const updateSuccess = await updatePassword(newPassword);
      
      if (!updateSuccess) {
        throw new Error('Error al actualizar la contraseña');
      }

      toast.success('✓ ¡Contraseña restablecida exitosamente!\nAhora puedes iniciar sesión con tu nueva contraseña');
      
      // Reset to login mode
      onSwitchMode('login');
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setDemoOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/95 border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-green-800">
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'signup' && 'Crear Cuenta'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {mode === 'login' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="pl-10 pr-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => onSwitchMode('forgot')}
                className="text-sm text-green-700 hover:text-green-800 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
              >
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => onSwitchMode('signup')}
                  className="text-green-700 hover:text-green-800 hover:underline"
                >
                  Crear una
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => onSwitchMode('login')}
                  className="text-green-700 hover:text-green-800 hover:underline"
                >
                  Iniciar sesión
                </button>
              </div>
            </>
          )}

          {mode === 'forgot' && !otpSent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleRequestOtp()}
                  />
                </div>
              </div>

              <Button
                onClick={handleRequestOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
              >
                {loading ? 'Enviando...' : 'Recuperar'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                <button
                  onClick={() => onSwitchMode('login')}
                  className="text-green-700 hover:text-green-800 hover:underline"
                >
                  Volver a iniciar sesión
                </button>
              </div>
            </>
          )}

          {mode === 'forgot' && otpSent && !otpVerified && (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Código OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Ingresa el código de 6 dígitos"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerifyOtp()}
                />
                {demoOtp && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 mb-1">
                      <strong>Modo demostración:</strong> Tu código OTP es:
                    </p>
                    <p className="text-2xl font-mono text-center text-amber-900 tracking-wider">
                      {demoOtp}
                    </p>
                    <p className="text-xs text-amber-700 mt-2 text-center">
                      En producción, este código se enviará automáticamente a tu correo
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </Button>
            </>
          )}

          {mode === 'forgot' && otpVerified && (
            <>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirma tu contraseña"
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                  />
                </div>
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white"
              >
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
