/*
    All the files the client will have access to, along with the type of file and 
    the file size in bytes. Currently there are two. The index.html file and the main.js file. 
*/

export const voice_html = 
`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title> Voice Cast </title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content="" />

        <style>
            #play {
                border-radius: 10000px;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                border-style: none;
            }

            body {
                background-color: #0FB1FF;
            }
        </style>
    </head>
    <body>
        <button id="play">🔊</button>
        <script type="text/javascript" src="main.js"></script>
    </body>

</html>
`;

export const voice_html_size = new Blob([voice_html]).size;

export const voice_html_type = "text/html";

/*
    The two main methods that run the program are playAudio and getAudio. 
    getAudio fills the circular buffer while playAudio reads from the circular buffer.
    Audio is transferred through constant polling by the client as seen in the
    in the execute function. Both functions are concurrent but in different ways. getAudio() 
    is as basic as it gets. playAudio on the other hand will return a promise that is either empty
    or calls itself when the audio finishes playing. It has a lock(in the form of a boolean) so that 
    only one audio chunk can be played at once. If playAudio is locked or the buffer is empty it will return an 
    empty promise. The api consists of two parts, initializing the client as an audio listener and getting the audio.
    When initializing the audio the client gets an audio id(X-Audio-ID located in the header) through the /initialize_audio
    Post request. After, the client can get an audio chunk by doing a Get request with the X-Audio-ID header. The audio chunks 
    consists of a 16-bit PCM where each sample is separated by a ','. A linear ramp is already calculated by the server 
    at the front and the end of every audio chunk to prevent clicking. The audio can be started and stopped by the play button.
    Once audio is stopped the client will not continue to poll for new audio chunks. Audio will stop playing because
    the write index is equal to the read index. On an error everything is reset. The client will need to reinitialize the audio
    again and create a new audio context. The client can do this by pressing the button again(which will have changed color back 
    to the non playing state).

*/

export const main_js = 
`
    const circular_buffer = new Array(20);
    let read_index = 0;
    let write_index = 0;

    let audio_on = false;

    const play_button = document.getElementById("play");

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audio_ctx;
    let audio_id = -1;
    
    //Main function that starts playing the audio
    async function execute() {
        while(audio_on) {
            playAudio();
            await getAudio();
        }
    }

    //Lock used for not playing more then one audio chunk at a time
    let play_lock = false;

    function playAudio() {
        try {
            if(play_lock === true || read_index === write_index) {
                return new Promise((resolve, reject) => {
                    resolve();
                });
            }
            
            play_lock = true;
            const buffer = audio_ctx.createBuffer(1, circular_buffer[read_index].length, 44100);
            const channel = buffer.getChannelData(0);

            //Converts the PCM chunk to the float array as required by the web audio api
            for(let i = 0;i < channel.length;i++) {
                channel[i] = (+(circular_buffer[read_index][i])) / 32767.0;
            }

            read_index = (read_index + 1) % circular_buffer.length;

            const source = audio_ctx.createBufferSource();

            let return_promise = new Promise((resolve, reject) => {
                //Called when audio is finished playing
                source.onended = (event) => {
                    play_lock = false;
                    playAudio();
                    resolve();
                }
            });

            //Starts playing the audio chunk
            source.buffer = buffer;
            source.connect(audio_ctx.destination);
            source.start();

            return return_promise;

        } catch(err) {
            console.log(err);
            reset();
        }
    }


    async function getAudio() {
        try {
            let response = await fetch("/audio", {
                headers : {
                    'X-Audio-ID': audio_id
                }
            });

            //Will throw out the response if the audio was turned off by client
            if(!audio_on) {
                return;
            }

            if(!response.ok) {
                throw new Error("Invalid Response:" + response.status);
            }

            let body = await response.text();

            if(body.length !== 0) {
                circular_buffer[write_index] = body.split(",");
                //Fills the circular buffer
                write_index = (write_index + 1) % circular_buffer.length;

                //Pushes the read_index forward when the buffer is full 
                if(write_index === read_index) {
                    read_index = (read_index + 1) % circular_buffer.length;
                }
            }
        } catch(err) {
            console.log(err);
            reset();
        }
    }

    play_button.onclick = async () => {
        try {
            //Triggered if error or first time user is playing audio 
            if(audio_id === -1) {
                audio_ctx = new AudioContext();
                let response = await fetch("/initialize_audio", {
                    method: 'POST'
                });
        
                if(response.ok) {
                    audio_id = response.headers.get("X-Audio-ID");
                }
            }
            
            //Button toggle for on and off
            if(!audio_on) {
                play_button.style.backgroundColor = "#AC4053";
                audio_on = true;
                execute();
            }
            else {
                play_button.style.backgroundColor = "#0094DB";
                audio_on = false;
                read_index = write_index;
            }
            
            
        } catch(err) {
            console.log(err);
            reset();
        }
    }

    function reset() {
        audio_id = -1;
        audio_on = false;
        play_button.style.backgroundColor = "#0094DB";
        read_index = write_index;
    }
    
    play_button.style.width = (window.innerWidth / 3) + "px";
    play_button.style.height = (window.innerWidth / 3) + "px";
    play_button.style.fontSize = (window.innerWidth / 8) + "px"
    play_button.style.backgroundColor = "#0094DB";
`;

export const main_js_size = new Blob([main_js]).size;

export const main_js_type = "text/javascript"


