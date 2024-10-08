import { onMount, createSignal } from 'solid-js';
import './Trigonometry.css';

const Tau = Math.PI * 2;

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

    drawDot(ctx: CanvasRenderingContext2D, scalar: number) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.cos * scalar, this.sin * scalar, 5, 0, Tau);
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
    let canvasWidth = 800;
    let canvasHeight = 800;

    const [canvasTop, setCanvasTop] = createSignal<HTMLCanvasElement | null>(null);
    const [canvasBottom, setCanvasBottom] = createSignal<HTMLCanvasElement | null>(null);

    let ctxTop : CanvasRenderingContext2D;
    let ctxBottom : CanvasRenderingContext2D;

    const clockLines: ClockLine[] = [];
    let dots = 20;

    onMount(() => {
        const halfCanvasWidth = canvasWidth / 2;
        const halfCanvasHeight = canvasHeight / 2;

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

        let clockAngle = 0;
        const clockIncrement = Math.PI / 180;
        const angleDelta = Math.PI / dots;

        for (let i=0 ; i < dots ; i++) {
            const color = `hsl(${360/dots * i}, 100%, 40%)`;
            const clockLine = new ClockLine(angleDelta * i, color);
            clockLines.push(clockLine);
            clockLine.drawLine(ctxBottom);
        }

        function loop() {

            clockAngle = (clockAngle + clockIncrement) % Tau;

            (ctxTop as CanvasRenderingContext2D).clearRect(-halfCanvasWidth, -halfCanvasHeight, canvasWidth, canvasHeight);

            for (let i=0; i < dots ; i++) {
                clockLines[i].
                drawDot(
                    ctxTop,
                    Math.sin(i * angleDelta + clockAngle)
                );
            }

            window.requestAnimationFrame(loop);
        }
        window.requestAnimationFrame(loop);
    });

    return(
    <main>
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
    </main>
    );
}