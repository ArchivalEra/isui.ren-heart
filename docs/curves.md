# 曲线模板委托书（给 gemini 师傅）

> 项目：`isui.ren/heart`——三球开机动画（Rust + wasm32，Canvas 渲染）。
> 当前运动风格：`CLOUD_PROFILE`（云中心 Frenet 偏移 + EMA + 调速器）。
> 你的任务：**设计/重做曲线模板**，让三球的轨迹更优美、更灵动。

## 你只需要碰一个文件

`web-rust/src/config/templates.rs` —— 曲线模板唯一存放地（已经整理好，含校验测试）。

## 模板长什么样

```rust
pub struct Template {
    pub id: &'static str,        // 英文小写+下划线，唯一，≤16 字符
    pub name: &'static str,      // 中文名，≤8 字
    pub curvature: f64,          // 路径弯度，唯一的设计变量
}
```

## curvature 是什么

一段路径 = 贝塞尔弧：

```
ctrl = from + dir×(dist/2) + normal×dist×curvature×0.35
```

- `0` = 直线；正 = 左弯（暖色）；负 = 右弯（冷色）
- `0.1~0.3` = 微弯（优雅巡航）
- `0.4~0.8` = 明显转弯（灵动）
- `1.0~1.5` = 线圈/急转（花活，慎用）
- **硬性范围 [-1.6, 1.6]**，超出校验测试直接红

## 自动约束（你不需要处理）

- **曲率连续性**：相邻段切换时 |Δcurvature| ≤ 0.35 自动约束（不会出现直线突然接急转）
- **调速器**：段间速度差自动平滑
- **出屏保护**：链几何自动收缩到屏内

## 现有 14 模板评估（2026-08-04）

| id | name | curvature | 评估 |
|----|------|-----------|------|
| run | 直线 | 0.0 | 保留（基线） |
| sweep | 大转弯 | 0.65 | 好用，巡航主力 |
| wiggle | 微弯 | 0.22 | 好用 |
| glide | 滑翔弧 | 0.35 | 好用 |
| sprint | 直线冲刺 | 0.08 | 与 run 几乎重复，可考虑合并/替换 |
| sway | 摇摆弧 | 0.5 | 好用 |
| loop | 绕圈 | 0.6 | 好用 |
| zigzag | 锯齿 | -0.4 | 一般（单段贝塞尔锯齿感弱） |
| crawl | 缓弧 | 0.18 | 与 wiggle 接近 |
| dash | 折返 | -0.55 | 一般 |
| drift | 漂移 | 0.75 | 好用，大弯 |
| stroll | 散步弧 | 0.12 | 与 wiggle 接近 |
| **coil** | 线圈 | 1.5 | **待重做**（粗暴，欢迎更优美曲线替代） |
| **coil_r** | 反向线圈 | -1.5 | **待重做** |

## 创作指南

1. **多样性优先**：曲率覆盖均匀（-1.5 ~ +1.5 都有代表），避免同质化（现在 crawl/stroll/wiggle 太接近）
2. **注意实际效果**：模板是**单段贝塞尔**，curvature 大时弧会急转；想看效果用图谱：
   `/opt/reasonix-cradle/website-workplace/curves-gallery.html`（每个模板画出真实弧线）
3. **正负成对**：左弯模板最好有右弯镜像（如 coil ↔ coil_r），轨迹才对称
4. **数量建议**：12~18 个最佳（多了选择冗余，少了单调）
5. **命名**：id 见名知意（snake_case），name 中文两字最佳

## 怎么提交

1. 改 `TEMPLATES` 数组（增/删/改 curvature）
2. 同步改数组长度 `[Template; N]`
3. 验证：`cd web-rust && cargo test template_spec`（校验测试：id 合法唯一、curvature 在范围、数量 ≤40）
4. 目测：`./build.sh && python3 serve.py 8080` → http://localhost:8080/heart
5. 交给站主审核（他看效果，他会骂的，骂完改）

## 已知坑

- coil/coil_r 的 ±1.5 会导致急弯——CLOUD_PROFILE 下蓝绿 Frenet 偏移 0.05 仍安全（κ·d<1），但视觉上急转可能突兀——欢迎设计「柔和线圈」（如 1.0~1.2 + 名字更雅）
- 模板只是形状，**不要**试图在模板里加速度/摆动字段（已解耦，见 params.rs SPEED_BANDS）
