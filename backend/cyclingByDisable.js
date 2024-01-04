// DISABLE INPUTS BASED ON CHECKBOXES
let parts = document.getElementsByClassName("rw-part");
let partStructs = [];

// tryign to create a class
function partStruct(checkboxes, textFields) {
	this.Checks = checkboxes;
	this.Fields = textFields;
}

function createPartStruct(rwPart) {
	let checkboxes = [];
	let textFields = [];
	Array.from(rwPart.children[1].children[0]).forEach(textField => {
		textFields.push(textField.children[0].children[0].children[0].value);
	});
	Array.from(rwPart.children[0].children[0]).forEach(checkbox => {
		checkboxes.push(checkbox.children[0].children[0].children[0].value);
	});
	return new partStruct(checkboxes, textFields);
}

Array.from(parts).forEach(part => {
	partStructs.push(createPartStruct(part));
});

//get data from powerbi embedded table
//Array.from(document.querySelectorAll("[role=row]")).forEach(j => {console.log(j.children[1].getAttribute("title"));});