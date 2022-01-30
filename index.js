const TICK = 600;
const BLINK = 300;
const COLORS = ["red", "blue", "yellow", "green"];
const MISTAKE = "mistake";

const playButtonElement = document.getElementById("play");
const controlsElement = document.getElementById("controls");
const levelElement = document.getElementById("level");
const containerElement = document.getElementById("container");

let sequence = [COLORS[Math.floor(Math.random() * 4)]];

function setButtonsDisabled(value) {
  for (let button of document.getElementsByClassName("color")) {
    if (value) {
      button.setAttribute("disabled", true);
    } else {
      button.removeAttribute("disabled");
    }
  }
}

function increaseLevel() {
  levelElement.textContent = +levelElement.textContent + 1;
  sequence.push(COLORS[Math.floor(Math.random() * 4)]);
}

function prepareGame() {
  setButtonsDisabled(false);
  controlsElement.classList.add("playing");
  containerElement.classList.remove("mistake");
}

function finishGame() {
  levelElement.textContent = 1;
  sequence = [COLORS[Math.floor(Math.random() * 4)]];

  setButtonsDisabled(true);

  containerElement.classList.add("mistake");
  controlsElement.classList.remove("playing");
}

async function showSequence() {
  setButtonsDisabled(true);

  for (let color of sequence) {
    await new Promise((resolve) => {
      setTimeout(() => {
        const button = document.querySelector(`button.${color}`);
        button.classList.add("active");

        setTimeout(() => {
          button.classList.remove("active");
          resolve();
        }, BLINK);
      }, TICK);
    });
  }

  setButtonsDisabled(false);
}

async function listenForClicks() {
  const p = new Promise((resolve, reject) => {
    const _sequence = [...sequence];

    function handleClick(e) {
      const clickedColor = e.target.getAttribute("id");

      if (_sequence.at(0) === clickedColor) {
        _sequence.shift();

        // Success !!
        if (!_sequence.length) {
          containerElement.removeEventListener("click", handleClick);
          resolve();
        }
      } else if (e.target.tagName === "rect") {
        // We clicked a button, but not the right one.
        containerElement.removeEventListener("click", handleClick);
        reject(MISTAKE);
      }
    }

    containerElement.addEventListener("click", handleClick);
  });
  return p;
}

async function playNextLevel() {
  await showSequence();

  return listenForClicks();
}

async function play() {
  prepareGame();

  while (true) {
    try {
      await playNextLevel();
      increaseLevel();
    } catch (e) {
      if (e === MISTAKE) {
        break;
      }
    }
  }

  finishGame();
  return;
}

playButtonElement.addEventListener("click", play);
