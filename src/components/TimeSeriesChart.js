import React, { useEffect, useState } from "react";
import moment from "moment";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { DateRangePicker } from "react-dates";
// Pond
import { TimeRange } from "pondjs";

// Imports from the charts library
import {
  ChartContainer,
  ChartRow,
  Charts,
  YAxis,
  LineChart,
  BarChart,
  Resizable,
  EventMarker,
} from "react-timeseries-charts";
import StockTimeSeries from "../services/StockTimeSeries";

const NullMarker = (props) => {
  return <g />;
};

const Stockchart = (props) => {
  // props
  const { data, metadata, tickerCode } = props;

  // State
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
  const [trackerState, setTrackerState] = useState({
    tracker: null,
    trackerValue: "-- USD",
    trackerEvent: null,
  });

  // lifecycle hooks:
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

  // event handlers
  const handleTrackerChanged = (t) => {
    if (t && croppedSeries) {
      const e = croppedSeries.atTime(t);
      const eventTime = new Date(
        e.begin().getTime() + (e.end().getTime() - e.begin().getTime()) / 2
      );
      const eventValue = e.get("close");
      const v = `${eventValue} USD`;
      setTrackerState({ tracker: eventTime, trackerValue: v, trackerEvent: e });
    } else {
      setTrackerState({
        tracker: null,
        trackerValue: null,
        trackerEvent: null,
      });
    }
  };

  const handleTimeRangeChange = (timerange) => {
    setSelectedDate({
      startDate: moment(timerange.begin()),
      endDate: moment(timerange.end()),
    });
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
  };

  const onFocusChange = (focusedInput) => {
    setState({ ...state, focusedInput });
  };

  const resetDateRange = () => {
    const timerange = new TimeRange([
      metadata["oldest_available_date"],
      metadata["newest_available_date"],
    ]);
    setSelectedDate({
      startDate: moment(timerange.begin()),
      endDate: moment(timerange.end()),
    });
    setState({ ...state, timerange });
  };

  // helpers
  let croppedSeries = state.sts.series.crop(state.timerange);
  let croppedVolumeSeries = state.sts.seriesVolume.crop(state.timerange);

  const renderMarker = () => {
    if (!trackerState.tracker) {
      return <NullMarker />;
    }
    return (
      <EventMarker
        type="flag"
        axis="y"
        event={trackerState.trackerEvent}
        column="close"
        info={[{ label: "closing", value: trackerState.trackerValue }]}
        infoTimeFormat="%B %d, %Y"
        infoWidth={120}
        markerRadius={2}
        markerStyle={{ fill: "black" }}
      />
    );
  };
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
      <hr />
      <nav className="level">
        <div className="level-left">
          <p className="level-item">
            <DateRangePicker
              focusedInput={state.focusedInput}
              isOutsideRange={() => false}
              displayFormat="YYYY-MM-DD"
              onDatesChange={onDatesChange}
              onFocusChange={onFocusChange}
              startDate={selectedDate.startDate}
              endDate={selectedDate.endDate}
              small
            />
          </p>
          <p className="level-item">
            <button
              className="button is-small is-success"
              onClick={resetDateRange}
            >
              <span className="icon is-small">
                <i className="fas fa-sync"></i>
              </span>
              <span>Reset (dates)</span>
            </button>
          </p>
        </div>
        <div className="level-right">
          <p className="level-item">
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
          </p>
        </div>
      </nav>

      <hr />
      <div className="columns">
        <div className="column">
          <Resizable>
            <ChartContainer
              timeRange={
                new TimeRange([selectedDate.startDate, selectedDate.endDate])
              }
              hideWeekends={true}
              enablePanZoom={true}
              onTimeRangeChanged={handleTimeRangeChange}
              timeAxisStyle={{ axis: { fill: "none", stroke: "none" } }}
              onTrackerChanged={handleTrackerChanged}
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
                  {renderMarker()}
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

      <hr />
      <div className="columns">
        <div
          className="column"
          dangerouslySetInnerHTML={{ __html: props.metadata.description }}
        ></div>
      </div>
    </div>
  );
};

export default Stockchart;
