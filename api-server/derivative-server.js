import express from 'express';

export const router_derivative = express.Router();

const app_id = 'YU83PL-H7P4JR4JVK';


// GET ENTRYPOINT
router_derivative.get('/', function (req, res, next) {
    res.setHeader('Content-Type', 'text/plain');
    console.log('Calculating derivative of ', req.query.function);
    next();
})


// MATH FUNCTION VALIDATION MIDDLEWARE
router_derivative.use('/', async function (req, res, next) {
    //console.log(`REQUEST PATH: ${req.path}`);
    //console.log(`REQUEST PARAM: ${req.params.name}`);
    try {
        const math_query = encode_uri(req.query.function);
        const wolfram_result = await wolfram_derivative(math_query);
        const result_encoded = encode_uri(wolfram_result);
        console.log(`Calculated Derivative: ${wolfram_result}`);
        res.end(result_encoded);
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
    //console.debug(`Encoded ${string} to ${converted}`);
    return converted;
}

async function wolfram_derivative(function_string) {
    try {
        const request_config = {
            method: "GET",
            headers: {
                Accept: "text/plain"
            }
        }
        const request_uri = `http://api.wolframalpha.com/v1/result?i=derivative+of+${function_string}&appid=${app_id}`;
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
            //console.debug(`Response status: ${response.status}`);
            let response_body = await response.text();
            //console.debug(`Wolfram feedback: ${response_body}`);
            throw {name: "NetworkError", message: "HTTP response was not ok"}
        } else {
            //console.log(`Status: ${response.status}`);
            let response_data = await response.text();
            //console.log(`Message: ${response_data}`);
            return response_data;
        }
    }  catch (error) {
        //console.error(`Catched error: ${error}`);
        throw error;
    }  
}
