const app = document.getElementById("app") as HTMLDivElement;
if (!app) throw new Error("No app element found");

const teamNameInput1 = document.createElement("input");
teamNameInput1.type = "text";
teamNameInput1.value = "Team 1";
app.appendChild(teamNameInput1);

const teamNameInput2 = document.createElement("input");
teamNameInput2.type = "text";
teamNameInput2.value = "Team 2";
app.appendChild(teamNameInput2);

const buzzerState = document.createElement("pre");
app.appendChild(buzzerState);

const state = {
  team1ButtonHeld: false,
  team2ButtonHeld: false,
  throttleUntil: performance.now(),
};
const THROTTLE_DURATION = 2000;

setInterval(() => {
  const gamepads = navigator.getGamepads();

  const team1ButtonPressed =
    gamepads[0]?.buttons.some((b) => b.pressed) ?? false;
  const team2ButtonPressed =
    gamepads[1]?.buttons.some((b) => b.pressed) ?? false;

  // shuffle the order of the checks to make it fair
  const shuffled = [
    () =>
      checkForWin(
        team1ButtonPressed,
        teamNameInput1.value,
        state.team1ButtonHeld,
      ),
    () =>
      checkForWin(
        team2ButtonPressed,
        teamNameInput2.value,
        state.team2ButtonHeld,
      ),
  ].sort(() => Math.random() - 0.5);
  shuffled.forEach((action) => action());

  state.team1ButtonHeld = team1ButtonPressed;
  state.team2ButtonHeld = team2ButtonPressed;

  if (performance.now() > state.throttleUntil) {
    buzzerState.innerText = `listening for buzzes`;
  } else {
    const timeRemaining = (state.throttleUntil - performance.now()) / 1000;
    // set percision to 2 decimal places including trailing zeros
    const formatted = timeRemaining.toFixed(1);

    buzzerState.innerText = `throttled for ${formatted} seconds`;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval#delay_restrictions
}, 4);

function checkForWin(
  buttonPressed: boolean,
  teamName: string,
  buttonHeld: boolean,
) {
  if (buttonPressed && !buttonHeld && performance.now() > state.throttleUntil) {
    const utterance = new SpeechSynthesisUtterance(teamName);
    speechSynthesis.speak(utterance);
    state.throttleUntil = performance.now() + THROTTLE_DURATION;
  }
}
