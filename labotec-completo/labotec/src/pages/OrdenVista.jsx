import NavBar         from '@/components/layout/NavBar'
import DocumentoOrden from '@/components/document/DocumentoOrden'
import BtnPDF         from '@/components/common/BtnPDF'
import styles          from './OrdenVista.module.css'

export default function OrdenVista({ ctx }) {
  const { ordenActual, setPantalla } = ctx
  return (
    <div className={styles.page}>
      <NavBar back={() => setPantalla('inicio')} backLabel="⌂ Inicio"
        extra={
          <>
            <button className={styles.btnHistorial} onClick={()=>setPantalla('historial')}>📋 Historial</button>
            <BtnPDF ord={ordenActual} />
            <span className={styles.badge}>✓ Guardada</span>
          </>
        } />
      <div className={styles.body}>
        <div className={styles.docWrap}><DocumentoOrden ord={ordenActual} /></div>
      </div>
    </div>
  )
}
