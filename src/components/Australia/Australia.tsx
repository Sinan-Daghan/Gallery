import { createSignal, For, onMount } from 'solid-js'
import SVGAustralia from '~/components/Australia/SVGAustralia'
import './Australia.css'

type pathOrLegend = SVGPathElement | HTMLParagraphElement;

export default function Australia() {
    const [svgRef, setSvgRef] = createSignal<SVGSVGElement | null>(null);
    const associations = new Map<pathOrLegend, pathOrLegend>();
    let previousPathAndLegend: pathOrLegend[] | null = null;
    const areas = [
        'Western Australia',
        'Northern Territory',
        'South Australia',
        'Queensland',
        'New South Wales',
        'Jervis Bay Territory',
        'Victoria',
        'Tasmania',
        'Australian Capital Territory',
    ];


    function toggleSelected(array: pathOrLegend[]) {
        array.forEach((element: pathOrLegend) => {element.classList.toggle('selected')} );
    }


    const handleMouseMove = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof SVGPathElement || target instanceof HTMLParagraphElement)) return;
        if (previousPathAndLegend?.includes(target)) return;

        if (previousPathAndLegend) {
            toggleSelected(previousPathAndLegend);
        }

        if (associations.has(target)) {
            const associated = associations.get(target)!;
            toggleSelected([target, associated]);
            previousPathAndLegend = [target, associated];
        }
    }


    onMount(() => {
        const svg = svgRef();
        if (!svg) return;
        const paths = svg.querySelectorAll('path');
        const legends = document.querySelectorAll('p');
        paths.forEach((path, i) => { associations.set(path, legends[i]) });
        legends.forEach((legend, i) => { associations.set(legend, paths[i]) });
    });


    return (
        <main>

            <section>
                <SVGAustralia ref={setSvgRef}  handleMouseMove={handleMouseMove} />
            </section>

            <section onMouseMove={handleMouseMove}>
                <h1>Australia</h1>
               <For each={areas}>
                    { area => <p>{area}</p> }
               </For>
            </section>

        </main>
    )
}