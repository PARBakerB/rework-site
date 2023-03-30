export class Part {
	// save a reference to the webelement and the values of the fields of that webelement
	constructor (elem) {
		this.webElement = elem;
		this.checks = [
			elem.children[0].children[1].children[0].children[0].checked,
			elem.children[0].children[2].children[0].children[0].checked,
			elem.children[0].children[3].children[0].children[0].checked
		];
		this.fields = [
			elem.children[1].children[0].children[0].children[0].children[0].children[0].value,
			elem.children[1].children[0].children[2].children[0].children[0].children[0].value,
		];
	}
	// save this part configuration as a jsObject
	savePart = async () => {
		axios({
			method: 'post',
			url: '420savePart420',
			data: JSON.stringify({ checks: this.checks, fields: this.fields })
		});
	}
	// find the last used jsObject configuration for this parPart
	readPart = async (parPart = this.fields[0]) => {
		let responseData = await axios({
			method: 'post',
			url: '420getSavedPart420',
			data: parPart
		});
		if (responseData.data === "undefined") {return "no previous uses";}
		this.writePart(responseData.data);
	}
	// write values from jsObject to dom element fields of webElement
	writePart = async (savedObj) => {
		this.checks = savedObj.checks;
		this.fields = savedObj.fields;
		await this.updatePartName(savedObj.fields[0]);

		this.webElement.children[0].children[1].children[0].children[0].checked = savedObj.checks[0];
		this.webElement.children[0].children[2].children[0].children[0].checked = savedObj.checks[1];
		this.webElement.children[0].children[3].children[0].children[0].checked = savedObj.checks[2];
	
		this.webElement.children[1].children[0].children[0].children[0].children[0].children[0].value = savedObj.fields[0];
		await this.addDropDown();
		this.webElement.children[1].children[0].children[2].children[0].children[0].children[0].value = savedObj.fields[1];	
	}
	// add dropdown options to mfg part field
	addDropDown = async (
		parPartValue = this.fields[0],
		fieldDivContainer = this.webElement.children[1].children[0].children[2].children[0]
	) => {
		let inputField = fieldDivContainer.children[0].children[0];
		let mfgPartsList = await this.getMFG(parPartValue);
		if (mfgPartsList.length == 0) {return;}
		let attributeName = Math.floor(Math.random()*50000000) + '';
		inputField.setAttribute('list', attributeName);
		let listFormat = "<datalist id=\""+attributeName+"\"></datalist>";
		fieldDivContainer.innerHTML += listFormat;
		let optionsList = this.dataListConst(mfgPartsList);
		document.getElementById(attributeName).innerHTML = optionsList;
	}
	// HELPER FUNCTION FOR addDropDown(), TAKES AN ARRAY OF VALUES AND FORMATS AS A DATALIST
	dataListConst = (optArr) => {
		let retVal = '\n';
		optArr.forEach(j => {
			retVal += "<option value=\""+j+"\">\n";
		});
		return retVal;
	}
	// GET MANUFACTURER PART NUMBERS FOR A PAR PART
	getMFG = async (parPart = this.fields[0]) => {
		if (parPart === '') {return [];}
		return ( await axios ({
			method: 'post',
			url: '420getMFG420',
			data: parPart
		})).data;
	}
	// PUT PART NUMBER DESCRIPTION IN THE HEADER OF THE PART ELEMENT
	updatePartName = async (parPart = this.fields[0]) => {
		if (parPart == "") {return;}
		let searchName = await this.getSearchName(parPart);
		if (this.webElement.innerHTML.search("Part In") != -1) {
			this.webElement.innerHTML = "Part In - " + searchName + this.webElement.innerHTML.slice(7);
		}
		else if (this.webElement.innerHTML.search("Part Out") != -1) {
			this.webElement.innerHTML = "Part Out - " + searchName + this.webElement.innerHTML.slice(8);
		}
	}
	// GET PART NUMBER DESCRIPTION
	getSearchName = async (parPart = this.fields[0]) => {
		if (parPart === '') {return '';}
		return ( await axios ({
			method: 'post',
			url: '420getSearchName420',
			data: parPart
		})).data;
	}
}
