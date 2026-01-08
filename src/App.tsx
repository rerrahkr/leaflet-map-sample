import { Toaster } from "sonner";
import { MapComponent } from "./map";

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <MapComponent className="h-dvh w-dvw" />
    </>
  );
}

export default App;
