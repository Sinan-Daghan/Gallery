import { onMount, createSignal } from 'solid-js';
import Slider from '~/components/Slider/Slider';
import './Trigonometry.css';

const TAU = Math.PI * 2;
const PI = Math.PI;

// ClokLine instantiates a line with a circle that slides along it.
class ClockLine {
    static length = 200;

    public sin: number;
    public cos: number;

    constructor(
        public angle: number,
        public color: string = 'black'
    ) {
        this.angle = angle;
        this.sin = Math.sin(angle) * ClockLine.length;
        this.cos = Math.cos(angle) * ClockLine.length;
    }

    drawCircle(ctx: CanvasRenderingContext2D, scalar: number) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.cos * scalar, this.sin * scalar, 5, 0, TAU);
        ctx.fill();
    }

    drawLine(ctx: CanvasRenderingContext2D) {
        const { cos, sin } = this;
        ctx.beginPath();
        ctx.moveTo(cos *  1.1, sin *  1.1);
        ctx.lineTo(cos * -1.1, sin * -1.1);
        ctx.strokeStyle = 'black';
        ctx.stroke();
    }
}


export default function Trigonometry() {

    const [canvasTop, setCanvasTop] = createSignal<HTMLCanvasElement | null>(null);
    const [canvasBottom, setCanvasBottom] = createSignal<HTMLCanvasElement | null>(null);
    let ctxTop : CanvasRenderingContext2D;
    let ctxBottom : CanvasRenderingContext2D;

    const canvasWidth = 800;
    const halfCanvasWidth = canvasWidth / 2;
    const canvasHeight = 800;
    const halfCanvasHeight  = canvasHeight / 2;

    const [lineCount, setlineCount] = createSignal(20);
    const [offsetScalar, setOffsetScalar] = createSignal(1);

    let clockLines: ClockLine[] = [];
    let angleBetweenLines = PI / lineCount();
    let clockAngle = 0;
    const clockIncrement = PI / 180;


    function createClockLines(lineCount: number): ClockLine[] {

        ctxBottom.clearRect(-halfCanvasWidth, -halfCanvasHeight, canvasWidth, canvasHeight);
        const degreesBetweenLines = 360 / lineCount;
        const lines = [];

        for (let line = 0 ; line < lineCount ; line++) {

            const color = `hsl(${degreesBetweenLines * line}, 100%, 40%)`;
            const clockLine = new ClockLine(angleBetweenLines * line, color);
            clockLine.drawLine(ctxBottom);
            lines.push(clockLine);
        }
        return lines;
    }


    onMount(() => {

        const canvas = {
            top: canvasTop(),
            bottom: canvasBottom()
        }

        if (!canvas.top) return console.error('CanvasTop not found');
        if (!canvas.bottom) return console.error('CanvasBottom not found');

        ctxTop = canvas.top.getContext('2d') as CanvasRenderingContext2D;
        ctxBottom = canvas.bottom.getContext('2d') as CanvasRenderingContext2D;

        ctxTop.translate(halfCanvasWidth, halfCanvasHeight);
        ctxBottom.translate(halfCanvasWidth, halfCanvasHeight);

        clockLines = createClockLines(lineCount());

        function loop() {
            clockAngle = (clockAngle + clockIncrement) % TAU;
            ctxTop.clearRect(-halfCanvasWidth, -halfCanvasHeight, canvasWidth, canvasHeight);
            const offset = offsetScalar();

            const count = lineCount(); // Faster than calling lineCount() every time in the `for loop`.
            for (let i=0; i < count ; i++) {

                clockLines[i].drawCircle(
                    ctxTop,
                    Math.sin(i * angleBetweenLines * offset + clockAngle )
                );
            }
            window.requestAnimationFrame(loop);
        }
        window.requestAnimationFrame(loop);
    });

    function handleLineCount(event: InputEvent) {

        const lineCount = (event.target as HTMLInputElement).valueAsNumber;
        setlineCount(lineCount);

        angleBetweenLines = PI / lineCount;
        clockLines = createClockLines(lineCount);
    }

    function handleOffset(event: InputEvent) {

        setOffsetScalar(
            (event.target as HTMLInputElement).valueAsNumber
        );
    }

    function reset() {
        setOffsetScalar(1);
        setlineCount(20);
        angleBetweenLines = PI / 20;
        clockLines = createClockLines(20);
    }

    return (
        <main>
            <section>

                <canvas
                  id="canvasTop"
                  ref={setCanvasTop}
                  width={canvasWidth}
                  height={canvasHeight}
                ></canvas>

                <canvas
                  ref={setCanvasBottom}
                  width={canvasWidth}
                  height={canvasHeight}
                ></canvas>

            </section>

            <section id="interface">

                <p> Number of lines: <span>{lineCount()}</span> </p>
                <Slider
                  max={200}
                  min={1}
                  value={lineCount()}
                  onInput={handleLineCount}
                />

                <p> Offset: <span>{offsetScalar()}</span> </p>
                <Slider
                  min={0}
                  max={10}
                  step={0.01}
                  value={offsetScalar()}
                  onInput={handleOffset}
                />

                <button onClick={reset}> Reset </button>

            </section>
        </main>
    );
}