/**
 * Copyright (C) 2021 Thomas Weber
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const normalize = text => text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['"()\-+,./]/g, ' ')
    .trim();

const splitToWords = text => normalize(text)
    .split(' ')
    .filter(i => i);

const parseTexts = texts => {
    const result = [];
    for (const {score, text} of texts) {
        result.push({
            score,
            words: splitToWords(text)
        });
    }
    return result;
};

class Search {
    constructor (items) {
        this.items = items.map(parseTexts);
    }

    search (query) {
        const terms = splitToWords(query);
        const result = [];
        const processItem = (item, index) => {
            let totalScore = 0;
            for (const term of terms) {
                let highestScoreForTerm = 0;
                for (const group of item) {
                    for (const word of group.words) {
                        const wordIndex = word.indexOf(term);
                        if (wordIndex !== -1) {
                            let multiplier;
                            if (wordIndex === 0) {
                                if (word === term) {
                                    multiplier = 2;
                                } else {
                                    multiplier = 1.5;
                                }
                            } else {
                                multiplier = 1;
                            }
                            const itemScore = group.score * multiplier;
                            if (itemScore > highestScoreForTerm) {
                                highestScoreForTerm = itemScore;
                            }
                            break;
                        }
                    }
                }
                if (highestScoreForTerm === 0) {
                    return;
                }
                totalScore += highestScoreForTerm;
            }
            result.push({
                index,
                score: totalScore
            });
        };
        for (let i = 0; i < this.items.length; i++) {
            processItem(this.items[i], i);
        }
        result.sort((a, b) => b.score - a.score);
        return {
            items: result,
            terms
        };
    }
}

export default Search;
