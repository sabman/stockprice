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

import React from "react";
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

class Stockchart extends React.Component {
  constructor(props) {
    super(props);
    this.props.metadata.log("metadata");
    this.state = {
      mode: "log",
      timerange: new TimeRange([
        props.metadata["oldest_available_date"],
        props.metadata["newest_available_date"],
      ]),
    };
    this.state.timerange.log("metadata range");

    let { data, metadata } = this.props;
    this.sts = StockTimeSeries({ data, metadata });
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.tickerCode !== this.props.tickerCode) {
      let { data, metadata } = newProps;
      this.sts = StockTimeSeries({ data, metadata });
      return true;
    }
  }

  handleTimeRangeChange = (timerange) => {
    this.setState({ timerange });
  };

  setModeLinear = () => {
    this.setState({ mode: "linear" });
  };

  setModeLog = () => {
    this.setState({ mode: "log" });
  };

  renderChart = () => {
    const { timerange } = this.state;
    const croppedSeries = this.sts.series.crop(timerange);
    const croppedVolumeSeries = this.sts.seriesVolume.crop(timerange);
    return (
      <ChartContainer
        timeRange={timerange}
        hideWeekends={true}
        enablePanZoom={true}
        onTimeRangeChanged={this.handleTimeRangeChange}
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
            type={this.state.mode}
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
    );
  };

  render() {
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
            <h3>{this.props.metadata.name}</h3>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-md-12" style={{ fontSize: 14, color: "#777" }}>
            <span
              style={this.state.mode === "log" ? linkStyleActive : linkStyle}
              onClick={this.setModeLinear}
            >
              Linear
            </span>
            <span> | </span>
            <span
              style={this.state.mode === "linear" ? linkStyleActive : linkStyle}
              onClick={this.setModeLog}
            >
              Log
            </span>
          </div>
        </div>

        <hr />

        <div className="row">
          <div className="col-md-12">
            <Resizable>{this.renderChart()}</Resizable>
          </div>
        </div>
      </div>
    );
  }
}

export default Stockchart;
