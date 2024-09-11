const RESULTCONTAINER = document.getElementById('results');
const ACTIVELOGS = [];

const LOGGED_SERIALS = document.getElementById("loggedSerials");

const logToDatabase = () => {
    let logInput = document.getElementById("logSerial").value;
    document.getElementById("logSerial").value = "";
    logInput = logInput.split(/\s+/);

    logInput.forEach(serial => {
        if (!ACTIVELOGS.includes(serial)) ACTIVELOGS.push(serial);
        let serialLi = document.createElement("li");
        serialLi.textContent = serial;
        LOGGED_SERIALS.appendChild(serialLi);
    });
    RESULTCONTAINER.style.display = 'block';

}
document.getElementById('logButton').addEventListener('click', logToDatabase);

const clearResults = () => {
    ACTIVELOGS.length = 0;
    LOGGED_SERIALS.innerHTML = "";
    RESULTCONTAINER.style.display = 'none';
}

document.getElementById('confirmButton').addEventListener('click', () => {
    let postForm = {
        method: 'post',
        url: 'PARWaveFirmwareLog',
        data: JSON.stringify(ACTIVELOGS)
    }
    axios(postForm);
    clearResults();
});
document.getElementById("cancelButton").addEventListener('click', clearResults);