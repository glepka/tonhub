import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// GET /api/boxes
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("boxes").select("*").order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/boxes
router.post("/", async (req, res, next) => {
  try {
    const { number, description } = req.body;

    if (!number || typeof number !== "string" || number.trim().length === 0) {
      return res.status(400).json({ error: "Number is required" });
    }

    const { data, error } = await supabase
      .from("boxes")
      .insert([{ number: number.trim(), description: description?.trim() || null }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/boxes/:id
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { number, description } = req.body;

    const updates = {};
    if (number !== undefined) {
      if (typeof number !== "string" || number.trim().length === 0) {
        return res.status(400).json({ error: "Number must be a non-empty string" });
      }
      updates.number = number.trim();
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("boxes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Box not found" });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/boxes/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("boxes").delete().eq("id", id);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;

