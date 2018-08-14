import React from 'react';
import Link from 'gatsby-link';

import {getMeeting} from '../utils/meeting';
import css from '../styles/index.module.css';

// TODOS:
//   1. Use stricter validation on agenda schema
//   2. Upgrade agenda schema to use ordered list for items, not object

function IndexPage() {
  let meeting = null;

  try {
    // Pass the query string, stripping off the leading '?'.
    meeting = getMeeting(window.location.search.slice(1));

  } catch(e) {
    console.error(e);
    return (
      <div>
        <h1>Whoops, something went wrong.</h1>
        <p>
          An error occurred while processing the data used to render the
          agenda. Check the JavaScript console for more information.
        </p>
      </div>
    );
  }

  const tableRows = meeting.items.map((item, i) =>
    <tr key={i}>
      <td>
        {/* Janky way to pad number... */}
        12:{item.start < 10 ? '0' + item.start : item.start}
      </td>
      <td>{item.text}</td>
      <td>{item.who}</td>
    </tr>
  );

  const officerListItems = meeting.officers.map(([title, name], i) =>
    <li key={i}>{title}: {name}</li>
  );

  return (
    <div className={css.root}>
      <div className={css.heading}>
        <h1>Club Meeting Agenda for {meeting.date}</h1>
        {/*<h2><a href="javascript:window.print()">Print</a></h2>*/}
        <h2><button className="btn" onClick={window.print}>Print Agenda</button></h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <td>Time</td>
            <td>Role / Agenda Item</td>
            <td>Person</td>
          </tr>
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
      <h2>Brought to you by the Toastmasters Officers:</h2>
      <ul>
        {officerListItems}
      </ul>
    </div>
  );
}

export default IndexPage;
