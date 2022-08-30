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