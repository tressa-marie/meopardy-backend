import { Router } from "express";
import { markClueAnswered } from "./clue.repository.js";

export const clueRouter = Router();

clueRouter.patch("/:clueId/answered", (req, res) => {
  const clueId = Number(req.params.clueId);

  if (Number.isNaN(clueId)) {
    return res.status(400).json({
      message: "Invalid clue ID"
    });
  }

  const updated = markClueAnswered(clueId);

  if (!updated) {
    return res.status(404).json({
      message: "Clue not found"
    });
  }

  return res.json({
    message: "Clue marked as answered",
    clueId,
    isAnswered: true
  });
});
