/**
 * Client-side “PDF” export uses the browser print pipeline (Save as PDF / Print to PDF).
 * html2canvas + jsPDF consistently broke Tailwind v4 text (missing spaces, overlaps).
 */

function waitForFonts() {
  if (typeof document === "undefined" || !document.fonts?.ready) {
    return Promise.resolve();
  }
  return document.fonts.ready.catch(() => {});
}

/**
 * Opens the system print dialog. User chooses “Save as PDF” or “Microsoft Print to PDF”.
 * Requires [data-pdf-print-root] on the node and @media print rules in globals.css.
 */
export function printSavePdfFallback(rootElement) {
  if (typeof window === "undefined" || !rootElement) return;
  requestAnimationFrame(() => {
    window.print();
  });
}

/**
 * @returns {Promise<{ usedPrintFallback: boolean }>} — always print path; usedPrintFallback is always true.
 */
export async function exportDomToPdf(element, _filename = "document.pdf") {
  await waitForFonts();

  if (element && typeof element.scrollIntoView === "function") {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  }

  printSavePdfFallback(element);
  return { usedPrintFallback: true };
}
