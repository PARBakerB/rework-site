const send = document.getElementById('send');
var input = document.getElementById('input');
const qtyInput = document.getElementById('qty');
const logReq = document.getElementById('log-request');
var inputs = document.getElementsByClassName('inputs');
const qtys = document.getElementsByClassName('qtys');
const logReqs = document.getElementsByClassName('log-requests');
var checkForms = document.getElementsByClassName('checkboxes');
const buttons = document.getElementsByClassName("auto-setup-buttons");
const notesInput = document.getElementById("notes").children[0].children[1];

const partOutInputs = `<li>Part Out <div class="checkboxes"> Ignore: <label>PAR S/N:<input type="checkbox"></label> <label>MFGR S/N:<input type="checkbox"></label> <label>MFGR Date Code:<input type="checkbox"></label> </div> <div> <ol> <li> <label>Fru or P/N:<input type="text" class="inputs" required></label> </li> <li> <label>PAR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR P/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR Date Code:<input type="text" class="inputs" required></label> </li> </ol> </div> </li>`;
const partInInputs = `<li>Part In <div class="checkboxes"> Ignore: <label>PAR S/N:<input type="checkbox"></label> <label>MFGR S/N:<input type="checkbox"></label> <label>MFGR Date Code:<input type="checkbox"></label> </div> <div> <ol> <li> <label>Fru or P/N:<input type="text" class="inputs" required></label> </li> <li> <label>PAR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR P/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR Date Code:<input type="text" class="inputs" required></label> </li> </ol> </div> </li>`;
const inOut = [0,0];
const assemblyPartNumbers = ['M9100-10','M9100-11','M9110-11','M9110-21'];
const M910010to11 = [1, 1, "M9100-10", "M9100-11", [true, true, true], "980029758", "POS-TGL-BC1", [true, false, true], "980029756", "T202MD15DB"];

// REFRESH PAGE ELEMENT VARIABLES THAT CHANGE DURING UI INTERACTION
function updateVariableElements() {
	inputs = document.getElementsByClassName('inputs');
	Object.values(inputs).forEach((j) => {if (j.getAttribute('listener') !== 'true') {j.addEventListener("keydown",inputCycle)}});
	checkForms = document.getElementsByClassName('checkboxes');
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
	rwdata[i+1] = notesInput.value;
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

// NAVIGATING BETWEEN INPUTS AND FORM SUBMISSION USING ENTER KEY
function inputCycle(event) {
	let index = [...input].indexOf(event.target);
	let ii = index-1 > -1 ? index-1 : 0;
	let checks = [];
	if (event.key==="Enter") {
		if (index === 0 && assemblyPartNumbers.includes(input.elements[index].value.toUpperCase())) {
			playBuzzer();
			input.elements[index].value = '';
			document.getElementById("errorLightUpWindow").classList.add("error-container");
		}
		else {
			document.getElementById("errorLightUpWindow").classList.remove("error-container");
			if (ii%8 < 3) {
				index = input.elements[(Math.floor(ii/8)*8)+4].value !== "" ? (Math.floor(ii/8)*8)+5 : (Math.floor(ii/8)*8)+4;
				ii = index-1;
				checks = [];
				for (let x=0; x<3; x++) {
					checks.push(checkForms[Math.floor(ii/8)].children[x].children[0].checked);
				}
				input.elements[index].focus();
			}
			try {
				while (input.elements[index].value !== "" || (ii%8 === 4 && checks[0]) || (ii%8 === 6 && checks[1]) || (ii%8 === 7 && checks[2]) ) {
					index++;
					ii++;
					if (ii%8 < 3) {
						index = input.elements[(Math.floor(ii/8)*8)+4].value !== "" ? (Math.floor(ii/8)*8)+5 : (Math.floor(ii/8)*8)+4;
						ii = index-1;
					}
					checks = [];
					for (let x=0; x<3; x++) {
						checks.push(checkForms[Math.floor(ii/8)].children[x].children[0].checked);
					}
				}
				input.elements[index].focus();
			} catch {
				postInputs();
				// return to first input
				input.elements[0].focus();
			}
		}
	}
}
Object.values(inputs).forEach((j) => {j.addEventListener("keydown",inputCycle)});

// GRAB QTY INPUTS ON UPDATE, CYCLE THROUGH FORM ON ENTER
function qtyUpdate(event) {
	if (event.key==="Enter") {
		let index = [...qtyInput].indexOf(event.target);
		if (index <= 7) {qtyInput.elements[index + 1].focus();}
		else {input.elements[0].focus();}
	}
	if (qtyInput.elements[1].value !== "" || qtyInput.elements[2].value !== "") {
		let qty1 = qtyInput.elements[1].value !== "" ? parseInt(qtyInput.elements[1].value) : 0;
		let qty2 = qtyInput.elements[2].value !== "" ? parseInt(qtyInput.elements[2].value) : 0;
		let partArray = new Array(qty1).fill(partOutInputs).concat(new Array(qty2).fill(partInInputs));
		if (inOut[0] !== qty1 || inOut[1] !== qty2) {
			document.getElementById('parts').innerHTML=partArray.join("");
			inOut[0] = qty1;
			inOut[1] = qty2;
		}
		updateVariableElements();
	}
}
Object.values(qtys).forEach((j) => {j.addEventListener("keyup",qtyUpdate)});

// AUTOMATED PO SETUP SCRIPT TRIGGERED BY BUTTONS
function autoSetup(event) {
	switch(event.target.innerText) {
		case "M9100-10 to M9100-11":
			qtyInput.elements[1].value = M910010to11[0];
			qtyInput.elements[2].value = M910010to11[1];

			//let fakeEvent = document.createEvent('Event');
			qtyUpdate(document.createEvent('Event'));

			qtyInput.elements[3].value = M910010to11[2];
			qtyInput.elements[4].value = M910010to11[3];
			input.elements[1].checked = M910010to11[4][0];
			input.elements[2].checked = M910010to11[4][1];
			input.elements[3].checked = M910010to11[4][2];
			input.elements[4].value = M910010to11[5];
			input.elements[6].value = M910010to11[6];
			input.elements[9].checked = M910010to11[7][0];
			input.elements[10].checked = M910010to11[7][1];
			input.elements[11].checked = M910010to11[7][2];
			input.elements[12].value = M910010to11[8];
			input.elements[14].value = M910010to11[9];
			break;
	}
}
Object.values(buttons).forEach((j) => {j.addEventListener("click",autoSetup)});

// MOVES FOCUS TO BEGINNING OF FORM ON ENTER PRESS IN NOTES FIELD
notesInput.addEventListener('keyup', (event)=>{
	if (event.key === "Enter") {
		input.elements[0].focus();
	}
});

// RETURNS FILE STREAM OF ACTIVE LOG FILE
function getLogRequest() {
	return axios({
		method: 'get',
		url: "log.csv",
		headers: {'Content-Type' : 'application/x-www-form-urlencoded'}
	});
}

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
				if (j !== "" && x < logReqSize && (j.slice(0, j.indexOf(",")) === logReqs[0].value)) {
					logdiv.innerHTML += ("<li>" + j.split(",")[4] + "</li>");
					x++;
				}
			});
		}
	}
}
Object.values(logReqs).forEach((j)=>{j.addEventListener("keyup",viewLog);});