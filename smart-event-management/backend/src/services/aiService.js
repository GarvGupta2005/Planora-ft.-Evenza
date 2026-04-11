/**
 * AI Service for Planora — "Evenza AI"
 * Provides smart suggestions for event organizers based on event performance metrics.
 */

/**
 * Generate event management suggestions.
 * @param {Object} stats - Dashboard statistics for the event
 */
const getEventSuggestions = (stats) => {
    const suggestions = [];

    // Engagement heuristics
    if (stats.registrations > 0 && stats.attendance === 0) {
        suggestions.push({
            type: "engagement",
            text: "Low attendance detected. Send a reminder message and venue map to all registered participants.",
            priority: "high"
        });
    }

    if (stats.avgRating < 3.5 && stats.feedbackCount > 0) {
        suggestions.push({
            type: "improvement",
            text: "Average rating is below 3.5. Review the latest feedback comments to identify specific pain points.",
            priority: "medium"
        });
    }

    if (stats.feedbackCount < stats.attendance * 0.3 && stats.attendance > 5) {
        suggestions.push({
            type: "feedback",
            text: "Feedback response rate is low. Offer a certificate or a small digital gift to encourage more responses.",
            priority: "medium"
        });
    }

    if (stats.volunteerCount === 0 && stats.registrations > 20) {
        suggestions.push({
            type: "logistics",
            text: "Large event detected with no volunteers assigned. Consider recruiting volunteers for check-in and stage crew.",
            priority: "high"
        });
    }

    // Default suggestions if nothing specific is found
    if (suggestions.length === 0) {
        suggestions.push({
            type: "general",
            text: "Everything looks on track! Consider creating interactive polls during the live session to maximize engagement.",
            priority: "low"
        });
    }

    return suggestions;
};

module.exports = {
    getEventSuggestions
};
