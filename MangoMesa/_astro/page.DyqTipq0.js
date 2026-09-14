const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Swup.Cz2sqVT0.js","_astro/Swup.modern.D7qINR80.js","_astro/SwupA11yPlugin.COK5EHWy.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.BmKT5rcH.js","_astro/SwupScrollPlugin.DXF80AYT.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as xe}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{$ as b,A as xa,F as K,I as ka,J as l,K as A,L as Fe,M as Sa,N as C,O as Ia,P as nt,S as U,V as e,X as _,Y as pe,Z as Ea,a as Ta,b as Qe,et as J,f as et,g as Na,h as te,it as Da,j as v,k as D,m as za,nt as W,ot as Tt,q as Aa,rt as Ca,st as s,t as Ue,w as Ma,y as tt}from"./client.CVK8X0vf.js";var La=`
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
`;function zt(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=La,document.head.appendChild(t)}var V;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})(V||(V={}));var yr=new TextEncoder,Oa=new TextDecoder,rt=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const c=this.buffer[this.pos++];if(t|=BigInt(c&127)<<a,(c&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return Oa.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function at(t){const a=new rt(t),c={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:V.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const T=a.readTag();if(!T)break;switch(T.fieldNo){case 1:c.timestamp=Number(a.readVarint());break;case 2:c.deviceId=a.readString();break;case 3:c.deviceName=a.readString();break;case 4:c.appName=a.readString();break;case 5:c.windowTitle=a.readString();break;case 6:c.status=Number(a.readVarint());break;case 7:c.osInfo=a.readString();break;case 8:c.idleSeconds=Number(a.readVarint());break;case 9:{const k=a.readBytes(),S=new rt(k);let I="",p="";for(;S.hasMore;){const N=S.readTag();if(!N)break;N.fieldNo===1?I=S.readString():N.fieldNo===2?p=S.readString():S.skip(N.wireType)}I&&c.metadata&&(c.metadata[I]=p);break}default:a.skip(T.wireType)}}return c}function Pa(t){const a=new rt(t);let c=null;const T=[],k=[];let S=Date.now();for(;a.hasMore;){const I=a.readTag();if(!I)break;switch(I.fieldNo){case 1:c=at(a.readBytes());break;case 2:{const p=a.readBytes();T.push(at(p));break}case 3:{const p=a.readBytes();k.push(at(p));break}case 4:S=Number(a.readVarint());break;default:a.skip(I.wireType)}}return{current:c,devices:T,history:k,serverTime:S}}function Fa(t){if(!t)return"";const a=t.charAt(0);return a>="a"&&a<="z"?a.toUpperCase()+t.slice(1):t}function Se(t,a=Date.now(),c="zh"){const T=Math.max(0,a-t),k=Math.floor(T/1e3),S=Math.floor(k/60),I=Math.floor(S/60),p=Math.floor(I/24);return c==="zh"?k<45?"刚刚":S<60?`${S}分钟前`:I<24?`${I}小时前`:p===1?"昨天":p<30?`${p}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):k<45?"just now":S<60?`${S}m ago`:I<24?`${I}h ago`:p===1?"yesterday":p<30?`${p}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function it(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function qa(t,a=Date.now(),c="zh"){if(!t||t<=0)return"";const T=it(t);if(!T)return"";const k=Se(t,a,c);return c==="zh"?`最后活跃时间: ${T} (${k})`:`Last active: ${T} (${k})`}function Va(t,a=Date.now(),c="zh"){if(!t?.appName)return{statusType:"offline",sentence:c==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const T=t.lastSeen??t.timestamp,k=Math.max(0,a-T),S=Math.floor(k/1e3),I=Se(T,a,c);let p="active";t.status===V.OFFLINE||t.offline||S>259200?p="offline":t.status===V.AWAY||S>1800?p="away":(t.status===V.IDLE||S>180)&&(p="idle");const N=p==="active"&&S<120,F=t.deviceName||t.name||t.deviceId||t.id||(c==="zh"?"Linux设备":"Device");let n="";if(t.media?.title&&N){const h=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;c==="zh"?n=`正在 ${F} 收听 ${h}`:n=`Listening to ${h} on ${F}`}else c==="zh"?N?n=`正在 ${F} 使用 ${t.appName}`:p==="offline"?n=`最后在使用: ${t.appName}`:n=`${I}在 ${F} 使用 ${t.appName}`:N?n=`Using ${t.appName} on ${F}`:p==="offline"?n=`Last used: ${t.appName}`:n=`${I} used ${t.appName} on ${F}`;return{statusType:p,sentence:n,appName:t.appName,deviceName:F,relativeTime:I}}var Ra=C('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ba=C('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),$a=C('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),Ua=C('<span class="wid-capsule__prefix">离线</span> <!>',1),Ha=C('<span class="wid-capsule__media-icon">🎵</span> <span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Wa=C('<span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),ja=C("<span> </span>"),Ya=nt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>'),Ga=nt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>'),Ka=nt('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>'),Ja=C('<span class="wid-current-card__device"> </span>'),Xa=C('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> </span></div>'),Za=C('<span class="wid-current-card__os-info"> </span>'),Qa=C('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <!></div> <!> <div class="wid-current-card__footer"><span class="wid-current-card__time"> </span> <!></div></div>'),er=C('<div class="wid-panel__empty">正在获取设备状态...</div>'),tr=C('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),ar=C('<div class="wid-panel__empty">当前暂无已登记设备</div>'),rr=C('<span class="wid-device-card__abs-time"> </span>'),ir=C('<div class="wid-device-card__app"><span class="wid-device-card__muted-label">最后使用:</span> <span class="wid-device-card__app-title"> </span></div> <div class="wid-device-card__time"> <!></div>',1),nr=C('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span></div> <div class="wid-device-card__time"><!></div>',1),or=C('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),sr=C('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),lr=C('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> <!></span> <span class="wid-timeline__time"> </span></div></div></li>'),dr=C('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),cr=C('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button"><!> <span class="wid-panel__refresh-label"><!></span></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),pr=C('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function ur(t,a){Da(a,!0),zt();let c=Ue(a,"endpoint",3,"/api/activity"),T=Ue(a,"maxHistoryDisplay",3,5),k=Ue(a,"refreshInterval",3,0),S=Ue(a,"class",3,"");const I=W(()=>Array.isArray(c())?c().map(i=>i.trim()).filter(Boolean):typeof c()=="string"?c().split(",").map(i=>i.trim()).filter(Boolean):["/api/activity"]);let p=J(null),N=J(!1),F=J(!1),n=J(null),h=J(!1),O=J(Ea(Date.now())),Z=J(null),Ie=J(!1),E=J("idle"),he=J(0),r=J(0),o=null,f=null,y=null;function M(){o&&(clearInterval(o),o=null),f&&(clearTimeout(f),f=null),y&&(clearTimeout(y),y=null)}let R=J(0),ue=J(0);const x=W(()=>e(p)?.current??null),We=W(()=>e(p)?.devices??[]),ot=W(()=>e(p)?.history??[]),Ee=W(()=>!e(p)&&e(N)),Te=W(()=>!e(p)&&!e(N)&&!!e(n)),Q=W(()=>{if(!e(p)||!e(x))return!1;if(e(x).offline||e(x).status===V.OFFLINE)return!0;const i=e(x).lastSeen??e(x).timestamp;return!!(i&&e(O)-i>12e4)}),st=W(()=>{if(!e(Q))return"";const i=e(x)?.lastSeen??e(x)?.timestamp??0;return qa(i,e(O),"zh")}),lt=W(()=>e(x)&&(e(x).deviceName||e(x).name||e(x).deviceId||e(x).id)||""),At=W(()=>Fa(e(x)?.appName||"")),Re=W(()=>Va(e(x),e(O),"zh")),Ct=W(()=>{if(e(Q))return"离线";switch(e(Re).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),dt={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},ct=W(()=>{const i=e(We).length>0?e(We):e(x)?[e(x)]:[],u={desktop:[],laptop:[],server:[],other:[]};for(const w of i){const z=(w.type||"desktop").toLowerCase();z==="desktop"?u.desktop.push(w):z==="laptop"?u.laptop.push(w):z==="server"?u.server.push(w):u.other.push(w)}return["desktop","laptop","server","other"].filter(w=>u[w].length>0).map(w=>({key:w,label:dt[w]?.label??w,icon:dt[w]?.icon??"💻",devices:u[w]}))}),pt=W(()=>e(We).filter(i=>!i.offline&&i.status!==V.OFFLINE&&e(O)-(i.lastSeen??i.timestamp)<=12e4).length),Mt=W(()=>e(ot).slice(0,T()));let Ne=null;async function De(i=!1){if(e(N)&&!i)return!1;i&&Ne&&Ne.abort(),b(N,!0),i&&b(F,!0);const u=new AbortController;Ne=u;const w=setTimeout(()=>u.abort(),9e3);let z=!1;try{b(n,null);let q=null;for(const ae of e(I)){if(u.signal.aborted)break;try{const P=await fetch(ae,{signal:u.signal});if(!P.ok){q=new Error(`HTTP ${P.status}`);continue}const le=P.headers.get("content-type")??"";if(le.includes("application/x-protobuf")){const ge=await P.arrayBuffer();b(p,Pa(new Uint8Array(ge)),!0),z=!0;break}else if(le.includes("application/json")||le.includes("text/plain")){const ge=await P.text();try{const fe=JSON.parse(ge);if(fe&&(fe.current!==void 0||fe.devices!==void 0||fe.serverTime!==void 0)){b(p,fe,!0),z=!0;break}}catch{continue}}}catch(P){if(P?.name==="AbortError"){q=P;break}q=P;continue}}z?(b(O,Date.now(),!0),b(he,Date.now(),!0),b(n,null)):q?.name==="AbortError"?b(n,"连接状态服务器超时，请点击重试"):b(n,"无法连接至状态服务器")}catch(q){q?.name==="AbortError"?b(n,"连接状态服务器超时，请点击重试"):b(n,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",q)}finally{clearTimeout(w),Ne===u&&(Ne=null),b(N,!1),b(F,!1)}return z}let ze=null;function ut(){k()>0&&!ze&&(ze=setInterval(()=>{document.visibilityState==="visible"&&De()},k()))}function Lt(){ze&&(clearInterval(ze),ze=null)}function ft(){if(typeof window>"u"||(b(Ie,window.innerWidth<768),!e(Z)))return;const i=e(Z).getBoundingClientRect();b(R,Math.round(i.left+i.width/2),!0),b(R,Math.max(210,Math.min(window.innerWidth-210,e(R))),!0),b(ue,Math.round(window.innerHeight-i.top),!0)}function Ot(){b(h,!e(h)),e(h)?(b(O,Date.now(),!0),ft(),!e(p)&&!e(N)&&De()):(M(),b(E,"idle"))}async function vt(i){if(i?.stopPropagation(),e(E)==="refreshing")return;const u=5e3,w=Date.now()-e(he);if(e(he)>0&&w<u){M(),b(E,"cooldown");const z=()=>{const ae=u-(Date.now()-e(he));ae<=0?(M(),b(E,"idle")):b(r,Math.max(1,Math.ceil(ae/1e3)),!0)};z(),o=setInterval(z,200);const q=Math.min(1800,Math.max(800,u-w));f=setTimeout(()=>{M(),b(E,"idle")},q);return}M(),b(E,"refreshing"),await De(!0)?(b(E,"done"),y=setTimeout(()=>{b(E,"idle")},700)):b(E,"idle")}function Pt(i){return document.body.appendChild(i),{destroy(){i.parentNode&&i.parentNode.removeChild(i)}}}Aa(()=>{if(!(typeof document>"u")&&e(h)){const i=document.body.style.overflow,u=document.body.style.paddingRight,w=window.innerWidth-document.documentElement.clientWidth;return w>0&&(document.body.style.paddingRight=`${w}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=i,document.body.style.paddingRight=u}}}),Ma(()=>{let i=null;typeof IntersectionObserver<"u"&&e(Z)?(i=new IntersectionObserver(z=>{for(const q of z)if(q.isIntersecting){De(),ut(),i?.disconnect(),i=null;break}},{rootMargin:"60px"}),i.observe(e(Z))):(De(),ut());const u=()=>{e(h)&&ft()},w=z=>{z.key==="Escape"&&e(h)&&(b(h,!1),M(),b(E,"idle"))};return window.addEventListener("resize",u),window.addEventListener("keydown",w),()=>{Lt(),M(),i&&i.disconnect(),window.removeEventListener("resize",u),window.removeEventListener("keydown",w)}});var mt=pr(),Ae=pe(mt),Ce=l(Ae),_t=l(Ce);let wt;var je=_(_t,2),Ft=l(je),qt=i=>{var u=Ra();Tt(2),v(i,u)},Vt=i=>{var u=Ba();Tt(2),v(i,u)},Rt=i=>{var u=Ua(),w=_(pe(u),2),z=q=>{var ae=$a(),P=_(pe(ae),2),le=l(P,!0);s(P),A(()=>D(le,e(st))),v(q,ae)};U(w,q=>{e(st)&&q(z)}),v(i,u)},Bt=i=>{var u=Ha(),w=_(pe(u),4),z=l(w,!0);s(w),A(()=>D(z,e(x).media.title)),v(i,u)},$t=i=>{var u=Wa(),w=_(pe(u),2),z=l(w,!0);s(w),A(()=>D(z,e(At))),v(i,u)},Ut=i=>{var u=ja(),w=l(u,!0);s(u),A(()=>D(w,e(Ct))),v(i,u)};U(Ft,i=>{e(Ee)?i(qt):e(Te)?i(Vt,1):e(Q)?i(Rt,2):e(x)?.media?.title?i(Bt,3):e(x)?.appName?i($t,4):i(Ut,-1)}),s(je);var Ht=_(je,2);let ht;s(Ce),s(Ae),Ta(Ae,i=>b(Z,i),()=>e(Z));var Wt=_(Ae,2),jt=i=>{var u=cr(),w=l(u),z=_(w,2),q=_(l(z),2),ae=_(l(q),2),P=l(ae);let le;var ge=l(P),fe=d=>{var m=Ya();v(d,m)},Yt=d=>{var m=Ga();v(d,m)},Gt=d=>{var m=Ka();let Y;A(()=>Y=te(m,0,"wid-panel__refresh-icon",null,Y,{"wid-panel__refresh-icon--spin":e(E)==="refreshing"})),v(d,m)};U(ge,d=>{e(E)==="done"?d(fe):e(E)==="cooldown"?d(Yt,1):d(Gt,-1)});var gt=_(ge,2),Kt=l(gt),Jt=d=>{var m=K();A(()=>D(m,`请等待 ${e(r)??""} 秒刷新`)),v(d,m)},Xt=d=>{var m=K("正在刷新...");v(d,m)},Zt=d=>{var m=K("已同步");v(d,m)};U(Kt,d=>{e(E)==="cooldown"?d(Jt):e(E)==="refreshing"?d(Xt,1):e(E)==="done"&&d(Zt,2)}),s(gt),s(P);var Qt=_(P,2);s(ae),s(q);var Ye=_(q,2),bt=l(Ye),ea=d=>{var m=Qa();let Y;var oe=l(m),B=l(oe);let re;var de=l(B,!0);s(B);var ie=_(B,2),ve=l(ie,!0);s(ie);var ce=_(ie,2),Me=H=>{var $=Ja(),ne=l($);s($),A(()=>D(ne,`@${e(lt)??""}`)),v(H,$)};U(ce,H=>{e(lt)&&H(Me)}),s(oe);var me=_(oe,2),be=H=>{var $=Xa(),ne=_(l($),2),Be=l(ne,!0);s(ne),s($),A(()=>D(Be,e(x).mediaTitle)),v(H,$)};U(me,H=>{e(x).mediaTitle&&H(be)});var _e=_(me,2),ee=l(_e),g=l(ee);s(ee);var G=_(ee,2),ye=H=>{var $=Za(),ne=l($,!0);s($),A(()=>D(ne,e(x).osInfo)),v(H,$)};U(G,H=>{e(x).osInfo&&H(ye)}),s(_e),s(m),A((H,$)=>{Y=te(m,1,"wid-current-card",null,Y,{"wid-current-card--offline":e(Q)}),re=te(B,1,"wid-tag",null,re,{"wid-tag--primary":!e(Q),"wid-tag--muted":e(Q)}),D(de,e(Q)?"最后使用":"当前活跃"),D(ve,e(x).appName||"idle"),D(g,`活跃于 ${H??""} · ${$??""}`)},[()=>Se(e(x).lastSeen??e(x).timestamp,e(O),"zh"),()=>it(e(x).lastSeen??e(x).timestamp,"zh")]),v(d,m)};U(bt,d=>{e(x)&&d(ea)});var Ge=_(bt,2),ta=l(Ge),aa=d=>{var m=er();v(d,m)},ra=d=>{var m=tr(),Y=l(m),oe=l(Y,!0);s(Y);var B=_(Y,2);s(m),A(()=>D(oe,e(n))),Fe("click",B,()=>vt()),v(d,m)},ia=d=>{var m=ar();v(d,m)},na=d=>{var m=Sa(),Y=pe(m);tt(Y,17,()=>e(ct),Qe,(oe,B)=>{var re=sr(),de=l(re),ie=l(de),ve=l(ie,!0);s(ie);var ce=_(ie,2),Me=l(ce,!0);s(ce);var me=_(ce,2),be=l(me,!0);s(me),s(de);var _e=_(de,2);tt(_e,21,()=>e(B).devices,Qe,(ee,g)=>{const G=W(()=>e(g).offline||e(g).status===V.OFFLINE||e(O)-(e(g).lastSeen??e(g).timestamp)>12e4);var ye=or();let H;var $=l(ye),ne=l($),Be=l(ne);let kt;var St=_(Be,2),pa=l(St,!0);s(St),s(ne);var Ke=_(ne,2);let It;var ua=l(Ke),fa=L=>{var j=K("离线");v(L,j)},va=L=>{var j=K("正在活跃");v(L,j)},ma=L=>{var j=K("空闲");v(L,j)},_a=L=>{var j=K("离开");v(L,j)},wa=L=>{var j=K("在线");v(L,j)};U(ua,L=>{e(G)?L(fa):e(g).status===V.ACTIVE?L(va,1):e(g).status===V.IDLE?L(ma,2):e(g).status===V.AWAY?L(_a,3):L(wa,-1)}),s(Ke),s($);var Et=_($,2),ha=l(Et),ga=L=>{var j=ir(),we=pe(j),Le=_(l(we),2),Je=l(Le,!0);s(Le),s(we);var Oe=_(we,2),$e=l(Oe),Xe=_($e),Ze=X=>{var se=rr(),Pe=l(se);s(se),A(ya=>D(Pe,`(${ya??""})`),[()=>it(e(g).lastSeen??e(g).timestamp)]),v(X,se)};U(Xe,X=>{(e(g).lastSeen||e(g).timestamp)&&X(Ze)}),s(Oe),A(X=>{D(Je,e(g).appName||"无记录"),D($e,`最后活跃: ${X??""} `)},[()=>Se(e(g).lastSeen??e(g).timestamp,e(O),"zh")]),v(L,j)},ba=L=>{var j=nr(),we=pe(j),Le=l(we),Je=l(Le,!0);s(Le),s(we);var Oe=_(we,2),$e=l(Oe),Xe=X=>{var se=K();A(Pe=>D(se,`已空闲 ${Pe??""} 分钟`),[()=>Math.floor(e(g).idleSeconds/60)]),v(X,se)},Ze=X=>{var se=K();A(Pe=>D(se,`活跃于 ${Pe??""}`),[()=>Se(e(g).lastSeen??e(g).timestamp,e(O),"zh")]),v(X,se)};U($e,X=>{e(g).status===V.IDLE&&e(g).idleSeconds&&e(g).idleSeconds>60?X(Xe):X(Ze,-1)}),s(Oe),A(()=>D(Je,e(g).appName||"活动中")),v(L,j)};U(ha,L=>{e(G)?L(ga):L(ba,-1)}),s(Et),s(ye),A(()=>{H=te(ye,1,"wid-device-card",null,H,{"wid-device-card--offline":e(G),"wid-device-card--active":!e(G)&&e(g).status===V.ACTIVE}),kt=te(Be,1,"wid-device-card__dot",null,kt,{"wid-device-card__dot--active":!e(G)&&e(g).status===V.ACTIVE,"wid-device-card__dot--idle":!e(G)&&e(g).status===V.IDLE,"wid-device-card__dot--away":!e(G)&&e(g).status===V.AWAY,"wid-device-card__dot--offline":e(G)}),D(pa,e(g).name||e(g).deviceName||e(g).id||e(g).deviceId),It=te(Ke,1,"wid-device-card__badge",null,It,{"wid-device-card__badge--active":!e(G)&&e(g).status===V.ACTIVE,"wid-device-card__badge--idle":!e(G)&&e(g).status===V.IDLE,"wid-device-card__badge--offline":e(G)})}),v(ee,ye)}),s(_e),s(re),A(()=>{D(ve,e(B).icon),D(Me,e(B).label),D(be,e(B).devices.length)}),v(oe,re)}),v(d,m)};U(ta,d=>{e(N)&&!e(p)?d(aa):e(n)&&!e(p)?d(ra,1):e(ct).length===0?d(ia,2):d(na,-1)}),s(Ge);var oa=_(Ge,2),sa=d=>{var m=dr(),Y=_(l(m),2);tt(Y,21,()=>e(Mt),Qe,(oe,B)=>{var re=lr(),de=_(l(re),2),ie=l(de),ve=l(ie),ce=l(ve),Me=_(ce),me=ee=>{var g=K();A(()=>D(g,`@${(e(B).deviceName||e(B).name)??""}`)),v(ee,g)};U(Me,ee=>{(e(B).deviceName||e(B).name)&&ee(me)}),s(ve);var be=_(ve,2),_e=l(be,!0);s(be),s(ie),s(de),s(re),A(ee=>{D(ce,`${e(B).appName??""} `),D(_e,ee)},[()=>Se(e(B).timestamp,e(O),"zh")]),v(oe,re)}),s(Y),s(m),v(d,m)};U(oa,d=>{e(ot).length>0&&d(sa)}),s(Ye);var yt=_(Ye,2),xt=_(l(yt),2),la=l(xt),da=d=>{var m=K();A(()=>D(m,`🟢 ${e(pt)??""} 台在线 · 按需刷新`)),v(d,m)},ca=d=>{var m=K("⚪ 全设备离线 · 按需刷新");v(d,m)};U(la,d=>{e(pt)>0?d(da):d(ca,-1)}),s(xt),s(yt),s(z),s(u),Na(u,d=>Pt?.(d)),A(()=>{za(z,`--anchor-bottom: ${e(ue)}px; --anchor-left: ${e(R)}px;`),le=te(P,1,"wid-panel__refresh-pill",null,le,{"wid-panel__refresh-pill--expanded":e(E)!=="idle","wid-panel__refresh-pill--cooldown":e(E)==="cooldown","wid-panel__refresh-pill--done":e(E)==="done"}),P.disabled=e(E)==="refreshing",et(P,"aria-label",e(E)==="cooldown"?`请等待 ${e(r)} 秒后刷新`:e(E)==="refreshing"?"正在刷新状态...":e(E)==="done"?"已同步":"手动刷新状态"),et(P,"title",e(E)==="cooldown"?`请等待 ${e(r)} 秒后刷新`:"手动刷新")}),Fe("click",w,()=>b(h,!1)),Fe("click",P,vt),Fe("click",Qt,()=>{b(h,!1),M(),b(E,"idle")}),v(i,u)};U(Wt,i=>{e(h)&&i(jt)}),A(()=>{te(Ae,1,`wid-capsule-wrapper ${S()}`),te(Ce,1,`wid-capsule wid-capsule--${e(Ee)?"loading":e(Te)?"error":e(Q)?"offline":e(Re).statusType}`),et(Ce,"aria-expanded",e(h)),wt=te(_t,1,"wid-capsule__dot",null,wt,{"wid-capsule__dot--pulse":e(Ee),"wid-capsule__dot--active":!e(Q)&&!e(Ee)&&!e(Te)&&e(Re).statusType==="active","wid-capsule__dot--idle":!e(Q)&&!e(Ee)&&!e(Te)&&e(Re).statusType==="idle","wid-capsule__dot--offline":e(Q)||e(Te)}),ht=te(Ht,0,"wid-capsule__chevron",null,ht,{"wid-capsule__chevron--open":e(h)})}),Fe("click",Ce,Ot),v(t,mt),Ca()}ka(["click"]);var qe=null,Ve=null;function fr(t={}){if(typeof window>"u"||typeof document>"u")return;zt();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let c=0;const T=25;let k=null;function S(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const n=window.location.pathname.toLowerCase();return a.routeFilter.some(h=>n.startsWith(h.toLowerCase()))}function I(){if(k&&(clearTimeout(k),k=null),!S()){p();return}if(document.querySelector(".wid-mounted-portal"))return;const n=document.querySelector(a.targetSelector);if(!n?.parentElement){c<T&&(c++,k=setTimeout(I,80));return}c=0;const h=document.createElement("div");h.className="wid-mounted-portal",h.style.width="100%",h.style.display="flex",h.style.justifyContent="center",n.insertAdjacentElement(a.position,h);try{qe=Ia(ur,{target:h,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),Ve=h}catch(O){console.error("[what-im-doing] Failed to mount Svelte capsule:",O),h.remove(),Ve=null}}function p(){if(k&&(clearTimeout(k),k=null),c=0,qe){try{xa(qe)}catch{}qe=null}Ve&&(Ve.remove(),Ve=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",I):I();const N=window.swup,F=()=>{S()?(!document.querySelector(".wid-mounted-portal")||!qe)&&(p(),c=0,I()):p()};N?.hooks?N.hooks.on("page:view",F):document.addEventListener("swup:contentReplaced",F)}function He(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,fr(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>He()),window.__WHAT_IM_DOING_CONFIG__?He():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>He()):setTimeout(He,0));function ke(t){return JSON.parse(t,vr)}function vr(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const c=a[0];if(a=a[1],c===":regex:"){const T=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(T[1],T[2]||"")}if(c===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function Nt(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function mr(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function _r(t,{delayAfterLoad:a=0}={}){mr(()=>{a>0?setTimeout(()=>Nt(t),a):Nt(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/api/activity, https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));var Dt=(()=>{var t=Object.defineProperty,a=Object.getOwnPropertyDescriptor,c=Object.getOwnPropertyNames,T=Object.prototype.hasOwnProperty,k=(r,o)=>{for(var f in o)t(r,f,{get:o[f],enumerable:!0})},S=(r,o,f,y)=>{if(o&&typeof o=="object"||typeof o=="function")for(let M of c(o))!T.call(r,M)&&M!==f&&t(r,M,{get:()=>o[M],enumerable:!(y=a(o,M))||y.enumerable});return r},I=r=>S(t({},"__esModule",{value:!0}),r),p={};k(p,{initUmamiRuntime:()=>he});var N="x-umami-share-context";async function F(r,o,f=1e4){let y=new AbortController,M=setTimeout(()=>y.abort(),f);try{return await fetch(r,{...o,signal:y.signal})}catch(R){throw R instanceof DOMException&&R.name==="AbortError"?new Error(`[oddmisc] 请求超时 (${f}ms): ${r}`):R}finally{clearTimeout(M)}}function n(r){return typeof r=="number"?r:r&&typeof r.value=="number"?r.value:0}function h(r){let o=new URL(r),f=o.pathname.split("/"),y=f.indexOf("share");if(y===-1||y===f.length-1)throw new Error("无效的分享 URL：未找到 share 路径");let M=f[y+1];if(!M)throw new Error("无效的分享 URL：缺少分享 ID");let R=f.slice(0,y).join("/");return{apiBase:`${o.protocol}//${o.host}${R}/api`,shareId:M}}function O(){return Math.floor(Date.now()/3e5)*3e5}var Z=class{constructor(r,o,f=100){this.storageKey=r,this.ttl=o,this.maxEntries=f,this.cache=new Map,this.loadFromStorage()}loadFromStorage(){try{let r=localStorage.getItem(this.storageKey);if(!r)return;let o=JSON.parse(r);for(let[f,y]of Object.entries(o))y&&typeof y.timestamp=="number"&&!this.isExpired(y.timestamp)&&this.cache.set(f,y)}catch{}}saveToStorage(){try{let r={};this.cache.forEach((o,f)=>{r[f]=o}),localStorage.setItem(this.storageKey,JSON.stringify(r))}catch{}}isExpired(r){return Date.now()-r>=this.ttl}evictIfNeeded(){if(this.cache.size<=this.maxEntries)return;let r=[...this.cache.entries()].sort((f,y)=>f[1].timestamp-y[1].timestamp),o=r.length-this.maxEntries;for(let f=0;f<o;f++)this.cache.delete(r[f][0]);this.saveToStorage()}get(r){let o=this.cache.get(r);return o&&!this.isExpired(o.timestamp)?o.value:(o&&(this.cache.delete(r),this.saveToStorage()),null)}set(r,o){this.cache.set(r,{value:o,timestamp:Date.now()}),this.saveToStorage(),this.evictIfNeeded()}clear(){this.cache.clear();try{localStorage.removeItem(this.storageKey)}catch{}}},Ie=class{constructor(r){if(this.shareData=null,this.sharePromise=null,!r.shareUrl)throw new Error("shareUrl 是必需参数");let{apiBase:o,shareId:f}=h(r.shareUrl);this.apiBase=o,this.shareId=f,this.cache=new Z(`umami-runtime-${f}`,36e5)}async getShareData(){return this.shareData?this.shareData:this.sharePromise?this.sharePromise:(this.sharePromise=(async()=>{let r=await F(`${this.apiBase}/share/${this.shareId}`);if(!r.ok)throw this.shareData=null,this.sharePromise=null,new Error(`获取分享信息失败: ${r.status}`);let o=await r.json();return this.shareData=o,o})(),this.sharePromise)}async authedFetch(r){let{websiteId:o,token:f}=await this.getShareData(),y=await F(`${this.apiBase}/websites/${o}${r}`,{headers:{"x-umami-share-token":f,[N]:"1"}});if(!y.ok)throw y.status===401&&(this.shareData=null,this.sharePromise=null),new Error(`请求 ${r} 失败: ${y.status}`);return await y.json()}async getStats(r){let o=O(),f=`${r?`stats-${r}`:"stats-site"}-${o}`,y=this.cache.get(f);if(y)return{...y,_fromCache:!0};let M=new URLSearchParams({startAt:"0",endAt:o.toString()});r&&M.set("path",`eq.${r}`);let R=await this.authedFetch(`/stats?${M.toString()}`),ue={pageviews:n(R.pageviews),visitors:n(R.visitors),visits:n(R.visits)};return R.bounces!==void 0&&(ue.bounces=n(R.bounces)),R.totaltime!==void 0&&(ue.totaltime=n(R.totaltime)),this.cache.set(f,ue),ue}getSiteStats(){return this.getStats()}getPageStats(r){return this.getStats(r)}async getActiveVisitors(){let r=await this.authedFetch("/active");return typeof r?.visitors=="number"?r.visitors:0}clearCache(){this.cache.clear(),this.shareData=null,this.sharePromise=null}};function E(){let r=()=>Promise.resolve({pageviews:0,visitors:0,visits:0});window.oddmisc={getStats:r,getSiteStats:r,getPageStats:r,getActiveVisitors:()=>Promise.resolve(0),clearCache:()=>{}}}function he(r){if(!r.shareUrl)console.log("[oddmisc] shareUrl 未配置，跳过初始化"),E();else try{let o=new Ie(r);window.oddmisc={umami:o,getStats:f=>o.getStats(f),getSiteStats:()=>o.getSiteStats(),getPageStats:f=>o.getPageStats(f),getActiveVisitors:()=>o.getActiveVisitors(),clearCache:()=>o.clearCache()},console.log("[oddmisc] Umami runtime client initialized")}catch(o){console.warn("[oddmisc] 初始化失败:",o instanceof Error?o.message:o),E()}window.dispatchEvent(new CustomEvent("oddmisc-ready",{detail:{client:window.oddmisc}}))}return I(p)})();typeof window<"u"&&typeof Dt<"u"&&Dt.initUmamiRuntime({shareUrl:"https://cloud.umami.is/analytics/eu/share/BywgdGzJ6ra6T7Pb"});async function wr(){const[t,a,c,T,k,S]=await Promise.all([xe(()=>import("./Swup.Cz2sqVT0.js").then(n=>n.default),__vite__mapDeps([0,1])),xe(()=>import("./SwupA11yPlugin.COK5EHWy.js").then(n=>n.default),__vite__mapDeps([2,1,3])),xe(()=>import("./SwupPreloadPlugin.BmKT5rcH.js").then(n=>n.default),__vite__mapDeps([4,1,3])),xe(()=>import("./SwupScrollPlugin.DXF80AYT.js").then(n=>n.default),__vite__mapDeps([5,1,3])),xe(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(n=>n.default),__vite__mapDeps([6,3])),xe(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(n=>n.default),__vite__mapDeps([7,3]))]),I=ke('"a[href=\\"#\\"]"'),p=(n,h,{el:O,event:Z})=>typeof n=="string"&&n.startsWith("/")?h.startsWith(n):typeof n=="string"?O?.matches(n)??!1:n instanceof RegExp?n.test(h):typeof n=="function"?n(h,{el:O,event:Z}):Array.isArray(n)?n.some(Ie=>p(Ie,h,{el:O,event:Z})):!1,N=new t({ignoreVisit:(n,{el:h,event:O}={})=>h?.closest("[data-no-swup]")||p(I,n,{el:h,event:O}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(ke("{}")),new c(ke('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new T(ke("{}")),new k(ke('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new S(ke("{}"))]}),F=n=>document.dispatchEvent(new Event(n));N.hooks.before("content:replace",()=>F("astro:before-swap")),N.hooks.on("content:replace",()=>F("astro:after-swap")),N.hooks.on("page:view",()=>F("astro:page-load")),window.swup=N}_r(wr);
