class StatsUtils {
    constructor() {
        this.YEAR_MILLISECONDS = 31556952000;
        this.MONTH_MILLISECONDS = 2592000000;
        this.WEEK_MILLISECONDS = 604800000;
        this.DAY_MILLISECONDS = 86400000;
    }

    //Outlier filtering with the help of this gist.
    //https://gist.github.com/rmeissn/f5b42fb3e1386a46f60304a57b6d215a
    filterOutliers(someArray) {
        if (someArray.length < 4) return someArray;

        let values, q1, q3, iqr, maxValue, minValue;

        values = someArray.slice().sort((a, b) => a - b);

        if ((values.length / 4) % 1 === 0) {
            q1 = 1 / 2 * (values[(values.length / 4)] + values[(values.length / 4) + 1]);
            q3 = 1 / 2 * (values[(values.length * (3 / 4))] + values[(values.length * (3 / 4)) + 1]);
        } else {
            q1 = values[Math.floor(values.length / 4 + 1)];
            q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
        }

        iqr = q3 - q1;
        maxValue = q3 + iqr * 1.5;
        minValue = q1 - iqr * 1.5;

        return values.filter((x) => (x >= minValue) && (x <= maxValue));
    };

    average(arr) {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    median(values) {
        if (!values.length) return 0;

        values.sort((a, b) => a - b);

        let half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];

        return (values[half - 1] + values[half]) / 2.0;
    }

    mean(numbers) {
        let total = 0, i;
        for (i = 0; i < numbers.length; i += 1) {
            total += numbers[i];
        }
        return total / numbers.length;
    }

    mode(numbers) {
        let modes = [], count = [], i, number, maxIndex = 0;

        for (i = 0; i < numbers.length; i += 1) {
            number = numbers[i];
            count[number] = (count[number] || 0) + 1;
            if (count[number] > maxIndex) {
                maxIndex = count[number];
            }
        }

        for (i in count)
            if (count.hasOwnProperty(i)) {
                if (count[i] === maxIndex) {
                    modes.push(Number(i));
                }
            }

        return modes;
    }

    range(numbers) {
        numbers.sort();
        return [numbers[0], numbers[numbers.length - 1]];
    }

    mode(a) {
        a.sort((x, y) => x - y);

        let bestStreak = 1;
        let bestElem = a[0];
        let currentStreak = 1;
        let currentElem = a[0];

        for (let i = 1; i < a.length; i++) {
            if (a[i - 1] !== a[i]) {
                if (currentStreak > bestStreak) {
                    bestStreak = currentStreak;
                    bestElem = currentElem;
                }

                currentStreak = 0;
                currentElem = a[i];
            }

            currentStreak++;
        }

        return currentStreak > bestStreak ? currentElem : bestElem;
    };

}

module.exports = StatsUtils;