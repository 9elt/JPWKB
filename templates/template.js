const JP_keyboard_extension_template = `
<style>

    .dark {
        --bg: #24231fbf;
        --bg-2: #0002;
        --color: #fff;
        --accent: #51bd00;
        --accent-low: #a2d979;
        --shadow: #0006;
    }

    .light {
        --bg: #b9b9b982;
        --bg-2: #ffffff5e;
        --color: #404040;
        --accent: #51bd00;
        --accent-low: #a2d979;
        --shadow: #b3b3b366;
    }

    .container {
        font-size: 16px;
        position: fixed;
        left: 0;
        bottom: 0;
        width: 100%;
        color: var(--color);
        font-family: "Helvetica Neue", "Helvetica", "Arial", "Source Han Sans", "源ノ角ゴシック", "Hiragino Sans", "HiraKakuProN-W3", "Hiragino Kaku Gothic ProN W3", "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", "Noto Sans", "Noto Sans CJK JP", "メイリオ", "Meiryo", "游ゴシック", "YuGothic", "ＭＳ Ｐゴシック", "MS PGothic", "ＭＳ ゴシック", "MS Gothic", sans-serif;
        z-index: 999999;
    }

    .keyboard {
        margin: 0 auto 16px auto;
        width: fit-content;
        border-radius: 24px;
        background-color: var(--bg);
        box-shadow: 0 10px 20px #0005, inset 0 0 100px 8px var(--bg-2); /* ADD TO JISHO !!!! */
        backdrop-filter: blur(10px);
        padding: 0;
        max-height: 0;
        overflow: hidden;
        transition: all 0.3s ease-in-out;
    }

    .container.active > .keyboard {
        padding: 12px;
        max-height: 270px;
    }

    .row {
        padding: 0;
        margin: 0;
        list-style: none;
        display: flex;
        justify-content: center;
    }

    .key,
    .key-action {
        width: 40px;
        height: 40px;
        margin: 4px;
        background-color: var(--bg-2);
        border-radius: 5px;
        box-shadow: 0 3px 0px 2px var(--bg);
        cursor: pointer;
        font-weight: bold;
        transition: all 0.2s ease-in-out;
    }

    .key:hover,
    .key-action:hover {
        color: var(--accent);
        background-color: var(--bg);
        box-shadow: 0 1px 0px 2px var(--bg);
        transform: translateY(2px);
    }

    .key.active,
    .key-action.active {
        color: var(--color);
        background-color: var(--accent);
        box-shadow: 0 0 10px var(--accent);
        transform: translateY(2px);
    }

    .alph.active {
        color: var(--accent);
    }

    .key-action {
        line-height: 40px;
        text-align: center;
    }

    .key {
        text-align: center;
    }

    .key .value,
    .key .shift {
        display: block;
        margin-top: 2px;
        line-height: 15px;
        transition: all 0.1s ease-in-out;
    }

    .keyboard .shift,
    .keyboard.shifted .value {
        opacity: 0.5;
    }

    .keyboard .value,
    .keyboard.shifted .shift {
        opacity: 1;
    }

    .key-action.s0 { display: none; }

    .key-action.s1 { width: 91px; } /* 48*2 -4 -4 */

    .key-action.s2 { width: 64px }

    .key-action.s3 { width: 64px }

    .key-action.s4 { width: 80px; }

    .key-action.s5 { width: 48px; }

    .key-action.s6 { width: 112px; }

    .message {
        text-align: center;
        margin: 10px 0 0 0;
    }

    /* very very important */

    .key > *,
    .key-action > * {
        pointer-events: none;
    }

</style>

<div class="container dark">

    <div class="keyboard">

        <ul class="row">
            <li class="key-action s0"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key-action s1" data-code="Backspace" data-action="delete">Backsp</li>
        </ul>

        <ul class="row">
            <li class="key-action s2" data-code="Tab" data-action="cycle">
                <span class="alph alph-0 active">あ</span>
                |
                <span class="alph alph-1">ア</span>
            </li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key" data-action="semi-voiced"></li>
            <li class="key" data-action="voiced"></li>
            <li class="key-action s3"></li>
        </ul>

        <ul class="row">
            <li class="key-action s4"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key-action s5"></li>
        </ul>

        <ul class="row">
            <li class="key-action s2" data-action="shift">Shift</li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key"></li>
            <li class="key-action s6"></li>
        </ul>

        <p class="message">Ctrl + i</p>

    </div>
</div>
`