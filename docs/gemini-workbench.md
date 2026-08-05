# Gemini 佛祖工作台（可独立操作的战场总览）

> 你有眼睛（目测动画/拖尾）有电脑（cargo test / build.sh）——
> 以下战场全部可独立操作，互不干扰。改完跑 `cd web-rust && cargo test`
> + `cd web-ui && ./build.sh` 强刷目测即可；父代理负责验收集成。

## 战场 1：🏠 回家动画预渲染（感叹号——最高优先）

> **状态**：预渲染契约已定稿（docs/home-anim-design.md——并发子代理唯一契约）。
> ⚠️ 当前代码仍为链段化基线（`sim/home.rs` 的 `plan_home_legs/HomeCtx` +
> `planner.rs` 的 `extend_home_chain`）；契约 B/C/D 实施 + 父代理集成
> （契约 §7）落地后，以下描述生效——生效前别在 home.rs 找 `HomeAnim`。

- **文件**：`web-rust/src/sim/home.rs`（`plan_home_anim` + `HomeAnim`——唯一战场）
  + `web-rust/src/config/params.rs` 的 `HOME_ANIM_MS`（时长——Gemini 可调）
- **机制**（回家 = 预渲染动画——取代链段化）：三球触发回家时一次性生成
  `home::plan_home_anim(starts, anchors)`（纯函数）——每球一条 Bézier 路径
  `HomePath { from, ctrl, anchor }`，ctrl = 中点 + 法线偏移 × 性格弧度
  `PERSONALITIES[s].curv_bias`（爱大弯的球弧度大——个性保留）；统一时长
  `HOME_ANIM_MS`（三球相同——**时间对齐同时到家**）；播放期每帧
  `anim.sample(t)`（O(1)/帧——只查表，无链扫描），缓动 ease-in-out
  （起止速度 0）；播完三球同时 Resting → 同时重启
- **现象背景**：链段化时代回家触发时若在高速冲刺（1.1-1.3 档）会出现
  "感叹号"（拖尾与小球分离——已试无效史见 home.rs 头部）；预渲染按路径
  播放，无截断、无段边界速度跳（0.58）——根治方向
- **契约**（home_plan_contract 升级焊死）：① `sample(dur_ms)` = anchors
  （同时到家——精确）② 路径采样切线连续（无折角——拖尾无感叹号）
  ③ 起止速度 ≈ 0（ease-in-out——温和）
- **自由发挥**：弧线形状（ctrl 法线偏移 / curv_bias 权重）、时长
  （HOME_ANIM_MS）、缓动（ease_in_out）——只要守契约
- **验证**：`cargo test home_plan` + 强刷看回家冲刺瞬间（当前全量测试约
  57——契约实施后 home.rs 契约测试升级、总数再增）

## 战场 2：⚡ 渲染性能（压力大——你判断的主要战场）

- **文件**：`web-rust/src/config/params.rs`【Gemini 可操作区·渲染】（16 参数已集中）
- **数据**：`docs/render-performance.md`（每帧成本热点：18 次链扫描 + 96 次
  catmull + 3 次大 stroke——F 调查底稿）
- **方向建议**（供参考）：链扫描缓存/降频、拖尾采样降点、DPR 上限、
  clear 区域化、catmull 求值降频
- **验证**：目测流畅度 + 浏览器 performance 面板（若可）

## 战场 3：🎭 三球性格差异化（灵魂深化——参数战场已就绪）

- **文件**：`web-rust/src/config/params.rs`【Gemini 可操作区·性格】
  （PERSONALITIES 数组——代码支持已完成：模板选择按 curv_bias 加权、
  速度档钦定、跟随意愿 follow_prob 已接入）
- **现状**：粉球·领航（中立）/ 蓝球·绕圈（curv_bias +0.3——爱大弯）/
  绿球·巡航（curv_bias -0.2 + 巡航档——爱直路）
- **自由发挥**：调 bias 值、speed_band、follow_prob——甚至加"跳跃爱好者"
  （高速档钦定）性格——让三个孩子的"灵魂"肉眼可辨
- **验证**：`cargo test personality` + 强刷观察三球运动风格差异

## 战场 4：🎨 拖尾视觉艺术（你有眼睛的战场）

- **文件**：`web-rust/src/config/params.rs`【Gemini 可操作区·渲染】的 TRAIL_*
  参数 +（如需）`web-rust/src/animation/trail.rs`
- **现状**：大拖尾（8 点帧采样 + 间距截断 0.12 + 实心一次 stroke）、
  小拖尾（P 键切换——渐变/透明——纯视觉）
- **自由发挥**：拖尾宽度曲线、透明度渐隐、点密度、长度——注意三球
  彩色是设计一部分，拖尾可以更"艺术"
- **红线**：切换 P 键时只改拖尾视觉——不触 sim 逻辑（铁律）

## 战场 5：📐 曲线模板艺术（25 个已有——可继续）

- **文件**：`web-rust/src/config/params.rs`【Gemini 可操作区】TEMPLATES 数组
- **现状**：六主题梯队（run 0.0 → coil ±1.38，阶梯差 0.05-0.18）+ 高曲率
  钦定低速档（v²κ 降幅）——你的真经二版
- **自由发挥**：新增主题/微调曲率/调整速度钦定——`cargo test template_spec`
  校验 + 强刷目测

## 通用流程与红线

1. 改参数/数据 → `cd web-rust && cargo test`（契约测试全绿）
2. `cd web-ui && ./build.sh` → `python3 serve.py 8080` → 强刷 Ctrl+Shift+R
3. 红线：不碰 web-ui/、不碰 sim/planner.rs、sim/state.rs、sim/chain.rs 的
   逻辑（参数文件随便改；home.rs 随便改；trail.rs 谨慎改）
4. 中文提交信息（父代理执行——你给结论+建议）
