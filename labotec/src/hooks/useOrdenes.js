import { useState, useEffect, useRef } from 'react'
import { cargarDB, agregarOrden, eliminarOrden } from '@/services/storage'
import { getFechaHoy }  from '@/utils/fecha'
import { generarFolio } from '@/utils/folio'
import { hashSimple }   from '@/utils/hash'
import { getTipo }      from '@/config/marca'

// ─────────────────────────────────────────────────────────────
//  Clave del borrador en localStorage
// ─────────────────────────────────────────────────────────────
const DRAFT_KEY = 'labotec-borrador-v1'

function guardarBorrador(draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) } catch {}
}

function cargarBorrador() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function limpiarBorrador() {
  try { localStorage.removeItem(DRAFT_KEY) } catch {}
}

// ─────────────────────────────────────────────────────────────
//  HOOK PRINCIPAL
// ─────────────────────────────────────────────────────────────
export function useOrdenes() {
  const [pantalla,     setPantalla]     = useState('inicio')
  const [cargando,     setCargando]     = useState(true)
  const [db,           setDb]           = useState({ ordenes:[], ultimoFolio:1000 })
  const [ordenActual,  setOrdenActual]  = useState(null)
  const [tipo,         setTipo]         = useState('')
  const [folio,        setFolio]        = useState('')
  const [responsable,  setResponsable]  = useState('')
  const [razonSocial,  setRazonSocial]  = useState('')
  const [direccion,    setDireccion]    = useState('')
  const [horaInicio,   setHoraInicio]   = useState('')
  const [horaFin,      setHoraFin]      = useState('')
  const [equipo,       setEquipo]       = useState('')
  const [serie,        setSerie]        = useState('')
  const [actividades,  setActividades]  = useState([''])
  const [refacciones,  setRefacciones]  = useState([{codigo:'',nombre:'',motivo:''}])
  const [comentarios,  setComentarios]  = useState('')
  const [busqueda,     setBusqueda]     = useState('')
  const [filtroTipo,   setFiltroTipo]   = useState('todos')
  const [paraEliminar, setParaEliminar] = useState(null)
  const [tieneBorrador, setTieneBorrador] = useState(false)

  const fecha        = getFechaHoy()
  const guardandoRef = useRef(false)

  // ── Cargar BD al iniciar ──
  useEffect(() => {
    cargarDB().then(d => {
      setDb(d)
      // Verificar si existe un borrador guardado
      const draft = cargarBorrador()
      if (draft?.tipo) setTieneBorrador(true)
      setCargando(false)
    })
  }, [])

  // ── Guardar borrador automáticamente cuando cambian los campos ──
  useEffect(() => {
    if (pantalla !== 'form') return          // solo guardar si está en el form
    if (guardandoRef.current) return
    guardandoRef.current = true

    const draft = { tipo, folio, responsable, razonSocial, direccion,
                    horaInicio, horaFin, equipo, serie,
                    actividades, refacciones, comentarios }

    // Solo guardar si hay algo escrito (evitar guardar form vacío)
    const hayContenido = responsable || razonSocial || equipo || serie ||
                         actividades.some(a => a.trim())
    if (hayContenido) {
      guardarBorrador(draft)
    }

    guardandoRef.current = false
  }, [pantalla, tipo, folio, responsable, razonSocial, direccion,
      horaInicio, horaFin, equipo, serie, actividades, refacciones, comentarios])

  // ── Iniciar formulario nuevo ──
  function iniciar(t) {
    const { folio:f } = generarFolio(db.ultimoFolio)
    setFolio(f); setTipo(t)
    setResponsable(''); setRazonSocial(''); setDireccion('')
    setHoraInicio(''); setHoraFin(''); setEquipo(''); setSerie('')
    setActividades(['']); setRefacciones([{codigo:'',nombre:'',motivo:''}])
    setComentarios(''); limpiarBorrador(); setPantalla('form')
  }

  // ── Restaurar borrador ──
  function restaurarBorrador() {
    const draft = cargarBorrador()
    if (!draft) return
    setTipo(draft.tipo || '')
    setFolio(draft.folio || generarFolio(db.ultimoFolio).folio)
    setResponsable(draft.responsable  || '')
    setRazonSocial(draft.razonSocial  || '')
    setDireccion(draft.direccion      || '')
    setHoraInicio(draft.horaInicio    || '')
    setHoraFin(draft.horaFin          || '')
    setEquipo(draft.equipo            || '')
    setSerie(draft.serie              || '')
    setActividades(draft.actividades?.length ? draft.actividades : [''])
    setRefacciones(draft.refacciones?.length ? draft.refacciones : [{codigo:'',nombre:'',motivo:''}])
    setComentarios(draft.comentarios  || '')
    setTieneBorrador(false)
    setPantalla('form')
  }

  // ── Descartar borrador ──
  function descartarBorrador() {
    limpiarBorrador()
    setTieneBorrador(false)
  }

  // ── Generar y guardar orden ──
  async function generar(firmaRespURL, firmaIngURL) {
    if (!responsable||!razonSocial||!direccion||!horaInicio||!horaFin||!equipo||!serie) {
      alert('Completa todos los campos obligatorios (*)'); return
    }
    const acts = actividades.filter(a => a.trim())
    if (!acts.length) { alert('Agrega al menos una actividad.'); return }
    const tc      = getTipo(tipo)
    const refs    = tc.showRefacciones ? refacciones.filter(r=>r.codigo||r.nombre||r.motivo) : []
    const payload = `https://ordenes-servicio-labotec.netlify.app/verificar/${folio}`
    const { numero } = generarFolio(db.ultimoFolio)
    const ord = {
      id:Date.now().toString(), folio, tipo, fecha, fechaISO:new Date().toISOString(),
      responsable, razonSocial, direccion, horaInicio, horaFin, equipo, serie,
      actividades:acts, refacciones:refs, comentarios:comentarios.trim(),
      firmaResp:firmaRespURL, firmaIng:firmaIngURL,
      qrPayload:payload, qrHash:`Verificar en: ${payload}`
    }
    // Limpiar borrador al generar exitosamente
    limpiarBorrador()
    const newDb = await agregarOrden(db.ordenes, ord, numero)
    setDb(newDb); setOrdenActual(ord); setPantalla('orden'); window.scrollTo(0,0)
  }

  // ── Eliminar orden ──
  async function eliminar(id) {
    const newDb = await eliminarOrden(db.ordenes, id, db.ultimoFolio)
    setDb(newDb); setParaEliminar(null)
    if (pantalla==='detalle') setPantalla('historial')
  }

  const ordenesFiltradas = db.ordenes.filter(o => {
    const q = busqueda.toLowerCase()
    return (filtroTipo==='todos'||o.tipo===filtroTipo) &&
      (!q||[o.folio,o.responsable,o.razonSocial,o.equipo,o.serie].some(v=>v?.toLowerCase().includes(q)))
  })

  return {
    pantalla, setPantalla, cargando, db,
    ordenActual, setOrdenActual,
    tipo, folio, fecha,
    responsable, setResponsable, razonSocial, setRazonSocial,
    direccion, setDireccion, horaInicio, setHoraInicio, horaFin, setHoraFin,
    equipo, setEquipo, serie, setSerie,
    actividades, setActividades, refacciones, setRefacciones,
    comentarios, setComentarios,
    busqueda, setBusqueda, filtroTipo, setFiltroTipo,
    ordenesFiltradas, paraEliminar, setParaEliminar,
    tieneBorrador, restaurarBorrador, descartarBorrador,
    iniciar, generar, eliminar,
  }
}