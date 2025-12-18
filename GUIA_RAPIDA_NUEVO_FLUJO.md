# 🚀 GUÍA RÁPIDA: Nuevo Sistema de Recuperación con Admin

## ¿Qué Cambió?

Antes: El usuario solo recibía un código OTP
Ahora: El **administrador valida** la solicitud enviando el OTP

## ✨ Mejoras

✅ **Doble validación** - Admin + Usuario
✅ **Mayor seguridad** - El admin controla quién recupera
✅ **Rastreo de solicitudes** - Admin sabe quién solicita qué
✅ **Código de recuperación** - El usuario recibe enlace extra
✅ **Expiración** - OTP válido solo 15 minutos

## 📊 Flujo Nuevofácil de entender

```
Usuario escribe email
    ↓
¿Email está registrado?
    ├─ NO  → Error
    └─ SÍ  → Genera OTP y código de recuperación
    
Sistema envía:
    ├─ OTP (6 dígitos) → Email del ADMIN
    └─ Código de recuperación → Email del USUARIO

Admin comparte el OTP con el usuario

Usuario ingresa OTP en la plataforma
    ↓
¿OTP es correcto?
    ├─ NO  → Error (máximo 3 intentos)
    └─ SÍ  → Permite cambiar contraseña

Usuario establece nueva contraseña
    ↓
¿Contraseña válida?
    ├─ NO  → Error
    └─ SÍ  → ✓ Éxito - Puede hacer login
```

## 🔧 Configuración Rápida

### Paso 1: Email del Admin

Abre: `src/utils/supabase/auth.ts`

Línea 3:
```typescript
const ADMIN_EMAIL = 'marianitadejesusadmin@example.com'; // ← CAMBIAR ESTO
```

Cambiar por tu email real:
```typescript
const ADMIN_EMAIL = 'tu-email-admin@tudominio.com';
```

### Paso 2: Para Envío Real (Producción)

En `sendOTPToAdmin()` (línea ~60), descomentar:
```typescript
// const { error } = await supabase.functions.invoke('send-otp-admin', {
//   body: { otpCode, userEmail }
// });
```

En `sendRecoveryLinkToUser()` (línea ~80), descomentar:
```typescript
// const { error } = await supabase.functions.invoke('send-recovery-link', {
//   body: { recoveryCode, userEmail }
// });
```

### Paso 3: Listo

Ya está funcionando. Prueba localmente.

## 🧪 Cómo Probar

### Test Básico (2 minutos)

1. **Ir a**: "¿Olvidaste tu contraseña?"
2. **Email**: usuario@registrado.com
3. **Ver en consola** (F12):
   ```
   📧 OTP ENVIADO AL ADMIN:
   Código: XXXXXX
   Usuario solicitante: usuario@registrado.com
   
   📧 ENLACE DE RECUPERACIÓN ENVIADO AL USUARIO:
   Código: YYYYYY
   Email: usuario@registrado.com
   ```
4. **Copiar el OTP** (XXXXXX) de la consola
5. **Ingresar en la plataforma** el OTP
6. **Esperado**: ✓ "Código verificado"

### Test Completo (5 minutos)

```
1. Click "¿Olvidaste tu contraseña?"
2. Ingresar: usuario@test.com
3. Ver logs en consola
4. Copiar OTP
5. Ingresar OTP
6. Nueva contraseña: nuevapass456
7. Confirmar: nuevapass456
8. Click "Restablecer Contraseña"
9. Esperado: ✓ "Contraseña restablecida"
10. Login con: usuario@test.com / nuevapass456
11. Esperado: ✓ Acceso permitido
```

## 📧 Logs que Verás en Consola

Cuando el usuario solicita recuperación:

```
📧 OTP ENVIADO AL ADMIN:
   Código: 456789
   Usuario solicitante: usuario@example.com
   Timestamp: 15/12/2024, 10:30:45

📧 ENLACE DE RECUPERACIÓN ENVIADO AL USUARIO:
   Código: 123456
   Email: usuario@example.com
   Timestamp: 15/12/2024, 10:30:45
```

En producción, estos mensajes se reemplazarán por:
- Email real al admin con el OTP
- Email real al usuario con el enlace

## 🔐 Seguridad

| Aspecto | Implementado |
|---------|-------------|
| OTP válido solo 15 minutos | ✓ |
| Máximo 3 intentos fallidos | ✓ |
| Código único por solicitud | ✓ |
| Email admin requerido | ✓ |
| Email usuario requerido | ✓ |
| Validación de contraseña | ✓ |

## 📝 Archivos Modificados

```
✏️  src/utils/supabase/auth.ts
    ├─ Nueva función: requestPasswordResetWithAdminValidation()
    ├─ Nueva función: sendOTPToAdmin()
    ├─ Nueva función: sendRecoveryLinkToUser()
    ├─ Nueva función: verifyOTP()
    └─ Nueva función: generateOTP()

✏️  src/components/AuthModal.tsx
    ├─ Actualizado: handleRequestOtp()
    ├─ Actualizado: handleVerifyOtp()
    └─ Actualizado: handleResetPassword()
```

## 💬 Mensajes al Usuario

Cuando solicita recuperación:
```
✓ Proceso iniciado
📧 Código OTP enviado al administrador
📧 Enlace de recuperación enviado a tu correo
```

Cuando verifica OTP:
```
✓ Código verificado. Ahora establece tu nueva contraseña
```

Cuando restablece contraseña:
```
✓ ¡Contraseña restablecida exitosamente!
Ahora puedes iniciar sesión con tu nueva contraseña
```

## ⚙️ Almacenamiento OTP

**Actualmente** (Desarrollo):
- Almacenado en memoria de la aplicación
- Perfecto para testing local
- Se pierde si reinicia el servidor

**Para Producción**:
- Cambiar a Base de datos Supabase
- O usar Redis
- Ver sección "Para Producción" en NUEVO_FLUJO_ADMIN.md

## ❌ Si Algo No Funciona

| Problema | Solución |
|----------|----------|
| No veo logs en consola | Abre DevTools (F12) → Console |
| Error "OTP inválido" | Verifica que ingresaste correctamente |
| Error "Código expirado" | Pasaron más de 15 minutos, solicita nuevo |
| Error "Demasiados intentos" | Esperma 15 minutos e intenta de nuevo |

## 🎯 Próximos Pasos

1. **Ahora**: Prueba localmente
2. **Después**: Configura email del admin real
3. **Luego**: Descomentar líneas de producción
4. **Finalmente**: Configurar Supabase para envío real de emails

## 📚 Documentación Completa

Para más detalles, lee: `NUEVO_FLUJO_ADMIN.md`

## ✅ Checklist

- [ ] Cambié el email del admin en `auth.ts` línea 3
- [ ] Probé localmente
- [ ] Vi los logs en consola
- [ ] Funcionó el flujo completo
- [ ] Estoy listo para producción

---

**¿Listo para probar?** 🚀

Abre tu navegador en localhost y ve a "¿Olvidaste tu contraseña?"
