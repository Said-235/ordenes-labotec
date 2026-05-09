import { useState, useCallback } from 'react'

const A4_PX = 794   // A4 a 96 DPI en px — ancho fijo de captura
const A4_MM = 210   // A4 en mm — ancho del PDF final

function cargarScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement('script')
    s.src = src; s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
}

async function asegurarLibrerias() {
  await cargarScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
  await cargarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
}

export function usePDF() {
  const [generando, setGenerando] = useState(false)

  const generarPDF = useCallback(async (ord) => {
    if (generando) return
    setGenerando(true)
    let contenedor = null

    try {
      await asegurarLibrerias()

      const original = document.getElementById('documento-orden-pdf')
      if (!original) throw new Error('No se encontró #documento-orden-pdf')

      // Contenedor oculto de ancho fijo A4 — independiente del viewport
      contenedor = document.createElement('div')
      contenedor.style.cssText = `
        position:fixed; top:-99999px; left:-99999px;
        width:${A4_PX}px; background:#ffffff;
        z-index:-9999; overflow:visible;
        box-sizing:border-box; pointer-events:none;
      `
      document.body.appendChild(contenedor)

      const clon = original.cloneNode(true)
      clon.style.cssText = `width:${A4_PX}px; background:#ffffff; overflow:visible; box-sizing:border-box;`

      // Forzar fondos en todos los elementos (encabezado negro, pie, bandas cyan)
      clon.querySelectorAll('*').forEach(el => {
        el.style.webkitPrintColorAdjust = 'exact'
        el.style.printColorAdjust       = 'exact'
        el.style.colorAdjust            = 'exact'
      })

      contenedor.appendChild(clon)

      // Esperar layout completo antes de capturar
      await new Promise(r => setTimeout(r, 400))

      const canvas = await window.html2canvas(clon, {
        scale:           3,
        useCORS:         true,
        allowTaint:      true,
        backgroundColor: '#ffffff',
        logging:         false,
        width:           A4_PX,
        height:          clon.scrollHeight,
        windowWidth:     A4_PX,
        windowHeight:    clon.scrollHeight,
        scrollX: 0, scrollY: 0,
        imageTimeout: 0,
      })

      // Alto proporcional → 1 sola página sin recortes
      const { jsPDF } = window.jspdf
      const pdfW = A4_MM
      const pdfH = Math.ceil((canvas.height / canvas.width) * pdfW * 100) / 100

      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:[pdfW, pdfH] })
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, pdfW, pdfH)
      pdf.save(`LABOTEC_${ord.folio}_${ord.tipo.toUpperCase()}.pdf`)

    } catch (err) {
      console.error('[usePDF]', err)
      alert('Hubo un problema al generar el PDF. Intenta de nuevo.')
    } finally {
      if (contenedor?.parentNode) contenedor.parentNode.removeChild(contenedor)
      setGenerando(false)
    }
  }, [generando])

  return { generarPDF, generando }
}
