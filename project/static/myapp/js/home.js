
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
  console.log('waiting for element')
  await waitForElement('video', 30).catch((error) => {
    console.error(error);
    alert(error.message)
    window.location.reload();
  });

  console.log('element loaded, clicking button')
  document.querySelector().click()
  
}

alert("need interaction");

document.querySelector('#vid-container').innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=_knmV3R79qiaz-pK" muted="1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
main();