# 🐾 Patitas Tristes - Sistema Integral de Gestión

Sistema de gestión centralizado para la ONG **Patitas Tristes** ubicada en Hurlingham, Buenos Aires. Permite el rescate, rehabilitación y adopción de animales en situación de calle.

## 📋 Características Principales

- ✅ **Gestión de Mascotas**: Registro integral con fotos y datos biométricos
- ✅ **Carnet Sanitario Digital**: Vacunas, desparasitaciones y cirugías con alertas automáticas
- ✅ **Módulo de Adopciones**: Proceso completo de adopción con seguimiento post-adopción
- ✅ **Gestión de Donaciones**: Integración con Mercado Pago y panel de transparencia
- ✅ **Gestión de Voluntarios**: Calendarios de turnos y perfiles de habilidades

## 🏗️ Arquitectura

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL 15+
- **Autenticación**: JWT + OAuth2
- **Almacenamiento**: AWS S3 (producción) / Local (desarrollo)
- **Pagos**: Mercado Pago SDK
- **CI/CD**: GitHub Actions + Docker

### Estructura del Proyecto

```
patitas-tristes/
├── backend/               # API REST
│   ├── src/
│   │   ├── modules/
│   │   ├── shared/
│   │   ├── config/
│   │   └── main.ts
│   ├── tests/
│   ├── docker/
│   ├── .env.example
│   └── package.json
├── frontend/              # Aplicación web
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.tsx
│   └── package.json
├── database/              # Migraciones y schemas
│   ├── migrations/
│   └── seeds/
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── ARQUITECTURA.md
└── docker-compose.yml
```

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- PostgreSQL 15+
- Docker y Docker Compose (opcional)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/Profe-Bauty/-patitas-triste.git
cd -patitas-triste

# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### Docker Compose

```bash
docker-compose up -d
```

## 📚 Documentación

- [Diseño de Base de Datos](./docs/DATABASE.md)
- [API Reference](./docs/API.md)
- [Guía de Arquitectura](./docs/ARQUITECTURA.md)

## 🔄 Fases de Desarrollo

### ✅ Fase 1: MVP (Semanas 1-12)
- Gestión de animales
- Carnet sanitario
- Panel de administración

### 🔜 Fase 2: Adopciones y Voluntarios (Semanas 13-16)
- Módulo de adopciones
- Calendario de turnos

### 📅 Fase 3: Donaciones (Semanas 17-20)
- Integración Mercado Pago
- Panel de transparencia

## 📄 Licencia

GNU Affero General Public License v3.0 - Véase [LICENSE](LICENSE)

## 👥 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes, abre un issue primero.

---

**Organización**: Patitas Tristes ONG  
**Ubicación**: Hurlingham, Buenos Aires  
**Inicio del Proyecto**: Mayo 2026
