import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, Pressable, StatusBar, Image, FlatList, Dimensions } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import { connect } from "react-redux";
import Loader from "../components/Loader";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFonts, WorkSans_800ExtraBold } from '@expo-google-fonts/work-sans';

import CommunityEnrollment from  "../views/CommunityEnrollment";
import AuthenticationProvider from "./AuthenticationProvider";
import CommunityHeader from "./CommunityHeader";
import CommunityFooter from "./CommunityFooter";
import ErrorModal from "./ErrorModal";
import { YELLOW, GRAY, SUPER_LIGHT_GRAY } from "../settings/colors";


const windowHeight = Dimensions.get("window").height;
const CommunityPage = ({ community, navigation, route, authExpired, errors, children, loading, backButtonEnabled }) => {
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef(null);
    const [ bottomSheetVisible, setBottomSheetVisible ] = useState(false);

    let [fontsLoaded] = useFonts({
        WorkSans_800ExtraBold
    });

    // when we switch communities, close the community enrollment bottom sheet
    useEffect(() => {
        if (bottomSheetRef?.current) {
            bottomSheetRef.current.close();
            onBottomSheetClose();
        }
    }, [route?.params]);

    renderChildren = () => {
        if (community === undefined || community === null) {
            return null;
        } else {
            return children;
        }
    }

    const onBottomSheetOpen = () => {
        setBottomSheetVisible(true);
    }

    const onBottomSheetClose = () => {
        setBottomSheetVisible(false);
    }

    return (
        <AuthenticationProvider
            authExpired={ authExpired }
            navigation={ navigation }
        >
            <Loader loading={ loading || community === undefined || community === null || !fontsLoaded }>
                <SafeAreaProvider>
                    <View style={{ flex: 1 }}>
                        <CommunityHeader
                            fontsLoaded={ fontsLoaded }
                            community={ community }
                            bottomSheet={ bottomSheetRef }
                            onBottomSheetOpen={ () => onBottomSheetOpen() }
                            onBottomSheetClose={ () => onBottomSheetClose() }
                            backButtonEnabled={ backButtonEnabled }
                            navigation={ navigation }
                        />
                        <View style={{ flex: 1, backgroundColor: SUPER_LIGHT_GRAY }}>
                            { renderChildren() }
                        </View>
                        <CommunityFooter
                            community={ community }
                            bottomSheet={ bottomSheetRef }
                            onBottomSheetOpen={ () => onBottomSheetOpen() }
                            onBottomSheetClose={ () => onBottomSheetClose() }
                            navigation={ navigation }
                        />
                        <ErrorModal errors={ errors }/>
                        <BottomSheet
                            backgroundStyle={{ backgroundColor: YELLOW }}
                            enablePanDownToClose
                            ref={ bottomSheetRef }
                            index={-1}
                            snapPoints={[ windowHeight - insets.top - 10 ]}>
                                <CommunityEnrollment
                                    navigation={ navigation }
                                    renderAsBottomSheet={ true }
                                    visible={ bottomSheetVisible }
                                />
                        </BottomSheet>
                    </View>
                </ SafeAreaProvider>
            </Loader>
        </ AuthenticationProvider>
    );
};

CommunityPage.defaultProps = {
    loading: false,
};

export default CommunityPage;
