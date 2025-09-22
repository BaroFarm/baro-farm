const express = require("express");
const path = require("path");
const router = express.Router();

// // 테스트 HTML 라우트 먼저
// router.get("/tester", (req, res) => {
//   res.sendFile(path.join(__dirname, "../controllers/chatbot/tester.html"));
// });

const chatbot = require("../controllers/chatbot");
router.use("/", chatbot);

module.exports = router;
