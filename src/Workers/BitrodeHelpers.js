// Functions to aid with importing and charting Bitrode cycling data
import { onlyUnique } from './Charts';
import { hclColors } from './HistoryComponents';

// Replace the short Bitrode name with the full color name
const BitrodeName = {
  M: 'Midnight',
  P: 'Pink',
  S: 'Silver',
  R: 'Red',
  O: 'Orange',
  Y: 'Yellow',
  G: 'Green',
  B: 'Blue',
  W: 'White',
  F: 'Fuchsia'
}

// Add extra derivative columns to the Bitrode dataset to help with organization
function BitrodeParse(resjson) {
  resjson.bitrode.map(circuit => {
    const splitName = circuit['Circuit Name'].split(' ', 4);
    circuit.Bitrode = BitrodeName[circuit['Circuit Name'][0]] || circuit['Circuit Name'][0];
    circuit.Circuit = splitName[0];
    // Batteries that are both disconnected and are done are not under test
    circuit.Test = circuit.Voltage>0.1 || circuit.Mode!=='DONE' ?
      splitName[1] : undefined;
    circuit['Battery ID'] = splitName[2] + ' ' + splitName[3];
    return circuit
  })
  return resjson
}

// Add color and linetype keys to dataset for Bitrode cycling charting
// Each color is a battery type and each line type is a battery ID
function BitrodeColorLine(filtered) {
  // Sort dataset by Battery ID before doing anything else
  filtered.sort((a,b) => a['Battery ID'] < b['Battery ID'] ? -1 : 1)
  // Array of unique battery types
  const typesUnique = filtered
  .map(circuit => {
    // Add the battery type in there as well
    circuit.Type = circuit['Battery ID'].split(' ',1)[0];
    return circuit
  })
  .map(circuit => circuit.Type)
  .filter(onlyUnique);
  // Array of colors to use in the graph
  const colors = hclColors(typesUnique.length, 0.6);
  const colorsLight = hclColors(typesUnique.length, 0.3);

  var colorLine = {}; // stores line dashes and colors
  var lineDash = 0; // tracks index of line dashes
  var lastType = -1; // tracks index of line colors (by type)

  // Iterate through every circuit and determine the color and line type
  filtered.forEach(circuit => {
    const type = typesUnique.indexOf(circuit.Type);
    // decide whether or not to reset the line type counter
    lineDash = type===lastType ? lineDash+1 : 0;
    // store the last type
    lastType = type;
    colorLine[circuit['Battery ID']] = {
      color: colors[type],
      colorLight: colorsLight[type],
      line: lineDash
    }
  })
  return colorLine
}

export { BitrodeParse, BitrodeColorLine };
