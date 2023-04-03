import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { canvasStream } from './canvas.js';

// inches to pixels conversion: vertical - 41.66, horizontal - 50
const pdfLibSizeRef = {
  '18x11': [550, 750],
  '1801': [200, 100],
  '1806': [175, 75],
  '1901': [87.5, 10]
}

async function createPdf(data) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage(pdfLibSizeRef['1801']);
  const { width, height } = page.getSize();
  const pngImage = await pdfDoc.embedPng(await canvasStream(data));
  page.drawImage(pngImage, {
    x: width / 2 - pngImage.width / 2,
    y: height - pngImage.height,
    width: pngImage.width,
    height: pngImage.height
  });
  const fontSize = 20;
  page.drawText(data, {
    x: width / 2 - 20,
    y: height - 3 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0)
  });
  const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true }); //.save()
  return pdfBytes;
}

export { createPdf };
