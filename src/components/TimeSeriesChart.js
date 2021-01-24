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
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { DateRangePicker } from "react-dates";

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

  const [selectedDate, setSelectedDate] = useState({
    startDate: moment(metadata["oldest_available_date"]),
    endDate: moment(metadata["newest_available_date"]),
  });
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
      focusedInput: null,
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

  const onDatesChange = ({ startDate, endDate }) => {
    setSelectedDate({ startDate, endDate });
    let timerange = new TimeRange([startDate.toDate(), endDate.toDate()]);
    timerange.log("new timerange");
    setState({ ...state, timerange });
  };

  const onFocusChange = (focusedInput) => {
    // setFocusedInput({ focusedInput });
    setState({ ...state, focusedInput });
  };

  const resetDateRange = () => {
    setSelectedDate({
      startDate: moment(state.timerange.begin()),
      endDate: moment(state.timerange.end()),
    });
  };

  // let croppedSeries = state.sts.series.crop(state.timerange);
  // let croppedVolumeSeries = state.sts.seriesVolume.crop(state.timerange);

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
      <div className="columns">
        <div
          className="column"
          dangerouslySetInnerHTML={{ __html: props.metadata.description }}
        ></div>
      </div>

      <hr />

      <div className="columns">
        <div className="column">
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
        <div className="column">
          <DateRangePicker
            focusedInput={state.focusedInput}
            isOutsideRange={() => false}
            displayFormat="YYYY-MM-DD"
            onDatesChange={onDatesChange}
            onFocusChange={onFocusChange}
            startDate={selectedDate.startDate}
            endDate={selectedDate.endDate}
          />
        </div>
        <div className="buttons">
          <button className="button is-success" onClick={resetDateRange}>
            <span className="icon is-small">
              <i className="fas fa-sync"></i>
            </span>
            <span>Reset (dates)</span>
          </button>
        </div>
      </div>

      <hr />

      <div className="columns">
        <div className="column">
          <Resizable>
            <ChartContainer
              timeRange={
                new TimeRange([selectedDate.startDate, selectedDate.endDate])
              }
              // minTime={state.timerange.begin().log()}
              // minTime={state.timerange.end().log()}
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
                    series={state.sts.series.crop(state.timerange)}
                    interpolation="curveBasis"
                  />
                </Charts>
                <YAxis
                  id="y"
                  label="Price ($)"
                  min={state.sts.series.crop(state.timerange).min("close")}
                  max={state.sts.series.crop(state.timerange).max("close")}
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
                    series={state.sts.seriesVolume.crop(state.timerange)}
                  />
                </Charts>
                <YAxis
                  id="y"
                  label="Volume"
                  min={state.sts.seriesVolume
                    .crop(state.timerange)
                    .min("volume")}
                  max={state.sts.seriesVolume
                    .crop(state.timerange)
                    .max("volume")}
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
