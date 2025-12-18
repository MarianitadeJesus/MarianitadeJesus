# EJEMPLOS DE USO - Funciones de Autenticación

## Ejemplo 1: Validar Formato de Email

```typescript
import { isValidEmail } from '@/utils/supabase/auth';

// Uso en un formulario
const handleEmailChange = (email: string) => {
  if (isValidEmail(email)) {
    console.log('✓ Email válido');
  } else {
    console.log('✗ Email inválido');
  }
};

// Ejemplos:
isValidEmail('user@example.com');        // ✓ true
isValidEmail('invalid-email');           // ✗ false
isValidEmail('user@domain.co.uk');       // ✓ true
isValidEmail('user@.com');               // ✗ false
```

## Ejemplo 2: Verificar si Email Está Registrado

```typescript
import { isEmailRegistered } from '@/utils/supabase/auth';

// Uso en recuperación de contraseña
const handlePasswordReset = async (email: string) => {
  const isRegistered = await isEmailRegistered(email);
  
  if (isRegistered) {
    console.log('✓ Email está registrado, enviando código...');
    // Enviar OTP
  } else {
    console.log('✗ Email no está vinculado a ninguna cuenta');
    // Mostrar error al usuario
  }
};

// En AuthModal:
if (!emailExists) {
  toast.error('Este correo electrónico no está vinculado a ninguna cuenta');
  return;
}
```

## Ejemplo 3: Actualizar Contraseña

```typescript
import { updatePassword } from '@/utils/supabase/auth';

// Uso al cambiar contraseña
const handleChangePassword = async (newPassword: string) => {
  try {
    const success = await updatePassword(newPassword);
    
    if (success) {
      console.log('✓ Contraseña actualizada correctamente');
      toast.success('Contraseña restablecida');
    } else {
      console.log('✗ Error al actualizar contraseña');
      toast.error('Error al actualizar contraseña');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error inesperado');
  }
};
```

## Ejemplo 4: Validaciones Completas

```typescript
import { 
  isValidEmail, 
  isEmailRegistered 
} from '@/utils/supabase/auth';
import { toast } from 'sonner';

// Validación en recuperación de contraseña
const validatePasswordRecovery = async (email: string) => {
  // Paso 1: Validar que no esté vacío
  if (!email) {
    toast.error('Por favor, ingresa tu correo electrónico');
    return false;
  }

  // Paso 2: Validar formato
  if (!isValidEmail(email)) {
    toast.error('Por favor, ingresa un correo electrónico válido');
    return false;
  }

  // Paso 3: Validar que está registrado
  const isRegistered = await isEmailRegistered(email);
  if (!isRegistered) {
    toast.error('Este correo electrónico no está vinculado a ninguna cuenta');
    return false;
  }

  // Todo correcto
  return true;
};

// Uso:
const email = 'user@example.com';
const isValid = await validatePasswordRecovery(email);
if (isValid) {
  // Proceder con recuperación
}
```

## Ejemplo 5: Integración Completa

```typescript
import React, { useState } from 'react';
import { isValidEmail, isEmailRegistered } from '@/utils/supabase/auth';
import { toast } from 'sonner';

export function PasswordRecoveryForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validación 1: Email no está vacío
      if (!email) {
        throw new Error('Por favor, ingresa tu correo electrónico');
      }

      // Validación 2: Formato válido
      if (!isValidEmail(email)) {
        throw new Error('Por favor, ingresa un correo electrónico válido');
      }

      // Validación 3: Email está registrado
      const isRegistered = await isEmailRegistered(email);
      if (!isRegistered) {
        throw new Error(
          'Este correo electrónico no está vinculado a ninguna cuenta'
        );
      }

      // Si todo está bien, continuar
      setStep('otp');
      toast.success('Código OTP enviado a tu correo');

    } catch (error: any) {
      toast.error(error.message || 'Error al procesar solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Verificando...' : 'Enviar código'}
      </button>
    </form>
  );
}
```

## Ejemplo 6: Patrón de Error Handling

```typescript
import { isEmailRegistered } from '@/utils/supabase/auth';

const handlePasswordReset = async (email: string) => {
  try {
    // Verificar si email está registrado
    const isRegistered = await isEmailRegistered(email);
    
    // Manejo explícito de resultado
    if (!isRegistered) {
      // Error específico para email no registrado
      return {
        success: false,
        error: 'EMAIL_NOT_FOUND',
        message: 'Este correo electrónico no está vinculado a ninguna cuenta'
      };
    }

    // Email válido, proceder
    return {
      success: true,
      error: null,
      message: 'Correo verificado, preparando recuperación...'
    };

  } catch (error: any) {
    // Error inesperado
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: error.message || 'Error al procesar solicitud'
    };
  }
};

// Uso:
const result = await handlePasswordReset('user@example.com');
if (result.success) {
  toast.success(result.message);
  // Proceder a siguiente paso
} else {
  toast.error(result.message);
  // Mostrar error específico
}
```

## Ejemplo 7: Validación Reactiva (mientras escribe)

```typescript
import React, { useState, useCallback } from 'react';
import { isValidEmail } from '@/utils/supabase/auth';

export function EmailInput() {
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'valid' | 'invalid' | 'empty'>(
    'empty'
  );

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);

    if (!value) {
      setEmailStatus('empty');
    } else if (isValidEmail(value)) {
      setEmailStatus('valid');
    } else {
      setEmailStatus('invalid');
    }
  }, []);

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => handleEmailChange(e.target.value)}
        placeholder="tu@email.com"
      />
      
      {emailStatus === 'valid' && (
        <p style={{ color: 'green' }}>✓ Email válido</p>
      )}
      
      {emailStatus === 'invalid' && (
        <p style={{ color: 'red' }}>✗ Email inválido</p>
      )}
    </div>
  );
}
```

## Ejemplo 8: Testing

```typescript
import { isValidEmail, isEmailRegistered } from '@/utils/supabase/auth';

// Pruebas de formato
describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });
});

// Pruebas de existencia
describe('isEmailRegistered', () => {
  it('should return false for non-existent email', async () => {
    const result = await isEmailRegistered('nonexistent@example.com');
    expect(result).toBe(false);
  });

  it('should return true for registered email', async () => {
    // Primero registrar usuario
    await createUser('test@example.com', 'password');
    
    // Luego verificar
    const result = await isEmailRegistered('test@example.com');
    expect(result).toBe(true);
  });
});
```

## Resumen de Funciones

| Función | Entrada | Salida | Uso |
|---------|---------|--------|-----|
| `isValidEmail()` | email: string | boolean | Validar formato |
| `isEmailRegistered()` | email: string | Promise<boolean> | Verificar si existe |
| `updatePassword()` | password: string | Promise<boolean> | Cambiar contraseña |
| `requestPasswordReset()` | email: string | Promise<boolean> | Iniciar recuperación |
| `getCurrentSession()` | - | Promise<Session\|null> | Obtener sesión actual |

---

**Estos ejemplos cubren los casos de uso más comunes. Para más detalles, revisa los archivos .md de documentación.**
