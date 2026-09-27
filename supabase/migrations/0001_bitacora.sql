-- Bitácora de auditoría: un registro por cada acción relevante hecha en el
-- sistema (crear/editar/eliminar, pasar lista, exportar, inicio y cierre de
-- sesión, etc.). Solo se consulta desde el backend por ahora — no hay UI.
--
-- Cómo aplicar este archivo: no hay CLI de Supabase enlazada a este proyecto
-- todavía, así que corre este SQL a mano una vez, desde el SQL Editor del
-- dashboard de Supabase (o con `psql`/`pg` contra la cadena de conexión del
-- pooler — ver DATABASE_PASSWORD y NEXT_PUBLIC_SUPABASE_URL en .env).
create table if not exists bitacora (
  id_bitacora bigserial primary key,
  id_usuario integer null references usuarios (id_usuario) on delete set null,
  usuario_nombre text null,
  accion text not null,
  entidad text not null,
  entidad_id text null,
  descripcion text null,
  metadata jsonb null,
  ip text null,
  creado_en timestamptz not null default now()
);

create index if not exists idx_bitacora_creado_en on bitacora (creado_en desc);
create index if not exists idx_bitacora_id_usuario on bitacora (id_usuario);
create index if not exists idx_bitacora_entidad on bitacora (entidad, entidad_id);

comment on table bitacora is 'Bitácora de auditoría: un registro por cada acción relevante hecha en el sistema.';
