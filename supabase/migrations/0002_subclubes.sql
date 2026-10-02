-- Subclubes: agrupaciones internas de un club (sin foto ni identidad propia).
-- Migración SOLO ADITIVA: no borra ni modifica datos existentes.
-- Un estudiante pertenece a lo sumo a un subclub; sus encargados son siempre secundarios.

begin;

create table if not exists subclubes (
  id_subclub serial primary key,
  id_club integer not null references clubes (id_club) on delete cascade,
  nombre varchar not null,
  creado_en timestamptz not null default now(),
  unique (id_club, nombre)
);
create index if not exists subclubes_id_club_idx on subclubes (id_club);

create table if not exists encargados_subclub (
  id_encargado_subclub serial primary key,
  id_subclub integer not null references subclubes (id_subclub) on delete cascade,
  id_usuario integer not null references usuarios (id_usuario) on delete cascade,
  creado_en timestamptz not null default now(),
  unique (id_subclub, id_usuario)
);
create index if not exists encargados_subclub_id_usuario_idx on encargados_subclub (id_usuario);

-- Columnas nullable sin default: no reescriben ni alteran las filas existentes.
alter table estudiantes
  add column if not exists id_subclub integer null references subclubes (id_subclub) on delete set null;
create index if not exists estudiantes_id_subclub_idx on estudiantes (id_subclub);

alter table asistencia
  add column if not exists id_subclub integer null references subclubes (id_subclub) on delete set null;

-- Igual que el resto de tablas: RLS activo (el servidor usa service_role).
alter table subclubes enable row level security;
alter table encargados_subclub enable row level security;

commit;
