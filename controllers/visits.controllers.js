import Visit from "../models/visit.model.js";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export const getMonthlyVisits = async (req, res) => {
    try {
        const now = new Date();
        const months = Array.from({ length: 12 }, (_, i) => {
            const date = subMonths(now, 11 - i);
            return {
                month: date.toLocaleString('default', { month: 'short' }),
                year: date.getFullYear(),
                start: startOfMonth(date),
                end: endOfMonth(date)
            };
        });
        const result = await Promise.all(months.map(async ({ month, year, start, end }) => {
            const count = await Visit.countDocuments({
                createdAt: {
                    $gte: start, $lte: end
                }
            });
            return { label: `${month}`, count }
        }));
        const labels = result.map(r => r.label);
        const data = result.map(r => r.count);
        return res.status(200).json({ message: "Analytics found", labels: labels, data: data })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}