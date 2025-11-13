/**
 * Format date to HH:MM, DD-MM-YYYY format in local timezone
 * @param dateString ISO date string
 * @returns Formatted date string like "14:30, 13-11-2025"
 */
export function formatLastLogin(dateString: string | null): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid date";

    // Format time as HH:MM (24-hour)
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Format date as DD-MM-YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${hours}:${minutes}, ${day}-${month}-${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
}
