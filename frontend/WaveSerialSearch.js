const RESULTCONTAINER = document.getElementById('results');

const SEARCHED_SERIALS = document.getElementById('searchedSerials');

const searchSerial = async () => {
    let findSerial = document.getElementById("findSerial").value;
    document.getElementById("findSerial").value = "";
    findSerial = findSerial.split(/\s+/);
    
    findSerial.forEach(async serial => {
        let response = (await axios ({
            method: 'post',
            url: 'PARWaveSerialSearch',
            data: serial
        })).data;
        let serialLi = document.createElement("li");
        if (response === "N/A") {serialLi.classList += "UNKNOWN";} else {serialLi.classList += response;}
        response = response === "N/A" ? "Not Found" : response;
        serialLi.textContent = serial + ":\t" + response;
        SEARCHED_SERIALS.appendChild(serialLi);
    });
    
    RESULTCONTAINER.style.display = 'block';
}
document.getElementById('findSerial').addEventListener('keypress', (e)=>{
    if (e.key !== "Enter") return;
    searchSerial();
});
document.getElementById('searchButton').addEventListener('click', searchSerial);