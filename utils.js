import { Text, View, StyleSheet } from 'react-native';

export const concatErrors = (array, errorToAdd) => {
    let errors = [];
    if (array && array.length > 0) {
         errors = [...array]
    }

    if (errorToAdd) {
        errors.push(errorToAdd);
    }

    return errors;
}


// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
export const pickBarStyle = (bgColor) => {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);

    return (L > 0.179) ? 'dark-content' : 'light-content';
};

export const hexToRGB = hexColor => {
    const r = parseInt(hexColor.slice(0, 2), 16)
    const g = parseInt(hexColor.slice(2, 4), 16)
    const b = parseInt(hexColor.slice(4, 6), 16)

    return `rgb(${r},${g},${b})`;
};

export const rgbToHex = rgbString => {
    const components = rgbString.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",");
    const r = parseInt(components[0]);
    const g = parseInt(components[1]);
    const b = parseInt(components[2]);
    return `#${[r, g, b]
        .map((n) =>
            n.toString(16).length === 1 ? "0" + n.toString(16) : n.toString(16)
        )
    .join("")}`;
};