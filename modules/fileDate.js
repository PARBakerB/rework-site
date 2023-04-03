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
    const fileNames = fs.readdirSync("./static/logs");
    var x = Array();
    fileNames.forEach(function (file) {
        if (file.includes("loginfo")) return;
        for (let i=0; i<12; i++) {
            if (file.slice(4,7) === months[i]) {
                x.push(((i+1)*100) + parseInt(file.slice(8,10)) + parseInt(file.slice(11,15)*10000));
            }
        }
    });
    return fileNames[x.indexOf(Math.max(...x)) +1];
}