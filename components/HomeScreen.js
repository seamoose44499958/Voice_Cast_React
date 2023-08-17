import { Background } from "./Background";
import {Text, StyleSheet, TouchableOpacity, useWindowDimensions} from "react-native";
import {useState, useCallback, useEffect} from 'react';
import {COLORS} from "./Colors";
import {SwipableQRCodes} from './QRCodes';
import * as HTTP from '../src/HTTPServer'
import * as Mic from '../src/Microphone.js'

const mic_button_ratio = 3;
const qr_codes_ratio = 1.5;

export function HomeScreen({navigation}) {

  const {height, width} = useWindowDimensions();
  const [mic_color, setMicColor] = useState(COLORS.color_primary_500);
  const onPressMic = () => {
      //Toggles mic on and off
      setMicColor(mic_color === COLORS.color_primary_500 ? COLORS.color_danger_500 : COLORS.color_primary_500);
      if(mic_color === COLORS.color_primary_500) {
        Mic.startMic();
        setMicColor(COLORS.color_danger_500);   
      }
      else {
        Mic.stopMic();
        setMicColor(COLORS.color_primary_500);
      }
  }

  const [http_url, setHTTPUrl] = useState("Please wait to scan url qr code");

  //Handles resource management of TCP socket 
  useEffect(() => {
    HTTP.startServer().then((ip) => {
      setHTTPUrl(`http://${ip}:8080/`);
    });
            
    Mic.initializeMic();
      
    return () => {
      HTTP.stopServer();
      Mic.closeMic();
    }

  },[]);

  return (
    <Background>
      <TouchableOpacity onPress={() => navigation.navigate('Help')}
        style={[
          styles.help_button, 
          {
            width: width / (mic_button_ratio * 4),
            height: width / (mic_button_ratio * 4),
          }
        ]}>
          <Text style={{color: 'lightsteelblue',fontWeight: "500",fontSize: (width / (mic_button_ratio * 6))}}>?</Text>
      </TouchableOpacity>
      <SwipableQRCodes url={http_url} style={{position: 'absolute', left: (width - (width / qr_codes_ratio)) / 2 , top: height / 12 }} qr_size={width / qr_codes_ratio}/>
      <TouchableOpacity 
        style={
          [styles.mic_button, 
            {
              width: width / mic_button_ratio, 
              height: width / mic_button_ratio, 
              backgroundColor: mic_color,
              left: (width - (width / mic_button_ratio)) / 2
            }
          ]
        } onPress={onPressMic}>
        <Text style={{fontSize: width / (mic_button_ratio * 2)}}>🎙</Text>
      </TouchableOpacity >
    </Background>
  );
}

const styles = StyleSheet.create({
  mic_button : {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10000,
    bottom: 10,
  },
  help_button: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10000,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 1000,
    margin: 5,
    borderColor: 'lightsteelblue',
  }
});