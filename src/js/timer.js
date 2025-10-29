let timerId = null;
let remainingSeconds = 0;
let totalSeconds = 0;
let tickHandler = () => {};
let completeHandler = () => {};

export function onTick(handler) {
  tickHandler = handler;
}

export function onComplete(handler) {
  completeHandler = handler;
}

export function start(durationSeconds) {
  totalSeconds = durationSeconds;
  if (remainingSeconds <= 0 || remainingSeconds > durationSeconds) {
    remainingSeconds = durationSeconds;
  }
  clearInterval(timerId);
  timerId = window.setInterval(() => {
    remainingSeconds -= 1;
    tickHandler({ remainingSeconds, totalSeconds });
    if (remainingSeconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      remainingSeconds = 0;
      completeHandler();
    }
  }, 1000);
  tickHandler({ remainingSeconds, totalSeconds });
}

export function pause() {
  clearInterval(timerId);
  timerId = null;
}

export function reset() {
  clearInterval(timerId);
  timerId = null;
  remainingSeconds = 0;
  totalSeconds = 0;
  tickHandler({ remainingSeconds, totalSeconds });
}

export function isRunning() {
  return timerId !== null;
}

export function getRemainingSeconds() {
  return remainingSeconds;
}

export function setRemaining(seconds) {
  remainingSeconds = Math.max(0, seconds);
}
