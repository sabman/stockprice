import React, { useState, useEffect } from "react";
import Select from "react-select";
import Stockchart from "./TimeSeriesChart.js";
import QuandlAPI from "../services/QuandlAPI.js";
import { Spinner } from "react-spinners-css";

const StockPrice = () => {
  const [metadata, setMetadata] = useState(null);
  const [datasets, setDatasets] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    QuandlAPI.getDatasets().then((d) =>
      setDatasets(
        d.sort((a, b) => {
          if (a["dataset_code"] > b["dataset_code"]) return 1;
          if (a["dataset_code"] < b["dataset_code"]) return -1;
          return 0;
        })
      )
    );
  }, []);

  useEffect(() => {
    if (!metadata) {
      return;
    }

    setLoading(true);
    QuandlAPI.getStockData(metadata.dataset_code, "json").then((d) => {
      setStockData(d);
      setLoading(false);
    });

    return () => {
      // TODO: cleanup
    };
  }, [metadata]);

  const getOptionLabel = ({ dataset_code, name }) =>
    `${dataset_code} - ${name}`;

  const getOptionValue = ({ dataset_code }) => dataset_code;

  return (
    <div>
      <Select
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        onChange={(d) => setMetadata(d)}
        defaultOptions
        placeholder={
          !datasets ? "loading..." : "Select a stock by typing ticker or name"
        }
        loading={!datasets}
        options={datasets}
      />

      <h2 className="is-size-2">{metadata?.name}</h2>

      {stockData && metadata ? (
        <Stockchart
          tickerCode={metadata.dataset_code}
          data={stockData}
          metadata={metadata}
        />
      ) : (
        loading && (
          <div className="is-flex is-justify-content-center">
            <Spinner />
          </div>
        )
      )}
    </div>
  );
};

export default StockPrice;
