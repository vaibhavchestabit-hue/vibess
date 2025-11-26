import User from "@/src/models/userModel";

/**
 * Notifies the next user on the waitlist for a specific category.
 * This function should be called when a GP expires, is closed, or fails.
 * 
 * @param category The category where a slot opened up
 */
export async function notifyNextInWaitlist(category: string) {
    try {
        // Find users waiting for this category, sorted by request time (oldest first)
        // and who haven't been notified yet
        const userToNotify = await User.findOne({
            "gpWaitlist.category": category,
            "gpWaitlist.notified": false
        }).sort({ "gpWaitlist.requestedAt": 1 });

        if (!userToNotify) {
            return;
        }

        // Update the specific waitlist entry to notified = true
        await User.updateOne(
            {
                _id: userToNotify._id,
                "gpWaitlist.category": category
            },
            {
                $set: { "gpWaitlist.$.notified": true }
            }
        );

        // In a real app, we would send a push notification or email here
        // For now, we just mark them as notified so the UI can show a badge/alert
        console.log(`Notified user ${userToNotify.username} for category ${category}`);

    } catch (error) {
        console.error("Error notifying waitlist:", error);
    }
}
