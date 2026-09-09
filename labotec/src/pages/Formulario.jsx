import NavBar      from '@/components/layout/NavBar'
import FirmaCanvas, { firmaEstaVacia, firmaDataURL } from '@/components/form/FirmaCanvas'
import CampoSuggest from '@/components/form/CampoSuggest'
import CampoHora from '@/components/form/CampoHora'
import { getTipo }  from '@/config/marca'
import styles from './Formulario.module.css'

export default function Formulario({ ctx }) {
  const {
    tipo, folio, fecha, setPantalla,
    responsable, setResponsable, razonSocial, setRazonSocial,
    direccion, setDireccion, horaInicio, setHoraInicio, horaFin, setHoraFin,
    equipo, setEquipo, serie, setSerie,
    actividades, setActividades, refacciones, setRefacciones,
    comentarios, setComentarios, generar, guardando, sugerencias,
  } = ctx

  const tipoConfig = getTipo(tipo)
  const { color, colorBg, code, showRefacciones } = tipoConfig

  function handleGenerar() {
    const fR = !firmaEstaVacia('firma-responsable') ? firmaDataURL('firma-responsable') : null
    const fI = !firmaEstaVacia('firma-ingeniero')   ? firmaDataURL('firma-ingeniero')   : null
    generar(fR, fI)
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

        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>01 · Datos Generales</h2>
          <div className={styles.grid2}>
            <Campo label="Fecha de creación"><input className={`${styles.input} ${styles.inputReadonly}`} value={fecha} readOnly /></Campo>
            <Campo label="Folio"><input className={`${styles.input} ${styles.inputFolio}`} value={folio} readOnly /></Campo>
          </div>
          <CampoSuggest
            listId="sug-responsable" label="Responsable de laboratorio *"
            placeholder="Nombre completo" value={responsable} onChange={setResponsable}
            options={sugerencias.responsable} />
          <CampoSuggest
            listId="sug-razon" label="Razón social del cliente *"
            placeholder="Empresa o institución" value={razonSocial} onChange={setRazonSocial}
            options={sugerencias.razonSocial} />
          <CampoSuggest
            listId="sug-direccion" label="Dirección donde se realizó el servicio *"
            placeholder="Calle, número, colonia, ciudad" value={direccion} onChange={setDireccion}
            options={sugerencias.direccion} />
          <div className={styles.grid2}>
            <CampoHora label="Hora de inicio *" value={horaInicio} onChange={setHoraInicio} />
            <CampoHora label="Hora de término *" value={horaFin} onChange={setHoraFin} />
          </div>
        </section>

        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>02 · Datos del Equipo</h2>
          <CampoSuggest
            listId="sug-equipo" label="Equipo con servicio *"
            placeholder="Nombre y modelo del equipo" value={equipo} onChange={setEquipo}
            options={sugerencias.equipo} />
          <CampoSuggest
            listId="sug-serie" label="Número de serie *"
            placeholder="S/N · Número de serie" value={serie} onChange={setSerie}
            options={sugerencias.serie} />
        </section>

        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>03 · Actividades Realizadas</h2>
          {actividades.map((a,i) => (
            <div key={i} className={styles.filaItem}>
              <input className={`${styles.input} ${styles.inputFlex}`} placeholder="Descripción de la actividad" value={a} onChange={e=>setActividades(v=>v.map((x,j)=>j===i?e.target.value:x))} />
              <button className={styles.btnRemover} type="button" onClick={()=>setActividades(v=>v.length>1?v.filter((_,j)=>j!==i):[''])}>×</button>
            </div>
          ))}
          <button className={styles.btnAgregar} type="button" onClick={()=>setActividades(v=>[...v,''])}>+ Agregar actividad</button>
        </section>

        {showRefacciones && (
          <section className={styles.seccion}>
            <h2 className={styles.secTitulo}>04 · Refacciones Utilizadas</h2>
            {refacciones.map((r,i) => (
              <div key={i} className={`${styles.filaItem} ${styles.filaRefaccion}`}>
                <input className={`${styles.input} ${styles.inputCodigo}`}  placeholder="Código"              value={r.codigo} onChange={e=>setRefacciones(v=>v.map((x,j)=>j===i?{...x,codigo:e.target.value}:x))} />
                <input className={`${styles.input} ${styles.inputNombre}`}  placeholder="Nombre de refacción" value={r.nombre} onChange={e=>setRefacciones(v=>v.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} />
                <input className={`${styles.input} ${styles.inputMotivo}`}  placeholder="Motivo de utilización" value={r.motivo} onChange={e=>setRefacciones(v=>v.map((x,j)=>j===i?{...x,motivo:e.target.value}:x))} />
                <button className={styles.btnRemover} type="button" onClick={()=>setRefacciones(v=>v.length>1?v.filter((_,j)=>j!==i):[{codigo:'',nombre:'',motivo:''}])}>×</button>
              </div>
            ))}
            <button className={styles.btnAgregar} type="button" onClick={()=>setRefacciones(v=>[...v,{codigo:'',nombre:'',motivo:''}])}>+ Agregar refacción</button>
          </section>
        )}

        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>{showRefacciones?'05':'04'} · Comentarios y Pendientes</h2>
          <Campo label="Observaciones, pendientes o notas adicionales (opcional)">
            <textarea className={`${styles.input} ${styles.textarea}`} placeholder="Escribe aquí cualquier observación relevante, trabajo pendiente o recomendación..." value={comentarios} onChange={e=>setComentarios(e.target.value)} rows={4} />
          </Campo>
        </section>

        <section className={styles.seccion}>
          <h2 className={styles.secTitulo}>{showRefacciones?'06':'05'} · Firmas Digitales</h2>
          <div className={styles.grid2}>
            <FirmaCanvas id="firma-responsable" label="Firma del Responsable de Laboratorio" />
            <FirmaCanvas id="firma-ingeniero"   label="Firma del Ingeniero de Servicio" />
          </div>
        </section>

        <button className={styles.btnGenerar} type="button" onClick={handleGenerar} disabled={guardando}>
          {guardando ? 'Guardando…' : '🗂 GENERAR ORDEN DE SERVICIO'}
        </button>
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
