import { Part } from './elementObject.js';

// GLOBAL DOM ELEMENTS
const send = document.getElementById('send');
const input = document.getElementById('input');
const qtyInput = document.getElementById('qty');
const logReq = document.getElementById('log-request');
const qtys = document.getElementsByClassName('qtys');
const logReqs = document.getElementsByClassName('log-requests');
const notesInput = document.getElementById("notes").children[0].children[1];
const logOut = document.getElementById("log-output");
const errMsg = document.getElementById("errorMsg");

// GLOBAL DOM ELEMENTS THAT CHANGE
var inputs = document.getElementsByClassName('inputs');
var checkForms = document.getElementsByClassName('checkboxes');
var reworkParts = document.getElementsByClassName("rw-part");

// GLOBAL VARIABLES
var inOut = [0,0];
var disabledArray = [];
const assemblyPartNumbers = ['M9100-10','M9100-11','M9110-11','M9110-21'];
const M910010to11 = [1, 1, "M9100-10", "M9100-11", [true, true, true], "980029758", "POS-TGL-BC1", [true, false, true], "980029756", "20M204DA4"];
const M911011to21 = [1, 2, "M9110-11", "M9110-21", [true, false, true], "980029707", "TS128GMTE652T-PAR", [true, false, true], "980029706", "TS1GSH64V2B-PAR", [true, false, true], "980029757", "TS256GMTE712A-PAR"]

// REFRESH PAGE ELEMENT VARIABLES THAT CHANGE DURING UI INTERACTION
function updateVariableElements() {
	inputs = document.getElementsByClassName('inputs');
	Object.values(inputs).forEach((j) => {if (j.getAttribute('listener') !== 'true') {j.addEventListener("keydown",inputCycle)}});
	checkForms = document.getElementsByClassName('checkboxes');
	reworkParts = document.getElementsByClassName("rw-part");
}

// TAKES DOM ELEMENT OR DOM ELEMENT ARRAY WITH HIDE OR SHOW CLASS AND SWAPS THEM OUT
// ONLY WORKS ON ELEMENTS WITH VISIBILITY CLASS 'hide' OR 'show'
function toggleVisibility(domObject, value) {
	if (Array.isArray(domObject)) {
		domObject.forEach(j => {
			if (j.classList.contains('hide') && value == true) {
				j.classList.remove('hide');
				j.classList.add('show');
			} else if (j.classList.contains('show') && value == false) {
				j.classList.remove('show');
				j.classList.add('hide');
			}
		});
	} else {
		if (domObject.classList.contains('hide') && value == true) {
			domObject.classList.remove('hide');
			domObject.classList.add('show');
		} else if (domObject.classList.contains('show') && value == false) {
			domObject.classList.remove('show');
			domObject.classList.add('hide');
		}
	}
}

// PREVENT A DOM INPUT FROM BEING MODIFIED
function disableInput(domInput) {
	if (domInput.disabled == false) {
		disabledArray.push(domInput);
		domInput.disabled = true;
	}
}

// PLAY BUZZER NOISE TO ALERT USER OF MISINPUT
function playBuzzer() {
	document.getElementById('buzz').play();
}

// POST ARG rwdata TO SERVER
async function postRework(rwdata) {
	let stringdata = rwdata.join();
	axios({
		method: 'post',
		url: stringdata,
		headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
	});
}

// ASK WHICH PARTS NEED TO BE CHANGED FOR REWORK
async function howRework(ft, mn) {
	let dataObj = {fakeTerm: ft, modelNumber: mn}
	return ( await axios({
		method: 'post',
		url: '420compare420',
		data: JSON.stringify(dataObj)
	})).data;
}

// GET GENERIC DESCRIPTOR FOR A TERMINAL MODEL NUMBER
async function getTermJSON(mn) {
	return ( await axios ({
		method: 'post',
		url: '420getModel420',
		data: mn
	})).data;
}

// GET MANUFACTURER PART NUMBERS FOR A PAR PART
async function getMFG(mn) {
	return ( await axios ({
		method: 'post',
		url: '420getMFG420',
		data: mn
	})).data;
}

// GET PROD BOM
async function getBOMFromProd(mn) {
	return ( await axios ({
		method: 'post',
		url: '420getPROD420',
		data: mn
	})).data;
}

// RETURNS FILE STREAM OF ACTIVE LOG FILE
function getLogRequest() {
	return axios({
		method: 'get',
		url: "log.csv",
		headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
	});
}

// GET INPUT HTML FILES FOR CREATING PART FIELDS
function getFile(fileName) {
	return axios({
		method: 'get',
		url: fileName,
		headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
	});
}

// FORM SUBMISSION USING SUBMIT BUTTON
function postInputs() {
	let qty1 = qtyInput.elements[1].value !== "" ? parseInt(qtyInput.elements[1].value) : 0;
	let qty2 = qtyInput.elements[2].value !== "" ? parseInt(qtyInput.elements[2].value) : 0;
	let partQty = [qty1, qty2];
	let arraysize = partQty[1]>partQty[0] ? partQty[1]*5*2 : (partQty[0]*5*2)-5;
	let rwdata = new Array(arraysize + 2);
	let i = -1;
	Object.values(inputs).forEach((j) => {
		// csv format processing for insertion into excel
		if (i === -1) {rwdata[0] = j.value}
		else if (i < partQty[0]*5) {
			let index = i>4 ? (i%5) + (Math.floor(i/5) * 10) : i;
			rwdata[index+1] = j.value;
		} else {
			let h = i-(partQty[0]*5);
			let index = (h%5) + (Math.floor(h/5)*10) + 5;
			rwdata[index+1] = j.value;
		}
		if (!(i%5 === 0 || i%5 === 2)) {j.value='';}
		i++;
	});
	rwdata[i] = notesInput.value;
	notesInput.value = '';
	let statarray = [qtyInput.elements[0].value,qtyInput.elements[5].value,qtyInput.elements[3].value,
		qtyInput.elements[4].value,rwdata[0],qtyInput.elements[6].value, 
		qtyInput.elements[7].value,qtyInput.elements[8].value
	];
	postRework(statarray.concat(rwdata.slice(1)));
}
send.addEventListener('click', () => {
	postInputs();
	input.elements[0].focus();
});

// HELPER FUNCTION FOR INPUT CYCLE, UPDATES THE VALUES IN checks TO BE RELATIVE TO CURRENT CONTEXT
function refreshChecks(iter) {
	let checks = [];
	for (let x=1; x<4; x++) {
		checks.push(checkForms[Math.floor(iter/8)].children[x].children[0].children[0].checked);
	}
	return checks;
}

//MISTAKEN SCAN ERROR DETECTION
function scanErrorDetect(index) {
	let modelIn = qtyInput[3].value;
	let misScans = assemblyPartNumbers.concat([modelIn]);
	let wrongItemScanned = misScans.includes(input.elements[index].value.toUpperCase());
	if (index === 0 && wrongItemScanned) {
		playBuzzer();
		input.elements[index].value = '';
		document.getElementById("errorLightUpWindow").classList.add("error-container");
	}
	return index === 0 && wrongItemScanned;
}

// NAVIGATING BETWEEN INPUTS AND FORM SUBMISSION USING ENTER KEY
function inputCycle(event) {
	let index = [...input].indexOf(event.target);
	let ii = index-1 > -1 ? index-1 : 0;
	let checks = [];
	if (event.key==="Enter") {
		if (!scanErrorDetect(index)) {
			document.getElementById("errorLightUpWindow").classList.remove("error-container");
			if (ii%8 < 3) {
				index = input.elements[(Math.floor(ii/8)*8)+4].value !== "" ? (Math.floor(ii/8)*8)+5 : (Math.floor(ii/8)*8)+4;
				ii = index-1;
				checks = refreshChecks(ii);
				input.elements[index].focus();
			}
			try {
				while ((input.elements[index].value !== "") || (ii%8 === 4 && checks[0]) || (ii%8 === 6 && checks[1]) || (ii%8 === 7 && checks[2])) {
					index++;
					ii++;
					if (ii%8 < 3) {
						index = input.elements[(Math.floor(ii/8)*8)+4].value !== "" ? (Math.floor(ii/8)*8)+5 : (Math.floor(ii/8)*8)+4;
						ii = index-1;
					}
					checks = refreshChecks(ii);
				}
				input.elements[index].focus();
			} catch {
				if (input.elements[0].value !== "") {
					let usedPartsArray = [];
					Object.values(reworkParts).forEach(part => {
						usedPartsArray.push(new Part(part));
					});
					usedPartsArray.forEach(part => { part.savePart(); });
					postInputs();
					errMsg.innerText = "";
				} else {
					playBuzzer();
					errMsg.innerText = "Please enter an assembly serial number to log a rework.";
				}
				// return to first input
				input.elements[0].focus();
			}
		}
	}
}
Object.values(inputs).forEach((j) => {j.addEventListener("keydown",inputCycle)});

// GRAB QTY INPUTS ON UPDATE, CYCLE THROUGH FORM ON ENTER
async function qtyUpdate(event) {
	if (event.key==="Enter" || event.target == null) {
		let index = [...qtyInput].indexOf(event.target);
		if (index <= 7) {
			qtyInput.elements[index + 1].focus();
			if (index == 0) { autoSetupByProd(); }
		}
		else {input.elements[0].focus();}
		let isQty = [1, 2].includes(index) || event.target == null;
		let checkQtys = (qtyInput.elements[1].value !== "" || qtyInput.elements[2].value !== "");
		if (isQty && checkQtys) {
			let qty1 = qtyInput.elements[1].value !== "" ? parseInt(qtyInput.elements[1].value) : 0;
			let qty2 = qtyInput.elements[2].value !== "" ? parseInt(qtyInput.elements[2].value) : 0;
			let po = await getFile("PartsOut.html");
			let pi =  await getFile("PartsIn.html");
			let partOutInputs = po.data;
			let partInInputs = pi.data;
			let partArray = new Array(qty1).fill(partOutInputs).concat(new Array(qty2).fill(partInInputs));
			if (inOut[0] !== qty1 || inOut[1] !== qty2) {
				document.getElementById('parts').innerHTML=partArray.join("");
				inOut[0] = qty1;
				inOut[1] = qty2;
			}
			updateVariableElements();
		}
		else if (!checkQtys) {
			document.getElementById('parts').innerHTML="";
			inOut[0] = 0;
			inOut[1] = 0;
			updateVariableElements();
		}
	}
}
Object.values(qtys).forEach((j) => {j.addEventListener("keyup",qtyUpdate)});

// AUTOMATED PROD SETUP USING INFORMATION FROM PRODUCTION ORDER BOMS DATABASE AND MANUFACTURER PART NUMBER DATABASE
async function autoSetupByProd() {
	// find the number of parts coming in and out based on the prod number
	let bom = await getBOMFromProd(qtyInput.elements[0].value);
	let partsOutQty = 0;
	let partsInQty = 0;

	qtyInput.elements[1].value = partsOutQty;
	qtyInput.elements[2].value = partsInQty;
	await qtyUpdate(document.createEvent('Event'));

	function stringInWCList (str, wildcards) {
		let matches = false;
		wildcards.forEach(wc => {
			if (wc.slice(0,wc.length-1) == str.slice(0,wc.length-1)) {matches = true;}
		});
		return matches;
	}

	bom.forEach(bomObject => {
		if (bomObject.qty > 0) {
			if (stringInWCList(bomObject.itemNum,["M6*","M9*","T8*"])) {
				qtyInput.elements[3].value = bomObject.itemNum;
				qtyInput.elements[4].value = bomObject.make;
				return;
			}
			partsInQty += 1;
		} 
		else if (bomObject.qty < 0) {
			partsOutQty += 1;
		}
	});

	qtyInput.elements[1].value = partsOutQty;
	qtyInput.elements[2].value = partsInQty;
	await qtyUpdate(document.createEvent('Event'));

	// store the part input field dom elements in arrays
	let partsIn = [];
	let partsOut = [];
	Object.values(reworkParts).forEach(part => {
		if (part.innerHTML.includes("Part In")) {
			partsIn.push(new Part(part));
		}
		if (part.innerHTML.includes("Part Out")) {
			partsOut.push(new Part(part));
		}
	});

	// iterate through the bom again and autofill the newly generated part fields 
	// BOMOBJECT: { make, sourceBOMId, itemNum, qty }
	bom.forEach(async bomObject => {
		if (stringInWCList(bomObject.itemNum,["M6*","M9*","T8*"])) {return;}
		// get part fields off the top of either assigned array
		let assignedPartFormInput = bomObject.qty > 0 ? partsIn.pop() : partsOut.pop();
		let valuesObject = {checks: [1,1,1], fields:[bomObject.itemNum,""]};
		if ((await assignedPartFormInput.readPart(valuesObject.fields[0])) !== "no previous uses") {return;}
		// get mfg parts list of item number from bom object
		let mfgPartsList = await getMFG(bomObject.itemNum);
		valuesObject.fields[1] = mfgPartsList[0];
		assignedPartFormInput.writePart(valuesObject);
	});
}

// MOVES FOCUS TO BEGINNING OF FORM ON ENTER PRESS IN NOTES FIELD
notesInput.addEventListener('keyup', (event)=>{
	if (event.key === "Enter") {
		input.elements[0].focus();
	}
});

// INPUT PROCESSING FOR LOG UI SECTION
async function viewLog(event) {
	if (event.key === "Enter") {
		let index = [...logReq].indexOf(event.target);
		if (index<1) {
			logReq.elements[index+1].focus()
		}
		else {
			const logdiv = document.getElementById("log-content");
			const logReqSize = logReqs[1].value;
			const log = await getLogRequest();
			logdiv.innerHTML = "";
			let logArray = log.data.split("\n");
			let x = 0;
			logArray.reverse().forEach(j => {
				let iterableIsNotBlank = j !== "";
				let notExceedRequestedNumberOfLogs = x <= logReqSize;
				let numberInProdStringMatchesRequest = parseInt((j.slice(0, j.indexOf(","))).replace(/\D/g,'')) === parseInt(logReqs[0].value.replace(/\D/g,''));
				if (iterableIsNotBlank && notExceedRequestedNumberOfLogs && numberInProdStringMatchesRequest) {
					logdiv.innerHTML += ("<li>" + j.split(",")[4] + "</li>");
					x++;
				}
			});
			toggleVisibility(logOut, x > 0);
		}
	}
}
Object.values(logReqs).forEach((j)=>{j.addEventListener("keyup",viewLog);});

document.getElementById('printLog').addEventListener('click', async (event) => {

	let pdfData = async () => {
		const requestedSerials = [];
		const logReqSize = logReqs[1].value;
		const log = await getLogRequest();
		let logArray = log.data.split("\n");
		let x = 0;
		logArray.reverse().forEach(j => {
			let iterableIsNotBlank = j !== "";
			let notExceedRequestedNumberOfLogs = x < logReqSize;
			let numberInProdStringMatchesRequest = parseInt((j.slice(0, j.indexOf(","))).replace(/\D/g,'')) === parseInt(logReqs[0].value.replace(/\D/g,''));
			if (iterableIsNotBlank && notExceedRequestedNumberOfLogs && numberInProdStringMatchesRequest) {
				requestedSerials.push(j.split(',')[4]);
				x++;
			}
		});

		let postData = {label: '1801', model: qtyInput.elements[4].value, serials: requestedSerials};
		console.log(postData);
		document.getElementById("printFrame").src = (await axios({
			method: 'post',
			url: '420getPDFPages420',
			data: JSON.stringify(postData)
		})).data;
	}

	toggleVisibility(document.getElementById("pdf-Iframe"), 1);
	pdfData();

});
//document.getElementById('printLog').classList.add('hide');
