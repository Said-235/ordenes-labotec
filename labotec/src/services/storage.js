import { supabase } from './supabase.js'
import { listPending, enqueuePending, removePending } from './offlineQueue.js'

const INIT = { ordenes: [], ultimoFolio: 1000 }

function desdeDB(row) {
  if (!row) return null
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
    pending:     false,
  }
}

function paraRpc(ord) {
  return {
    id:           ord.id,
    tipo:         ord.tipo,
    fecha:        ord.fecha,
    fecha_iso:    ord.fechaISO,
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
  }
}

function mezclar(pendientes, remotas) {
  const idsRemotos = new Set(remotas.map(o => o.id))
  const locales = pendientes.filter(o => !idsRemotos.has(o.id))
  return [...locales, ...remotas]
}

export async function cargarDB() {
  const pendientes = await listPending()
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

    const remotas = (filas || []).map(desdeDB)
    return {
      ordenes:     mezclar(pendientes, remotas),
      ultimoFolio: parseInt(cfg?.value || '1000', 10),
    }
  } catch (err) {
    console.error('[storage] cargarDB:', err)
    return {
      ordenes:     pendientes,
      ultimoFolio: INIT.ultimoFolio,
    }
  }
}

export async function guardarDB() {}

async function insertarRemoto(nuevaOrden) {
  let lastErr
  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabase.rpc('reservar_y_insertar_orden', {
      p_orden: paraRpc(nuevaOrden),
    })
    if (!error && data) {
      const payload = typeof data === 'string' ? JSON.parse(data) : data
      const saved = desdeDB(payload.orden)
      return { saved, ultimoFolio: parseInt(payload.ultimo_folio, 10) }
    }
    lastErr = error
    const code = error?.code || error?.details || ''
    if (String(code).includes('23505') && i < 2) continue
    throw error
  }
  throw lastErr
}

export async function agregarOrden(ordenesActuales, nuevaOrden) {
  const online = typeof navigator === 'undefined' || navigator.onLine
  if (!online) {
    const local = { ...nuevaOrden, pending: true, folio: 'PENDIENTE' }
    await enqueuePending(local)
    return {
      ordenes:     mezclar([local], ordenesActuales.filter(o => o.id !== local.id)),
      ultimoFolio: undefined,
      saved:       local,
    }
  }

  try {
    const { saved, ultimoFolio } = await insertarRemoto(nuevaOrden)
    await removePending(nuevaOrden.id).catch(() => {})
    return {
      ordenes: [saved, ...ordenesActuales.filter(o => o.id !== saved.id && o.id !== nuevaOrden.id)],
      ultimoFolio,
      saved,
    }
  } catch (err) {
    console.error('[storage] agregarOrden:', err)
    const local = { ...nuevaOrden, pending: true, folio: 'PENDIENTE' }
    await enqueuePending(local)
    return {
      ordenes:     mezclar([local], ordenesActuales.filter(o => o.id !== local.id)),
      ultimoFolio: undefined,
      saved:       local,
      queued:      true,
      error:       err,
    }
  }
}

export async function sincronizarPendientes(ordenesActuales, ultimoFolio) {
  const pendientes = await listPending()
  let ordenes = ordenesActuales
  let folio = ultimoFolio
  let subidas = 0
  const errores = []

  for (const pend of pendientes) {
    try {
      const { saved, ultimoFolio: n } = await insertarRemoto(pend)
      await removePending(pend.id)
      ordenes = [saved, ...ordenes.filter(o => o.id !== pend.id && o.id !== saved.id)]
      folio = n
      subidas++
    } catch (err) {
      console.error('[storage] sync:', err)
      errores.push(err)
      break
    }
  }

  return { ordenes, ultimoFolio: folio, subidas, errores }
}

export async function eliminarOrden(ordenesActuales, id, ultimoFolio) {
  const actual = ordenesActuales.find(o => o.id === id)
  if (actual?.pending) {
    await removePending(id)
    return {
      ordenes:     ordenesActuales.filter(o => o.id !== id),
      ultimoFolio,
    }
  }

  try {
    const { error } = await supabase
      .from('ordenes')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      ordenes:     ordenesActuales.filter(o => o.id !== id),
      ultimoFolio,
    }
  } catch (err) {
    console.error('[storage] eliminarOrden:', err)
    throw err
  }
}
