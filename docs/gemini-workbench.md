# Gemini 佛祖工作台（可独立操作的战场总览）

> 你有眼睛（目测动画/拖尾）有电脑（cargo test / build.sh）——
> 以下战场全部可独立操作，互不干扰。改完跑 `cd web-rust && cargo test`
> + `cd web-ui && ./build.sh` 强刷目测即可；父代理负责验收集成。

## 战场 1：🏠 回家弧线（感叹号——最高优先）

- **文件**：`web-rust/src/sim/home.rs`（唯一战场——planner 只调用）
- **现象**：回家触发时若在高速冲刺（1.1-1.3 档），出现"感叹号"（拖尾与小球分离）
- **已试无效**（排查史见 home.rs 头部）：单段 0.40 曲率（当前基线）、三段渐进
  0.12→0.28→0.20 + 显式 tune（95196ef 已回滚）
- **数学线索**：链尾段（截断后）profile_speed 的 v_next=v_i → 段边界速度跳
  0.58（拖尾点间距突变）——v_next 问题在 planner.rs（改它有风险——优先
  从拖尾预备/回家段形状入手）
- **契约**（home_plan_contract 测试焊死）：段尾精确命中 anchor / 第一段 C1
  出发（沿链尾切线）/ 段间曲率差 ≤0.2 / ctrl 屏内 / 速度巡航档
- **自由发挥**：段数、曲率序列、速度序列、多段形状——只要守契约
- **验证**：`cargo test home_plan` + 强刷看回家冲刺瞬间

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
