/**
 *  Copyright (c) 2016, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/* eslint-disable */

import React, { useEffect, useState } from "react";
import moment from "moment";

// Pond
import {
  Collection,
  TimeSeries,
  TimeEvent,
  IndexedEvent,
  TimeRange,
} from "pondjs";

// Imports from the charts library
import {
  ChartContainer,
  ChartRow,
  Charts,
  YAxis,
  LineChart,
  BarChart,
  Resizable,
} from "react-timeseries-charts";

const StockTimeSeries = ({ data, metadata }) => {
  const name = metadata.name;
  const columns = ["time", "open", "close", "low", "high"];
  const events = data.map((item) => {
    const timestamp = moment(new Date(item.date_string));
    const { open, close, low, high } = item;
    return new TimeEvent(timestamp.toDate(), {
      open: +open,
      close: +close,
      low: +low,
      high: +high,
    });
  });
  const collection = new Collection(events);
  const sortedCollection = collection.sortByTime();
  const series = new TimeSeries({
    name,
    columns,
    collection: sortedCollection,
  });

  //
  // Volume
  //

  const volumeEvents = data.map((item) => {
    const index = item.date_string;
    const { volume } = item;
    return new IndexedEvent(index, { volume: +volume });
  });
  const volumeCollection = new Collection(volumeEvents);
  const sortedVolumeCollection = volumeCollection.sortByTime();

  const seriesVolume = new TimeSeries({
    name: name,
    utc: false,
    collection: sortedVolumeCollection,
  });

  return {
    series,
    seriesVolume,
  };
};

function Stockchart(props) {
  let { data, metadata, tickerCode } = props;

  const [state, setState] = useState({
    mode: "linear",
    timerange: new TimeRange([
      metadata["oldest_available_date"],
      metadata["newest_available_date"],
    ]),
    sts: StockTimeSeries({ data, metadata }),
  });

  useEffect(() => {
    if (!tickerCode) {
      return;
    }

    setState({
      mode: "linear",
      timerange: new TimeRange([
        metadata["oldest_available_date"],
        metadata["newest_available_date"],
      ]),
      sts: StockTimeSeries({ data, metadata }),
    });

    return () => {
      // cleanup
    };
  }, [props]);

  const handleTimeRangeChange = (timerange) => {
    setState({ ...state, timerange });
  };

  const setModeLinear = () => {
    setState({ ...state, mode: "linear" });
  };

  const setModeLog = () => {
    setState({ ...state, mode: "log" });
  };

  const { timerange } = state;
  const croppedSeries = state.sts.series.crop(timerange);
  const croppedVolumeSeries = state.sts.seriesVolume.crop(timerange);

  const linkStyle = {
    fontWeight: 600,
    color: "grey",
    cursor: "default",
  };

  const linkStyleActive = {
    color: "steelblue",
    cursor: "pointer",
  };

  return (
    <div>
      <div className="row">
        <div className="col-md-12">
          <div
            dangerouslySetInnerHTML={{ __html: props.metadata.description }}
          ></div>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-md-12" style={{ fontSize: 14, color: "#777" }}>
          <span
            style={state.mode === "log" ? linkStyleActive : linkStyle}
            onClick={setModeLinear}
          >
            Linear
          </span>
          <span> | </span>
          <span
            style={state.mode === "linear" ? linkStyleActive : linkStyle}
            onClick={setModeLog}
          >
            Log
          </span>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-md-12">
          <Resizable>
            <ChartContainer
              timeRange={timerange}
              hideWeekends={true}
              enablePanZoom={true}
              onTimeRangeChanged={handleTimeRangeChange}
              timeAxisStyle={{ axis: { fill: "none", stroke: "none" } }}
            >
              <ChartRow height="300">
                <Charts>
                  <LineChart
                    axis="y"
                    style={{ close: { normal: { stroke: "steelblue" } } }}
                    columns={["close"]}
                    series={croppedSeries}
                    interpolation="curveBasis"
                  />
                </Charts>
                <YAxis
                  id="y"
                  label="Price ($)"
                  min={croppedSeries.min("close")}
                  max={croppedSeries.max("close")}
                  format=",.0f"
                  width="60"
                  type={state.mode}
                />
              </ChartRow>
              <ChartRow height="200" axisMargin={0}>
                <Charts>
                  <BarChart
                    axis="y"
                    style={{ volume: { normal: { stroke: "steelblue" } } }}
                    columns={["volume"]}
                    series={croppedVolumeSeries}
                  />
                </Charts>
                <YAxis
                  id="y"
                  label="Volume"
                  min={croppedVolumeSeries.min("volume")}
                  max={croppedVolumeSeries.max("volume")}
                  width="60"
                />
              </ChartRow>
            </ChartContainer>
          </Resizable>
        </div>
      </div>
    </div>
  );
}

export default Stockchart;
