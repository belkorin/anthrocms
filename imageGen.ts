import * as PImage from "pureimage"
import { Writable } from "stream";

export class ImageGen {
    static async getBanner(text: string) {

        const p = new Promise<string>(async (resolve, reject) => {

            var fnt = PImage.registerFont('assets/KOMIKAX.ttf','KOMIKAX', 1, "regular", null);
            fnt.loadSync();
        
            var img = PImage.make(2000,750, null);
            var ctx = img.getContext('2d');
            ctx.fillStyle = 'rgba(255,255,255,0)'
            ctx.fillRect(0,0, 2000, 750);

            ctx.fillStyle = '#000';
            let fontSize = 240;
            ctx.font = `${fontSize}pt 'KOMIKAX'`;
            let zzz = ctx.measureText(text);
            while(zzz.width > img.width-50) {
                fontSize -= 20;
                ctx.font = `${fontSize}pt 'KOMIKAX'`;
                zzz = ctx.measureText(text);
            }

            ctx.fillText(text, 1000-(zzz.width/2), 375-(zzz.emHeightDescent*2));

            let buff = Buffer.alloc(0);

            let stream = new Writable({
                write: function(chunk, encoding, next) {
                  //console.log(chunk.toString());

                    const newBuffer = Buffer.from(chunk);
                    buff = Buffer.concat([buff, newBuffer]);

                  next();
                }});

            await PImage.encodePNGToStream(img, stream);

            resolve(`data:image/png;base64,${buff.toString('base64')}`);
        });

        return await p;
    }
}