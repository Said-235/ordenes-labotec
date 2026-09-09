import { useState, useCallback } from 'react'

const A4_PX = 794
const A4_MM = 210

export function usePDF() {
  const [generando, setGenerando] = useState(false)

  const generarPDF = useCallback(async (ord) => {
    if (generando) return
    setGenerando(true)
    let contenedor = null

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const original = document.getElementById('documento-orden-pdf')
      if (!original) throw new Error('No se encontró #documento-orden-pdf')

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

      clon.querySelectorAll('*').forEach(el => {
        el.style.webkitPrintColorAdjust = 'exact'
        el.style.printColorAdjust       = 'exact'
        el.style.colorAdjust            = 'exact'
      })

      contenedor.appendChild(clon)
      await new Promise(r => setTimeout(r, 400))

      const canvas = await html2canvas(clon, {
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

      const pdfW = A4_MM
      const pdfH = Math.ceil((canvas.height / canvas.width) * pdfW * 100) / 100

      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:[pdfW, pdfH] })
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.97), 'JPEG', 0, 0, pdfW, pdfH)
      const nombre = ord.pending ? `LABOTEC_PENDIENTE_${ord.tipo.toUpperCase()}` : `LABOTEC_${ord.folio}_${ord.tipo.toUpperCase()}`
      pdf.save(`${nombre}.pdf`)

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
