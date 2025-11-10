import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// GET /api/settings
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("settings").select("*").limit(1).single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // If no settings exist, return default
    if (!data) {
      return res.json({ salaryPercent: 50 });
    }

    res.json({
      salaryPercent: Number(data.salary_percent) || 50,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings
router.put("/", async (req, res, next) => {
  try {
    const { salaryPercent } = req.body;

    if (salaryPercent === undefined) {
      return res.status(400).json({ error: "salaryPercent is required" });
    }

    const percentNum = Number(salaryPercent);
    if (!Number.isFinite(percentNum) || percentNum < 0 || percentNum > 100) {
      return res.status(400).json({ error: "salaryPercent must be between 0 and 100" });
    }

    // Check if settings exist
    const { data: existing } = await supabase.from("settings").select("id").limit(1).single();

    const updates = {
      salary_percent: percentNum,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from("settings")
        .update(updates)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase.from("settings").insert([updates]).select().single();

      if (error) throw error;
      result = data;
    }

    res.json({
      salaryPercent: Number(result.salary_percent) || 50,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

