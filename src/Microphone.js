import MicStream from 'react-native-microphone-stream';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import { Platform} from 'react-native'

//Used to see if microphone permission where accepted
let initialized = false;

const mic_buffer = new Array(20);
//Read indexes of the circular buffer, one for each client listening
const read_indexes = [];
let write_index = 0;

//Adds audio chunks to the buffer
const listener = MicStream.addListener(data => {
    mic_buffer[write_index] = data;

    write_index = (write_index + 1) % mic_buffer.length;
    for(let i = 0; i < read_indexes.length; i++) {
        //Pushes all read_indexes forward when the buffer filled up for each client
        if(write_index === read_indexes[i]) {
            read_indexes[i] = (read_indexes[i] + 1) % mic_buffer.length;
        }
    }
});

//Requests permission of microphone
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

//Returns the audio id
export function createMicListener() {
    read_indexes.push(write_index);
    return read_indexes.length - 1;
}

export function validMicID(audio_id) {
    return audio_id >= 0 && audio_id < read_indexes.length;
}   

export function readMic(audio_id) {
    let return_buffer = "";
    
    if(read_indexes[audio_id] !== write_index) {
        let buffer = mic_buffer[read_indexes[audio_id]];

        const in_ramp = generateLinearRamp(0, buffer[0], 7);
        const out_ramp = generateLinearRamp(buffer[buffer.length - 1], 0, 7);

        //Adds linear ramps to prevent clicking
        return_buffer = in_ramp + "," + buffer + "," + out_ramp;
        //Reads one audio chunk
        read_indexes[audio_id] = (read_indexes[audio_id] + 1) % mic_buffer.length;
    }

    return return_buffer;
}

/*
    Returns an array of numbers size num_samples. 
    All numbers are on the line (0, start) to (num_samples, end). 
    The numbers are all equidistant from each other. start is the 
    first number in array but end is not included
*/ 
function generateLinearRamp(start, end, num_samples) {
    let ramp = [];
    let slope = (end - start) / (num_samples);

    for(let i = 0;i < num_samples;i++) {
        ramp.push(i * slope + start);
    }

    return ramp;
}



