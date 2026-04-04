import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function waitForFonts() {
  if (typeof document === "undefined" || !document.fonts?.ready) {
    return Promise.resolve();
  }
  return document.fonts.ready.catch(() => {});
}

/** Keep scaled canvas edge under typical browser / GPU limits (toDataURL failures). */
const MAX_CANVAS_EDGE = 8192;

function pickScale(width, height) {
  const longest = Math.max(1, width, height);
  return Math.min(2, MAX_CANVAS_EDGE / longest);
}

function uniqueScales(...values) {
  const rounded = values
    .filter((s) => s > 0.12)
    .map((s) => Math.round(s * 1000) / 1000);
  return [...new Set(rounded)].sort((a, b) => b - a);
}

function assignPdfSyncIds(root) {
  let n = 0;
  function walk(el) {
    if (el.nodeType !== Node.ELEMENT_NODE) return;
    el.setAttribute("data-pdf-sync-id", String(++n));
    for (const c of el.children) walk(c);
  }
  walk(root);
}

function clearPdfSyncIds(root) {
  if (root.nodeType === Node.ELEMENT_NODE && root.hasAttribute("data-pdf-sync-id")) {
    root.removeAttribute("data-pdf-sync-id");
  }
  root.querySelectorAll("[data-pdf-sync-id]").forEach((el) => {
    el.removeAttribute("data-pdf-sync-id");
  });
}

/**
 * html2canvas still parses every <style> / stylesheet in the cloned document; Tailwind v4
 * uses oklch/lab and crashes the parser. Remove author styles from the clone so only our
 * inline computed styles apply.
 */
function stripAuthorStylesFromClonedDocument(doc) {
  doc.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove());
  doc.querySelectorAll("style").forEach((n) => n.remove());
  if (doc.documentElement) {
    doc.documentElement.style.backgroundColor = "#ffffff";
  }
  if (doc.body) {
    doc.body.style.margin = "0";
    doc.body.style.backgroundColor = "#ffffff";
  }
}

/** html2canvas cannot parse modern CSS Color 4 functions (lab, oklch, …) on inline styles. */
const UNSUPPORTED_COLOR_IN_VALUE = /(lab|oklch|lch|hwb|color-mix)\s*\(/i;

const PROBE_BASE =
  "position:absolute!important;left:0!important;top:0!important;width:0!important;height:0!important;overflow:hidden!important;visibility:hidden!important;pointer-events:none!important;margin:0!important;padding:0!important;border:none!important";

/**
 * Let the browser resolve lab/oklch/etc. to something html2canvas accepts (usually rgb).
 * If still modern syntax, return null (caller skips that property).
 */
function resolveModernColorValue(originalDoc, prop, val) {
  const win = originalDoc.defaultView;
  if (!win || !originalDoc.body || !val) {
    return null;
  }
  const probe = originalDoc.createElement("div");
  probe.setAttribute("style", PROBE_BASE);
  originalDoc.body.appendChild(probe);
  try {
    probe.style.setProperty(prop, val);
    const resolved = win.getComputedStyle(probe).getPropertyValue(prop);
    if (!resolved || UNSUPPORTED_COLOR_IN_VALUE.test(resolved)) {
      return null;
    }
    return resolved;
  } catch {
    return null;
  } finally {
    probe.remove();
  }
}

function fallbackColorForPdfProp(prop) {
  if (prop === "color" || prop === "-webkit-text-fill-color") return "#0f172a";
  if (prop === "background-color") return "#ffffff";
  if (
    prop.endsWith("-color") ||
    prop === "outline-color" ||
    prop === "text-decoration-color" ||
    prop === "caret-color" ||
    prop === "column-rule-color" ||
    prop === "flood-color" ||
    prop === "lighting-color"
  ) {
    return "#64748b";
  }
  return null;
}

/**
 * Only copy safe longhands. Copying every getComputedStyle key (incl. font shorthand,
 * transforms, etc.) breaks html2canvas text layout — missing spaces, overlapping lines.
 */
const PDF_SAFE_STYLE_PROPS = [
  "color",
  "background-color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "word-spacing",
  "text-align",
  "text-transform",
  "text-decoration",
  "text-decoration-line",
  "text-decoration-color",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-indent",
  "text-shadow",
  "white-space",
  "word-break",
  "overflow-wrap",
  "vertical-align",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "width",
  "max-width",
  "min-width",
  "height",
  "min-height",
  "max-height",
  "display",
  "flex-direction",
  "flex-wrap",
  "justify-content",
  "align-items",
  "align-self",
  "align-content",
  "gap",
  "row-gap",
  "column-gap",
  "flex",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "order",
  "list-style-type",
  "list-style-position",
  "box-sizing",
  "border-radius",
  "opacity",
  "visibility",
  "overflow",
  "overflow-x",
  "overflow-y",
];

function copyAllComputedStylesOntoClone(originalEl, cloneEl, originalDoc) {
  const win = originalDoc.defaultView;
  if (!win) return;
  const cs = win.getComputedStyle(originalEl);

  for (const prop of PDF_SAFE_STYLE_PROPS) {
    let val = cs.getPropertyValue(prop);
    if (val === "") continue;
    const pri = cs.getPropertyPriority(prop);
    if (UNSUPPORTED_COLOR_IN_VALUE.test(val)) {
      const resolved = resolveModernColorValue(originalDoc, prop, val);
      if (resolved === null) {
        const fb = fallbackColorForPdfProp(prop);
        if (fb === null) continue;
        val = fb;
      } else {
        val = resolved;
      }
    }
    try {
      cloneEl.style.setProperty(prop, val, pri);
    } catch {
      /* ignore */
    }
  }

  cloneEl.style.setProperty("-webkit-print-color-adjust", "exact");
  cloneEl.style.setProperty("print-color-adjust", "exact");
  cloneEl.removeAttribute("class");

  const c = cloneEl.style.color;
  if (
    !c ||
    c === "transparent" ||
    /^rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i.test(c)
  ) {
    cloneEl.style.color = "#0f172a";
  }
}

/**
 * Pair clone nodes with live DOM via data-pdf-sync-id (clone may include pseudo nodes).
 */
function syncCloneStylesFromOriginal(originalDoc, clonedRoot) {
  if (!originalDoc.defaultView) return;

  const marked = [];
  if (clonedRoot.hasAttribute("data-pdf-sync-id")) {
    marked.push(clonedRoot);
  }
  marked.push(...clonedRoot.querySelectorAll("[data-pdf-sync-id]"));

  for (const cEl of marked) {
    const sid = cEl.getAttribute("data-pdf-sync-id");
    if (!sid || !/^\d+$/.test(sid)) continue;
    const oEl = originalDoc.querySelector(`[data-pdf-sync-id="${sid}"]`);
    if (!oEl) continue;
    copyAllComputedStylesOntoClone(oEl, cEl, originalDoc);
    cEl.removeAttribute("data-pdf-sync-id");
  }
}

/**
 * Opens system print dialog; user picks "Save as PDF". Requires [data-pdf-print-root] on
 * the element and @media print rules in globals.css.
 */
export function printSavePdfFallback(rootElement) {
  if (typeof window === "undefined" || !rootElement) return;
  requestAnimationFrame(() => {
    window.print();
  });
}

/**
 * @returns {Promise<{ usedPrintFallback: boolean }>}
 */
export async function exportDomToPdf(element, filename = "document.pdf") {
  await waitForFonts();

  if (typeof element.scrollIntoView === "function") {
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );
  }

  assignPdfSyncIds(element);

  const w = Math.max(1, element.scrollWidth);
  const h = Math.max(1, element.scrollHeight);
  const base = pickScale(w, h);
  const scales = uniqueScales(base, Math.min(1, base * 0.65), 0.5, 0.35);

  const originalDoc = element.ownerDocument;
  const onclone = (clonedDoc, clonedRoot) => {
    stripAuthorStylesFromClonedDocument(clonedDoc);
    if (clonedRoot) {
      syncCloneStylesFromOriginal(originalDoc, clonedRoot);
    }
  };

  let imgData;
  try {
    for (const scale of scales) {
      try {
        const canvas = await html2canvas(element, {
          scale,
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: w,
          windowHeight: h,
          foreignObjectRendering: false,
          onclone,
        });
        imgData = canvas.toDataURL("image/jpeg", 0.9);
        break;
      } catch {
        /* try next scale */
      }
    }
  } finally {
    clearPdfSyncIds(element);
  }

  if (!imgData) {
    printSavePdfFallback(element);
    return { usedPrintFallback: true };
  }

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = usableWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let offsetY = margin;

    pdf.addImage(imgData, "JPEG", margin, offsetY, imgWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 1) {
      offsetY = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, offsetY, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    pdf.save(filename);
    return { usedPrintFallback: false };
  } catch {
    printSavePdfFallback(element);
    return { usedPrintFallback: true };
  }
}
