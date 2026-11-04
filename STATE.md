# isui.ren-heart（边缘部署仓）· 活状态

> **main = 源码，deploy = 构建产物。** Einfacht 只跟 main 跑；deploy 每次被孤儿重建。
> 机器块由 `zreflect/facts.py --render-doc` 渲染，不要手改。

## 现在是什么

- **中间件**：[[middleware_lines]] 行，含 [[middleware_routes]] 条按 pathname 的路由分支。
- **站点根**：[[site_root_files]] 个根级静态文件（EdgeOne 直出）。
- **边缘函数**：[[edge_functions]] 个（独立于 middleware）。
- **Rust wasm 引擎**：[[rust_sources]] 个源文件。

## 怎么跑

```bash
python3 zreflect/facts.py                        # 重测并写台账
python3 zreflect/facts.py --render-doc STATE.md  # 渲染机器块
python3 zreflect/registry.py --run commit        # 全部闸门
sh gates-selftest.sh                             # 闸门自证
```

## 已知边界

- **deploy 分支不装 Einfacht**：它是每次重建的产物分支，装任何钩子都会在下次构建时消失。
- 中间件里的对冲逻辑**2026-10-31 复测有效**（20/20 正常、最慢 4.75s）；此前判为「死代码」的结论已翻案，见 `questions/01`。

<!-- AUTO:FACTS -->
> 本区块由 `zreflect/facts.py --render-doc` 从 `FACTS.json` 渲染，**不要手改**（pre-commit 会重算并 `git add`）。
> 正文里的「测出来的数字」只在这里生产：要引用就写 `[[键名]]`，不要手抄数字。

| 键 | 值 | 测于 | 复跑命令 |
|---|---|---|---|
| `edge_functions` | **2** | 2026-11-04T14:33:31+0800 | `find site-root/edge-functions -name '*.js' 2>/dev/null | wc -l` |
| `middleware_lines` | **879** | 2026-11-04T14:33:31+0800 | `wc -l < site-root/middleware.js` |
| `middleware_routes` | **5** | 2026-11-04T14:33:31+0800 | `grep -cE 'url\.pathname[[:space:]]*===?[[:space:]]*"' site-root/middleware.js` |
| `rust_sources` | **15** | 2026-11-04T14:33:31+0800 | `find web-rust -name '*.rs' -not -path '*/target/*' | wc -l` |
| `site_root_files` | **6** | 2026-11-04T14:33:31+0800 | `find site-root -maxdepth 1 -type f ! -name '.*' | wc -l` |

5 条事实。
<!-- /AUTO:FACTS -->

<!-- AUTO:GATES -->
> 本区块由 `zreflect/facts.py --render-doc` 从发现式名录（zreflect/registry.py 的声明行）渲染，**不要手改**。
> 执行面（hooks / CI）读 `registry --run <相位>` —— 相位是声明字段（`runs_at`），不是文件名。

| 闸门 | 相位 | 它挡住什么 | 消费的旋钮 |
|---|---|---|---|
| `check_ab.py`（A/B 闸门） | commit | A/B 同旗标不变式（非 allow 轴差异 = 混淆变量，A/B 作废） | `REFLECT_AB` |
| `check_envfile.py`（env 文件闸门） | commit | 守钩子的 REFLECT_* 载体（旋钮 typo / 指向缺失 / 空值） | `REFLECT_ENV_FILE` |
| `check_facts.py`（事实闸门） | commit | 块一致性 / 裸数字 / 坏引用 | `REFLECT_FACTS`, `REFLECT_DOC`, `REFLECT_NAKED_MIN` |
| `check_facts_replay.py`（复跑闸门） | commit | 台账 cmd 逐字复跑（裸值契约：stdout 必须等于值） | `REFLECT_FACTS`, `REFLECT_REPLAY`, `REFLECT_REPLAY_TIMEOUT` |
| `check_instruments.py`（仪器生命周期闸门） | commit | 恒常检测（first_seen）+ 被证伪量法登记 | `REFLECT_INSTRUMENTS`, `REFLECT_INSTRUMENT_DAYS`, `REFLECT_FACTS` |
| `check_invariants.py`（不变量闸门） | commit | 声明式不变量：仓库文件必须/不得含某片段（grep 级） | `REFLECT_INVARIANTS` |
| `check_locks.py`（锁定源闸门） | commit | 锁定源清单（URL + 文件 + sha256 的内容指纹） | `REFLECT_LOCKS` |
| `check_pins.py`（pin 闸门） | commit | 派生树 pin 一致性（stamp commit / dirty / 版本串对读） | `REFLECT_PINS` |
| `check_questions.py`（悬案闸门） | commit | 未结案的问题必须挂一个能跑的结算件 | `REFLECT_QUESTIONS` |
| `check_readme_sync.py`（三语 README 闸门） | commit | 语言版本是同一条断言的三份拷贝：结构互链 + 每次推送同批 | `REFLECT_READMES` |
| `check_retractions.py`（翻案重现检测） | commit | 被推翻的断言不许悄悄回来当现状 | `REFLECT_RETRACTIONS`, `REFLECT_DOCS`, `REFLECT_HISTORY_SECS` |
| `check_stale.py`（陈旧断言检测） | commit | sha 出处 / 退役名 / 测龄 | `REFLECT_DOCS`, `REFLECT_FACTS`, `REFLECT_HISTORY_SECS`, `REFLECT_RETIRED`, `REFLECT_STALE_DAYS` |
| `check_world.py`（world 闸门） | commit | 声明式验证对象：多线仓库共享验证环境的世界对账 | `REFLECT_WORLD`, `REFLECT_WORLD_LINE` |
| `doctor.py`（开工预检 doctor） | start-of-work | 进程 / 端口活性（查会死的东西 ⇒ runs_at=start-of-work，不进 pre-commit） | `REFLECT_DOCTOR`, `REFLECT_DOCTOR_TIMEOUT` |

14 道闸门（发现式名录派生 —— 手写清单会漂，加闸门 = 落一个声明行，这里自动长出来）。
<!-- /AUTO:GATES -->
