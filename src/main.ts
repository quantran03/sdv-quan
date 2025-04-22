import * as preprocess from "./d3/preprocess";
import * as draw from "./d3/draw"

let origData: MedalAgg[] | undefined = undefined;

preprocess.process('./data/olympics_dataset.csv')
    .then(async (value) => {
        origData = value;
        draw.multiLineGraph(value);
    }
);


document.addEventListener("DOMContentLoaded", () => {
    const inputTopTeamThreshold = document.getElementById("teamInput") as HTMLInputElement | null;
    const checkboxEl = document.getElementById("topTeams") as HTMLInputElement | null;
    const checkboxCum = document.getElementById("cum") as HTMLInputElement | null;
    const inputYearStart = document.getElementById("yearStart") as HTMLInputElement | null;
    const inputYearEnd = document.getElementById("yearEnd") as HTMLInputElement | null;
    
    const handleInputUpdate = () => {
        if (origData && checkboxEl && inputTopTeamThreshold && inputYearStart && inputYearEnd && checkboxCum) {
            if (+inputYearStart.value > +inputYearEnd.value) return;
            let filteredData = preprocess.filterByYearRange(origData, +inputYearStart.value, +inputYearEnd.value)
            if (checkboxCum.checked) {
                filteredData = preprocess.getCumSum(filteredData);
            }
            if (checkboxEl.checked) {
                const newData = preprocess.filterToOnlyTopTeams(filteredData, +inputTopTeamThreshold.value);
                draw.multiLineGraph(newData);
            } else {
                draw.multiLineGraph(filteredData);
            }
        }
    };

    
    if (inputTopTeamThreshold) {
        // Fires on spinner (arrow) button use or when value actually changes
        inputTopTeamThreshold.addEventListener("change", handleInputUpdate);
    }
  
    if (checkboxEl) {
      checkboxEl.addEventListener("change", handleInputUpdate);
    }

    if (checkboxCum) {
        checkboxCum.addEventListener("change", handleInputUpdate);
    }

    if (inputYearEnd) {
        // Fires on spinner (arrow) button use or when value actually changes
        inputYearEnd.addEventListener("change", handleInputUpdate);
    }

    if (inputYearStart) {
        // Fires on spinner (arrow) button use or when value actually changes
        inputYearStart.addEventListener("change", handleInputUpdate);
    }
  });
