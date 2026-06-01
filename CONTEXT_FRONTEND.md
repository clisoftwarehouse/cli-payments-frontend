# 🖥️ Beauty SaaS - Frontend Web Context

> **Documento de contexto para editores de código con IA**  
> Sistema operativo multi-tenant para barberías, spas y centros de belleza

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Gestión de Estado](#gestión-de-estado)
6. [Capa de API](#capa-de-api)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [Pantallas y Módulos](#pantallas-y-módulos)
9. [Componentes Clave](#componentes-clave)
10. [Formularios y Validación](#formularios-y-validación)
11. [Tematización y Estilos](#tematización-y-estilos)
12. [Performance](#performance)
13. [Testing](#testing)
14. [Convenciones de Código](#convenciones-de-código)
15. [Variables de Entorno](#variables-de-entorno)

---

## 📖 Visión General

### Descripción del Producto

Aplicación web SPA (Single Page Application) para la gestión operativa de centros de belleza. Diseñada para ser utilizada principalmente en desktop y tablet por:

- **Administradores**: Configuración, reportes, nómina
- **Recepcionistas**: Agenda, clientes, check-in
- **Cajeros**: Cobros, caja, recibos

### Flujo Principal que Soporta

```
Agenda → Check-in → Servicio → Cobro → Control de Caja → Comisiones → Nómina
```

### Principios de Diseño

1. **Responsivo**: Desktop-first con soporte para tablet
2. **Accesible**: WCAG 2.1 nivel AA
3. **Rendimiento**: Carga inicial < 3 segundos
4. **UX Consistente**: Material Design 3 con MUI

---

## 🛠️ Stack Tecnológico

### Core (Definido)

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Lenguaje | **TypeScript** | ^5.3 | Tipado estático, mejor DX |
| UI Library | **React** | ^18.2 | Componentes declarativos, hooks |
| UI Components | **MUI (Material UI)** | ^5.15 | Componentes empresariales, tematización |
| Estado Global | **Zustand** | ^4.5 | Ligero, simple API, TypeScript nativo |
| Estado Async | **TanStack Query** | ^5.17 | Cache inteligente, refetch automático |
| HTTP Client | **Axios** | ^1.6 | Interceptores, transformaciones |

### Build & Development

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Build Tool | **Vite** | ^5.0 | HMR ultrarrápido, ESBuild |
| Package Manager | **pnpm** | ^8.x | Eficiente, workspaces |
| Linting | **ESLint** | ^8.56 | Análisis estático |
| Formatting | **Prettier** | ^3.2 | Formato consistente |
| Git Hooks | **Husky + lint-staged** | ^9.0 / ^15.2 | Pre-commit hooks |

### Routing & Navigation

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Router | **React Router** | ^6.21 | Nested routes, loaders/actions |

### Forms & Validation

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Form Library | **React Hook Form** | ^7.49 | Performance, uncontrolled inputs |
| Schema Validation | **Zod** | ^3.22 | TypeScript-first, inferencia de tipos |

### Data Display & Tables

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Data Grid | **MUI X Data Grid** | ^6.19 | Virtualización, filtros avanzados |
| Charts | **Recharts** | ^2.10 | Gráficos declarativos |
| Calendar | **FullCalendar** | ^6.1 | Agenda, drag-drop, recursos |

### Date, Time & i18n

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Date Utils | **date-fns** | ^3.2 | Modular, tree-shakeable |
| Date Picker | **MUI X Date Pickers** | ^6.19 | Integración MUI |
| i18n | **react-i18next** | ^14.0 | Multi-idioma |

### UX Enhancements

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Notifications | **notistack** | ^3.0 | Snackbars apilables |
| Drag & Drop | **@dnd-kit/core** | ^6.1 | Moderno, accesible |
| Loading States | **MUI Skeleton** | built-in | Placeholder content |

### Files & Media

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| File Upload | **react-dropzone** | ^14.2 | Drag-drop, validación |
| PDF Generation | **@react-pdf/renderer** | ^3.3 | Documentos React-style |
| PDF Viewing | **react-pdf** | ^7.7 | Render PDF en canvas |
| Excel Export | **exceljs** | ^4.4 | Creación de xlsx |

### Real-time

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| WebSockets | **socket.io-client** | ^4.7 | Reconexión automática, rooms |

### Testing

| Categoría | Tecnología | Versión | Uso |
|-----------|------------|---------|-----|
| Unit/Integration | **Vitest** | ^1.2 | Compatible Vite, rápido |
| Component Testing | **Testing Library** | ^14.1 | Testing centrado en usuario |
| E2E Testing | **Playwright** | ^1.41 | Multi-browser, auto-wait |
| Mocking | **MSW** | ^2.1 | Mock Service Worker |

---

## 🏛️ Arquitectura del Proyecto

### Patrón: Feature-Sliced Design (FSD)

Arquitectura basada en capas y features para aplicaciones React empresariales:

```
┌─────────────────────────────────────────────────────────┐
│                         app/                            │
│              (puede importar de cualquier capa)         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       widgets/                          │
│            (combina features, no lógica propia)         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       features/                         │
│           (vertical slices independientes)              │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐               │
│    │  auth   │  │ billing │  │ settings│  ...          │
│    └─────────┘  └─────────┘  └─────────┘               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       entities/                         │
│          (tipos y schemas compartidos)                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                shared/  +  ui-kit/                      │
│      (infraestructura, utilidades, design system)       │
└─────────────────────────────────────────────────────────┘
```

### Capas

1. **app/**: Configuración global, providers, routing principal, estilos globales
2. **pages/**: Componentes de página que componen features y widgets
3. **widgets/**: Bloques de UI complejos y autónomos (Sidebar, Header, DataTable)
4. **features/**: Funcionalidades de negocio con su lógica (auth, appointments, checkout)
5. **entities/**: Modelos de dominio y operaciones CRUD (Customer, Service, Staff)
6. **shared/**: Utilidades, componentes base, hooks, tipos y constantes reutilizables

---

## 📁 Estructura de Carpetas

```
src/
├── app/                          # Capa de aplicación (bootstrap)
│   ├── providers/                # Providers globales (QueryClient, Theme, Auth)
│   │   ├── query-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── auth-provider.tsx
│   ├── router/                   # Configuración de React Router
│   │   ├── routes.tsx
│   │   ├── guards/
│   │   │   ├── auth-guard.tsx
│   │   │   └── role-guard.tsx
│   │   └── layouts/
│   │       ├── app-layout.tsx
│   │       ├── auth-layout.tsx
│   │       └── dashboard-layout.tsx
│   ├── app.tsx                   # Componente raíz
│   └── main.tsx                  # Entry point
│
├── features/                     # VERTICAL SLICES (núcleo del negocio)
│   ├── auth/
│   │   ├── api/                  # Capa de datos (adapters)
│   │   │   ├── auth.api.ts       # Llamadas HTTP
│   │   │   ├── auth.queries.ts   # TanStack Query hooks
│   │   │   └── auth.types.ts     # DTOs y responses
│   │   ├── model/                # Capa de dominio
│   │   │   ├── auth.store.ts     # Estado local (zustand si necesario)
│   │   │   ├── auth.schema.ts    # Validaciones (zod)
│   │   │   └── auth.utils.ts     # Lógica de negocio pura
│   │   ├── ui/                   # Capa de presentación
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   └── forgot-password-form.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-auth-form.ts
│   │   │   └── pages/
│   │   │       ├── login.page.tsx
│   │   │       ├── register.page.tsx
│   │   │       └── forgot-password.page.tsx
│   │   └── index.ts              # Public API de la feature
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   ├── model/
│   │   ├── ui/
│   │   └── index.ts
│   │
│   ├── billing/                  # Feature de facturación (SaaS típico)
│   │   ├── api/
│   │   │   ├── billing.api.ts
│   │   │   ├── billing.queries.ts
│   │   │   └── stripe.api.ts     # Integración específica
│   │   ├── model/
│   │   │   ├── plans.ts
│   │   │   ├── subscription.schema.ts
│   │   │   └── billing.utils.ts
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── plan-card.tsx
│   │   │   │   ├── pricing-table.tsx
│   │   │   │   └── payment-form.tsx
│   │   │   └── pages/
│   │   │       ├── pricing.page.tsx
│   │   │       └── checkout.page.tsx
│   │   └── index.ts
│   │
│   ├── organizations/            # Multi-tenancy
│   │   ├── api/
│   │   ├── model/
│   │   ├── ui/
│   │   └── index.ts
│   │
│   └── settings/
│       ├── api/
│       ├── model/
│       ├── ui/
│       └── index.ts
│
├── entities/                     # Entidades compartidas entre features
│   ├── user/
│   │   ├── user.types.ts         # Tipos de dominio
│   │   ├── user.schema.ts        # Validaciones
│   │   └── index.ts
│   ├── organization/
│   │   ├── organization.types.ts
│   │   └── index.ts
│   └── subscription/
│       ├── subscription.types.ts
│       └── index.ts
│
├── shared/                       # Código compartido (sin lógica de negocio)
│   ├── api/                      # Infraestructura HTTP
│   │   ├── client.ts             # Axios/fetch configurado
│   │   ├── interceptors.ts
│   │   └── error-handler.ts
│   ├── config/
│   │   ├── env.ts                # Variables de entorno tipadas
│   │   └── constants.ts
│   ├── lib/                      # Wrappers de librerías externas
│   │   ├── dayjs.ts
│   │   ├── storage.ts
│   │   └── analytics.ts
│   ├── hooks/                    # Hooks genéricos
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   └── use-local-storage.ts
│   ├── utils/                    # Funciones puras
│   │   ├── format.ts
│   │   ├── currency.ts
│   │   └── validation.ts
│   └── types/                    # Tipos globales
│       ├── api.types.ts
│       └── common.types.ts
│
├── widgets/                      # Componentes compuestos (combinan features)
│   ├── header/
│   │   ├── header.tsx
│   │   ├── user-menu.tsx
│   │   └── org-switcher.tsx
│   ├── sidebar/
│   │   ├── sidebar.tsx
│   │   └── nav-items.tsx
│   └── data-table/
│       ├── data-table.tsx
│       ├── columns.tsx
│       └── toolbar.tsx
│
└── ui-kit/                       # Design system (MUI customizado)
    ├── theme/
    │   ├── theme.ts              # Configuración MUI
    │   ├── palette.ts
    │   ├── typography.ts
    │   └── components.ts         # Overrides de componentes MUI
    ├── components/               # Componentes atómicos
    │   ├── button/
    │   │   ├── button.tsx
    │   │   └── button.stories.tsx
    │   ├── input/
    │   ├── modal/
    │   ├── card/
    │   └── ...
    └── layouts/
        ├── page-container.tsx
        ├── section.tsx
        └── grid.tsx
```

### Estructura de un Feature

```
features/appointments/
├── api/                    # Endpoints específicos del feature
│   └── appointments.api.ts
├── hooks/                  # React Query hooks
│   ├── useAppointments.ts
│   ├── useCreateAppointment.ts
│   └── useAppointmentActions.ts
├── components/             # Componentes del feature
│   ├── AppointmentForm.tsx
│   ├── AppointmentCard.tsx
│   └── AppointmentList.tsx
├── store/                  # Zustand store local (si aplica)
│   └── appointments.store.ts
├── types/                  # Tipos del feature
│   └── appointments.types.ts
├── utils/                  # Utilidades específicas
│   └── appointments.utils.ts
└── index.ts                # Public API del feature
```

---

## 🔄 Gestión de Estado

### Cuándo Usar Cada Herramienta

| Herramienta | Caso de Uso | Ejemplos |
|-------------|-------------|----------|
| **React State** | Estado local del componente | Form inputs, toggles, modals |
| **Zustand** | Estado global de UI/App | User session, theme, sidebar, filters |
| **TanStack Query** | Estado del servidor (async) | Listas, detalles, mutaciones CRUD |
| **URL State** | Estado compartible/navegable | Filtros de tabla, paginación, tabs |

### Zustand Store Example

```typescript
// shared/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  tenantId: string;
  branchId: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ 
        user: null, 
        accessToken: null, 
        refreshToken: null, 
        isAuthenticated: false 
      }),
    }),
    { name: 'auth-storage' }
  )
);
```

### TanStack Query Patterns

```typescript
// entities/customer/hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import type { Customer, CustomerFilters, CreateCustomerDto } from '../types';

// Query para lista con filtros
export const useCustomers = (filters: CustomerFilters) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Query para detalle
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
};

// Mutation para crear
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Mutation para actualizar
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCustomerDto> }) => 
      customersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    },
  });
};
```

### App Store (UI Global)

```typescript
// shared/stores/app.store.ts
interface AppState {
  sidebarOpen: boolean;
  currentBranch: Branch | null;
  locale: string;
  
  toggleSidebar: () => void;
  setBranch: (branch: Branch) => void;
  setLocale: (locale: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  currentBranch: null,
  locale: 'es',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setBranch: (branch) => set({ currentBranch: branch }),
  setLocale: (locale) => set({ locale }),
}));
```

---

## 🔌 Capa de API

### Configuración de Axios

```typescript
// shared/api/axios.instance.ts
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - Auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Error handling & refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        const { access_token, refresh_token } = response.data;
        useAuthStore.getState().setTokens(access_token, refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### API Module Example

```typescript
import { apiClient } from '@/shared/api';
import type { Customer, CustomerFilters, CreateCustomerDto, PaginatedResponse } from '../types';

export const customersApi = {
  getAll: (filters: CustomerFilters) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers', { params: filters })
      .then(res => res.data),
  
  getById: (id: string) =>
    apiClient.get<Customer>(`/customers/${id}`).then(res => res.data),
  
  create: (data: CreateCustomerDto) =>
    apiClient.post<Customer>('/customers', data).then(res => res.data),
  
  update: (id: string, data: Partial<CreateCustomerDto>) =>
    apiClient.patch<Customer>(`/customers/${id}`, data).then(res => res.data),
  
  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`),
  
  search: (query: string) =>
    apiClient.get<Customer[]>('/customers/search', { params: { q: query } })
      .then(res => res.data),
};
```

### Manejo de Errores

```typescript
// shared/api/types.ts
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// shared/lib/error-handler.ts
import { AxiosError } from 'axios';
import { enqueueSnackbar } from 'notistack';

export const handleApiError = (error: AxiosError<ApiError>) => {
  const message = error.response?.data?.message || 'Error inesperado';
  enqueueSnackbar(message, { variant: 'error' });
  
  // Log para debugging
  console.error('API Error:', {
    code: error.response?.data?.code,
    message,
    details: error.response?.data?.details,
    status: error.response?.status,
  });
};
```

---

## 🔐 Autenticación y Autorización

### Flujo de Autenticación

```
1. Usuario ingresa credenciales en LoginForm
2. POST /auth/login con email, password, tenant_id
3. Backend retorna access_token (15min) + refresh_token (7 días)
4. Tokens se almacenan en Zustand con persistencia
5. Axios interceptor adjunta access_token en cada request
6. Ante 401, se intenta refresh automático; si falla, logout
```

### Protección de Rutas

```typescript
// app/router/ProtectedRoute.tsx
import { FC, PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/auth.store';
import { FullPageLoader } from '@/shared/components';

export const ProtectedRoute: FC<PropsWithChildren> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
```

### Control de Permisos (RBAC)

```typescript
// shared/hooks/usePermissions.ts
import { useAuthStore } from '../stores/auth.store';

type Role = 'ADMIN' | 'RECEPCION' | 'CAJA' | 'PROFESIONAL';

export const usePermissions = () => {
  const { user } = useAuthStore();
  const roles = user?.roles || [];
  
  return {
    isAdmin: roles.includes('ADMIN'),
    canManageCash: roles.some(r => ['ADMIN', 'CAJA'].includes(r)),
    canManagePayroll: roles.includes('ADMIN'),
    canVoidInvoice: roles.includes('ADMIN'),
    canManageAppointments: roles.some(r => ['ADMIN', 'RECEPCION'].includes(r)),
    hasRole: (role: Role) => roles.includes(role),
  };
};

// Componente condicional
interface CanProps {
  permission: keyof ReturnType<typeof usePermissions>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: FC<CanProps> = ({ permission, children, fallback = null }) => {
  const permissions = usePermissions();
  
  if (permissions[permission]) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

// Uso
<Can permission="canManagePayroll">
  <PayrollSection />
</Can>
```

---

## 📱 Pantallas y Módulos

### Dashboard

**Ruta**: `/`

**Componentes**:
- KPIs del día (servicios, ingresos, ocupación)
- Próximas citas
- Accesos rápidos
- Gráfico de ingresos semana

### Agenda (Appointments)

**Ruta**: `/appointments`

**Funcionalidades**:
- Vista calendario (FullCalendar) por día/semana
- Timeline vertical por profesional
- Crear cita con formulario
- Registrar walk-in
- Check-in de cliente
- Estados coloreados: Pendiente (amarillo), Confirmada (verde), En progreso (azul), Completada (gris), No-show (rojo)

**Componentes clave**:
- `AppointmentCalendar`: Vista principal con FullCalendar
- `AppointmentForm`: Formulario de creación/edición
- `WalkInDialog`: Modal para walk-in rápido
- `AppointmentCard`: Tarjeta con info de cita

### Sesión de Servicio

**Ruta**: `/session/:id`

**Funcionalidades**:
- Cronómetro en tiempo real
- Checklist de pasos del servicio
- Agregar servicios adicionales (upselling)
- Campo de notas
- Botón finalizar

**Componentes clave**:
- `SessionPanel`: Panel principal de sesión
- `SessionTimer`: Cronómetro con indicador de exceso
- `ServiceChecklist`: Lista de pasos
- `AddServiceDialog`: Modal para agregar servicios

### Checkout

**Ruta**: `/checkout/:sessionId`

**Funcionalidades**:
- Resumen de servicios y productos
- Split payments (múltiples métodos)
- Input de propina
- Vista previa de recibo
- Generación de factura

**Componentes clave**:
- `CheckoutPanel`: Panel principal
- `PaymentForm`: Formulario de pagos múltiples
- `TipInput`: Input para propina
- `ReceiptPreview`: Vista previa del recibo

### Clientes

**Ruta**: `/customers`

**Funcionalidades**:
- Lista con búsqueda y filtros
- CRUD completo
- Historial de servicios
- Preferencias de comunicación

**Datos del formulario**:
```typescript
interface CustomerForm {
  firstName: string;          // Requerido
  lastName: string;           // Requerido
  identificationNumber: string; // Requerido
  address: string;            // Requerido
  email: string;              // Requerido, email válido
  birthDate: Date;            // Requerido
  phone: string;              // Requerido
  preferredChannel: 'whatsapp' | 'sms' | 'email';
  consentMarketing: boolean;
}
```

### Personal (Staff)

**Ruta**: `/staff`

**Funcionalidades**:
- Lista de profesionales
- CRUD completo
- Asignación de servicios
- Configuración de comisiones
- Horarios

**Datos del formulario**:
```typescript
interface StaffForm {
  firstName: string;
  lastName: string;
  identificationNumber: string;
  address: string;
  email: string;
  birthDate: Date;
  phone: string;
  roleType: string;
  commissionDefaultPct: number; // Default: 60
  services: string[];           // IDs de servicios
}
```

### Caja (Cash Register)

**Ruta**: `/cash`

**Funcionalidades**:
- Apertura con monto inicial
- Lista de movimientos
- Agregar ingresos/egresos
- Cierre con conteo
- Cálculo de diferencia

**Componentes clave**:
- `CashOpenDialog`: Modal para abrir caja
- `CashCloseDialog`: Modal para cerrar con conteo
- `MovementForm`: Formulario de movimiento
- `CashSummary`: Resumen de caja actual

### Nómina (Payroll)

**Ruta**: `/payroll`

**Funcionalidades**:
- Crear periodo semanal
- Generar liquidaciones
- Ver detalle por profesional
- Registrar adelantos
- Cerrar liquidación
- Marcar como pagada
- Generar PDF de recibo

**Componentes clave**:
- `PeriodForm`: Crear/editar periodo
- `StatementsTable`: Tabla de liquidaciones
- `StatementDetail`: Detalle transparente
- `AdvanceForm`: Registrar adelanto
- `PayrollReceiptPDF`: Generación de PDF

---

## 📝 Formularios y Validación

### React Hook Form + Zod

```typescript
// entities/customer/components/CustomerForm.tsx
import { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Grid, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

// Schema de validación
const customerSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  identificationNumber: z.string().min(5, 'Identificación requerida'),
  address: z.string().min(5, 'Dirección requerida'),
  email: z.string().email('Email inválido'),
  birthDate: z.date({ required_error: 'Fecha de nacimiento requerida' }),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Teléfono inválido'),
  preferredChannel: z.enum(['whatsapp', 'sms', 'email']),
  consentMarketing: z.boolean(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  defaultValues?: Partial<CustomerFormData>;
  isLoading?: boolean;
}

export const CustomerForm: FC<CustomerFormProps> = ({ 
  onSubmit, 
  defaultValues,
  isLoading 
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      preferredChannel: 'whatsapp',
      consentMarketing: true,
      ...defaultValues,
    },
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nombre"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Apellido"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Teléfono"
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Fecha de Nacimiento"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.birthDate,
                    helperText: errors.birthDate?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="preferredChannel"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Canal Preferido"
                fullWidth
              >
                <MenuItem value="whatsapp">WhatsApp</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="email">Email</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        {/* ... más campos */}
        <Grid item xs={12}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
```

---

## ⚡ Performance

### Code Splitting

```typescript
// Lazy loading de rutas
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AppointmentsPage = lazy(() => import('./pages/appointments/AppointmentsPage'));
const PayrollPage = lazy(() => import('./pages/payroll/PayrollPage'));

// En router
<Route 
  path="/" 
  element={
    <Suspense fallback={<PageLoader />}>
      <DashboardPage />
    </Suspense>
  } 
/>
```

### Memoización

```typescript
// Usar React.memo para componentes con props estables
export const AppointmentCard = memo(({ appointment, onClick }: Props) => {
  // ...
});

// useMemo para cálculos costosos
const totalCommissions = useMemo(() => 
  statements.reduce((sum, s) => sum + s.totalCommission, 0),
  [statements]
);

// useCallback para funciones pasadas como props
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

### Query Stale Times

```typescript
// Datos que cambian poco
const { data: services } = useQuery({
  queryKey: ['services'],
  queryFn: servicesApi.getAll,
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// Datos volátiles
const { data: appointments } = useQuery({
  queryKey: ['appointments', date],
  queryFn: () => appointmentsApi.getByDate(date),
  staleTime: 30 * 1000, // 30 segundos
});
```

---

## 🧪 Testing

### Pirámide de Tests

| Tipo | Cobertura | Herramienta | Alcance |
|------|-----------|-------------|---------|
| Unit | 70% | Vitest | Utils, hooks, stores |
| Integration | 20% | Testing Library + MSW | Componentes + API |
| E2E | 10% | Playwright | Flujos críticos |

### Ejemplo Unit Test

```typescript
// shared/lib/__tests__/currency.utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, convertCurrency } from '../currency.utils';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
  
  it('formats EUR correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });
});
```

### Ejemplo Integration Test

```typescript
// features/customers/__tests__/CustomerForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerForm } from '../components/CustomerForm';

describe('CustomerForm', () => {
  it('validates required fields', async () => {
    const onSubmit = vi.fn();
    render(<CustomerForm onSubmit={onSubmit} />);
    
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    
    expect(await screen.findByText(/mínimo 2 caracteres/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  
  it('submits valid data', async () => {
    const onSubmit = vi.fn();
    render(<CustomerForm onSubmit={onSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Ana');
    await userEvent.type(screen.getByLabelText(/apellido/i), 'García');
    // ... llenar más campos
    
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'Ana',
        lastName: 'García',
      }));
    });
  });
});
```

### Flujos E2E Críticos

1. Login y autenticación
2. Crear cita y check-in
3. Iniciar y finalizar sesión de servicio
4. Checkout y emisión de recibo
5. Apertura y cierre de caja
6. Generación de nómina semanal

---

## 📝 Convenciones de Código

### Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Componentes | kebab-case | `customer-form.tsx` |
| Hooks | kebab-case con use | `use-customers.ts` |
| Utilidades | kebab-case | `format-currency.ts` |
| Tipos/Interfaces | PascalCase | `Customer`, `AppointmentStatus` |
| Constantes | SCREAMING_SNAKE | `API_BASE_URL`, `MAX_RETRIES` |
| Archivos de tipos | kebab-case *.types.ts | `customer.types.ts` |
| Archivos de API | kebab-case *.api.ts | `customers.api.ts` |
| Stores | kebab-case *.store.ts | `auth.store.ts` |

### Estructura de Componente

```typescript
// Orden recomendado dentro de un componente
export const CustomerForm: FC<CustomerFormProps> = ({ onSubmit }) => {
  // 1. Hooks de terceros (router, i18n)
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // 2. Stores globales
  const { branchId } = useAppStore();
  
  // 3. Queries y mutations
  const { mutate, isPending } = useCreateCustomer();
  
  // 4. Estado local
  const [isOpen, setIsOpen] = useState(false);
  
  // 5. Forms
  const form = useForm<CustomerFormData>({ resolver: zodResolver(schema) });
  
  // 6. Efectos
  useEffect(() => { /* ... */ }, []);
  
  // 7. Handlers
  const handleSubmit = (data: CustomerFormData) => { /* ... */ };
  
  // 8. Render
  return ( /* JSX */ );
};
```

### Imports

```typescript
// Orden de imports
// 1. React y librerías de React
import { FC, useState, useEffect } from 'react';

// 2. Librerías externas
import { useForm } from 'react-hook-form';
import { Box, Button, TextField } from '@mui/material';

// 3. Imports internos absolutos
import { useAuthStore } from '@/shared/stores/auth.store';
import { customersApi } from '@/entities/customer/api';

// 4. Imports relativos
import { CustomerCard } from './CustomerCard';
import type { CustomerFormProps } from './types';
```

---

## 🔧 Variables de Entorno

```bash
# .env.example

# API
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000

# Feature Flags
VITE_ENABLE_PAYROLL=true
VITE_ENABLE_INVENTORY=true
VITE_ENABLE_CRM=true

# Third Party
VITE_SENTRY_DSN=
VITE_GA_TRACKING_ID=

# App
VITE_APP_NAME="SaaS Belleza"
VITE_APP_VERSION=$npm_package_version
```

---

## 🚀 Scripts de Desarrollo

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "prepare": "husky install"
  }
}
```

---

## 📚 Referencias Rápidas

### Crear nuevo feature

```bash
mkdir -p src/features/new_feature/{api,hooks,components,types,store}
touch src/features/new_feature/index.ts
```

### Crear nueva entidad

```bash
mkdir -p src/entities/new_entity/{api,hooks,components,types}
touch src/entities/new_entity/index.ts
```

### Agregar nueva ruta

```typescript
// 1. Crear componente de página en pages/
// 2. Agregar ruta en app/router/routes.tsx
// 3. Agregar link en widgets/layout/Sidebar.tsx
```

---

> **Última actualización**: Diciembre 2025  
> **Versión del documento**: 1.0
