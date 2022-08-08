/*

*Module Parameters:
   1. sensor id
   2. year and month 
*Program flow
   1. get data of first day :response.data
   2. store data to respective value data types array
   3. query 'next' pagination value and repeat step 2 until 'next' key has a null value
   4.  if 'next' equals null, get the mean value for each data type
   5. repeat steps 1-4 until 'next' key value is nulls
       


*/

require("dotenv").config();
const moment = require("moment");
const axios = require("axios");
const fs = require("fs");
const api = process.env.SENSORS_API;

let p1 = [];
let p2 = [];
let p0 = [];
const PM_AVG = [];
let count = 1;
const nextpages = [];
const options = {
  headers: {
    Authorization: `Token ${process.env.AUTH_TOKEN}`,
  },
  json: true,
};
let next = "";

const logger = (file, data) => {
  let fdata = "";
  if (typeof data == "object") {
    for (let entry in data) fdata += data[entry] + "\n";
    data = fdata;
  }
  // console.log(fdata);
  const path = `./logs/${file}`;

  fs.truncate(path, (err) => {
    if (err) {
      console.log("Error truncating file: ", err.message);
      //? errors likely occurs if file does not exist
      //? fs.writeFile will create a new file if it does not exits so less need to throw err
      // throw err;
    }
    fs.writeFile(
      path,
      data,
      {
        flag: "a",
        encoding: "utf8",
      },
      (err) => {
        if (err) console.log("Error logging data: ", err.message);
        else {
          console.log("logged successfully");
        }
      }
    );
  });
};

const extractResults = (results) => {
  results.forEach((result) => {
    const sensordata = result.sensordatavalues;
    sensordata.forEach((data) => {
      // console.log(data.value_type)
      switch (data.value_type) {
        case "P2":
          p2.push(data.value);
          break;
        case "P1":
          p1.push(data.value);
          break;
        case "P0":
          p0.push(data.value);
          break;
      }
    });
  });
};

const getPM_AVG = (arr, valuetype, date) => {
  let data = arr.filter((val) => {
    if (Number(val)) return val;
  });
  data = data.map((val) => Number(val));
  const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
  PM_AVG.push([valuetype, avg, date]);
};

const monthAvgData = async (month, sensorId) => {
  let date = moment(month, "YYYY-MM-DD").local();
  const monthDays = date.daysInMonth();
  for (let day = 1; day <= monthDays; day++) {
    // const startOfDay = moment(date)
    //   .add(day - 1, "d")
    //   .utc()
    //   .toISOString();
    // let endOfDay = moment(date)
    //   .add(day - 1, "d")
    //   .utc()
    //   .endOf("day")
    //   .toISOString();

    const startOfDay = moment(date)
      .add(day - 1, "d")
      //TODO convert to utc
      .format();
    let endOfDay = moment(date)
      .add(day - 1, "d")
      .endOf("day")
      //TODO convert to utc
      .format();
    const params = {
      next_page: next,
      sensor: sensorId,
      sensor__public: 1,
      location__country: "",
      location__city: "",
      timestamp__gte: startOfDay,
      timestamp__lte: endOfDay,
    };

    while (next != null)//*! retrys next url indefinetly
     {
      try {
        const response = await axios.get(next ? next : api, {
          ...options,
          params: {
            ...(next ? "" : params),
          },
        });
        next = response.data.next;
        nextpages.push(next); //push to array for logging purposes
        extractResults(response.data.results);
      } catch (err) {
        console.log(err);
      }
    }
    getPM_AVG(p0, "P0", moment(startOfDay).format("YYYY-MM-DD"));
    getPM_AVG(p1, "P1", moment(startOfDay).format("YYYY-MM-DD"));
    getPM_AVG(p2, "P2", moment(startOfDay).format("YYYY-MM-DD"));
    p0 = [];
    p1 = [];
    p2 = [];
    console.log("End of day : ", count++);
    next = ""; //? reset next url to url after each day
  }

  logger("nextpages.txt", nextpages);
  logger("pmavg.csv", PM_AVG);
};

//? call to test //comment if exporting
monthAvgData("2022-07-01", 49);

module.exports = {
  monthAvgData,
}; //? Export as module
