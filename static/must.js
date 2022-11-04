const send = document.getElementById('send');
var input = document.getElementById('input');
const qtyInput = document.getElementById('qty');
var inputs = document.getElementsByClassName('inputs');
const qtys = document.getElementsByClassName('qtys');
var checkForms = document.getElementsByClassName('checkboxes');
const partOutInputs = `<li>Part Out <div class="checkboxes"> Ignore: <label>PAR S/N:<input type="checkbox"></label> <label>MFGR S/N:<input type="checkbox"></label> <label>MFGR Date Code:<input type="checkbox"></label> </div> <div> <ol> <li> <label>Fru or P/N:<input type="text" class="inputs" required></label> </li> <li> <label>PAR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR P/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR Date Code:<input type="text" class="inputs" required></label> </li> </ol> </div> </li>`;
const partInInputs = `<li>Part In <div class="checkboxes"> Ignore: <label>PAR S/N:<input type="checkbox"></label> <label>MFGR S/N:<input type="checkbox"></label> <label>MFGR Date Code:<input type="checkbox"></label> </div> <div> <ol> <li> <label>Fru or P/N:<input type="text" class="inputs" required></label> </li> <li> <label>PAR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR P/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR S/N:<input type="text" class="inputs" required></label> </li> <li> <label>MFGR Date Code:<input type="text" class="inputs" required></label> </li> </ol> </div> </li>`;

// REFRESH PAGE ELEMENT VARIABLES THAT CHANGE DURING UI INTERACTION
function updateVariableElements() {
	inputs = document.getElementsByClassName('inputs');
	Object.values(inputs).forEach((j) => {if (j.getAttribute('listener') !== 'true') {j.addEventListener("keydown",inputCycle)}});
	checkForms = document.getElementsByClassName('checkboxes');
}

// ONLOAD FUNCTION
function renderHello() {
	var list = document.getElementById('list').innerHTML;
	var rendered = "";//Mustache.render(list, { name: 'Luke' });

	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/res.json");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send();
	xhr.onreadystatechange = function () {
		/*if (xhr.readyState === 4 && xhr.status === 200) {
			rendered = Mustache.render(list, {name: this.responseText});
			document.getElementById('target').innerHTML = `
				<p>Figuring out how to add part entry prompts based on number input in form id qty</p>
			`+rendered;
		}*/
	};
}

// POST ARG rwdata TO SERVER
async function postRework(rwdata) {
	stringdata=rwdata.join();
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
	let rwdata=new Array(arraysize + 1);
	let i = -1;
	Object.values(inputs).forEach((j) => {
		// csv format processing for insertion into excel
		if (i===-1) {rwdata[0] = j.value}
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
	let statarray = [qtyInput.elements[0].value,qtyInput.elements[5].value,qtyInput.elements[3].value,qtyInput.elements[4].value];
	postRework(statarray.concat(rwdata));
}
send.addEventListener('click', postInputs);

// NAVIGATING BETWEEN INPUTS AND FORM SUBMISSION USING ENTER KEY
function inputCycle(event) {
	let index = [...input].indexOf(event.target);
	let ii = index-1 > -1 ? index-1 : 0;
	let checks = [];
	if (event.key==="Enter") {
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
				console.log(ii);
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
			//if (index%9 === 5 && checks[0]) {index++;}
			//if (index%9 === 7 && checks[1]) {index++;}
			//if (index%9 === 8 && checks[2]) {index++;}
			input.elements[index].focus();
		} catch {
			postInputs();
			// return to first input
			input.elements[0].focus();
		}
	}
}
Object.values(inputs).forEach((j) => {j.addEventListener("keydown",inputCycle)});

// GRAB QTY INPUTS ON UPDATE, CYCLE THROUGH FORM ON ENTER
function qtyUpdate(event) {
	if (event.key==="Enter") {
		var index = [...qtyInput].indexOf(event.target);
		if (index <= 4) {qtyInput.elements[index + 1].focus();}
		else {input.elements[0].focus()}
	}
	if (qtyInput.elements[1].value !== "" || qtyInput.elements[2].value !== "") {
		let qty1 = qtyInput.elements[1].value !== "" ? parseInt(qtyInput.elements[1].value) : 0;
		let qty2 = qtyInput.elements[2].value !== "" ? parseInt(qtyInput.elements[2].value) : 0;
		var partArray = new Array(qty1).fill(partOutInputs).concat(new Array(qty2).fill(partInInputs));
		document.getElementById('parts').innerHTML=partArray.join("");
		updateVariableElements();
	}
}
Object.values(qtys).forEach((j) => {j.addEventListener("keyup",qtyUpdate)});