const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/enhance.asIpQ2NE.js","_astro/preload-helper.DLd7ZaJy.js","_astro/Swup.okfGCf0T.js","_astro/Swup.modern.C2CFcRcI.js","_astro/SwupA11yPlugin.DvfTARzg.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.SkV6a72Q.js","_astro/SwupScrollPlugin.CznjUOSB.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as ve}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{A as h,F as dt,H as e,I as Y,J as Na,L as Sa,M as p,N as za,P as S,Q as La,R as Ae,S as C,T as Da,X as de,Y as n,Z as u,a as Aa,at as Ma,b as at,ct as i,et as m,f as rt,g as Ca,h as J,it as Oa,j as qa,k as Fa,m as Pa,q as x,rt as R,st as At,t as Ye,tt as j,y as it}from"./client.sORrpbwZ.js";var Ra=`
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
`;function Ot(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=Ra,document.head.appendChild(t)}var D;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})(D||(D={}));var Er=new TextEncoder,Va=new TextDecoder,ot=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const d=this.buffer[this.pos++];if(t|=BigInt(d&127)<<a,(d&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return Va.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function nt(t){const a=new ot(t),d={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:D.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const b=a.readTag();if(!b)break;switch(b.fieldNo){case 1:d.timestamp=Number(a.readVarint());break;case 2:d.deviceId=a.readString();break;case 3:d.deviceName=a.readString();break;case 4:d.appName=a.readString();break;case 5:d.windowTitle=a.readString();break;case 6:d.status=Number(a.readVarint());break;case 7:d.osInfo=a.readString();break;case 8:d.idleSeconds=Number(a.readVarint());break;case 9:{const y=a.readBytes(),k=new ot(y);let T="",f="";for(;k.hasMore;){const N=k.readTag();if(!N)break;N.fieldNo===1?T=k.readString():N.fieldNo===2?f=k.readString():k.skip(N.wireType)}T&&d.metadata&&(d.metadata[T]=f);break}default:a.skip(b.wireType)}}return d}function Wa(t){const a=new ot(t);let d=null;const b=[],y=[];let k=Date.now();for(;a.hasMore;){const T=a.readTag();if(!T)break;switch(T.fieldNo){case 1:d=nt(a.readBytes());break;case 2:{const f=a.readBytes();b.push(nt(f));break}case 3:{const f=a.readBytes();y.push(nt(f));break}case 4:k=Number(a.readVarint());break;default:a.skip(T.wireType)}}return{current:d,devices:b,history:y,serverTime:k}}function Ha(t){if(!t)return"";const a=t.charAt(0);return a>="a"&&a<="z"?a.toUpperCase()+t.slice(1):t}function be(t,a=Date.now(),d="zh"){const b=Math.max(0,a-t),y=Math.floor(b/1e3),k=Math.floor(y/60),T=Math.floor(k/60),f=Math.floor(T/24);return d==="zh"?y<45?"刚刚":k<60?`${k}分钟前`:T<24?`${T}小时前`:f===1?"昨天":f<30?`${f}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):y<45?"just now":k<60?`${k}m ago`:T<24?`${T}h ago`:f===1?"yesterday":f<30?`${f}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function st(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Ba(t,a=Date.now(),d="zh"){if(!t||t<=0)return"";const b=st(t);if(!b)return"";const y=be(t,a,d);return d==="zh"?`最后活跃时间: ${b} (${y})`:`Last active: ${b} (${y})`}function Ya(t,a=Date.now(),d="zh"){if(!t?.appName)return{statusType:"offline",sentence:d==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const b=t.lastSeen??t.timestamp,y=Math.max(0,a-b),k=Math.floor(y/1e3),T=be(b,a,d);let f="active";t.status===D.OFFLINE||t.offline||k>259200?f="offline":t.status===D.AWAY||k>1800?f="away":(t.status===D.IDLE||k>180)&&(f="idle");const N=f==="active"&&k<120,P=t.deviceName||t.name||t.deviceId||t.id||(d==="zh"?"Linux设备":"Device");let o="";if(t.media?.title&&N){const w=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;d==="zh"?o=`正在 ${P} 收听 ${w}`:o=`Listening to ${w} on ${P}`}else d==="zh"?N?o=`正在 ${P} 使用 ${t.appName}`:f==="offline"?o=`最后在使用: ${t.appName}`:o=`${T}在 ${P} 使用 ${t.appName}`:N?o=`Using ${t.appName} on ${P}`:f==="offline"?o=`Last used: ${t.appName}`:o=`${T} used ${t.appName} on ${P}`;return{statusType:f,sentence:o,appName:t.appName,deviceName:P,relativeTime:T}}var ja=S('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ua=S('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),Ga=S('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),$a=S('<span class="wid-capsule__prefix">离线</span> <!>',1),Ka=S('<span class="wid-capsule__media-icon">🎵</span> <span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Xa=S('<span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Ja=S("<span> </span>"),Qa=dt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>'),Za=dt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>'),er=dt('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>'),tr=S('<span class="wid-current-card__device"> </span>'),ar=S('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> </span></div>'),rr=S('<span class="wid-current-card__os-info"> </span>'),ir=S('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <!></div> <!> <div class="wid-current-card__footer"><span class="wid-current-card__time"> </span> <!></div></div>'),nr=S('<div class="wid-panel__empty">正在获取设备状态...</div>'),or=S('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),sr=S('<div class="wid-panel__empty">当前暂无已登记设备</div>'),Mt=S('<div class="wid-device-card__win-title"> </div>'),dr=S('<span class="wid-device-card__abs-time"> </span>'),lr=S('<div class="wid-device-card__app"><span class="wid-device-card__muted-label"> </span> <span class="wid-device-card__app-title"> </span></div> <!> <div class="wid-device-card__time"> <!></div>',1),cr=S('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span></div> <!> <div class="wid-device-card__time"><!></div>',1),pr=S('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),fr=S('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),ur=S('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> <!></span> <span class="wid-timeline__time"> </span></div></div></li>'),_r=S('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),vr=S('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button"><!> <span class="wid-panel__refresh-label"><!></span></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),mr=S('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function wr(t,a){Ma(a,!0),Ot();let d=Ye(a,"endpoint",3,"/api/activity"),b=Ye(a,"maxHistoryDisplay",3,5),y=Ye(a,"refreshInterval",3,0),k=Ye(a,"class",3,"");const T=R(()=>Array.isArray(d())?d().map(r=>r.trim()).filter(Boolean):typeof d()=="string"?d().split(",").map(r=>r.trim()).filter(Boolean):["/api/activity"]);let f=j(null),N=j(!1),P=j(!1),o=j(null),w=j(!1),A=j(La(Date.now())),ae=j(null),Ue=j(!1),I=j("idle"),Oe=j(0),qe=j(0),Fe=null,Pe=null,Re=null;function ie(){Fe&&(clearInterval(Fe),Fe=null),Pe&&(clearTimeout(Pe),Pe=null),Re&&(clearTimeout(Re),Re=null)}let Ve=j(0),lt=j(0);const g=R(()=>e(f)?.current??null),Ge=R(()=>e(f)?.devices??[]),ct=R(()=>e(f)?.history??[]),xe=R(()=>!e(f)&&e(N)),ye=R(()=>!e(f)&&!e(N)&&!!e(o)),G=R(()=>{if(!e(f)||!e(g))return!1;if(e(g).offline||e(g).status===D.OFFLINE)return!0;const r=e(g).lastSeen??e(g).timestamp,l=(e(g).type||"").toLowerCase()==="server"?9e5:12e4;return!!(r&&e(A)-r>l)}),pt=R(()=>{if(!e(G))return"";const r=e(g)?.lastSeen??e(g)?.timestamp??0;return Ba(r,e(A),"zh")}),ft=R(()=>e(g)&&(e(g).deviceName||e(g).name||e(g).deviceId||e(g).id)||""),qt=R(()=>Ha(e(g)?.appName||"")),We=R(()=>Ya(e(g),e(A),"zh")),Ft=R(()=>{if(e(G))return"离线";switch(e(We).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),ut={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},_t=R(()=>{const r=e(Ge).length>0?e(Ge):e(g)?[e(g)]:[],l={desktop:[],laptop:[],server:[],other:[]};for(const v of r){const E=(v.type||"desktop").toLowerCase();E==="desktop"?l.desktop.push(v):E==="laptop"?l.laptop.push(v):E==="server"?l.server.push(v):l.other.push(v)}return["desktop","laptop","server","other"].filter(v=>l[v].length>0).map(v=>({key:v,label:ut[v]?.label??v,icon:ut[v]?.icon??"💻",devices:l[v]}))}),vt=R(()=>e(Ge).filter(r=>{if(r.offline||r.status===D.OFFLINE)return!1;const l=(r.type||"").toLowerCase()==="server"?9e5:12e4;return e(A)-(r.lastSeen??r.timestamp)<=l}).length),Pt=R(()=>e(ct).slice(0,b()));let ke=null;async function Te(r=!1){if(e(N)&&!r)return!1;r&&ke&&ke.abort(),m(N,!0),r&&m(P,!0);const l=new AbortController;ke=l;const v=setTimeout(()=>l.abort(),9e3);let E=!1;try{m(o,null);let M=null;for(const Q of e(T)){if(l.signal.aborted)break;try{const L=await fetch(Q,{signal:l.signal});if(!L.ok){M=new Error(`HTTP ${L.status}`);continue}const ne=L.headers.get("content-type")??"";if(ne.includes("application/x-protobuf")){const me=await L.arrayBuffer();m(f,Wa(new Uint8Array(me)),!0),E=!0;break}else if(ne.includes("application/json")||ne.includes("text/plain")){const me=await L.text();try{const le=JSON.parse(me);if(le&&(le.current!==void 0||le.devices!==void 0||le.serverTime!==void 0)){m(f,le,!0),E=!0;break}}catch{continue}}}catch(L){if(L?.name==="AbortError"){M=L;break}M=L;continue}}E?(m(A,Date.now(),!0),m(Oe,Date.now(),!0),m(o,null)):M?.name==="AbortError"?m(o,"连接状态服务器超时，请点击重试"):m(o,"无法连接至状态服务器")}catch(M){M?.name==="AbortError"?m(o,"连接状态服务器超时，请点击重试"):m(o,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",M)}finally{clearTimeout(v),ke===l&&(ke=null),m(N,!1),m(P,!1)}return E}let Ie=null;function mt(){y()>0&&!Ie&&(Ie=setInterval(()=>{document.visibilityState==="visible"&&Te()},y()))}function Rt(){Ie&&(clearInterval(Ie),Ie=null)}function wt(){if(typeof window>"u"||(m(Ue,window.innerWidth<768),!e(ae)))return;const r=e(ae).getBoundingClientRect();m(Ve,Math.round(r.left+r.width/2),!0),m(Ve,Math.max(210,Math.min(window.innerWidth-210,e(Ve))),!0),m(lt,Math.round(window.innerHeight-r.top),!0)}function Vt(){m(w,!e(w)),e(w)?(m(A,Date.now(),!0),wt(),!e(f)&&!e(N)&&Te()):(ie(),m(I,"idle"))}async function ht(r){if(r?.stopPropagation(),e(I)==="refreshing")return;const l=5e3,v=Date.now()-e(Oe);if(e(Oe)>0&&v<l){ie(),m(I,"cooldown");const E=()=>{const Q=l-(Date.now()-e(Oe));Q<=0?(ie(),m(I,"idle")):m(qe,Math.max(1,Math.ceil(Q/1e3)),!0)};E(),Fe=setInterval(E,200);const M=Math.min(1800,Math.max(800,l-v));Pe=setTimeout(()=>{ie(),m(I,"idle")},M);return}ie(),m(I,"refreshing"),await Te(!0)?(m(I,"done"),Re=setTimeout(()=>{m(I,"idle")},700)):m(I,"idle")}function Wt(r){return document.body.appendChild(r),{destroy(){r.parentNode&&r.parentNode.removeChild(r)}}}Na(()=>{if(!(typeof document>"u")&&e(w)){const r=document.body.style.overflow,l=document.body.style.paddingRight,v=window.innerWidth-document.documentElement.clientWidth;return v>0&&(document.body.style.paddingRight=`${v}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=r,document.body.style.paddingRight=l}}}),Da(()=>{let r=null;typeof IntersectionObserver<"u"&&e(ae)?(r=new IntersectionObserver(E=>{for(const M of E)if(M.isIntersecting){Te(),mt(),r?.disconnect(),r=null;break}},{rootMargin:"60px"}),r.observe(e(ae))):(Te(),mt());const l=()=>{e(w)&&wt()},v=E=>{E.key==="Escape"&&e(w)&&(m(w,!1),ie(),m(I,"idle"))};return window.addEventListener("resize",l),window.addEventListener("keydown",v),()=>{Rt(),ie(),r&&r.disconnect(),window.removeEventListener("resize",l),window.removeEventListener("keydown",v)}});var gt=mr(),Ee=de(gt),Ne=n(Ee),bt=n(Ne);let xt;var $e=u(bt,2),Ht=n($e),Bt=r=>{var l=ja();At(2),p(r,l)},Yt=r=>{var l=Ua();At(2),p(r,l)},jt=r=>{var l=$a(),v=u(de(l),2),E=M=>{var Q=Ga(),L=u(de(Q),2),ne=n(L,!0);i(L),x(()=>h(ne,e(pt))),p(M,Q)};C(v,M=>{e(pt)&&M(E)}),p(r,l)},Ut=r=>{var l=Ka(),v=u(de(l),4),E=n(v,!0);i(v),x(()=>h(E,e(g).media.title)),p(r,l)},Gt=r=>{var l=Xa(),v=u(de(l),2),E=n(v,!0);i(v),x(()=>h(E,e(qt))),p(r,l)},$t=r=>{var l=Ja(),v=n(l,!0);i(l),x(()=>h(v,e(Ft))),p(r,l)};C(Ht,r=>{e(xe)?r(Bt):e(ye)?r(Yt,1):e(G)?r(jt,2):e(g)?.media?.title?r(Ut,3):e(g)?.appName?r(Gt,4):r($t,-1)}),i($e);var Kt=u($e,2);let yt;i(Ne),i(Ee),Aa(Ee,r=>m(ae,r),()=>e(ae));var Xt=u(Ee,2),Jt=r=>{var l=vr(),v=n(l),E=u(v,2),M=u(n(E),2),Q=u(n(M),2),L=n(Q);let ne;var me=n(L),le=s=>{var _=Qa();p(s,_)},Qt=s=>{var _=Za();p(s,_)},Zt=s=>{var _=er();let H;x(()=>H=J(_,0,"wid-panel__refresh-icon",null,H,{"wid-panel__refresh-icon--spin":e(I)==="refreshing"})),p(s,_)};C(me,s=>{e(I)==="done"?s(le):e(I)==="cooldown"?s(Qt,1):s(Zt,-1)});var kt=u(me,2),ea=n(kt),ta=s=>{var _=Y();x(()=>h(_,`请等待 ${e(qe)??""} 秒刷新`)),p(s,_)},aa=s=>{var _=Y("正在刷新...");p(s,_)},ra=s=>{var _=Y("已同步");p(s,_)};C(ea,s=>{e(I)==="cooldown"?s(ta):e(I)==="refreshing"?s(aa,1):e(I)==="done"&&s(ra,2)}),i(kt),i(L);var ia=u(L,2);i(Q),i(M);var Ke=u(M,2),Tt=n(Ke),na=s=>{var _=ir();let H;var re=n(_),O=n(re);let Z;var oe=n(O,!0);i(O);var ee=u(O,2),ce=n(ee,!0);i(ee);var se=u(ee,2),Se=q=>{var V=tr(),te=n(V);i(V),x(()=>h(te,`@${e(ft)??""}`)),p(q,V)};C(se,q=>{e(ft)&&q(Se)}),i(re);var pe=u(re,2),we=q=>{var V=ar(),te=u(n(V),2),ze=n(te,!0);i(te),i(V),x(()=>h(ze,e(g).mediaTitle)),p(q,V)};C(pe,q=>{e(g).mediaTitle&&q(we)});var fe=u(pe,2),$=n(fe),c=n($);i($);var K=u($,2),B=q=>{var V=rr(),te=n(V,!0);i(V),x(()=>h(te,e(g).osInfo)),p(q,V)};C(K,q=>{e(g).osInfo&&q(B)}),i(fe),i(_),x((q,V)=>{H=J(_,1,"wid-current-card",null,H,{"wid-current-card--offline":e(G)}),Z=J(O,1,"wid-tag",null,Z,{"wid-tag--primary":!e(G),"wid-tag--muted":e(G)}),h(oe,e(G)?"最后使用":"当前活跃"),h(ce,e(g).appName||"idle"),h(c,`活跃于 ${q??""} · ${V??""}`)},[()=>be(e(g).lastSeen??e(g).timestamp,e(A),"zh"),()=>st(e(g).lastSeen??e(g).timestamp,"zh")]),p(s,_)};C(Tt,s=>{e(g)&&s(na)});var Xe=u(Tt,2),oa=n(Xe),sa=s=>{var _=nr();p(s,_)},da=s=>{var _=or(),H=n(_),re=n(H,!0);i(H);var O=u(H,2);i(_),x(()=>h(re,e(o))),Ae("click",O,()=>ht()),p(s,_)},la=s=>{var _=sr();p(s,_)},ca=s=>{var _=za(),H=de(_);it(H,17,()=>e(_t),at,(re,O)=>{var Z=fr(),oe=n(Z),ee=n(oe),ce=n(ee,!0);i(ee);var se=u(ee,2),Se=n(se,!0);i(se);var pe=u(se,2),we=n(pe,!0);i(pe),i(oe);var fe=u(oe,2);it(fe,21,()=>e(O).devices,at,($,c)=>{const K=R(()=>(e(c).type||"").toLowerCase()==="server"),B=R(()=>e(c).offline||e(c).status===D.OFFLINE||e(A)-(e(c).lastSeen??e(c).timestamp)>(e(K)?9e5:12e4));var q=pr();let V;var te=n(q),ze=n(te),Nt=n(ze);let St;var zt=u(Nt,2),ma=n(zt,!0);i(zt),i(ze);var Je=u(ze,2);let Lt;var wa=n(Je),ha=z=>{var F=Y("离线");p(z,F)},ga=z=>{var F=Y();x(()=>h(F,e(K)?"运行正常":"正在活跃")),p(z,F)},ba=z=>{var F=Y();x(()=>h(F,e(K)?"待命中":"空闲")),p(z,F)},xa=z=>{var F=Y();x(()=>h(F,e(K)?"服务降级":"离开")),p(z,F)},ya=z=>{var F=Y("在线");p(z,F)};C(wa,z=>{e(B)?z(ha):e(c).status===D.ACTIVE?z(ga,1):e(c).status===D.IDLE?z(ba,2):e(c).status===D.AWAY?z(xa,3):z(ya,-1)}),i(Je),i(te);var Dt=u(te,2),ka=n(Dt),Ta=z=>{var F=lr(),ue=de(F),he=n(ue),Qe=n(he,!0);i(he);var Le=u(he,2),Ze=n(Le,!0);i(Le),i(ue);var De=u(ue,2),et=W=>{var _e=Mt(),tt=n(_e,!0);i(_e),x(()=>h(tt,e(c).windowTitle)),p(W,_e)};C(De,W=>{e(c).windowTitle&&W(et)});var He=u(De,2),Be=n(He),U=u(Be),X=W=>{var _e=dr(),tt=n(_e);i(_e),x(Ea=>h(tt,`(${Ea??""})`),[()=>st(e(c).lastSeen??e(c).timestamp)]),p(W,_e)};C(U,W=>{(e(c).lastSeen||e(c).timestamp)&&W(X)}),i(He),x(W=>{h(Qe,e(K)?"服务:":"最后使用:"),h(Ze,e(c).appName||"无记录"),h(Be,`${e(K)?"最后心跳:":"最后活跃:"} ${W??""} `)},[()=>be(e(c).lastSeen??e(c).timestamp,e(A),"zh")]),p(z,F)},Ia=z=>{var F=cr(),ue=de(F),he=n(ue),Qe=n(he,!0);i(he),i(ue);var Le=u(ue,2),Ze=U=>{var X=Mt(),W=n(X,!0);i(X),x(()=>h(W,e(c).windowTitle)),p(U,X)};C(Le,U=>{e(c).windowTitle&&U(Ze)});var De=u(Le,2),et=n(De),He=U=>{var X=Y();x(W=>h(X,`已空闲 ${W??""} 分钟`),[()=>Math.floor(e(c).idleSeconds/60)]),p(U,X)},Be=U=>{var X=Y();x(W=>h(X,`${e(K)?"心跳于":"活跃于"} ${W??""}`),[()=>be(e(c).lastSeen??e(c).timestamp,e(A),"zh")]),p(U,X)};C(et,U=>{!e(K)&&e(c).status===D.IDLE&&e(c).idleSeconds&&e(c).idleSeconds>60?U(He):U(Be,-1)}),i(De),x(()=>h(Qe,e(c).appName||(e(K)?"服务运行中":"活动中"))),p(z,F)};C(ka,z=>{e(B)?z(Ta):z(Ia,-1)}),i(Dt),i(q),x(()=>{V=J(q,1,"wid-device-card",null,V,{"wid-device-card--offline":e(B),"wid-device-card--active":!e(B)&&e(c).status===D.ACTIVE}),St=J(Nt,1,"wid-device-card__dot",null,St,{"wid-device-card__dot--active":!e(B)&&e(c).status===D.ACTIVE,"wid-device-card__dot--idle":!e(B)&&e(c).status===D.IDLE,"wid-device-card__dot--away":!e(B)&&e(c).status===D.AWAY,"wid-device-card__dot--offline":e(B)}),h(ma,e(c).name||e(c).deviceName||e(c).id||e(c).deviceId),Lt=J(Je,1,"wid-device-card__badge",null,Lt,{"wid-device-card__badge--active":!e(B)&&e(c).status===D.ACTIVE,"wid-device-card__badge--idle":!e(B)&&e(c).status===D.IDLE,"wid-device-card__badge--away":!e(B)&&e(c).status===D.AWAY,"wid-device-card__badge--offline":e(B)})}),p($,q)}),i(fe),i(Z),x(()=>{h(ce,e(O).icon),h(Se,e(O).label),h(we,e(O).devices.length)}),p(re,Z)}),p(s,_)};C(oa,s=>{e(N)&&!e(f)?s(sa):e(o)&&!e(f)?s(da,1):e(_t).length===0?s(la,2):s(ca,-1)}),i(Xe);var pa=u(Xe,2),fa=s=>{var _=_r(),H=u(n(_),2);it(H,21,()=>e(Pt),at,(re,O)=>{var Z=ur(),oe=u(n(Z),2),ee=n(oe),ce=n(ee),se=n(ce),Se=u(se),pe=$=>{var c=Y();x(()=>h(c,`@${(e(O).deviceName||e(O).name)??""}`)),p($,c)};C(Se,$=>{(e(O).deviceName||e(O).name)&&$(pe)}),i(ce);var we=u(ce,2),fe=n(we,!0);i(we),i(ee),i(oe),i(Z),x($=>{h(se,`${e(O).appName??""} `),h(fe,$)},[()=>be(e(O).timestamp,e(A),"zh")]),p(re,Z)}),i(H),i(_),p(s,_)};C(pa,s=>{e(ct).length>0&&s(fa)}),i(Ke);var It=u(Ke,2),Et=u(n(It),2),ua=n(Et),_a=s=>{var _=Y();x(()=>h(_,`🟢 ${e(vt)??""} 台在线 · 按需刷新`)),p(s,_)},va=s=>{var _=Y("⚪ 全设备离线 · 按需刷新");p(s,_)};C(ua,s=>{e(vt)>0?s(_a):s(va,-1)}),i(Et),i(It),i(E),i(l),Ca(l,s=>Wt?.(s)),x(()=>{Pa(E,`--anchor-bottom: ${e(lt)}px; --anchor-left: ${e(Ve)}px;`),ne=J(L,1,"wid-panel__refresh-pill",null,ne,{"wid-panel__refresh-pill--expanded":e(I)!=="idle","wid-panel__refresh-pill--cooldown":e(I)==="cooldown","wid-panel__refresh-pill--done":e(I)==="done"}),L.disabled=e(I)==="refreshing",rt(L,"aria-label",e(I)==="cooldown"?`请等待 ${e(qe)} 秒后刷新`:e(I)==="refreshing"?"正在刷新状态...":e(I)==="done"?"已同步":"手动刷新状态"),rt(L,"title",e(I)==="cooldown"?`请等待 ${e(qe)} 秒后刷新`:"手动刷新")}),Ae("click",v,()=>m(w,!1)),Ae("click",L,ht),Ae("click",ia,()=>{m(w,!1),ie(),m(I,"idle")}),p(r,l)};C(Xt,r=>{e(w)&&r(Jt)}),x(()=>{J(Ee,1,`wid-capsule-wrapper ${k()}`),J(Ne,1,`wid-capsule wid-capsule--${e(xe)?"loading":e(ye)?"error":e(G)?"offline":e(We).statusType}`),rt(Ne,"aria-expanded",e(w)),xt=J(bt,1,"wid-capsule__dot",null,xt,{"wid-capsule__dot--pulse":e(xe),"wid-capsule__dot--active":!e(G)&&!e(xe)&&!e(ye)&&e(We).statusType==="active","wid-capsule__dot--idle":!e(G)&&!e(xe)&&!e(ye)&&e(We).statusType==="idle","wid-capsule__dot--offline":e(G)||e(ye)}),yt=J(Kt,0,"wid-capsule__chevron",null,yt,{"wid-capsule__chevron--open":e(w)})}),Ae("click",Ne,Vt),p(t,gt),Oa()}Sa(["click"]);var Me=null,Ce=null;function hr(t={}){if(typeof window>"u"||typeof document>"u")return;Ot();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let d=0;const b=25;let y=null;function k(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const o=window.location.pathname.toLowerCase();return a.routeFilter.some(w=>o.startsWith(w.toLowerCase()))}function T(){if(y&&(clearTimeout(y),y=null),!k()){f();return}if(document.querySelector(".wid-mounted-portal"))return;const o=document.querySelector(a.targetSelector);if(!o?.parentElement){d<b&&(d++,y=setTimeout(T,80));return}d=0;const w=document.createElement("div");w.className="wid-mounted-portal",w.style.width="100%",w.style.display="flex",w.style.justifyContent="center",o.insertAdjacentElement(a.position,w);try{Me=Fa(wr,{target:w,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),Ce=w}catch(A){console.error("[what-im-doing] Failed to mount Svelte capsule:",A),w.remove(),Ce=null}}function f(){if(y&&(clearTimeout(y),y=null),d=0,Me){try{qa(Me)}catch{}Me=null}Ce&&(Ce.remove(),Ce=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",T):T();const N=window.swup,P=()=>{k()?(!document.querySelector(".wid-mounted-portal")||!Me)&&(f(),d=0,T()):f()};N?.hooks?N.hooks.on("page:view",P):document.addEventListener("swup:contentReplaced",P)}function je(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,hr(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>je()),window.__WHAT_IM_DOING_CONFIG__?je():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>je()):setTimeout(je,0));function ge(t){return JSON.parse(t,gr)}function gr(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const d=a[0];if(a=a[1],d===":regex:"){const b=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(b[1],b[2]||"")}if(d===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function Ct(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function br(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function xr(t,{delayAfterLoad:a=0}={}){br(()=>{a>0?setTimeout(()=>Ct(t),a):Ct(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/api/activity, https://what-im-doing-hub.yaochenli083.workers.dev/api/activity, https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));window.__MELLOW_PLAYER_CONFIG__={engine:"auto",engineUrl:null,engineTimeoutMs:15e3,diagnostics:!0,labels:{play:"播放",pause:"暂停",mute:"静音",unmute:"取消静音",seek:"播放进度",volume:"音量",rate:"播放速度",fullscreen:"全屏",exitFullscreen:"退出全屏",loading:"正在准备播放…",error:"播放失败",diagnostics:"播放诊断",engine:"播放引擎",engineNative:"原生",engineMellow:"Mellow",requests:"有界请求数",transferred:"已传输",hardware:"硬件解码",hardwareEnabled:"已启用",hardwareDisabled:"不可用",startup:"就绪耗时",seekLatency:"最近跳转"},routeFilter:[]};(function(){var t="figure[data-artplayer]",a=!1;function d(){a||(a=!0,ve(()=>import("./enhance.asIpQ2NE.js").then(function(b){b.watchArtPlayer(window.__MELLOW_PLAYER_CONFIG__)}),__vite__mapDeps([0,1])).catch(function(b){console.error("[mellow-player] runtime failed to load:",b)}))}if(document.querySelector(t)!==null){d();return}document.addEventListener("swup:content:replace",function(){setTimeout(function(){document.querySelector(t)!==null&&d()},0)})})();async function yr(){const[t,a,d,b,y,k]=await Promise.all([ve(()=>import("./Swup.okfGCf0T.js").then(o=>o.default),__vite__mapDeps([2,3])),ve(()=>import("./SwupA11yPlugin.DvfTARzg.js").then(o=>o.default),__vite__mapDeps([4,3,5])),ve(()=>import("./SwupPreloadPlugin.SkV6a72Q.js").then(o=>o.default),__vite__mapDeps([6,3,5])),ve(()=>import("./SwupScrollPlugin.CznjUOSB.js").then(o=>o.default),__vite__mapDeps([7,3,5])),ve(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(o=>o.default),__vite__mapDeps([8,5])),ve(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(o=>o.default),__vite__mapDeps([9,5]))]),T=ge('["a[href=\\"#\\"]"]'),f=(o,w,{el:A,event:ae})=>typeof o=="string"&&o.startsWith("/")?w.startsWith(o):typeof o=="string"?A?.matches(o)??!1:o instanceof RegExp?o.test(w):typeof o=="function"?o(w,{el:A,event:ae}):Array.isArray(o)?o.some(Ue=>f(Ue,w,{el:A,event:ae})):!1,N=new t({ignoreVisit:(o,{el:w,event:A}={})=>w?.closest("[data-no-swup]")||f(T,o,{el:w,event:A}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(ge("{}")),new d(ge('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new b(ge("{}")),new y(ge('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new k(ge("{}"))]}),P=o=>document.dispatchEvent(new Event(o));N.hooks.before("content:replace",()=>P("astro:before-swap")),N.hooks.on("content:replace",()=>P("astro:after-swap")),N.hooks.on("page:view",()=>P("astro:page-load")),window.swup=N}xr(yr);
