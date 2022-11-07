/*<!--<h2>Which rework function?</h2>
<input class="btn redbtn" id="sel-remove" type="submit" value="M9100-11 Remove VFD"/>
<input class="btn greenbtn" id="sel-attach" type="submit" value="M9100-10 Attach VFD"/>
-->*/

// ENV VARIABLES
const attach = document.getElementById('sel-attach');
const remove = document.getElementById('sel-remove');

// REMOVE, ATTACH: BUTTON HANDLING
attach.addEventListener("mouseover", function () {
	if (this.classList.contains('greenbtn')) this.classList.remove('greenbtn');
	if (!this.classList.contains('greenbtn-hover')) this.classList.add('greenbtn-hover');
});
remove.addEventListener("mouseover", function () {
	if (this.classList.contains('redbtn')) this.classList.remove('redbtn');
	if (!this.classList.contains('redbtn-hover')) this.classList.add('redbtn-hover');
});
attach.addEventListener("mouseout", function () {
	if (!this.classList.contains('greenbtn')) this.classList.add('greenbtn');
	if (this.classList.contains('greenbtn-hover')) this.classList.remove('greenbtn-hover');
});
remove.addEventListener("mouseout", function () {
	if (!this.classList.contains('redbtn')) this.classList.add('redbtn');
	if (this.classList.contains('redbtn-hover')) this.classList.remove('redbtn-hover');
});
attach.addEventListener("click", function () {
	if (this.classList.contains('greenbtn-clicked')) {
		this.classList.remove('greenbtn-clicked');
	} else {
		this.classList.add('greenbtn-clicked');
	}
});
remove.addEventListener("click", function () {
	if (this.classList.contains('redbtn-clicked')) {
		this.classList.remove('redbtn-clicked');
	} else {
		this.classList.add('redbtn-clicked');
	}
});