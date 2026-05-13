import NavBar      from '@/components/layout/NavBar'
import FirmaCanvas, { firmaEstaVacia } from '@/components/form/FirmaCanvas'
import { getTipo }  from '@/config/marca'
import styles from './Formulario.module.css'

export default function Formulario({ ctx }) {
  const {
    tipo, folio, fecha, setPantalla,
    responsable, setResponsable, razonSocial, setRazonSocial,
    direccion, setDireccion, horaInicio, setHoraInicio, horaFin, setHoraFin,
    equipo, setEquipo, serie, setSerie,
    actividades, setActividades, refacciones, setRefacciones,
    comentarios, setComentarios, generar,
  } = ctx

  const tipoConfig = getTipo(tipo)
  const { color, colorBg, label:tipoLabel, code, showRefacciones } = tipoConfig

  function handleGenerar() {
    const fR = !firmaEstaVacia('firma-responsable') ? document.getElementById('firma-responsable').toDataURL() : null
    const fI = !firmaEstaVacia('firma-ingeniero')   ? document.getElementById('firma-ingeniero').toDataURL()   : null
    generar(fR, fI)
  }

  // Calcular AM/PM a partir del valor 24h
  function getAmPm(val) {
    if (!val) return ''
    const h = parseInt(val.split(':')[0])
    return h >= 12 ? 'PM' : 'AM'
  }

  return (
    <div className={styles.page}>
      <NavBar back={() => setPantalla('inicio')} backLabel="← Inicio"
        extra={
          <>
            <span className={styles.tipoBadge} style={{color, borderColor:color+'50', background:colorBg}}>{tipoConfig.icon} {code} · {folio}</span>
            <span className={styles.autoGuardado}>💾 Auto-guardando</span>
          </>
        } />

      <div className={styles.body}>

        {/* 01 Datos Generales */}
        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>01 · Datos Generales</h2>
          <div className={styles.grid2}>
            <Campo label="Fecha de creación"><input className={`${styles.input} ${styles.inputReadonly}`} value={fecha} readOnly /></Campo>
            <Campo label="Folio"><input className={`${styles.input} ${styles.inputFolio}`} value={folio} readOnly /></Campo>
          </div>
          <Campo label="Responsable de laboratorio *"><input className={styles.input} placeholder="Nombre completo" value={responsable} onChange={e=>setResponsable(e.target.value)} /></Campo>
          <Campo label="Razón social del cliente *"><input className={styles.input} placeholder="Empresa o institución" value={razonSocial} onChange={e=>setRazonSocial(e.target.value)} /></Campo>
          <Campo label="Dirección donde se realizó el servicio *"><input className={styles.input} placeholder="Calle, número, colonia, ciudad" value={direccion} onChange={e=>setDireccion(e.target.value)} /></Campo>
          <div className={styles.grid2}>
            <Campo label="Hora de inicio *">
              <div className={styles.horaWrap}>
                <input className={styles.inputHora} type="time" value={horaInicio} onChange={e=>setHoraInicio(e.target.value)} />
                {getAmPm(horaInicio) && <span className={`${styles.ampmLabel} ${getAmPm(horaInicio)==='PM'?styles.pm:styles.am}`}>{getAmPm(horaInicio)}</span>}
              </div>
            </Campo>
            <Campo label="Hora de término *">
              <div className={styles.horaWrap}>
                <input className={styles.inputHora} type="time" value={horaFin} onChange={e=>setHoraFin(e.target.value)} />
                {getAmPm(horaFin) && <span className={`${styles.ampmLabel} ${getAmPm(horaFin)==='PM'?styles.pm:styles.am}`}>{getAmPm(horaFin)}</span>}
              </div>
            </Campo>
          </div>
        </section>

        {/* 02 Equipo */}
        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>02 · Datos del Equipo</h2>
          <Campo label="Equipo con servicio *"><input className={styles.input} placeholder="Nombre y modelo del equipo" value={equipo} onChange={e=>setEquipo(e.target.value)} /></Campo>
          <Campo label="Número de serie *"><input className={styles.input} placeholder="S/N · Número de serie" value={serie} onChange={e=>setSerie(e.target.value)} /></Campo>
        </section>

        {/* 03 Actividades */}
        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>03 · Actividades Realizadas</h2>
          {actividades.map((a,i) => (
            <div key={i} className={styles.filaItem}>
              <input className={`${styles.input} ${styles.inputFlex}`} placeholder="Descripción de la actividad" value={a} onChange={e=>setActividades(v=>v.map((x,j)=>j===i?e.target.value:x))} />
              <button className={styles.btnRemover} onClick={()=>setActividades(v=>v.length>1?v.filter((_,j)=>j!==i):[''])}>×</button>
            </div>
          ))}
          <button className={styles.btnAgregar} onClick={()=>setActividades(v=>[...v,''])}>+ Agregar actividad</button>
        </section>

        {/* 04 Refacciones (condicional) */}
        {showRefacciones && (
          <section className={styles.seccion}>
            <h2 className={styles.secTitulo}>04 · Refacciones Utilizadas</h2>
            {refacciones.map((r,i) => (
              <div key={i} className={`${styles.filaItem} ${styles.filaRefaccion}`}>
                <input className={`${styles.input} ${styles.inputCodigo}`}  placeholder="Código"              value={r.codigo} onChange={e=>setRefacciones(v=>v.map((x,j)=>j===i?{...x,codigo:e.target.value}:x))} />
                <input className={`${styles.input} ${styles.inputNombre}`}  placeholder="Nombre de refacción" value={r.nombre} onChange={e=>setRefacciones(v=>v.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} />
                <input className={`${styles.input} ${styles.inputMotivo}`}  placeholder="Motivo de utilización" value={r.motivo} onChange={e=>setRefacciones(v=>v.map((x,j)=>j===i?{...x,motivo:e.target.value}:x))} />
                <button className={styles.btnRemover} onClick={()=>setRefacciones(v=>v.length>1?v.filter((_,j)=>j!==i):[{codigo:'',nombre:'',motivo:''}])}>×</button>
              </div>
            ))}
            <button className={styles.btnAgregar} onClick={()=>setRefacciones(v=>[...v,{codigo:'',nombre:'',motivo:''}])}>+ Agregar refacción</button>
          </section>
        )}

        {/* 05 Comentarios */}
        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>{showRefacciones?'05':'04'} · Comentarios y Pendientes</h2>
          <Campo label="Observaciones, pendientes o notas adicionales (opcional)">
            <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Escribe aquí cualquier observación relevante, trabajo pendiente o recomendación..." value={comentarios} onChange={e=>setComentarios(e.target.value)} rows={4} />
          </Campo>
        </section>

        {/* 06 Firmas */}
        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>{showRefacciones?'06':'05'} · Firmas Digitales</h2>
          <div className={styles.grid2}>
            <FirmaCanvas id="firma-responsable" label="Firma del Responsable de Laboratorio" />
            <FirmaCanvas id="firma-ingeniero"   label="Firma del Ingeniero de Servicio" />
          </div>
        </section>

        <button className={styles.btnGenerar} onClick={handleGenerar}>🗂 GENERAR ORDEN DE SERVICIO</button>
      </div>
    </div>
  )
}

function Campo({ label, children }) {
  return (
    <div className={styles.campo}>
      <label className={styles.campoLabel}>{label}</label>
      {children}
    </div>
  )
}
