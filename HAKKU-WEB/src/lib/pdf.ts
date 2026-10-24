import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { triggerConfetti } from "./confetti";

export interface GeneratePdfOptions {
  filename?: string;
  marginMm?: number;
}

/**
 * Downloads a DOM element as a high-resolution A4 PDF document.
 * Handles single or multi-page slicing automatically.
 */
export async function downloadElementAsPdf(
  elementId: string,
  options: GeneratePdfOptions = {}
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[HAKKU PDF] Element #${elementId} not found`);
    return false;
  }

  const filename =
    options.filename || `HAKKU_Dokumen_${new Date().toISOString().slice(0, 10)}.pdf`;

  try {
    // Render the element with html2canvas at 2x scale, stripping elements marked data-html2canvas-ignore
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      ignoreElements: (el) => el.getAttribute("data-html2canvas-ignore") === "true",
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = options.marginMm ?? 12;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = contentHeight;
    let position = margin;

    // First page
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      position,
      contentWidth,
      contentHeight,
      undefined,
      "FAST"
    );
    heightLeft -= pageHeight - margin * 2;

    // Subsequent pages if long document
    while (heightLeft > 0) {
      position = heightLeft - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        contentWidth,
        contentHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageHeight - margin * 2;
    }

    pdf.save(filename);
    triggerConfetti({ particleCount: 75, spread: 70 });
    return true;
  } catch {
    // Fallback to native vector jsPDF A4 generation from the element's text content
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const margin = options.marginMm ?? 15;
      const maxLineWidth = 210 - margin * 2;
      const rawText = element.innerText || element.textContent || "";
      pdf.setFont("times", "normal");
      pdf.setFontSize(10.5);
      const lines = pdf.splitTextToSize(rawText.trim(), maxLineWidth);
      let y = margin + 5;
      for (const line of lines) {
        if (y > 297 - margin) {
          pdf.addPage();
          y = margin + 5;
        }
        pdf.text(line, margin, y);
        y += 5.5;
      }
      pdf.save(filename);
      triggerConfetti({ particleCount: 75, spread: 70 });
      return true;
    } catch (fallbackErr) {
      console.error("[HAKKU PDF] Error generating fallback PDF:", fallbackErr);
      return false;
    }
  }
}
