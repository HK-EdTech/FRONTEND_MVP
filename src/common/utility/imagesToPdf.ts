import { jsPDF } from 'jspdf';

/**
 * Converts an array of image Files into a single PDF File.
 * Each image becomes one page, sized to fit the image's aspect ratio.
 */
export async function imagesToPdf(images: File[], outputFileName: string = 'marking_scheme.pdf'): Promise<File> {
  const doc = new jsPDF({ unit: 'px' });
  // Remove the default blank first page after adding all images
  let firstPage = true;

  for (const imageFile of images) {
    const dataUrl = await readFileAsDataUrl(imageFile);
    const { width, height } = await getImageDimensions(dataUrl);

    // Set page size to match image aspect ratio
    const pageWidth = doc.internal.pageSize.getWidth();
    const scale = pageWidth / width;
    const pageHeight = height * scale;

    if (firstPage) {
      // Resize the default first page
      doc.internal.pageSize.setHeight(pageHeight);
      firstPage = false;
    } else {
      doc.addPage([pageWidth, pageHeight]);
    }

    doc.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
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
