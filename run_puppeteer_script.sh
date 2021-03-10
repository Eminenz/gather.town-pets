docker container run -it --rm \
	-p 9222:9222 \
	-v $(pwd)/src:/usr/src/app/src \
	-v $(pwd)/data:/usr/src/app/data \
	--cap-add=SYS_ADMIN zenika/alpine-chrome:with-puppeteer \
	node src/pet.js
