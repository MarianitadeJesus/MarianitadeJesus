# Configuración de Supabase para Recuperación de Contraseña

## Pasos para Configurar en el Dashboard de Supabase

### 1. Configurar Templates de Email

#### 1.1 Ir a Authentication → Email Templates

En el dashboard de Supabase:
```
Supabase Dashboard
  → Your Project
    → Authentication
      → Email Templates
```

#### 1.2 Reset Password Email

**Template Key**: `reset_password`

**Asunto Recomendado:**
```
Recupera tu contraseña - [Tu Sitio Web]
```

**Cuerpo del Email (HTML):**
```html
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      
      <h2 style="color: #166534; margin-bottom: 20px;">Recuperar Contraseña</h2>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hola {{ .Data.email }},
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Recibimos una solicitud para recuperar tu contraseña. Si no fuiste tú, ignora este mensaje.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" style="
          display: inline-block;
          padding: 12px 30px;
          background-color: #16a34a;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          font-size: 16px;
        ">
          Restablecer Contraseña
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
        O copia y pega este enlace en tu navegador:
      </p>
      
      <p style="color: #666; font-size: 12px; word-break: break-all; margin-bottom: 20px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #16a34a;">
        {{ .ConfirmationURL }}
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      
      <p style="color: #999; font-size: 12px; margin: 0;">
        Este enlace expirará en 24 horas por razones de seguridad.
      </p>
    </div>
  </body>
</html>
```

### 2. Configurar Variables de Entorno

#### 2.1 Obtener credenciales de Supabase

1. Ir a **Project Settings → API**
2. Copiar:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`

#### 2.2 Crear archivo `.env.local`

En la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configurar Servicio de Email (SMTP)

#### 3.1 Opción 1: Usar Resend (Recomendado)

1. Crear cuenta en [resend.com](https://resend.com)
2. Ir a Supabase: **Authentication → Email Templates**
3. En la sección SMTP, seleccionar "Resend"
4. Ingresar API key de Resend

#### 3.2 Opción 2: Configurar SMTP Manual

1. Supabase: **Authentication → Email Templates**
2. Configurar SMTP:
   - **Host SMTP**: smtp.tu-email-service.com
   - **Puerto**: 587
   - **Usuario**: tu-email@dominio.com
   - **Contraseña**: contraseña-smtp

### 4. Personalizar URL de Retorno

#### 4.1 Configurar Redirect URLs

En Supabase: **Authentication → URL Configuration**

Agregar URLs permitidas:
```
http://localhost:5173/auth/reset-password
https://tu-sitio.com/auth/reset-password
```

#### 4.2 Código para Manejar Callback (Opcional)

Si deseas redirigir después de resetear:

```typescript
// En App.tsx o componente principal
import { useEffect } from 'react';
import { supabase } from './utils/supabase/client';

export function App() {
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Redirigir a página de cambio de contraseña
          window.location.href = '/reset-password';
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return <YourApp />;
}
```

## Verificación de Configuración

### Test 1: Validar Formato de Email
```bash
# En la consola del navegador
import { isValidEmail } from './utils/supabase/auth.ts'
console.log(isValidEmail('test@example.com')); // true
console.log(isValidEmail('invalid-email')); // false
```

### Test 2: Verificar Correo Registrado
```bash
# En la consola
import { isEmailRegistered } from './utils/supabase/auth.ts'
const exists = await isEmailRegistered('usuario@example.com');
console.log(exists); // true o false
```

### Test 3: Flujo Completo
1. Crear cuenta: `test@example.com` / `password123`
2. Cerrar sesión
3. Hacer clic en "¿Olvidaste tu contraseña?"
4. Ingresar `test@example.com`
5. Debería mostrar código OTP (en demo) o enviar email (en producción)

## Troubleshooting

### Problema: "Email configuration is missing"
**Solución**: Configurar SMTP en Authentication → Email Templates

### Problema: Email no llega
**Solución**: Verificar:
- SMTP credenciales correctas
- Dominio no está en lista negra
- Revisar logs en Supabase: **Auth → Logs**

### Problema: "User not found" en reset
**Solución**: Verificar que el usuario existe en **Authentication → Users**

### Problema: Enlace de reset no funciona
**Solución**:
- Verificar URL en email matches `URL Configuration`
- Verificar token no ha expirado (24 horas)
- Revisar logs: **Authentication → Logs**

## Seguridad - Buenas Prácticas

✓ **Habilitar** 2FA para usuarios
✓ **Usar HTTPS** en producción
✓ **Validar** formato de email antes de enviar
✓ **Limitar** intentos de reset (máximo 3 por hora)
✓ **Registrar** intentos fallidos
✓ **Expiración** de tokens en 24 horas
✓ **No revelar** si email existe o no (en producción)

## URLs Útiles

- Documentación Supabase Auth: https://supabase.com/docs/guides/auth
- Documentación Email Templates: https://supabase.com/docs/guides/auth/auth-smtp
- Resend Documentation: https://resend.com/docs

