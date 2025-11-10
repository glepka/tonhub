import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// GET /api/services
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*, service_workers(worker_id)")
      .order("date_iso", { ascending: false });

    if (error) throw error;

    const services = (data || []).map((service) => ({
      ...service,
      workerIds: service.service_workers?.map((sw) => sw.worker_id) || [],
      service_workers: undefined,
    }));

    res.json(services);
  } catch (err) {
    next(err);
  }
});

// POST /api/services
router.post("/", async (req, res, next) => {
  try {
    const { title, price, percent, dateISO, workerIds } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: "Price must be a non-negative number" });
    }

    const percentNum = Number(percent);
    if (!Number.isFinite(percentNum) || percentNum < 0 || percentNum > 100) {
      return res.status(400).json({ error: "Percent must be between 0 and 100" });
    }

    if (!dateISO || Number.isNaN(new Date(dateISO).getTime())) {
      return res.status(400).json({ error: "Valid dateISO is required" });
    }

    if (!Array.isArray(workerIds) || workerIds.length === 0) {
      return res.status(400).json({ error: "At least one workerId is required" });
    }

    // Create service
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .insert([
        {
          title: title.trim(),
          price: priceNum,
          percent: percentNum,
          date_iso: new Date(dateISO).toISOString(),
        },
      ])
      .select()
      .single();

    if (serviceError) throw serviceError;

    // Create service_workers relationships
    if (workerIds.length > 0) {
      const serviceWorkers = workerIds.map((workerId) => ({
        service_id: service.id,
        worker_id: workerId,
      }));

      const { error: swError } = await supabase.from("service_workers").insert(serviceWorkers);

      if (swError) throw swError;
    }

    // Fetch service with workers
    const { data: serviceWithWorkers, error: fetchError } = await supabase
      .from("services")
      .select("*, service_workers(worker_id)")
      .eq("id", service.id)
      .single();

    if (fetchError) throw fetchError;

    const result = {
      ...serviceWithWorkers,
      workerIds: serviceWithWorkers.service_workers?.map((sw) => sw.worker_id) || [],
      service_workers: undefined,
    };

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /api/services/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, price, percent, dateISO, workerIds } = req.body;

    const updates = {};
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ error: "Title must be a non-empty string" });
      }
      updates.title = title.trim();
    }
    if (price !== undefined) {
      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: "Price must be a non-negative number" });
      }
      updates.price = priceNum;
    }
    if (percent !== undefined) {
      const percentNum = Number(percent);
      if (!Number.isFinite(percentNum) || percentNum < 0 || percentNum > 100) {
        return res.status(400).json({ error: "Percent must be between 0 and 100" });
      }
      updates.percent = percentNum;
    }
    if (dateISO !== undefined) {
      if (Number.isNaN(new Date(dateISO).getTime())) {
        return res.status(400).json({ error: "Valid dateISO is required" });
      }
      updates.date_iso = new Date(dateISO).toISOString();
    }

    updates.updated_at = new Date().toISOString();

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (serviceError) throw serviceError;
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Update worker relationships if provided
    if (workerIds !== undefined) {
      if (!Array.isArray(workerIds)) {
        return res.status(400).json({ error: "workerIds must be an array" });
      }

      // Delete existing relationships
      const { error: deleteError } = await supabase.from("service_workers").delete().eq("service_id", id);

      if (deleteError) throw deleteError;

      // Create new relationships
      if (workerIds.length > 0) {
        const serviceWorkers = workerIds.map((workerId) => ({
          service_id: id,
          worker_id: workerId,
        }));

        const { error: insertError } = await supabase.from("service_workers").insert(serviceWorkers);

        if (insertError) throw insertError;
      }
    }

    // Fetch updated service with workers
    const { data: serviceWithWorkers, error: fetchError } = await supabase
      .from("services")
      .select("*, service_workers(worker_id)")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const result = {
      ...serviceWithWorkers,
      workerIds: serviceWithWorkers.service_workers?.map((sw) => sw.worker_id) || [],
      service_workers: undefined,
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/services/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

