import express from "express";

export const router_trigonometrics = express.Router();
const app_id = "YU83PL-H7P4JR4JVK";

router_trigonometrics.get("/amplitude", (req, res, next) => {
  res.setHeader("Content-Type", "text/plain");
  console.log("Calculating amplitude of ", req.query.function);
  next();
});

router_trigonometrics.get("/periodicy", (req, res, next) => {
  res.setHeader("Content-Type", "text/plain");
  console.log("Calculating periodicy of ", req.query.function);
  next();
});

router_trigonometrics.use("/amplitude", async (req, res, next) => {
    try {
        if (!checkTrigonometricFunction(req.query.function)) {
            console.log("Supplied math function is not in trigonometric family");
            res.status(501).send("Math syntax error");
          } else {
            const amplitude = await calculateAmplitude(req.query.function);
            if (amplitude === null) {
              console.log(
                `Could not calculate amplitude of trigonometric function ${req.query.function}`
              );
              res.status(503).send("Server error");
            } else {
              console.log(
                `Calculated amplitude ${amplitude} of trigonometric function ${req.query.function}`
              );
              res.status(200).send(amplitude);
            }
          }
    } catch (error) {
        if (error.status === 501) {
            console.error(`Math syntax error in ${req.query.function}`);
            res.status(501).send("Math syntax error");
        } else {
            console.error(`Unhandled error: ${error.message}`);
            res.status(503).send("Server error")
        }
    }
});

router_trigonometrics.use("/periodicy", async (req, res, next) => {
    try {
        if (!checkTrigonometricFunction(req.query.function)) {
            console.log("Supplied math function is not in trigonometric family");
            res.status(501).send("Math syntax error");
          } else {
            const periodicy = await calculatePeriodicy(req.query.function);
            if (periodicy === null) {
              console.error(
                `Could not calculate periodicy of trigonometric function ${req.query.function}`
              );
              res.status(503).send("Math syntax error");
            } else {
              console.log(
                `Calculated periodicy ${periodicy} of trigonometric function ${req.query.function}`
              );
              res.status(200).send(periodicy);
            }
          }
    } catch (error) {
        if (error.status === 501) {
            console.error(`Math syntax error in ${req.query.function}`);
            res.status(501).send("Math syntax error");
        } else {
            console.error(`Unhandled error: ${error.message}`);
            res.status(503).send("Server error");
        }
    }
});


async function calculateAmplitude(trigoFunction) {
  try {
    const regex = /(?:sin|cos|tan)\b/i;
    const matchIndex = trigoFunction.search(regex);
    if (matchIndex !== -1) {
      //console.log(trigoFunction.substring(0, matchIndex));
      const prefix = trigoFunction.substring(0, matchIndex);
      if (prefix.length < 1) {
        return '1';
      }
      const wolfram_result = await wolframRaw(encodeURIComponent(prefix));
      return wolfram_result;
    } else {
        console.error(`Could not identify amplitude parameters in trigonometric function ${trigoFunction}`);
      return null;
    }
  } catch (error) {
    throw error;
  }
}

async function calculatePeriodicy(trigoFunction) {
  try {
    const regex = /(?:sin|cos|tan)\(/i;
    let matchIndex = trigoFunction.search(regex);
    console.debug(`matchIndex: ${matchIndex}`);
    if (matchIndex !== -1) {
        matchIndex = matchIndex + 4
        const innerFuncRaw = trigoFunction.slice(
        matchIndex,
        trigoFunction.length
      );
      console.debug(`innerFuncRaw: ${innerFuncRaw}`);
      const innerFunctionIndexEnd = innerFuncRaw.search(/\)/);
      const innerFunction = innerFuncRaw.substring(0, innerFunctionIndexEnd);
      console.debug(`innerFunction: ${innerFunction}`);
      const periodRawIndexEnd = innerFunction.search(/[a-zA-Z]/);
      const periodRaw = innerFunction.substring(0, periodRawIndexEnd);
      if (periodRaw.length < 1) {
        return '2π';
      }
      console.debug(`Period raw: ${periodRaw}`);
      const period_calculation = `2*pi/${periodRaw}`;
      const wolfram_result = await wolframRaw(encodeURIComponent(period_calculation));
      console.log(`Calculated periodicy ${wolfram_result} of ${trigoFunction}`);
      return wolfram_result; // actual period
    } else {
        console.error(`Could not identify periodicy parameters in trigonometric function ${trigoFunction}`);
      return null;
    }
  } catch (error) {
    throw error;
  }
}

function checkTrigonometricFunction(trigoFunction) {
  const regex = /(?:cos|sin|tan)/g;
  const matches = trigoFunction.match(regex);
  const count = matches ? matches.length : 0;
  //console.debug(`Matches in ${trigoFunction}: ${count}`);
  if (count != 1) {
    return false;
  } else {
    return true;
  }
}

async function wolframRaw(rawMath) {
  try {
    const request_config = {
      method: "GET",
      headers: {
        Accept: "text/plain",
      },
    };
    const request_uri = `http://api.wolframalpha.com/v1/result?i=${rawMath}&appid=${app_id}`;
    //console.debug(`Wolfram Request URI: ${request_uri}`);
    const response = await fetch(request_uri, request_config);
    if (response.status == 501) {
      const response_data = await response.text();
      if (response_data == "Wolfram|Alpha did not understand your input") {
        throw {
          name: "UserInputError",
          message: "Wolfram api request syntax error",
        };
      } else if (response_data == "No short answer available") {
        throw { name: "MathSyntaxError", message: "Math syntax unknown" };
      }
    } else if (!response.ok) {
      //console.debug(`Response status: ${response.status}`);
      let response_body = await response.text();
      //console.debug(`Wolfram feedback: ${response_body}`);
      throw { name: "NetworkError", message: "HTTP response was not ok" };
    } else {
      //console.debug(`Status: ${response.status}`);
      let response_data = await response.text();
      //console.debug(`Message: ${response_data}`);
      return response_data;
    }
  } catch (error) {
    console.error(`Catched error: ${error}`);
    throw error;
  }
}


