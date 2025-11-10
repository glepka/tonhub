import express from "express";
import { supabase } from "../config/supabase.js";
import { checkBookingConflict } from "../utils/bookingConflict.js";

const router = express.Router();

// GET /api/bookings
router.get("/", async (req, res, next) => {
  try {
    const { date } = req.query;

    let query = supabase
      .from("bookings")
      .select("*, booking_workers(worker_id), boxes(number, description)")
      .order("datetime", { ascending: true });

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query = query.gte("datetime", startDate.toISOString()).lte("datetime", endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const bookings = (data || []).map((booking) => {
      // Get worker IDs from booking_workers
      const workerIds = booking.booking_workers?.map((bw) => bw.worker_id) || [];

      // Fetch worker names
      return {
        id: booking.id,
        client: booking.client,
        car: booking.car,
        service: booking.service,
        datetime: booking.datetime,
        durationMinutes: booking.duration_minutes,
        price: Number(booking.price),
        boxId: booking.box_id,
        salaryPercent: booking.salary_percent ? Number(booking.salary_percent) : null,
        workerIds: workerIds,
        box: booking.boxes
          ? {
              id: booking.box_id,
              number: booking.boxes.number,
              description: booking.boxes.description,
            }
          : null,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
      };
    });

    // Fetch all workers to map IDs to names
    const { data: allWorkers } = await supabase.from("workers").select("id, name");

    const workerMap = {};
    (allWorkers || []).forEach((w) => {
      workerMap[w.id] = w.name;
    });

    // Add worker names to bookings
    const bookingsWithWorkers = bookings.map((booking) => ({
      ...booking,
      workers: booking.workerIds.map((id) => workerMap[id]).filter(Boolean),
    }));

    res.json(bookingsWithWorkers);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings
router.post("/", async (req, res, next) => {
  try {
    const { client, car, service, datetime, durationMinutes, price, workers, boxId, salaryPercent } = req.body;

    if (!client || typeof client !== "string" || client.trim().length === 0) {
      return res.status(400).json({ error: "Client name is required" });
    }

    if (!datetime || Number.isNaN(new Date(datetime).getTime())) {
      return res.status(400).json({ error: "Valid datetime is required" });
    }

    const dur = Number(durationMinutes) || 60;
    const priceNum = Number(price) || 0;
    const salaryPercentNum = salaryPercent !== null && salaryPercent !== undefined ? Number(salaryPercent) : null;

    // Check for conflicts
    const conflict = await checkBookingConflict(supabase, {
      datetime,
      durationMinutes: dur,
      boxId,
    });

    if (conflict) {
      return res.status(409).json({
        error: "Booking conflict detected",
        conflict: {
          id: conflict.id,
          datetime: conflict.datetime,
          duration_minutes: conflict.duration_minutes,
        },
      });
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          client: client.trim(),
          car: car?.trim() || null,
          service: service?.trim() || null,
          datetime: new Date(datetime).toISOString(),
          duration_minutes: dur,
          price: priceNum,
          box_id: boxId || null,
          salary_percent: salaryPercentNum,
        },
      ])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Create booking_workers relationships
    if (Array.isArray(workers) && workers.length > 0) {
      // If workers is array of names, convert to IDs
      let workerIds = workers;

      // Check if workers are names (strings) or IDs (UUIDs)
      const isNames = workers.some((w) => typeof w === "string" && !w.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));

      if (isNames) {
        // Fetch workers by name
        const { data: workersData, error: workersError } = await supabase
          .from("workers")
          .select("id")
          .in("name", workers);

        if (workersError) throw workersError;

        workerIds = (workersData || []).map((w) => w.id);
      }

      if (workerIds.length > 0) {
        const bookingWorkers = workerIds.map((workerId) => ({
          booking_id: booking.id,
          worker_id: workerId,
        }));

        const { error: bwError } = await supabase.from("booking_workers").insert(bookingWorkers);

        if (bwError) throw bwError;
      }
    }

    // Fetch booking with workers
    const { data: bookingWithWorkers, error: fetchError } = await supabase
      .from("bookings")
      .select("*, booking_workers(worker_id)")
      .eq("id", booking.id)
      .single();

    if (fetchError) throw fetchError;

    // Fetch worker names
    const workerIds = bookingWithWorkers.booking_workers?.map((bw) => bw.worker_id) || [];
    const { data: workersData } = await supabase.from("workers").select("id, name").in("id", workerIds);
    const workerMap = {};
    (workersData || []).forEach((w) => {
      workerMap[w.id] = w.name;
    });

    const result = {
      ...bookingWithWorkers,
      durationMinutes: bookingWithWorkers.duration_minutes,
      boxId: bookingWithWorkers.box_id,
      salaryPercent: bookingWithWorkers.salary_percent,
      workerIds: workerIds,
      workers: workerIds.map((id) => workerMap[id]).filter(Boolean),
      duration_minutes: undefined,
      box_id: undefined,
      salary_percent: undefined,
      booking_workers: undefined,
    };

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /api/bookings/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { client, car, service, datetime, durationMinutes, price, workers, boxId, salaryPercent } = req.body;

    const updates = {};
    if (client !== undefined) {
      if (typeof client !== "string" || client.trim().length === 0) {
        return res.status(400).json({ error: "Client name must be a non-empty string" });
      }
      updates.client = client.trim();
    }
    if (car !== undefined) {
      updates.car = car?.trim() || null;
    }
    if (service !== undefined) {
      updates.service = service?.trim() || null;
    }
    if (datetime !== undefined) {
      if (Number.isNaN(new Date(datetime).getTime())) {
        return res.status(400).json({ error: "Valid datetime is required" });
      }
      updates.datetime = new Date(datetime).toISOString();
    }
    if (durationMinutes !== undefined) {
      const dur = Number(durationMinutes);
      if (!Number.isFinite(dur) || dur < 1) {
        return res.status(400).json({ error: "Duration must be a positive number" });
      }
      updates.duration_minutes = dur;
    }
    if (price !== undefined) {
      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: "Price must be a non-negative number" });
      }
      updates.price = priceNum;
    }
    if (boxId !== undefined) {
      updates.box_id = boxId || null;
    }
    if (salaryPercent !== undefined) {
      updates.salary_percent = salaryPercent !== null && salaryPercent !== undefined ? Number(salaryPercent) : null;
    }

    // Check for conflicts if datetime, duration, or boxId changed
    if (datetime !== undefined || durationMinutes !== undefined || boxId !== undefined) {
      const currentBooking = await supabase.from("bookings").select("*").eq("id", id).single();

      const checkDatetime = datetime !== undefined ? datetime : currentBooking.data?.datetime;
      const checkDuration = durationMinutes !== undefined ? durationMinutes : currentBooking.data?.duration_minutes;
      const checkBoxId = boxId !== undefined ? boxId : currentBooking.data?.box_id;

      const conflict = await checkBookingConflict(supabase, {
        datetime: checkDatetime,
        durationMinutes: checkDuration,
        boxId: checkBoxId,
        excludeId: id,
      });

      if (conflict) {
        return res.status(409).json({
          error: "Booking conflict detected",
          conflict: {
            id: conflict.id,
            datetime: conflict.datetime,
            duration_minutes: conflict.duration_minutes,
          },
        });
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (bookingError) throw bookingError;
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Update worker relationships if provided
    if (workers !== undefined) {
      // Delete existing relationships
      const { error: deleteError } = await supabase.from("booking_workers").delete().eq("booking_id", id);

      if (deleteError) throw deleteError;

      // Create new relationships
      if (Array.isArray(workers) && workers.length > 0) {
        let workerIds = workers;

        // Check if workers are names or IDs
        const isNames = workers.some((w) => typeof w === "string" && !w.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));

        if (isNames) {
          const { data: workersData, error: workersError } = await supabase
            .from("workers")
            .select("id")
            .in("name", workers);

          if (workersError) throw workersError;

          workerIds = (workersData || []).map((w) => w.id);
        }

        if (workerIds.length > 0) {
          const bookingWorkers = workerIds.map((workerId) => ({
            booking_id: id,
            worker_id: workerId,
          }));

          const { error: insertError } = await supabase.from("booking_workers").insert(bookingWorkers);

          if (insertError) throw insertError;
        }
      }
    }

    // Fetch updated booking with workers
    const { data: bookingWithWorkers, error: fetchError } = await supabase
      .from("bookings")
      .select("*, booking_workers(worker_id)")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Fetch worker names
    const workerIds = bookingWithWorkers.booking_workers?.map((bw) => bw.worker_id) || [];
    const { data: workersData } = await supabase.from("workers").select("id, name").in("id", workerIds);
    const workerMap = {};
    (workersData || []).forEach((w) => {
      workerMap[w.id] = w.name;
    });

    const result = {
      ...bookingWithWorkers,
      durationMinutes: bookingWithWorkers.duration_minutes,
      boxId: bookingWithWorkers.box_id,
      salaryPercent: bookingWithWorkers.salary_percent,
      workerIds: workerIds,
      workers: workerIds.map((id) => workerMap[id]).filter(Boolean),
      duration_minutes: undefined,
      box_id: undefined,
      salary_percent: undefined,
      booking_workers: undefined,
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookings/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("bookings").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

