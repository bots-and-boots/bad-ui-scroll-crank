//sorry if my a few parts of my code seems rushed lol
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;

const canvas = document.getElementById("crank");
const ctx = canvas.getContext('2d');

const tosElem = document.getElementById("tos");

const FPS = 30;
let timeStart = 0;
let frameCounter = 0;

//global mouse position and state
let mousePosX = 0;
let mousePosY = 0;
let mouseDown = false;
let mouseRad = 0;
let mouseDeg = 0;

//image
let crankImg = new Image();
crankImg.src = "crank.png";

//crank
//radius of the center of the crank where mouseDown is set to false (:
const DEAD_RADIUS = 10;
//total angle per pixel of scroll
const ANGLE_PER_PIXEL = 45;
//for rotating the image
let rotateRad = 0;
let rotateDeg = 0;
let valueDeg = 0;

function uiOnLoad()
{
	canvas.width = CANVAS_WIDTH;
	canvas.height = CANVAS_HEIGHT;
	tosElem.scrollTop = 0;
}

//event functions
function canvasMouseMove(e)
{
	let rect = canvas.getBoundingClientRect();
	mousePosX = e.clientX - rect.left;
	mousePosY = e.clientY - rect.top;
	calculateRotation();
}

function canvasMouseDown(e)
{
	let rect = canvas.getBoundingClientRect();
	mousePosX = e.clientX - rect.left;
	mousePosY = e.clientY - rect.top;
	//check if mouse is close enough 
	mouseDown = !mouseDown;
}

function canvasMouseUp(e)
{
	mouseDown = false;
}

//user "releases" crank when cursor goes outside canvas
function canvasMouseOut(e)
{
	mouseDown = false;
}

//gets called on mousemove event
function calculateRotation()
{
	let adj = mousePosX - canvas.width / 2;
	//switch center and offset so top is positive and below is negative
	let opp = canvas.height / 2 - mousePosY;
	//solve hypotenuse
	let hyp = Math.sqrt(Math.pow(adj, 2) + Math.pow(opp, 2));
	//use inverse of cos then adjust to follow mouse
	if(opp > 0)
	{
		mouseRad = -Math.acos(adj / hyp) + Math.PI / 2;
	}
	//"flip" rotation if opp is below the center
	else
	{
		mouseRad = Math.acos(adj / hyp) + Math.PI / 2;
	}
	//if negative degree, do PI * 2 - angle (or just add PI * 2)
	if(mouseRad < 0)
	{
		mouseRad += Math.PI * 2;
	}
	mouseDeg = mouseRad * 180 / Math.PI;
	if(mouseDown)
	{
		//compare last angle with current angle (mouse)
		if(Math.round(mouseDeg - rotateDeg))
		{
			let diff;
			//normal difference
			diff = Math.round(mouseDeg - rotateDeg);
			//once crank completes one full rotation
			//minimize the difference between mouseDeg and rotateDeg
			//when one is before the 360 angle (<360)
			//and the other is after the 360 angle (>0)
			if(diff > 180)
			{
				diff = Math.round(mouseDeg - 360 - rotateDeg);
			}
			else if(diff < -180)
			{
				diff = Math.round(mouseDeg - rotateDeg + 360);
			}
			valueDeg += diff;
			let posY = Math.floor(valueDeg / ANGLE_PER_PIXEL);
			if(posY < 0) valueDeg = 0;
			//cap at max
			if(posY > tosElem.scrollHeight - tosElem.clientHeight)
				valueDeg = (tosElem.scrollHeight - tosElem.clientHeight) * ANGLE_PER_PIXEL;
			tosElem.scrollTop = Math.round(posY);
		}
		//if mouse is too close to center
		//do not rotate the crank and make user "release" the crank
		if(hyp < DEAD_RADIUS)
		{
			mouseDown = false;
		}
		else
		{
			rotateRad = mouseRad;
			rotateDeg = mouseDeg;
		}	
	}
}

function draw()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//rotate image using angle
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(rotateRad);
	ctx.drawImage(crankImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
	ctx.rotate(-rotateRad);
	ctx.translate(-canvas.width / 2, -canvas.height / 2);
}

function mainLoop(timestamp)
{
	//run drawing routine at target fps
	if(timeStart === undefined)
		start = timestamp;
	const elapsed = timestamp - timeStart;

	if(elapsed > 1000 / FPS * frameCounter)
	{
		frameCounter++;
		draw();
	}
	window.requestAnimationFrame(mainLoop);
}

canvas.addEventListener("mousemove", canvasMouseMove);
canvas.addEventListener("mousedown", canvasMouseDown);
canvas.addEventListener("mouseup", canvasMouseUp);
canvas.addEventListener("mouseout", canvasMouseOut);
window.requestAnimationFrame(mainLoop);
window.onload = uiOnLoad