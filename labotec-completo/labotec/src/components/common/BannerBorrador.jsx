import { getTipo } from '@/config/marca'
import styles from './BannerBorrador.module.css'

/**
 * Aparece en la pantalla de Inicio cuando existe un borrador guardado.
 * Le da al usuario la opción de recuperarlo o descartarlo.
 */
export default function BannerBorrador({ ctx }) {
  const { tieneBorrador, restaurarBorrador, descartarBorrador } = ctx

  if (!tieneBorrador) return null

  // Leer el tipo del borrador para mostrar info
  let tipoBorrador = null
  try {
    const raw = localStorage.getItem('labotec-borrador-v1')
    if (raw) {
      const draft = JSON.parse(raw)
      tipoBorrador = getTipo(draft.tipo)
    }
  } catch {}

  return (
    <div className={styles.banner}>
      <div className={styles.icono}>⚠️</div>
      <div className={styles.info}>
        <p className={styles.titulo}>Tienes un borrador sin guardar</p>
        <p className={styles.desc}>
          Se encontró una orden de <strong>{tipoBorrador?.label || 'servicio'}</strong> que no fue completada.
          ¿Deseas continuar donde la dejaste?
        </p>
      </div>
      <div className={styles.acciones}>
        <button className={styles.btnRecuperar} onClick={restaurarBorrador}>
          ↩ Continuar borrador
        </button>
        <button className={styles.btnDescartar} onClick={descartarBorrador}>
          Descartar
        </button>
      </div>
    </div>
  )
}
