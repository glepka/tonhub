export const checkBookingConflict = async (supabase, { datetime, durationMinutes, boxId, excludeId = null }) => {
  if (!boxId) return null;

  const start = new Date(datetime);
  if (Number.isNaN(start.getTime())) return null;

  const dur = Number(durationMinutes) || 60;
  const end = new Date(start.getTime() + dur * 60 * 1000);

  let query = supabase
    .from("bookings")
    .select("id, datetime, duration_minutes")
    .eq("box_id", boxId)
    .gte("datetime", start.toISOString())
    .lte("datetime", end.toISOString());

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data || data.length === 0) return null;

  // Check for actual time overlap
  for (const booking of data) {
    const bStart = new Date(booking.datetime);
    const bDur = Number(booking.duration_minutes) || 60;
    const bEnd = new Date(bStart.getTime() + bDur * 60 * 1000);

    if (start < bEnd && bStart < end) {
      return booking;
    }
  }

  return null;
};

