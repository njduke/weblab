import express from 'express';
import { pipeline } from 'stream';

export const router_plot = express.Router();

const app_id = 'YU83PL-2KVLGLUJ6X';

router_plot.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'image/gif');
    next();
})


router_plot.use('/', async (req, res, next) => {
    try {
        const encoded_math = encode_uri(req.query.function);
        const wolfram_result = await wolfram_plot(encoded_math);
        pipeline(wolfram_result.body, res, (error) => {
            if (error) {
                console.error('Pipeline error: ', error);
                res.status(500).send('Internal server error');
            }
        })
    } catch (error) {
        if (error.name == "ApiError") {
            console.error(error.message);
            res.status(501).send("Math syntax unknown");
        }
        else if (error.name == "NetworkError") {
            console.error(error.message);
            res.status(503).send("Service unavailable");
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

async function wolfram_plot(encoded_function_string) {
    try {
        const request_config = {
            method: "GET",
            headers: {
                Accept: "image/gif"
            }
        }
        const request_uri = `http://api.wolframalpha.com/v1/simple?appid=${app_id}&i=plot+${encoded_function_string}`;
        //console.log(`Sending request to wolfram: ${request_uri}`);
        const response = await fetch(request_uri, request_config);
        if (response.status == 501) {
            throw {name: "ApiError", message: "The request input value cannot be interpreted by the API"}
        }
        else if (!response.ok) {
            //console.log(`Response status: ${response.status}`);
            let response_body = await response.text();
            //console.log(`Wolfram feedback: ${response_body}`);
            throw {name: "NetworkError", message: "HTTP response was not ok"}
        }
        else {
            //console.log(`Status: ${response.status}`);
            return response;
        }
    } catch (error) {
        //console.log(`Catched error: ${error}`);
        throw error;
    }
}
