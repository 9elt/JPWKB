class BaseKeyboard {

  constructor() {
    this.open = false;
    this.shift = false;
    this.alph = 0;//0 -> hiragana, 1 -> katakana
    this.layout = JP_keyboard_layout;
  }

  render() {
    const pub = document.createElement('div');
    pub.id = 'jp-web-keyboard-shadow';

    const shadow = pub.attachShadow({ mode: 'open' });

    const cont = document.createElement('div');
    cont.innerHTML = JP_keyboard_extension_template;

    shadow.appendChild(cont);
    document.body.append(pub);

    this.renderAlph();
    return shadow;
  }

  get(el = undefined, all = false) {
    let s = document.getElementById('jp-web-keyboard-shadow').shadowRoot;
    if (!s) s = this.render();
    return s ?
      el ?
        all ?
          s.querySelectorAll(el)
          : s.querySelector(el)
        : s
      : null;
  }

  toggle() {
    const s = this.get('.container');
    if (!s) return;
    this.open = !this.open;
    this.open ? s.classList.add('active') : s.classList.remove('active');
  }

  toggleShift(state = null) {
    const k = this.get('.key-action[data-action="shift"]');
    const kb = this.get('.keyboard');
    if (!k || !this.open) return;
    this.shift = state === null ? !this.shift : state;
    this.shift ? k.classList.add('active') : k.classList.remove('active');
    this.shift ? kb.classList.add('shifted') : kb.classList.remove('shifted');
  }

  cycleAlph() {
    const k = this.get('.key-action[data-action="cycle"]');
    if (!k || !this.open) return;
    k.querySelector(`.alph-${this.alph}`).classList.remove('active');
    this.alph = this.alph ^ 1;
    k.querySelector(`.alph-${this.alph}`).classList.add('active');

    this.renderAlph();
  }

  renderAlph() {
    const k = this.get('.key', true);
    if (!k) return;
    let i = 0;
    for (const char in this.layout) {

      const key = this.layout[char][0][this.alph];
      const shift = this.layout[char][0][this.alph + 2];

      k[i].innerHTML = `\
        <span class="shift">${shift ? shift : '&nbsp;'}</span>\
        <span class="value">${key}</span>`;
      k[i].dataset.code = char;
      k[i].dataset.value = key;
      k[i].dataset.shift = shift;

      i++;
    }
  }

  animateK(e) {
    const prss = this.get(`li[data-code="${e.code}"]`);
    if (!prss) return;

    prss.classList.add('active');
    setTimeout(() => { prss.classList.remove('active'); }, 200);
  }

  translateK(e) {
    const match = this.layout[e.code][0];
    const key = match[this.alph] || '';
    const shift = match[this.alph + 2] || '';
    return this.shift ? shift : key;
  }

  dispatch(e, trns, rplc = false) {
    const t = e.target;
    if (!t.value) return;

    let sel = t.selectionStart;
    let end = t.selectionEnd;
    let before = t.value.substring(0, rplc ? sel - 1 : sel);
    let after = t.value.substring(end);

    t.value = before + trns + after;

    let curr = rplc ? sel : sel + 1
    t.setSelectionRange(curr, curr);
  }

  voice(e) {
    const sel = e.target.selectionStart;
    if (!sel) return;

    const voice_type = e.code == 'BracketLeft' ? 0 : 1;
    const char = e.target.value.substring(sel - 1, sel);

    const row = this.revSearch(char);
    if (!row) return;

    const match = this.layout[row][this.alph + 1][voice_type];
    if (!match) return;

    this.dispatch(e, match, true);
  }

  backSpc() {
    const t = document.activeElement;
    if (!t.value) return;

    let sel = t.selectionStart;
    let end = t.selectionEnd;

    let curr = sel == end ? sel - 1 : sel;

    t.value = t.value.substring(0, curr) + t.value.substring(end);
    t.setSelectionRange(curr, curr);
  }

  revSearch(target) {
    for (const char in this.layout) {
      if (
        this.layout[char][0].includes(target)
        || this.layout[char][this.alph].includes(target)
        || this.layout[char][this.alph + 1].includes(target)
      ) {
        return char;
      }
    }
    return null;
  }
}

class Keyboard extends BaseKeyboard {

  constructor() {
    super();

    this.hotKeys = {
      toggle: { ctrlKey: true, code: 'KeyI' },
      toggleShift: { ctrlKey: false, code: 'ShiftLeft' },
      cycleAlph: { ctrlKey: false, code: 'Tab' },
    };

    this.actions = {
      toggle: (e) => {
        e.preventDefault();
        this.toggle(false);
      },
      toggleShift: (e) => {
        e.preventDefault();
        this.toggleShift();
      },
      unshift: (e) => {
        e.preventDefault();
        this.toggleShift(false);
      },
      cycleAlph: (e) => {
        e.preventDefault();
        this.cycleAlph();
      },
      voice: (e) => {
        e.preventDefault();
        this.voice(e);
      },
      dispatch: (e) => {
        e.preventDefault();
        this.dispatch(e, this.translateK(e));
      },
    };
  }

  init() {
    this.render();
    window.addEventListener('keydown', (e) => { this.keydownEvt(e) });
    window.addEventListener('keyup', (e) => { this.keyupEvt(e) });
    console.log(this.get(), this.get('.keyboard'))
    this.get('.keyboard').addEventListener('mousedown', (e) => { this.mouseEvt(e) });
  }

  mouseEvt(e) {
    e.preventDefault();
    const t = e.target;

    const action = t.dataset.action;
    const button = t.dataset.code;

    if (button) this.animateK({ code: button });

    if (action) {
      switch (action) {
        case 'shift': this.toggleShift(); return;
        case 'cycle': this.cycleAlph(); return;
        case 'delete': this.backSpc(); return;
        case 'semi-voiced': state.shift && this.voice({
          target: document.activeElement,
          code: 'BracketLeft',
        }); return;
        case 'voiced': state.shift && this.voice({
          target: document.activeElement,
          code: 'BracketRight',
        }); return;
        default: break;
      }
    }

    if (button) {
      this.dispatch(
        { target: document.activeElement },
        this.shift ? t.dataset.shift : t.dataset.value
      );
      this.shift ? state.toggleShift() : '';
    }
  }

  keydownEvt(e) {
    if (this.exec(
      () => { this.actions.toggle(e) },
      this.evtMapper(e, this.hotKeys.toggle),
    )) return;

    if (!this.open) return;

    this.animateK(e);

    if (this.exec(
      () => { this.actions.toggleShift(e) },
      this.evtMapper(e, this.hotKeys.toggleShift),
    )) return;

    if (this.exec(
      () => { this.actions.cycleAlph(e) },
      this.evtMapper(e, this.hotKeys.cycleAlph),
    )) return;

    if (this.exec(
      () => { this.actions.voice(e) },
      e.code.includes('Bracket') && !this.shift,
    )) return;

    if (this.exec(
      () => { this.actions.dispatch(e) },
      this.layout[e.code] && !e.ctrlKey,
    )) return;
  }

  keyupEvt(e) {
    this.exec(
      () => { this.actions.unshift(e) },
      this.evtMapper(e, this.hotKeys.toggleShift),
    );
  }

  exec(action, condition) {
    if (condition) { action(); return true };
    return false;
  }

  evtMapper(e, map) {
    return e.code == map.code && e.ctrlKey == map.ctrlKey;
  }

}

const k = new Keyboard;
k.init();