import React, { useState, useEffect } from "react";
import AsyncSelect from "react-select/async";
import Stockchart from "./TimeSeriesChart.js";
import QuandlAPI from "../services/QuandlAPI.js";
import uPlot from "uplot";
import { TimeSeries } from "pondjs";

// TODO: move to utils
function fmtUSD(val, dec) {
  if (!val) {
    return "";
  }
  return "$" + val.toFixed(dec).replace(/\d(?=(\d{3})+(?:\.|$))/g, "$&,");
}
const tzDate = (ts) => uPlot.tzDate(new Date(ts * 1e3), "Etc/UTC");

const StockPrice = () => {
  const [metadata, setMetadata] = useState(null);
  const [stockData, setStockData] = useState(null);

  const opts = {
    width: 1920,
    height: 600,
    title: "Stock",
    tzDate,
    plugins: [
      // columnHighlightPlugin(),
      // legendAsTooltipPlugin(),
      // candlestickPlugin(),
    ],
    scales: {
      x: {
        distr: 2,
      },
      vol: {
        range: [0, 2000],
      },
    },
    series: [
      {
        label: "Date",
        value: (u, ts) => ts,
      },
      {
        label: "Open",
        value: (u, v) => fmtUSD(v, 2),
      },
      {
        label: "High",
        value: (u, v) => fmtUSD(v, 2),
      },
      {
        label: "Low",
        value: (u, v) => fmtUSD(v, 2),
      },
      {
        label: "Close",
        value: (u, v) => fmtUSD(v, 2),
      },
      {
        label: "Volume",
        scale: "vol",
      },
    ],
    axes: [
      {},
      {
        values: (u, vals) => vals.map((v) => fmtUSD(v, 0)),
      },
      {
        side: 1,
        scale: "vol",
        grid: { show: false },
      },
    ],
  };

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
