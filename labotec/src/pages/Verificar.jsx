import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabase.js'
import styles from './Verificar.module.css'

// ─────────────────────────────────────────────────────────────
//  Página pública de verificación
//  URL: /verificar/:folio
//  Acceso: sin login — cualquier persona con el link
//  Muestra: folio + confirmación oficial
// ─────────────────────────────────────────────────────────────

const ESTADOS = {
  CARGANDO:   'cargando',
  VERIFICADO: 'verificado',
  NO_EXISTE:  'no_existe',
  ERROR:      'error',
}

const TIPO_LABEL = {
  preventivo:   'Mantenimiento Preventivo',
  correctivo:   'Mantenimiento Correctivo',
  capacitacion: 'Capacitación',
  instalacion:  'Instalación de Equipo',
}

const TIPO_ICON = {
  preventivo:   '🛡️',
  correctivo:   '⚡',
  capacitacion: '🎓',
  instalacion:  '🔩',
}

export default function Verificar({ folio }) {
  const [estado, setEstado] = useState(ESTADOS.CARGANDO)
  const [orden,  setOrden]  = useState(null)

  useEffect(() => {
    if (!folio) { setEstado(ESTADOS.NO_EXISTE); return }

    supabase
      .from('ordenes')
      .select('folio, tipo, fecha, responsable, razon_social, equipo, serie')
      .eq('folio', folio)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { setEstado(ESTADOS.NO_EXISTE); return }
        setOrden(data)
        setEstado(ESTADOS.VERIFICADO)
      })
      .catch(() => setEstado(ESTADOS.ERROR))
  }, [folio])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoWrap}>
          <span className={styles.logoIcon}>🔧</span>
          <div>
            <p className={styles.logoNombre}>LABOTEC ENGINEERING</p>
            <p className={styles.logoSub}>Engineering Services</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {estado === ESTADOS.CARGANDO && <Cargando />}
        {estado === ESTADOS.VERIFICADO && orden && <Verificado orden={orden} />}
        {estado === ESTADOS.NO_EXISTE  && <NoExiste folio={folio} />}
        {estado === ESTADOS.ERROR      && <Error />}
      </main>

      <footer className={styles.footer}>
        <p>© LABOTEC Engineering Services · Sistema de Órdenes de Servicio</p>
        <p>www.ingenierialabotec.com.mx</p>
      </footer>
    </div>
  )
}

// ── Sub-componentes ──────────────────────────────────────────

function Cargando() {
  return (
    <div className={styles.card}>
      <div className={styles.spinner} />
      <p className={styles.cargandoTxt}>Verificando orden...</p>
    </div>
  )
}

function Verificado({ orden }) {
  return (
    <div className={`${styles.card} ${styles.cardVerificado}`}>

      {/* Sello superior */}
      <div className={styles.selloWrap}>
        <div className={styles.sello}>✔</div>
        <div>
          <h1 className={styles.selloTitulo}>Servicio Oficial Verificado</h1>
          <p className={styles.selloDesc}>
            Esta orden fue emitida por LABOTEC Engineering Services
          </p>
        </div>
      </div>

      {/* Folio destacado */}
      <div className={styles.folioBox}>
        <span className={styles.folioLabel}>No. de Orden</span>
        <span className={styles.folioNum}>{orden.folio}</span>
      </div>

      {/* Tipo de servicio */}
      <div className={styles.tipoBadge}>
        <span>{TIPO_ICON[orden.tipo]}</span>
        <span>{TIPO_LABEL[orden.tipo] || orden.tipo}</span>
      </div>

      {/* Datos de la orden */}
      <div className={styles.datos}>
        <Dato label="Fecha"          valor={orden.fecha} />
        <Dato label="Responsable"    valor={orden.responsable} />
        <Dato label="Razón Social"   valor={orden.razon_social} />
        <Dato label="Equipo"         valor={orden.equipo} />
        <Dato label="No. de Serie"   valor={orden.serie} mono />
      </div>

      {/* Nota de autenticidad */}
      <p className={styles.nota}>
        Este código QR valida que la orden <strong>{orden.folio}</strong> fue
        generada y registrada oficialmente en el sistema de LABOTEC Engineering Services.
      </p>

    </div>
  )
}

function NoExiste({ folio }) {
  return (
    <div className={`${styles.card} ${styles.cardError}`}>
      <span className={styles.errorIcon}>⚠️</span>
      <h1 className={styles.errorTitulo}>Orden no encontrada</h1>
      <p className={styles.errorDesc}>
        No existe ninguna orden con el folio{' '}
        <strong>{folio || 'desconocido'}</strong> en nuestro sistema.
      </p>
      <p className={styles.errorDesc}>
        Este QR puede ser inválido o no corresponder a un servicio oficial de LABOTEC.
      </p>
      <div className={styles.contacto}>
        <p>¿Tienes dudas? Contáctanos:</p>
        <p><strong>55 5966 0022</strong> · <strong>56 1901 5418</strong></p>
        <p>contacto@ingenieria.labotec.com.mx</p>
      </div>
    </div>
  )
}

function Error() {
  return (
    <div className={`${styles.card} ${styles.cardError}`}>
      <span className={styles.errorIcon}>❌</span>
      <h1 className={styles.errorTitulo}>Error de conexión</h1>
      <p className={styles.errorDesc}>
        No fue posible verificar la orden en este momento.
        Por favor intenta de nuevo en unos segundos.
      </p>
    </div>
  )
}

function Dato({ label, valor, mono }) {
  return (
    <div className={styles.dato}>
      <span className={styles.datoLabel}>{label}</span>
      <span className={`${styles.datoValor} ${mono ? styles.mono : ''}`}>{valor || '—'}</span>
    </div>
  )
}