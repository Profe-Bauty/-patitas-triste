# 🏗️ Guía de Arquitectura - Patitas Tristes

## Estructura General

```
Backend (Node.js + Express + TypeScript)
    ↓
PostgreSQL Database
    ↓
Frontend (React + Vite + TypeScript)
```

## Organización del Backend

### Capas de Arquitectura

#### 1. **Presentation Layer** (Controllers)
- Maneja requests HTTP
- Valida entrada de datos
- Retorna respuestas formateadas

```
GET /api/animals/:id
    ↓
AnimalsController.getAnimalById()
    ↓
JSON response
```

#### 2. **Business Logic Layer** (Services)
- Lógica de negocio
- Operaciones de datos
- Validaciones complejas

```typescript
AnimalsService.getAnimalById(id)
    ↓
Queries BD + procesamiento
    ↓
Animal object
```

#### 3. **Data Access Layer** (Database)
- Operaciones directas con BD
- Queries SQL
- Connection pooling

#### 4. **Shared/Infrastructure**
- Middleware (auth, logging, errors)
- Utilities
- Configuration

### Flujo de una Request

```
Request
  ↓
Middleware (Logger, Auth, Validation)
  ↓
Router (animals.routes.ts)
  ↓
Controller (animals.controller.ts)
  ↓
Service (animals.service.ts)
  ↓
Database (PostgreSQL)
  ↓
Formatted Response
```

## Patrones Utilizados

### 1. **Service Pattern**
Separación de lógica de negocio de controllers

```typescript
// ❌ NO - Controllers con lógica
app.get('/animals', (req, res) => {
  const result = pool.query('SELECT * FROM animals');
  res.json(result);
});

// ✅ SÍ - Controllers + Services
class AnimalsService {
  async getAllAnimals() { /* lógica */ }
}

class AnimalsController {
  async getAllAnimals(req, res) {
    const animals = await service.getAllAnimals();
    res.json(animals);
  }
}
```

### 2. **Repository Pattern** (Futuro)
Abstracción de acceso a datos

```typescript
interface IAnimalRepository {
  create(animal: Animal): Promise<Animal>;
  findById(id: string): Promise<Animal | null>;
  update(id: string, data: Partial<Animal>): Promise<Animal>;
  delete(id: string): Promise<void>;
}
```

### 3. **DTO Pattern** (Data Transfer Object)
Validación y transformación de datos

```typescript
interface CreateAnimalDTO {
  name: string;
  species: AnimalSpecies;
  // ...
}
```

## Módulos

### Estructura de un Módulo

```
animals/
├── animals.types.ts       # TypeScript interfaces
├── animals.service.ts     # Business logic
├── animals.controller.ts  # HTTP handlers
├── animals.routes.ts      # Route definitions
└── animals.validator.ts   # Input validation (próximo)
```

### Módulos Actuales

- **animals**: Gestión de mascotas
- **health**: Carnet sanitario
- **adoptions**: Proceso de adopción
- **donations**: Gestión de donaciones
- **volunteers**: Voluntarios y turnos

## Autenticación y Autorización

### JWT Flow

```
1. User login
   POST /api/auth/login
   { email, password }
   ↓
2. Server verifies credentials
   ↓
3. JWT token generated
   { id, email, role, exp: ... }
   ↓
4. Token sent to client
   ↓
5. Client includes in headers
   Authorization: Bearer <token>
   ↓
6. Middleware verifies token
```

### Role-Based Access Control (RBAC)

```typescript
enum Role {
  ADMIN = 'admin',
  VETERINARIAN = 'veterinarian',
  VOLUNTEER = 'volunteer',
  ADOPTER = 'adopter',
  DONOR = 'donor',
}

// Middleware de autorización
@RequireRole(Role.ADMIN)
async deleteAnimal(req, res) { }
```

## Base de Datos

### Normalización
- **3NF**: Todas las tablas
- Evita redundancia y anomalías

### Integridad Referencial
```sql
-- ON DELETE RESTRICT: No permite eliminar si hay FK
-- ON DELETE CASCADE: Elimina registros relacionados
-- ON DELETE SET NULL: Anula el FK
```

### Índices Estratégicos
```sql
idx_animals_status         -- Búsquedas por estado
idx_health_next_due        -- Alertas de vacunación
idx_adoptions_adopter_id   -- Historial de adopciones
idx_shifts_volunteer_id    -- Turnos de voluntario
```

## Validación de Datos

### Niveles de Validación

1. **Frontend**: Validación en tiempo real
2. **API**: Validación de request body
3. **Servicio**: Lógica de negocio
4. **Base de datos**: Constraints SQL

```typescript
// Validación en request
const schema = {
  name: { type: 'string', required: true, minLength: 3 },
  species: { enum: ['perro', 'gato', 'otro'] },
  age: { type: 'number', min: 0 }
};

// Validation middleware
app.post('/animals', validateRequest(schema), controller.createAnimal);
```

## Manejo de Errores

### Estrategia

```typescript
// Custom Error class
class CustomError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {}
}

// Error handling flow
try {
  await service.operation();
} catch (error) {
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({ error: error.message });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Logging

### Niveles

```
ERROR   → Errores críticos
WARN    → Advertencias
INFO    → Información general
DEBUG   → Información de debugging
```

### Implementación

```typescript
logger.info('Animal created', { animalId, userId });
logger.error('Database error', { query, error });
```

## Auditoría

### Tabla audit_log

```sql
INSERT INTO audit_log (user_id, entity_type, entity_id, action, changes)
VALUES ($1, 'animal', $2, 'update', $3);

-- Rastrear cambios en animales, adopciones, donaciones
```

## Seguridad

### Medidas Implementadas

1. **Helmet**: Headers de seguridad HTTP
2. **CORS**: Control de origen
3. **JWT**: Autenticación stateless
4. **Bcrypt**: Hash de contraseñas
5. **SQL Injection Prevention**: Prepared statements
6. **Rate Limiting**: (próximo)
7. **HTTPS**: En producción (nginx)

## Escalabilidad

### Estrategias

1. **Connection Pooling**: PgBouncer
2. **Caching**: Redis (próximo)
3. **Load Balancing**: nginx
4. **Database Replication**: Standby server
5. **Horizontal Scaling**: Múltiples instancias API

## Deployment

### Fases

```
Development (Local)
    ↓
Staging (Pruebas)
    ↓
Production (Live)
```

### Infrastructure as Code

```yaml
docker-compose.yml
  ├── PostgreSQL
  ├── Backend API
  ├── Frontend
  └── Reverse Proxy (próximo)
```

## Testing

### Estructura

```
tests/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    └── workflows/
```

### Ejemplos

```typescript
// Unit test
describe('AnimalsService', () => {
  it('should create an animal', async () => {
    const animal = await service.createAnimal(data, userId);
    expect(animal.name).toBe('Fido');
  });
});

// Integration test
describe('GET /api/animals', () => {
  it('should return list of animals', async () => {
    const res = await request(app).get('/api/animals');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeArray();
  });
});
```

## Próximas Mejoras

- [ ] Repository pattern
- [ ] Query builders (TypeORM/Prisma)
- [ ] Caching with Redis
- [ ] API documentation (Swagger)
- [ ] Rate limiting
- [ ] WebSocket para notificaciones en tiempo real
- [ ] Microservicios (Donaciones, Notificaciones)

## Referencias

- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [REST API Best Practices](https://restfulapi.net/)
