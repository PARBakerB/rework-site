class Part {
	constructor (elem) {
		this.webElement = elem;
		this.checks = [
			elem.children[0].children[1].children[0].children[0].checked,
			elem.children[0].children[2].children[0].children[0].checked,
			elem.children[0].children[3].children[0].children[0].checked
		];
		this.fields = [
			elem.children[1].children[0].children[0].children[0].children[0].children[0].value,
			elem.children[1].children[0].children[1].children[0].children[0].children[0].value,
			elem.children[1].children[0].children[2].children[0].children[0].children[0].value,
			elem.children[1].children[0].children[3].children[0].children[0].children[0].value,
			elem.children[1].children[0].children[4].children[0].children[0].children[0].value
		];
	}
	savePart = () => {
		axios({
			method: 'post',
			url: '420savePart420',
			data: JSON.stringify({ checks: this.checks, fields: this.fields })
		});
	}
	readPart = async () => {
		let responseData = await axios({
			method: 'post',
			url: '420getSavedPart420',
			data: this.fields[0]
		});
		this.writePart(responseData.data);
	}
	writePart = (savedObj) => {
		this.checks = savedObj.checks;
		this.fields = savedObj.fields;
		
		this.webElement.children[0].children[1].children[0].children[0].checked = savedObj.checks[0];
		this.webElement.children[0].children[2].children[0].children[0].checked = savedObj.checks[1];
		this.webElement.children[0].children[3].children[0].children[0].checked = savedObj.checks[2];

		this.webElement.children[1].children[0].children[0].children[0].children[0].children[0].value = savedObj.fields[0];
		this.webElement.children[1].children[0].children[1].children[0].children[0].children[0].value = savedObj.fields[1];
		this.webElement.children[1].children[0].children[2].children[0].children[0].children[0].value = savedObj.fields[2];
		this.webElement.children[1].children[0].children[3].children[0].children[0].children[0].value = savedObj.fields[3];
		this.webElement.children[1].children[0].children[4].children[0].children[0].children[0].value = savedObj.fields[4];
	}
}
