import * as NavigationBar from "expo-navigation-bar";
import { useDebugValue, useEffect, useState } from 'react';
import {SafeAreaView } from 'react-native'

/*
    Used for background color(Can be ignored)
*/

NavigationBar.addVisibilityListener(({ visibility }) => {
    NavigationBar.setVisibilityAsync("hidden");
});

export function Background(props) {
    useEffect(() => {
        NavigationBar.setVisibilityAsync("hidden");
    },[]);

    return (
      <SafeAreaView
        style={{
            width: "100%",
            height: "100%",
            backgroundColor: props.color,
        }} >
            {props.children}
        </SafeAreaView>
    );
}

Background.defaultProps = {
    color: "#ffffff"
}