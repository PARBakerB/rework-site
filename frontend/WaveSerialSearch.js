let resultContainer = document.getElementById('results');
resultContainer.style.visibility = 'hidden';

const searchSerial = async () => {
    let serial = document.getElementById("serial").value;
    
    let response = (await axios ({
        method: 'get',
        url: 'PARWaveSerialSearch',
        data: serial
    })).data;

    let newListItem = '';
    if (response === "GOOD") {
        newListItem = "<li class='GOOD'>" + serial + ":\t" + response + "</li>"
    } else if (response === "BAD") {
        newListItem = "<li class='BAD'>" + serial + ":\t" + response + "</li>"
    }
    else {
        newListItem = "<li class='UNKNOWN'>" + serial + ":\t" + "Not Found" + "</li>"
    }
    document.getElementById('searchedSerials').innerHTML += newListItem;
    resultContainer.style.visibility = 'visible';
}

document.getElementById('serial').addEventListener('keypress', (e)=>{
    if (e.key !== "Enter") return;
    searchSerial();
});
document.getElementById('searchButton').addEventListener('click', searchSerial);