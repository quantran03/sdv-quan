import * as d3 from "d3";
import * as preprocess from "./d3/preprocess";

preprocess.loadData<AthleteEvent>('./data/olympics_dataset.csv')
    .then((value) => {
        console.log(value);
        console.log(typeof value);
    });