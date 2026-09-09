import styles from './BannerPendientes.module.css'

export default function BannerPendientes({ ctx }) {
  const { pendientes, sincronizando, flushPendientes } = ctx
  if (!pendientes) return null

  return (
    <div className={styles.banner}>
      <div className={styles.info}>
        <p className={styles.titulo}>
          {sincronizando ? 'Subiendo órdenes…' : `${pendientes} orden${pendientes === 1 ? '' : 'es'} por subir`}
        </p>
        <p className={styles.desc}>
          Se guardaron en este dispositivo. El folio oficial se asigna al sincronizar.
        </p>
      </div>
      <button
        className={styles.btn}
        type="button"
        disabled={sincronizando || (typeof navigator !== 'undefined' && !navigator.onLine)}
        onClick={() => flushPendientes()}
      >
        {sincronizando ? 'Sincronizando…' : 'Subir ahora'}
      </button>
    </div>
  )
}
