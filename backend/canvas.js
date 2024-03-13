import jsbarcode from 'jsbarcode';
import { createCanvas } from 'canvas';
// figure out how to put more js barcodes in the same canvas or remove the white background from js barcode
function canvasStream(data, scale) {
	let can = createCanvas();
	let safeData = data === "" ? "BLANK" : data;
	jsbarcode(can, safeData, {
		width: scale,
		font: "Tahoma",
		text: String.fromCharCode(0),
		height: 10,
		fontSize: 0,
		background: 'rgba(0,0,0,0)'
	});
	//let ctx = can.getContext('2d', {pixelFormat: 'A8'});
	//ctx.font = '12px Tahoma';
	//ctx.fillText(safeData, 15 + (-can.width / 2), 15 - (100 / 2), 100);

	return can.toBuffer('image/png', {resolution: undefined});//, filters: canvas.PNG_ALL_FILTERS, palette: undefined, backgroundIndex: 0, resolution: undefined});
}

export { canvasStream };
