import {useRef,useCallback, useState} from 'react';
import  {StyleSheet, Animated, Text, TextInput} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';
import QRCode from 'react-native-qrcode-svg';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

/*
    The display for the qr codes along with all the inputs
    that are required
*/

//Padding for the qr codes 
const space_gap = 20;

export function SwipableQRCodes(props) {
    //Swiping configuration
    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80,
        gestureIsClickThreshold: 5
    };
    //Duration of the slide animation
    const animation_duration = 200;
    //Used for spacing between qr code and border
    const qr_gap = props.qr_size + 30;
    const hotspot_opacity = useRef(new Animated.Value(1)).current;
    const url_opacity = useRef(new Animated.Value(0)).current;
    const hotspot_x = useRef(new Animated.Value(0)).current;
    const url_x = useRef(new Animated.Value(qr_gap)).current;

    //SSID and Password client can input
    const [wifi_ssid, setWIFISSID] = useState("");
    const [wifi_password, setWIFIPassword] = useState("");

    const [dots, setDots] = useState("● ○");

    const [fontsLoaded] = useFonts({
        'Space-Grotesk': require('../assets/fonts/Space_Grotesk/SpaceGrotesk-VariableFont_wght.ttf')
    });

    const onLayoutHomeView = useCallback(async () => {
    if (fontsLoaded) {
        await SplashScreen.hideAsync();
    }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }
    
    const onSwipeRight= (gestureState) => {
        Animated.parallel([
            Animated.timing(hotspot_opacity, {
                toValue: 1,
                duration: animation_duration,
                useNativeDriver: true,
            }),
            Animated.timing(hotspot_x, {
                toValue: 0,
                duration: animation_duration,
                useNativeDriver: true,
            }),
            Animated.timing(url_opacity, {
                toValue: 0,
                duration: animation_duration,
                useNativeDriver: true,
            }),
            Animated.timing(url_x, {
                toValue: qr_gap,
                duration: animation_duration,
                useNativeDriver: true,
            }),
        ]).start();
        setDots("● ○");
    }

    const onSwipeLeft = (gestureState) => {
        Animated.parallel([
            Animated.timing(hotspot_opacity, {
                toValue: 0,
                duration: animation_duration,
                useNativeDriver: true,
            }),
            Animated.timing(hotspot_x, {
                toValue: -qr_gap,
                duration: animation_duration,
                useNativeDriver: true,
            }),
            Animated.timing(url_opacity, {
                toValue: 1,
                duration: animation_duration,
                useNativeDriver: true,
            }),
            Animated.timing(url_x, {
                toValue: 0,
                duration: animation_duration,
                useNativeDriver: true,
            }),
        ]).start();
        setDots("○ ●");
    }

    return (
        <GestureRecognizer style={[props.style, {flexDirection: "column"}]} 
            config = {config}
            onSwipeLeft={state => onSwipeLeft(state)}
            onSwipeRight={state => onSwipeRight(state)}
        >
            <Animated.View style={[styles.dots, {left: (props.qr_size - space_gap) / 2}]}>
                <Text>{dots}</Text>
            </Animated.View>
        
            <Animated.View style={[styles.url_qr,{translateX: url_x, opacity: url_opacity}]}>
                <Text style={{fontSize: 40, fontWeight: '600', fontFamily: 'Space-Grotesk', textAlign: 'center', margin: 5}} >URL</Text>
                <QRCode size={props.qr_size}  value={props.url}/>
                <Text style={{fontWeight: '100',fontSize: 18,  fontFamily: 'Space-Grotesk', marginBottom: space_gap, marginTop: space_gap / 2,}} numberOfLines={1}>{props.url}</Text>
            </Animated.View>

            <Animated.View style={[styles.hotspot_qr, {translateX: hotspot_x, opacity: hotspot_opacity}]}>
                <Text style={{fontSize: 40, fontWeight: '600', fontFamily: 'Space-Grotesk', textAlign: 'center', margin: 5}} >HotSpot</Text>
                <QRCode size={props.qr_size}  value={`WIFI:S:${wifi_ssid};T:WPA;P:${wifi_password};H:false;`}/>
                <TextInput style={styles.text_input} multiline={true}  maxLength={25} onChangeText={setWIFISSID} placeholder='YOUR SSID'></TextInput>
                <TextInput style={[styles.text_input,{marginBottom: space_gap,}]} multiline={true} maxLength={25} onChangeText={setWIFIPassword} placeholder='YOUR PASSWORD'></TextInput>
            </Animated.View>

        </GestureRecognizer> 
    );
}

const styles = StyleSheet.create({
    hotspot_qr: {
        position: 'absolute',
        top: space_gap,
        borderColor: 'dimgrey',
        borderWidth: 2,
        borderRadius: 10,
        paddingLeft: space_gap,
        paddingRight: space_gap,
        left: -space_gap
    },

    url_qr: {
        position: 'absolute',
        top: space_gap,
        borderColor: 'dimgrey',
        borderWidth: 2,
        borderRadius: 10,
        paddingLeft: space_gap,
        paddingRight: space_gap,
        left: -space_gap
    },

    text_input: {
        fontSize: 20, 
        fontFamily: 'Space-Grotesk', 
        fontWeight: '200', 
        marginTop: space_gap,
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
    },
    dots: {
        position: 'absolute',
    }
});