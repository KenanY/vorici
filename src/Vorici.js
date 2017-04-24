'use strict';

import chromatic from 'chromatic-orb';
import React from 'react';
import round from 'round-to';
import geovar from 'geometric-variance';
import Griddle from 'griddle-react';
import socketColorsChance from 'socket-colors-chance';
import assign from 'lodash.assign';

import NumberGrouper from './NumberGrouper';
import PercentValue from './PercentValue';

const voriciRecipes = [
  {red: 0, green: 0, blue: 0, cost: 0, description: 'Drop Chance'},
  {red: 1, green: 0, blue: 0, cost: 4, description: '1R'},
  {red: 0, green: 1, blue: 0, cost: 4, description: '1G'},
  {red: 0, green: 0, blue: 1, cost: 4, description: '1B'},
  {red: 2, green: 0, blue: 0, cost: 25, description: '2R'},
  {red: 0, green: 2, blue: 0, cost: 25, description: '2G'},
  {red: 0, green: 0, blue: 2, cost: 25, description: '2B'},
  {red: 1, green: 1, blue: 0, cost: 15, description: '1R1G'},
  {red: 1, green: 0, blue: 1, cost: 15, description: '1R1B'},
  {red: 0, green: 1, blue: 1, cost: 15, description: '1G1B'},
  {red: 3, green: 0, blue: 0, cost: 285, description: '3R'},
  {red: 0, green: 3, blue: 0, cost: 285, description: '3G'},
  {red: 0, green: 0, blue: 3, cost: 285, description: '3B'},
  {red: 2, green: 1, blue: 0, cost: 100, description: '2R1G'},
  {red: 2, green: 0, blue: 1, cost: 100, description: '2R1B'},
  {red: 1, green: 2, blue: 0, cost: 100, description: '1R2G'},
  {red: 0, green: 2, blue: 1, cost: 100, description: '2G1B'},
  {red: 1, green: 0, blue: 2, cost: 100, description: '1R2B'},
  {red: 0, green: 1, blue: 2, cost: 100, description: '1G2B'}
];

function std(p) {
  return Math.sqrt(geovar(p));
}

function generateRow(type, p, cost) {
  return {
    'Craft Type': type,
    'Success Chance': round(100 * p, 5),
    'Average Attempts': round(1 / p, 1),
    'Cost per Try': cost,
    'Average Cost': round(cost / p, 1),
    'Standard Deviation': round(std(p), 2)
  };
}

function numericalSort(x) {
  return parseInt(x, 10);
}

const columnMetadata = [
  {columnName: 'Success Chance', customComponent: PercentValue},
  {columnName: 'Average Attempts', customComponent: NumberGrouper},
  {columnName: 'Cost per Try'},
  {columnName: 'Average Cost', customComponent: NumberGrouper},
  {columnName: 'Standard Deviation', customComponent: NumberGrouper}
];

columnMetadata.forEach((column) => {
  column.customCompareFn = numericalSort;
});

class Vorici extends React.Component {
  constructor() {
    super();
    this.state = {
      sockets: null,
      strength: null,
      dexterity: null,
      intelligence: null,
      red: null,
      green: null,
      blue: null
    };
  }

  onChange(type, e) {
    const newState = {};
    newState[type] = parseInt(e.target.value, 10);
    this.setState(newState);
  }

  render() {
    const results = [];
    try {
      results.push(generateRow('Chromatic', chromatic(this.state), 1));
    }
    catch (e) {
      // invalid number of sockets or desired colors, don't push this row
    }

    voriciRecipes.forEach(r => {
      const opts = assign({}, this.state);

      // invalid number of sockets, don't add this row
      if (opts.sockets < 1) {
        return;
      }

      opts.red -= r.red;
      opts.green -= r.green;
      opts.blue -= r.blue;
      opts.sockets = opts.sockets - r.red - r.green - r.blue;
      try {
        results.push(generateRow(r.description, socketColorsChance(opts), r.cost));
      }
      catch (e) {
        // invalid number of sockets or desired colors, don't push this row
        return;
      }
    });

    return (
    <div>
      <h1>Vorici Chromatic Calculator</h1>
      <table className="formTable">
        <thead>
          <tr>
            <td className="rowTitle"></td>
            <td className="rowField"></td>
            <td className="rowField">Sockets</td>
            <td className="rowField"></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="rowTitle"></td>
            <td className="rowField"></td>
            <td className="rowField">
              <input className="entry white"
                onChange={this.onChange.bind(this, 'sockets')}
                value={this.state.sockets || ''}
                placeholder="#"/>
            </td>
          </tr>
          <tr>
            <td className="rowTitle">Requirements</td>
            <td className="rowField">
              <input className="entry red"
                onChange={this.onChange.bind(this, 'strength')}
                value={this.state.strength || ''}
                placeholder="str"/>
            </td>
            <td className="rowField">
              <input className="entry green"
                onChange={this.onChange.bind(this, 'dexterity')}
                value={this.state.dexterity || ''}
                placeholder="dex"/>
            </td>
            <td className="rowField">
              <input className="entry blue"
                onChange={this.onChange.bind(this, 'intelligence')}
                value={this.state.intelligence || ''}
                placeholder="int"/>
            </td>
          </tr>
          <tr>
            <td className="rowTitle">Desired Colors</td>
            <td className="rowField">
              <input className="entry red"
                onChange={this.onChange.bind(this, 'red')}
                value={this.state.red || ''}
                placeholder="R"/>
            </td>
            <td className="rowField">
              <input className="entry green"
                onChange={this.onChange.bind(this, 'green')}
                value={this.state.green || ''}
                placeholder="G"/>
            </td>
            <td className="rowField">
              <input className="entry blue"
                onChange={this.onChange.bind(this, 'blue')}
                value={this.state.blue || ''}
                placeholder="B"/>
            </td>
          </tr>
        </tbody>
      </table>
      <Griddle
        useGriddleStyles={false}
        showPager={false}
        resultsPerPage={Infinity}
        initialSort={'Average Cost'}
        results={results}
        columnMetadata={columnMetadata}/>
    </div>
    );
  }
}

export default Vorici;
