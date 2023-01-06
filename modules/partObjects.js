import * as fs from 'node:fs';
//import * as readline from 'node:readline';

import axios from 'axios';
axios.defaults.withCredentials = true;

// GET ACCESS TOKEN FOR ODATA API CALLS
async function getAccess() {
    return ( await axios({
		method: 'post',
		url: 'https://login.microsoftonline.com/common/oauth2/authorize?resource=https://partech.operations.dynamics.com/',
        form: {
            grant_type: 'client_credentials',
            client_secret: '',
            client_id: '51f81489-12ee-4a9e-aaae-a2591f45987d',
            resource: 'https://partech.operations.dynamics.com/'
        }
	})).data
}

// RETURNS A LIST OF ITEMS ON BOM OF A PRODUCTION ORDER
async function getProdBom (prodNumber) {
    // Use this link to get a top level of queryable data https://partech.operations.dynamics.com/data/
    // Use this link to get a BOM for PROD-011286 https://partech.operations.dynamics.com/data/ProductionOrderBillOfMaterialLines?$filter=ProductionOrderNumber eq 'PROD-011286'
    const prodBomGetterLink = (pn) => {
        return 'https://partech.operations.dynamics.com/data/ProductionOrderBillOfMaterialLines?$filter=ProductionOrderNumber eq \''+ pn + '\'';
    }
    var config = {
      method: 'get',

      url: prodBomGetterLink(prodNumber),
      // Authorization line will need to be replaced with a variable set by getAccess
      headers: { 
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJodHRwczovL3BhcnRlY2gub3BlcmF0aW9ucy5keW5hbWljcy5jb20vIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjIyZDhlMWYtOTM3OS00OWYxLThmNGUtY2EyNmQxYzI0NjAyLyIsImlhdCI6MTY3Mjg0MzUzMywibmJmIjoxNjcyODQzNTMzLCJleHAiOjE2NzI4NDgzOTksImFjciI6IjEiLCJhaW8iOiJBVlFBcS84VEFBQUFzL2doUEhYbENUZXZwRlp1a0ZvbFNvYUVUVW9oQ1ZzS212MjJsK3M1Q2pUUC9ickpIaUNYb1djcjRZUGRoeFhTSU5rdzdCL29iVG5Ha0plUElNalJXRDFaVkxPTUdLanNNUDR1a0xUcWFpRT0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiNTFmODE0ODktMTJlZS00YTllLWFhYWUtYTI1OTFmNDU5ODdkIiwiYXBwaWRhY3IiOiIwIiwiZmFtaWx5X25hbWUiOiJCYWtlciIsImdpdmVuX25hbWUiOiJCcmV0dCIsImlwYWRkciI6IjE5Mi4xMzMuNjMuNSIsIm5hbWUiOiJCcmV0dCBCYWtlciIsIm9pZCI6IjIwZjM5YzM1LTI2ZTUtNGIwZC1iNzFmLTE2ZTFjNTI4ZDNjZSIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS0zODUwNDEyNjE1LTM3MDg0NzE3NDUtMTI1MTc4MTc3LTM5MzY0IiwicHVpZCI6IjEwMDMyMDAwREM1OEM2NDIiLCJyaCI6IjAuQVJ3QUg0NHRJbm1UOFVtUFRzb20wY0pHQWhVQUFBQUFBQUFBd0FBQUFBQUFBQUFjQU40LiIsInNjcCI6InVzZXJfaW1wZXJzb25hdGlvbiIsInN1YiI6IjBTY21qZlduVHRXN1lwcm9CMlY5dU5QMmVHbE1YOU1TZktNMm1jcWFwZEUiLCJ0aWQiOiIyMjJkOGUxZi05Mzc5LTQ5ZjEtOGY0ZS1jYTI2ZDFjMjQ2MDIiLCJ1bmlxdWVfbmFtZSI6IkJyZXR0X0Jha2VyQHBhcnRlY2guY29tIiwidXBuIjoiQnJldHRfQmFrZXJAcGFydGVjaC5jb20iLCJ1dGkiOiJnMDJ3enFwMTZFYVM3a0I1TXdLWEFRIiwidmVyIjoiMS4wIn0.INWB79mRPtRkY-jsnJMiTZEmSia5OmBiui1F6-ZKZYoLNSEsj7Zz6L5IL-dCIXBWltSvdp-e2IofVNLooTEknlF5Ng6sjPRV-aIn-K2_IBYhD48KruZta-YebeSnaV_BBHD4UN129XsmQ7Fsb822J6NsObaxw8lBkHty3SvqZhJB70OOS8iDOnuB9LCP7XqHr3X0g6eyMsEismq3Jd5nMmS5WNJP0YGB2xozK32eKFWxYAR8omuuw3maeEJ5rgubhQs8ORlWRI7I6_BF9HhPYiU66xwOarJpr4lphmTYByD1wsBpW6HeW0abhp1pkHjiq3F6kcEQiWtaAaYpFjAzHA'
      }
    };
    return (await axios(config)).data.value;//.then(function (response) {
}

// RETURNS A LIST OF MANUFACTURER PART NUMBERS FOR A GIVEN PAR PART
async function getMFG (parPart) {
    let pp = parPart.toUpperCase();
    try {
        let raw = fs.promises.readFile('./ref_json/mfg_pns.json');
        let mfgObj = JSON.parse(await raw);
        let retVal = mfgObj[pp] == undefined ? [] : mfgObj[pp];
        return retVal;
    }
    catch { return []; }
}

// RETURNS A JS OBJECT FROM THE JSON FILE, RETURNS EMPTY OBJECT IF INVALID INPUT
async function getModel (modelNumber) {
    let mn = modelNumber.toUpperCase();
    try {
        let raw = fs.promises.readFile('./ref_json/'+mn+'.json');
        return JSON.parse(await raw);
    }
    catch { return {}; }
}

// COMPARES TERMINAL JS OBJECT WITH GENERIC MODEL JS OBJECT, RETURNS DIFFERING PROPERTIES
function compareModels (termObj, modelNumber) {
    let retVal = {};
    if (!modelNumber.reworks.includes(termObj.model)) { return false; }
    for (const prop in modelNumber) {
        let isArrayofValidParts = Array.isArray(modelNumber[prop]);
        let emptyArrayemptyStringEquality = modelNumber[prop].length == 0 && termObj[prop] == '';
        let partNotInModel = !modelNumber[prop].includes(termObj[prop]) && !emptyArrayemptyStringEquality;
        let notListofValidReworks = prop != "reworks";
        if (isArrayofValidParts && partNotInModel  && notListofValidReworks) {
            retVal[prop] = modelNumber[prop];
        }
    }
    return retVal;
}
/* example termObj
{
    model: "M6160-25",
    serial: "serialNumber",
    ram: "980027082",
    storage: "950006107",
    pedestal: "980027063",
    cust_dis: '',
    msr: ''
}
*/

// END OF MODULE FUNCTIONS
/******************************************************************************************/
// OBJECT CREATION NODE SCRIPT

// console input object, causes node to hang weirdly so commented out until needed
/*const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});*/
const groups = {
    M6150: ["M6150", "M6150-01", "M6150-02", "M6150-03", "M6150-10", "M6150-12", "M6150-20", "M6150-L","M6150-AGILY3","M6150-AGILY1-8","M6150-AGILY3-8","M6150-AGILY-8","M6150-AGILY1"],
    M6155: ["M6155", "M6155-02", "M6155-10", "M6155-AGILY-8"],
    M6160: ["M6160", "M6160-20", "M6160-25"],
    M6165: ["M6165", "M6165-03", "M6165-05", "M6165-20"]
}
// QUERYS CONSOLE FOR VALUES TO WRITE TO A JSON OBJECT FILE AS A MODEL ENTRY
async function createModel () {
    const model = {};
    model.model = await new Promise((resolve)=>{
        rl.question("\nWhat is the model number?\n", resolve);
    });
    model.reworks = groups[await new Promise((resolve)=>{
        rl.question("\nWhich reconfig group does it fall into?\n", resolve);
    })];
    model.ram = [await new Promise((resolve)=>{
        rl.question("\nWhat is the ram part number?\n", resolve);
    })];
    model.storage = [await new Promise((resolve)=>{
        rl.question("\nWhat is the storage part number?\n", resolve);
    })];
    model.pedestal = [await new Promise((resolve)=>{
        rl.question("\nWhat is the pedestal part number?\n", resolve);
    })];
    model.cust_dis = [await new Promise((resolve)=>{
        rl.question("\nWhat is the customer display part number?\n", resolve);
    })];
    model.msr = [await new Promise((resolve)=>{
        rl.question("\nWhat is the msr part number?\n", resolve);
    })];
    for (const prop in model) {
        if (Array.isArray(model[prop]) && model[prop].length == 1 && model[prop][0] == '') {model[prop] = [];}
        if (prop == 'model') {model[prop] = model[prop].toUpperCase();}
    }
    fs.writeFile("./ref_json/"+model.model.toUpperCase()+".json", JSON.stringify(model), (err)=>{
        if (err) throw err;
        rl.close();
    });
    rl.on('close', ()=>{
        console.log("Model file creation completed.");
        process.exit(0);
    });
}

//createModel();
// console.log(typeof(await getProdBom('PROD-030324')));
// fs.writeFile('./prodbom.json',JSON.stringify(await getProdBom('PROD-030324')), (err)=>{
//     if (err) throw err;
// });

//console.log(await getAccess());

export { getMFG, getModel, compareModels, getProdBom }