import { main_js, main_js_size, main_js_type, voice_html, voice_html_size, voice_html_type} from './Files';

export function getFile(path) {
    if(path === "/index.html" || path === "/") {
        return [true, voice_html, voice_html_size, voice_html_type];
    }
    else if(path === "/main.js") {
        return [true, main_js, main_js_size, main_js_type];
    }

    return [false, "", 0];
}
