# ADR-0001: 多层边缘 fallback 架构

- 日期：2026-08-02
- 状态：已接受

## 背景

isui.ren 是 tayori 乐队的粉丝站（文章 + 图片），为国内用户提供访问 tayori 的 X / YouTube / 官网的入口。目标用户在国内，内容合规（无政治/三害），流量以 HTML/JS/图片为主，无视频流需求。

## 决策

边缘层采用「主 + 两级 fallback」链：

```
EdgeOne 国际版免费档（主）
  → Cloudflare（优选 IP + for SaaS）（fallback 1）
  → 凤凰城 VPS（fallback 2，最终兜底）
```

- 主链路：EdgeOne 免费档，$0，无限流量，大陆连通性最优（腾讯自营线路）
- fallback 1：CF，域名 DNS 留在 dnspod（for SaaS custom hostname），A 记录指向优选 IP
- fallback 2：凤凰城 VPS（Oracle PAYG，2Gbps / 20T），存储大，最后兜底
- 东京 Azure 学生机曾列入 fallback 2，因学生优惠到期不确定性已踢出（2026-08-02）
- 国内盒子（hi3798mv300，电信家宽）明确**不参与转发**（实名设备，法律风险不可接受）
- 切换机制：DNS 层切换（dnspod 可控解析），初期手动

## 为什么（trade-off）

| 候选 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| EdgeOne 免费档 | 免费无限流量、大陆体验好、无备案 | 禁视频/大文件（本项目无视频，不触发）、limited beta、无 SLA | 主 |
| CF（for SaaS + 优选） | 免费、稳定、优选 IP 改善大陆连通 | 大陆连通性不如 EdgeOne 自营线路、需要优选维护 | fallback 1 |
| 东京 Azure（已踢出） | 免费（学生）、近大陆 | 优惠到期不确定、仅 100G 出站 | 排除 |
| 凤凰城 VPS | 2Gbps/20T、存储大、可控 | 跨境线路质量一般 | fallback 2 |
| 国内盒子 | 国内直连体验最好 | 实名设备转发被墙内容，法律风险不可逆 | 排除 |

## 后果

- 主链路挂掉时，dnspod 解析切换到 CF 优选层
- X/YouTube 反代的风控问题（JS 挑战等）与边缘层无关，属于实现期待验证项
- EdgeOne 免费档处于 limited beta，存在条款变更/停服风险，fallback 链即为此设计
