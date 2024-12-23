// DISPLAYS A PDF IN AN IFRAME THAT CONTAINS REWORK DATA BASED ON PROD AND QTY FIELDS
async function make_iFrame (event)
{
    const labelRequestInfo = document.getElementById("label-request");
    if (labelRequestInfo[0].value === '' || labelRequestInfo[1].value === '') return;

    let labelData = (await axios({
		method: 'post',
		url: 'Advance-Exchange-Label',
		data: JSON.stringify({
            label: event.target.text,
            model: labelRequestInfo[0].value,
            serials: [labelRequestInfo[1].value]
        })
	})).data;

	const iFrameContainer = document.getElementById('pdf-Iframe');
	if (iFrameContainer.children.length != 0) iFrameContainer.innerHTML = "";
	const printFrame = document.createElement("iframe");
	function pfOnload() {
		this.contentWindow.print();
	}
	//printFrame.onload = pfOnload;
	printFrame.setAttribute('id', 'printFrame');
	printFrame.src = labelData;

	iFrameContainer.appendChild(printFrame);
}
// BUTTONS CHOOSE WHICH TYPE OF PDF DOCUMENT TO DISPLAY
Object.values(document.getElementsByClassName("label-selector-button")).forEach(printButton => 
	printButton.addEventListener('click', make_iFrame));