import "./style.css";

const APP_NAME = "Mako Paint 🎨";
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;

const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;

function createTitleElement(text: string): HTMLHeadingElement {
  const titleElement = document.createElement("h1");
  titleElement.textContent = text;
  return titleElement;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

app.appendChild(createTitleElement(APP_NAME));
app.appendChild(createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT));