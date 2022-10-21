import React, { useState } from 'react';
import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import Field from "./Field";

const FieldSet = ({ data, fields, forceLabels, style }) => {
    const field_elements = fields.map(field => {
        let fallbackLabel = null;
        if (forceLabels) {
            fallbackLabel = field.name[0].toUpperCase() + field.name.replace("_", " ").slice(1);
        }

        return <Field style={ style } key={ field.name } data={ data } fieldMetadata={ field } fallbackLabel={ fallbackLabel } />;
    });

    if (field_elements.length > 0) {
        return <React.Fragment>{ field_elements }</React.Fragment>;
    } else {
        return null;
    }
};

FieldSet.defaultProps = {
    forceLabels: false
};

export default FieldSet;