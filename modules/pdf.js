import * as fs from 'node:fs';

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
	const fontSize = 7;
	const tm_stream = await pdfDoc.embedJpg(fs.readFileSync('./database/PAR_PHASE_TM.jpg'));
	const modelBarcode = await pdfDoc.embedPng(canvasStream(data.model, 1));

	data.serials.map(async serial => {
		// generic page setup, model / logo
		const page = pdfDoc.addPage(pdfLibSizeRef[data.label]);
		const {width, height} = page.getSize();
		let scaleFactor = (((2/5)* width) / tm_stream.width);
		page.drawImage(tm_stream, {
			x: 3,
			y: 33,
			width: tm_stream.width * scaleFactor,
			height: tm_stream.height * scaleFactor
		});
		page.drawText("Model #:        " + data.model, {
			x: 3,
			y: height - 1.9 * fontSize - 0.5,
			size: fontSize,
			font: timesRomanFont,
			color: rgb(0, 0, 0)
		});
		scaleFactor =  (1/2) * (width/modelBarcode.width);
		page.drawImage(modelBarcode, {
			x: (width / 2) - ((modelBarcode.width * scaleFactor) / 2) + 7,
			y: 9,
			width: modelBarcode.width * scaleFactor,
			height: modelBarcode.height * (8/10)
		});
		// components drawn per serial
		page.drawText("Serial #:  " + serial, {
			x: 3,
			y: 11,
			size: fontSize,
			font: timesRomanFont,
			color: rgb(0, 0, 0)
		});
		const serialBarcode = await pdfDoc.embedPng(canvasStream(serial, 1));
		scaleFactor = (1/2) * (width/serialBarcode.width);
		page.drawImage(serialBarcode, {
			x: (width / 2) - ((serialBarcode.width * scaleFactor) / 2) - 7,
			y: -8,//(1/8)*height,// - serialBarcode.height,
			width: serialBarcode.width * scaleFactor * 1.7,
			height: serialBarcode.height * (8/10)
		});
		page.drawText("REV.: 1.0", {
			x: 3.5,
			y: 2,
			size: fontSize-3,
			font: timesRomanFont,
			color: rgb(0, 0, 0)
		});
	});
	const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
	return pdfBytes;
}
export { createPdf };
