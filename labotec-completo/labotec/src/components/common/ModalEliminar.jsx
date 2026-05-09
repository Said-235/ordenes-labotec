import styles from './ModalEliminar.module.css'
export default function ModalEliminar({ onCancel, onConfirm }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <span className={styles.icon}>🗑️</span>
        <h3 className={styles.titulo}>¿Eliminar esta orden?</h3>
        <p className={styles.desc}>Esta acción es permanente y no se puede deshacer.</p>
        <div className={styles.acciones}>
          <button className={styles.btnCancelar} onClick={onCancel}>Cancelar</button>
          <button className={styles.btnConfirmar} onClick={onConfirm}>Sí, eliminar</button>
        </div>
      </div>
    </div>
  )
}
