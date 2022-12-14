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
            client_id: '',
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
        'Authorization': 'Bearer *bearercode*'
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