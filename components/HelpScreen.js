import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, StyleSheet, Text } from 'react-native';
import { useCallback } from 'react';

//Screen with text, no interaction except going back to HomeScreen

export function HelpScreen() {
    const [fontsLoaded] = useFonts({
        'Rubik': require('../assets/fonts/Rubik/Rubik-Italic-VariableFont_wght.ttf')
    });

    const onLayoutHelpView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);
    
    if (!fontsLoaded) {
        return null;
    }

    return (
        <View style={{flexDirection: 'column'}}> 
            <Text style={styles.header}>1. Connect Listeners To Your Hotspot</Text>
            <Text style={styles.instructions}> 
                Can be done manually, or by typing your hotspot name/password in the respective 
                input fields. Once typed you can let the listeners scan the qr code and 
                they will automatically be connected. Swipe left to proceed.
            </Text>
            <Text style={styles.header}>2. Let Listeners Open Website</Text>
            <Text style={styles.instructions}> 
                Can be done manually by letting the listeners type the url(located below the qr code)
                into the browser, or letting them scan the qr code.
            </Text>
            <Text style={styles.header}>3. Start broadcasting the audio</Text>
            <Text style={styles.instructions}>
                Press the button with the microphone. It should turn red. To stop broadcasting the audio,
                press the button again and it should turn back to blue. For the listeners to start hearing the audio
                they need to press the button with the speaker button on the website they opened. 
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        fontFamily: 'Rubik',
        fontSize: 20,
        fontWeight: "bold",
        margin: 10,
    },
    instructions: {
        fontFamily: 'Rubik',
        fontSize: 15,
        flexWrap: 'wrap',
        marginBottom: 30,
        marginLeft: 20,
        marginRight: 10
    }
});