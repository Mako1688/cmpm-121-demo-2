import "./style.css";

// Constants for app name and canvas dimensions
const APP_NAME = "Mako Paint 🎨";
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;
const EXPORT_CANVAS_SIZE = 1024;
const SCALE_FACTOR = 4;

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

const appendButtons = (
  container: HTMLDivElement,
  buttons: HTMLButtonElement[]
) => {
  buttons.forEach((button) => container.appendChild(button));
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
const exportButton = createButton("Export");
appendButtons(toolContainer, [
  clearButton,
  undoButton,
  redoButton,
  exportButton,
]);
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
const customButton = createButton("Custom"); // Custom button for custom stickers
appendButtons(stickerContainer, [
  skullButton,
  heartButton,
  fireButton,
  customButton,
]);
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

  constructor(
    x: number,
    y: number,
    thickness: number | null = null,
    emoji: string | null = null
  ) {
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
const thinThickness = 1;
const thickThickness = 5;
let currentThickness = thinThickness; // Default thickness
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
      toolPreview = new ToolPreview(
        cursor.x,
        cursor.y,
        currentThickness,
        currentEmoji
      );
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

exportButton.addEventListener("click", () => {
  // Create a new canvas of size 1024x1024
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = EXPORT_CANVAS_SIZE;
  exportCanvas.height = EXPORT_CANVAS_SIZE;
  const exportCtx = exportCanvas.getContext("2d")!;

  // Scale the context to fill the larger canvas
  exportCtx.scale(SCALE_FACTOR, SCALE_FACTOR);

  // Execute all items on the display list against the new context
  drawing.forEach((item) => item.display(exportCtx));

  // Trigger a file download with the contents of the canvas as a PNG file
  exportCanvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "drawing.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  });
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
  stickerButtons.forEach((button) => button.classList.remove("selectedTool"));
  if (toolPreview) {
    toolPreview.updateTool(currentThickness, null);
    canvas.dispatchEvent(new Event("tool-moved"));
  }
};

thinButton.addEventListener("click", () =>
  selectTool(thinThickness, thinButton, thickButton, [
    skullButton,
    heartButton,
    fireButton,
    customButton,
  ])
);
thickButton.addEventListener("click", () =>
  selectTool(thickThickness, thickButton, thinButton, [
    skullButton,
    heartButton,
    fireButton,
    customButton,
  ])
);

// Event listeners for sticker selection
const selectSticker = (
  emoji: string,
  selectedButton: HTMLButtonElement,
  stickerButtons: HTMLButtonElement[]
) => {
  currentEmoji = emoji;
  currentThickness = 0; // Reset current thickness
  selectedButton.classList.add("selectedTool");
  stickerButtons.forEach((button) => {
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
  selectSticker("💀", skullButton, [
    skullButton,
    heartButton,
    fireButton,
    customButton,
  ])
);
heartButton.addEventListener("click", () =>
  selectSticker("❤️", heartButton, [
    skullButton,
    heartButton,
    fireButton,
    customButton,
  ])
);
fireButton.addEventListener("click", () =>
  selectSticker("🔥", fireButton, [
    skullButton,
    heartButton,
    fireButton,
    customButton,
  ])
);
customButton.addEventListener("click", () => {
  const customSticker = prompt("Enter a custom emoji", "✨");
  if (customSticker) {
    selectSticker(customSticker, customButton, [
      skullButton,
      heartButton,
      fireButton,
      customButton,
    ]);
  }
});

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
