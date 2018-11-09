import React from 'react';

import Layout from '../components/layout';
import {getMeeting} from '../utils/meeting';
import css from '../styles/index.module.css';

// TODOS:
//   1. Use stricter validation on agenda schema
//   2. Upgrade agenda schema to use ordered list for items, not object

function IndexPage({location}) {
  // Since this code runs during build and in the browser, and `window` is
  // only defined in the browser, exit gracefully if `window` is undefined.
  if (typeof window === 'undefined') {
    return <></>;
  }

  let meeting = null;

  try {
    // Pass the query string, stripping off the leading '?'.
    meeting = getMeeting(location.search.slice(1));

  } catch(e) {
    console.error(e);
    return (
      <Layout>
        <h1>Whoops, something went wrong.</h1>
        <p>
          An error occurred while processing the data used to render the
          agenda. Check the JavaScript console for more information.
        </p>
      </Layout>
    );
  }

  const tableRows = meeting.items.map(getMeetingItemRow);
  const officerListItems = meeting.officers.map(([title, name], i) =>
    <li key={i}>{title}: {name}</li>
  );

  return (
    <Layout>
      <div className={css.root}>
        <div className={css.heading}>
          <h1>Club Meeting Agenda for {meeting.date}</h1>
          <h2><button onClick={window.print}>Print Agenda</button></h2>
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
    </Layout>
  );
}

function getMeetingItemRow(item, i) {
  let extras = null;

  if (item.extra && item.extra.speech) {
    const {track, project, title} = item.extra.speech;
    extras = (
      <span>
        {/* Join track and project with colon only if both exist */}
        {'. '}{[track, project].filter(x => x).join(': ')}<br />
        {/* Truncate title to a maximum of 93 characters */}
        Title: {title.length > 90 ? title.slice(0, 90) + '...' : title}
      </span>
    );
  }

  return (
    <tr key={i}>
      <td>
        {/* Janky way to pad number... */}
        12:{item.start < 10 ? '0' + item.start : item.start}
      </td>
      <td>{item.text}{extras}</td>
      <td>{item.who}</td>
    </tr>
  );
}

export default IndexPage;
