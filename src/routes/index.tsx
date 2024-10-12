import { Title } from "@solidjs/meta";
import './index.css';

export default function Home() {
  return (
    <main>
      <Title>Gallery</Title>
      <a href="/vector-grid">Vector Grid</a>
      <a href="/australia">Australia</a>
      <a href="/trigonometry">Trigonometry</a>
      <a href="/intersection">Intersection</a>
    </main>
  );
}