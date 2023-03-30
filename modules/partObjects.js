//import * as readline from 'node:readline';
//import axios from 'axios';
//axios.defaults.withCredentials = true;
import * as fs from 'node:fs';
var promFS = fs.promises;

const MFG_PARTS_FILE = './ref_csv/Manufacturer-part-numbers.csv';
const PROD_BOMS_FILE = './ref_json/prodboms.json';
const PART_DESCRIPTIONS_FILE = './ref_json/searchNames.json';

const BAD_BOM_ITEMS = ['754*', '755*', '893*', '713*', '772*', '850*', '262*', 'M6*', 'T8*', 'M9*'];

// REMOVES BOM ITEMS THAT ARE NOT TRACKED IN THE REWORK TOOL
async function filterBOMArray(bomItems) {
    let newBomItems = [];
    bomItems.forEach(j => {
        let matches = false;
        BAD_BOM_ITEMS.forEach(k => {
            // figure out how to check the first few characters not each number
            if (k[k.length-1] == '*') {
                if (k.slice(0,k.length-1) == j.itemNum.slice(0,k.length-1)) {matches = true;}
            }
            else if (!BAD_BOM_ITEMS.includes(j.itemNum)) {matches = true;}
        });
        if (!matches) {newBomItems.push(j);}
    });
    return newBomItems;
}

// GET BILL OF MATERIALS LIST FROM PRODUCTION ORDER NUMBER
async function getBOMFromProd(prodNumber) {
    let bomItems = [];
    let fileDat = await fs.promises.readFile(PROD_BOMS_FILE, async function (err, data) {if (err) throw err;});
	let fileJSON = JSON.parse(fileDat.toString('utf8'));
	fileJSON.forEach(j => {
		if (j.ProductionOrderNumber === prodNumber && j.BOMLineQuantity != 0) {
			bomItems.push({ make: j.SourceBOMId, itemNum: j.ItemNumber, qty: j.BOMLineQuantity });
		}
	});
	return filterBOMArray(bomItems);
}

// RETURNS A LIST OF MANUFACTURER PART NUMBERS FOR A GIVEN PAR PART
async function getMFG (parPart) {
	let relevant_mfg_part_numbers = [];
	let raw = await fs.promises.readFile(MFG_PARTS_FILE, async function (err, data) {if (err) throw err;});
	let mfg_parts_list_split_by_line = raw.toString('utf8').split('\n');
	mfg_parts_list_split_by_line.forEach(line => {
		let line_par_part = line.split(';')[2];
		let line_mfg_part = line.split(';')[1];
		if (parPart === line_par_part) {
			relevant_mfg_part_numbers.push(line_mfg_part);
		}
	});
	return relevant_mfg_part_numbers;
}

// GET THE SEARCH NAME OF A PAR PART NUMBER/ ITEM NUMBER FROM RELEASEDDISTINCTPRODUCTDETAILSV2
async function getSearchName (parPart) {
	let searchName = "Name Not Found";
	let raw = await fs.promises.readFile(PART_DESCRIPTIONS_FILE, async function (err, data) {if (err) throw err;});
	let jsonObject = JSON.parse(raw.toString('utf8'));
	jsonObject.forEach(j => {
		if (j['ItemNumber'] === parPart) searchName = j['SearchName'];
	});
	return searchName;
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

export { getMFG, getModel, compareModels, getBOMFromProd, getSearchName }
