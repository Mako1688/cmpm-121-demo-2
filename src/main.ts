import "./style.css";

const APP_NAME = "Welcome";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
app.innerHTML = APP_NAME;

//Creates Game Title Text
const gameName = "Gjibrish";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

//Creates Point Interface
interface Point {
  x: number;
  y: number;
}
//Creates Canvas Element
interface canvasElement {
  display(context: CanvasRenderingContext2D): void;
}
//Creates Line Class and Methods
class Line implements canvasElement {
  private points: Point[] = [];
  private thickness: number = 1;
  private color: string = "black";
  constructor(initialX: number, initialY: number,) {
    this.points.push({ x: initialX, y: initialY });
  }

  //Adds a point to the list of points in this line
  addPoint(x_in: number, y_in: number) {
    this.points.push({ x: x_in, y: y_in });
  }
  //Draws all the points in the line
  display(context: CanvasRenderingContext2D): void {
    if (this.points.length > 0) {
      for (let i = 0; i < this.points.length - 1; i++) {
        const thispoint = this.points[i];
        const nextpoint = this.points[i + 1];
        drawLine(
          context,
          thispoint.x,
          thispoint.y,
          nextpoint.x,
          nextpoint.y,
          this.thickness,
          this.color
        );
      }
    }
  }
  //removes a point from the line
  removePoint(): Point {
    const point = this.points.pop();
    if (point) {
      return point;
    } else {
      console.log("ERR Remove Point: No Point Found");
      const throwaway: Point = { x: 9999, y: 9999 };
      return throwaway;
    }
  }
  //checks if the line has no points
  is_empty(): boolean {
    if (this.points.length == 0) {
      return true;
    } else {
      return false;
    }
  }
  //changes the thickness of the line
  changeThickness(thickness: number): void {
    this.thickness = thickness;
  }
  //changes the thickness of the line
  changeColor(color: string): void {
    this.color = color;
  }
}
//Creates Hover Reticle Class and Methods
class Reticle implements canvasElement {
  private thickness: number = 1;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private emoji: string = "";
  constructor() {}
  //draws the reticle above the canvas
  display(context: CanvasRenderingContext2D): void {
    if (current_mode == "line") {
      context.beginPath();
      context.arc(this.mouseX, this.mouseY, this.thickness, 0, Math.PI * 2);
      context.strokeStyle = current_color;//"rgba(0, 0, 0, 0.5)";
      context.stroke();
    } else {
      context.font = "35px serif";
      context.fillText(this.emoji, this.mouseX, this.mouseY);
    }
  }
  //chenges the thickness of the reticle
  changeThickness(thickness: number): void {
    this.thickness = thickness;
  }
  //centers the reticle to a point
  centerOn(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }
  //sets data for the reticle
  setEmoji(emoji: string) {
    this.emoji = emoji;
  }
}
//Sticker Class and methods
class Sticker implements canvasElement {
  private emoji: string;
  public thisX: number = 0;
  public thisY: number = 0;
  private angle: number = 0;
  constructor(emoji: string, x: number, y: number) {
    this.emoji = emoji;
    this.thisX = x;
    this.thisY = y;
  }
  //draws Stickers
  display(context: CanvasRenderingContext2D): void {
    context.font = "30px serif";
    context.fillText(this.emoji, this.thisX, this.thisY);
  }
  //sets data of sticker
  setEmoji(emoji: string) {
    this.emoji = emoji;
  }
  //determines sticker location
  centerOn(x: number, y: number) {
    this.thisX = x;
    this.thisY = y;
  }
  rotate(angle: number) {
    const newangle = (angle * Math.PI) / 180;
    this.angle = newangle;
  }
}
//Command Interface
interface Command {
  execute(): void;
}
class DisplayLineCommand implements Command {
  private line: Line;
  private context: CanvasRenderingContext2D;
  constructor(line: Line, context: CanvasRenderingContext2D) {
    this.line = line;
    this.context = context;
  }
  execute(): void {
    this.line.display(this.context);
  }
}

class ChangeLineThicknessCommand implements Command {
  private line: Line;
  private thickness: number;
  constructor(line: Line, thickness: number) {
    this.line = line;
    this.thickness = thickness;
  }
  execute(): void {
    this.line.changeThickness(this.thickness);
  }
}
class ChangeLineColorCommand implements Command {
  private line: Line;
  private color: string;
  constructor(line: Line, color: string) {
    this.line = line;
    this.color = color;
  }
  execute(): void {
    this.line.changeColor(this.color);
  }
}

class DisplayReticleCommand implements Command {
  private reticle: Reticle;
  private context: CanvasRenderingContext2D;
  constructor(reticle: Reticle, context: CanvasRenderingContext2D) {
    this.reticle = reticle;
    this.context = context;
  }
  execute(): void {
    this.reticle.display(this.context);
  }
}

class CenterReticleCommand implements Command {
  private reticle: Reticle;
  private X: number;
  private Y: number;
  constructor(reticle: Reticle, X: number, Y: number) {
    this.reticle = reticle;
    this.X = X;
    this.Y = Y;
  }
  execute(): void {
    this.reticle.centerOn(this.X, this.Y);
  }
}
class ChangeReticleThicknessCommand implements Command {
  private reticle: Reticle;
  private thickness: number;
  constructor(reticle: Reticle, thickness: number) {
    this.reticle = reticle;
    this.thickness = thickness;
  }
  execute(): void {
    this.reticle.changeThickness(this.thickness);
  }
}
class SetReticleEmojiCommand implements Command {
  private reticle: Reticle;
  private emoji: string;
  constructor(reticle: Reticle, emoji: string) {
    this.reticle = reticle;
    this.emoji = emoji;
  }
  execute(): void {
    this.reticle.setEmoji(this.emoji);
  }
}
class SetStickerEmojiCommand implements Command {
  private sticker: Sticker;
  private emoji: string;
  constructor(sticker: Sticker, emoji: string) {
    this.sticker = sticker;
    this.emoji = emoji;
  }
  execute(): void {
    this.sticker.setEmoji(this.emoji);
  }
}
class CenterStickerCommand implements Command {
  private sticker: Sticker;
  private X: number;
  private Y: number;
  constructor(sticker: Sticker, X: number, Y: number) {
    this.sticker = sticker;
    this.X = X;
    this.Y = Y;
  }
  execute(): void {
    this.sticker.centerOn(this.X, this.Y);
  }
}
class RotateStickerCommand implements Command {
  private sticker: Sticker;
  private angle: number;
  constructor(sticker: Sticker, angle: number) {
    this.sticker = sticker;
    this.angle = angle;
  }
  execute(): void {
    this.sticker.rotate(this.angle);
  }
}
class DisplayStickerCommand implements Command {
  private sticker: Sticker;
  private context: CanvasRenderingContext2D;
  constructor(sticker: Sticker, context: CanvasRenderingContext2D) {
    this.sticker = sticker;
    this.context = context;
  }
  execute(): void {
    this.sticker.display(this.context);
  }
}

//Variables
let isDrawing: boolean = false;
let x: number = 0;
let y: number = 0;
let numLines: number = 0;
let current_thickness: number = 1;
let current_mode: string = "line";
let current_color: string = 'black';
const pointLog: Line[] = [];
const undoLog: Line[] = [];
const stickerLog: Sticker[] = [];
const undostickerLog: Sticker[] = [];
const buttonLog: HTMLButtonElement[] = [];
const drawEvent = new CustomEvent("canvasDrawn", {});
const tool_movedEvent = new CustomEvent("toolMoved", {});
const appReticle: Reticle = new Reticle();
const Canvas_SizeX: number = 256;
const Canvas_SizeY: number = 256;
const thick_pen_size: number = 4;
const thin_pen_size: number = 2;
//----------------------------------------------------------------------

addLine(pointLog, -1, -1, current_thickness,current_color);

const canvas = document.getElementById("canvas") as HTMLElement | null;
if (!canvas) {
  console.log("ERR Make Canvas: No Canvas Element Found");
} else {
  // @ts-ignore: keep getting error "getContext does not exist on type HTML, when it works fine"
  const pen = canvas.getContext("2d");
  // Reset canvas
  clearCanvas(pen);

  //Mouse Down
  canvas.addEventListener("mousedown", (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
    if (current_mode == "line") {
      addLine(pointLog, x, y, current_thickness,current_color);
      numLines++;
    } else {
      addSticker(stickerLog, x, y, current_mode);

      canvas.dispatchEvent(drawEvent);
    }
  });
  //Move Mouse
  canvas.addEventListener("mousemove", (e) => {
    if (e.offsetX >= 0 && e.offsetX <= Canvas_SizeX) {
      if (isDrawing) {
        if (current_mode == "line") {
          x = e.offsetX;
          y = e.offsetY;
          if (!pointLog.length) {
            addLine(pointLog, x, y, current_thickness,current_color);
          }
          pointLog[numLines].addPoint(x, y);
          canvas.dispatchEvent(drawEvent);
        } else {
          x = e.offsetX;
          y = e.offsetY;
          const last_sticker = stickerLog[stickerLog.length - 1];
          if (last_sticker) {
            const stickercenterCommand = new CenterStickerCommand(
              last_sticker,
              x,
              y
            );
            stickercenterCommand.execute();
            canvas.dispatchEvent(drawEvent);
          } else {
            console.log("ERR Drag Sticker: Can't Drag Sticker");
          }
        }
      } else {
        x = e.offsetX;
        y = e.offsetY;
        canvas.dispatchEvent(tool_movedEvent);
      }
    } else {
      canvas.dispatchEvent(drawEvent);
    }
  });
  //Draw Event Listener
  canvas.addEventListener("canvasDrawn", () => {
    clearCanvas(pen);
    if (stickerLog.length > 0) {
      for (const sticker of stickerLog) {
        const stickerdrawCommand = new DisplayStickerCommand(sticker, pen);
        stickerdrawCommand.execute();
      }
    }
    if (pointLog.length > 0) {
      for (const line of pointLog) {
        const drawCommand = new DisplayLineCommand(line, pen);
        drawCommand.execute();
      }
    }
  });
  //Hover Event Listener
  canvas.addEventListener("toolMoved", () => {
    clearCanvas(pen);
    if (stickerLog.length > 0) {
      for (const sticker of stickerLog) {
        const stickerdrawCommand = new DisplayStickerCommand(sticker, pen);
        stickerdrawCommand.execute();
      }
    }
    if (pointLog.length > 0) {
      for (const line of pointLog) {
        const drawCommand = new DisplayLineCommand(line, pen);
        drawCommand.execute();
      }
    }
    if (current_mode != "line") {
      const emojisetCommand = new SetReticleEmojiCommand(
        appReticle,
        current_mode
      );
      emojisetCommand.execute();
    }
    const thicknesstoolCommand = new ChangeReticleThicknessCommand(
      appReticle,
      current_thickness
    );
    thicknesstoolCommand.execute();
    const centertoolCommand = new CenterReticleCommand(appReticle, x, y);
    centertoolCommand.execute();
    const displaytoolCommand = new DisplayReticleCommand(appReticle, pen);
    displaytoolCommand.execute();
  });

  //Mouse Up
  document.addEventListener("mouseup", (e) => {
    if (isDrawing) {
      x = 0;
      y = 0;
      isDrawing = false;
    }
  });

  //Create Clear Button
  const Clear_Button = document.createElement("button");
  Clear_Button.textContent = "Clear Canvas";
  app.append(Clear_Button);
  Clear_Button.addEventListener("click", () => formatCanvas(pen));

  //Create Thick Button
  const Thick_Button = document.createElement("button");
  Thick_Button.textContent = "Thick";
  app.append(Thick_Button);
  Thick_Button.addEventListener("click", () =>
    ChangeThickness(thick_pen_size)
  );
  //Create Thin Button
  const Thin_Button = document.createElement("button");
  Thin_Button.textContent = "Thin";
  app.append(Thin_Button);
  Thin_Button.addEventListener("click", () =>
    ChangeThickness(thin_pen_size)
  );

  //Create Color Button
  const Black_Button = document.createElement("button");
  Black_Button.textContent = "⬛";
  app.append(Black_Button);
  Black_Button.addEventListener("click", () =>
    ChangeColor('black')
  );
  //Create Color Button
  const Red_Button = document.createElement("button");
  Red_Button.textContent = "🟥";
  app.append(Red_Button);
  Red_Button.addEventListener("click", () =>
    ChangeColor('#FF0000')
  );
  //Create Random Color Button
  const Random_Button = document.createElement("button");
  Random_Button.textContent = "❔";
  app.append(Random_Button);
  Random_Button.addEventListener("click", () =>
    RandomColor(Random_Button)
  );
  //Create Undo Button
  const Undo_Button = document.createElement("button");
  Undo_Button.textContent = "Undo";
  app.append(Undo_Button);
  Undo_Button.addEventListener("click", () => undoLine());

  //Create Redo Button
  const Redo_Button = document.createElement("button");
  Redo_Button.textContent = "Redo";
  app.append(Redo_Button);
  Redo_Button.addEventListener("click", () => RedoLine());

  //Create Undo Button
  const Sticker_Undo_Button = document.createElement("button");
  Sticker_Undo_Button.textContent = "Peel Off";
  app.append(Sticker_Undo_Button);
  Sticker_Undo_Button.addEventListener("click", () => undoSticker());

  //Create Redo Button
  const Sticker_Redo_Button = document.createElement("button");
  Sticker_Redo_Button.textContent = "Stick Back";
  app.append(Sticker_Redo_Button);
  Sticker_Redo_Button.addEventListener("click", () => RedoSticker());

  //Create Export Button
  const Export_Button = document.createElement("button");
  Export_Button.textContent = "Export";
  app.append(Export_Button);
  Export_Button.addEventListener("click", () => export_Canvas());

  //Create Custom Button
  const Custom_Button = document.createElement("button");
  Custom_Button.textContent = "New Sticker";
  app.append(Custom_Button);
  Custom_Button.addEventListener("click", () => ask());
  //Create Smile Button
  makeButton("🙂");

  //Create Shrimp Button
  makeButton("🦐");

  //Create Tree Button
  makeButton("🌲");
}

//Make a new sticker
function makeButton(value: string) {
  const Custom_Button = document.createElement("button");
  Custom_Button.textContent = value;
  app.append(Custom_Button);
  Custom_Button.addEventListener("click", () => ChangeMode(value));
  buttonLog.push(Custom_Button);
}
//Create a prompt for new sticker data
function ask() {
  const text = prompt("Paste in Sticker or Text", "🐌");
  if (text) {
    makeButton(text);
  }
}
//Export the canvas
function export_Canvas() {
  const newCanvas = document.createElement("canvas");
  newCanvas.width = 1024;
  newCanvas.height = 1024;
  const export_pen = newCanvas.getContext("2d");
  if (export_pen) {
    export_pen.scale(4, 4);
    clearCanvas(export_pen);
    if (stickerLog.length > 0) {
      for (const sticker of stickerLog) {
        const stickerdrawCommand = new DisplayStickerCommand(
          sticker,
          export_pen
        );
        stickerdrawCommand.execute();
      }
    }
    if (pointLog.length > 0) {
      for (const line of pointLog) {
        const drawCommand = new DisplayLineCommand(line, export_pen);
        drawCommand.execute();
      }
    }
    const anchor = document.createElement("a");
    anchor.href = newCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
  }
}
//Draw line
function drawLine(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  color:string
) {
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.closePath();
}
//Clear the canvas
function clearCanvas(context: CanvasRenderingContext2D) {
  context.clearRect(0, 0, Canvas_SizeX, Canvas_SizeY);
}
//Clear the canvas, and remove all data
function formatCanvas(context: CanvasRenderingContext2D) {
  clearCanvas(context);
  pointLog.length = 0;
  undoLog.length = 0;
  stickerLog.length = 0;
  addLine(pointLog, x, y, current_thickness,current_color);
  numLines = 0;
  x = 0;
  y = 0;
}
//undo a line
function undoLine() {
  if (canvas) {
    if (pointLog.length > 0) {
      const removed_line = pointLog.pop();
      if (removed_line) {
        if (removed_line.is_empty()) {
          undoLine();
        }
        undoLog.push(removed_line);
        numLines--;
        canvas.dispatchEvent(drawEvent);
        return removed_line;
      } else {
        console.log("ERR Undo: Removed_line Does Not Exist");
      }
    } else {
      console.log("ERR Undo: Removed_line Does Not Exist");
    }
  }
}
//redo a line
function RedoLine() {
  if (canvas) {
    const removed_line = undoLog.pop();
    if (removed_line) {
      if (!removed_line.is_empty()) {
        pointLog.push(removed_line);
        numLines++;
        canvas.dispatchEvent(drawEvent);
        return removed_line;
      } else {
        console.log("ERR Redo: Removed_line Is Empty");
      }
    } else {
      console.log("ERR Redo: Removed_line Does Not Exist");
    }
  }
}
//undo a sticker
function undoSticker() {
  if (canvas) {
    if (stickerLog.length > 0) {
      const removed_sticker = stickerLog.pop();
      if (removed_sticker) {
        undostickerLog.push(removed_sticker);
        canvas.dispatchEvent(drawEvent);
        return removed_sticker;
      } else {
        console.log("ERR Undo: Removed_sticker Does Not Exist");
      }
    } else {
      console.log("ERR Undo: Removed_sticker Does Not Exist");
    }
  }
}
//redo a sticker
function RedoSticker() {
  if (canvas) {
    const removed_sticker = undostickerLog.pop();
    if (removed_sticker) {
      stickerLog.push(removed_sticker);
      canvas.dispatchEvent(drawEvent);
      return removed_sticker;
    } else {
      console.log("ERR Redo: Removed_sticker Does Not Exist");
    }
  }
}
// add a line to the log of lines
function addLine(log: Line[], x: number, y: number, thickness: number, color: string) {
  const line1 = new Line(x, y);
  const thicknessCommand = new ChangeLineThicknessCommand(line1, thickness);
  thicknessCommand.execute();
  const colorCommand = new ChangeLineColorCommand(line1, color);
  colorCommand.execute();
  log.push(line1);
}
//add a sticker to the log of stickers
function addSticker(log: Sticker[], x: number, y: number, emoji: string) {
  const sticker1 = new Sticker(emoji, x, y);
  log.push(sticker1);
}
//change thickness of a line
function ChangeThickness(thickness: number) {
  current_mode = "line";
  current_thickness = thickness;
}
//change whether we are in sticker or line mode
function ChangeMode( mode: string) {
  current_mode = mode;
}
//change whether we are in sticker or line mode
function ChangeColor(color: string) {
  current_color = color;
}
function RandomColor(button:HTMLButtonElement) {
  const random:number = getRandomInt(6);
  let color:string = 'black';
  if(random == 0){
    color = 'red';
    button.textContent = "🟥";
  }
  else if(random == 1){
    color = 'orange';
    button.textContent = "🟧"
  }
  else if(random == 2){
    color = 'yellow';
    button.textContent = "🟨"
  }
  else if(random == 3){
    color = 'green';
    button.textContent = "🟩"
  }
  else if(random == 4){
    color = 'blue';
    button.textContent = "🟦"
  }
  else if (random == 5){
    color = 'purple';
    button.textContent = "🟪"
  }
  ChangeColor(color);
}
function getRandomInt(max:number) {
  return Math.floor(Math.random() * max);
}