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

// DISABLE ENTER PRESS IN FORM
window.addEventListener('keydown', function(e) {
	if (e.keyIdentifier=='U+000A' || e.keyIdentifier=='Enter' || e.keyCode==13) {
		if (e.target.nodeName==='INPUT' && e.target.type==='text') {
			e.preventDefault();
			return false;
		}
	}
}, true);

// REFRESH PAGE ELEMENT VARIABLES THAT CHANGE DURING UI INTERACTION
function updateVariableElements() {
	inputs = document.getElementsByClassName('inputs');
	Object.values(inputs).forEach((j) => {
		j.addEventListener("keydown",inputCycle);
	});
	checkForms = document.getElementsByClassName('checkboxes');
	reworkParts = document.getElementsByClassName("rw-part");
}

// function for visibility to the indexes previously used before date was removed
function qtyInputNoDateAdjustment(previous) {return previous < 6 ? previous : previous - 1}

function commonFormatDate() {
	let today = Date().toString().slice(4,15);
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	for ( let month of months) {
		if (today.includes(month)) {today = (months.indexOf(month)+1) + today.slice(3,today.length);}
	}
	today = today.replace(/\s/g, "/");
	return today;
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

// GET DATE TIME OF LAST DATABASE UPDATE
function getUpdateTime() {
	return axios({
		method: 'get',
		url: 'lastUpdate',
		headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
	});
}

// FORM SUBMISSION USING SUBMIT BUTTON
function postInputs() {
	let qty1 = qtyInput.elements[qtyInputNoDateAdjustment(1)].value !== "" ? parseInt(qtyInput.elements[qtyInputNoDateAdjustment(1)].value) : 0;
	let qty2 = qtyInput.elements[qtyInputNoDateAdjustment(2)].value !== "" ? parseInt(qtyInput.elements[qtyInputNoDateAdjustment(2)].value) : 0;
	let partQty = [qty1, qty2];
	let arraysize = partQty[1]>partQty[0] ? partQty[1]*5*2 : (partQty[0]*5*2)-5;
	let rwDataQty = arraysize + 2 >= 0 ? arraysize + 2 : 0;
	let rwdata = new Array(rwDataQty);
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
	if ( i === 0 ) { rwdata[1] = notesInput.value; } else { rwdata[i] = notesInput.value; }
	notesInput.value = '';
	// REPLACED qtyInput.elements[5].value WITH AN AUTOFILLED DATE FROM Date(), adjusted higher inputs by -1
	let statarray = [qtyInput.elements[qtyInputNoDateAdjustment(0)].value,commonFormatDate(),//qtyInput.elements[5].value,
		qtyInput.elements[qtyInputNoDateAdjustment(3)].value,
		qtyInput.elements[qtyInputNoDateAdjustment(4)].value,rwdata[0],qtyInput.elements[qtyInputNoDateAdjustment(6)].value, 
		qtyInput.elements[qtyInputNoDateAdjustment(7)].value,qtyInput.elements[qtyInputNoDateAdjustment(8)].value
	];
	postRework(statarray.concat(rwdata.slice(1)));
}
send.addEventListener('click', () => {
	postInputs();
	input.elements[0].focus();
});

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
	if (event.key !== "Enter") return;
	let textInputFields = [];
	for (const field of input.elements) {if (field.type === "text") textInputFields.push(field);}

	let textInputIndex = [...textInputFields].indexOf(event.target);
	if(scanErrorDetect([...input].indexOf(event.target))) { textInputFields[0].value = ""; return; }
	else { document.getElementById("errorLightUpWindow").classList.remove("error-container"); }
	while (textInputIndex !== textInputFields.length - 1) {
		textInputIndex = textInputIndex + 1;
		let nextTextInput = textInputFields[textInputIndex];
		let nextTextInputHasCheck = input.elements[[...input].indexOf(nextTextInput) -1].type === "checkbox";
		let nextTextInputChecked = input.elements[[...input].indexOf(nextTextInput) -1].checked;
		let nextInputAlreadyPopulated = nextTextInput.value !== "";
		if ((nextTextInputHasCheck && nextTextInputChecked) || nextInputAlreadyPopulated) {continue;}
		else {
			nextTextInput.focus();
			break;
		}
	}

	if (textInputIndex === textInputFields.length - 1) {
		postInputs();
		textInputFields[0].focus();
	}
}
Object.values(inputs).forEach((j) => {j.addEventListener("keydown",inputCycle)});

// GRAB QTY INPUTS ON UPDATE, CYCLE THROUGH FORM ON ENTER
async function qtyUpdate(event) {
	let index = [...qtyInput].indexOf(event.target);
	if (event.key==="Enter" && index == 0 ) { autoSetupByProd(); return; }
	if (event.key==="Enter" || event.target == null) {
		if (index <= 7 && event.target != null) {
			qtyInput.elements[index + 1].focus();
		} else if (event.target == null) {qtyInput.elements[qtyInputNoDateAdjustment(5)].focus();}
		else {input.elements[0].focus();}
		let isQty = [1, 2].includes(index) || event.target == null;
		let checkQtys = (qtyInput.elements[qtyInputNoDateAdjustment(1)].value !== "" || qtyInput.elements[qtyInputNoDateAdjustment(2)].value !== "");
		if (isQty && checkQtys) {
			let qty1 = qtyInput.elements[qtyInputNoDateAdjustment(1)].value !== "" ? parseInt(qtyInput.elements[qtyInputNoDateAdjustment(1)].value) : 0;
			let qty2 = qtyInput.elements[qtyInputNoDateAdjustment(2)].value !== "" ? parseInt(qtyInput.elements[qtyInputNoDateAdjustment(2)].value) : 0;
			let partFormat = (await getFile("PartFields.html")).data;
			function splice (string, index, insert) {
				let a = string.slice(0, index);
				let b = string.slice(index);
				return a + insert + b;
			}
			let partOutInputs = splice(partFormat, 20, "Part Out");
			let partInInputs = splice(partFormat, 20, "Part In");
			let partArray = new Array(qty1).fill(partOutInputs).concat(new Array(qty2).fill(partInInputs));
			if (inOut[0] !== qty1 || inOut[1] !== qty2) {
				document.getElementById('parts').innerHTML=partArray.join("");
				inOut[0] = qty1;
				inOut[1] = qty2;
			}
			toggleVisibility(document.getElementById('checkboxHint'), 1);
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
	// update the "last update of database occurred on" div
	let lastUpdate = await getUpdateTime();
	let updateHistory = document.getElementById("lastUpdate");
	updateHistory.innerHTML = lastUpdate.data;

	// find the number of parts coming in and out based on the prod number
	let bom = await getBOMFromProd(qtyInput.elements[qtyInputNoDateAdjustment(0)].value);
	let partsOutQty = 0;
	let partsInQty = 0;

	// qtyInput.elements[1].value = partsOutQty;
	// qtyInput.elements[2].value = partsInQty;
	// await qtyUpdate(document.createEvent('Event'));

	function stringInWCList (str, wildcards) {
		let matches = false;
		wildcards.forEach(wc => {
			if (wc.slice(0,wc.length-1) == str.slice(0,wc.length-1)) {matches = true;}
		});
		return matches;
	}

	bom.forEach(bomObject => {
		if (bomObject.qty > 0) {
			if (stringInWCList(bomObject.itemNum,["M6*","M9*","T8*","9880231*","M71*"])) {
				qtyInput.elements[qtyInputNoDateAdjustment(3)].value = bomObject.itemNum;
				qtyInput.elements[qtyInputNoDateAdjustment(4)].value = bomObject.make;
				return;
			}
			partsInQty += 1;
		} 
		else if (bomObject.qty < 0) {
			partsOutQty += 1;
		}
	});

	qtyInput.elements[qtyInputNoDateAdjustment(1)].value = partsOutQty;
	qtyInput.elements[qtyInputNoDateAdjustment(2)].value = partsInQty;
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
	await Promise.all(bom.map(async bomObject => {
		if (stringInWCList(bomObject.itemNum,["M6*","M9*","T8*","9880231*","M71*"])) {return;}
		// get part fields off the top of either assigned array
		let assignedPartFormInput = bomObject.qty > 0 ? partsIn.pop() : partsOut.pop();
		let valuesObject = {checks: [1,1,1], fields:[bomObject.itemNum,""]};
		if ((await assignedPartFormInput.readPart(valuesObject.fields[0])) !== "no previous uses") {return;}
		// get mfg parts list of item number from bom object
		let mfgPartsList = await getMFG(bomObject.itemNum);
		valuesObject.fields[1] = mfgPartsList[0];
		await assignedPartFormInput.writePart(valuesObject);
	}));
	updateVariableElements();
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

// DISPLAYS A PDF IN AN IFRAME THAT CONTAINS REWORK DATA BASED ON PROD AND QTY FIELDS
async function make_iFrame (event)
{
	if (logReqs[0].value === '' || logReqs[1].value === '') {
		toggleVisibility(document.getElementById('logReqError'), 1);
		return;
	} else { toggleVisibility(document.getElementById('logReqError'), 0); }
	let printButton = event.target;
	let iFrameContainer = document.getElementById('pdf-Iframe');
	if (iFrameContainer.children.length != 0) iFrameContainer.innerHTML = "";

	const printFrame = document.createElement("iframe");
	function pfOnload() {
		this.contentWindow.print();
	}
	printFrame.onload = pfOnload;
	printFrame.setAttribute('id', 'printFrame');

	let requestedSerials = [];
	let reworkModel = "";
	const logReqSize = logReqs[1].value;
	const log = await getLogRequest();
	let logArray = log.data.split("\n");
	let x = 0;
	logArray.reverse().forEach(j => {
		let iterableIsNotBlank = j !== "";
		let notExceedRequestedNumberOfLogs = x < logReqSize;
		let numberInProdStringMatchesRequest = parseInt((j.slice(0, j.indexOf(","))).replace(/\D/g,'')) === parseInt(logReqs[0].value.replace(/\D/g,''));
		if (iterableIsNotBlank && notExceedRequestedNumberOfLogs && numberInProdStringMatchesRequest) {
			reworkModel = j.split(',')[3];
			requestedSerials.push(j.split(',')[4]);
			x++;
		}
	});
	if (requestedSerials == []) return -1;
	let postData = {label: printButton.value.slice(0,-6), model: reworkModel, serials: requestedSerials};

	printFrame.src = (await axios({
		method: 'post',
		url: '420getPDFPages420',
		data: JSON.stringify(postData)
	})).data;

	iFrameContainer.appendChild(printFrame);
}
// BUTTONS CHOOSE WHICH TYPE OF PDF DOCUMENT TO DISPLAY
Object.values(document.getElementById("printButtons").children).forEach(printButton => 
	printButton.addEventListener('click', make_iFrame));
