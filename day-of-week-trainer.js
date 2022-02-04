const readline = require('readline/promises');
const { stdin, stdout } = require('process');

const rl = readline.createInterface({ input: stdin, output: stdout });

const DOOMSDAY_DATES = [
    [1,3],
    [2,28],
    [3,14],
    [4,4],
    [5,9],
    [6,6],
    [7,4],
    [7,11],
    [8,8],
    [9,5],
    [10,10],
    [10,31],
    [11,7],
    [12,12],
    [12,26],
];
const DOOMSDAY_DATES_LEAP = [[1,4], [2,29], ...DOOMSDAY_DATES.slice(2)];
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getRand(min, max) {
    return Math.random() * (max - min) + min;
}

function createRandomDate() {
    const minDate = Date.parse(`1900-01-01`);
    const maxDate = Date.parse(`2099-12-31`);
    return new Date(getRand(minDate, maxDate));
}

function isLeap(year) { return new Date(year, 1, 29).getMonth() == 1; }

function getDoomsdayDay(year) {
    // Dec 12
    const d = new Date(year, 11, 12);
    return `${d.toLocaleString('default', { weekday: 'short' })} (${d.getUTCDay()})`;
}

function findClosestDoomsdayDate(target) {
    const [year,month,date] = [target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate()];
    const targetDate = new Date(year, month, date);
    const doomsdays = isLeap(year) ? DOOMSDAY_DATES_LEAP : DOOMSDAY_DATES;
    return doomsdays
        .map(([m,d]) => [m,d,Math.floor((new Date(year,m-1,d)-targetDate)/MS_PER_DAY)])
        .sort((a, b) => Math.abs(a[2]) - Math.abs(b[2]))[0];
}

function elapsed(start) {
    return Math.round((new Date() - start)/1000);
}

function write(msg) {
    stdout.write(msg + '\n');
}

async function takeAGuess() {
    const d = createRandomDate();
    const [year,month,date] = [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
    const fmtDate = d.toLocaleString('default', { dateStyle: 'medium' });

    const doomsdayStart = Date.now();
    const doomsdayAnswer = await rl.question(`What was the doomsday in ${year}?\t`);
    const doomsdayDay = new Date(year, 11, 12).getUTCDay();
    if (parseInt(doomsdayAnswer) === doomsdayDay) {
        write(`Correct! ${elapsed(doomsdayStart)} seconds`);
    } else {
        write(`Sorry, the answer was ${doomsdayDay}`);
        return;
    }

    const answerStart = Date.now();
    const answer = await rl.question(`What day was ${fmtDate}?\t`);
    const answerTime = elapsed(answerStart);
    const totalTime = elapsed(doomsdayStart);
    if (parseInt(answer) === d.getUTCDay()) {
        write(`Correct! ${answerTime} seconds (${totalTime} seconds total)`);
    } else {
        write(`Sorry, the answer was ${d.getUTCDay()}`);
        // write(`Doomsday day in ${year} was ${getDoomsdayDay(year)}`);
        const nearest = findClosestDoomsdayDate(d);
        const fmtNearest = new Date(year,nearest[0]-1,nearest[1]).toDateString();
        write(`Closest doomsday date was ${fmtNearest}, with ${nearest[2]} offset`);
        return;
    }
    return totalTime;
}

async function main() {
    const numRuns = 3;
    let completedRuns = 0;
    let totalTime = 0;
    for (let i = 0; i < numRuns; i++) {
        const guessTime = await takeAGuess();
        if (!guessTime) { continue; }
        totalTime += guessTime;
        completedRuns++;
    }

    write(`${completedRuns}/${numRuns} correct in ${totalTime} seconds (avg: ${Math.floor(totalTime/completedRuns)} seconds)`);

    rl.close();
}

main();
