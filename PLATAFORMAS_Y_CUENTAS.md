# 🔐 PLATAFORMAS Y CUENTAS CONECTADAS

**Proyecto:** Marianita de Jesús - Quinta Privada  
**Fecha de actualización:** 20 de diciembre de 2025

---

## 📌 Resumen Rápido

| Plataforma | Servicio | Estado | Prioridad |
|------------|---------|--------|-----------|
| Supabase | Backend & Autenticación | ✅ Activo | 🔴 Crítico |
| Netlify | Hosting & Funciones | ✅ Activo | 🟡 Importante |
| Vercel | Hosting Alternativo | ✅ Configurado | 🟢 Soporte |
| GitHub | Control de Versiones | ✅ Activo | 🔴 Crítico |
| npm | Gestor de Paquetes | ✅ Activo | 🔴 Crítico |

---

## 1. 🗄️ SUPABASE (Backend & Base de Datos)

### Información Crítica
- **Servicio:** Base de datos PostgreSQL + Autenticación + API REST
- **URL del Proyecto:** [Obtener en dashboard Supabase]
- **Clave Anónima:** Guardada en `.env.local` como `VITE_SUPABASE_ANON_KEY`
- **URL del Dashboard:** https://supabase.com/dashboard/projects

### Acceso
- **Email de cuenta:** [Tu email registrado]
- **Tipo de autenticación:** Email/Contraseña o SSO
- **Organización:** [Tu organización Supabase]

### Servicios Activos
- ✅ Authentication (Email, recuperación de contraseña)
- ✅ Database (PostgreSQL)
- ✅ Realtime (Opcional)
- ✅ Functions (Deno serverless)
- ✅ Storage (Para archivos)
- ✅ Email Templates (Recuperación de contraseña)

### Configuración Importante
- **Reset Password URL:** Apunta a `http://localhost:5173/reset-password` (desarrollo) o dominio de producción
- **Allowed Redirect URLs:** Configurados en Authentication → URL Configuration
- **CORS:** Habilitado para dominios del proyecto

### Funciones Serverless Conectadas
```
supabase/functions/
  └── reset-password/  (Deno function)
```

### Variables de Entorno Necesarias
```
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 📝 Notas
- Revisar regularmente los logs de autenticación
- Mantener las claves API seguras
- No compartir `VITE_SUPABASE_ANON_KEY` en repositorios públicos

---

## 2. 🌐 NETLIFY (Hosting & Funciones Serverless)

### Información Básica
- **Servicio:** Hosting estático + Funciones serverless
- **URL del sitio:** [Tu dominio en Netlify]
- **Team:** [Tu equipo Netlify]
- **Dashboard:** https://app.netlify.com

### Acceso
- **Email de cuenta:** [Tu email registrado]
- **Método de login:** Email/GitHub/Google

### Configuración
- **Comando build:** `npm run build`
- **Directorio de publicación:** `dist`
- **Node.js Version:** 18

### Funciones Serverless
```
netlify/functions/
  └── reset-password.js  (Function de Netlify)
```

### Variables de Entorno en Netlify
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### Dominio(s) Conectado(s)
- **Dominio Principal:** [dominio.netlify.com o dominio personalizado]
- **Certificado SSL:** Automático (Let's Encrypt)

### 📝 Notas
- Build automático al hacer push a la rama configurada
- Previsualizaciones automáticas en cada deploy
- Logs disponibles en Real-time

---

## 3. 🚀 VERCEL (Hosting Alternativo)

### Información Básica
- **Servicio:** Hosting estático alternativo
- **URL del sitio:** [Tu dominio en Vercel]
- **Proyecto:** marianita-de-jesus-quinta-privada (o similar)
- **Dashboard:** https://vercel.com/dashboard

### Acceso
- **Email de cuenta:** [Tu email registrado]
- **Método de login:** GitHub/GitLab/Bitbucket/Email

### Configuración
- **Framework:** Vite (React)
- **Comando build:** `npm run build`
- **Output Directory:** `dist`

### Variables de Entorno
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 📝 Notas
- Configurado en `vercel.json`
- Deploy automático desde git
- Fallback/redundancia respecto a Netlify

---

## 4. 🐙 GITHUB (Control de Versiones)

### Información Básica
- **Repositorio:** [usuario/marianita-de-jesus-quinta-privada]
- **URL:** https://github.com/[usuario]/marianita-de-jesus-quinta-privada
- **Visibilidad:** [Privado/Público]

### Acceso
- **Usuario GitHub:** [Tu usuario]
- **Email asociado:** [Tu email]
- **Autenticación:** SSH/Personal Access Token

### Ramas Principales
- **main** - Producción
- **develop** - Desarrollo
- **feature/** - Nuevas funcionalidades

### Integraciones
- GitHub → Netlify (Auto-deploy)
- GitHub → Vercel (Auto-deploy)
- GitHub Actions (CI/CD opcional)

### Secretos Guardados en GitHub
- `NETLIFY_DEPLOY_KEY` (para despliegues manuales)
- Otras claves según configuración CI/CD

### 📝 Notas
- Proteger rama main con reglas de revisión
- No hacer push de `.env.local`
- Mantener `.gitignore` actualizado

---

## 5. 📦 NPM (Gestor de Paquetes)

### Información Básica
- **Registro:** https://registry.npmjs.org/
- **Paquete:** Privado (local)
- **Versión Node.js:** 18+ recomendado

### Credenciales
- **npm token:** [Guardado en ~/.npmrc si es necesario]
- **Autenticación:** Email/2FA

### Dependencias Principales
- React 18.3.1
- Radix UI (componentes)
- Supabase.js
- Vite 6.3.5
- Tailwind CSS

### Comandos Clave
```
npm install         # Instalar dependencias
npm run dev        # Servidor de desarrollo
npm run build      # Compilar para producción
npm run preview    # Visualizar build
npm run deploy     # Desplegar a GitHub Pages
```

### 📝 Notas
- Revisar `package.json` regularmente
- Mantener dependencias actualizadas
- Usar `npm audit` para verificar vulnerabilidades

---

## 6. 🔑 VARIABLES DE ENTORNO (CRÍTICO)

### Archivo: `.env.local` (No compartir)

```
# Supabase
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Otras variables (si aplican)
VITE_API_URL=https://api.tu-dominio.com
```

### Dónde Guardarlas
- **Desarrollo:** `.env.local` (Git ignorado)
- **Netlify:** Configuración → Environment → Environment variables
- **Vercel:** Settings → Environment Variables
- **GitHub Secrets:** Si usa CI/CD

---

## 7. 📧 CORREOS ELECTRÓNICOS IMPORTANTES

| Tipo | Email | Plataforma | Uso |
|------|-------|-----------|-----|
| Cuenta Principal | [email@example.com] | Todas | Login general |
| Recuperación | [recovery@example.com] | Supabase | Recuperación de cuenta |
| Soporte | [support@example.com] | Supabase | Contacto soporte |

---

## 8. 🔗 CONEXIONES Y WEBHOOKS

### Webhooks Configurados
- [ ] Supabase → Slack (notificaciones)
- [ ] GitHub → Netlify (auto-deploy)
- [ ] GitHub → Vercel (auto-deploy)
- [ ] Email de recuperación → Supabase

### APIs Conectadas
- Supabase REST API
- Supabase Auth API
- Netlify Serverless Functions
- Google/Email APIs (opcional)

---

## 9. 🛡️ CONSIDERACIONES DE SEGURIDAD

- [ ] Claves API guardadas solo en variables de entorno
- [ ] No compartir `VITE_SUPABASE_ANON_KEY` públicamente
- [ ] Habilitar 2FA en todas las plataformas
- [ ] Revisar acceso a proyectos mensualmente
- [ ] Rotar claves cada 3-6 meses
- [ ] Audit logs de Supabase revisados regularmente

---

## 10. ✅ CHECKLIST DE ACCESO DIARIO

Antes de trabajar, verifica:

- [ ] Acceso a Supabase dashboard
- [ ] Acceso a GitHub (push/pull)
- [ ] Acceso a Netlify (monitoreo)
- [ ] Variables de entorno en `.env.local`
- [ ] Conexión a internet estable
- [ ] Node.js y npm funcionando

---

## 11. 📞 SOPORTE Y DOCUMENTACIÓN

| Plataforma | Documentación | Soporte |
|------------|---------------|---------|
| Supabase | https://supabase.com/docs | support@supabase.com |
| Netlify | https://docs.netlify.com | support@netlify.com |
| Vercel | https://vercel.com/docs | support@vercel.com |
| GitHub | https://docs.github.com | GitHub Issues |
| React | https://react.dev | React Docs |

---

## 12. 📅 RECORDATORIOS PERIÓDICOS

### Semanal
- Revisar builds en Netlify/Vercel
- Verificar logs de errores

### Mensual
- Auditar acceso a cuentas
- Revisar facturación (si aplica)
- Actualizar documentación

### Trimestral
- Revisar y rotar claves API
- Actualizar dependencias NPM
- Auditar reglas de seguridad

### Anual
- Revisión completa de plataformas
- Actualizar políticas de acceso

---

**Última revisión:** 20 de diciembre de 2025  
**Próxima revisión recomendada:** [Fecha + 1 mes]

> ⚠️ Guarda esta información en un lugar seguro y accesible solo para ti.
