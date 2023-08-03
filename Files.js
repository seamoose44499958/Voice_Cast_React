export const voice_html = 
`
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title> Voice Cast </title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content="" />
        
    </head>
    <body>
        <h1>Voice Audio</h1>
        <button id="play">Play</button>
        <script type="text/javascript" src="main.js"></script>
    </body>

</html>
`;

export const voice_html_size = new Blob([voice_html]).size;

export const voice_html_type = "text/html";

export const main_js = 
`
    const circular_buffer = new Array(100);
    let read_index = 0;
    let write_index = 0;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audio_ctx;
    let audio_id = -1;

    let fetching_audio = false;

    async function execute() {
        while(true) {
            let get_audio = getAudio();
            let play_audio = playAudio();
            await get_audio;
            console.log("Gotten Audio");
            await play_audio;
            console.log("Apparently play audio");
            console.log(audio_ctx.state);
        }
    }

    function playAudio() {
        if(read_index === write_index) {
            return new Promise((resolve, reject) => {
                resolve();
            });
        }
        
        const buffer = audio_ctx.createBuffer(1, circular_buffer[read_index].length, 44100);
        const channel = buffer.getChannelData(0);
        for(let i = 0;i < channel.length;i++) {
            channel[i] = (+(circular_buffer[read_index][i])) / 32767.0;
        }

        read_index = (read_index + 1) % circular_buffer.length;
        const source = audio_ctx.createBufferSource();
        let return_promise = new Promise((resolve, reject) => {
            source.onended = (event) => {
                console.log("Audio Played");
                resolve();
            }
        });
        source.buffer = buffer;
        source.connect(audio_ctx.destination);
        source.start();

        return return_promise;
    }

    async function getAudio() {
        try {
            let response = await fetch("/audio", {
                headers : {
                    'X-Audio-ID': audio_id
                }
            });

            if(!response.ok) {
                throw new Error("Invalid Response:" + response.status);
            }

            let body = await response.text();

            if(body.length !== 0) {
                console.log("Any Audio");
                circular_buffer[write_index] = body.split(",");
                write_index = (write_index + 1) % circular_buffer.length;
                if(write_index === read_index) {
                    read_index = (read_index + 1) % circular_buffer.length;
                }
            }
        } catch(err) {
            console.log(err);
        }
    }

    document.getElementById("play").onclick = async () => {
        audio_ctx = new AudioContext();
        try {
            let response = await fetch("/initialize_audio", {
                method: 'POST'
            });
    
            if(response.ok) {
                audio_id = response.headers.get("X-Audio-ID");
            }
            else {
                throw new Error("Couldn't initialize audio");
            }
            console.log("fetched");
            execute();
            
        } catch(err) {
            console.log(err);
        }
    }
`;

export const main_js_size = new Blob([main_js]).size;

export const main_js_type = "text/javascript"


