import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import Stockchart from "./TimeSeriesChart.js";
import QuandlAPI from "../services/QuandlAPI.js";

const StockPrice = () => {
  const [metadata, setMetadata] = useState(null);
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    metadata &&
      QuandlAPI.getStockData(metadata.dataset_code, "json").then((d) =>
        setStockData(d)
      );
    return () => {
      // cleanup
    };
  }, [metadata]);

  return (
    <div>
      <AsyncSelect
        getOptionLabel={({ dataset_code, name }) => `${dataset_code} - ${name}`}
        getOptionValue={({ dataset_code }) => dataset_code}
        onChange={(d) => setMetadata(d)}
        cacheOptions
        defaultOptions
        loadOptions={QuandlAPI.getDatasets}
      />

      <h2>{metadata?.name}</h2>

      {stockData && metadata && (
        <Stockchart
          tickerCode={metadata.dataset_code}
          data={stockData}
          metadata={metadata}
        />
      )}

      <pre>{stockData && JSON.stringify(stockData[1], null, 2)}</pre>

      <pre>{metadata && JSON.stringify(metadata, null, 2)}</pre>
    </div>
  );
};

export default StockPrice;
