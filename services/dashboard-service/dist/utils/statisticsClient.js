import axios from "axios";
const STATISTICS_SERVICE_URL = process.env.STATISTICS_SERVICE_URL?.replace(/^"|"$/g, "") || "http://localhost:5003";
const statisticsApi = axios.create({
    baseURL: STATISTICS_SERVICE_URL,
    timeout: Number(process.env.STATISTICS_SERVICE_TIMEOUT || 8000),
    withCredentials: true,
});
export async function fetchWidgetDataFromStatistics(widgetType, jwt) {
    try {
        const headers = {};
        if (jwt) {
            headers.Cookie = `jwt=${jwt}`;
            headers.Authorization = `Bearer ${jwt}`;
        }
        const response = await statisticsApi.get(`/api/statistics/widgets/${widgetType}`, {
            headers,
        });
        return response.data;
    }
    catch (error) {
        const message = error?.response?.data?.message || error?.message || "Statistics service unavailable";
        throw new Error(message);
    }
}
