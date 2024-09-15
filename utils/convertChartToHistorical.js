// ⚠️ As chart and historical types have some different behaviour, you may have to convert a little bit differently with :
const convertToHistoricalResult = (result) => {
    return result.quotes
        .map((quote) => ({
            ...quote,
            open: quote.open || null,
            high: quote.high || null,
            low: quote.low || null,
            close: quote.close || null,
            volume: quote.volume || null,
        }))
        .filter(
            (dailyQuote) => dailyQuote.low !== null || dailyQuote.high !== null
        );
};

module.exports = convertToHistoricalResult;
