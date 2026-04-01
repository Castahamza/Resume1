import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Capture a DOM node as a multi-page A4 PDF (JPEG), same strategy as resume export.
 */
export async function exportDomToPdf(element, filename = "document.pdf") {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
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
}
