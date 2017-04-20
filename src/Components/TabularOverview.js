// This module contains the raw data from the Bitrode local.html
// Cleaned up and filterable in a nice BS table
// To do: Figure out why toggle labels look so ugly on mobile. Should roboto be abandoned?

import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import '../css/bootstrap.min.css';
import Material from '../MaterialTheme';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import { LastUpdatedFooter } from '../Workers/Charts';

const columns = [
  /*'Bitrode',*/ 'Circuit', 'Battery ID', 'Test',
  'Mode', 'Total Time', 'Cycle',
  'Step', 'Step time', 'Current',
  'Voltage', 'Amp-Hours', 'Assignable Variable 1'
]

// Generate each row using map
const Row = props => (
  <TableRow hoverable={true}>
    {columns.map(column => <TableRowColumn key={column}> {props.row[column]} </TableRowColumn>)}
  </TableRow>
)

class TabularOverview extends React.Component {
  state = {showActive: true, showFree: true, search: ''};

  handleActive = () => this.setState({showActive: !this.state.showActive});
  handleFree = () => this.setState({showFree: !this.state.showFree});
  handleSearch = (event, search) => this.setState({search});

  render() {
    // Dataset is empty, wait for promise to be fulfilled
    if (this.props.data.length===0) {
      return null
    }

    // Filter down the dataset based on the checkboxes
    const filtered = filterTable(this.props.data.bitrode,this.state.showActive,this.state.showFree,this.state.search)
    return (
      <Material className='container-fluid'>
        <div className='row'>
          <div className='col-sm-4 top-buffer'>
            <Checkbox label='Active Circuits' defaultChecked onCheck={this.handleActive} />
          </div>
          <div className='col-sm-4 top-buffer'>
            <Checkbox label='Free Circuits' defaultChecked onCheck={this.handleFree} />
          </div>
          <div className='col-sm-4'>
            <TextField floatingLabelText='Search' onChange={this.handleSearch} />
          </div>
        </div>
        <Table height='80vh'>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              {columns.map(column => <TableHeaderColumn key={column}> {column} </TableHeaderColumn>)}
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {filtered.map((row, i) => <Row key={i} row={row}/>)}
          </TableBody>
        </Table>
        <div className='container-fluid'>
          <LastUpdatedFooter updated={this.props.data.bitrodeupdated} />
        </div>
      </Material>
    )
  }
}

// Filter the table based on toggles and search
function filterTable(table,Active,Free,Search) {
  table = filterMode(table,Active,Free)
  return filterSearch(table,Search)
}

// Filter down the table based on the Mode toggles
function filterMode(obj,Active,Free) {
  if (Active && Free) {
    return obj
  } else if (Active) {
    return obj.filter(o => o.Mode!=='DONE')
  } else if (Free) {
    return obj.filter(o => o.Mode==='DONE')
  } else {
    return []
  }
}

// Search Bitrode and Battery ID fields for search text
function filterSearch(table,Search) {
  if (Search==='') {
    return table // Don't search for anything if there's no query
  }
  Search = Search.toLowerCase()
  return table.filter(o => o.Bitrode.toLowerCase().search(Search)!==-1 || o['Circuit Name'].toLowerCase().search(Search)!==-1)
}

export default TabularOverview;
