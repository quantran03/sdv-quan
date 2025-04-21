import * as d3 from "d3";
import * as preprocess from "./d3/preprocess";

preprocess.loadData<AthleteEvent>('./data/olympics_dataset.csv')
    .then(async (value) => {
        return;
    });