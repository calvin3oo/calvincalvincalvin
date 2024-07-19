
var youtubeVideoID = 'M7lc1UVf-VE';

// see docs: https://developers.google.com/youtube/iframe_api_reference#playVideo
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
// This function gets called globally by the youtube iframe api code
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: youtubeVideoID,
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onAutoplayBlocked': onAutoplayBlocked,
    }
  });
}

function onAutoplayBlocked(event) {
  console.log('autoplay blocked')
  event.target.playVideo();
  setTimeout(()=>event.target.playVideo(), 1000);
}

function onPlayerReady(event) {
  // console.dir(event);
  // event.target.mute();
  // event.target.playVideo();
  // setTimeout(() => event.target.unMute(), 1000);
  // console.log('video played')
}
function onAutoplayBlocked() {
  console.log('autoplay blocked')
}

var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    done = true;
  }
}


function waitForElement(selector, callback, timeout = 10000) {
  const startTime = Date.now();

  function checkElement() {
      const element = document.querySelector(selector);
      console.log('checking element', element);
      
      if (element) {
          callback(element);
      } else if (Date.now() - startTime >= timeout) {
          console.error(`Timeout exceeded (${timeout}ms) waiting for element with selector ${selector}`);
      } else {
          setTimeout(checkElement, 250); // Check again after 250ms
      }
  }

  checkElement();
}


async function main(){
  //does nothing for now
}

main();
