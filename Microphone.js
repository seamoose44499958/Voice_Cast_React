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
        if(write_index === read_indexes[i]) {
            read_indexes[i] = (read_indexes[i] + 1) % mic_buffer.length;
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
    read_indexes.push(write_index);
    return read_indexes.length - 1;
}

export function validMicID(audio_id) {
    console.log(read_indexes.length);
    return audio_id >= 0 && audio_id < read_indexes.length;
}   

export function readMic(audio_id) {
    let return_buffer = "";
    
    if(read_indexes[audio_id] !== write_index) {
        let buffer = mic_buffer[read_indexes[audio_id]];
        const in_ramp = generateLinearRamp(0, buffer[0], 7);
        const out_ramp = generateLinearRamp(buffer[buffer.length - 1], 0, 7);
        return_buffer = in_ramp + "," + buffer + "," + out_ramp;
        read_indexes[audio_id] = (read_indexes[audio_id] + 1) % mic_buffer.length;
    }

    return return_buffer;
}

function generateLinearRamp(start, end, num_samples) {
    let ramp = [];
    let slope = (end - start) / (num_samples);

    for(let i = 0;i < num_samples;i++) {
        ramp.push(i * slope + start);
    }

    return ramp;
}



