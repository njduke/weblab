import express from 'express';
import cors from 'cors';
import { router_derivative } from './derivative-server.js';
import { router_x_intercept } from './x-intercept-server.js';
import { router_y_intercept } from './y-intercept-server.js';
import { router_plot } from './plot-server.js';
import { router_trigonometrics } from './trigonometrics.js';


const port = 8001;
const app = express();

app.use(cors({ origin: '*'}));

app.use('/derivative', router_derivative);
app.use('/x-intercept', router_x_intercept);
app.use('/y-intercept', router_y_intercept);
app.use('/plot', router_plot);
app.use('/trigonometrics', router_trigonometrics)

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})


