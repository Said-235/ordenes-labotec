import { useState, useEffect, useRef, useMemo } from 'react'
import { cargarDB, agregarOrden, eliminarOrden, sincronizarPendientes } from '@/services/storage'
import { getFechaHoy }  from '@/utils/fecha'
import { nuevoId }      from '@/utils/id'
import { getTipo }      from '@/config/marca'

const DRAFT_KEY = 'labotec-borrador-v1'
const FOLIO_FORM = 'Se asigna al guardar'

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

function unicos(ordenes, key) {
  return [...new Set(ordenes.map(o => o[key]).filter(v => typeof v === 'string' && v.trim()))]
}

export function useOrdenes() {
  const [pantalla,     setPantalla]     = useState('inicio')
  const [cargando,     setCargando]     = useState(true)
  const [guardando,    setGuardando]    = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [db,           setDb]           = useState({ ordenes:[], ultimoFolio:1000 })
  const [ordenActual,  setOrdenActual]  = useState(null)
  const [tipo,         setTipo]         = useState('')
  const [folio,        setFolio]        = useState(FOLIO_FORM)
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
  const syncingRef   = useRef(false)
  const dbRef        = useRef(db)
  dbRef.current = db

  useEffect(() => {
    cargarDB().then(d => {
      setDb(d)
      const draft = cargarBorrador()
      if (draft?.tipo) setTieneBorrador(true)
      setCargando(false)
    })
  }, [])

  async function flushPendientes() {
    if (syncingRef.current) return
    if (typeof navigator !== 'undefined' && !navigator.onLine) return
    const hay = dbRef.current.ordenes.some(o => o.pending)
    if (!hay) return
    syncingRef.current = true
    setSincronizando(true)
    try {
      const res = await sincronizarPendientes(dbRef.current.ordenes, dbRef.current.ultimoFolio)
      setDb({
        ordenes: res.ordenes,
        ultimoFolio: res.ultimoFolio ?? dbRef.current.ultimoFolio,
      })
      setOrdenActual(prev => {
        if (!prev) return prev
        const updated = res.ordenes.find(o => o.id === prev.id)
        return updated || prev
      })
    } finally {
      syncingRef.current = false
      setSincronizando(false)
    }
  }

  useEffect(() => {
    const onOnline = () => { flushPendientes() }
    const onVis = () => {
      if (document.visibilityState === 'visible') flushPendientes()
    }
    window.addEventListener('online', onOnline)
    document.addEventListener('visibilitychange', onVis)
    if (navigator.onLine) flushPendientes()
    return () => {
      window.removeEventListener('online', onOnline)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  useEffect(() => {
    if (pantalla !== 'form') return
    if (guardandoRef.current) return
    guardandoRef.current = true

    const draft = { tipo, folio, responsable, razonSocial, direccion,
                    horaInicio, horaFin, equipo, serie,
                    actividades, refacciones, comentarios }

    const hayContenido = responsable || razonSocial || equipo || serie ||
                         actividades.some(a => a.trim())
    if (hayContenido) {
      guardarBorrador(draft)
    }

    guardandoRef.current = false
  }, [pantalla, tipo, folio, responsable, razonSocial, direccion,
      horaInicio, horaFin, equipo, serie, actividades, refacciones, comentarios])

  function iniciar(t) {
    setFolio(FOLIO_FORM); setTipo(t)
    setResponsable(''); setRazonSocial(''); setDireccion('')
    setHoraInicio(''); setHoraFin(''); setEquipo(''); setSerie('')
    setActividades(['']); setRefacciones([{codigo:'',nombre:'',motivo:''}])
    setComentarios(''); limpiarBorrador(); setPantalla('form')
  }

  function restaurarBorrador() {
    const draft = cargarBorrador()
    if (!draft) return
    setTipo(draft.tipo || '')
    setFolio(FOLIO_FORM)
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

  function descartarBorrador() {
    limpiarBorrador()
    setTieneBorrador(false)
  }

  async function generar(firmaRespURL, firmaIngURL) {
    if (guardando) return
    if (!responsable||!razonSocial||!direccion||!horaInicio||!horaFin||!equipo||!serie) {
      alert('Completa todos los campos obligatorios (*)'); return
    }
    const acts = actividades.filter(a => a.trim())
    if (!acts.length) { alert('Agrega al menos una actividad.'); return }
    const tc      = getTipo(tipo)
    const refs    = tc.showRefacciones ? refacciones.filter(r=>r.codigo||r.nombre||r.motivo) : []
    const ord = {
      id: nuevoId(), folio: 'PENDIENTE', pending: true, tipo, fecha, fechaISO: new Date().toISOString(),
      responsable, razonSocial, direccion, horaInicio, horaFin, equipo, serie,
      actividades:acts, refacciones:refs, comentarios:comentarios.trim(),
      firmaResp:firmaRespURL, firmaIng:firmaIngURL,
      qrPayload: '', qrHash: '',
    }

    setGuardando(true)
    try {
      limpiarBorrador()
      const newDb = await agregarOrden(db.ordenes, ord)
      if (newDb.ultimoFolio != null) {
        setDb({ ordenes: newDb.ordenes, ultimoFolio: newDb.ultimoFolio })
      } else {
        setDb(prev => ({ ...prev, ordenes: newDb.ordenes }))
      }
      setOrdenActual(newDb.saved || newDb.ordenes[0])
      setPantalla('orden')
      window.scrollTo(0,0)
      if (newDb.queued) {
        alert('Sin conexión con la base. La orden quedó pendiente y se subirá al recuperar señal.')
      }
    } catch (err) {
      console.error('[useOrdenes] generar:', err)
      alert('No se pudo guardar la orden. Revisa la conexión e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id) {
    try {
      const newDb = await eliminarOrden(db.ordenes, id, db.ultimoFolio)
      setDb(newDb); setParaEliminar(null)
      if (pantalla==='detalle') setPantalla('historial')
    } catch (err) {
      console.error('[useOrdenes] eliminar:', err)
      alert('No se pudo eliminar la orden.')
    }
  }

  const sugerencias = useMemo(() => ({
    responsable: unicos(db.ordenes, 'responsable'),
    razonSocial: unicos(db.ordenes, 'razonSocial'),
    direccion:   unicos(db.ordenes, 'direccion'),
    equipo:      unicos(db.ordenes, 'equipo'),
    serie:       unicos(db.ordenes, 'serie'),
  }), [db.ordenes])

  const pendientes = db.ordenes.filter(o => o.pending).length

  const ordenesFiltradas = db.ordenes.filter(o => {
    const q = busqueda.toLowerCase()
    return (filtroTipo==='todos'||o.tipo===filtroTipo) &&
      (!q||[o.folio,o.responsable,o.razonSocial,o.equipo,o.serie].some(v=>v?.toLowerCase().includes(q)))
  })

  return {
    pantalla, setPantalla, cargando, guardando, sincronizando, db,
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
    iniciar, generar, eliminar, sugerencias, pendientes, flushPendientes,
  }
}
