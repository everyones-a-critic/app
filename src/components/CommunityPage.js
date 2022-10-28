import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Text, View, StyleSheet, Pressable, StatusBar, Image, FlatList } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import { connect } from "react-redux";
import Loader from "../components/Loader";

import { useFonts, WorkSans_800ExtraBold } from '@expo-google-fonts/work-sans';

import CommunityEnrollment from  "../views/CommunityEnrollment";
import AuthenticationProvider from "./AuthenticationProvider";
import CommunityHeader from "./CommunityHeader";
import ErrorModal from "./ErrorModal";
import { YELLOW, GRAY } from "../settings/colors";


const CommunityPage = ({ community, navigation, route, authExpired, errors, children, loading, backButtonEnabled }) => {
    const bottomSheetRef = useRef(null);

    let [fontsLoaded] = useFonts({
        WorkSans_800ExtraBold
    });

    useEffect(() => {
        if (bottomSheetRef?.current) {
            bottomSheetRef.current.close();
        }
    }, [bottomSheetRef?.current]);

    renderChildren = () => {
        if (community === undefined || community === null) {
            return null;
        } else {
            return children;
        }
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
                            backButtonEnabled={ backButtonEnabled }
                            navigation={ navigation }
                        />
                        <View style={{ backgroundColor: "#F2F2F2" }}>
                            { renderChildren() }
                        </View>
                        <ErrorModal errors={ errors }/>
                        <BottomSheet
                            backgroundStyle={{ backgroundColor: YELLOW }}
                            enablePanDownToClose
                            ref={ bottomSheetRef }
                            index={-1}
                            snapPoints={['95%']}>
                                <CommunityEnrollment
                                    navigation={ navigation }
                                    renderAsBottomSheet={ true } />
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
