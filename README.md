# Voice_Cast App
## Description
<p>An android app written using React Native to stream microphone audio over the phones hotspot to clients.</p>

### Implementation details
<p> When the app is booted up it will initialize a hand rolled http server. Once the client is connected to the phones hotspot they can type in the URL displayed in the GUI.
Once the client presses the button on the loaded website, the browser will constantly http poll for audio from the phone and store it in a circular buffer to play back.</p>

### Limitations
<p> Due to the server only supporting http(not https) all the audio is handled on the GUI thread of the browser. This severly slows down the playback of audio and hinders the performance of polling
even with the concurrency provided by async. For this reason the project is discontinued.</p>
