const puppeteer = require("puppeteer");
var readline = require('readline');

var config = require("../data/config.js");

const useragent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36"
const maxavatarclicks = 50;

console.log("Starting browser");

readline.emitKeypressEvents(process.stdin);
var rl = readline.createInterface(process.stdin, process.stdout);
process.stdin.setRawMode( true );
rl.setPrompt('gather.town-pets> ');
rl.on('close',function(){
    process.exit(0);
});


// Prompt mode
const prompt_listener = function(line) {
  console.log("Got line: ", line);
  var split = line.split(" ");
  if (split[0] === "control") {
    rl.off('line', prompt_listener);
    control_mode();
  } else if (split[0] === "exit") {
    rl.close();
  } else {
    rl.prompt();
  }
};

function prompt_mode() {
  console.log("Entering prompt mode")
  rl.prompt();
  rl.on('line', prompt_listener);
}


async function findElementByText(page, selector, text) {
  const elements = await page.$$(selector);
  for (var i = 0; i < elements.length; i++) {
    const textcontent = await elements[i].evaluate(el => el.textContent)
    if (textcontent == text) {
      return elements[i];
    }
  }
  return null;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * Math.floor(max - min)) + min;
}

(async () => {
  const browser = await puppeteer.launch({
    bindAddress: "0.0.0.0",
    args: [
      "--headless",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--remote-debugging-port=9222",
      "--remote-debugging-address=0.0.0.0",
      "--incognito",
      "--user-agent=" + useragent,
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
      "--use-file-for-fake-video-capture=" + config.videofile,
      "--use-file-for-fake-audio-capture=" + config.audiofile
    ]
  });
  const page = await browser.newPage();
  // prompt_mode();

  // connect to gather
  await page.goto(config.gatherserver,
    {"waitUntil": "networkidle0"}
  );
  // await page.screenshot({path: 'src/screenshot.png'});

  console.log("Opened Gather")
  const passwordinput = await page.$(".ot-password-input");
  if (passwordinput != null) {
    await passwordinput.type(config.gatherpw);
    const passwordsubmit = await page.$(".ot-password-submit-button");
    await passwordsubmit.click();
    console.log("Entered password, waiting for name input")
  }

  // enter name
  const nameinput = await page.waitForSelector("input.css-kvfr1h");
  await nameinput.type(config.npcname);

  // TODO: this is probably brittle AF
  const rightarrow = await page.$("span + button");
  for (var i = 0; i < maxavatarclicks; i++) {
    await rightarrow.click();
    await page.waitFor(50);
    const avatarimg = await page.$("img[src^='" + config.npcavatar + "']");
    if (avatarimg != null) {
      console.log("Found desired avatar");
      break;
    }
  }
  // const nextbutton = await page.$("button[kind='primary']");
  const nextbutton = await findElementByText(page, "button", "Next");
  await nextbutton.click();
  console.log("Entered name and avatar, waiting for cam setup");

  // const joinbutton = await page.$("button[kind='primary']");
  const joinbutton = await findElementByText(page, "button", "Join the Gathering");
  await joinbutton.click();
  console.log("Finished setup, waiting for tutorial");
  
  const skipbutton = await findElementByText(page, "button", "Skip Tutorial");
  await skipbutton.click();
  console.log("Skipped tutorial, now in room");

  console.log("Entering control mode");

  // Do i stay in random mode?
  var togglerandom = true;

  function random_mode() {
    var sleepdir = getRandomInt(300,1200);
    setTimeout(function() {
      var dir = getRandomInt(0,4);
      var dirs = ["w","a","s","d"];
      page.keyboard.press(dirs[dir]);

      if (togglerandom) {
        random_mode();
      }
    }, sleepdir);
  }


  // Control mode
  const control_listener = function( str, key ){
    // write the key to stdout all normal like
    // console.log( "Got key: (" + str + "," + JSON.stringify(key) + ")" );
    // ctrl-c ( end of text )
    if ( str === 'q' ) {
      console.log("Exiting");
      process.stdin.off( 'keypress', control_listener );
      rl.close();
    } else if (str === 'r') {
      togglerandom = !togglerandom;
      console.log("Switching random mode to ", togglerandom);
      if (togglerandom) {
        random_mode();
      }
    } else {
      console.log("Sending ", str, " to browser")
      if (str !== undefined) {
        page.keyboard.press(str);
      }
    }
  };

  function control_mode() {
    console.log("Entering direct control mode")
    process.stdin.on( 'keypress', control_listener );
  }

  control_mode();

  console.log("Entering random control mode")
  random_mode();

})();
