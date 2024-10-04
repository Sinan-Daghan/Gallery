import "./VectorGrid.css";
import { createSignal, onCleanup, onMount } from "solid-js";
import Slider from "~/components/Slider/Slider";
import Vec2 from "~/utils/Vec2";

const [getCanvas, setCanvas] = createSignal<HTMLCanvasElement | null>(null);
type Vmouse = () => { x: number, y: number };
const [Vmouse, setVmouse] = createSignal({ x: 0, y: 0 });

let ctx: CanvasRenderingContext2D | null = null;
const canvasWidth = 800;
const canvasHeight = 800;

let points: Uint16Array | null = null;
let pointsLength: number = 400;

const [vectorsPerRow, setVectorsPerRow] = createSignal(10);
const numberOfVectors = () => vectorsPerRow() ** 2;
const [magnitude, setMagnitude] = createSignal(0.5);

let VgridSize = new Vec2(600, 600);
// cornerX, cornerY: top left corner of the canvas relative to the window
let cornerX = 0;
let cornerY = 0;

const VtileSize = () => {
  const ratio = VgridSize.x / vectorsPerRow();
  return new Vec2(ratio, ratio);
}
const scalar = () => magnitude() * VtileSize().x;


function clearCanvas() {
  if (ctx) ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}


function createUint16GridOfPoints(gridSize: Vec2, tile: Vec2): Uint16Array {
  // corner of the grid relative to the canvas when the grid is centered
  const cornerGridX = (canvasWidth - gridSize.x) / 2;
  const cornerGridY = (canvasHeight - gridSize.y) / 2;

  const tileCenter = tile.div(2);

  const pointsArray = [];

  for (let x = 0 ; x < gridSize.x - tileCenter.x ; x += tile.x) {
    for (let y = 0 ; y < gridSize.y - tileCenter.y; y += tile.y) {
      pointsArray.push(
        cornerGridX + x + tileCenter.x ,
        cornerGridY + y + tileCenter.y
      );
    }
  }
  // will clamp floats to unsigned int 16
  points =  new Uint16Array(pointsArray);
  pointsLength = points.length;
  return points;
}


function drawVectors(Vmouse: Vmouse) {
  let {x, y} = Vmouse();
  if (!(points && pointsLength && scalar() && ctx))
    return;

  x = x - cornerX;
  y = y - cornerY;
  const s = scalar();

  clearCanvas();
  ctx.beginPath();

  for (let i = 0; i < pointsLength; i += 2) {
    let pX = points[i];
    let pY = points[i+1];
    let dX = x - pX;
    let dY = y - pY;
    const hyp = Math.hypot(dX, dY);
    dX = (dX / hyp) * s;
    dY = (dY / hyp) * s;
    ctx.moveTo(pX, pY);
    ctx.lineTo(pX + dX, pY + dY);
  }
  ctx.stroke();
}


function handleSetGridSize(event: InputEvent) {
  event.preventDefault();
  clearCanvas();
  setVectorsPerRow((event.target as HTMLInputElement).valueAsNumber);
  points = createUint16GridOfPoints(VgridSize, VtileSize());
  drawVectors(Vmouse);
}


function handleMouseMove(event: MouseEvent) {
  const  { x, y } = event;
  setVmouse({ x ,y });
  drawVectors(Vmouse);
}


function setCornerXandY() {
  try {
    const canvas = getCanvas();
    if (!canvas) throw new Error("Failed to get canvas");
    const {x, y} = canvas.getBoundingClientRect();
    cornerX = x;
    cornerY = y;

  } catch (error) {
    console.error(error);
  }
}

export default function VectorGrid() {

  onMount(() => {
    try {
      const canvas = getCanvas();
      if (!canvas) throw new Error("Failed to get canvas");

      ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get 2D context");

      setVmouse({ x: canvasWidth / 2, y: canvasHeight / 2 });
      setCornerXandY();
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("resize", setCornerXandY);

      ctx.strokeStyle = "white";
      points  = createUint16GridOfPoints (VgridSize, VtileSize());
      drawVectors(Vmouse);

    } catch (error) {
      console.error(error);
    }
  });


  onCleanup(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("resize", setCornerXandY);
  })


  return (
    <main>

      <canvas ref={setCanvas} width={canvasWidth} height={canvasHeight} />

      <section>
        <p> Mouse Position: ({Vmouse().x}, {Vmouse().y})</p>

        <div>
          <p> Vectors per row : {vectorsPerRow()}</p>
          <p> Number of Vectors : {numberOfVectors()}</p>
          <Slider
            min={1}
            max={100}
            step={1}
            value={vectorsPerRow()}
            onInput={handleSetGridSize}
          />
        </div>

        <div>
          <p> Vector Magnitude : {magnitude()}</p>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={magnitude()}
            onInput={(event: InputEvent) => setMagnitude((event.target as HTMLInputElement).valueAsNumber)}
          />
        </div>
      </section>

    </main>
  );
}