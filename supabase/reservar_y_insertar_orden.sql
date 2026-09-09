-- Pegar en Supabase → SQL Editor. No reinicia ultimo_folio ni renumera filas existentes.

alter table ordenes add column if not exists fecha_iso timestamptz;

create unique index if not exists ordenes_folio_unique on ordenes (folio);

create or replace function reservar_y_insertar_orden(p_orden jsonb)
returns jsonb
language plpgsql
security invoker
as $$
declare
  n int;
  yr text;
  new_folio text;
  verify_url text;
  inserted ordenes;
begin
  update config
    set value = (coalesce(nullif(value, '')::int, 1000) + 1)::text
    where key = 'ultimo_folio'
    returning value::int into n;

  if n is null then
    raise exception 'Falta la fila config.ultimo_folio';
  end if;

  yr := to_char(clock_timestamp(), 'YY');
  new_folio := 'OS-' || yr || '-' || lpad(n::text, 4, '0');
  verify_url := 'https://ordenes-servicio-labotec.netlify.app/verificar/' || new_folio;

  insert into ordenes (
    id, folio, tipo, fecha, fecha_iso,
    responsable, razon_social, direccion,
    hora_inicio, hora_fin, equipo, serie,
    actividades, refacciones, comentarios,
    firma_resp, firma_ing, qr_payload, qr_hash
  ) values (
    p_orden->>'id',
    new_folio,
    p_orden->>'tipo',
    p_orden->>'fecha',
    coalesce(nullif(p_orden->>'fecha_iso', '')::timestamptz, clock_timestamp()),
    p_orden->>'responsable',
    p_orden->>'razon_social',
    p_orden->>'direccion',
    p_orden->>'hora_inicio',
    p_orden->>'hora_fin',
    p_orden->>'equipo',
    p_orden->>'serie',
    coalesce(p_orden->'actividades', '[]'::jsonb),
    coalesce(p_orden->'refacciones', '[]'::jsonb),
    coalesce(p_orden->>'comentarios', ''),
    p_orden->>'firma_resp',
    p_orden->>'firma_ing',
    verify_url,
    'Verificar en: ' || verify_url
  )
  returning * into inserted;

  return jsonb_build_object(
    'orden', to_jsonb(inserted),
    'ultimo_folio', n
  );
end;
$$;

grant execute on function reservar_y_insertar_orden(jsonb) to anon, authenticated;
