async function postTemplate (url, options) {
    return axios({
		method: 'post',
		url: url,
        data: options
	});
}

function hideSamples () {
    const samples = document.getElementsByClassName("sample");
    Object.values(samples).forEach(sample => {
        sample.style.display = "none";
    });
}

async function populateCard (searchedSerial) {
    const cardsList = document.getElementById("cards-list");
    cardsList.innerHTML += (await postTemplate("ProductInfo/ProductInfo-card", searchedSerial)).data;
}

function isSubmitSearchEvent(event) {
    if (event.key !== "Enter" && event.key !== undefined) return false;
    return true;
}

function serialSearchEventHandler() {
    const searchBox = document.getElementById("serial-search-box");
    if (searchBox.value === "") return;

    // check if serial is valid
    let searchIsValid = true; //change this 
    if (searchIsValid) hideSamples();

    // populate serial information
    let searchBoxValuesArray = searchBox.value.split(/\s+/);
    searchBoxValuesArray.forEach(async serial => {
        populateCard(serial);
    });
    

    // clear search box text
    searchBox.value = "";
}

function searchBarInteractionHandler(event) {
    if (!isSubmitSearchEvent(event)) return;
    event.preventDefault();
    serialSearchEventHandler();
}
document.getElementById("serial-search-btn").addEventListener('click', searchBarInteractionHandler);
document.getElementById("serial-search-box").addEventListener('keydown', searchBarInteractionHandler);
