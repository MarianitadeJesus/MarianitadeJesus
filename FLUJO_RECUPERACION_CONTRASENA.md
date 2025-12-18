# Flujo de Recuperación y Cambio de Contraseña

## Descripción General

Se ha implementado un flujo seguro de recuperación y cambio de contraseña que:

1. **Verifica que el correo esté registrado** antes de proceder
2. **Redirige al usuario** a través del proceso paso a paso
3. **Valida el formato del correo** electrónico
4. **Genera un código OTP** (One Time Password) para verificación adicional
5. **Permite cambiar la contraseña** de forma segura

## Flujo Paso a Paso

### 1. Usuario solicita recuperar contraseña
```
Usuario → Hace clic en "¿Olvidaste tu contraseña?"
        → Se abre modal de recuperación
```

### 2. Ingresa su correo electrónico
```
Usuario → Ingresa correo
        → Sistema valida formato del correo
        → Sistema verifica si el correo está vinculado a una cuenta
```

**Validaciones:**
- ✓ El correo debe estar presente
- ✓ El correo debe tener formato válido (xxx@xxx.xxx)
- ✓ El correo debe estar registrado en el sistema
- ✓ Si el correo NO está vinculado: **Mostrar error "Este correo electrónico no está vinculado a ninguna cuenta"**

### 3. Sistema verifica y genera OTP
```
Si el correo está vinculado:
  → Sistema intenta enviar correo de recuperación a través de Supabase
  → Si es exitoso: Genera un código OTP de 6 dígitos
  → Muestra mensaje: "Correo verificado. Código OTP generado y enviado"
  → Redirige a la pantalla de verificación de OTP
```

### 4. Usuario ingresa el código OTP
```
Usuario → Ingresa el código OTP (6 dígitos)
        → Sistema valida el código
        → Si es correcto: Redirige a establecer nueva contraseña
```

**En modo demostración:**
- Se muestra el código OTP en pantalla (para testing)
- En producción: El código se envía por correo electrónico

### 5. Usuario establece nueva contraseña
```
Usuario → Ingresa nueva contraseña
        → Confirma nueva contraseña
        → Sistema valida:
           - Ambos campos completados
           - Contraseñas coinciden
           - Mínimo 6 caracteres
        → Si todo es válido:
           - Actualiza la contraseña en Supabase
           - Muestra: "¡Contraseña restablecida exitosamente!"
           - Redirige a iniciar sesión
```

## Funciones Principales

### En `AuthModal.tsx`:

1. **`handleRequestOtp()`**
   - Valida el correo
   - Verifica si está registrado
   - Genera OTP
   - Redirige al usuario

2. **`handleVerifyOtp()`**
   - Valida el código OTP ingresado
   - Permite pasar a establecer nueva contraseña

3. **`handleResetPassword()`**
   - Valida las nuevas contraseñas
   - Actualiza la contraseña en Supabase
   - Redirige a login

### En `utils/supabase/auth.ts` (nuevas funciones):

1. **`isEmailRegistered(email)`**
   - Verifica si un correo está vinculado a una cuenta
   - Retorna: true o false

2. **`requestPasswordReset(email)`**
   - Inicia el proceso de recuperación
   - Verifica el correo antes de proceder
   - Retorna: true si éxito, false si fallo

3. **`updatePassword(newPassword)`**
   - Actualiza la contraseña del usuario autenticado
   - Retorna: true si éxito, false si fallo

4. **`isValidEmail(email)`**
   - Valida el formato del correo electrónico
   - Usa expresión regular estándar
   - Retorna: true o false

## Mensajes de Error

| Situación | Mensaje |
|-----------|---------|
| Campo vacío | "Por favor, ingresa tu correo electrónico" |
| Formato inválido | "Por favor, ingresa un correo electrónico válido" |
| Correo no registrado | "Este correo electrónico no está vinculado a ninguna cuenta" |
| OTP vacío | "Por favor, ingresa el código OTP" |
| OTP inválido | "Código OTP inválido" |
| Contraseñas no coinciden | "Las contraseñas no coinciden" |
| Contraseña muy corta | "La contraseña debe tener al menos 6 caracteres" |

## Mensajes de Éxito

| Etapa | Mensaje |
|-------|---------|
| Correo verificado | "Correo verificado. Código OTP generado y enviado" |
| OTP correcto | "Código verificado. Ahora establece tu nueva contraseña" |
| Contraseña restablecida | "¡Contraseña restablecida exitosamente! Ahora puedes iniciar sesión con tu nueva contraseña" |

## Archivos Modificados

1. **`src/components/AuthModal.tsx`**
   - Importa funciones de verificación
   - Usa `isValidEmail()` y `isEmailRegistered()` en `handleRequestOtp()`
   - Mejorados mensajes de error y éxito

2. **`src/utils/supabase/auth.ts`** (NUEVO)
   - Archivo de utilidades para autenticación
   - Centraliza lógica de verificación
   - Reutilizable en otros componentes

## Configuración Necesaria en Supabase

### Habilitar emails transaccionales:
1. Ir a: **Authentication → Email Templates**
2. Habilitar y personalizar:
   - **Reset Password**: Plantilla para recuperación
   - Incluir variables: `{{ .ConfirmationURL }}` y `{{ .Data.email }}`

### Variables de entorno (.env.local):
```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

## Próximas Mejoras (Opcionales)

1. **Envío real de correos**: Descomentar las líneas de Supabase en producción
2. **Límite de intentos**: Implementar rate limiting para intentos fallidos
3. **Expiración de OTP**: Agregar timeout a los códigos OTP
4. **Verificación adicional**: Preguntas de seguridad personalizadas
5. **Logs de seguridad**: Registrar intentos de recuperación de contraseña

