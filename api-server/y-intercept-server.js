import express from 'express';

export const router_y_intercept = express.Router();

const app_id = 'YU83PL-H7P4JR4JVK';

// GET ENTRYPOINT
router_y_intercept.get('/', function(req, res, next) {
    console.log('y-intercept calculation request: ' + req.ip);
    next();
})

router_y_intercept.use('/', async function (req, res, next) {
    try {
        const math_query = encode_uri(req.query.function);
        const wolfram_result = await wolfram_y_intercept(math_query);
        const result_encoded = encode_uri(wolfram_result);
        console.log(`Calculated Y-Intercept: ${wolfram_result}`);
        res.status(200).end(result_encoded);
    }
    catch (error) {
        if (error.name == "MathSyntaxError") {
            console.error(error.message);
            res.status(501).send("Math syntax unknown");
        }
        else if (error.name == "NetworkError") {
            console.error(error.message);
            res.status(503).send("Service unavailable");
        }
        else if (error.name == "UserInputError") {
            console.error(error.message);
            res.status(501).send("User input unknown");
        }
        else {
            console.error(`Other error name: ${error.name}`);
            console.error(`Other error message: ${error.message}`);
            res.status(500).end();
        }
    }
})

function encode_uri(string) {
    let converted = encodeURIComponent(string).replace( // also encode () brackets for URI: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
        /[()]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    //console.log(`Encoded ${string} to ${converted}`);
    return converted;
}


async function wolfram_y_intercept(function_string) {
    try {
        const request_config = {
            method: "GET",
            headers: {
                Accept: "text/plain"
            }
        }
        const request_uri = `http://api.wolframalpha.com/v1/result?i=y+intercept+of+${function_string}&appid=${app_id}`;
        //console.log(`Sending request: ${request_uri}`);
        const response = await fetch(request_uri, request_config);
        if (response.status == 501) {
            const response_data = await response.text();
            if (response_data == 'Wolfram|Alpha did not understand your input') {
                throw {name: "UserInputError", message: "Wolfram api request syntax error"}
            }
            else if (response_data == 'No short answer available') {
                throw {name: "MathSyntaxError", message: "Math syntax unknown"}
            }
        }
        else if (!response.ok) {
            //console.log(`Wolfram feedback: ${response_body}`);
            throw {name: "NetworkError", message: "HTTP response was not ok"}
        } else {
            //console.log(`Status: ${response.status}`);
            let response_data = await response.text();
            //console.log(`Message: ${response_data}`);
            return response_data;
        }
    }  catch (error) {
        //console.log(`Catched error: ${error}`);
        throw error;
    } 
}