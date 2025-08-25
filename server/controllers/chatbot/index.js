const express = require("express");
const router = express.Router();
const { handleMenu } = require("./menus");
const { routeWithLLM } = require("./llmRouter");
const { ok } = require("./utils"); 
const { optionalAuth } = require("../../middlewares/authMiddleware");


// POST /api/chat
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { type, menu_id, message, params } = req.body || {};
    const user = req.user || null;

    // 메뉴 클릭 처리
    if (type === "menu" && menu_id) {
      const out = await handleMenu(menu_id, params || {}, user);
      return res.json(out);
    }

    // 자유 질문
    if (type === "free_text" && typeof message === "string" && message.trim()) {
      const routed = await routeWithLLM(message, user);

      if (routed.mode === "menu") {
        const out = await handleMenu(routed.menu_id, routed.params || {}, user);
        return res.json(out);
      }
      // 직접 답변
      return res.json({
        reply: {
          text:
            routed.answer ||
            "현재 답변을 준비하지 못했습니다. 고객센터(1588-0000)로 문의 부탁드립니다.",
          cards: [],
          followups: []
        }
      });
    }

    // 잘못된 요청
    return res.status(400).json({
      status: "error",
      error: { code: "BAD_REQUEST", message: "`type` 또는 필요한 필드가 누락되었습니다." }
    });
  } catch (err) {
        console.error(err);
        return res.status(500).json({ 
            status: 'error',
            code: 'SERVER_ERROR',
            message: '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
    }
});

module.exports = router;
