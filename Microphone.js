import MicStream from 'react-native-microphone-stream';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { Platform} from 'react-native'
import {TextDecoder} from 'text-encoding-utf-8';

let initialized = false;

const mic_buffer_size = 20;
const mic_buffer = new Array(mic_buffer_size);
const read_indexes = [];
let write_index = 0;

const listener = MicStream.addListener(data => {
    //console.log("--------------------Original\n" + data ); //28,28,27,25,21,17,16,12,10
    mic_buffer[write_index] = data;
    //console.log("-----------------------New\n" + mic_buffer[write_index]);

    write_index = (write_index + 1) % mic_buffer_size;
    for(let i = 0; i < read_indexes.length; i++) {
        if(write_index === read_indexes[i][0]) {
            read_indexes[i][1] = true;
        }
    }
});

export async function initializeMic() {
    let result = await request(Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO);

    initialized = result === RESULTS.GRANTED || result === RESULTS.LIMITED;
    console.log('Initialized:' + initialized);
    if(initialized) {
        MicStream.init({
            bufferSize: 4096,
            sampleRate: 44100,
            bitsPerChannel: 16,
            channelsPerFrame: 1,
        });
    }
}

export function startMic() {
    if(initialized) {
        MicStream.init({
            bufferSize: 4096,
            sampleRate: 44100,
            bitsPerChannel: 16,
            channelsPerFrame: 1,
        });
        MicStream.start();
    }
    
}

export function stopMic() {
    if(initialized) { 
        MicStream.stop();
    }
}

export function closeMic() {
    if(initialized) {
        MicStream.stop();
        listener.remove();
        initialized = false;
    } 
}

export function createMicListener() {
    read_indexes.push([write_index, false]);
    return read_indexes.length - 1;
}

export function validMicID(listener_index) {
    console.log(read_indexes.length);
    return listener_index >= 0 && listener_index < read_indexes.length;
}   

export function readMic(listener_index) {
    let return_buffer = "";
    
    console.log(`Pre:\nReader index: ${read_indexes[listener_index][0]} -> ${read_indexes[listener_index][1]}\nWrite index: ${write_index}`);

    if(read_indexes[listener_index][1]) {
        console.log("Possible error as it jumped the if ------------------------||||||||||||||||")
        for(let i = write_index;i < mic_buffer_size;i++) {
            return_buffer += mic_buffer[i];  
        }
        read_indexes[listener_index][0] = 0;
    }

    for(;read_indexes[listener_index][0] < write_index; read_indexes[listener_index][0]++) {
        return_buffer += mic_buffer[read_indexes[listener_index][0]] + "0,";
    }
    return_buffer += "0";

    read_indexes[listener_index][1] = false;


    console.log(`Post:\nReader index: ${read_indexes[listener_index][0]} -> ${read_indexes[listener_index][1]}\nWrite index: ${write_index}`);

    return return_buffer;
}



