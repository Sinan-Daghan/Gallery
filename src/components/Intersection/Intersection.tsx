import { onMount, onCleanup, createSignal } from 'solid-js';
import './Intersection.css';


const randomInt = (min=0, max=1): number => (Math.floor(Math.random() * (max - min + 1) + min));
const randomHSL = (S = 50, L = 50): string => `hsl(${randomInt(0, 360)}, ${S}%, ${L}%)`;


class Line {
    constructor(
        public x1: number,
        public y1: number,
        public x2: number,
        public y2: number
    ) {}

    draw(ctx: CanvasRenderingContext2D) {

        const { x1, y1, x2, y2 } = this;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'red';
        ctx.stroke();
    }

    isIntersecting(x3: number, y3: number, x4: number, y4: number) {

        const { x1, y1, x2, y2 } = this;

        const t =   ( (x1-x3)*(y3-y4)-(y1-y3)*(x3-x4) ) / ( (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4) );
        if (t < 0 || t > 1) return false;
        const u = - ( (x1-x2)*(y1-y3)-(y1-y2)*(x1-x3) ) / ( (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4) );
        if (u < 0 || 1 < u) return false;

        return [
            x1 + t * (x2 - x1),
            y1 + t * (y2 - y1)
        ]
    }
}


class Square {
    public vertices!: Int16Array;

    constructor(
        x: number,
        y: number,
        public width: number,
        public Yvelocity: number = 1,
        public color: string = 'orange'
    ) {
        this.setVertices(x, y);
    }

    setVertices(x: number, y: number) {

        const width = this.width;
        this.vertices = new Int16Array([
            x,y,
            x + width, y,
            x + width, y + width,
            x, y + width
        ])
    }

    draw(ctx: CanvasRenderingContext2D) {

        const {vertices, width, color} = this;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.fillRect(vertices[0], vertices[1], width, width);
    }

    move() {

        if (this.vertices[1] > 800) {

            this.width = randomInt(5, 100);
            const x = this.vertices[0];
            const y = 0 - this.width;
            this.Yvelocity = randomInt(1, 5);
            this.color = randomHSL(60, 40);
            this.setVertices(x, y);

            return;
        }

        for (let i=0; i < this.vertices.length; i+=2) {

            this.vertices[i + 1] += this.Yvelocity;
        }
    }
}


function createSquares() {

    const squares: Square[] = [];
    const squaresPerRow = 10;

    for (let i=0; i < squaresPerRow; i++) {

        const x = 800 / squaresPerRow * i;
        const y = 0;
        const width = randomInt(50, 100);
        const Yvelocity = randomInt(1, 5);
        const color = randomHSL(60, 40);
        squares.push(new Square(x, y, width, Yvelocity , color));
    }
    return squares;
}


export default function Intersection() {

    const [getCanvas, setCanvas] = createSignal<HTMLCanvasElement | null>(null);
    let canvasRect: DOMRect;
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;
    const mouseLine = new Line(400,400,0,0);
    const squares: Square[] = createSquares();


    function loop() {

        ctx!.clearRect(0, 0, 800, 800);
        const intersections = [];

        for (let i=0; i < squares.length; i++) {

            const square = squares[i];
            square.move();
            square.draw(ctx!);
            const vertices = square.vertices;
            for (let v = 0; v < 8; v += 2) {
                const intersection = mouseLine.isIntersecting(vertices[v], vertices[v + 1], vertices[(v + 2) % 8], vertices[(v + 3) % 8]);
                if (intersection) intersections.push(intersection);
            }
        }

        mouseLine.draw(ctx!);

        intersections.forEach((intersection) => {

            ctx!.beginPath();
            ctx!.arc(intersection[0], intersection[1], 5, 0, 2 * Math.PI);
            ctx!.fillStyle = 'red';
            ctx!.fill();
        })

        setTimeout(() => requestAnimationFrame(loop), 10);
    }


    function handleMouseMove(event: MouseEvent) {
        const {x, y} = event;
        const {left, top} = canvasRect;
        mouseLine.x2 = x - left;
        mouseLine.y2 = y - top;
    }


    onMount(() => {
        try {
            canvas = getCanvas();
            if (!canvas) throw new Error('Canvas not found');
            ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Context not found');

            ctx.globalCompositeOperation = "darken";
            canvasRect = canvas.getBoundingClientRect();
            document.addEventListener('mousemove', handleMouseMove);
            requestAnimationFrame(loop);
        }
        catch (error) {
            console.error(error);
        }
    })


    onCleanup(() => {
        document.removeEventListener('mousemove', handleMouseMove);
    })


    return <canvas ref={setCanvas} width={800} height={800} id="canvas"></canvas>
}