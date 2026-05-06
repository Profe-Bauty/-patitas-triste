# 📊 Diseño de Base de Datos - Patitas Tristes

## Visión General

Base de datos relacional en **PostgreSQL 15+** con auditoría completa, integridad referencial y optimizaciones para consultas frecuentes.

## Diagrama Entidad-Relación (ER)

```
┌──────────────┐
│    Users     │◄─────┐
├──────────────┤      │
│ id (PK)      │      │
│ email        │      │
│ name         │      │
│ role         │      │
│ ...          │      │
└──────────────┘      │
       ▲              │
       │              │
    ┌──┴──────────────┴─────────┐
    │                           │
┌───┴────┐        ┌────────┐   │
│Animals │        │Adoption│   │
├────────┤        ├────────┤   │
│ id (PK)├──┐     │animal_id   │
│ name   │  │     │adopter_id  │
│ ...    │  │     │status      │
└────────┘  │     └────────┘   │
       ▲    │         ▲         │
       │    │         └─────────┤
       │    │                   │
    ┌──┴────┴──────┐      ┌─────┴──────┐
    │HealthRecords │      │  Volunteers│
    ├──────────────┤      ├─────────────┤
    │ animal_id    │      │ user_id (FK)│
    │ type         │      │ skills[]    │
    │ vaccine_name │      │ ...         │
    │ ...          │      └─────────────┘
    └──────────────┘             │
                                 │
                            ┌────┴──────┐
                            │ Shifts     │
                            ├────────────┤
                            │volunteer_id│
                            │date/time   │
                            │...         │
                            └────────────┘

    ┌──────────┐        ┌───────────┐
    │ Donors   │───────►│ Donations │
    ├──────────┤        ├───────────┤
    │ id (PK)  │        │ donor_id  │
    │ name     │        │ amount    │
    │ email    │        │ status    │
    │ ...      │        │ ...       │
    └──────────┘        └───────────┘
```

## Definición de Tablas

### 1. **users** - Usuarios del Sistema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL 
    CHECK (role IN ('admin', 'veterinarian', 'volunteer', 'adopter', 'donor')),
  phone VARCHAR(20),
  document_id VARCHAR(20) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(10),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### 2. **animals** - Animales Rescatados

```sql
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  species VARCHAR(50) NOT NULL 
    CHECK (species IN ('perro', 'gato', 'conejo', 'pajaro', 'otro')),
  breed VARCHAR(100),
  estimated_age_years INT,
  estimated_age_months INT,
  gender VARCHAR(20) 
    CHECK (gender IN ('masculino', 'femenino', 'desconocido')),
  size VARCHAR(20) 
    CHECK (size IN ('pequeño', 'mediano', 'grande', 'extra_grande')),
  color_description TEXT,
  distinctive_marks TEXT, -- cicatrices, manchas, etc.
  medical_notes TEXT,
  behavioral_notes TEXT,
  entry_date DATE NOT NULL,
  entry_reason VARCHAR(255), -- 'abandono', 'maltrato', 'perdido', etc.
  status VARCHAR(50) NOT NULL 
    CHECK (status IN ('rescate', 'cuidado', 'adoptado', 'fallecido', 'devuelto')),
  photo_url VARCHAR(500),
  additional_photos VARCHAR(500)[],
  microchip_id VARCHAR(50) UNIQUE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT age_check CHECK (estimated_age_years >= 0 AND estimated_age_months >= 0)
);

CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_microchip ON animals(microchip_id);
CREATE INDEX idx_animals_entry_date ON animals(entry_date);
CREATE INDEX idx_animals_created_by ON animals(created_by);
```

### 3. **health_records** - Registro Sanitario

```sql
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL 
    CHECK (record_type IN ('vacuna', 'desparasitacion', 'cirugia', 'revisión', 'medicamento')),
  vaccine_name VARCHAR(255), -- 'Quíntuple', 'Rabia', 'Polivalente', etc.
  application_date DATE NOT NULL,
  next_due_date DATE, -- para alertas automáticas
  veterinarian_id UUID REFERENCES users(id),
  veterinary_clinic VARCHAR(255),
  dosage VARCHAR(100),
  notes TEXT,
  certificate_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT date_logic CHECK (next_due_date IS NULL OR next_due_date > application_date)
);

CREATE INDEX idx_health_animal_id ON health_records(animal_id);
CREATE INDEX idx_health_next_due ON health_records(next_due_date) WHERE next_due_date IS NOT NULL;
CREATE INDEX idx_health_record_type ON health_records(record_type);
CREATE INDEX idx_health_vet_id ON health_records(veterinarian_id);
```

### 4. **adoptions** - Proceso de Adopción

```sql
CREATE TABLE adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE RESTRICT,
  adopter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL 
    CHECK (status IN ('entrevista', 'pre_adopcion', 'adoptado', 'cancelada', 'devuelto')),
  interview_date DATE,
  interview_notes TEXT,
  interviewed_by UUID REFERENCES users(id),
  pre_adoption_period_days INT DEFAULT 7,
  pre_adoption_start_date DATE,
  pre_adoption_notes TEXT,
  contract_url VARCHAR(500),
  contract_signed_date DATE,
  adoption_date DATE,
  follow_up_notes TEXT[],
  follow_up_schedule DATE[],
  reason_cancelation VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT adoption_logic CHECK (
    status != 'adoptado' OR adoption_date IS NOT NULL
  )
);

CREATE INDEX idx_adoptions_animal_id ON adoptions(animal_id);
CREATE INDEX idx_adoptions_adopter_id ON adoptions(adopter_id);
CREATE INDEX idx_adoptions_status ON adoptions(status);
CREATE INDEX idx_adoptions_adoption_date ON adoptions(adoption_date);
CREATE UNIQUE INDEX idx_adoptions_active_animal ON adoptions(animal_id) 
  WHERE status = 'adoptado';
```

### 5. **donors** - Registro de Donantes

```sql
CREATE TABLE donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cuit_cuil VARCHAR(20) UNIQUE,
  preferred_payment_method VARCHAR(50) 
    CHECK (preferred_payment_method IN ('mercado_pago', 'transferencia', 'efectivo')),
  mercado_pago_email VARCHAR(255),
  total_donated DECIMAL(12, 2) DEFAULT 0,
  donation_count INT DEFAULT 0,
  is_subscriber BOOLEAN DEFAULT FALSE,
  subscription_amount DECIMAL(10, 2),
  subscription_frequency VARCHAR(50), -- 'mensual', 'bimestral', 'anual'
  last_donation_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT amount_positive CHECK (total_donated >= 0)
);

CREATE INDEX idx_donors_email ON donors(email);
CREATE INDEX idx_donors_is_subscriber ON donors(is_subscriber);
CREATE INDEX idx_donors_last_donation ON donors(last_donation_date);
```

### 6. **donations** - Transacciones de Donación

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  donation_type VARCHAR(50) NOT NULL 
    CHECK (donation_type IN ('unica', 'suscripcion')),
  payment_method VARCHAR(50) 
    CHECK (payment_method IN ('mercado_pago', 'transferencia', 'efectivo')),
  transaction_id VARCHAR(255) UNIQUE,
  mercado_pago_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL 
    CHECK (status IN ('pendiente', 'completada', 'fallida', 'reembolso')),
  notes TEXT,
  donation_date DATE NOT NULL,
  completed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_donation_date ON donations(donation_date);
CREATE INDEX idx_donations_mercado_pago_id ON donations(mercado_pago_id);
```

### 7. **volunteers** - Voluntarios

```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skills TEXT[] NOT NULL 
    DEFAULT ARRAY[]::TEXT[],
    -- 'paseo', 'limpieza', 'veterinaria', 'redes_sociales', 'adoptions', 'eventos'
  bio TEXT,
  availability_monday BOOLEAN DEFAULT FALSE,
  availability_tuesday BOOLEAN DEFAULT FALSE,
  availability_wednesday BOOLEAN DEFAULT FALSE,
  availability_thursday BOOLEAN DEFAULT FALSE,
  availability_friday BOOLEAN DEFAULT FALSE,
  availability_saturday BOOLEAN DEFAULT FALSE,
  availability_sunday BOOLEAN DEFAULT FALSE,
  preferred_shift VARCHAR(50), -- 'mañana', 'tarde', 'noche'
  max_hours_per_week INT DEFAULT 10,
  total_hours_volunteered INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX idx_volunteers_skills ON volunteers USING GIN(skills);
```

### 8. **shifts** - Turnos de Voluntarios

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  task_description VARCHAR(255),
  task_type VARCHAR(50) 
    CHECK (task_type IN ('paseo', 'limpieza', 'cuidado', 'evento', 'otro')),
  status VARCHAR(50) NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  hours_worked DECIMAL(3, 1),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT time_logic CHECK (end_time > start_time)
);

CREATE INDEX idx_shifts_volunteer_id ON shifts(volunteer_id);
CREATE INDEX idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_date_range ON shifts(shift_date, start_time);
```

### 9. **audit_log** - Registro de Auditoría

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(100) NOT NULL, -- 'animal', 'adoption', 'donation', etc.
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  changes JSONB, -- {'field': {'old_value': x, 'new_value': y}}
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);
```

## Vistas Útiles

```sql
-- Vista: Animales que necesitan revisión sanitaria
CREATE VIEW animals_pending_health_check AS
SELECT 
  a.id,
  a.name,
  a.species,
  h.next_due_date,
  h.vaccine_name,
  CURRENT_DATE - h.next_due_date AS days_overdue
FROM animals a
LEFT JOIN health_records h ON a.id = h.animal_id
WHERE a.status = 'cuidado' 
  AND h.next_due_date IS NOT NULL 
  AND h.next_due_date <= CURRENT_DATE
ORDER BY h.next_due_date ASC;

-- Vista: Donaciones mensuales
CREATE VIEW monthly_donations_summary AS
SELECT 
  DATE_TRUNC('month', d.donation_date)::DATE AS month,
  COUNT(*) as donation_count,
  SUM(d.amount) as total_amount,
  COUNT(DISTINCT d.donor_id) as unique_donors
FROM donations d
WHERE d.status = 'completada'
GROUP BY DATE_TRUNC('month', d.donation_date)
ORDER BY month DESC;

-- Vista: Voluntarios activos y horas
CREATE VIEW volunteer_hours_summary AS
SELECT 
  v.id,
  u.name,
  v.total_hours_volunteered,
  COUNT(s.id) as shifts_completed,
  SUM(s.hours_worked) as hours_this_month
FROM volunteers v
JOIN users u ON v.user_id = u.id
LEFT JOIN shifts s ON v.id = s.volunteer_id 
  AND s.status = 'completed'
  AND DATE_TRUNC('month', s.shift_date) = DATE_TRUNC('month', CURRENT_DATE)
WHERE v.is_active = TRUE
GROUP BY v.id, u.name, v.total_hours_volunteered;
```

## Políticas de Integridad Referencial

| Relación | ON DELETE | ON UPDATE |
|----------|-----------|-----------|
| animals.created_by → users | RESTRICT | CASCADE |
| health_records.animal_id → animals | CASCADE | CASCADE |
| adoptions.animal_id → animals | RESTRICT | CASCADE |
| adoptions.adopter_id → users | RESTRICT | CASCADE |
| donations.donor_id → donors | CASCADE | CASCADE |
| shifts.volunteer_id → volunteers | CASCADE | CASCADE |
| audit_log.user_id → users | SET NULL | CASCADE |

## Consideraciones de Performance

1. **Índices**: Creados para búsquedas frecuentes (status, dates, foreign keys)
2. **Particionamiento**: Las tablas `audit_log` y `donations` pueden particionarse por fecha en producción
3. **Materialized Views**: Para reportes complejos (donaciones mensuales, voluntarios activos)
4. **Connection Pooling**: Usar PgBouncer en producción

## Normalización

- **3NF**: Todas las tablas se encuentran en Tercera Forma Normal
- **BCNF**: Se cumple para evitar anomalías de datos

## Scripts de Inicialización

Ver archivo: `database/init.sql`
Ver migraciones: `database/migrations/`
