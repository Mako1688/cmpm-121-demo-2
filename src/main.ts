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

// Append title to the app element
app.appendChild(createTitleElement(APP_NAME));

// Create a container for the canvas and tool buttons
const canvasContainer = document.createElement("div");
canvasContainer.className = "canvas-container";
app.appendChild(canvasContainer);

// Create and append tool buttons to the side of the canvas
const toolContainer = document.createElement("div");
toolContainer.className = "tool-container";
const thinButton = createButton("Thin");
const thickButton = createButton("Thick");
toolContainer.appendChild(thinButton);
toolContainer.appendChild(thickButton);
canvasContainer.appendChild(toolContainer);

// Append the canvas to the canvas container
const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
canvasContainer.appendChild(canvas);

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

// MarkerLine class to handle drawing lines with different thickness
class MarkerLine {
  private points: Array<{ x: number; y: number }>;
  private thickness: number;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points = [{ x: initialX, y: initialY }];
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.lineWidth = this.thickness;
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

// Drawing state and logic
const ctx = canvas.getContext("2d")!;
let drawing: Array<MarkerLine> = [];
let currentLine: MarkerLine | null = null;
let redoStack: Array<MarkerLine> = [];
const cursor = { active: false, x: 0, y: 0 };
let currentThickness = 1; // Default thickness

// Event listeners for drawing actions
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  currentLine = new MarkerLine(cursor.x, cursor.y, currentThickness);
  drawing.push(currentLine);
  redoStack = []; // Clear redo stack on new drawing action
  canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (cursor.active && currentLine) {
    cursor.x = event.offsetX;
    cursor.y = event.offsetY;
    currentLine.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
});

// Event listeners for button actions
clearButton.addEventListener("click", () => {
  drawing = [];
  redoStack = [];
  canvas.dispatchEvent(new Event("drawing-changed"));
});

undoButton.addEventListener("click", () => {
  if (drawing.length > 0) {
    const lastLine = drawing.pop();
    redoStack.push(lastLine!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const lastLine = redoStack.pop();
    drawing.push(lastLine!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Event listeners for tool selection
thinButton.addEventListener("click", () => {
  currentThickness = 1;
  thinButton.classList.add("selectedTool");
  thickButton.classList.remove("selectedTool");
});

thickButton.addEventListener("click", () => {
  currentThickness = 5;
  thickButton.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
});

// Redraw the canvas whenever the drawing changes
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawing.forEach(line => line.display(ctx));
});