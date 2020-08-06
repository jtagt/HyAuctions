module.exports = {
    atob: str => Buffer.from(str, 'base64').toString('binary'),
    bestMatch: (a, item) => {
        let bestIndex = null;
        let bestNumMatch = -1;
        let bestNumMismatch = 0;
        let numItemElements = item.length;

        for (let i in a) {
            for (let numMatch = 0; numMatch < numItemElements; numMatch++) {
                if (a[i][numMatch] != item[numMatch]) break;
            }

            let numMismatch = a[i].length - numMatch;
            if (numMatch == numItemElements && !numMismatch) return i;
            if (numMatch > bestNumMatch
                || (numMatch == bestNumMatch && numMismatch < bestNumMismatch)) {
                bestIndex = i;
                bestNumMatch = numMatch;
                bestNumMismatch = numMismatch;
            }
        }
        return bestIndex;
    },
    parseQuery: query => {
        return query.split('.');
    },
    titleCase(str) {
        let splitStr = str.toLowerCase().split(' ');

        for (let i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }

        return splitStr.join(' ');
    }
};