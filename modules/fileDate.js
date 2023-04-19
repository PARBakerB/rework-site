import * as fs from 'node:fs';

function fileStatsBirthTime() {
    fs.stat("./.gitignore", (error, stats) => {
        if (error) {
            console.log(error);
            return;
        }
        console.log(stats.birthtime);
    });
}

export function greatestLogDate() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let fileNames = fs.readdirSync("./static/logs");
    let badFileIndex = fileNames.indexOf('loginfo.txt');
    fileNames = fileNames.slice(0, badFileIndex).concat(fileNames.slice(badFileIndex + 1, fileNames.length));

    var x = Array();
    for (let file of fileNames) {
        for (let i=0; i<12; i++) {
            if (file.slice(4,7) === months[i]) {
                x.push(((i+1)*100) + parseInt(file.slice(8,10)) + parseInt(file.slice(11,15)*10000));
            }
        }
    }

    return fileNames[x.indexOf(Math.max(...x))];
}
