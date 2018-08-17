import qs from 'qs';

export function getMeeting(queryString) {
  const queryData = qs.parse(queryString);
  let agenda = null;

  if (!queryData.data) {
    throw new Error(
      'Could not find agenda data in query string. Please make sure you ' +
      'followed the right link to get to this page.',
    );
  }

  try {
    agenda = JSON.parse(queryData.data);
  } catch(e) {
    console.error('Error while parsing agenda JSON: ', e.message)
    throw e;
  }

  if (agenda.version !== '1.0') {
    throw new Error(
      'Unknown agenda version ' + JSON.stringify(agenda.version),
    );
  }

  // Only care about agenda data from this point on...
  agenda = agenda.data;

  // The meeting starts at 5 minutes past the hour, and ends at 55 minutes past
  // the hour.
  const [minuteStart, minuteEnd] = [5, 55];
  // Keep track of how many minutes into the meeting the current agenda item
  // is. Initialize it to the start.
  let minuteCounter = minuteStart;
  // Take note of which agenda item has expanding duration. This should only be
  // table topics.
  let stretchItem = null;

  const items = meetingTemplate.map((row, i) => {
    let {text, who, duration} = row;
    let person = null;
    let extra = null;

    if (who === null) {
      // There is no person associated with this meeting slot.

    } else if (who.role) {
      who = agenda.items[who.role]
      
    } else if (who.officer) {
      who = agenda.officers[who.officer];

    } else if (who.speaker) {
      // Adjust speaker number to be 0-based index.
      const speech = agenda.items.speeches[who.speaker - 1];
      who = speech.speaker;
      // Assign duration by parsing the text description of the speech length.
      // Ugh. Do this by taking the number which appears last.
      duration = Number(speech.duration.match(/\d+/g).slice(-1).pop())
      // Add additional information to render for this agenda item.
      extra = {
        speech: {
          track: speech.track,
          project: speech.project,
          title: speech.title,
        },
      };

    } else {
      throw Error(
        'Unknown value of `who` encountered while processing meeting ' +
        'template item ' + JSON.stringify());
    }

    const result = {
      start: minuteCounter,
      who,
      text,
      extra,
    };

    if (duration === null) {
      stretchItem = i;
    } else {
      minuteCounter += duration;
    }

    return result;
  });

  const lastItem = items.slice(-1).pop();
  // Compute the the stretch duration by taking the difference of the expected
  // meeting end.
  const stretchDuration = minuteEnd - lastItem.start;

  // TODO: Intelligently take table topics out of agenda based on input rather
  //   than erroring out.

  if (stretchDuration < 0) {
    throw Error(
      `Meeting ends at ${lastItem.start} min past the hour, which is after ` +
      `the ${minuteEnd} min mark. Check the duration of the speeches: ` +
      JSON.stringify(agenda.items.speeches),
    );
  }

  // With the stretch duration computed, perform a second pass and shift the
  // start times of affected agenda items.
  for (let i = stretchItem + 1; i < items.length; ++i) {
    items[i].start += stretchDuration;
  }

  return {
    date: agenda.date,
    items,
    officers: officerTitles.map(([officer, title]) =>
      [title, agenda.officers[officer]]
    ),
  };
}

const meetingTemplate = [
  {
    text: 'Sergeant of Arms opens meeting and introduces Toastmaster',
    who: {officer: 'soa'},
    duration: 1,
  },
  {
    text: 'Toastmaster conducts roll call',
    who: {role: 'toastmaster'},
    duration: 1,
  },
  {
    text: 'Toastmaster introduces guests',
    who: {role: 'toastmaster'},
    duration: 1,
  },
  {
    text: 'Grammarian explains the role',
    who: {role: 'grammarian'},
    duration: 1,
  },
  {
    text: 'Ah Counter explains the role',
    who: {role: 'ah counter'},
    duration: 1,
  },
  {
    text: 'Timer explains the role',
    who: {role: 'timer'},
    duration: 1,
  },
  {
    text: 'Jokemaster sets the mood',
    who: {role: 'jokemaster'},
    duration: 2,
  },
  {
    text: 'Speaker #1',
    who: {speaker: 1},
    // Duration computed at runtime.
    duration: undefined,
  },
  {
    text: 'Speaker #2',
    who: {speaker: 2},
    // Duration computed at runtime.
    duration: undefined,
  },
  {
    text: 'Topicsmaster conducts Table Topics',
    who: {role: 'topicsmaster'},
    // Floating duration.
    duration: null,
  },
  {
    text: 'Everyone votes for Best/Most-Improved Table Topics contestant',
    who: null,
    duration: 0,
  },
  {
    text: 'General Evaluator conducts evaluation portion of the meeting',
    who: {role: 'general evaluator'},
    duration: 1,
  },
  {
    text: 'Evaluator #1',
    who: {role: 'evaluator 1'},
    duration: 3,
  },
  {
    text: 'Evaluator #2',
    who: {role: 'evaluator 2'},
    duration: 3,
  },
  {
    text: 'General Evaluator calls for the reports',
    who: {role: 'general evaluator'},
    duration: 0,
  },
  {
    text: 'Timer Report',
    who: {role: 'timer'},
    duration: 1,
  },
  {
    text: 'Ah Counter Report',
    who: {role: 'ah counter'},
    duration: 1,
  },
  {
    text: 'Grammarian Report',
    who: {role: 'grammarian'},
    duration: 1,
  },
  {
    text: 'Topicsmaster announces Best/Most-Improved winner',
    who: {role: 'topicsmaster'},
    duration: 1,
  },
  {
    text: "General Evaluator conducts meeting's evaluation",
    who: {role: 'general evaluator'},
    duration: 3,
  },
  {
    text: 'President makes Club Announcements',
    who: {officer: 'president'},
    duration: 2,
  },
  {
    text: 'President presents awards',
    who: {officer: 'president'},
    duration: 1,
  },
  {
    text: 'President closes the meeting',
    who: {officer: 'president'},
    duration: 1,
  },
];

const officerTitles = [
  ['president', 'President'],
  ['secretary', 'Secretary'],
  ['soa', 'Sergeant of Arms'],
  ['treasurer', 'Treasurer'],
  ['vpe', 'VP Education'],
  ['vpm', 'VP Membership'],
  ['vppr', 'VP Public Relations'],
];
