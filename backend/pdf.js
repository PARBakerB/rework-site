import constants from "./constants.js"
const fsm = constants.fsManager;

import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { canvasStream } from './canvas.js';
import { commonFormatDate } from './fileDate.js';

// inches to pixels conversion: vertical - 41.66, horizontal - 50
const pdfLibSizeRef = {
// 'name': [width, height]
  '18x11': [550, 750],
  'Phase 1801': [100, 41],
  'Model Serial 1801': [100, 41],
  'Box Model 1801': [100, 41],
  '1806': [175, 75],
  '1901': [87.5, 10],
  'Cycle Charge Label': [600, 150],
  'Service Repair 1801': [100, 41],
  '1801 Model Serial Label': [100, 41]
}

async function createPdf(data) {
	const pdfDoc = await PDFDocument.create();
	const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
	let fontSize = 7;
	let  tm_stream = null;
	let serialBarcode = null;
	let logoFile;
	switch (data.label) {
		case 'Phase 1801':
			logoFile = await fsm.read('/AzureFileShare/Database/PAR_PHASE_TM.jpg');
			tm_stream = await pdfDoc.embedJpg(logoFile);
		case '1801 Model Serial Label':
			logoFile = await fsm.read('/AzureFileShare/Database/PAR-black.png');
			tm_stream = await pdfDoc.embedPng(logoFile);
	}
	const modelBarcode = await pdfDoc.embedPng(canvasStream(data.model, 1));

	data.serials.map(async serial => {
		const page = pdfDoc.addPage(pdfLibSizeRef[data.label]);
		const {width, height} = page.getSize();
		let scaleFactor = 1;
		switch (data.label) {
			case '1801 Model Serial Label':
				// draw logo
				scaleFactor = (((1/7)* width) / tm_stream.width);
				page.drawImage(tm_stream, {
					x: 3,
					y: 33,
					width: tm_stream.width * scaleFactor,
					height: tm_stream.height * scaleFactor
				});
				// draw address info
				page.drawText("PARTech Inc.", {
					x: 3 + width * 1/5 + 2,
					y: 37,
					size: fontSize - 2,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				page.drawText("8383 Seneca Tpk, New Hartford, NY 13413", {
					x: 3 + width * 1/5 + 2,
					y: 33,
					size: fontSize - 3,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				//draw model text and barcode
				page.drawText("Model #:", {
					x: 3,
					y: height - 1.9 * fontSize - 0.5,
					size: fontSize - 1,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				page.drawText(data.model, {
					x: width * 4/9 - data.model.length * (fontSize/5) * .5,
					y: height - 1.9 * fontSize - 0.5,
					size: fontSize,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				scaleFactor =  (3/4) * (width/modelBarcode.width);
				page.drawImage(modelBarcode, {
					x: (width / 2) - ((modelBarcode.width * scaleFactor) / 2) + 5,
					y: 9,
					width: modelBarcode.width * scaleFactor,
					height: modelBarcode.height * (8/10)
				});
				// draw serial text and barcode
				page.drawText("Serial #:", {
					x: 3,
					y: 11,
					size: fontSize - 1,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				page.drawText(serial, {
					x: width * 4/9 - serial.length * (fontSize/5) * .5,
					y: 11,
					size: fontSize,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				serialBarcode = await pdfDoc.embedPng(canvasStream(serial, 1));
				scaleFactor = (1/2) * (width/serialBarcode.width);
				page.drawImage(serialBarcode, {
					x: (width / 2) - ((serialBarcode.width * scaleFactor) / 2) - 7,
					y: -8,//(1/8)*height,// - serialBarcode.height,
					width: serialBarcode.width * scaleFactor * 1.7,
					height: serialBarcode.height * (8/10)
				});
				break;
			case 'Service Repair 1801':
				// draw serial text and barcode
				page.drawText("PR" + data.model, {
					x: (width / 7) - 6,
					y: 28,
					size: fontSize+4,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				page.drawText("Loc: " + serial, {
					x: (width / 7) - 6,
					y: 15,
					size: fontSize+4,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				page.drawText(Date().slice(4, 15), {
					x: (width / 7) - 6,
					y: 2,
					size: fontSize+4,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				page.drawText(data.initial, {
					x: 4 * (width / 5),
					y: 28,
					size: fontSize+4,
					font: timesRomanFont,
					color: rgb(0,0,0)
				});
				page.setRotation(degrees(90));
				break;
			case 'Cycle Charge Label':
				page.drawText(Date().slice(4, 15), {
					x: 0,
					y: 20,
					size: fontSize+25,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				break;
			case 'Box Model 1801':
				// draw serial text and barcode
				page.drawText(data.model, {
					x: (width / 2) - ((serial.length * fontSize) / 4),
					y: 28,
					size: fontSize+4,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				scaleFactor = (1/2) * (width/modelBarcode.width);
				page.drawImage(modelBarcode, {
					x: (width / 2) - ((modelBarcode.width * scaleFactor) / 2) - 22,
					y: -9,//(1/8)*height,// - serialBarcode.height,
					width: modelBarcode.width * scaleFactor * 1.9,
					height: modelBarcode.height *1.5
				});
				//draw rev
				page.drawText("DATE: " + commonFormatDate(), {
					x: 3.5,
					y: 2,
					size: fontSize-3,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				break;
			case 'Phase 1801':
				// draw logo
				scaleFactor = (((2/5)* width) / tm_stream.width);
				page.drawImage(tm_stream, {
					x: 3,
					y: 33,
					width: tm_stream.width * scaleFactor,
					height: tm_stream.height * scaleFactor
				});
				//draw model text and barcode
				page.drawText("Model #:        " + data.model, {
					x: 3,
					y: height - 1.9 * fontSize - 0.5,
					size: fontSize,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				scaleFactor =  (3/4) * (width/modelBarcode.width);
				page.drawImage(modelBarcode, {
					x: (width / 2) - ((modelBarcode.width * scaleFactor) / 2) + 5,
					y: 9,
					width: modelBarcode.width * scaleFactor,
					height: modelBarcode.height * (8/10)
				});
				// draw serial text and barcode
				page.drawText("Serial #:  " + serial, {
					x: 3,
					y: 11,
					size: fontSize,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				serialBarcode = await pdfDoc.embedPng(canvasStream(serial, 1));
				scaleFactor = (1/2) * (width/serialBarcode.width);
				page.drawImage(serialBarcode, {
					x: (width / 2) - ((serialBarcode.width * scaleFactor) / 2) - 7,
					y: -8,//(1/8)*height,// - serialBarcode.height,
					width: serialBarcode.width * scaleFactor * 1.7,
					height: serialBarcode.height * (8/10)
				});
				//draw rev
				page.drawText("REV.: 1.0", {
					x: 3.5,
					y: 2,
					size: fontSize-3,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				break;
			case 'Model Serial 1801':
				//draw model text and barcode
				page.drawText("Model #:        " + data.model, {
					x: 3,
					y: height - 1.9 * fontSize - 0.5,
					size: fontSize,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				scaleFactor =  (3/4) * (width/modelBarcode.width);
				page.drawImage(modelBarcode, {
					x: (width / 2) - ((modelBarcode.width * scaleFactor) / 2) + 5,
					y: 9,
					width: modelBarcode.width * scaleFactor,
					height: modelBarcode.height * (8/10)
				});
				// draw serial text and barcode
				page.drawText("Serial #:  " + serial, {
					x: 3,
					y: 11,
					size: fontSize,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				serialBarcode = await pdfDoc.embedPng(canvasStream(serial, 1));
				scaleFactor = (1/2) * (width/serialBarcode.width);
				page.drawImage(serialBarcode, {
					x: (width / 2) - ((serialBarcode.width * scaleFactor) / 2) - 7,
					y: -8,//(1/8)*height,// - serialBarcode.height,
					width: serialBarcode.width * scaleFactor * 1.7,
					height: serialBarcode.height * (8/10)
				});
				//draw rev
				page.drawText("REV.: 1.0", {
					x: 3.5,
					y: 2,
					size: fontSize-3,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				break;
			case '1901':
				//draw model text and barcode
				fontSize = 6;
				page.drawText(data.model, {
					x: width/2 - data.model.length * 2,
					y: 5,
					size: fontSize,
					font: timesRomanFont,
					color: rgb(0, 0, 0)
				});
				scaleFactor = (width/modelBarcode.width);
				page.drawImage(modelBarcode, {
					x: -1,
					y: -5.5,//(1/8)*height,// - serialBarcode.height,
					width: modelBarcode.width * scaleFactor,
					height: height * 1.5
				});
		}

	});
	const pdfBytes = await pdfDoc.save();
	//const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
	return pdfBytes;
}
export { createPdf };
