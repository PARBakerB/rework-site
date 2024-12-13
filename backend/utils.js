
export function fileExtension (path) {
    let reversePeriodIndex = reverseString(path).indexOf(".");
    let ext = path.substring(path.length - reversePeriodIndex);
    return ext.toLowerCase();
}

function reverseString(str) {
    let splitString = str.split("");
    let reverseArray = splitString.reverse();
    let joinArray = reverseArray.join("");
    return joinArray; // "olleh"
}