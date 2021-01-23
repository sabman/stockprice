import cached_datasets from "../cached_data/datasets.json";
import { csvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";

// helper functions

// Parser function for each row from the API
const parseData = (d) => {
  d.date_string = d.Date;
  d.date = timeParse("%Y-%m-%d")(d.Date);
  d.open = +d.Open;
  d.high = +d.High;
  d.low = +d.Low;
  d.close = +d.Close;
  d.volume = +d.Volume;
  return d;
};

// constants
const QUANDL_API_KEY = `HyjG4ErwyxiQiZ8WKz5z`; // TODO: move this to server side API
const QUANDL_BASE_API = `https://www.quandl.com/api/v3`;
const QUANDL_DATASETS_API = `${QUANDL_BASE_API}/datasets?database_code=EOD&filter=sample&page=1&per_page=50&query=&format=json`;

const QuandlAPI = {
  getDatasets: async () => {
    let datasets = null;
    try {
      const response = await fetch(QUANDL_DATASETS_API);
      if (response.ok) {
        const jsonResponse = await response.json();
        datasets = jsonResponse["datasets"];
      } else {
        datasets = cached_datasets["datasets"];
      }
    } catch (error) {
      console.log(error);
      datasets = cached_datasets["datasets"];
    }

    return datasets;
  },
  getStockData: async (
    tickerCode: string,
    data_format: string,
    start_date: string,
    end_date: string
  ) => {
    const response = await fetch(
      `https://www.quandl.com/api/v3/datasets/EOD/${tickerCode}.csv?api_key=${QUANDL_API_KEY}`
    );
    const text = await response.text();

    let data = csvParse(text, parseData);
    if (data_format === "array") {
      // reduce data to arrays
      const key2rowIdx = {
        date: 0,
        open: 1,
        high: 2,
        low: 3,
        close: 4,
        volume: 5,
      };
      data = data.reduce(
        (memo, row, i) => {
          Object.entries(key2rowIdx).forEach(([k, i]) => memo[i].push(row[k]));
          return memo;
        },
        [[], [], [], [], [], []]
      );
    }

    return data;
  },
};

export default QuandlAPI;
