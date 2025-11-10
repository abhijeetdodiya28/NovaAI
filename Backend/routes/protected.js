import express from "express";
const router = express.Router();

router.get("/profile", (req, res) => {
    res.json({ success: true, user: req.user });
});

export default router;
