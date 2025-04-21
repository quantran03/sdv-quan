import * as preprocess from "./d3/preprocess";
import * as draw from "./d3/draw"

preprocess.process('./data/olympics_dataset.csv')
    .then(async (value) => {
        draw.multiLineGraph(value);
    });