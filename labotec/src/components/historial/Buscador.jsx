import styles from './Buscador.module.css'

export default function Buscador({ busqueda, setBusqueda, filtroTipo, setFiltroTipo, total }) {
  const FILTROS = [
    ['todos','Todos'], ['preventivo','🛡 Prev'], ['correctivo','⚡ Corr'],
    ['capacitacion','🎓 Cap'], ['instalacion','🔩 Inst'],
  ]
  return (
    <div className={styles.wrapper}>
      <p className={styles.titulo}>🔍 Buscador de Órdenes</p>
      <div className={styles.fila}>
        <div className={styles.inputWrap}>
          <span className={styles.icono}>⌕</span>
          <input className={styles.input} placeholder="Folio, responsable, equipo, razón social, serie..." value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
        </div>
        <div className={styles.filtros}>
          {FILTROS.map(([v,l]) => (
            <button key={v} className={`${styles.btnFiltro} ${filtroTipo===v?styles.activo:''}`} onClick={()=>setFiltroTipo(v)}>{l}</button>
          ))}
        </div>
      </div>
      {(busqueda||filtroTipo!=='todos') && (
        <div className={styles.resultado}>
          <span>{total} resultado(s)</span>
          <button className={styles.btnLimpiar} onClick={()=>{setBusqueda('');setFiltroTipo('todos')}}>✕ Limpiar</button>
        </div>
      )}
    </div>
  )
}
