// Creates a grid of cycling progress for every Bitrode
// Can easily be reused to display data as a function of test, rather than Bitrode

import React from 'react';
import Material from '../MaterialTheme.js';
import { CyclingCard, onlyUnique, LastUpdatedFooter } from '../Workers/Charts.js';

class CyclingProgress extends React.Component {
  render() {
    // Dataset is empty, wait for promise to be fulfilled
    if (this.props.data.length===0) {
      return null
    }

    const GroupList = this.props.data.bitrode
    .map(o => o[this.props.groupBy])
    .filter(arr => arr!== undefined)
    .filter(onlyUnique)

    let Cards = []
    while (GroupList.length) {
      let left = GroupList[0];
      let right = GroupList[1];
      Cards.push(
        <div className='row' key={left + right}>
          <div className='col-sm-6 top-buffer'>
            <CyclingCard title={this.props.groupBy + ' ' + left} key={left} labs={this.props.labs}
              data={this.props.data} column={this.props.groupBy} val={left} />
          </div>
          <div className='col-sm-6 top-buffer'>
            <CyclingCard title={this.props.groupBy + ' ' + right} key={right} labs={this.props.labs}
              data={this.props.data} column={this.props.groupBy} val={right} />
          </div>
        </div>
      );
      GroupList.splice(0,2);
    }

    return (
      <Material className='container-fluid'>
        {Cards}
        <LastUpdatedFooter updated={this.props.data.bitrodeupdated} />
      </Material>
    );
  }
}

export default CyclingProgress;
