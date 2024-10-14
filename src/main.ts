import "./style.css";

// Constants for app name and canvas dimensions
const APP_NAME = "Mako Paint 🎨";
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;

// Get the app element and set the title of the document
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

// Utility functions to create elements
const createTitleElement = (text: string): HTMLHeadingElement => {
  const titleElement = document.createElement("h1");
  titleElement.textContent = text;
  titleElement.className = "title";
  return titleElement;
};

const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.backgroundColor = "white";
  return canvas;
};

const createButton = (text: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.textContent = text;
  return button;
};

const createContainer = (className: string): HTMLDivElement => {
  const container = document.createElement("div");
  container.className = className;
  return container;
};

const appendButtons = (container: HTMLDivElement, buttons: HTMLButtonElement[]) => {
  buttons.forEach(button => container.appendChild(button));
};

// Append title to the app element
app.appendChild(createTitleElement(APP_NAME));

// Create and append the canvas container
const canvasContainer = createContainer("canvas-container");
app.appendChild(canvasContainer);

// Append the canvas to the canvas container
const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
canvasContainer.appendChild(canvas);

// Create and append tool buttons to the side of the canvas
const toolContainer = createContainer("tool-container");
const clearButton = createButton("Clear");
const undoButton = createButton("Undo");
const redoButton = createButton("Redo");
appendButtons(toolContainer, [clearButton, undoButton, redoButton]);
canvasContainer.appendChild(toolContainer);

// Create and append buttons below the canvas
const buttonContainer = createContainer("button-container");
const thinButton = createButton("Thin");
const thickButton = createButton("Thick");
appendButtons(buttonContainer, [thinButton, thickButton]);
app.appendChild(buttonContainer);

// Create and append sticker buttons below the undo container
const stickerContainer = createContainer("sticker-container");
const skullButton = createButton("💀");
const heartButton = createButton("❤️");
const fireButton = createButton("🔥");
appendButtons(stickerContainer, [skullButton, heartButton, fireButton]);
app.appendChild(stickerContainer);

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
  private thickness: number | null;
  private emoji: string | null;

  constructor(x: number, y: number, thickness: number | null = null, emoji: string | null = null) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
    this.emoji = emoji;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  updateTool(thickness: number | null, emoji: string | null) {
    this.thickness = thickness;
    this.emoji = emoji;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.emoji) {
      ctx.font = "24px serif";
      ctx.fillText(this.emoji, this.x, this.y);
    } else if (this.thickness) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// Sticker class to handle drawing stickers
class Sticker {
  private x: number;
  private y: number;
  private emoji: string;

  constructor(x: number, y: number, emoji: string) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px serif";
    ctx.fillText(this.emoji, this.x, this.y);
  }
}

// Drawing state and logic
const ctx = canvas.getContext("2d")!;
let drawing: Array<MarkerLine | Sticker> = [];
let currentLine: MarkerLine | null = null;
let currentSticker: Sticker | null = null;
let redoStack: Array<MarkerLine | Sticker> = [];
let toolPreview: ToolPreview | null = null;
const cursor = { active: false, x: 0, y: 0 };
let currentThickness = 1; // Default thickness
let currentEmoji: string | null = null; // Current emoji for stickers

// Event listeners for drawing actions
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (currentEmoji) {
    currentSticker = new Sticker(cursor.x, cursor.y, currentEmoji);
    drawing.push(currentSticker);
    redoStack = []; // Clear redo stack on new drawing action
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    currentLine = new MarkerLine(cursor.x, cursor.y, currentThickness);
    drawing.push(currentLine);
    redoStack = []; // Clear redo stack on new drawing action
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

canvas.addEventListener("mousemove", (event: MouseEvent) => {
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
  if (cursor.active && currentLine) {
    currentLine.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else if (cursor.active && currentSticker) {
    currentSticker.drag(cursor.x, cursor.y);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    if (!toolPreview) {
      toolPreview = new ToolPreview(cursor.x, cursor.y, currentThickness, currentEmoji);
    } else {
      toolPreview.updatePosition(cursor.x, cursor.y);
    }
    canvas.dispatchEvent(new Event("tool-moved"));
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
  currentLine = null;
  currentSticker = null;
});

// Event listeners for button actions
clearButton.addEventListener("click", () => {
  drawing = [];
  redoStack = [];
  canvas.dispatchEvent(new Event("drawing-changed"));
});

undoButton.addEventListener("click", () => {
  if (drawing.length > 0) {
    const lastItem = drawing.pop();
    redoStack.push(lastItem!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const lastItem = redoStack.pop();
    drawing.push(lastItem!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Event listeners for tool selection
const selectTool = (
  thickness: number,
  selectedButton: HTMLButtonElement,
  otherButton: HTMLButtonElement,
  stickerButtons: HTMLButtonElement[]
) => {
  currentThickness = thickness;
  currentEmoji = null; // Reset current emoji
  selectedButton.classList.add("selectedTool");
  otherButton.classList.remove("selectedTool");
  stickerButtons.forEach(button => button.classList.remove("selectedTool"));
  if (toolPreview) {
    toolPreview.updateTool(currentThickness, null);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
};

thinButton.addEventListener("click", () =>
  selectTool(1, thinButton, thickButton, [skullButton, heartButton, fireButton])
);
thickButton.addEventListener("click", () =>
  selectTool(5, thickButton, thinButton, [skullButton, heartButton, fireButton])
);

// Event listeners for sticker selection
const selectSticker = (emoji: string, selectedButton: HTMLButtonElement, stickerButtons: HTMLButtonElement[]) => {
  currentEmoji = emoji;
  currentThickness = 0; // Reset current thickness
  selectedButton.classList.add("selectedTool");
  stickerButtons.forEach(button => {
    if (button !== selectedButton) {
      button.classList.remove("selectedTool");
    }
  });
  if (toolPreview) {
    toolPreview.updateTool(null, currentEmoji);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
};

skullButton.addEventListener("click", () =>
  selectSticker("💀", skullButton, [skullButton, heartButton, fireButton])
);
heartButton.addEventListener("click", () =>
  selectSticker("❤️", heartButton, [skullButton, heartButton, fireButton])
);
fireButton.addEventListener("click", () =>
  selectSticker("🔥", fireButton, [skullButton, heartButton, fireButton])
);

// Redraw the canvas whenever the drawing changes
const redrawCanvas = () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawing.forEach((item) => item.display(ctx));
  if (!cursor.active && toolPreview) {
    toolPreview.draw(ctx);
  }
};

canvas.addEventListener("drawing-changed", redrawCanvas);
canvas.addEventListener("tool-moved", redrawCanvas);
