// Pond
import { Collection, TimeSeries, TimeEvent, IndexedEvent } from "pondjs";
import moment from "moment";

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

export default StockTimeSeries;
