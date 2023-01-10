// DISABLE INPUTS BASED ON CHECKBOXES
const input = document.getElementById('input');
const inputText = Object.values(input.elements).filter(j => j.type === "text").slice(1);
const inputChecks = Object.values(input.elements).filter(j => j.type === "checkbox");
function mapChecksToInputs() {
	let checkMap = {
		0: 1,
		1: 3,
		2: 4
	};
	Object.values(input.elements).forEach((j) => {
		if (j.type === "checkbox") {
			j.addEventListener("click", (event)=>{
				let x = Math.floor([...inputChecks].indexOf(event.target)/3)*5 + checkMap[[...inputChecks].indexOf(event.target)%3];
				console.log(x);
				if (inputText[x].disabled === true) {
					inputText[x].disabled = false;
				} else {
					inputText[x].disabled = true;
				}
			});
		}
		if (j.type === "text") {
			j.addEventListener("keyup", (event) => {
				let x = 0;
				try {
					x = Math.floor(([...inputText].indexOf(event.target))/5);
					if (event.key === "Enter") {
						let y = 1;
						inputText[x+y].focus();
						while (inputText[x+y].disabled === true && x+y < inputText.length) {
							y++;
							inputText[x+y].focus();
						}
						if (x+y >= inputText.length) {input.elements[0].focus();}
					}
				}
				catch {
					input.elements[4].focus();
				}
			});
		}
	});
}