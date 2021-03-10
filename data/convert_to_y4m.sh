ffmpeg -i $1 -pix_fmt yuv420p $1.y4m
sed -i '0,/C420mpeg2/s//C420/' *.y4m
