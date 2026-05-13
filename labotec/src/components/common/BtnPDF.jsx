import { usePDF } from '@/hooks/usePDF'
import styles from './BtnPDF.module.css'

export default function BtnPDF({ ord, sm = false }) {
  const { generarPDF, generando } = usePDF()
  return (
    <button
      className={`${styles.btn} ${sm ? styles.btnSm : ''} ${generando ? styles.cargando : ''}`}
      onClick={() => generarPDF(ord)}
      disabled={generando}
      title={`Descargar ${ord?.folio} como PDF`}
    >
      {generando ? (
        <><span className={styles.spinner} />{!sm && 'Generando PDF...'}</>
      ) : (
        <><span className={styles.icon}>⬇</span>{!sm && 'Descargar PDF'}</>
      )}
    </button>
  )
}
