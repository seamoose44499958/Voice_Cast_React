import {voice_html, voice_html_size} from './Files';

export function getFile(path) {
    if(path === "/index.html" || path === "/") {
        return [true, voice_html, voice_html_size];
    }

    return [false, "", 0];
}
