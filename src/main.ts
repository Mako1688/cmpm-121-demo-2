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

// ToolPreview class to handle drawing the tool preview
class ToolPreview {
  private x: number;
  private y: number;
  private thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Drawing state and logic
const ctx = canvas.getContext("2d")!;
let drawing: Array<MarkerLine> = [];
let currentLine: MarkerLine | null = null;
let redoStack: Array<MarkerLine> = [];
let toolPreview: ToolPreview | null = null;
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
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (cursor.active && currentLine) {
    currentLine.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    if (!toolPreview) {
      toolPreview = new ToolPreview(cursor.x, cursor.y, currentThickness);
    } else {
      toolPreview.updatePosition(cursor.x, cursor.y);
    }
    canvas.dispatchEvent(new Event("tool-moved"));
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
const selectTool = (
  thickness: number,
  selectedButton: HTMLButtonElement,
  otherButton: HTMLButtonElement
) => {
  currentThickness = thickness;
  selectedButton.classList.add("selectedTool");
  otherButton.classList.remove("selectedTool");
  if (toolPreview) {
    toolPreview = new ToolPreview(cursor.x, cursor.y, currentThickness);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
};

thinButton.addEventListener("click", () =>
  selectTool(1, thinButton, thickButton)
);
thickButton.addEventListener("click", () =>
  selectTool(5, thickButton, thinButton)
);

// Redraw the canvas whenever the drawing changes
const redrawCanvas = () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawing.forEach((line) => line.display(ctx));
  if (!cursor.active && toolPreview) {
    toolPreview.draw(ctx);
  }
};

canvas.addEventListener("drawing-changed", redrawCanvas);
canvas.addEventListener("tool-moved", redrawCanvas);
