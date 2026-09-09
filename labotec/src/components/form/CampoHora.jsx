import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './CampoHora.module.css'

const HORAS_RELOJ = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const MINUTOS_MARCA = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

function pad(n) { return String(n).padStart(2, '0') }

function partes(value) {
  if (!value || !value.includes(':')) return null
  const [h, m] = value.split(':')
  const hora = Number(h)
  const min = Number((m || '00').slice(0, 2))
  if (Number.isNaN(hora) || Number.isNaN(min)) return null
  return { hora, min }
}

function ahora() {
  const d = new Date()
  return { hora: d.getHours(), min: d.getMinutes() }
}

function a24(cara, pm) {
  const base = cara % 12
  if (pm) return base === 0 ? 12 : base + 12
  return base === 0 ? 0 : base
}

function de24(hora) {
  return { cara: hora % 12, pm: hora >= 12 }
}

function polar(x, y, el) {
  const r = el.getBoundingClientRect()
  const dx = x - (r.left + r.width / 2)
  const dy = y - (r.top + r.height / 2)
  let deg = Math.atan2(dx, -dy) * (180 / Math.PI)
  if (deg < 0) deg += 360
  return deg
}

function pos(i, count) {
  const angle = (i / count) * 2 * Math.PI - Math.PI / 2
  return {
    left: `${50 + Math.cos(angle) * 38}%`,
    top: `${50 + Math.sin(angle) * 38}%`,
  }
}

export default function CampoHora({ label, value, onChange }) {
  const actual = partes(value)
  const [abierto, setAbierto] = useState(false)
  const [hora, setHora] = useState(8)
  const [min, setMin] = useState(0)
  const [modo, setModo] = useState('hora')
  const dialRef = useRef(null)
  const arrastre = useRef(false)

  useEffect(() => {
    if (!abierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [abierto])

  function abrir() {
    const ini = actual || ahora()
    setHora(ini.hora)
    setMin(ini.min)
    setModo('hora')
    setAbierto(true)
  }

  function aplicarDesdePuntero(clientX, clientY) {
    const el = dialRef.current
    if (!el) return
    const deg = polar(clientX, clientY, el)
    if (modo === 'hora') {
      const cara = Math.round(deg / 30) % 12
      setHora(a24(cara, hora >= 12))
    } else {
      setMin(Math.round(deg / 6) % 60)
    }
  }

  function onPointerDown(e) {
    e.preventDefault()
    arrastre.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    aplicarDesdePuntero(e.clientX, e.clientY)
  }

  function onPointerMove(e) {
    if (!arrastre.current) return
    aplicarDesdePuntero(e.clientX, e.clientY)
  }

  function onPointerUp() {
    if (!arrastre.current) return
    arrastre.current = false
    if (modo === 'hora') setModo('minuto')
  }

  function setPm(pm) {
    setHora(a24(de24(hora).cara, pm))
  }

  function confirmar() {
    onChange(`${pad(hora)}:${pad(min)}`)
    setAbierto(false)
  }

  const { cara, pm } = de24(hora)
  const deg = modo === 'hora' ? cara * 30 : min * 6
  const radioMano = modo === 'hora' ? '34%' : '38%'

  return (
    <div className={styles.campo}>
      <label className={styles.label}>{label}</label>
      <button
        type="button"
        className={`${styles.trigger} ${abierto ? styles.triggerOpen : ''}`}
        onClick={abrir}
        aria-haspopup="dialog"
        aria-expanded={abierto}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4.2L15 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className={actual ? styles.valor : styles.placeholder}>
          {actual ? `${pad(actual.hora)}:${pad(actual.min)}` : 'Elegir hora'}
        </span>
        {actual && (
          <span className={`${styles.ampm} ${actual.hora >= 12 ? styles.pm : styles.am}`}>
            {actual.hora >= 12 ? 'PM' : 'AM'}
          </span>
        )}
      </button>

      {abierto && createPortal(
        <div className={styles.overlay} onClick={() => setAbierto(false)}>
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.handle} />
            <p className={styles.sheetLabel}>{label.replace(' *', '')}</p>

            <div className={styles.digital}>
              <button
                type="button"
                className={`${styles.digito} ${modo === 'hora' ? styles.digitoOn : ''}`}
                onClick={() => setModo('hora')}
              >
                {pad(hora)}
              </button>
              <span className={styles.sep}>:</span>
              <button
                type="button"
                className={`${styles.digito} ${modo === 'minuto' ? styles.digitoOn : ''}`}
                onClick={() => setModo('minuto')}
              >
                {pad(min)}
              </button>
            </div>

            <div className={styles.ampmRow}>
              <button
                type="button"
                className={`${styles.ampmBtn} ${!pm ? styles.ampmBtnOn : ''}`}
                onClick={() => setPm(false)}
              >
                AM
              </button>
              <button
                type="button"
                className={`${styles.ampmBtn} ${pm ? styles.ampmBtnOn : ''}`}
                onClick={() => setPm(true)}
              >
                PM
              </button>
            </div>

            <div className={styles.dialWrap}>
              <div
                ref={dialRef}
                className={styles.dial}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <div
                  className={styles.handWrap}
                  style={{ '--deg': `${deg}deg`, '--len': radioMano }}
                >
                  <div className={styles.hand} />
                  <div className={styles.knob} />
                </div>
                <div className={styles.dot} />

                {modo === 'hora'
                  ? HORAS_RELOJ.map((n, i) => {
                      const sel = cara === (n % 12)
                      return (
                        <span
                          key={n}
                          className={`${styles.num} ${sel ? styles.numOn : ''}`}
                          style={pos(i, 12)}
                        >
                          {n}
                        </span>
                      )
                    })
                  : MINUTOS_MARCA.map((n, i) => {
                      const sel = Math.round(min / 5) * 5 % 60 === n
                      return (
                        <span
                          key={n}
                          className={`${styles.num} ${sel ? styles.numOn : ''}`}
                          style={pos(i, 12)}
                        >
                          {pad(n)}
                        </span>
                      )
                    })}
              </div>
            </div>

            <div className={styles.acciones}>
              <button type="button" className={styles.cancelar} onClick={() => setAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className={styles.listo} onClick={confirmar}>
                Listo
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
