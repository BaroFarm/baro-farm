function ok(text, cards = [], followups = []) {
  return {
    reply: { text, cards, followups },
    text,
    cards,
    followups
  };
}

function need(params = {}, keys = []) {
  const miss = keys.filter(
    k => params[k] === undefined || params[k] === null || params[k] === ""
  );
  if (miss.length) {
    return {
      error: true,
      ...ok(`필수 정보: ${miss.join(", ")}`)
    };
  }
  return { error: false };
}

module.exports = { ok, need };
