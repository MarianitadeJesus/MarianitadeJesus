# 📋 GUÍA DE INSTALACIÓN DE HERRAMIENTAS

## 1. Requisitos Previos

Asegúrate de tener instalados:

### Node.js y npm
- **Descargar:** https://nodejs.org/ (versión LTS recomendada)
- **Verificar instalación:**
  ```powershell
  node --version
  npm --version
  ```

### Deno (Opcional, para funciones serverless)
- **Descargar:** https://deno.land/
- **Verificar instalación:**
  ```powershell
  deno --version
  ```

### Git (Recomendado)
- **Descargar:** https://git-scm.com/

---

## 2. Instalación de Dependencias del Proyecto

### Opción A: Instalación Automática (Recomendado)

Ejecuta en la carpeta del proyecto:

```powershell
npm install
```

Esto descargará todas las dependencias listadas en `package.json`.

### Opción B: Instalación Manual

```powershell
# Core
npm install react@18.3.1 react-dom@18.3.1

# UI Components
npm install @radix-ui/react-accordion@1.2.3
npm install @radix-ui/react-dialog@1.1.6
npm install @radix-ui/react-dropdown-menu@2.1.6
# ... (todas las dependencias de Radix UI)

# Backend
npm install @supabase/supabase-js@2

# Build tools
npm install --save-dev vite@6.3.5 @vitejs/plugin-react-swc@3.10.2

# Etc...
```

---

## 3. Herramientas de Desarrollo

### Visual Studio Code (Recomendado)
1. Descargar: https://code.visualstudio.com/
2. Extensiones recomendadas:
   - ES7+ React/Redux/React-Native snippets
   - TypeScript Vue Plugin
   - Tailwind CSS IntelliSense
   - Prettier - Code formatter
   - ESLint

### Terminal
- PowerShell (Windows) - incluido en Windows
- Cmd
- Git Bash

---

## 4. Comandos Útiles

```powershell
# Instalar todas las dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Ver vista previa de la compilación
npm run preview

# Desplegar a GitHub Pages
npm run deploy
```

---

## 5. Archivo package.json

Contiene la lista oficial de todas las dependencias del proyecto. Si necesitas:

- **Agregar una dependencia:** `npm install nombre-paquete`
- **Agregar una dependencia de desarrollo:** `npm install --save-dev nombre-paquete`
- **Eliminar una dependencia:** `npm uninstall nombre-paquete`
- **Actualizar dependencias:** `npm update`

---

## 6. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anon
```

---

## 7. Solución de Problemas

### Si npm no se reconoce:
- Reinicia PowerShell después de instalar Node.js
- Asegúrate de que Node.js está en tu PATH

### Si hay conflictos de dependencias:
```powershell
npm ci          # Instala versiones exactas del package-lock.json
rm -r node_modules  # Elimina carpeta
npm install     # Reinstala todo
```

### Si vite no se encuentra:
```powershell
npm install --save-dev vite@6.3.5
```

---

## 8. Información de Versiones Actuales

- **Node.js**: LTS (versión 20+)
- **npm**: 10+
- **Vite**: 6.3.5
- **React**: 18.3.1
- **TypeScript**: Recomendado

---

¡Listo! Ya puedes comenzar a desarrollar. Ejecuta `npm run dev` para iniciar el servidor de desarrollo.
