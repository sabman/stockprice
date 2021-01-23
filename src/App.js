import "./services/object_extensions.exec";
import StockPrice from "./components/StockPrice.js";

function App() {
  return (
    <div className="">
      <header className="">Stock Price Checker</header>

      <StockPrice />
    </div>
  );
}

export default App;
