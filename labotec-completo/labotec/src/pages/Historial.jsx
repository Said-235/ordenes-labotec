import NavBar       from '@/components/layout/NavBar'
import Buscador      from '@/components/historial/Buscador'
import CardOrden     from '@/components/historial/CardOrden'
import ModalEliminar from '@/components/common/ModalEliminar'
import styles         from './Historial.module.css'

export default function Historial({ ctx }) {
  const { db, setPantalla, iniciar, busqueda, setBusqueda, filtroTipo, setFiltroTipo,
          ordenesFiltradas, setOrdenActual, paraEliminar, setParaEliminar, eliminar } = ctx
  return (
    <div className={styles.page}>
      <NavBar back={()=>setPantalla('inicio')} backLabel="← Inicio"
        extra={<button className={styles.btnNueva} onClick={()=>iniciar('preventivo')}>+ Nueva orden</button>} />
      <div className={styles.body}>
        <Buscador busqueda={busqueda} setBusqueda={setBusqueda} filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} total={ordenesFiltradas.length} />
        {ordenesFiltradas.length===0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>{busqueda?'🔍':'📋'}</span>
            <p className={styles.emptyTitulo}>{busqueda?'Sin resultados':'No hay órdenes aún'}</p>
            <p className={styles.emptyDesc}>{busqueda?`No hay órdenes para "${busqueda}"`:'Crea tu primera orden de servicio.'}</p>
          </div>
        ) : (
          <div className={styles.lista}>
            {ordenesFiltradas.map(ord => (
              <CardOrden key={ord.id} ord={ord} busqueda={busqueda}
                onVer={()=>{setOrdenActual(ord);setPantalla('detalle')}}
                onEliminar={()=>setParaEliminar(ord.id)} />
            ))}
          </div>
        )}
      </div>
      {paraEliminar && <ModalEliminar onCancel={()=>setParaEliminar(null)} onConfirm={()=>eliminar(paraEliminar)} />}
    </div>
  )
}
