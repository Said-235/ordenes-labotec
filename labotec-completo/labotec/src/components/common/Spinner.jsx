import styles from './Spinner.module.css'
export default function Spinner({ mensaje='Cargando LABOTEC...' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.ring} />
      <p className={styles.texto}>{mensaje}</p>
    </div>
  )
}
