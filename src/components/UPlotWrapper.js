import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

const UPlotWrapper = ({ ticker, data, options }) => {
  let plotRef = useRef();
  let plot = null;

  useEffect(() => {
    plot = null;
    plot = new uPlot(options, data, plotRef.current);
    return function cleanup() {
      plot = null;
      plotRef = null;
    };
  }, [ticker]);

  return (
    <div>
      <div ref={plotRef} />
    </div>
  );
};

export default UPlotWrapper;
