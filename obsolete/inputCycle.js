function inputCycle(event) {
	if (event.key==="Enter") {
		let index = [...input].indexOf(event.target);
		console.log(index);
		if (index === 0) {
			index = 4;
			input.elements[index].focus();
			while(input.elements[index].value !== "") {
				index++;
				input.elements[index].focus();
			}
		}
		else {
			// looking ahead at next position
			let i = index + 1;
			try {
				var check = i%9 === 5 || i%9 === 7 || i%9 === 8;
				if (check) {
					input.elements[i].focus();
					// using index as a i-1 correction for looking at checkboxes
					while (check && checkForms[Math.floor((i-4)/5)].children[Math.ceil((((i-4)%5)-1)/2)].children[0].checked === true) {
						//index++;
						i++;
						input.elements[i].focus();
					}
				} else {
					input.elements[index + 1].focus();
					while(input.elements[index + 1].value !== "") {
						index++;
						input.elements[index + 1].focus();
					}
				}
			}
			catch {
				postInputs();
				// return to first input
				input.elements[0].focus();
			}
		}
    }
}
Object.values(inputs).forEach((j) => {j.addEventListener("keydown",inputCycle)});