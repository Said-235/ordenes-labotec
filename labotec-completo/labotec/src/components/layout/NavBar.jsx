import LOGO from '@/assets/logo.jpg'
import styles from './NavBar.module.css'

export default function NavBar({ back, backLabel='← Volver', extra }) {
  return (
    <nav className={styles.nav}>
      {back && <button className={styles.btnBack} onClick={back}>{backLabel}</button>}
      <img src={LOGO} alt="LABOTEC" className={styles.logo} />
      <span className={styles.nombre}>LABOTEC</span>
      <span className={styles.subtitulo}>Engineering Services</span>
      {extra && <div className={styles.extra}>{extra}</div>}
    </nav>
  )
}
