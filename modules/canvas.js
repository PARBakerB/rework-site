import jsbarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

async function canvasStream(data) {
  let can = createCanvas();
  jsbarcode(can, data, {
    width: 1,
    font: "Tahoma",
    text: String.fromCharCode(0),
    height: 35,
    fontSize: 0
  });
  let ctx = can.getContext('2d', {pixelFormat: 'A8'});
  ctx.font = '12px Tahoma';
  ctx.fillText(data, 15 + (-can.width / 2), 15 - (100 / 2), 100);

  return can.toBuffer('image/png', {resolution: undefined});//, filters: canvas.PNG_ALL_FILTERS, palette: undefined, backgroundIndex: 0, resolution: undefined});
}

export { canvasStream };