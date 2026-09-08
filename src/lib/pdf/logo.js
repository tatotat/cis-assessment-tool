/**
 * Load an image URL into a PNG data URL via canvas, so jsPDF can embed it.
 * Resolves to { dataUrl, width, height } or null when the image is
 * unavailable or cross-origin-tainted (never throws — a missing logo must not
 * block a report).
 */
export function loadLogoDataUrl(url) {
  if (!url) return Promise.resolve(null);
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.width, height: img.height });
      } catch {
        resolve(null); // tainted canvas (cross-origin without CORS headers)
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/** Place a loaded logo in the top-right of the current page. */
export function drawLogo(doc, logo, { pageW, top = 4, height = 14, right = 15 } = {}) {
  if (!logo) return;
  const w = (logo.width / logo.height) * height;
  doc.addImage(logo.dataUrl, 'PNG', pageW - w - right, top, w, height);
}
