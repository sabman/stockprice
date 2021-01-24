import "./services/object_extensions.exec";
import StockPrice from "./components/StockPrice.js";

function App() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Stock Price Checker</h1>

        <StockPrice />
      </div>
    </section>
  );
}

export default App;
