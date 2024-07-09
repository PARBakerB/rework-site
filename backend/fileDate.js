import constants from "./backend/constants.js"
const fsm = constants.fsManager;

/*
function fileStatsBirthTime() {
    fs.stat("./.gitignore", (error, stats) => {
        if (error) {
            console.log(error);
            return;
        }
        console.log(stats.birthtime);
    });
}
*/

export function greatestLogDate() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let fileNames = fsm.read("./frontend/logs");
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

export function commonFormatDate() {
    let today = Date().toString().slice(4,15);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for ( let month of months) {
        if (today.includes(month)) {today = (months.indexOf(month)+1) + today.slice(3,today.length);}
    }
    today = today.replace(/\s/g, "/");
    return today;
}
