import LOGO from '@/assets/logo.jpg'
import BannerBorrador from '@/components/common/BannerBorrador'
import { MARCA, TIPOS_ORDEN } from '@/config/marca'
import styles from './Inicio.module.css'

export default function Inicio({ ctx }) {
  const { db, iniciar, setPantalla } = ctx
  const stats = [
    { n:db.ordenes.length, l:'Total' },
    { n:db.ordenes.filter(o=>o.tipo==='preventivo').length,   l:'Preventivo' },
    { n:db.ordenes.filter(o=>o.tipo==='correctivo').length,   l:'Correctivo' },
    { n:db.ordenes.filter(o=>o.tipo==='capacitacion').length, l:'Capacitación' },
    { n:db.ordenes.filter(o=>o.tipo==='instalacion').length,  l:'Instalación' },
  ]
  return (
    <main className={styles.main}>
      <img src={LOGO} alt={MARCA.nombre} className={styles.logo} />
      <h1 className={styles.nombre}>{MARCA.nombre}</h1>
      <p className={styles.sub}>{MARCA.subtitulo}</p>
      <p className={styles.version}>Sistema de Órdenes de Servicio · {MARCA.version}</p>
      <BannerBorrador ctx={ctx} />
      <div className={styles.stats}>
        {stats.map(({n,l}) => (
          <div key={l} className={styles.stat}>
            <span className={styles.statN}>{n}</span>
            <span className={styles.statL}>{l}</span>
          </div>
        ))}
      </div>
      <p className={styles.secLabel}>Selecciona el tipo de orden</p>
      <div className={styles.tarjetas}>
        {TIPOS_ORDEN.map(({id,icon,label,desc,code,color,colorBg,colorBorder}) => (
          <div key={id} className={styles.tarjeta} style={{background:colorBg,borderColor:colorBorder}}
            onClick={() => iniciar(id)}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=color;e.currentTarget.style.transform='translateY(-4px)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=colorBorder;e.currentTarget.style.transform='translateY(0)'}}>
            <span className={styles.code} style={{color,background:colorBg,borderColor:colorBorder}}>{code}</span>
            <span className={styles.icon}>{icon}</span>
            <h2 className={styles.tarjetaLbl}>{label}</h2>
            <p className={styles.tarjetaDesc}>{desc}</p>
            <span className={styles.ctaLink} style={{color}}>Crear orden →</span>
          </div>
        ))}
      </div>
      {db.ordenes.length > 0 && (
        <button className={styles.btnHistorial} onClick={()=>setPantalla('historial')}>
          📋 Historial de órdenes <span className={styles.badge}>{db.ordenes.length}</span>
        </button>
      )}
    </main>
  )
}
