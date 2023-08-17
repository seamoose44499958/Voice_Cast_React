import { main_js, main_js_size, main_js_type, voice_html, voice_html_size, voice_html_type} from './Files';

/*
    Abstraction for a file handler. Currently just returns strings 
    that are found in Files.js
*/

//Returns an array with the error(as a boolean where true means the file was found), the contents of the file, and the size
export function getFile(path) {
    if(path === "/index.html" || path === "/") {
        return [true, voice_html, voice_html_size, voice_html_type];
    }
    else if(path === "/main.js") {
        return [true, main_js, main_js_size, main_js_type];
    }

    return [false, "", 0];
}
