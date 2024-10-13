import "./style.css";

// Constants for app name and canvas dimensions
const APP_NAME = "Mako Paint 🎨";
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;

// Get the app element and set the title of the document
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

// Create a title element
const createTitleElement = (text: string): HTMLHeadingElement => {
  const titleElement = document.createElement("h1");
  titleElement.textContent = text;
  return titleElement;
};

// Create a canvas element
const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// Create a clear button
const createClearButton = (): HTMLButtonElement => {
  const button = document.createElement("button");
  button.textContent = "Clear";
  return button;
};

// Append the title, canvas, and clear button elements to the app element
app.appendChild(createTitleElement(APP_NAME));
const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
app.appendChild(canvas);
const clearButton = createClearButton();
app.appendChild(clearButton);

// Drawing logic
const ctx = canvas.getContext("2d")!;
const cursor = { active: false, x: 0, y: 0 };

canvas.addEventListener("mousedown", (event: MouseEvent) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

// Add mouse move event logic (for when mouse is held down)
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (cursor.active) {
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
  }
});

// Add mouse up event logic
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

// Add clear button event logic 
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
});
