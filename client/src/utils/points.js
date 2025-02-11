// client/src/utils/points.js

/**
 * Calculate how many points the user earned on a single series.
 *
 * @param {Object} userBet - The user's bet doc (contains "bets" array).
 * @param {Object} series  - The series doc (contains "betOptions" and "isFinished").
 * @returns {number} the total points earned for that series (0 if not finished).
 */
export function calculateSeriesPoints(userBet, series) {
    if (!series.isFinished) {
      // If the series is not finished, no final results => no points
      return 0;
    }
  
    let total = 0;
    for (const b of userBet.bets) {
      // find matching bet option
      const cat = series.betOptions.find((o) => o.category === b.category);
      if (cat && cat.finalChoice && cat.finalChoice === b.choiceName) {
        // user guessed correctly => add b.oddsWhenPlaced
        total += b.oddsWhenPlaced;
      }
    }
    return total;
  }
  