const gameArea = document.getElementById('game');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const spaceIndicator = document.getElementById('space-indicator');
let score = 0;
let isPaused = false;
let spacePressed = false;
const notes = [];
const trackPositions = [50, 125, 200, 275, 350]; // Five tracks
let keys = ['z', 'x', 'c', 'v', 'b']; // Corresponding keys for the tracks
let keyMap = { 'z': 50, 'x': 125, 'c': 200, 'v': 275, 'b': 350 };
let invertedKeyMap = {50: 'z', 125: 'x', 200: 'c', 275: 'v', 350: 'b' };
let indicators = {
  'z': document.getElementById('z-indicator'),
  'x': document.getElementById('x-indicator'),
  'c': document.getElementById('c-indicator'),
  'v': document.getElementById('v-indicator'),
  'b': document.getElementById('b-indicator')
};
/* controller a:0, b:1, x:2, y:3, lb:4, rb:5
  a: z, b:x, x:c, y:v, rb: b, lb: strum
  need: e.key and e.code
  */
let controllerToKeyboard = {
  0:{
      'key': 'z',
      'code': 'notSpace'
  },
  1:{
    'key': 'x',
    'code': 'notSpace'
  },
  2:{
    'key': 'c',
    'code': 'notSpace'
  },
  3:{
    'key': 'v',
    'code': 'notSpace'
  },
  4:{
    'key': 'space',
    'code': 'Space'
  },
  5:{
    'key': 'b',
    'code': 'notSpace'
  },
}
let difficulty = 1; // 1 2 or 3 for now
let isStrum = (e) => e.code === 'Space';

// set high score from local storage
highScoreElement.textContent = `Personal Best: ${parseInt(localStorage.getItem('highscore')) || 0}`;

// set all indicators 'style-left' to their respective positions
Object.keys(indicators).forEach(key => {
  indicators[key].style.left = `${keyMap[key]}px`;
});

let noteMade = false;
const makeOnlyOne = false;
function createNote(trackNum) { // trackNum can be 0 through 4
  // console.log("created note", trackNum);
  if (makeOnlyOne && noteMade) return;
  if (isPaused) return;
  const note = document.createElement('div');
  note.className = 'note';

  let track = trackPositions[trackNum];
  // if(!track){
  //   track = trackPositions[Math.floor(Math.random() * trackPositions.length)];
  // }
  // console.log(track);
  if(!track) return;
  note.dataset.track = track; // Store track info in dataset
  note.style.left = `${track}px`;
  gameArea.appendChild(note);
  notes.push(note);
  noteMade = true;
}
function updateScore(change){
  score += change
  scoreElement.textContent = `Score: ${parseInt(score)}`;
  // store score in local storage
  if (score > parseInt(localStorage.getItem('highscore')))  {
    // console.log('New high score!', score);
    localStorage.setItem('highscore', score);
  }
}

function moveNotes() {
  if (isPaused) return;
  notes.forEach(note => {
    const top = parseFloat(note.style.top) || 0;
    note.style.top = `${top + 5}px`;
    // Remove notes that fall below the bottom bar
    if (top > gameArea.clientHeight - 25) {
      updateScore(-5)
      gameArea.removeChild(note);
      notes.shift();
    }
  });
}

const lowerBound = 1100;
const higherBound = 1150;
const average = parseInt((lowerBound + higherBound) / 2);

function checkHit(e) {
  // console.log(e.code);
  if (isStrum(e)) {
    // console.log('Space pressed');

    const activeKeys = Object.keys(indicators).filter(key => indicators[key].classList.contains('active'));
    const notesInHitRange = notes.filter(note => {
      const noteRect = note.getBoundingClientRect();
      // console.dir(noteRect);
      return noteRect.bottom > lowerBound && noteRect.bottom < higherBound;
    });

    const lettersForNotesInRange = notesInHitRange.map(note => invertedKeyMap[note.dataset.track]);

    const activeKeysEqualToLettersInRange = activeKeys.every(key => lettersForNotesInRange.includes(key));

    // console.log('activeKeys', activeKeys);
    // console.log('notesInHitRange', notesInHitRange);
    // console.log('lettersForNotesInRange', lettersForNotesInRange);
    // console.log('activeKeysEqualToLettersInRange', activeKeysEqualToLettersInRange);


    if(activeKeysEqualToLettersInRange){
      notesInHitRange.forEach(note => {
        // score is how close the bottom was to 875
        const notePoints = (Math.abs(note.getBoundingClientRect().bottom - average) * -1) + 30;
        updateScore(notePoints)
        gameArea.removeChild(note);
        notes.splice(notes.indexOf(note), 1);
      });
    } else {
      updateScore(-3)
    }
  }
}

function handleKeyDown(e) {
  const key = e.key.toLowerCase();
  if (keys.includes(key)) {
    indicators[key].classList.add('active');
  }
  if (isStrum(e)) {
    spacePressed = true;
    spaceIndicator.classList.add('active');
  }
}

function handleKeyUp(e) {
  // console.dir(e);
  const key = e.key.toLowerCase();
  if (keys.includes(key)) {
    indicators[key].classList.remove('active');
  }
  if (isStrum(e)) {
    spacePressed = false;
    spaceIndicator.classList.remove('active');
  }
}

let timePauseStart = undefined;
function pauseGame() {
  timePauseStart = new Date().getTime();
  isPaused = true;
  // player.pauseVideo();
}

function resumeGame() {
  timePauseEnd = new Date().getTime();
  startMillis += (timePauseEnd-timePauseStart);
  timePauseStart = undefined;
  isPaused = false;
  // player.playVideo();
}

// window.addEventListener('blur', pauseGame);
// window.addEventListener('focus', resumeGame);
window.addEventListener('keydown', checkHit);
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

let startMillis = new Date().getTime();
let noteIndex = 0;
// get notesData from rythm_code.txt

let notesData = [];
function progressTrack() {
  // console.log("track progressed");
  if(isPaused && !initializingTrack) return;

  const currentMillis = new Date().getTime();
  const timeElapsed = (currentMillis - startMillis) / 1000;
  const notesPassed = [];
  let sumOfNotesTrack = 0;
  for (let i = noteIndex; i < notesData.length; i++) {
    const noteTimeSeconds = notesData[i].split(';')[1];
    const noteTrack = notesData[i].split(';')[0];
    if (timeElapsed >= noteTimeSeconds) {
      notesPassed.push(notesData[i]);
      sumOfNotesTrack += parseInt(noteTrack);
      noteIndex++;
    } else {
      break;
    }
  }
  const averageTrack = Math.round(sumOfNotesTrack / notesPassed.length);

  createNote(averageTrack);

  // console.log('Progress track', timeElapsed);
  // console.log('Notes passed', notesPassed);
  // console.log('Average track', averageTrack);
}
let initializingTrack = true;
async function startGame() {
  // console.log("starting game", videoId);
  document.getElementById('loader').style.display = 'flex';

  const response = await fetch(`http://localhost:8000/getRythmCode?v=${videoId}`).catch(error => alert('Error:'+ error));
  notesData = await response.json();
  
  // console.log("progressing track");
  const moveNotesEveryMillis = 40 - (7 * difficulty);
  const progressTrackMillis = 800 - (100 * difficulty);
  setInterval(() => progressTrack(), progressTrackMillis);
  setInterval(moveNotes, moveNotesEveryMillis);

  resumeGame()

  setTimeout(() => {
    // console.log("playing video");
    document.getElementById('loader').style.display = 'none';
    player.playVideo()
    initializingTrack = false;
  }, (4000/difficulty))
}

document.getElementById('yt-iframe-container')

let videoId = "LHd447EafFY"; // default video ID
function loadIframe(vidId) {
  videoId = vidId;
  // console.log('loadIframe', videoId);

  // yt iframe api docs: https://developers.google.com/youtube/iframe_api_reference#playVideo
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onPlayerReady(event) {
  // could do something here?
}

let videoStarted = false;
function onPlayerStateChange(event) {
  if(videoStarted){
    if (event.data !== YT.PlayerState.PLAYING) {
      pauseGame();
    } else if(isPaused) {
      resumeGame();
    }
  }
  if(event.data == YT.PlayerState.PLAYING && !videoStarted){
    videoStarted = true;
    player.pauseVideo()
    startGame();
  }
}
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: videoId, //temp
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

window.addEventListener("gamepadconnected", onGamepadConnected);
window.addEventListener("gamepaddisconnected", onGamepadDisconnected);

function onGamepadConnected(event) {
    // console.log("Gamepad connected:", event.gamepad);
    requestAnimationFrame(updateGamepadStatus);
}
function onGamepadDisconnected(event) {
    // console.log("Gamepad disconnected:", event.gamepad);
}
const keysDown = {};
function updateGamepadStatus() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

  for (const gamepad of gamepads) {
    if (!gamepad) continue;
    gamepad.buttons.forEach((button, index) => {
      if(!keysDown[index]) keysDown[index] = false;

      if (button.pressed) {
        // console.log(`Button ${index} pressed`);
      }

      // if button is pressed and wasn't pressed last frame
      if(button.pressed &&!keysDown[index]) {
        let fakeEvent = controllerToKeyboard[index];
        checkHit(fakeEvent)
        handleKeyDown(fakeEvent);
      }

      // if button is released and was pressed last frame
      if(!button.pressed && keysDown[index]) {
        let fakeEvent = controllerToKeyboard[index];
        handleKeyUp(fakeEvent);
      }

      /* controller a:0, b:1, x:2, y:3, lb:4, rb:5
      a: z, b:x, x:c, y:v, rb: b, lb: strum
      need: e.key and e.code
      */

      keysDown[index] = button.pressed;

    });
  }

  requestAnimationFrame(updateGamepadStatus);
}


document.querySelector('#play-btn').addEventListener('click', function() {
  const youtubeURL = document.querySelector('#youtube-input').value;
  const youtubeVideoID = youtubeURL.split('v=')[1];
  loadIframe(youtubeVideoID);
  document.querySelector('#yt-input-container').hidden = true;
  document.querySelector('#diff-container').hidden = true;
});

document.getElementById('easy-btn').addEventListener('click', () => difficulty = 1);
document.getElementById('medium-btn').addEventListener('click', () => difficulty = 2);
document.getElementById('hard-btn').addEventListener('click', () => difficulty = 3);
document.getElementById('controller-checkbox').addEventListener('click', (e) => {
  if(e.target.checked) {
    document.getElementById('z-indicator').innerText = "A";
    document.getElementById('x-indicator').innerText = "B";
    document.getElementById('c-indicator').innerText = "X";
    document.getElementById('v-indicator').innerText = "Y";
    document.getElementById('b-indicator').innerText = "RB";
  } else {
    document.getElementById('z-indicator').innerText = "Z";
    document.getElementById('x-indicator').innerText = "X";
    document.getElementById('c-indicator').innerText = "C";
    document.getElementById('v-indicator').innerText = "V";
    document.getElementById('b-indicator').innerText = "B";
  }
});
