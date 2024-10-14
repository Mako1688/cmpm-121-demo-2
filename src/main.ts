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
  titleElement.className = "title";
  return titleElement;
};

// Create a canvas element
const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.backgroundColor = "white";
  return canvas;
};

// Create a button element
const createButton = (text: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.textContent = text;
  return button;
};

// Append the title and canvas to the app element
app.appendChild(createTitleElement(APP_NAME));
const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
app.appendChild(canvas);

// Create and append buttons below the canvas
const buttonContainer = document.createElement("div");
buttonContainer.className = "button-container";
const clearButton = createButton("Clear");
const undoButton = createButton("Undo");
const redoButton = createButton("Redo");
buttonContainer.appendChild(clearButton);
buttonContainer.appendChild(undoButton);
buttonContainer.appendChild(redoButton);
app.appendChild(buttonContainer);

// MarkerLine class
class MarkerLine {
  private points: Array<{ x: number; y: number }>;

  constructor(initialX: number, initialY: number) {
    this.points = [{ x: initialX, y: initialY }];
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    this.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
  }
}

// Drawing logic
const ctx = canvas.getContext("2d")!;
let drawing: Array<MarkerLine> = [];
let currentLine: MarkerLine | null = null;
let redoStack: Array<MarkerLine> = [];
const cursor = { active: false, x: 0, y: 0 };

// Mouse down event logic
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  currentLine = new MarkerLine(cursor.x, cursor.y);
  drawing.push(currentLine);
  redoStack = []; // Clear redo stack on new drawing action
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Mouse move event logic (for when mouse is held down)
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (cursor.active && currentLine) {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
    currentLine.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Mouse up event logic
canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
});

// Clear button event logic
clearButton.addEventListener("click", () => {
  drawing = [];
  redoStack = [];
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Undo button event logic
undoButton.addEventListener("click", () => {
  if (drawing.length > 0) {
    const lastLine = drawing.pop();
    redoStack.push(lastLine!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Redo button event logic
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const lastLine = redoStack.pop();
    drawing.push(lastLine!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Drawing changed event logic
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawing.forEach(line => line.display(ctx));
});