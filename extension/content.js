main();

function main() {

    renderGui();
    handleKeyEvents();
}

//  keyboard events

function handleKeyEvents() {

    let alphabet = 0;
    let cycle_key = 'AltRight';

    window.addEventListener('keydown' , function(e) {

        let event_status = checkCode(e, cycle_key, alphabet);
        
        if (event_status == 0) return;

        e.preventDefault();

        if (event_status == 2) {
            alphabet = cycleAlphabets(alphabet);
            return;
        }

        if (event_status == 3) {
            replaceVoiced(e);
            return;
        }

        let translation = JPWKB_LAYOUT[e.code][0][alphabet - 1];
        let shift_translation = JPWKB_LAYOUT[e.code][0][alphabet + 1];

        if (e.shiftKey == true && shift_translation != '') {
            e.target.value += shift_translation;
        } else {
            e.target.value += translation;
        }

    });
}

function checkCode(e, cycle_key, alphabet) {

    if (
        e.target.tagName != 'INPUT'
        && e.target.tagName != 'TEXTAREA'
        //&& e.target.role != 'textbox'
        && e.code != cycle_key
    ) return 0;

    else if (e.ctrlKey || e.isTrusted == false) return 0;
    
    else if (e.code == cycle_key) return 2;

    else if (alphabet == 0 || JPWKB_LAYOUT[e.code] == undefined) return 0;

    else if ((e.code == 'BracketLeft' || e.code == 'BracketRight') && e.shiftKey != true) return 3;

    return 1;
}

function cycleAlphabets(alphabet) {

    alphabet == 2 ? alphabet = 0 : alphabet += 1;

    let gui = document.getElementById('jpwkb-gui-shadow');
    let shadow = gui.shadowRoot;

    let alphabet_status = shadow.getElementById('status');
    let status_txt = ['disabled', 'hiragana', 'katakana'];

    alphabet_status.innerHTML = '[AltRight] <span class="status-' + alphabet + '"></span> ' + status_txt[alphabet];

    let keyboard = shadow.getElementById('keyboard');
    if (alphabet == 0) {
        keyboard.classList.remove('active');
    } else {
        keyboard.classList.add('active');
    }

    let gui_keys = shadow.querySelectorAll('.key');
    let index = 0;

    for (let key in JPWKB_LAYOUT) { 

        if (alphabet != 0) {

            let translation = JPWKB_LAYOUT[key][0][alphabet - 1];
            let shift_translation = JPWKB_LAYOUT[key][0][alphabet + 1]

            gui_keys[index].innerHTML = shift_translation + '<br>' + translation;

            index += 1;
        }
    }

    return alphabet;
}

function replaceVoiced(e) {

    let tick = e.code == 'BracketLeft' ? 0 : 1;

    let char = e.target.value.slice(-1);
    console.log(char);
    e.target.value = e.target.value.slice(0, -1);

    let replace_key = '';

    for (let key in JPWKB_LAYOUT) {
        if (JPWKB_LAYOUT[key][0].includes(char)) {
            replace_key = key;
        }
    }

    if (replace_key == '') {
        e.target.value += char;
        return;
    }

    let new_char = JPWKB_LAYOUT[replace_key];
    let voiced = new_char[0][0] == char ? 1 : 2;

    if (new_char[voiced][tick] == undefined || new_char[voiced][tick] == '') {
        e.target.value += char;
    } else {
        e.target.value += new_char[voiced][tick];
    }

    return;
}

//  graphics rendering

function renderGui() {
    let container = document.createElement('div');
    container.setAttribute('id', 'jpwkb-gui-shadow');
    container.innerHTML = JPWKB_CONTAINER;
    document.body.append(container);

    let shadow = container.attachShadow({mode : 'open'});

    let gui = document.createElement('div');
    gui.className = 'jpwkb-gui';
    gui.innerHTML = buildGui();

    shadow.appendChild(gui);
}

function buildGui() {
    let row1 = buildKeys(13, 0, 3);
    let row2 = buildKeys(12, 2, 2);
    let row3 = buildKeys(12, 3, 1);
    let row4 = buildKeys(11, 2, 4);

    let keyboard = '<div id="keyboard">' + row1 + row2 + row3 + row4 + '</div>';
    let status = '<p id="status">[AltRight] <span class="status-0"></span> disabled</p>';

    return JPWKB_STYLE + keyboard + status;
}

function buildKeys(keys, ph1, ph2) {
    let key = '<li class="key"></li>';
    ph1 = '<li class="ph ph-' + ph1 + '"></li>';
    ph2 = '<li class="ph ph-' + ph2 + '"></li>';
    let row = '<ul class="row">' + ph1 + key.repeat(keys) + ph2 + '</ul>';

    return row;
}