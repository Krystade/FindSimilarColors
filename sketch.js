let rejectedColors = []
// Used to prevent deltaE being printed more than once
let found = false

function setup() {
	createCanvas(windowWidth, windowHeight)
	background(0)
	// A random color
	color1 = rgb2lab([random(0, 255), random(0, 255), random(0, 255)])
	// color2 will be changed to a color that is similar to color1 if it isn't close enough to start with
	color2 = rgb2lab([random(0, 255), random(0, 255), random(0, 255)])
	// Average of color1 and color2
	color3 = average(color1, color2)
	// How close the two lab values have to be before displaying them
	threshold = 1
}

function draw() {
	tries = 0
	while(true){
		if(deltaE(color1, color2) < threshold){
			if(!found){
				break
			}else{
				print(deltaE(color1, color2))
				print(lab2rgb(color1), lab2rgb(color2))
				found = true
				break
			}
		}else{
			tries += 1
			rejectedColors.push([lab2rgb(color2), deltaE(color1, color2)])
			color2 = rgb2lab([random(0, 255), random(0, 255), random(0, 255)])
			if(tries > 3000){
				tries = 0
				print("took more than 3000 tries , changing color1")
				color1 = rgb2lab([random(0, 255), random(0, 255), random(0, 255)])
			}
		}
	}
	if(tries > 0){
		print("It took " + tries + " tries before finding a matching color")
	}
	color3 = average(color1, color2)
	
	fill(lab2rgb(color1))
	rect(0, 0, windowWidth, windowHeight)
	
	fill(lab2rgb(color2))
	rect(windowWidth/2, 0, windowWidth, windowHeight)
	
	fill(color3)
	rect(windowWidth/2 - 40, windowHeight/2 - 40, 80, 80)
	
	push()
	noStroke()
	for(var i = rejectedColors.length; i >= 0; i--){
		if(rejectedColors[i]){
			fill(rejectedColors[i][0])
			rect(i * windowWidth/(2*rejectedColors.length) + windowWidth/2 + 2, 2, width/(2*rejectedColors.length), 30)	
		}
	}
	pop()
}

function mouseClicked() {
	found = false
	rejectedColors = []
	color1 = rgb2lab([random(0, 255), random(0, 255), random(0,255)])
	color2 = rgb2lab([random(0, 255), random(0, 255), random(0,255)])
	color3 = average(color1, color2)
}

// the following functions are based off of the pseudocode
// found on www.easyrgb.com
// I took this code from https://github.com/antimatter15/rgb-lab/blob/master/color.js

function average(lab1, lab2){
	c1 = lab2rgb(lab1)
	c2 = lab2rgb(lab2)
	avgRGB = []
	for(var i = 0; i < 3; i++){
		avgRGB.push(c1[i]/2 + c2[i]/2)
	}
	return(avgRGB)
}



function rgb2lab(rgb){
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

function lab2rgb(lab){
  var y = (lab[0] + 16) / 116,
      x = lab[1] / 500 + y,
      z = y - lab[2] / 200,
      r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [Math.max(0, Math.min(1, r)) * 255, 
          Math.max(0, Math.min(1, g)) * 255, 
          Math.max(0, Math.min(1, b)) * 255]
}

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs

function deltaE(labA, labB){
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / (1.0);
  var deltaCkcsc = deltaC / (sc);
  var deltaHkhsh = deltaH / (sh);
  var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}
