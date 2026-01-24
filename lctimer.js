class LCSettings {
    constructor() {
        // TODO set/get settings from local storage
        this.enabled = true;
        this.slowMode = true;
        this.autoFail = true;
        this.startTime = 34 * 1000; // ms

        const template =
`
<dialog id='lctimer-settings'>

    <div class="lctimer-set">
        <input type="number" id="lctimer-min" min="0" max="59" value="0">
        <label for="lctimer-min">Minutes</label>
        <input type="number" id="lctimer-time" min="0" max="59" value="0">
        <label for="lctimer-time">Seconds</label>
    </div>

    <group id='lctimer-mode' class='radio'>
        <div>
            <input id="lctimer-mode-slow" type="radio" value="slow" name="mode"><label for="lctimer-mode-slow">Thinking mode</label>
        </div>
        <div>
            <input id="lctimer-mode-fast" type="radio" value="fast" name="mode" checked=""><label for="lctimer-mode-fast">Blitz mode</label>
        </div>
    </group>

    <div class="toggle">
        <input id="autofail-btn" class="form-control cmn-toggle" name="autofail" value="true" type="checkbox" checked="checked">
        <label for="autofail-btn"></label>
    </div>
        <label for="autofail-btn">Autofail (blitz)</label>

    <form method="dialog"><button id="doneBtn" class="button">Done</button></form>
</dialog>
`
        document.body.insertAdjacentHTML('beforeend', template);
        this.settingsDialog = document.getElementById('lctimer-settings');
        this.minInput = document.getElementById('lctimer-min');
        this.timeInput = document.getElementById('lctimer-time');
        this.modeSlow = document.getElementById('lctimer-mode-slow');
        this.modeFast = document.getElementById('lctimer-mode-fast');
        this.autoFailBtn = document.getElementById('autofail-btn');
        this.doneBtn = document.getElementById('doneBtn');

        // set DOM values
        this.minInput.value = Math.floor(this.startTime / 1000 / 60);
        this.timeInput.value = Math.floor(this.startTime / 1000 % 60);
        this.modeSlow.checked = this.slowMode;
        this.modeFast.checked = !this.slowMode;
        this.autoFailBtn.checked = this.autoFail;

        // when dialog closes, update settings and emit event
        this.settingsDialog.addEventListener('close', (e) => {
            this.startTime = (parseInt(this.minInput.value) * 60 + parseInt(this.timeInput.value)) * 1000;
            this.slowMode = this.modeSlow.checked;
            this.autoFail = this.autoFailBtn.checked;
        });
    }

    showDialog() {
        this.settingsDialog.showModal();
    }
}

class LCPuzzleTimer {
    constructor(container, settings) {
        this.container = container;
        this.settings = settings;
        this.running = false;
        this.time = settings.startTime;

        this.tickFreq = 100; //ms
        this.lastTick = null;
        this.lastColonFlash = Date.now();
        this.startTime = null;

        this.flashBG = false;
        
        const template = `
<div class="switch" role="button" title="Toggle Lichess Timer Extension">
    <input id="lctimer-toggle-enabled" class="cmn-toggle cmn-toggle--subtle" type="checkbox">
    <label for="lctimer-toggle-enabled"></label>
</div>

<div id='lcpuzzletimer'><span id='lcminutes'>00</span><span id='lccolon'>:</span><span id='lcseconds'>00</span></div>

<button class="settings-gear" role="button" data-icon="" id="lctimer-settings-btn" title="Lichess Puzzle Timer settings"></button>
`
        container.insertAdjacentHTML('beforeend', template)

        this.board = document.querySelector("cg-board");
        this.element = document.getElementById('lcpuzzletimer-container')
        this.lcminutes = document.getElementById('lcminutes')
        this.lcseconds = document.getElementById('lcseconds')
        this.lccolon = document.getElementById('lccolon')

        this.settingsButton = document.getElementById('lctimer-settings-btn');

        // event listeners
        this.settingsButton.addEventListener('click', this.clickedSettings.bind(this));

        this.enableButton = document.getElementById('lctimer-toggle-enabled');
        this.enableButton.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.settings.enabled = true;
                this.reset();
                this.start();
            } else {
                this.settings.enabled = false;
                this.reset();
            }
        });

        // We detect when a new puzzle starts by detecting when
        // the div.puzzle_feedback.after element is removed from puzzle__tools
        const board = document.querySelector(".main-board");
        const puzzletools = document.querySelector(".puzzle__tools");
        const cgCallback = (mutationsList, observer) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // if div.puzzle__feedback.after is removed, assume new puzzle
                    for (let node of mutation.removedNodes) {
                        if (node.classList && node.classList.contains('puzzle__feedback') && node.classList.contains('after')) {
                            this.newPuzzle();
                        }
                    }
                }
            }
        };
        const cgobserver = new MutationObserver(cgCallback);
        cgobserver.observe(puzzletools, {childList: true, subtree: true});

        this.reset();
    }

    clickedSettings() {
        this.settings.showDialog();
    }

    newPuzzle() {
        this.reset();
        this.start();
    }

    reset() {
        this.stop();
        this.flashBG = false;
        this.time = this.settings.startTime;

        // the reference to cg-board can break between puzzles
        this.board = document.querySelector("cg-board");
        this.board.addEventListener("mousedown", this.clickedBoard.bind(this), true);

        this.render();
    }

    start() {
        if (!this.settings.enabled) {
            return;
        }
        this.running = true;
        this.startTime = Date.now();
        this.lastTick = this.startTime;
        this.timer = setInterval(() => {
            this.tick();
        }, this.tickFreq);
    }

    stop() {
        if (this.timer) {
            this.running = false;
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    expired() {
        this.stop();
        this.time = 0;

        if (!this.settings.slowMode && this.settings.autoFail) {
            clickViewSolution();
        }
        this.render();
    }
    
        
    tick() {
        if (this.running) {
            const now = Date.now();
            const diff = now - this.lastTick;
            this.time -= diff;
            this.lastTick = now;
            if (this.time <= 0) {
                this.expired();
            }
        }
        this.render();
    }

    renderBoardBackground() {
        if (!this.settings.enabled) {
            this.board.style.boxShadow = "";
            return;
        }
        if (this.settings.slowMode) {
            if (this.running) {
                if (this.flashBG) {
                    this.board.style.boxShadow = "0px 0px 8px 2px red";
                } else {
                    this.board.style.boxShadow = "0px 0px 6px 1px red";
                }
            } else {
                this.board.style.boxShadow = "0px 0px 6px 1px green";
            }
        } else {
            // fast mode
            if (this.running) {
                this.board.style.boxShadow = "0px 0px 6px 1px green";
            } else {
                this.board.style.boxShadow = "0px 0px 6px 1px red";
            }
        }
    }

    renderSettings() {
        this.enableButton.checked = this.settings.enabled;
    }

    render() {
        const minutes = Math.floor((this.time / 1000) / 60);
        const seconds = (this.time / 1000) % 60;

        let fixed = 1;
        if (seconds > 10) {
            fixed = 0;
        }

        this.renderSettings();
        this.renderBoardBackground();

        this.lcminutes.textContent = minutes.toString().padStart(2, '0');
        this.lcseconds.textContent = seconds.toFixed(fixed).padStart(2, '0');

        if (Date.now() - this.lastColonFlash > 500) {
            if (this.lccolon.style.opacity == 1 ) {
                this.lccolon.style.opacity = 0.5;
            } else {
                this.lccolon.style.opacity = 1.0;
            }
        this.lastColonFlash = Date.now();
        }
    }

    clickedBoard(event) {
        // user tried to click board while locked, flash the background
        // and block event
        if (this.running && this.settings.enabled && this.settings.slowMode ) {
            this.flashBG = true;
            setTimeout(() => {
                this.flashBG = false;
            }, 100);
            event.stopPropagation(); // prevent making moves on the board
        }
    }

}

function clickViewSolution() {
    document.querySelector(".view_solution").querySelectorAll("a")[1].click();
}

// set up timer on load
window.addEventListener("load", () => {

    const puzzle_tools = document.querySelector(".puzzle__tools");

    // Create container at top of tools
    const timer = document.createElement("div")
    timer.className = "lctimer-container";
    puzzle_tools.prepend(timer);


    const settings = new LCSettings();
    const app = new LCPuzzleTimer(timer, settings);

    window.app = app;
    app.newPuzzle();
})
