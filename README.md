# gather.town-pets

This is a docker container that runs a headless chrome to personify a dog (or any other NPC you want)
on `gather.town` spaces.

## Usage

Copy config.js.template to config.js and change the values to something you like.
To convert from .gif (or any other format readable by ffmpeg) to .y4m you can use convert_to_y4m.sh.

To start the container call `./run_puppeteer_script.sh`.
It will then login to your `gather.town` space and start moving around.

Any letter keystrokes on the terminal are sent to the browser and can control the NPC.
To toggle the random movement on or off, press `r`.
To quit press `q`.
