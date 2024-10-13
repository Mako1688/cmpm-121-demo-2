import "./style.css";

//create name, and canvas dimension constants
const APP_NAME = "Mako Paint 🎨";
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;

//get the app element and set the title of the document
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

//create a title element
function createTitleElement(text: string): HTMLHeadingElement {
  const titleElement = document.createElement("h1");
  titleElement.textContent = text;
  return titleElement;
}

//create a canvas element
function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

//Create clear button
function createClearButton(): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = "Clear";
  return button;
}

//append the title and canvas elements to the app element
app.appendChild(createTitleElement(APP_NAME));
const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
app.appendChild(canvas);
const clearButton = createClearButton();
app.appendChild(clearButton);

//Drawing Logic
const ctx = canvas.getContext("2d")!;
const cursor = { active: false, x: 0, y: 0 };

//add mouse down Event logic
canvas.addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

//add mouse move event logic (for when mouse is held down)
canvas.addEventListener("mousemove", (event) => {
  if (cursor.active) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
  }
});

//add mouse up event logic
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

//add clear button event logic 
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
});
