import { useState } from 'react';
import { Pressable, Text, View, StyleSheet, findNodeHandle } from "react-native";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import fontAwesomeLibrary from "../../assets/icons/fontAwesomeLibrary";
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'


const renderActionIcon = type => {
    const size = 18;
    if (type === "add") {
        return (
            <View style={ styles.actionIconContainer }>
                <FontAwesomeIcon
                    style={{ transform: [{translateY: 4 }] }}
                    size={ size }
                    icon={ findIconDefinition({ prefix: 'fas', iconName: 'plus' }) } />
            </View>
        )
    } else {
        return (
            <View style={ styles.actionIconContainer }>
                <FontAwesomeIcon
                    style={{ transform: [{translateY: 2 }]}}
                    size={ size }
                    icon={ findIconDefinition({ prefix: 'fas', iconName: 'angles-right' }) } />
            </View>
        )
    }
}



const CommunityListItem = ({ community, style, action, actionType, hidden, accessibilityRole, accessibilityHint }) => {
    const [disabled, setDisabled ] = useState(false);

    const onPress = () => {
        setDisabled(true);
        action();
    }

    const iconDef = findIconDefinition({prefix: 'fas', iconName: community.icon})
    return (
        <Pressable
            onPress={() => onPress()}
            disabled={ disabled }
            accessibilityState={ disabled ? 'disabled' : null }
            accessibilityRole={ accessibilityRole }
            accessibilityHint={ accessibilityHint }
            style={[ styles.communityContainer, {
                display: hidden ? "none" : "flex",
                opacity: disabled ? 0.5 : 1
            }]}>
            <View style={[styles.communityIconBackground, {backgroundColor: `#${community.primary_color}`}]}>
                <FontAwesomeIcon size={22} color={`#${community.secondary_color}`} icon={iconDef}/>
            </View>
            <View style={[ styles.nameContainer, style ]}>
                <Text style={styles.communityName}>{community.display_name}</Text>
                { renderActionIcon(actionType) }
            </View>
        </Pressable>
    );
}

CommunityListItem.defaultProps = {
    style: {},
    disabled: false
}

const styles = StyleSheet.create({
    communityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginLeft: 10,
        marginRight: 10
    },
    nameContainer: {
        borderBottomWidth: 1,
        borderColor: "#808080",
        paddingTop: 15,
        flex: 1,
        flexDirection: 'row',
        paddingBottom: 15,
    },
    communityName: {
        fontSize: 22,
        fontWeight: '400',
        flex: 1,
    },
    communityIconBackground: {
        width: 35,
        height: 35,
        borderRadius: "50%",
        marginLeft: 10,
        marginRight: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    actionIconContainer: {
        paddingLeft: 10,
        paddingRight: 10,
        alignItems: "center",
    }
});

export default CommunityListItem;
