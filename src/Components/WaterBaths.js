// Plots current bath temperatures and heater statuses
// As well as searching bath history for sensor logs

import React from 'react';
import Material from '../MaterialTheme.js';
import { BathCard, LastUpdatedFooter } from '../Workers/Charts.js';
import BathHistoryCard from '../Workers/BathHistory.js';

const WaterBaths = props => {
  return (
    <Material className='container-fluid'>
      <div className='row'>
        <div className='col-sm-5 top-buffer'>
          <BathCard title='Bath Temperature'
            data={props.data} />
        </div>
        <div className='col-sm-7 top-buffer'>
          <BathHistoryCard labHistory={props.labHistory} />
        </div>
      </div>
      <LastUpdatedFooter updated={props.data.datetime} />
    </Material>
  )
}

export default WaterBaths;
