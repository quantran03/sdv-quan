import * as preprocess from "./d3/preprocess";
import * as multilinegraph from "./d3/multilinegraph"
import * as streamgraph from "./d3/streamgraph";

let origData: MedalAgg[] | undefined = undefined;
let origDataCumSum: MedalAgg[] | undefined = undefined;

preprocess.process('./data/olympics_dataset.csv')
    .then(async (value) => {
        origData = value;
        origDataCumSum = preprocess.getCumSum(value);
        multilinegraph.draw(origData);
        streamgraph.draw(origDataCumSum);
    }
);


document.addEventListener("DOMContentLoaded", () => {
    const inputTopTeamThreshold = document.getElementById("teamInput") as HTMLInputElement | null;
    const checkboxTopTeams = document.getElementById("topTeams") as HTMLInputElement | null;
    const checkboxCum = document.getElementById("cum") as HTMLInputElement | null;
    const inputYearStart = document.getElementById("yearStart") as HTMLInputElement | null;
    const inputYearEnd = document.getElementById("yearEnd") as HTMLInputElement | null;

    const inputTopTeamThreshold2 = document.getElementById("teamInput2") as HTMLInputElement | null;
    const checkboxTopTeams2 = document.getElementById("topTeams2") as HTMLInputElement | null;
    const inputYearStart2 = document.getElementById("yearStart2") as HTMLInputElement | null;
    const inputYearEnd2 = document.getElementById("yearEnd2") as HTMLInputElement | null;
    
    const handleInputUpdate = () => {
        if (origData && checkboxTopTeams && inputTopTeamThreshold && inputYearStart && inputYearEnd && checkboxCum) {
            if (+inputYearStart.value > +inputYearEnd.value) return;
            let filteredData = preprocess.filterByYearRange(origData, +inputYearStart.value, +inputYearEnd.value)
            if (checkboxCum.checked) {
                filteredData = preprocess.getCumSum(filteredData);
            }
            if (checkboxTopTeams.checked) {
                const newData = preprocess.filterToOnlyTopTeams(filteredData, +inputTopTeamThreshold.value);
                multilinegraph.draw(newData);
            } else {
                multilinegraph.draw(filteredData);
            }
        }
    };

    const handleInputUpdateStacked = () => {
        if (origDataCumSum && checkboxTopTeams2 && inputTopTeamThreshold2 && inputYearStart2 && inputYearEnd2) {
            if (+inputYearStart2.value > +inputYearEnd2.value) return;
            let filteredData = preprocess.filterByYearRange(origDataCumSum, +inputYearStart2.value, +inputYearEnd2.value)
            
            if (checkboxTopTeams2.checked) {
                const newData = preprocess.filterToOnlyTopTeams(filteredData, +inputTopTeamThreshold2.value);
                streamgraph.draw(newData);
            } else {
                streamgraph.draw(filteredData);
            }
        }
    }

    
    if (inputTopTeamThreshold && inputTopTeamThreshold2) {
        inputTopTeamThreshold.addEventListener("change", handleInputUpdate);
        inputTopTeamThreshold2.addEventListener("change", handleInputUpdateStacked);
    }
  
    if (checkboxTopTeams && checkboxTopTeams2) {
        checkboxTopTeams.addEventListener("change", handleInputUpdate);
        checkboxTopTeams2.addEventListener("change", handleInputUpdateStacked);
    }

    if (checkboxCum) {
        checkboxCum.addEventListener("change", handleInputUpdate);
    }

    if (inputYearEnd && inputYearEnd2) {
        inputYearEnd.addEventListener("change", handleInputUpdate);
        inputYearEnd2.addEventListener("change", handleInputUpdateStacked)
    }

    if (inputYearStart && inputYearStart2) {
        inputYearStart.addEventListener("change", handleInputUpdate);
        inputYearStart2.addEventListener("change", handleInputUpdateStacked)
    }
  });
