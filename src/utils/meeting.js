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

  const items = genMeetingItems(MEETING_TEMPLATE, agenda.data);

  // Assign an absolute starting time for each meeting item, and find the index
  // of the item with the flexible duration.
  const {minute, flexItemIdx} = items.reduce(
    ({minute, flexItemIdx}, item, i) => {
      item.start = minute;
      return {
        minute: minute + item.duration,
        // Record index of item where `duration` is null. Only one such item is
        // expected.
        flexItemIdx: item.duration === null ? i : flexItemIdx,
      };
    },
    {minute: MEETING_TIMES.startMinute, flexItemIdx: -1},
  );

  // Compute the flexible duration by taking the difference of the expected and
  // actual meeting end.
  const flexDuration = MEETING_TIMES.endMinute - minute;

  // TODO: When having not enough time for table topics, intelligently remove
  //   them from the agenda rather than erroring out.

  if (flexDuration < 0) {
    throw Error(
      `Meeting ends at ${minute} min past the hour, which is after ` +
      `the ${MEETING_TIMES.endMinute} min mark. Check the duration of the ` +
      `speeches: ${JSON.stringify(agenda.data.items.speeches)}`,
    );
  }

  // With this duration computed, shift the start times of all items which
  // come after the flexble item by that amount of time.
  items.slice(flexItemIdx + 1).forEach(item => item.start += flexDuration);

  return {
    date: agenda.data.date,
    items,
    officers: OFFICER_TITLES.map(([officer, title]) =>
      [title, agenda.data.officers[officer]]
    ),
  };
}

function genMeetingItems(meetingTemplate, agenda) {
  const listOfLists = meetingTemplate.map(row => {
    const {text, who, duration} = row;

    if (who === null) {
      // There is no person associated with this meeting slot.
      return [row];

    } else if (who.role) {
      return [{duration, who: agenda.items[who.role], text}];

    } else if (who.officer) {
      return [{duration, who: agenda.officers[who.officer], text}];

    } else if (who.speakers) {
      return agenda.items.speeches.map((speech, i) => {
        const {track, project, title, speaker, duration} = speech;

        return {
          // Compute duration by parsing the text description of the speech
          // length... Ugh. Extract the last number from this string.
          duration: Number(duration.match(/\d+/g).slice(-1).pop()),
          who: speaker,
          // Include speech number in the agenda item text.
          text: `${text}${i + 1}`,
          // Add additional information for the renderer to consume.
          extra: {
            speech: {track, project, title},
          },
        };
      });

    } else if (who.evaluators) {
      return agenda.items.speeches.map((speech, i) => {
        const speechNum = i + 1;
        const key = `evaluator ${speechNum}`;
        const evaluator = agenda.items[key];

        if (!evaluator) {
          throw new Error(
            `Evaluator for speech ${speechNum} not found. Missing key ` +
            `"${key}".`,
          );
        }

        return {
          duration: duration,
          // Refer back to the corresponding evaluator in a janky way.
          who: evaluator,
          // Include speech evaluation number in the agenda item text.
          text: `${text}${i + 1}`,
        };
      });

    } else {
      throw Error(
        'Unknown value of `who` encountered while processing meeting ' +
        'template item ' + JSON.stringify(who),
      );
    }
  });

  // Return flattened list.
  return [].concat(...listOfLists);
}

// The meeting starts at 5 minutes past the hour, and ends at 55 minutes past
// the hour.
const MEETING_TIMES = {
  startMinute: 5,
  endMinute: 56,
};

const MEETING_TEMPLATE = [
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
  // Placeholder for speches which are filled from agenda data.
  {
    // Text computed dynamically.
    text: 'Speech #',
    who: {speakers: true},
  },
  {
    text: 'Topicsmaster conducts Table Topics',
    who: {role: 'topicsmaster'},
    // Flexible duration.
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
    text: 'Evaluator #',
    who: {evaluators: true},
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

const OFFICER_TITLES = [
  ['president', 'President'],
  ['secretary', 'Secretary'],
  ['soa', 'Sergeant of Arms'],
  ['treasurer', 'Treasurer'],
  ['vpe', 'VP Education'],
  ['vpm', 'VP Membership'],
  ['vppr', 'VP Public Relations'],
];
