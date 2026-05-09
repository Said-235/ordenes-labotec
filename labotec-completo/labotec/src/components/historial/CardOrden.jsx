import Tag            from '@/components/common/Tag'
import BtnPDF         from '@/components/common/BtnPDF'
import { getTipo }    from '@/config/marca'
import { getFechaCorta } from '@/utils/fecha'
import styles            from './CardOrden.module.css'

export default function CardOrden({ ord, busqueda, onVer, onEliminar }) {
  const tipoConfig = getTipo(ord.tipo)

  function hl(txt) {
    const q = busqueda.toLowerCase(); if (!q||!txt) return txt
    const i = txt.toLowerCase().indexOf(q); if (i<0) return txt
    return <span>{txt.slice(0,i)}<mark className={styles.mark}>{txt.slice(i,i+q.length)}</mark>{txt.slice(i+q.length)}</span>
  }

  return (
    <div className={styles.card} onClick={onVer}>
      <div className={styles.tipoCol}>
        <span className={styles.tipoIcon}>{tipoConfig.icon}</span>
        <span className={styles.tipoBadge} style={{color:tipoConfig.color}}>{tipoConfig.code}</span>
      </div>
      <div className={styles.info}>
        <div className={styles.fila1}>
          <span className={styles.folio}>{hl(ord.folio)}</span>
          <span className={styles.fecha}>{getFechaCorta(ord.fechaISO)}</span>
        </div>
        <p className={styles.responsable}>{hl(ord.responsable)}</p>
        <div className={styles.fila3}>
          <span className={styles.meta}>{hl(ord.razonSocial)}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.meta}>{hl(ord.equipo)}</span>
          <span className={styles.dot}>·</span>
          <span className={`${styles.meta} ${styles.metaMono}`}>{hl(ord.serie)}</span>
        </div>
        <div className={styles.tags}>
          <Tag variante="cyan">{ord.actividades.length} act.</Tag>
          {ord.refacciones?.length>0 && <Tag variante="naranja">{ord.refacciones.length} refac.</Tag>}
          {(ord.firmaResp||ord.firmaIng) && <Tag variante="verde">✍ Firmada</Tag>}
        </div>
      </div>
      <div className={styles.acciones} onClick={e=>e.stopPropagation()}>
        <button className={styles.btnVer} onClick={onVer}>Ver →</button>
        <BtnPDF ord={ord} sm />
        <button className={styles.btnEliminar} onClick={onEliminar}>Eliminar</button>
      </div>
    </div>
  )
}
