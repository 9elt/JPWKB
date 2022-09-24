class KeyboardState {

    constructor () {
        this.open = false;
        this.shift = false;
        //  1 -> hiragana, 2 -> katakana
        this.alphabet = 1;
    }

    toggleShift() {

        const shadow = document.getElementById('jp-web-keyboard-shadow').shadowRoot;
        if (!shadow || !this.open) return;

        this.shift = this.shift ? false : true;

        const shift_key = shadow.querySelector(`.key-action[data-action="shift"]`);
        const keyboard = shadow.querySelector('.keyboard');

        if (this.shift) {
            shift_key.classList.add('active');
            keyboard.classList.add('shifted');
        } else {
            shift_key.classList.remove('active');
            keyboard.classList.remove('shifted');
        }
    }

    toggleOpen() {
        
        const shadow = document.getElementById('jp-web-keyboard-shadow').shadowRoot;
        if (!shadow) return;

        this.open = this.open ? false : true;

        const container = shadow.querySelector('.container');
    
        if (this.open) {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }
    }

    cycleAlphabets() {

        const shadow = document.getElementById('jp-web-keyboard-shadow').shadowRoot;
        if (!shadow || !this.open) return;

        const cycle_key = shadow.querySelector(`.key-action[data-action="cycle"]`);

        cycle_key.querySelector(`.alphabet-${this.alphabet}`).classList.remove('active');
        this.alphabet = ((this.alphabet - 1) ^ 1) + 1;
        cycle_key.querySelector(`.alphabet-${this.alphabet}`).classList.add('active');
    
        renderAlphabet();
    }
}

const action_keys = {
    toggleOpen: {ctrlKey: true, code: 'KeyI'},
    toggleShift: {ctrlKey: false, code: 'ShiftLeft'},
    cycleAlphabets: {ctrlKey: false, code: 'Tab'},
}

const state = new KeyboardState();

start();

function start() {

    const shadow = renderShadow();

    //  keyboard typing
    window.addEventListener('keydown', (e) => { eventRouter(e) });

    //  key release
    window.addEventListener('keyup', (e) => { eventRouter(e) });

    //  gui click
    shadow.querySelector('.keyboard').addEventListener('mousedown', (e) => { eventRouter(e) });

}

function eventRouter(e) {

    if (e.type === 'mousedown') {//  MOUSE DOWN

        e.preventDefault();// prevents focus loss on inputs and textareas

        const is_action = e.target.dataset.action;
        const is_button = e.target.classList.contains('key');

        const button_code = e.target.dataset.code;
        if (button_code) animateKey({code: button_code});

        if (is_action) {

            const action = e.target.dataset.action; 

            switch (action) {
                case 'shift': state.toggleShift(); return;
                case 'cycle': state.cycleAlphabets(); return;
                case 'delete': backspace(); return;
                case 'semi-voiced': if (!state.shift) { voiced({target: document.activeElement, code: 'BracketLeft'}); return };
                case 'voiced': if (!state.shift) { voiced({target: document.activeElement, code: 'BracketRight'}); return };
                default: break;
            }
        }

        if (is_button && state.shift) {

            dispatch({target: document.activeElement}, e.target.dataset.shift);
            state.toggleShift();
    
        } else if (is_button) {

            dispatch({target: document.activeElement}, e.target.dataset.value);
        }

    } else if (e.type === 'keydown') {//  KEY DOWN

        if (mapKeyboardEvent(e, action_keys.toggleOpen)) {

            e.preventDefault();
            state.toggleOpen();
            return; 
        }

        if (!state.open) return;

        animateKey(e);

        if (mapKeyboardEvent(e, action_keys.toggleShift)) {

            e.preventDefault();
            state.toggleShift();
            return;
        }

        else if (mapKeyboardEvent(e, action_keys.cycleAlphabets)) {

            e.preventDefault();
            state.cycleAlphabets();
            return;
        }

        else if (e.code.includes('Bracket') && !state.shift) {

            e.preventDefault();
            voiced(e);
            return;
        }

        else if (jp_layout[e.code] && !e.ctrlKey) {

            e.preventDefault();
            dispatch(e, translate(e));
            return;
        }

    } else if (e.type == 'keyup') {//  KEY UP

        if (mapKeyboardEvent(e, action_keys.toggleShift)) {

            state.shift = true;
            state.toggleShift();
            return;
        }
    }

}

function mapKeyboardEvent(e, key_map) {

    return e.code == key_map.code && e.ctrlKey == key_map.ctrlKey;
}

function translate(e) {

    const match = jp_layout[e.code][0];

    const jp_key = match[state.alphabet - 1] || '';
    const jp_shift = match[state.alphabet + 1] || '';

    return state.shift ? jp_shift : jp_key;
}

function dispatch(e, translation, replace = false) {

    //  current cursor position
    let pos = e.target.selectionStart;
    let pos_end = e.target.selectionEnd;

    if (e.target.value === undefined) return;

    let before = e.target.value.substring(0, pos);
    let after = e.target.value.substring(pos_end);

    //  voiced replace
    if (replace) before = before.slice(0, -1);

    //  new value
    e.target.value = before + translation + after;

    //  new cursor position
    let pos_new = replace ? pos : pos + 1
    e.target.setSelectionRange(pos_new, pos_new);
}

function voiced(e) {

    const type = e.code == 'BracketLeft' ? 0 : 1;

    let pos = e.target.selectionStart;
    if (!pos) return;

    const target_char = e.target.value.substring(pos - 1, pos);

    let target_row;
    for (const char in jp_layout) {
        if (
            jp_layout[char][0].includes(target_char)
            || jp_layout[char][state.alphabet].includes(target_char)
        ) target_row = char;
    }
    if (!target_row) return;
    
    const match = jp_layout[target_row][state.alphabet][type];
    if (!match) return;

    dispatch(e, match, true);
}

function backspace() {

    let target = document.activeElement;
    if (target.value === undefined) return;

    let pos = target.selectionStart;
    let pos_end = target.selectionEnd;

    let pos_new = pos == pos_end ? pos - 1 : pos;

    target.value = target.value.substring(0, pos_new) + target.value.substring(pos_end);
    target.setSelectionRange(pos_new, pos_new);
}

//  graphics rendering

function renderShadow() {

    const top = document.createElement('div');
    top.id = 'jp-web-keyboard-shadow';

    document.body.append(top);

    const shadow = top.attachShadow({mode : 'open'});

    const container = document.createElement('div');
    container.innerHTML = keyboard_extension_template;

    shadow.appendChild(container);

    renderAlphabet();

    return shadow;
}

function renderAlphabet() {

    const shadow = document.getElementById('jp-web-keyboard-shadow').shadowRoot;
    if (!shadow) return;

    const keys = shadow.querySelectorAll('.key');
    let i = 0;

    for (const char in jp_layout) {

        const jp_key = jp_layout[char][0][state.alphabet - 1];
        const jp_shift = jp_layout[char][0][state.alphabet + 1]

        keys[i].innerHTML = `\
            <span class="shift">${jp_shift ? jp_shift : '&nbsp;'}</span>\
            <span class="value">${jp_key}</span>\
        `;
        keys[i].dataset.code = `${char}`;
        keys[i].dataset.value = `${jp_key}`;
        keys[i].dataset.shift = `${jp_shift}`;

        i++;
    }
}

function animateKey(e) {

    // works for all keys except for shift key which is handled separately

    const shadow = document.getElementById('jp-web-keyboard-shadow').shadowRoot;
    if (!shadow) return;

    const pressed_key = shadow.querySelector(`li[data-code="${e.code}"]`);

    if (!pressed_key) return;

    pressed_key.classList.add('active');
    setTimeout(() => {pressed_key.classList.remove('active')}, 200);
}