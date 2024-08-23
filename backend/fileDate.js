import constants from "./constants.js"
const fsm = constants.fsManager;

const LOGPATH = "./frontend/logs/";

function dateConverter (date) {
    let dateArray = date.slice();
    let monthValue = dateArray[0] * 100;
    let dayValue = dateArray[1];
    let yearValue = dateArray[2] * 10000;
    return monthValue + dayValue + yearValue;
}

async function orderedLogFiles() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let fileNames = await fsm.readdir(LOGPATH);
    let reworkFilePattern = /^rework_.*/i;
    let reworkFiles = [];
    for (let fileName of fileNames) {
        if (fileName.match(reworkFilePattern)) reworkFiles.push(fileName);
    };
    fileNames = reworkFiles;
    let scoredNames = Array();
    for (let file of fileNames) {
        for (let i=0; i<12; i++) {
            if (file.slice(4+7,7+7) === months[i]) {
                let year = parseInt(file.slice(11+7,15+7))*100000000;
                let month = (i+1)*1000000;
                let day = parseInt(file.slice(8+7,10+7))*10000;
                let hour = parseInt(file.slice(23, 25)) ? parseInt(file.slice(23, 25)) * 60 : 0;
                let minute = parseInt(file.slice(26, 28)) ? parseInt(file.slice(26, 28)): 0;

                let fileScoreObj = { name: file, score: year + month + day + hour + minute }
                scoredNames.push(fileScoreObj);
            }
        }
    }

    let scoreArray = [];
    for (let obj of scoredNames) {
        scoreArray.push(obj.score);
    }
    scoreArray.sort((a, b) => a-b);

    let sortedNameArray = Array(scoreArray.length);
    for (let x=0; x<scoreArray.length; x++) {
        for (let obj of scoredNames) {
            if (scoreArray[x] === obj.score) sortedNameArray[x] = obj.name;
        }
    }

    return sortedNameArray;
}

async function combineLogs() {
    let logList = await orderedLogFiles();
    let clp = LOGPATH + "Rework_Log_Combined.csv";
    fsm.write(clp);
    for (let logFile of logList) {
        fsm.append(clp, await fsm.read(LOGPATH + logFile));
    }
}

function commonFormatDate() {
    let today = Date().toString().slice(4,15);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for ( let month of months) {
        if (today.includes(month)) {today = (months.indexOf(month)+1) + today.slice(3,today.length);}
    }
    today = today.replace(/\s/g, "/");
    return today;
}

export { dateConverter, combineLogs, commonFormatDate }