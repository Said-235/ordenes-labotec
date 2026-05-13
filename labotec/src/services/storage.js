import { supabase } from './supabase.js'

// ─────────────────────────────────────────────────────────────
//  CAPA DE DATOS — Supabase
//  El resto de la app (useOrdenes, componentes, páginas)
//  no cambia nada — solo este archivo.
// ─────────────────────────────────────────────────────────────

const INIT = { ordenes: [], ultimoFolio: 1000 }

// ── Convertir fila de DB (snake_case) → objeto app (camelCase)
function desdeDB(row) {
  return {
    id:          row.id,
    folio:       row.folio,
    tipo:        row.tipo,
    fecha:       row.fecha,
    fechaISO:    row.fecha_iso,
    responsable: row.responsable,
    razonSocial: row.razon_social,
    direccion:   row.direccion,
    horaInicio:  row.hora_inicio,
    horaFin:     row.hora_fin,
    equipo:      row.equipo,
    serie:       row.serie,
    actividades: row.actividades  || [],
    refacciones: row.refacciones  || [],
    comentarios: row.comentarios  || '',
    firmaResp:   row.firma_resp,
    firmaIng:    row.firma_ing,
    qrPayload:   row.qr_payload,
    qrHash:      row.qr_hash,
  }
}

// ── Convertir objeto app (camelCase) → fila de DB (snake_case)
function paraDB(ord) {
  return {
    id:           ord.id,
    folio:        ord.folio,
    tipo:         ord.tipo,
    fecha:        ord.fecha,
    responsable:  ord.responsable,
    razon_social: ord.razonSocial,
    direccion:    ord.direccion,
    hora_inicio:  ord.horaInicio,
    hora_fin:     ord.horaFin,
    equipo:       ord.equipo,
    serie:        ord.serie,
    actividades:  ord.actividades,
    refacciones:  ord.refacciones,
    comentarios:  ord.comentarios,
    firma_resp:   ord.firmaResp,
    firma_ing:    ord.firmaIng,
    qr_payload:   ord.qrPayload,
    qr_hash:      ord.qrHash,
  }
}

// ── CARGAR ────────────────────────────────────────────────────
export async function cargarDB() {
  try {
    const [{ data: filas, error }, { data: cfg }] = await Promise.all([
      supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('config')
        .select('value')
        .eq('key', 'ultimo_folio')
        .single()
    ])

    if (error) throw error

    return {
      ordenes:     (filas || []).map(desdeDB),
      ultimoFolio: parseInt(cfg?.value || '1000'),
    }
  } catch (err) {
    console.error('[storage] cargarDB:', err)
    return { ...INIT }
  }
}

// ── GUARDAR (compatibilidad — no se usa con Supabase) ─────────
export async function guardarDB() {
  // Con Supabase cada operación es atómica
  // Esta función se mantiene por compatibilidad con useOrdenes
}

// ── AGREGAR ORDEN ─────────────────────────────────────────────
export async function agregarOrden(ordenesActuales, nuevaOrden, nuevoFolio) {
  try {
    const [{ error: errOrden }, { error: errCfg }] = await Promise.all([
      supabase
        .from('ordenes')
        .insert(paraDB(nuevaOrden)),
      supabase
        .from('config')
        .update({ value: String(nuevoFolio) })
        .eq('key', 'ultimo_folio')
    ])

    if (errOrden) throw errOrden
    if (errCfg)   throw errCfg

    return {
      ordenes:     [nuevaOrden, ...ordenesActuales],
      ultimoFolio: nuevoFolio,
    }
  } catch (err) {
    console.error('[storage] agregarOrden:', err)
    throw err
  }
}

// ── ELIMINAR ORDEN ────────────────────────────────────────────
export async function eliminarOrden(ordenesActuales, id, ultimoFolio) {
  try {
    const { error } = await supabase
      .from('ordenes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      ordenes:     ordenesActuales.filter(o => o.id !== id),
      ultimoFolio: ultimoFolio,
    }
  } catch (err) {
    console.error('[storage] eliminarOrden:', err)
    throw err
  }
}