# Intro

This browser extension adds a timer to the lichess.org puzzle trainer. It has two modes:

* **Thinking mode** - prevents you from making a move until the timer reaches zero to encourage you to calculate all variations before just making the first move you see. 
* **Blitz mode** - you must move before the timer reaches zero. Or else. For more fun, you can enable "auto fail" so that if you don't complete the puzzle on time, the extension will click "view the solution" automatically and you'll fail the puzzle. If you like Puzzle Storm but wish you could lose real puzzle rating points, try this mode with 10 seconds and "Jump to next puzzle immediately" option enabled.

# Install

## Chrome / Edge

* [Lichess Puzzle Timer in Chrome web store](https://chromewebstore.google.com/detail/lichess-puzzle-timer/mmjgijgmfkhagpfnnafphidhndjjbicc)

## Firefox

* Waiting on approval

## Tampermonkey (Chrome, Firefox, Safari, Opera Next)

* The [lctimer.js](https://raw.githubusercontent.com/cristoper/lichess-puzzle-timer/refs/heads/main/lctimer.js) script can be pasted directly into [Tampermonkey](https://www.tampermonkey.net/). This way the extension should work on any browser that the Tampermonkey extension supports.


## Safari

This extension works as a native extension in Safari for macOS, but it is not signed with an Apple developer account so it requires several steps to install:

1. First [enable features for web developers](https://developer.apple.com/documentation/safari-developer-tools/enabling-developer-features) in Safari (Settings > Advanced > check "Show features for web developers")
2. In Settings > Developer, click "Allow unsigned extensions"
3. Download and run [Lichess.Puzzle.Timer.app.zip](https://github.com/cristoper/lichess-puzzle-timer/releases/download/v1.1/Lichess.Puzzle.Timer.app.zip). Click "Done" to dismiss the security warning it gives you.
4. Open your System Settings > Privacy & Security, find the notification that "Lichess Puzzle Timer" was blocked and click "Open Anyway". Click "Open Anyway" when prompted.
5. In your Safari Settings, go to the Extensions tab. You should see Lichess Puzzle Timer installed. Click the checkbox next to it to enable.
6. Enjoy!

## Manual

* If your browser allows manually installing a manifest v3 extension, you can download [lichess_puzzle_timer-1.3.zip](https://github.com/cristoper/lichess-puzzle-timer/releases/download/v1.3/lichess_puzzle_timer-1.1.zip)

# Use

When the extenion is installed, lichess.org puzzle trainer pages will have a timer added above the move list. (Circled in green in screenshot below.)

To enable the timer, simply toggle the switch. By default it is in Thinking mode. Click the gear icon to change the mode and set the time.

![Screenshot with timer circled](https://raw.githubusercontent.com/cristoper/lichess-puzzle-timer/main/screenshot-full-circle.png)

## Thinking mode

In this mode the board will have a red outline and you will not be able to make a move until the timer expires. Use this time to force yourself to calculate your candidate variations and consider all responses. Once the timer reaches zero, the board outline will turn green and you may make your move.

## Blitz mode

In this mode you try to make your move *before* the timer runs out. For extra stakes, enable "autofail" mode so that if you have not solved the puzzle in time it is automatically failed.

## Settings

![Screenshot of settings dialog](https://raw.githubusercontent.com/cristoper/lichess-puzzle-timer/main/settings.png)

# Other extensions

If you want a lichess puzzle timer extension that will keep track of your solving time (with analytics and everything), check out [this extension by el-tecson](https://github.com/el-tecson/lichess-puzzle-timer/). That extension (unlike this one) also works on Firefox for Android.
