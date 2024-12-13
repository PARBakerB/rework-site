async function postTemplate (url, options) {
    return axios({
		method: 'post',
		url: url,
        data: options
	});
}

function hideSamples () {
    let samples = document.getElementsByClassName("sample");
    Object.values(samples).forEach(sample => {
        sample.style.display = "none";
    });
}

async function populateCards (searchedSerial) {
    let cardsList = document.getElementById("cards-list");
    cardsList.innerHTML += (await postTemplate("ProductInfo/ProductInfo-card", searchedSerial)).data;
}

document.getElementById("serial-search-btn").addEventListener('click', serialSearchEventHandler);
document.getElementById("serial-search-box").addEventListener('keydown', serialSearchEventHandler);
function serialSearchEventHandler(event) {
    event.preventDefault();
    if (event.key !== "Enter" && event.key !== undefined) return;
    let searchBox = document.getElementById("serial-search-box");
    if (searchBox.value === "") return;

    // check if serial is valid
    let serialIsValid = searchBox.value !== ""; //change this 
    if (serialIsValid) hideSamples();

    // populate serial information
    populateCards(searchBox.value);

    // clear search box text
    searchBox.value = "";
}