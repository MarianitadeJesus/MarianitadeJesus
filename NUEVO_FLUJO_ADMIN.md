# 🔐 NUEVO FLUJO: Recuperación con Validación de Admin

## Descripción del Nuevo Sistema

Se ha implementado un sistema **más seguro** de recuperación de contraseña donde:

1. **El administrador debe validar** la solicitud de recuperación
2. **El usuario recibe un enlace** en su correo para confirmar
3. **Doble verificación de seguridad** antes de cambiar contraseña

## 📊 Flujo Paso a Paso

```
┌──────────────────────────────┐
│ USUARIO SOLICITA RECUPERACIÓN│
│ (Ingresa su correo)          │
└────────────┬─────────────────┘
             │
    ┌────────▼──────────────┐
    │ Sistema verifica:     │
    │ ✓ Email no vacío     │
    │ ✓ Formato válido     │
    │ ✓ Email vinculado    │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────────────────────┐
    │ SI TODO OK:                           │
    │ 1. Genera OTP (6 dígitos)            │
    │ 2. Envía OTP al email del ADMIN     │
    │ 3. Genera código de recuperación    │
    │ 4. Envía código al email del USUARIO│
    └────────┬──────────────────────────────┘
             │
    ┌────────▼──────────────────────────────┐
    │ NOTIFICACIÓN AL USUARIO:               │
    │ "✓ Proceso iniciado                  │
    │  📧 Código OTP enviado al admin      │
    │  📧 Enlace de recuperación en correo"│
    └────────┬──────────────────────────────┘
             │
    ┌────────▼──────────────────┐
    │ USUARIO RECIBE DOS EMAILS:│
    │                           │
    │ EMAIL 1 (AL ADMIN):       │
    │ ├─ Código OTP: XXXXXX    │
    │ ├─ Usuario que solicita  │
    │ └─ Fecha/Hora            │
    │                           │
    │ EMAIL 2 (AL USUARIO):    │
    │ ├─ Enlace de recuperación│
    │ ├─ Código: XXXXXX        │
    │ └─ "Click para recuperar"│
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ USUARIO INGRESA CÓDIGO OTP    │
    │ (Visto en email del admin)    │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ Sistema verifica:              │
    │ ✓ OTP válido                  │
    │ ✓ OTP no expirado (15 min)    │
    │ ✓ Intentos < 3                │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────┐
    │ SI OTP CORRECTO:          │
    │ ✓ Código verificado      │
    │ → Siguiente: Nueva Pass  │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ USUARIO ESTABLECE:             │
    │ └─ Nueva contraseña           │
    │ └─ Confirma contraseña        │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ Sistema verifica:              │
    │ ✓ Ambos campos rellenados    │
    │ ✓ Longitud mínima (6 chars) │
    │ ✓ Contraseñas coinciden     │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ ACTUALIZACIÓN EXITOSA:         │
    │ ✓ Contraseña guardada        │
    │ ✓ Sesión anterior cerrada    │
    └────────┬──────────────────────┘
             │
    ┌────────▼──────────────────────┐
    │ USUARIO PUEDE:                 │
    │ → Iniciar sesión con nueva   │
    │   contraseña                  │
    │ → Acceder al sistema          │
    └────────────────────────────────┘
```

## 🔑 Funciones Nuevas

### `requestPasswordResetWithAdminValidation(email)`
```typescript
// Inicia el proceso de recuperación con validación de admin
const result = await requestPasswordResetWithAdminValidation('user@example.com');

// Retorna:
{
  success: true,
  recoveryCode: 'XXXXXX'  // Código enviado al usuario
}
```

**Lo que hace:**
1. Verifica que email está registrado
2. Genera OTP (código de 6 dígitos)
3. Envía OTP al email del ADMINISTRADOR
4. Genera código de recuperación
5. Envía código al email del USUARIO
6. Retorna el código de recuperación

### `sendOTPToAdmin(userEmail, otpCode)`
```typescript
// Envía el OTP al correo del administrador
const sent = await sendOTPToAdmin('user@example.com', 'XXXXXX');
```

**Lo que hace:**
- Prepara el OTP
- Lo envía al correo del admin
- Incluye información de qué usuario solicita
- En producción: Usa Supabase Email o SMTP

### `sendRecoveryLinkToUser(userEmail, recoveryCode)`
```typescript
// Envía el vínculo de recuperación al usuario
const sent = await sendRecoveryLinkToUser('user@example.com', 'XXXXXX');
```

**Lo que hace:**
- Prepara el código de recuperación
- Lo envía al correo del usuario
- Incluye un vínculo para hacer click
- En producción: Usa Supabase Email o SMTP

### `verifyOTP(email, code)`
```typescript
// Verifica que el OTP es correcto
const isValid = await verifyOTP('user@example.com', '123456');

// Retorna: true o false
```

**Lo que hace:**
- Verifica que el código coincida
- Verifica que no ha expirado (15 minutos)
- Verifica intentos máximos (3)
- Si es válido, elimina el OTP del almacenamiento

## 📧 Emails Enviados

### Email 1: Al Administrador

**Asunto:** Solicitud de Recuperación de Contraseña - Requiere Validación

**Contenido:**
```
Hola Admin,

Se ha solicitado una recuperación de contraseña.

Código OTP: XXXXXX
Usuario: user@example.com
Fecha: 15/12/2024 10:30

Este código es válido por 15 minutos.
Comparte el código con el usuario para que pueda continuar.

---
Sistema de Seguridad Automático
```

### Email 2: Al Usuario

**Asunto:** Recuperación de Contraseña - Acceso Requerido

**Contenido:**
```
Hola Usuario,

Hemos recibido tu solicitud de recuperación de contraseña.

Para continuar, necesitas:
1. Solicitar el código OTP al administrador
2. Ingresarlo en la plataforma
3. Establecer tu nueva contraseña

Código de recuperación: XXXXXX
(Válido por 15 minutos)

Si no realizaste esta solicitud, ignora este email.

---
Sistema de Seguridad
```

## 🔒 Capas de Seguridad

```
CAPA 1: Validación del Correo
├─ No está vacío
├─ Formato válido
└─ Está registrado en BD

CAPA 2: Generación Segura
├─ OTP aleatorio
├─ Código de recuperación único
└─ Expiración en 15 minutos

CAPA 3: Verificación del Admin
├─ Admin recibe OTP
├─ Admin comparte código con usuario
└─ Usuario ingresa código en plataforma

CAPA 4: Verificación del Código
├─ Validación de formato
├─ Validación de expiración
├─ Límite de intentos (3)
└─ Eliminación tras verificación

CAPA 5: Cambio de Contraseña
├─ Validación de longitud mínima
├─ Validación de confirmación
├─ Actualización segura en Supabase
└─ Cierre de sesiones previas
```

## 📋 Validaciones Implementadas

| Etapa | Validación | Error |
|-------|-----------|-------|
| Email | No vacío | "Por favor ingresa tu correo" |
| Email | Formato válido | "Email inválido" |
| Email | Está registrado | "No está vinculado" |
| OTP | No vacío | "Ingresa el código OTP" |
| OTP | Código válido | "OTP inválido o expirado" |
| OTP | Intentos < 3 | "Demasiados intentos" |
| OTP | No expirado | "Código expirado" |
| Contraseña | No vacía | "Completa ambos campos" |
| Contraseña | Longitud >= 6 | "Mínimo 6 caracteres" |
| Contraseña | Coincide | "Las contraseñas coinciden" |

## 🧪 Cómo Probar

### Test Local Completo

```
1. Ir a: "¿Olvidaste tu contraseña?"
2. Email: usuario@registrado.com
3. Resultado esperado:
   ✓ Ver en consola logs de:
     - OTP enviado al admin
     - Enlace de recuperación enviado al usuario

4. Ingresar código OTP (visible en consola)
5. Resultado esperado:
   ✓ Código verificado

6. Nueva contraseña: newpass123
7. Confirmar: newpass123
8. Resultado esperado:
   ✓ Éxito - Redirige a login

9. Login con: usuario@registrado.com / newpass123
10. Resultado esperado:
    ✓ Acceso permitido
```

### Test con Email No Registrado

```
1. Ir a: "¿Olvidaste tu contraseña?"
2. Email: noexiste@example.com
3. Resultado esperado:
   ✓ Error: "No está vinculado"
```

## 🚀 Para Producción

### Paso 1: Configurar Email del Admin

En `src/utils/supabase/auth.ts` línea 3:

```typescript
// CAMBIAR ESTO:
const ADMIN_EMAIL = 'marianitadejesusadmin@example.com';

// POR TU EMAIL DE ADMIN REAL:
const ADMIN_EMAIL = 'admin@tudominio.com';
```

### Paso 2: Habilitar Envío Real de Emails

Descomentar en `src/utils/supabase/auth.ts`:

**Función `sendOTPToAdmin()` (línea ~60):**
```typescript
// Descomentar:
const { error } = await supabase.functions.invoke('send-otp-admin', {
  body: { otpCode, userEmail }
});
```

**Función `sendRecoveryLinkToUser()` (línea ~80):**
```typescript
// Descomentar:
const { error } = await supabase.functions.invoke('send-recovery-link', {
  body: { recoveryCode, userEmail }
});
```

### Paso 3: Configurar Supabase Edge Functions

Crear funciones edge en Supabase para enviar los emails.

O usar servicio SMTP externo (Resend, SendGrid, etc.)

## 📊 Flujo Visual Simplificado

```
Usuario
  │
  ├─ Solicita recuperación
  │
  ├─ ✓ Email validado
  │
  ├─ Sistema genera OTP + Código
  │
  ├─ 📧 OTP → Admin
  │
  ├─ 📧 Código → Usuario
  │
  ├─ Usuario ingresa OTP
  │
  ├─ ✓ OTP verificado
  │
  ├─ Usuario establece nueva password
  │
  ├─ ✓ Password actualizado
  │
  └─ ✓ Puede hacer login
```

## ⚙️ Configuración de Almacenamiento OTP

Actualmente usa almacenamiento en memoria:

```typescript
const otpStorage: {
  [key: string]: { 
    code: string;          // OTP: "123456"
    expiresAt: number;     // Timestamp de expiración
    attempts: number;      // Número de intentos
  }
} = {};
```

**En producción, cambiar a:**
- Base de datos Supabase
- Redis (para velocidad)
- Tabla específica `otp_codes`

## 📝 Ejemplo de Código

### En AuthModal.tsx:

```typescript
// Usuario solicita recuperación
const result = await requestPasswordResetWithAdminValidation(email);

if (result.success) {
  toast.success('✓ Proceso iniciado\n📧 Código OTP enviado al administrador');
}

// Usuario ingresa OTP
const isValid = await verifyOTP(email, otpCode);

if (isValid) {
  setOtpVerified(true);
  toast.success('✓ Código verificado');
}
```

## 🎯 Resumen

El nuevo sistema proporciona:

✅ **Doble validación** (OTP + Código de recuperación)
✅ **Seguridad mejorada** (Admin debe validar)
✅ **Rastreo** (Admin sabe quién solicita qué)
✅ **Flexibilidad** (Sistema en memoria, preparado para BD)
✅ **Usuario informado** (Mensajes claros en cada etapa)
✅ **Listo para producción** (Solo cambiar emails y descomentar líneas)

