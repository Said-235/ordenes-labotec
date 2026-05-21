// ─────────────────────────────────────────────────────────────
//  QR — Generador real usando librería qrcode via CDN
//
//  Genera un canvas con el QR real y lo devuelve como
//  data URL PNG para incrustar en el documento imprimible.
//
//  La librería se carga dinámicamente la primera vez que
//  se usa — sin instalar nada, igual que hace usePDF.
// ─────────────────────────────────────────────────────────────

function cargarQRLib() {
  return new Promise((resolve, reject) => {
    if (window.QRCode) { resolve(window.QRCode); return }
    const s   = document.createElement('script')
    s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
    s.onload  = () => resolve(window.QRCode)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

/**
 * Genera un QR real como imagen PNG (data URL).
 * Usa qrcodejs via CDN — escaneable con cualquier lector.
 *
 * @param {string} url   - URL de verificación a codificar
 * @param {number} size  - Tamaño en px (default 128)
 * @returns {Promise<string>} - data URL de la imagen PNG
 */
export async function generarQrDataURL(url, size = 128) {
  try {
    const QRCode = await cargarQRLib()

    // Crear contenedor temporal oculto
    const div = document.createElement('div')
    div.style.cssText = 'position:fixed;top:-9999px;left:-9999px;'
    document.body.appendChild(div)

    // Generar QR en el div
    const qr = new QRCode(div, {
      text:           url,
      width:          size,
      height:         size,
      colorDark:      '#111111',
      colorLight:     '#f4f4f4',
      correctLevel:   QRCode.CorrectLevel.M,
    })

    // Esperar a que el canvas se renderice
    await new Promise(r => setTimeout(r, 100))

    // Extraer la imagen del canvas generado
    const canvas  = div.querySelector('canvas')
    const dataURL = canvas ? canvas.toDataURL('image/png') : null

    // Limpiar
    document.body.removeChild(div)

    return dataURL
  } catch (err) {
    console.error('[qr] Error generando QR:', err)
    return null
  }
}

/**
 * SVG decorativo de respaldo — se muestra mientras carga
 * el QR real o si la librería no está disponible.
 * NO es escaneable — solo visual.
 */
export function generarQrPlaceholderSVG(size = 100) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#f4f4f4"/>
    <rect x="8"  y="8"  width="28" height="28" fill="none" stroke="#111" stroke-width="3.5"/>
    <rect x="14" y="14" width="16" height="16" fill="#111"/>
    <rect x="64" y="8"  width="28" height="28" fill="none" stroke="#111" stroke-width="3.5"/>
    <rect x="70" y="14" width="16" height="16" fill="#111"/>
    <rect x="8"  y="64" width="28" height="28" fill="none" stroke="#111" stroke-width="3.5"/>
    <rect x="14" y="70" width="16" height="16" fill="#111"/>
    <rect x="40" y="10" width="4"  height="4"  fill="#111"/>
    <rect x="48" y="10" width="4"  height="4"  fill="#111"/>
    <rect x="44" y="18" width="8"  height="4"  fill="#111"/>
    <rect x="40" y="40" width="4"  height="4"  fill="#111"/>
    <rect x="48" y="40" width="8"  height="8"  fill="#111"/>
    <rect x="60" y="44" width="4"  height="4"  fill="#111"/>
    <rect x="40" y="56" width="8"  height="4"  fill="#111"/>
    <rect x="60" y="56" width="4"  height="8"  fill="#111"/>
    <rect x="72" y="40" width="4"  height="4"  fill="#111"/>
    <rect x="80" y="44" width="4"  height="8"  fill="#111"/>
    <rect x="72" y="56" width="8"  height="4"  fill="#111"/>
  </svg>`
}