import Group from "@/src/models/groupModel";
import User from "@/src/models/userModel";

/**
 * Finds and closes a "weak" group in the specified category.
 * A group is considered weak if:
 * 1. It has only 1 member (the creator)
 * 2. It has been active for at least 15 minutes
 * 3. It has less than 3 messages
 * 4. No activity in the last 30 minutes
 * 
 * @param category The category to search for weak groups in
 * @returns boolean True if a group was closed, False otherwise
 */
export async function findAndCloseWeakGroup(category: string): Promise<boolean> {
    try {
        const now = new Date();
        const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

        // Find candidate weak groups
        const weakGroup = await Group.findOne({
            category,
            status: "active",
            isPermanent: false,
            startedAt: { $lt: fifteenMinutesAgo }, // Must be at least 15 mins old
            $and: [
                { $expr: { $eq: [{ $size: "$members" }, 1] } }, // Only 1 member
                { messageCount: { $lt: 3 } }, // Less than 3 messages
                { lastActivityAt: { $lt: thirtyMinutesAgo } } // No activity in last 30 mins
            ]
        }).sort({ startedAt: 1 }); // Get the oldest one first

        if (!weakGroup) {
            return false;
        }

        // Close the group
        weakGroup.status = "failed"; // or "expired" - "failed" implies it didn't take off
        weakGroup.expiresAt = now;
        await weakGroup.save();

        // Notify the creator (optional, but good UX)
        // We could add a notification system here later

        console.log(`Auto-closed weak group ${weakGroup._id} in category ${category}`);
        return true;

    } catch (error) {
        console.error("Error in findAndCloseWeakGroup:", error);
        return false;
    }
}
