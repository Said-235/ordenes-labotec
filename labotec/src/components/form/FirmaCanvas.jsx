import { useRef, useEffect } from 'react'
import SignaturePad from 'signature_pad'
import styles from './FirmaCanvas.module.css'

const pads = new Map()

function resizeCanvas(canvas, pad) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1)
  const data = pad.toData()
  canvas.width = canvas.offsetWidth * ratio
  canvas.height = canvas.offsetHeight * ratio
  const ctx = canvas.getContext('2d')
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  pad.clear()
  if (data.length) pad.fromData(data)
}

export default function FirmaCanvas({ id, label }) {
  const canvasRef = useRef(null)
  const padRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pad = new SignaturePad(canvas, {
      minWidth: 1,
      maxWidth: 2.4,
      penColor: '#111111',
    })
    padRef.current = pad
    pads.set(id, pad)
    const onResize = () => resizeCanvas(canvas, pad)
    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      pad.off()
      pads.delete(id)
    }
  }, [id])

  const limpiar = () => { padRef.current?.clear() }

  return (
    <div className={styles.wrapper}>
      <p className={styles.label}>{label}</p>
      <canvas ref={canvasRef} id={id} className={styles.canvas} />
      <button className={styles.btnLimpiar} onClick={limpiar} type="button">Limpiar</button>
    </div>
  )
}

export function firmaEstaVacia(id) {
  const pad = pads.get(id)
  return !pad || pad.isEmpty()
}

export function firmaDataURL(id) {
  const pad = pads.get(id)
  if (!pad || pad.isEmpty()) return null
  return pad.toDataURL('image/png')
}
