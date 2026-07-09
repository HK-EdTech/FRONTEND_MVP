import { jsPDF } from 'jspdf';

/**
 * Converts an array of image Files into a single PDF File.
 * Each image gets its own page sized to the image's exact dimensions, so every
 * page fills correctly regardless of a portrait/landscape mix.
 */
export async function imagesToPdf(images: File[], outputFileName: string = 'marking_scheme.pdf'): Promise<File> {
  let doc: jsPDF | null = null;

  for (const imageFile of images) {
    const dataUrl = await readFileAsDataUrl(imageFile);
    const { width, height } = await getImageDimensions(dataUrl);
    // Match orientation to the image so jsPDF does not swap the page dimensions.
    const orientation: 'portrait' | 'landscape' = width >= height ? 'landscape' : 'portrait';

    if (!doc) {
      doc = new jsPDF({ unit: 'px', format: [width, height], orientation });
    } else {
      doc.addPage([width, height], orientation);
    }

    // Read the page's actual size back (jsPDF may normalize for orientation) so the
    // image always fills the page instead of being clipped/shrunk.
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  if (!doc) {
    doc = new jsPDF({ unit: 'px' });
  }

  const pdfBlob = doc.output('blob');
  return new File([pdfBlob], outputFileName, { type: 'application/pdf' });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = dataUrl;
  });
}
