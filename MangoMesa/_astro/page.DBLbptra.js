const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Swup.okfGCf0T.js","_astro/Swup.modern.C2CFcRcI.js","_astro/SwupA11yPlugin.DvfTARzg.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.SkV6a72Q.js","_astro/SwupScrollPlugin.CznjUOSB.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as he}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{$ as m,A as Ea,F as j,I as Sa,J as n,K as b,L as Ce,M as za,N as S,O as Da,P as dt,S as M,V as e,X as u,Y as de,Z as Aa,a as Ca,b as at,et as U,f as rt,g as La,h as J,it as Ma,j as p,k as h,m as Oa,nt as P,ot as Ct,q as qa,rt as Va,st as i,t as je,w as Fa,y as it}from"./client.CVK8X0vf.js";var Pa=`
/* ------------------------------------------------------------
   WhatImDoing Capsule Styles (Self-Contained & Production-Ready)
   ------------------------------------------------------------ */

.wid-capsule-wrapper {
	position: relative;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 0.75rem;
	z-index: 30;
	pointer-events: auto;
}

/* 经典药丸胶囊主体 (Pill Capsule Shape) */
.wid-capsule {
	display: inline-flex;
	align-items: center;
	gap: 0.45rem;
	min-height: 34px;
	padding: 0.25rem 0.85rem;
	border-radius: 9999px !important;
	background: var(--surface-container-high, color-mix(in oklab, var(--primary, #6750a4) 10%, var(--card-bg, #ffffff)));
	color: var(--on-surface, #1c1b1f);
	border: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.12));
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
	font-size: 0.75rem;
	font-weight: 500;
	cursor: pointer;
	text-decoration: none;
	user-select: none;
	max-width: min(100%, 260px);
	box-sizing: border-box;
	touch-action: manipulation;
	-webkit-tap-highlight-color: transparent;
	transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
	backdrop-filter: none !important;
	-webkit-backdrop-filter: none !important;
}

.wid-capsule:hover {
	background: color-mix(in oklab, var(--primary, #6750a4) 18%, var(--card-bg, #ffffff));
	border-color: var(--primary, #6750a4);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	transform: translateY(-1.5px);
}

.wid-capsule:active {
	transform: scale(0.97);
}

.wid-capsule--offline {
	background: var(--surface-container-low, rgba(0, 0, 0, 0.04));
	color: var(--on-surface-variant, #49454f);
	border-color: var(--outline-variant, rgba(0, 0, 0, 0.1));
}

.wid-capsule--loading {
	background: var(--surface-container-low, rgba(0, 0, 0, 0.04));
	color: var(--on-surface-variant, #49454f);
	opacity: 0.88;
}

.wid-capsule--error {
	background: var(--surface-container-low, rgba(0, 0, 0, 0.04));
	color: var(--on-surface-variant, #49454f);
	border-color: var(--outline-variant, rgba(0, 0, 0, 0.1));
}

/* 状态圆点 (Status Dot) */
.wid-capsule__dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	background: #9ca3af;
	flex-shrink: 0;
	transition: background-color 0.25s ease;
}

.wid-capsule__dot--pulse {
	background: var(--primary, #6750a4) !important;
	box-shadow: 0 0 6px var(--primary, #6750a4);
	animation: wid-pulse 1.2s infinite ease-in-out;
}

.wid-capsule__dot--active {
	background: #10b981 !important;
	box-shadow: 0 0 6px #10b981;
	animation: wid-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

.wid-capsule__dot--idle {
	background: #f59e0b !important;
}

.wid-capsule__dot--offline {
	background: #9ca3af !important;
}

@keyframes wid-pulse {
	0%, 100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.65;
		transform: scale(1.2);
	}
}

/* 胶囊文本区域 (单行截断，高质感，防止下伸笔画被截断) */
.wid-capsule__text {
	display: inline-flex;
	align-items: baseline;
	gap: 0.25rem;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	flex: 1 1 auto;
	min-width: 0;
	line-height: 1.6;
	padding-top: 2px;
	padding-bottom: 5px;
}

.wid-capsule__prefix {
	opacity: 0.72;
	font-weight: 400;
	flex-shrink: 0;
	line-height: inherit;
}

.wid-capsule__app {
	font-weight: 600;
	color: var(--primary, #6750a4);
	line-height: inherit;
}

.wid-capsule--offline .wid-capsule__app {
	color: inherit;
	font-weight: 500;
}

.wid-capsule__sep {
	opacity: 0.45;
	flex-shrink: 0;
}

.wid-capsule__title {
	opacity: 0.85;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-weight: 400;
}

.wid-capsule__at {
	opacity: 0.55;
	font-weight: 400;
	margin: 0 1px;
	flex-shrink: 0;
}

.wid-capsule__device {
	opacity: 0.85;
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.wid-capsule__media-icon {
	flex-shrink: 0;
	font-size: 0.75rem;
}

/* 微型箭头指示器 */
.wid-capsule__chevron {
	flex-shrink: 0;
	color: var(--on-surface-variant, #49454f);
	opacity: 0.7;
	transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.wid-capsule__chevron--open {
	transform: rotate(180deg);
}

/* ------------------------------------------------------------
   Portal 遮罩与弹窗容器
   ------------------------------------------------------------ */

.wid-portal-layer {
	position: fixed !important;
	inset: 0 !important;
	z-index: 10000 !important;
	pointer-events: none !important;
}

.wid-scrim {
	position: fixed !important;
	inset: 0 !important;
	background: rgba(0, 0, 0, 0.38) !important;
	backdrop-filter: none !important;
	-webkit-backdrop-filter: none !important;
	pointer-events: auto !important;
	touch-action: none;
	animation: wid-fade-in 0.2s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes wid-fade-in {
	from { opacity: 0; }
	to { opacity: 1; }
}

/* ------------------------------------------------------------
   桌面端：胶囊上方上浮展开 (Lift-up & Expand)
   ------------------------------------------------------------ */
@media (min-width: 768px) {
	.wid-panel {
		position: fixed !important;
		bottom: clamp(16px, var(--anchor-bottom, 200px), calc(100vh - 440px)) !important;
		left: var(--anchor-left, 50%) !important;
		transform: translate(-50%, -16px) !important;
		width: min(92vw, 420px) !important;
		max-height: min(78vh, calc(var(--anchor-bottom, 200px) + 20px)) !important;
		background: var(--card-bg, #ffffff) !important;
		border: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.14)) !important;
		border-radius: 18px !important;
		box-shadow: 0 16px 44px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.06) !important;
		z-index: 10001 !important;
		pointer-events: auto !important;
		display: flex !important;
		flex-direction: column !important;
		overflow: hidden !important;
		transform-origin: bottom center;
		animation: wid-desktop-lift 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
	}

	@keyframes wid-desktop-lift {
		from {
			opacity: 0;
			transform: translate(-50%, 0) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translate(-50%, -16px) scale(1);
		}
	}

	.wid-panel__drag-handle {
		display: none !important;
	}
}

/* ------------------------------------------------------------
   移动端：原生 Material 3 底部抽屉 (Modal Bottom Sheet)
   ------------------------------------------------------------ */
@media (max-width: 767.98px) {
	.wid-panel {
		position: fixed !important;
		bottom: 0 !important;
		left: 0 !important;
		right: 0 !important;
		top: auto !important;
		transform: translateY(0) !important;
		width: 100% !important;
		max-height: min(82vh, 82dvh) !important;
		background: var(--card-bg, #ffffff) !important;
		border-radius: 24px 24px 0 0 !important;
		border: none !important;
		border-top: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.12)) !important;
		box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.22) !important;
		z-index: 10001 !important;
		pointer-events: auto !important;
		display: flex !important;
		flex-direction: column !important;
		overflow: hidden !important;
		touch-action: manipulation;
		animation: wid-mobile-slide-up 0.24s cubic-bezier(0.1, 0.9, 0.2, 1) !important;
	}

	@keyframes wid-mobile-slide-up {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	.wid-panel__drag-handle {
		display: block !important;
		width: 36px;
		height: 4px;
		border-radius: 9999px;
		background: var(--outline-variant, rgba(0, 0, 0, 0.25));
		margin: 10px auto 4px;
		flex-shrink: 0;
	}
}

/* ------------------------------------------------------------
   面板内部结构与组件样式
   ------------------------------------------------------------ */

.wid-panel__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.75rem 1rem 0.5rem;
	border-bottom: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.08));
	flex-shrink: 0;
}

.wid-panel__title {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	font-size: 0.875rem;
	font-weight: 600;
	color: var(--primary, #6750a4);
	min-width: 0;
}

.wid-panel__title span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.wid-panel__actions {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.35rem;
	flex-shrink: 0;
}

/* 刷新动态微胶囊 (点击向左平滑展开，收起时为标准圆形按钮) */
.wid-panel__refresh-pill {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0;
	height: 28px;
	min-width: 28px;
	max-width: 28px;
	border-radius: 9999px;
	background: none;
	border: 1px solid transparent;
	color: var(--on-surface-variant, #49454f);
	cursor: pointer;
	padding: 0 7px;
	white-space: nowrap;
	overflow: hidden;
	transition: max-width 0.32s cubic-bezier(0.2, 0, 0, 1),
	            background-color 0.2s ease,
	            border-color 0.2s ease,
	            color 0.2s ease,
	            padding 0.25s ease,
	            gap 0.25s ease;
	user-select: none;
	-webkit-tap-highlight-color: transparent;
	box-sizing: border-box;
}

.wid-panel__refresh-pill:hover {
	background: var(--surface-container-high, rgba(0, 0, 0, 0.06));
	color: var(--on-surface, #1c1b1f);
}

.wid-panel__refresh-pill:disabled {
	cursor: default;
}

.wid-panel__refresh-pill--expanded {
	max-width: 140px;
	gap: 0.35rem;
	padding: 0 10px 0 8px;
	background: var(--secondary-container, rgba(103, 80, 164, 0.1));
	border-color: var(--outline-variant, rgba(103, 80, 164, 0.25));
	color: var(--primary, #6750a4);
}

.wid-panel__refresh-pill--cooldown {
	max-width: 175px;
	gap: 0.35rem;
	padding: 0 10px 0 8px;
	background: rgba(245, 158, 11, 0.12);
	border-color: rgba(245, 158, 11, 0.3);
	color: #b45309;
}

.wid-panel__refresh-pill--done {
	max-width: 95px;
	gap: 0.35rem;
	padding: 0 10px 0 8px;
	background: rgba(16, 185, 129, 0.12);
	border-color: rgba(16, 185, 129, 0.3);
	color: #059669;
}

.wid-panel__refresh-label {
	font-size: 0.72rem;
	font-weight: 500;
	line-height: 1;
	opacity: 0;
	transform: translateX(4px);
	transition: opacity 0.2s ease 0.05s, transform 0.2s ease 0.05s;
	pointer-events: none;
	white-space: nowrap;
}

.wid-panel__refresh-pill--expanded .wid-panel__refresh-label {
	opacity: 1;
	transform: translateX(0);
}

.wid-panel__btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	background: none;
	border: none;
	width: 28px;
	height: 28px;
	border-radius: 6px;
	color: var(--on-surface-variant, #49454f);
	cursor: pointer;
	transition: background-color 0.15s ease, color 0.15s ease;
	padding: 0;
}

.wid-panel__btn:hover {
	background: var(--surface-container-high, rgba(0, 0, 0, 0.06));
	color: var(--on-surface, #1c1b1f);
}

.wid-panel__btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.wid-panel__refresh-icon--spin {
	animation: wid-spin 0.8s linear infinite;
}

@keyframes wid-spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

/* 内容滚动容器 (独立惯性触摸滚动) */
.wid-panel__body {
	flex: 1 1 auto;
	overflow-y: auto !important;
	-webkit-overflow-scrolling: touch;
	overscroll-behavior: contain;
	touch-action: pan-y;
	padding: 0.875rem 1rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

@media (max-width: 767.98px) {
	.wid-panel__body {
		padding-bottom: max(1.5rem, env(safe-area-inset-bottom, 24px));
	}
}

/* 当前焦点设备概览卡片 */
.wid-current-card {
	background: var(--surface-container-low, rgba(0, 0, 0, 0.03));
	border-radius: 12px;
	padding: 0.75rem;
	border: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.08));
}

.wid-current-card--offline {
	opacity: 0.9;
	background: rgba(0, 0, 0, 0.02);
}

.wid-current-card__head {
	display: flex;
	align-items: center;
	gap: 0.4rem;
	margin-bottom: 0.375rem;
	flex-wrap: wrap;
}

.wid-current-card__appname {
	font-size: 0.85rem;
	color: var(--on-surface, #1c1b1f);
}

.wid-tag {
	display: inline-block;
	font-size: 0.6875rem;
	font-weight: 600;
	padding: 0.125rem 0.45rem;
	border-radius: 6px;
}

.wid-tag--primary {
	background: var(--primary-container, #eaddff);
	color: var(--on-primary-container, #21005d);
}

.wid-tag--muted {
	background: rgba(0, 0, 0, 0.08);
	color: var(--on-surface-variant, #49454f);
}

.wid-current-card__device {
	font-size: 0.75rem;
	color: var(--on-surface-variant, #49454f);
}

.wid-current-card__media {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	margin-bottom: 0.375rem;
	padding: 0.25rem 0.5rem;
	background: var(--surface-container-high, rgba(0, 0, 0, 0.04));
	border-radius: 6px;
	font-size: 0.75rem;
}

.wid-current-card__media-icon {
	flex-shrink: 0;
	font-size: 0.8125rem;
	line-height: 1;
}

.wid-current-card__media-text {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	color: var(--on-surface-variant, #49454f);
	font-weight: 500;
}

.wid-current-card__window-title {
	font-size: 0.8125rem;
	color: var(--on-surface, #1c1b1f);
	font-style: italic;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-bottom: 0.25rem;
}

.wid-current-card__footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 0.35rem;
	font-size: 0.6875rem;
	color: var(--on-surface-variant, #49454f);
	flex-wrap: wrap;
	gap: 0.25rem;
}

.wid-current-card__active-hint {
	color: #10b981;
	font-weight: 500;
}

.wid-current-card__os-info {
	opacity: 0.75;
}

/* 舰队分组与设备卡片 */
.wid-fleet {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.wid-group {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.wid-group__header {
	display: flex;
	align-items: center;
	gap: 0.35rem;
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--on-surface-variant, #49454f);
	padding: 0 0.25rem;
}

.wid-group__count {
	font-size: 0.6875rem;
	background: var(--surface-container-high, rgba(0, 0, 0, 0.06));
	padding: 0 0.35rem;
	border-radius: 9999px;
}

.wid-group__grid {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.wid-device-card {
	background: var(--surface-container-lowest, rgba(0, 0, 0, 0.02));
	border: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.06));
	border-radius: 10px;
	padding: 0.625rem 0.75rem;
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.wid-device-card--active {
	border-color: color-mix(in oklab, #10b981 35%, transparent);
	background: color-mix(in oklab, #10b981 5%, var(--card-bg, #ffffff));
}

.wid-device-card--offline {
	opacity: 0.75;
}

.wid-device-card__head {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.wid-device-card__name-wrapper {
	display: flex;
	align-items: center;
	gap: 0.35rem;
	font-size: 0.8125rem;
	font-weight: 600;
	color: var(--on-surface, #1c1b1f);
}

.wid-device-card__dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #9ca3af;
}

.wid-device-card__dot--active {
	background: #10b981;
}

.wid-device-card__dot--idle {
	background: #f59e0b;
}

.wid-device-card__badge {
	font-size: 0.6875rem;
	padding: 0.0625rem 0.35rem;
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.05);
	color: var(--on-surface-variant, #49454f);
}

.wid-device-card__badge--active {
	background: rgba(16, 185, 129, 0.15);
	color: #059669;
	font-weight: 600;
}

.wid-device-card__badge--idle {
	background: rgba(245, 158, 11, 0.15);
	color: #d97706;
}

.wid-device-card__body {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	font-size: 0.75rem;
}

.wid-device-card__app {
	display: flex;
	align-items: center;
	gap: 0.25rem;
	color: var(--on-surface, #1c1b1f);
}

.wid-device-card__app-title {
	font-weight: 600;
}

.wid-device-card__win-title {
	opacity: 0.8;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.wid-device-card__time {
	font-size: 0.6875rem;
	color: var(--on-surface-variant, #49454f);
	opacity: 0.8;
}

.wid-device-card__abs-time {
	margin-left: 0.25rem;
	opacity: 0.7;
}

/* 历史时间轴 */
.wid-history {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
}

.wid-history__title {
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--on-surface-variant, #49454f);
	padding: 0 0.25rem;
}

.wid-timeline {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	border-left: 2px solid var(--outline-variant, rgba(0, 0, 0, 0.08));
	margin-left: 0.5rem;
	padding-left: 0.75rem;
}

.wid-timeline__item {
	position: relative;
}

.wid-timeline__dot {
	position: absolute;
	left: -0.9375rem;
	top: 0.3125rem;
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: var(--primary, #6750a4);
}

.wid-timeline__content {
	display: flex;
	flex-direction: column;
	gap: 0.125rem;
	font-size: 0.75rem;
}

.wid-timeline__row {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.wid-timeline__app {
	font-weight: 600;
	color: var(--on-surface, #1c1b1f);
}

.wid-timeline__time {
	font-size: 0.6875rem;
	color: var(--on-surface-variant, #49454f);
	opacity: 0.75;
}

.wid-timeline__title {
	font-size: 0.6875rem;
	color: var(--on-surface-variant, #49454f);
	font-style: italic;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.wid-timeline__device {
	font-size: 0.625rem;
	color: var(--on-surface-variant, #49454f);
	opacity: 0.6;
}

/* 空状态与底栏 */
.wid-panel__empty {
	text-align: center;
	padding: 1.5rem 1rem;
	font-size: 0.8125rem;
	color: var(--on-surface-variant, #49454f);
	background: rgba(0, 0, 0, 0.02);
	border-radius: 8px;
}

.wid-panel__empty--error {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	color: var(--error, #ba1a1a);
	background: color-mix(in oklab, var(--error-container, #ffdad6) 30%, transparent);
	border: 1px solid var(--error, rgba(186, 26, 26, 0.2));
}

.wid-panel__retry-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.35rem 0.85rem;
	border-radius: 6px;
	border: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.12));
	background: var(--surface-container-high, #f3edf7);
	color: var(--on-surface, #1c1b1f);
	font-size: 0.75rem;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.15s ease;
}

.wid-panel__retry-btn:hover {
	background: var(--primary, #6750a4);
	color: var(--on-primary, #ffffff);
}

.wid-panel__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.5rem 1rem;
	border-top: 1px solid var(--outline-variant, rgba(0, 0, 0, 0.06));
	font-size: 0.6875rem;
	color: var(--on-surface-variant, #49454f);
	flex-shrink: 0;
	background: var(--surface-container-lowest, rgba(0, 0, 0, 0.01));
}

.wid-panel__proto-badge {
	font-weight: 500;
	opacity: 0.75;
}

.wid-panel__status-hint {
	font-weight: 500;
}
`;function Ot(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=Pa,document.head.appendChild(t)}var A;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})(A||(A={}));var Nr=new TextEncoder,Ra=new TextDecoder,ot=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const l=this.buffer[this.pos++];if(t|=BigInt(l&127)<<a,(l&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return Ra.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function nt(t){const a=new ot(t),l={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:A.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const N=a.readTag();if(!N)break;switch(N.fieldNo){case 1:l.timestamp=Number(a.readVarint());break;case 2:l.deviceId=a.readString();break;case 3:l.deviceName=a.readString();break;case 4:l.appName=a.readString();break;case 5:l.windowTitle=a.readString();break;case 6:l.status=Number(a.readVarint());break;case 7:l.osInfo=a.readString();break;case 8:l.idleSeconds=Number(a.readVarint());break;case 9:{const x=a.readBytes(),y=new ot(x);let k="",f="";for(;y.hasMore;){const E=y.readTag();if(!E)break;E.fieldNo===1?k=y.readString():E.fieldNo===2?f=y.readString():y.skip(E.wireType)}k&&l.metadata&&(l.metadata[k]=f);break}default:a.skip(N.wireType)}}return l}function Wa(t){const a=new ot(t);let l=null;const N=[],x=[];let y=Date.now();for(;a.hasMore;){const k=a.readTag();if(!k)break;switch(k.fieldNo){case 1:l=nt(a.readBytes());break;case 2:{const f=a.readBytes();N.push(nt(f));break}case 3:{const f=a.readBytes();x.push(nt(f));break}case 4:y=Number(a.readVarint());break;default:a.skip(k.wireType)}}return{current:l,devices:N,history:x,serverTime:y}}function Ha(t){if(!t)return"";const a=t.charAt(0);return a>="a"&&a<="z"?a.toUpperCase()+t.slice(1):t}function be(t,a=Date.now(),l="zh"){const N=Math.max(0,a-t),x=Math.floor(N/1e3),y=Math.floor(x/60),k=Math.floor(y/60),f=Math.floor(k/24);return l==="zh"?x<45?"刚刚":y<60?`${y}分钟前`:k<24?`${k}小时前`:f===1?"昨天":f<30?`${f}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):x<45?"just now":y<60?`${y}m ago`:k<24?`${k}h ago`:f===1?"yesterday":f<30?`${f}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function st(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Ba(t,a=Date.now(),l="zh"){if(!t||t<=0)return"";const N=st(t);if(!N)return"";const x=be(t,a,l);return l==="zh"?`最后活跃时间: ${N} (${x})`:`Last active: ${N} (${x})`}function ja(t,a=Date.now(),l="zh"){if(!t?.appName)return{statusType:"offline",sentence:l==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const N=t.lastSeen??t.timestamp,x=Math.max(0,a-N),y=Math.floor(x/1e3),k=be(N,a,l);let f="active";t.status===A.OFFLINE||t.offline||y>259200?f="offline":t.status===A.AWAY||y>1800?f="away":(t.status===A.IDLE||y>180)&&(f="idle");const E=f==="active"&&y<120,F=t.deviceName||t.name||t.deviceId||t.id||(l==="zh"?"Linux设备":"Device");let o="";if(t.media?.title&&E){const w=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;l==="zh"?o=`正在 ${F} 收听 ${w}`:o=`Listening to ${w} on ${F}`}else l==="zh"?E?o=`正在 ${F} 使用 ${t.appName}`:f==="offline"?o=`最后在使用: ${t.appName}`:o=`${k}在 ${F} 使用 ${t.appName}`:E?o=`Using ${t.appName} on ${F}`:f==="offline"?o=`Last used: ${t.appName}`:o=`${k} used ${t.appName} on ${F}`;return{statusType:f,sentence:o,appName:t.appName,deviceName:F,relativeTime:k}}var Ua=S('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ya=S('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),$a=S('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),Ga=S('<span class="wid-capsule__prefix">离线</span> <!>',1),Ka=S('<span class="wid-capsule__media-icon">🎵</span> <span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Xa=S('<span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Ja=S("<span> </span>"),Za=dt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>'),Qa=dt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>'),er=dt('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>'),tr=S('<span class="wid-current-card__device"> </span>'),ar=S('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> </span></div>'),rr=S('<span class="wid-current-card__os-info"> </span>'),ir=S('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <!></div> <!> <div class="wid-current-card__footer"><span class="wid-current-card__time"> </span> <!></div></div>'),nr=S('<div class="wid-panel__empty">正在获取设备状态...</div>'),or=S('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),sr=S('<div class="wid-panel__empty">当前暂无已登记设备</div>'),Lt=S('<div class="wid-device-card__win-title"> </div>'),dr=S('<span class="wid-device-card__abs-time"> </span>'),lr=S('<div class="wid-device-card__app"><span class="wid-device-card__muted-label"> </span> <span class="wid-device-card__app-title"> </span></div> <!> <div class="wid-device-card__time"> <!></div>',1),cr=S('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span></div> <!> <div class="wid-device-card__time"><!></div>',1),pr=S('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),fr=S('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),ur=S('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> <!></span> <span class="wid-timeline__time"> </span></div></div></li>'),_r=S('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),vr=S('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button"><!> <span class="wid-panel__refresh-label"><!></span></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),mr=S('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function wr(t,a){Ma(a,!0),Ot();let l=je(a,"endpoint",3,"/api/activity"),N=je(a,"maxHistoryDisplay",3,5),x=je(a,"refreshInterval",3,0),y=je(a,"class",3,"");const k=P(()=>Array.isArray(l())?l().map(r=>r.trim()).filter(Boolean):typeof l()=="string"?l().split(",").map(r=>r.trim()).filter(Boolean):["/api/activity"]);let f=U(null),E=U(!1),F=U(!1),o=U(null),w=U(!1),C=U(Aa(Date.now())),ae=U(null),Ye=U(!1),T=U("idle"),Oe=U(0),qe=U(0),Ve=null,Fe=null,Pe=null;function ie(){Ve&&(clearInterval(Ve),Ve=null),Fe&&(clearTimeout(Fe),Fe=null),Pe&&(clearTimeout(Pe),Pe=null)}let Re=U(0),lt=U(0);const g=P(()=>e(f)?.current??null),$e=P(()=>e(f)?.devices??[]),ct=P(()=>e(f)?.history??[]),xe=P(()=>!e(f)&&e(E)),ye=P(()=>!e(f)&&!e(E)&&!!e(o)),$=P(()=>{if(!e(f)||!e(g))return!1;if(e(g).offline||e(g).status===A.OFFLINE)return!0;const r=e(g).lastSeen??e(g).timestamp,d=(e(g).type||"").toLowerCase()==="server"?9e5:12e4;return!!(r&&e(C)-r>d)}),pt=P(()=>{if(!e($))return"";const r=e(g)?.lastSeen??e(g)?.timestamp??0;return Ba(r,e(C),"zh")}),ft=P(()=>e(g)&&(e(g).deviceName||e(g).name||e(g).deviceId||e(g).id)||""),qt=P(()=>Ha(e(g)?.appName||"")),We=P(()=>ja(e(g),e(C),"zh")),Vt=P(()=>{if(e($))return"离线";switch(e(We).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),ut={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},_t=P(()=>{const r=e($e).length>0?e($e):e(g)?[e(g)]:[],d={desktop:[],laptop:[],server:[],other:[]};for(const v of r){const I=(v.type||"desktop").toLowerCase();I==="desktop"?d.desktop.push(v):I==="laptop"?d.laptop.push(v):I==="server"?d.server.push(v):d.other.push(v)}return["desktop","laptop","server","other"].filter(v=>d[v].length>0).map(v=>({key:v,label:ut[v]?.label??v,icon:ut[v]?.icon??"💻",devices:d[v]}))}),vt=P(()=>e($e).filter(r=>{if(r.offline||r.status===A.OFFLINE)return!1;const d=(r.type||"").toLowerCase()==="server"?9e5:12e4;return e(C)-(r.lastSeen??r.timestamp)<=d}).length),Ft=P(()=>e(ct).slice(0,N()));let ke=null;async function Te(r=!1){if(e(E)&&!r)return!1;r&&ke&&ke.abort(),m(E,!0),r&&m(F,!0);const d=new AbortController;ke=d;const v=setTimeout(()=>d.abort(),9e3);let I=!1;try{m(o,null);let L=null;for(const Z of e(k)){if(d.signal.aborted)break;try{const D=await fetch(Z,{signal:d.signal});if(!D.ok){L=new Error(`HTTP ${D.status}`);continue}const ne=D.headers.get("content-type")??"";if(ne.includes("application/x-protobuf")){const ve=await D.arrayBuffer();m(f,Wa(new Uint8Array(ve)),!0),I=!0;break}else if(ne.includes("application/json")||ne.includes("text/plain")){const ve=await D.text();try{const le=JSON.parse(ve);if(le&&(le.current!==void 0||le.devices!==void 0||le.serverTime!==void 0)){m(f,le,!0),I=!0;break}}catch{continue}}}catch(D){if(D?.name==="AbortError"){L=D;break}L=D;continue}}I?(m(C,Date.now(),!0),m(Oe,Date.now(),!0),m(o,null)):L?.name==="AbortError"?m(o,"连接状态服务器超时，请点击重试"):m(o,"无法连接至状态服务器")}catch(L){L?.name==="AbortError"?m(o,"连接状态服务器超时，请点击重试"):m(o,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",L)}finally{clearTimeout(v),ke===d&&(ke=null),m(E,!1),m(F,!1)}return I}let Ie=null;function mt(){x()>0&&!Ie&&(Ie=setInterval(()=>{document.visibilityState==="visible"&&Te()},x()))}function Pt(){Ie&&(clearInterval(Ie),Ie=null)}function wt(){if(typeof window>"u"||(m(Ye,window.innerWidth<768),!e(ae)))return;const r=e(ae).getBoundingClientRect();m(Re,Math.round(r.left+r.width/2),!0),m(Re,Math.max(210,Math.min(window.innerWidth-210,e(Re))),!0),m(lt,Math.round(window.innerHeight-r.top),!0)}function Rt(){m(w,!e(w)),e(w)?(m(C,Date.now(),!0),wt(),!e(f)&&!e(E)&&Te()):(ie(),m(T,"idle"))}async function ht(r){if(r?.stopPropagation(),e(T)==="refreshing")return;const d=5e3,v=Date.now()-e(Oe);if(e(Oe)>0&&v<d){ie(),m(T,"cooldown");const I=()=>{const Z=d-(Date.now()-e(Oe));Z<=0?(ie(),m(T,"idle")):m(qe,Math.max(1,Math.ceil(Z/1e3)),!0)};I(),Ve=setInterval(I,200);const L=Math.min(1800,Math.max(800,d-v));Fe=setTimeout(()=>{ie(),m(T,"idle")},L);return}ie(),m(T,"refreshing"),await Te(!0)?(m(T,"done"),Pe=setTimeout(()=>{m(T,"idle")},700)):m(T,"idle")}function Wt(r){return document.body.appendChild(r),{destroy(){r.parentNode&&r.parentNode.removeChild(r)}}}qa(()=>{if(!(typeof document>"u")&&e(w)){const r=document.body.style.overflow,d=document.body.style.paddingRight,v=window.innerWidth-document.documentElement.clientWidth;return v>0&&(document.body.style.paddingRight=`${v}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=r,document.body.style.paddingRight=d}}}),Fa(()=>{let r=null;typeof IntersectionObserver<"u"&&e(ae)?(r=new IntersectionObserver(I=>{for(const L of I)if(L.isIntersecting){Te(),mt(),r?.disconnect(),r=null;break}},{rootMargin:"60px"}),r.observe(e(ae))):(Te(),mt());const d=()=>{e(w)&&wt()},v=I=>{I.key==="Escape"&&e(w)&&(m(w,!1),ie(),m(T,"idle"))};return window.addEventListener("resize",d),window.addEventListener("keydown",v),()=>{Pt(),ie(),r&&r.disconnect(),window.removeEventListener("resize",d),window.removeEventListener("keydown",v)}});var gt=mr(),Ne=de(gt),Ee=n(Ne),bt=n(Ee);let xt;var Ge=u(bt,2),Ht=n(Ge),Bt=r=>{var d=Ua();Ct(2),p(r,d)},jt=r=>{var d=Ya();Ct(2),p(r,d)},Ut=r=>{var d=Ga(),v=u(de(d),2),I=L=>{var Z=$a(),D=u(de(Z),2),ne=n(D,!0);i(D),b(()=>h(ne,e(pt))),p(L,Z)};M(v,L=>{e(pt)&&L(I)}),p(r,d)},Yt=r=>{var d=Ka(),v=u(de(d),4),I=n(v,!0);i(v),b(()=>h(I,e(g).media.title)),p(r,d)},$t=r=>{var d=Xa(),v=u(de(d),2),I=n(v,!0);i(v),b(()=>h(I,e(qt))),p(r,d)},Gt=r=>{var d=Ja(),v=n(d,!0);i(d),b(()=>h(v,e(Vt))),p(r,d)};M(Ht,r=>{e(xe)?r(Bt):e(ye)?r(jt,1):e($)?r(Ut,2):e(g)?.media?.title?r(Yt,3):e(g)?.appName?r($t,4):r(Gt,-1)}),i(Ge);var Kt=u(Ge,2);let yt;i(Ee),i(Ne),Ca(Ne,r=>m(ae,r),()=>e(ae));var Xt=u(Ne,2),Jt=r=>{var d=vr(),v=n(d),I=u(v,2),L=u(n(I),2),Z=u(n(L),2),D=n(Z);let ne;var ve=n(D),le=s=>{var _=Za();p(s,_)},Zt=s=>{var _=Qa();p(s,_)},Qt=s=>{var _=er();let H;b(()=>H=J(_,0,"wid-panel__refresh-icon",null,H,{"wid-panel__refresh-icon--spin":e(T)==="refreshing"})),p(s,_)};M(ve,s=>{e(T)==="done"?s(le):e(T)==="cooldown"?s(Zt,1):s(Qt,-1)});var kt=u(ve,2),ea=n(kt),ta=s=>{var _=j();b(()=>h(_,`请等待 ${e(qe)??""} 秒刷新`)),p(s,_)},aa=s=>{var _=j("正在刷新...");p(s,_)},ra=s=>{var _=j("已同步");p(s,_)};M(ea,s=>{e(T)==="cooldown"?s(ta):e(T)==="refreshing"?s(aa,1):e(T)==="done"&&s(ra,2)}),i(kt),i(D);var ia=u(D,2);i(Z),i(L);var Ke=u(L,2),Tt=n(Ke),na=s=>{var _=ir();let H;var re=n(_),O=n(re);let Q;var oe=n(O,!0);i(O);var ee=u(O,2),ce=n(ee,!0);i(ee);var se=u(ee,2),Se=q=>{var R=tr(),te=n(R);i(R),b(()=>h(te,`@${e(ft)??""}`)),p(q,R)};M(se,q=>{e(ft)&&q(Se)}),i(re);var pe=u(re,2),me=q=>{var R=ar(),te=u(n(R),2),ze=n(te,!0);i(te),i(R),b(()=>h(ze,e(g).mediaTitle)),p(q,R)};M(pe,q=>{e(g).mediaTitle&&q(me)});var fe=u(pe,2),G=n(fe),c=n(G);i(G);var K=u(G,2),B=q=>{var R=rr(),te=n(R,!0);i(R),b(()=>h(te,e(g).osInfo)),p(q,R)};M(K,q=>{e(g).osInfo&&q(B)}),i(fe),i(_),b((q,R)=>{H=J(_,1,"wid-current-card",null,H,{"wid-current-card--offline":e($)}),Q=J(O,1,"wid-tag",null,Q,{"wid-tag--primary":!e($),"wid-tag--muted":e($)}),h(oe,e($)?"最后使用":"当前活跃"),h(ce,e(g).appName||"idle"),h(c,`活跃于 ${q??""} · ${R??""}`)},[()=>be(e(g).lastSeen??e(g).timestamp,e(C),"zh"),()=>st(e(g).lastSeen??e(g).timestamp,"zh")]),p(s,_)};M(Tt,s=>{e(g)&&s(na)});var Xe=u(Tt,2),oa=n(Xe),sa=s=>{var _=nr();p(s,_)},da=s=>{var _=or(),H=n(_),re=n(H,!0);i(H);var O=u(H,2);i(_),b(()=>h(re,e(o))),Ce("click",O,()=>ht()),p(s,_)},la=s=>{var _=sr();p(s,_)},ca=s=>{var _=za(),H=de(_);it(H,17,()=>e(_t),at,(re,O)=>{var Q=fr(),oe=n(Q),ee=n(oe),ce=n(ee,!0);i(ee);var se=u(ee,2),Se=n(se,!0);i(se);var pe=u(se,2),me=n(pe,!0);i(pe),i(oe);var fe=u(oe,2);it(fe,21,()=>e(O).devices,at,(G,c)=>{const K=P(()=>(e(c).type||"").toLowerCase()==="server"),B=P(()=>e(c).offline||e(c).status===A.OFFLINE||e(C)-(e(c).lastSeen??e(c).timestamp)>(e(K)?9e5:12e4));var q=pr();let R;var te=n(q),ze=n(te),Et=n(ze);let St;var zt=u(Et,2),ma=n(zt,!0);i(zt),i(ze);var Je=u(ze,2);let Dt;var wa=n(Je),ha=z=>{var V=j("离线");p(z,V)},ga=z=>{var V=j();b(()=>h(V,e(K)?"运行正常":"正在活跃")),p(z,V)},ba=z=>{var V=j();b(()=>h(V,e(K)?"待命中":"空闲")),p(z,V)},xa=z=>{var V=j();b(()=>h(V,e(K)?"服务降级":"离开")),p(z,V)},ya=z=>{var V=j("在线");p(z,V)};M(wa,z=>{e(B)?z(ha):e(c).status===A.ACTIVE?z(ga,1):e(c).status===A.IDLE?z(ba,2):e(c).status===A.AWAY?z(xa,3):z(ya,-1)}),i(Je),i(te);var At=u(te,2),ka=n(At),Ta=z=>{var V=lr(),ue=de(V),we=n(ue),Ze=n(we,!0);i(we);var De=u(we,2),Qe=n(De,!0);i(De),i(ue);var Ae=u(ue,2),et=W=>{var _e=Lt(),tt=n(_e,!0);i(_e),b(()=>h(tt,e(c).windowTitle)),p(W,_e)};M(Ae,W=>{e(c).windowTitle&&W(et)});var He=u(Ae,2),Be=n(He),Y=u(Be),X=W=>{var _e=dr(),tt=n(_e);i(_e),b(Na=>h(tt,`(${Na??""})`),[()=>st(e(c).lastSeen??e(c).timestamp)]),p(W,_e)};M(Y,W=>{(e(c).lastSeen||e(c).timestamp)&&W(X)}),i(He),b(W=>{h(Ze,e(K)?"服务:":"最后使用:"),h(Qe,e(c).appName||"无记录"),h(Be,`${e(K)?"最后心跳:":"最后活跃:"} ${W??""} `)},[()=>be(e(c).lastSeen??e(c).timestamp,e(C),"zh")]),p(z,V)},Ia=z=>{var V=cr(),ue=de(V),we=n(ue),Ze=n(we,!0);i(we),i(ue);var De=u(ue,2),Qe=Y=>{var X=Lt(),W=n(X,!0);i(X),b(()=>h(W,e(c).windowTitle)),p(Y,X)};M(De,Y=>{e(c).windowTitle&&Y(Qe)});var Ae=u(De,2),et=n(Ae),He=Y=>{var X=j();b(W=>h(X,`已空闲 ${W??""} 分钟`),[()=>Math.floor(e(c).idleSeconds/60)]),p(Y,X)},Be=Y=>{var X=j();b(W=>h(X,`${e(K)?"心跳于":"活跃于"} ${W??""}`),[()=>be(e(c).lastSeen??e(c).timestamp,e(C),"zh")]),p(Y,X)};M(et,Y=>{!e(K)&&e(c).status===A.IDLE&&e(c).idleSeconds&&e(c).idleSeconds>60?Y(He):Y(Be,-1)}),i(Ae),b(()=>h(Ze,e(c).appName||(e(K)?"服务运行中":"活动中"))),p(z,V)};M(ka,z=>{e(B)?z(Ta):z(Ia,-1)}),i(At),i(q),b(()=>{R=J(q,1,"wid-device-card",null,R,{"wid-device-card--offline":e(B),"wid-device-card--active":!e(B)&&e(c).status===A.ACTIVE}),St=J(Et,1,"wid-device-card__dot",null,St,{"wid-device-card__dot--active":!e(B)&&e(c).status===A.ACTIVE,"wid-device-card__dot--idle":!e(B)&&e(c).status===A.IDLE,"wid-device-card__dot--away":!e(B)&&e(c).status===A.AWAY,"wid-device-card__dot--offline":e(B)}),h(ma,e(c).name||e(c).deviceName||e(c).id||e(c).deviceId),Dt=J(Je,1,"wid-device-card__badge",null,Dt,{"wid-device-card__badge--active":!e(B)&&e(c).status===A.ACTIVE,"wid-device-card__badge--idle":!e(B)&&e(c).status===A.IDLE,"wid-device-card__badge--away":!e(B)&&e(c).status===A.AWAY,"wid-device-card__badge--offline":e(B)})}),p(G,q)}),i(fe),i(Q),b(()=>{h(ce,e(O).icon),h(Se,e(O).label),h(me,e(O).devices.length)}),p(re,Q)}),p(s,_)};M(oa,s=>{e(E)&&!e(f)?s(sa):e(o)&&!e(f)?s(da,1):e(_t).length===0?s(la,2):s(ca,-1)}),i(Xe);var pa=u(Xe,2),fa=s=>{var _=_r(),H=u(n(_),2);it(H,21,()=>e(Ft),at,(re,O)=>{var Q=ur(),oe=u(n(Q),2),ee=n(oe),ce=n(ee),se=n(ce),Se=u(se),pe=G=>{var c=j();b(()=>h(c,`@${(e(O).deviceName||e(O).name)??""}`)),p(G,c)};M(Se,G=>{(e(O).deviceName||e(O).name)&&G(pe)}),i(ce);var me=u(ce,2),fe=n(me,!0);i(me),i(ee),i(oe),i(Q),b(G=>{h(se,`${e(O).appName??""} `),h(fe,G)},[()=>be(e(O).timestamp,e(C),"zh")]),p(re,Q)}),i(H),i(_),p(s,_)};M(pa,s=>{e(ct).length>0&&s(fa)}),i(Ke);var It=u(Ke,2),Nt=u(n(It),2),ua=n(Nt),_a=s=>{var _=j();b(()=>h(_,`🟢 ${e(vt)??""} 台在线 · 按需刷新`)),p(s,_)},va=s=>{var _=j("⚪ 全设备离线 · 按需刷新");p(s,_)};M(ua,s=>{e(vt)>0?s(_a):s(va,-1)}),i(Nt),i(It),i(I),i(d),La(d,s=>Wt?.(s)),b(()=>{Oa(I,`--anchor-bottom: ${e(lt)}px; --anchor-left: ${e(Re)}px;`),ne=J(D,1,"wid-panel__refresh-pill",null,ne,{"wid-panel__refresh-pill--expanded":e(T)!=="idle","wid-panel__refresh-pill--cooldown":e(T)==="cooldown","wid-panel__refresh-pill--done":e(T)==="done"}),D.disabled=e(T)==="refreshing",rt(D,"aria-label",e(T)==="cooldown"?`请等待 ${e(qe)} 秒后刷新`:e(T)==="refreshing"?"正在刷新状态...":e(T)==="done"?"已同步":"手动刷新状态"),rt(D,"title",e(T)==="cooldown"?`请等待 ${e(qe)} 秒后刷新`:"手动刷新")}),Ce("click",v,()=>m(w,!1)),Ce("click",D,ht),Ce("click",ia,()=>{m(w,!1),ie(),m(T,"idle")}),p(r,d)};M(Xt,r=>{e(w)&&r(Jt)}),b(()=>{J(Ne,1,`wid-capsule-wrapper ${y()}`),J(Ee,1,`wid-capsule wid-capsule--${e(xe)?"loading":e(ye)?"error":e($)?"offline":e(We).statusType}`),rt(Ee,"aria-expanded",e(w)),xt=J(bt,1,"wid-capsule__dot",null,xt,{"wid-capsule__dot--pulse":e(xe),"wid-capsule__dot--active":!e($)&&!e(xe)&&!e(ye)&&e(We).statusType==="active","wid-capsule__dot--idle":!e($)&&!e(xe)&&!e(ye)&&e(We).statusType==="idle","wid-capsule__dot--offline":e($)||e(ye)}),yt=J(Kt,0,"wid-capsule__chevron",null,yt,{"wid-capsule__chevron--open":e(w)})}),Ce("click",Ee,Rt),p(t,gt),Va()}Sa(["click"]);var Le=null,Me=null;function hr(t={}){if(typeof window>"u"||typeof document>"u")return;Ot();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let l=0;const N=25;let x=null;function y(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const o=window.location.pathname.toLowerCase();return a.routeFilter.some(w=>o.startsWith(w.toLowerCase()))}function k(){if(x&&(clearTimeout(x),x=null),!y()){f();return}if(document.querySelector(".wid-mounted-portal"))return;const o=document.querySelector(a.targetSelector);if(!o?.parentElement){l<N&&(l++,x=setTimeout(k,80));return}l=0;const w=document.createElement("div");w.className="wid-mounted-portal",w.style.width="100%",w.style.display="flex",w.style.justifyContent="center",o.insertAdjacentElement(a.position,w);try{Le=Da(wr,{target:w,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),Me=w}catch(C){console.error("[what-im-doing] Failed to mount Svelte capsule:",C),w.remove(),Me=null}}function f(){if(x&&(clearTimeout(x),x=null),l=0,Le){try{Ea(Le)}catch{}Le=null}Me&&(Me.remove(),Me=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",k):k();const E=window.swup,F=()=>{y()?(!document.querySelector(".wid-mounted-portal")||!Le)&&(f(),l=0,k()):f()};E?.hooks?E.hooks.on("page:view",F):document.addEventListener("swup:contentReplaced",F)}function Ue(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,hr(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>Ue()),window.__WHAT_IM_DOING_CONFIG__?Ue():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>Ue()):setTimeout(Ue,0));function ge(t){return JSON.parse(t,gr)}function gr(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const l=a[0];if(a=a[1],l===":regex:"){const N=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(N[1],N[2]||"")}if(l===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function Mt(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function br(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function xr(t,{delayAfterLoad:a=0}={}){br(()=>{a>0?setTimeout(()=>Mt(t),a):Mt(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/api/activity, https://what-im-doing-hub.yaochenli083.workers.dev/api/activity, https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));async function yr(){const[t,a,l,N,x,y]=await Promise.all([he(()=>import("./Swup.okfGCf0T.js").then(o=>o.default),__vite__mapDeps([0,1])),he(()=>import("./SwupA11yPlugin.DvfTARzg.js").then(o=>o.default),__vite__mapDeps([2,1,3])),he(()=>import("./SwupPreloadPlugin.SkV6a72Q.js").then(o=>o.default),__vite__mapDeps([4,1,3])),he(()=>import("./SwupScrollPlugin.CznjUOSB.js").then(o=>o.default),__vite__mapDeps([5,1,3])),he(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(o=>o.default),__vite__mapDeps([6,3])),he(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(o=>o.default),__vite__mapDeps([7,3]))]),k=ge('["a[href=\\"#\\"]"]'),f=(o,w,{el:C,event:ae})=>typeof o=="string"&&o.startsWith("/")?w.startsWith(o):typeof o=="string"?C?.matches(o)??!1:o instanceof RegExp?o.test(w):typeof o=="function"?o(w,{el:C,event:ae}):Array.isArray(o)?o.some(Ye=>f(Ye,w,{el:C,event:ae})):!1,E=new t({ignoreVisit:(o,{el:w,event:C}={})=>w?.closest("[data-no-swup]")||f(k,o,{el:w,event:C}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(ge("{}")),new l(ge('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new N(ge("{}")),new x(ge('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new y(ge("{}"))]}),F=o=>document.dispatchEvent(new Event(o));E.hooks.before("content:replace",()=>F("astro:before-swap")),E.hooks.on("content:replace",()=>F("astro:after-swap")),E.hooks.on("page:view",()=>F("astro:page-load")),window.swup=E}xr(yr);
