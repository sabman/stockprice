import "./services/object_extensions.exec";
import StockPrice from "./components/StockPrice.js";

function App() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Stock Price Checker</h1>
        <h2 className="subtitle">Check your favorite stock's historic price</h2>

        <StockPrice />
      </div>
    </section>
  );
}

export default App;
