# 01: 中间件里的对冲请求实测无效，但代码仍在线上

**What to build:** 决定 `site-root/middleware.js` 里的对冲逻辑（`HEDGE_DELAY_MS`）是删还是保留。

**实测证据（2026-10-25）**：EdgeOne 运行时的 `AbortController` **无法中断已发起的 fetch**。
判据：8s 超时该返回 502，实际返回 200 且耗时跑满 40s；对冲第二发也无法缩短卡住耗时。

后果：那段代码给每个小文件请求多造一个 AbortController 与计时器，**零收益**。
而协议侧已把它定性为「禁止在 EdgeOne middleware/worker 内做对冲」（负面判据）。

**Settling:** 不存在 —— **第一交付物就是删掉这段死代码**（或给出它能生效的证据）。
判据：`grep -c 'HEDGE_DELAY_MS' site-root/middleware.js` 等于 0。

**Status:** ready-for-agent
