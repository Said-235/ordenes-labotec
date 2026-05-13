import LOGO             from '@/assets/logo.jpg'
import { generarQrSVG } from '@/utils/qr'
import { C, getTipo }   from '@/config/marca'
import styles            from './DocumentoOrden.module.css'

export default function DocumentoOrden({ ord }) {
  const tipoConfig = getTipo(ord.tipo)
  const qr         = generarQrSVG(ord.qrPayload || ord.folio, 96, C.negro)
  return (
    <div className={styles.documento} id="documento-orden-pdf">
      <Encabezado ord={ord} tipoConfig={tipoConfig} />
      <div className={styles.banda} />
      <div className={styles.cuerpo}>
        <InfoGeneral ord={ord} />
        <Actividades ord={ord} />
        {tipoConfig.showRefacciones && <Refacciones ord={ord} />}
        {ord.comentarios && <Comentarios ord={ord} />}
        <Firmas ord={ord} />
      </div>
      <div className={styles.bandaInferior} />
      <QrValidacion ord={ord} qr={qr} />
      <PieContacto />
      <div className={styles.pieBanda} />
    </div>
  )
}

function Encabezado({ ord, tipoConfig }) {
  const { label, icon, color, colorBg } = tipoConfig
  return (
    <div className={styles.encabezado}>
      <div className={styles.logoArea}>
        <img src={LOGO} alt="LABOTEC" className={styles.logoImg} />
      </div>
      <div className={styles.tituloArea}>
        <h1 className={styles.empresa}>LABOTEC ENGINEERING</h1>
        <p className={styles.subtitulo}>Engineering Services</p>
        <span className={styles.tipoBadge} style={{color, background:colorBg, borderColor:color+'80'}}>
          {icon} {label}
        </span>
      </div>
      <div className={styles.folioArea}>
        <span className={styles.folioLabel}>No. de Orden</span>
        <span className={styles.folioNum}>{ord.folio}</span>
        <span className={styles.folioFecha}>{ord.fecha}</span>
      </div>
    </div>
  )
}

function SecLabel({ children }) {
  return <div className={styles.secLabel}>{children}</div>
}

function InfoGeneral({ ord }) {
  return (
    <section className={styles.seccion}>
      <SecLabel>Información General</SecLabel>
      <div className={styles.tablaWrap}>
        <table className={`${styles.tabla} ${styles.tablaInfoGeneral}`}>
          <tbody>
            <tr>
              <td className={styles.tdLabel}>Responsable de Laboratorio</td>
              <td className={`${styles.td} ${styles.tdBold}`}>{ord.responsable}</td>
              <td className={styles.tdLabel}>Razón Social</td>
              <td className={styles.td}>{ord.razonSocial}</td>
            </tr>
            <tr>
              <td className={styles.tdLabel}>Dirección del Servicio</td>
              <td className={styles.td} colSpan={3}>{ord.direccion||'—'}</td>
            </tr>
            <tr>
              <td className={styles.tdLabel}>Hora de Inicio</td>
              <td className={`${styles.td} ${styles.tdMono}`}>{ord.horaInicio||'—'}</td>
              <td className={styles.tdLabel}>Hora de Término</td>
              <td className={`${styles.td} ${styles.tdMono}`}>{ord.horaFin||'—'}</td>
            </tr>
            <tr>
              <td className={styles.tdLabel}>Equipo con Servicio</td>
              <td className={styles.td}>{ord.equipo}</td>
              <td className={styles.tdLabel}>Número de Serie</td>
              <td className={`${styles.td} ${styles.tdMono} ${styles.tdBold}`}>{ord.serie}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Actividades({ ord }) {
  return (
    <section className={styles.seccion}>
      <SecLabel>Actividades Realizadas</SecLabel>
      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead><tr><th className={`${styles.th} ${styles.thNum}`}>#</th><th className={styles.th}>Descripción de la Actividad</th></tr></thead>
          <tbody>
            {ord.actividades.map((a,i) => (
              <tr key={i} className={i%2?styles.trPar:''}>
                <td className={`${styles.td} ${styles.tdNum}`}>{String(i+1).padStart(2,'0')}</td>
                <td className={styles.td}>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Refacciones({ ord }) {
  return (
    <section className={styles.seccion}>
      <SecLabel>Refacciones Utilizadas</SecLabel>
      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <thead><tr><th className={`${styles.th} ${styles.thNum}`}>#</th><th className={`${styles.th} ${styles.thCodigo}`}>Código</th><th className={styles.th}>Nombre de Refacción</th><th className={styles.th}>Motivo de Utilización</th></tr></thead>
          <tbody>
            {!ord.refacciones||ord.refacciones.length===0 ? (
              <tr><td colSpan={4} className={styles.tdVacio}>No se utilizaron refacciones en este servicio.</td></tr>
            ) : ord.refacciones.map((r,i) => (
              <tr key={i} className={i%2?styles.trPar:''}>
                <td className={`${styles.td} ${styles.tdNum}`}>{String(i+1).padStart(2,'0')}</td>
                <td className={`${styles.td} ${styles.tdMono}`}>{r.codigo||'—'}</td>
                <td className={styles.td}>{r.nombre||'—'}</td>
                <td className={styles.td}>{r.motivo||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Comentarios({ ord }) {
  return (
    <section className={styles.seccion}>
      <SecLabel>Comentarios y Pendientes</SecLabel>
      <div className={styles.comentariosBox}>
        <p className={styles.comentariosTexto}>{ord.comentarios}</p>
      </div>
    </section>
  )
}

function Firmas({ ord }) {
  return (
    <div className={styles.firmasGrid}>
      {[{label:'Responsable de Laboratorio',img:ord.firmaResp,pie:ord.responsable},{label:'Ingeniero de Servicio',img:ord.firmaIng,pie:'Ingeniero Autorizado'}].map(({label,img,pie}) => (
        <div key={label} className={styles.firmaCard}>
          <div className={styles.firmaHeader}>{label}</div>
          <div className={styles.firmaImgArea}>
            {img ? <img src={img} className={styles.firmaImg} alt="firma"/> : <span className={styles.firmaVacia}>Sin firma capturada</span>}
          </div>
          <div className={styles.firmaPie}>{pie}</div>
        </div>
      ))}
    </div>
  )
}

function QrValidacion({ ord, qr }) {
  return (
    <div className={styles.qrArea}>
      <div className={styles.qrSvg} dangerouslySetInnerHTML={{__html:qr}} />
      <div className={styles.qrInfo}>
        <p className={styles.qrTitulo}>✅ Servicio Oficial Verificado · LABOTEC Engineering</p>
        <p className={styles.qrDesc}>Escanea este QR para confirmar que el servicio fue realizado por técnicos certificados de LABOTEC.</p>
        <p className={styles.qrHash}>{ord.qrHash}</p>
      </div>
      <div className={styles.sello}><span>✔</span><small>Servicio<br/>Oficial<br/>Labotec</small></div>
    </div>
  )
}

function PieContacto() {
  return (
    <div className={styles.pie}>
      <div className={styles.pieCol}>
        <p className={styles.pieTitulo}>Datos Fiscales</p>
        <div className={styles.pieFila}><span className={styles.pieIcono}>🏢</span><span className={styles.pieTexto}><strong>Juan Ulises Pozas Arteaga</strong></span></div>
        <div className={styles.pieFila}><span className={styles.pieIcono}>📋</span><span className={styles.pieTexto}>RFC: <span className={styles.pieRfc}>POAJ790813R77</span></span></div>
        <div className={styles.pieFila}><span className={styles.pieIcono}>📮</span><span className={styles.pieTexto}>C.P. <strong>07550</strong></span></div>
      </div>
      <div className={styles.pieDivider} />
      <div className={styles.pieCol}>
        <p className={styles.pieTitulo}>Centro de Servicio &amp; Contacto</p>
        <div className={styles.pieFila}><span className={styles.pieIcono}>📍</span><span className={styles.pieTexto}>Calle Lázaro Cárdenas 41, Col. Popular, C.P. 55210</span></div>
        <div className={styles.pieFila}><span className={styles.pieIcono}>📞</span><span className={styles.pieTexto}><strong>59 1106 5939</strong></span></div>
        <div className={styles.pieFila}><span className={styles.pieIcono}>💬</span><span className={styles.pieTexto}>WhatsApp: <strong>55 5966 0022</strong> · <strong>56 1901 5418</strong></span></div>
        <div className={styles.pieFila}><span className={styles.pieIcono}>🌐</span><span className={styles.pieTexto}>www.ingenierialabotec.com.mx</span></div>
        <div className={styles.pieFila}><span className={styles.pieIcono}>✉️</span><span className={styles.pieTexto}>contacto@ingenieria.labotec.com.mx<br/>ingenieria.labotec@icloud.com</span></div>
      </div>
    </div>
  )
}
