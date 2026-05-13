import NavBar         from '@/components/layout/NavBar'
import DocumentoOrden  from '@/components/document/DocumentoOrden'
import ModalEliminar   from '@/components/common/ModalEliminar'
import BtnPDF          from '@/components/common/BtnPDF'
import styles           from './Detalle.module.css'

export default function Detalle({ ctx }) {
  const { ordenActual, setPantalla, paraEliminar, setParaEliminar, eliminar } = ctx
  return (
    <div className={styles.page}>
      <NavBar back={()=>setPantalla('historial')} backLabel="← Historial"
        extra={
          <>
            <button className={styles.btnInicio} onClick={()=>setPantalla('inicio')}>⌂ Inicio</button>
            <BtnPDF ord={ordenActual} />
            <button className={styles.btnEliminar} onClick={()=>setParaEliminar(ordenActual.id)}>🗑 Eliminar</button>
          </>
        } />
      <div className={styles.body}>
        <div className={styles.docWrap}><DocumentoOrden ord={ordenActual} /></div>
      </div>
      {paraEliminar && <ModalEliminar onCancel={()=>setParaEliminar(null)} onConfirm={()=>eliminar(paraEliminar)} />}
    </div>
  )
}
