import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

import { canvasStream } from './canvas.js';

// inches to pixels conversion: vertical - 41.66, horizontal - 50
const pdfLibSizeRef = {
// 'name': [width, height]
  '18x11': [550, 750],
  '1801': [100, 41],
  '1806': [175, 75],
  '1901': [87.5, 10]
}

async function createPdf(data) {
	const pdfDoc = await PDFDocument.create();
	const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
	const fontSize = 10;
	data.serials.map(async serial => {
		// generic page setup
		const page = pdfDoc.addPage(pdfLibSizeRef[data.label]);
		const {width, height} = page.getSize();
		// components drawn per model/serial
		page.drawText(data.model, {
			x: width / 2 - 20,
			y: height - 1 * fontSize,
			size: fontSize,
			font: timesRomanFont,
			color: rgb(0, 0, 0)
		});
		const modelBarcode = await pdfDoc.embedPng(canvasStream(data.model, 1));
		page.drawImage(modelBarcode, {
			x: width / 2 - modelBarcode.width / 3,
			y: (7/8)*height - modelBarcode.height,
			width: modelBarcode.width/1.5,
			height: modelBarcode.height
		});
		page.drawText(serial, {
			x: width / 2 - 20,
			y: height - 3 * fontSize,
			size: fontSize,
			font: timesRomanFont,
			color: rgb(0, 0, 0)
		});
		const serialBarcode = await pdfDoc.embedPng(canvasStream(serial, 1));
		page.drawImage(serialBarcode, {
			x: width / 2 - serialBarcode.width/3,
			y: (4/8)*height - serialBarcode.height,
			width: serialBarcode.width/1.5,
			height: serialBarcode.height
		});
	});
	const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
	return pdfBytes;
}
export { createPdf };
