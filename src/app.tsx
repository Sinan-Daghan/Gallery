import { MetaProvider, Title } from "@solidjs/meta";
import { Router, A } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";

export default function App() {
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Gallery</Title>

          <A
             href="/"
             end
             id="home-btn"
             inactiveClass="show"
             activeClass="hide"
          >Home</A>

          <Suspense>{props.children}</Suspense>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
