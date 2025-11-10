import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// GET /api/workers
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("workers").select("*").order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/workers
router.post("/", async (req, res, next) => {
  try {
    const { name, role } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    const { data, error } = await supabase
      .from("workers")
      .insert([{ name: name.trim(), role: role?.trim() || null }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/workers/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const updates = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Name must be a non-empty string" });
      }
      updates.name = name.trim();
    }
    if (role !== undefined) {
      updates.role = role?.trim() || null;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("workers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Worker not found" });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workers/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("workers").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

