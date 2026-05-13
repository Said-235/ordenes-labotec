import { useRef, useEffect } from 'react'
import styles from './FirmaCanvas.module.css'

export default function FirmaCanvas({ id, label }) {
  const ref     = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const c = ref.current; if (!c) return
    const ctx = c.getContext('2d')
    ctx.strokeStyle='#111111'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.lineJoin='round'
    const R   = () => c.getBoundingClientRect()
    const pos = (e) => { const r=R(),sx=c.width/r.width,sy=c.height/r.height; return e.touches?{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy}:{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy} }
    const dn  = (e) => { e.preventDefault(); drawing.current=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y) }
    const mv  = (e) => { if(!drawing.current) return; e.preventDefault(); const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(p.x,p.y) }
    const up  = (e) => { e.preventDefault(); drawing.current=false }
    c.addEventListener('mousedown',dn); c.addEventListener('mousemove',mv); c.addEventListener('mouseup',up); c.addEventListener('mouseleave',up)
    c.addEventListener('touchstart',dn,{passive:false}); c.addEventListener('touchmove',mv,{passive:false}); c.addEventListener('touchend',up)
    return () => { c.removeEventListener('mousedown',dn); c.removeEventListener('mousemove',mv); c.removeEventListener('mouseup',up); c.removeEventListener('mouseleave',up) }
  }, [])

  const limpiar = () => { const c=ref.current; c.getContext('2d').clearRect(0,0,c.width,c.height) }

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>{label}</p>
      <canvas ref={ref} id={id} width={340} height={110} className={styles.canvas} />
      <button className={styles.btnLimpiar} onClick={limpiar} type="button">Limpiar</button>
    </div>
  )
}

export function firmaEstaVacia(id) {
  const c = document.getElementById(id); if (!c) return true
  const d = c.getContext('2d').getImageData(0,0,c.width,c.height).data
  for (let i=3;i<d.length;i+=4) if(d[i]>0) return false
  return true
}
