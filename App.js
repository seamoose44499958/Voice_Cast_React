import { StatusBar } from 'expo-status-bar';
import { useDebugValue, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, TextInput} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as HTTP from './HTTPServer'
import * as Mic from './Microphone.js'

const {height} = Dimensions.get('window');

export default function App() {
  const [wifi_ssid, setWifiSSID] = useState(""); 
  const [wifi_password, setWifiPassword] = useState("");
  const [http_url, setHTTPUrl] = useState("Please wait to scan url qr code");
  const [mic_button_color, setMicColorButton] = useState("deepskyblue");

  const toggleMicButton = () => {
    if(mic_button_color === "deepskyblue") {
      setMicColorButton("lightcoral");
      Mic.startMic();
    }
    else {
      setMicColorButton("deepskyblue");
      Mic.stopMic();
    }
  };

  useEffect(()  => {
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
    <View style={styles.container} >
      <View style={styles.qr_codes}>

        <Text style={{fontSize: 20}}>Hotspot</Text>
        <QRCode  size={200} value={`WIFI:S:${wifi_ssid};T:WPA;P:${wifi_password};H:false;`}/>
        <TextInput style={{fontSize: 18}}
          onChangeText={setWifiSSID}
          placeholder='Wifi SSID'
        />
        <TextInput style={[{marginBottom: 20, fontSize: 18}]}
          onChangeText={setWifiPassword}
          placeholder='Wifi Password'
        />

        <Text style={{fontSize: 20}}>URL</Text>
        <QRCode  size={200} value={http_url}/>
        <Text style={{fontSize: 18}}>{http_url}</Text>
        
      </View>

      <TouchableOpacity style={[styles.mic_button, {backgroundColor: mic_button_color}]} onPress={toggleMicButton}> 
        <Text style={{fontSize: height / 12}}>🎙</Text>
      </TouchableOpacity>
      <StatusBar style="auto"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
  },

  qr_codes: {
    position: 'absolute',
    top: (height / 15),
    alignItems: 'center',
  },

  mic_button: {
    position: 'absolute',
    top: (height * (5 / 6)),
    width: (height / 6),
    height: (height / 6),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 1000,
  },
});
