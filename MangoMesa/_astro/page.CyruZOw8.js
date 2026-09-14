const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Swup.Cz2sqVT0.js","_astro/Swup.modern.D7qINR80.js","_astro/SwupA11yPlugin.COK5EHWy.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.BmKT5rcH.js","_astro/SwupScrollPlugin.DXF80AYT.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as ke}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{$ as b,A as xa,F as Q,I as ka,J as l,K as A,L as Fe,M as Sa,N as M,O as Ia,P as st,S as V,V as e,X as f,Y as ne,Z as Ea,a as Ta,b as et,et as ee,f as tt,g as Na,h as oe,it as Da,j as v,k as S,m as za,nt as K,ot as Nt,q as Aa,rt as Ca,st as o,t as He,w as Ma,y as at}from"./client.CVK8X0vf.js";var La=`
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
	height: 32px;
	padding: 0 0.85rem;
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

/* 胶囊文本区域 (单行截断，高质感) */
.wid-capsule__text {
	display: inline-flex;
	align-items: center;
	gap: 0.25rem;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	flex: 1 1 auto;
	min-width: 0;
	line-height: 1;
}

.wid-capsule__prefix {
	opacity: 0.72;
	font-weight: 400;
	flex-shrink: 0;
}

.wid-capsule__app {
	font-weight: 600;
	color: var(--primary, #6750a4);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
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
`;function At(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=La,document.head.appendChild(t)}var R;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})(R||(R={}));var br=new TextEncoder,Oa=new TextDecoder,nt=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const c=this.buffer[this.pos++];if(t|=BigInt(c&127)<<a,(c&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return Oa.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function rt(t){const a=new nt(t),c={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:R.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const D=a.readTag();if(!D)break;switch(D.fieldNo){case 1:c.timestamp=Number(a.readVarint());break;case 2:c.deviceId=a.readString();break;case 3:c.deviceName=a.readString();break;case 4:c.appName=a.readString();break;case 5:c.windowTitle=a.readString();break;case 6:c.status=Number(a.readVarint());break;case 7:c.osInfo=a.readString();break;case 8:c.idleSeconds=Number(a.readVarint());break;case 9:{const I=a.readBytes(),E=new nt(I);let T="",p="";for(;E.hasMore;){const z=E.readTag();if(!z)break;z.fieldNo===1?T=E.readString():z.fieldNo===2?p=E.readString():E.skip(z.wireType)}T&&c.metadata&&(c.metadata[T]=p);break}default:a.skip(D.wireType)}}return c}function Pa(t){const a=new nt(t);let c=null;const D=[],I=[];let E=Date.now();for(;a.hasMore;){const T=a.readTag();if(!T)break;switch(T.fieldNo){case 1:c=rt(a.readBytes());break;case 2:{const p=a.readBytes();D.push(rt(p));break}case 3:{const p=a.readBytes();I.push(rt(p));break}case 4:E=Number(a.readVarint());break;default:a.skip(T.wireType)}}return{current:c,devices:D,history:I,serverTime:E}}function Ie(t,a=Date.now(),c="zh"){const D=Math.max(0,a-t),I=Math.floor(D/1e3),E=Math.floor(I/60),T=Math.floor(E/60),p=Math.floor(T/24);return c==="zh"?I<45?"刚刚":E<60?`${E}分钟前`:T<24?`${T}小时前`:p===1?"昨天":p<30?`${p}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):I<45?"just now":E<60?`${E}m ago`:T<24?`${T}h ago`:p===1?"yesterday":p<30?`${p}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function ot(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function qa(t,a=Date.now(),c="zh"){if(!t||t<=0)return"";const D=ot(t);if(!D)return"";const I=Ie(t,a,c);return c==="zh"?`最后活跃时间: ${D} (${I})`:`Last active: ${D} (${I})`}function Fa(t,a=Date.now(),c="zh"){if(!t?.appName)return{statusType:"offline",sentence:c==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const D=t.lastSeen??t.timestamp,I=Math.max(0,a-D),E=Math.floor(I/1e3),T=Ie(D,a,c);let p="active";t.status===R.OFFLINE||t.offline||E>259200?p="offline":t.status===R.AWAY||E>1800?p="away":(t.status===R.IDLE||E>180)&&(p="idle");const z=p==="active"&&E<120,F=t.deviceName||t.name||t.deviceId||t.id||(c==="zh"?"Linux设备":"Device");let n="";if(t.media?.title&&z){const h=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;c==="zh"?n=`正在 ${F} 收听 ${h}`:n=`Listening to ${h} on ${F}`}else c==="zh"?z?n=`正在 ${F} 使用 ${t.appName}`:p==="offline"?n=`最后在使用: ${t.appName}`:n=`${T}在 ${F} 使用 ${t.appName}`:z?n=`Using ${t.appName} on ${F}`:p==="offline"?n=`Last used: ${t.appName}`:n=`${T} used ${t.appName} on ${F}`;return{statusType:p,sentence:n,appName:t.appName,deviceName:F,relativeTime:T}}var Va=M('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ra=M('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),Ba=M('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),it=M('<span class="wid-capsule__at">@</span> <span class="wid-capsule__device"> </span>',1),$a=M('<span class="wid-capsule__prefix">离线</span> <!> <!>',1),Ua=M('<span class="wid-capsule__media-icon">🎵</span> <strong class="wid-capsule__app"> </strong> <!>',1),Ha=M('<strong class="wid-capsule__app"> </strong> <!>',1),Wa=M("<span> </span>"),ja=st('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>'),Ya=st('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>'),Ga=st('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>'),Ka=M('<span class="wid-current-card__device"> </span>'),Ja=M('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> </span></div>'),Xa=M('<span class="wid-current-card__os-info"> </span>'),Za=M('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <!></div> <!> <div class="wid-current-card__footer"><span class="wid-current-card__time"> </span> <!></div></div>'),Qa=M('<div class="wid-panel__empty">正在获取设备状态...</div>'),er=M('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),tr=M('<div class="wid-panel__empty">当前暂无已登记设备</div>'),ar=M('<span class="wid-device-card__abs-time"> </span>'),rr=M('<div class="wid-device-card__app"><span class="wid-device-card__muted-label">最后使用:</span> <span class="wid-device-card__app-title"> </span></div> <div class="wid-device-card__time"> <!></div>',1),ir=M('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span></div> <div class="wid-device-card__time"><!></div>',1),nr=M('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),or=M('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),sr=M('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> <!></span> <span class="wid-timeline__time"> </span></div></div></li>'),lr=M('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),dr=M('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button"><!> <span class="wid-panel__refresh-label"><!></span></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),cr=M('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function pr(t,a){Da(a,!0),At();let c=He(a,"endpoint",3,"/api/activity"),D=He(a,"maxHistoryDisplay",3,5),I=He(a,"refreshInterval",3,0),E=He(a,"class",3,"");const T=K(()=>Array.isArray(c())?c().map(i=>i.trim()).filter(Boolean):typeof c()=="string"?c().split(",").map(i=>i.trim()).filter(Boolean):["/api/activity"]);let p=ee(null),z=ee(!1),F=ee(!1),n=ee(null),h=ee(!1),P=ee(Ea(Date.now())),ae=ee(null),Ee=ee(!1),N=ee("idle"),be=ee(0),r=ee(0),s=null,m=null,x=null;function L(){s&&(clearInterval(s),s=null),m&&(clearTimeout(m),m=null),x&&(clearTimeout(x),x=null)}let B=ee(0),me=ee(0);const k=K(()=>e(p)?.current??null),je=K(()=>e(p)?.devices??[]),lt=K(()=>e(p)?.history??[]),Te=K(()=>!e(p)&&e(z)),Ne=K(()=>!e(p)&&!e(z)&&!!e(n)),re=K(()=>{if(!e(p)||!e(k))return!1;if(e(k).offline||e(k).status===R.OFFLINE)return!0;const i=e(k).lastSeen??e(k).timestamp;return!!(i&&e(P)-i>12e4)}),dt=K(()=>{if(!e(re))return"";const i=e(k)?.lastSeen??e(k)?.timestamp??0;return qa(i,e(P),"zh")}),ue=K(()=>e(k)&&(e(k).deviceName||e(k).name||e(k).deviceId||e(k).id)||""),Be=K(()=>Fa(e(k),e(P),"zh")),Ct=K(()=>{if(e(re))return"离线";switch(e(Be).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),ct={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},pt=K(()=>{const i=e(je).length>0?e(je):e(k)?[e(k)]:[],u={desktop:[],laptop:[],server:[],other:[]};for(const _ of i){const C=(_.type||"desktop").toLowerCase();C==="desktop"?u.desktop.push(_):C==="laptop"?u.laptop.push(_):C==="server"?u.server.push(_):u.other.push(_)}return["desktop","laptop","server","other"].filter(_=>u[_].length>0).map(_=>({key:_,label:ct[_]?.label??_,icon:ct[_]?.icon??"💻",devices:u[_]}))}),ut=K(()=>e(je).filter(i=>!i.offline&&i.status!==R.OFFLINE&&e(P)-(i.lastSeen??i.timestamp)<=12e4).length),Mt=K(()=>e(lt).slice(0,D()));let De=null;async function ze(i=!1){if(e(z)&&!i)return!1;i&&De&&De.abort(),b(z,!0),i&&b(F,!0);const u=new AbortController;De=u;const _=setTimeout(()=>u.abort(),9e3);let C=!1;try{b(n,null);let q=null;for(const X of e(T)){if(u.signal.aborted)break;try{const y=await fetch(X,{signal:u.signal});if(!y.ok){q=new Error(`HTTP ${y.status}`);continue}const $=y.headers.get("content-type")??"";if($.includes("application/x-protobuf")){const U=await y.arrayBuffer();b(p,Pa(new Uint8Array(U)),!0),C=!0;break}else if($.includes("application/json")||$.includes("text/plain")){const U=await y.text();try{const Y=JSON.parse(U);if(Y&&(Y.current!==void 0||Y.devices!==void 0||Y.serverTime!==void 0)){b(p,Y,!0),C=!0;break}}catch{continue}}}catch(y){if(y?.name==="AbortError"){q=y;break}q=y;continue}}C?(b(P,Date.now(),!0),b(be,Date.now(),!0),b(n,null)):q?.name==="AbortError"?b(n,"连接状态服务器超时，请点击重试"):b(n,"无法连接至状态服务器")}catch(q){q?.name==="AbortError"?b(n,"连接状态服务器超时，请点击重试"):b(n,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",q)}finally{clearTimeout(_),De===u&&(De=null),b(z,!1),b(F,!1)}return C}let Ae=null;function ft(){I()>0&&!Ae&&(Ae=setInterval(()=>{document.visibilityState==="visible"&&ze()},I()))}function Lt(){Ae&&(clearInterval(Ae),Ae=null)}function vt(){if(typeof window>"u"||(b(Ee,window.innerWidth<768),!e(ae)))return;const i=e(ae).getBoundingClientRect();b(B,Math.round(i.left+i.width/2),!0),b(B,Math.max(210,Math.min(window.innerWidth-210,e(B))),!0),b(me,Math.round(window.innerHeight-i.top),!0)}function Ot(){b(h,!e(h)),e(h)?(b(P,Date.now(),!0),vt(),!e(p)&&!e(z)&&ze()):(L(),b(N,"idle"))}async function mt(i){if(i?.stopPropagation(),e(N)==="refreshing")return;const u=5e3,_=Date.now()-e(be);if(e(be)>0&&_<u){L(),b(N,"cooldown");const C=()=>{const X=u-(Date.now()-e(be));X<=0?(L(),b(N,"idle")):b(r,Math.max(1,Math.ceil(X/1e3)),!0)};C(),s=setInterval(C,200);const q=Math.min(1800,Math.max(800,u-_));m=setTimeout(()=>{L(),b(N,"idle")},q);return}L(),b(N,"refreshing"),await ze(!0)?(b(N,"done"),x=setTimeout(()=>{b(N,"idle")},700)):b(N,"idle")}function Pt(i){return document.body.appendChild(i),{destroy(){i.parentNode&&i.parentNode.removeChild(i)}}}Aa(()=>{if(!(typeof document>"u")&&e(h)){const i=document.body.style.overflow,u=document.body.style.paddingRight,_=window.innerWidth-document.documentElement.clientWidth;return _>0&&(document.body.style.paddingRight=`${_}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=i,document.body.style.paddingRight=u}}}),Ma(()=>{let i=null;typeof IntersectionObserver<"u"&&e(ae)?(i=new IntersectionObserver(C=>{for(const q of C)if(q.isIntersecting){ze(),ft(),i?.disconnect(),i=null;break}},{rootMargin:"60px"}),i.observe(e(ae))):(ze(),ft());const u=()=>{e(h)&&vt()},_=C=>{C.key==="Escape"&&e(h)&&(b(h,!1),L(),b(N,"idle"))};return window.addEventListener("resize",u),window.addEventListener("keydown",_),()=>{Lt(),L(),i&&i.disconnect(),window.removeEventListener("resize",u),window.removeEventListener("keydown",_)}});var _t=cr(),Ce=ne(_t),Me=l(Ce),wt=l(Me);let ht;var Ye=f(wt,2),qt=l(Ye),Ft=i=>{var u=Va();Nt(2),v(i,u)},Vt=i=>{var u=Ra();Nt(2),v(i,u)},Rt=i=>{var u=$a(),_=f(ne(u),2),C=y=>{var $=Ba(),U=f(ne($),2),Y=l(U,!0);o(U),A(()=>S(Y,e(dt))),v(y,$)};V(_,y=>{e(dt)&&y(C)});var q=f(_,2),X=y=>{var $=it(),U=f(ne($),2),Y=l(U,!0);o(U),A(()=>S(Y,e(ue))),v(y,$)};V(q,y=>{e(ue)&&y(X)}),v(i,u)},Bt=i=>{var u=Ua(),_=f(ne(u),2),C=l(_,!0);o(_);var q=f(_,2),X=y=>{var $=it(),U=f(ne($),2),Y=l(U,!0);o(U),A(()=>S(Y,e(ue))),v(y,$)};V(q,y=>{e(ue)&&y(X)}),A(()=>S(C,e(k).media.title)),v(i,u)},$t=i=>{var u=Ha(),_=ne(u),C=l(_,!0);o(_);var q=f(_,2),X=y=>{var $=it(),U=f(ne($),2),Y=l(U,!0);o(U),A(()=>S(Y,e(ue))),v(y,$)};V(q,y=>{e(ue)&&y(X)}),A(()=>S(C,e(k).appName)),v(i,u)},Ut=i=>{var u=Wa(),_=l(u,!0);o(u),A(()=>S(_,e(Ct))),v(i,u)};V(qt,i=>{e(Te)?i(Ft):e(Ne)?i(Vt,1):e(re)?i(Rt,2):e(k)?.media?.title?i(Bt,3):e(k)?.appName?i($t,4):i(Ut,-1)}),o(Ye);var Ht=f(Ye,2);let gt;o(Me),o(Ce),Ta(Ce,i=>b(ae,i),()=>e(ae));var Wt=f(Ce,2),jt=i=>{var u=dr(),_=l(u),C=f(_,2),q=f(l(C),2),X=f(l(q),2),y=l(X);let $;var U=l(y),Y=d=>{var w=ja();v(d,w)},Yt=d=>{var w=Ya();v(d,w)},Gt=d=>{var w=Ga();let J;A(()=>J=oe(w,0,"wid-panel__refresh-icon",null,J,{"wid-panel__refresh-icon--spin":e(N)==="refreshing"})),v(d,w)};V(U,d=>{e(N)==="done"?d(Y):e(N)==="cooldown"?d(Yt,1):d(Gt,-1)});var bt=f(U,2),Kt=l(bt),Jt=d=>{var w=Q();A(()=>S(w,`请等待 ${e(r)??""} 秒刷新`)),v(d,w)},Xt=d=>{var w=Q("正在刷新...");v(d,w)},Zt=d=>{var w=Q("已同步");v(d,w)};V(Kt,d=>{e(N)==="cooldown"?d(Jt):e(N)==="refreshing"?d(Xt,1):e(N)==="done"&&d(Zt,2)}),o(bt),o(y);var Qt=f(y,2);o(X),o(q);var Ge=f(q,2),yt=l(Ge),ea=d=>{var w=Za();let J;var ce=l(w),H=l(ce);let se;var fe=l(H,!0);o(H);var le=f(H,2),_e=l(le,!0);o(le);var ve=f(le,2),Le=j=>{var W=Ka(),de=l(W);o(W),A(()=>S(de,`@${e(ue)??""}`)),v(j,W)};V(ve,j=>{e(ue)&&j(Le)}),o(ce);var we=f(ce,2),ye=j=>{var W=Ja(),de=f(l(W),2),$e=l(de,!0);o(de),o(W),A(()=>S($e,e(k).mediaTitle)),v(j,W)};V(we,j=>{e(k).mediaTitle&&j(ye)});var he=f(we,2),ie=l(he),g=l(ie);o(ie);var Z=f(ie,2),xe=j=>{var W=Xa(),de=l(W,!0);o(W),A(()=>S(de,e(k).osInfo)),v(j,W)};V(Z,j=>{e(k).osInfo&&j(xe)}),o(he),o(w),A((j,W)=>{J=oe(w,1,"wid-current-card",null,J,{"wid-current-card--offline":e(re)}),se=oe(H,1,"wid-tag",null,se,{"wid-tag--primary":!e(re),"wid-tag--muted":e(re)}),S(fe,e(re)?"最后使用":"当前活跃"),S(_e,e(k).appName||"idle"),S(g,`活跃于 ${j??""} · ${W??""}`)},[()=>Ie(e(k).lastSeen??e(k).timestamp,e(P),"zh"),()=>ot(e(k).lastSeen??e(k).timestamp,"zh")]),v(d,w)};V(yt,d=>{e(k)&&d(ea)});var Ke=f(yt,2),ta=l(Ke),aa=d=>{var w=Qa();v(d,w)},ra=d=>{var w=er(),J=l(w),ce=l(J,!0);o(J);var H=f(J,2);o(w),A(()=>S(ce,e(n))),Fe("click",H,()=>mt()),v(d,w)},ia=d=>{var w=tr();v(d,w)},na=d=>{var w=Sa(),J=ne(w);at(J,17,()=>e(pt),et,(ce,H)=>{var se=or(),fe=l(se),le=l(fe),_e=l(le,!0);o(le);var ve=f(le,2),Le=l(ve,!0);o(ve);var we=f(ve,2),ye=l(we,!0);o(we),o(fe);var he=f(fe,2);at(he,21,()=>e(H).devices,et,(ie,g)=>{const Z=K(()=>e(g).offline||e(g).status===R.OFFLINE||e(P)-(e(g).lastSeen??e(g).timestamp)>12e4);var xe=nr();let j;var W=l(xe),de=l(W),$e=l(de);let St;var It=f($e,2),pa=l(It,!0);o(It),o(de);var Je=f(de,2);let Et;var ua=l(Je),fa=O=>{var G=Q("离线");v(O,G)},va=O=>{var G=Q("正在活跃");v(O,G)},ma=O=>{var G=Q("空闲");v(O,G)},_a=O=>{var G=Q("离开");v(O,G)},wa=O=>{var G=Q("在线");v(O,G)};V(ua,O=>{e(Z)?O(fa):e(g).status===R.ACTIVE?O(va,1):e(g).status===R.IDLE?O(ma,2):e(g).status===R.AWAY?O(_a,3):O(wa,-1)}),o(Je),o(W);var Tt=f(W,2),ha=l(Tt),ga=O=>{var G=rr(),ge=ne(G),Oe=f(l(ge),2),Xe=l(Oe,!0);o(Oe),o(ge);var Pe=f(ge,2),Ue=l(Pe),Ze=f(Ue),Qe=te=>{var pe=ar(),qe=l(pe);o(pe),A(ya=>S(qe,`(${ya??""})`),[()=>ot(e(g).lastSeen??e(g).timestamp)]),v(te,pe)};V(Ze,te=>{(e(g).lastSeen||e(g).timestamp)&&te(Qe)}),o(Pe),A(te=>{S(Xe,e(g).appName||"无记录"),S(Ue,`最后活跃: ${te??""} `)},[()=>Ie(e(g).lastSeen??e(g).timestamp,e(P),"zh")]),v(O,G)},ba=O=>{var G=ir(),ge=ne(G),Oe=l(ge),Xe=l(Oe,!0);o(Oe),o(ge);var Pe=f(ge,2),Ue=l(Pe),Ze=te=>{var pe=Q();A(qe=>S(pe,`已空闲 ${qe??""} 分钟`),[()=>Math.floor(e(g).idleSeconds/60)]),v(te,pe)},Qe=te=>{var pe=Q();A(qe=>S(pe,`活跃于 ${qe??""}`),[()=>Ie(e(g).lastSeen??e(g).timestamp,e(P),"zh")]),v(te,pe)};V(Ue,te=>{e(g).status===R.IDLE&&e(g).idleSeconds&&e(g).idleSeconds>60?te(Ze):te(Qe,-1)}),o(Pe),A(()=>S(Xe,e(g).appName||"活动中")),v(O,G)};V(ha,O=>{e(Z)?O(ga):O(ba,-1)}),o(Tt),o(xe),A(()=>{j=oe(xe,1,"wid-device-card",null,j,{"wid-device-card--offline":e(Z),"wid-device-card--active":!e(Z)&&e(g).status===R.ACTIVE}),St=oe($e,1,"wid-device-card__dot",null,St,{"wid-device-card__dot--active":!e(Z)&&e(g).status===R.ACTIVE,"wid-device-card__dot--idle":!e(Z)&&e(g).status===R.IDLE,"wid-device-card__dot--away":!e(Z)&&e(g).status===R.AWAY,"wid-device-card__dot--offline":e(Z)}),S(pa,e(g).name||e(g).deviceName||e(g).id||e(g).deviceId),Et=oe(Je,1,"wid-device-card__badge",null,Et,{"wid-device-card__badge--active":!e(Z)&&e(g).status===R.ACTIVE,"wid-device-card__badge--idle":!e(Z)&&e(g).status===R.IDLE,"wid-device-card__badge--offline":e(Z)})}),v(ie,xe)}),o(he),o(se),A(()=>{S(_e,e(H).icon),S(Le,e(H).label),S(ye,e(H).devices.length)}),v(ce,se)}),v(d,w)};V(ta,d=>{e(z)&&!e(p)?d(aa):e(n)&&!e(p)?d(ra,1):e(pt).length===0?d(ia,2):d(na,-1)}),o(Ke);var oa=f(Ke,2),sa=d=>{var w=lr(),J=f(l(w),2);at(J,21,()=>e(Mt),et,(ce,H)=>{var se=sr(),fe=f(l(se),2),le=l(fe),_e=l(le),ve=l(_e),Le=f(ve),we=ie=>{var g=Q();A(()=>S(g,`@${(e(H).deviceName||e(H).name)??""}`)),v(ie,g)};V(Le,ie=>{(e(H).deviceName||e(H).name)&&ie(we)}),o(_e);var ye=f(_e,2),he=l(ye,!0);o(ye),o(le),o(fe),o(se),A(ie=>{S(ve,`${e(H).appName??""} `),S(he,ie)},[()=>Ie(e(H).timestamp,e(P),"zh")]),v(ce,se)}),o(J),o(w),v(d,w)};V(oa,d=>{e(lt).length>0&&d(sa)}),o(Ge);var xt=f(Ge,2),kt=f(l(xt),2),la=l(kt),da=d=>{var w=Q();A(()=>S(w,`🟢 ${e(ut)??""} 台在线 · 按需刷新`)),v(d,w)},ca=d=>{var w=Q("⚪ 全设备离线 · 按需刷新");v(d,w)};V(la,d=>{e(ut)>0?d(da):d(ca,-1)}),o(kt),o(xt),o(C),o(u),Na(u,d=>Pt?.(d)),A(()=>{za(C,`--anchor-bottom: ${e(me)}px; --anchor-left: ${e(B)}px;`),$=oe(y,1,"wid-panel__refresh-pill",null,$,{"wid-panel__refresh-pill--expanded":e(N)!=="idle","wid-panel__refresh-pill--cooldown":e(N)==="cooldown","wid-panel__refresh-pill--done":e(N)==="done"}),y.disabled=e(N)==="refreshing",tt(y,"aria-label",e(N)==="cooldown"?`请等待 ${e(r)} 秒后刷新`:e(N)==="refreshing"?"正在刷新状态...":e(N)==="done"?"已同步":"手动刷新状态"),tt(y,"title",e(N)==="cooldown"?`请等待 ${e(r)} 秒后刷新`:"手动刷新")}),Fe("click",_,()=>b(h,!1)),Fe("click",y,mt),Fe("click",Qt,()=>{b(h,!1),L(),b(N,"idle")}),v(i,u)};V(Wt,i=>{e(h)&&i(jt)}),A(()=>{oe(Ce,1,`wid-capsule-wrapper ${E()}`),oe(Me,1,`wid-capsule wid-capsule--${e(Te)?"loading":e(Ne)?"error":e(re)?"offline":e(Be).statusType}`),tt(Me,"aria-expanded",e(h)),ht=oe(wt,1,"wid-capsule__dot",null,ht,{"wid-capsule__dot--pulse":e(Te),"wid-capsule__dot--active":!e(re)&&!e(Te)&&!e(Ne)&&e(Be).statusType==="active","wid-capsule__dot--idle":!e(re)&&!e(Te)&&!e(Ne)&&e(Be).statusType==="idle","wid-capsule__dot--offline":e(re)||e(Ne)}),gt=oe(Ht,0,"wid-capsule__chevron",null,gt,{"wid-capsule__chevron--open":e(h)})}),Fe("click",Me,Ot),v(t,_t),Ca()}ka(["click"]);var Ve=null,Re=null;function ur(t={}){if(typeof window>"u"||typeof document>"u")return;At();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let c=0;const D=25;let I=null;function E(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const n=window.location.pathname.toLowerCase();return a.routeFilter.some(h=>n.startsWith(h.toLowerCase()))}function T(){if(I&&(clearTimeout(I),I=null),!E()){p();return}if(document.querySelector(".wid-mounted-portal"))return;const n=document.querySelector(a.targetSelector);if(!n?.parentElement){c<D&&(c++,I=setTimeout(T,80));return}c=0;const h=document.createElement("div");h.className="wid-mounted-portal",h.style.width="100%",h.style.display="flex",h.style.justifyContent="center",n.insertAdjacentElement(a.position,h);try{Ve=Ia(pr,{target:h,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),Re=h}catch(P){console.error("[what-im-doing] Failed to mount Svelte capsule:",P),h.remove(),Re=null}}function p(){if(I&&(clearTimeout(I),I=null),c=0,Ve){try{xa(Ve)}catch{}Ve=null}Re&&(Re.remove(),Re=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",T):T();const z=window.swup,F=()=>{E()?(!document.querySelector(".wid-mounted-portal")||!Ve)&&(p(),c=0,T()):p()};z?.hooks?z.hooks.on("page:view",F):document.addEventListener("swup:contentReplaced",F)}function We(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,ur(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>We()),window.__WHAT_IM_DOING_CONFIG__?We():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>We()):setTimeout(We,0));function Se(t){return JSON.parse(t,fr)}function fr(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const c=a[0];if(a=a[1],c===":regex:"){const D=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(D[1],D[2]||"")}if(c===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function Dt(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function vr(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function mr(t,{delayAfterLoad:a=0}={}){vr(()=>{a>0?setTimeout(()=>Dt(t),a):Dt(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/api/activity, https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));var zt=(()=>{var t=Object.defineProperty,a=Object.getOwnPropertyDescriptor,c=Object.getOwnPropertyNames,D=Object.prototype.hasOwnProperty,I=(r,s)=>{for(var m in s)t(r,m,{get:s[m],enumerable:!0})},E=(r,s,m,x)=>{if(s&&typeof s=="object"||typeof s=="function")for(let L of c(s))!D.call(r,L)&&L!==m&&t(r,L,{get:()=>s[L],enumerable:!(x=a(s,L))||x.enumerable});return r},T=r=>E(t({},"__esModule",{value:!0}),r),p={};I(p,{initUmamiRuntime:()=>be});var z="x-umami-share-context";async function F(r,s,m=1e4){let x=new AbortController,L=setTimeout(()=>x.abort(),m);try{return await fetch(r,{...s,signal:x.signal})}catch(B){throw B instanceof DOMException&&B.name==="AbortError"?new Error(`[oddmisc] 请求超时 (${m}ms): ${r}`):B}finally{clearTimeout(L)}}function n(r){return typeof r=="number"?r:r&&typeof r.value=="number"?r.value:0}function h(r){let s=new URL(r),m=s.pathname.split("/"),x=m.indexOf("share");if(x===-1||x===m.length-1)throw new Error("无效的分享 URL：未找到 share 路径");let L=m[x+1];if(!L)throw new Error("无效的分享 URL：缺少分享 ID");let B=m.slice(0,x).join("/");return{apiBase:`${s.protocol}//${s.host}${B}/api`,shareId:L}}function P(){return Math.floor(Date.now()/3e5)*3e5}var ae=class{constructor(r,s,m=100){this.storageKey=r,this.ttl=s,this.maxEntries=m,this.cache=new Map,this.loadFromStorage()}loadFromStorage(){try{let r=localStorage.getItem(this.storageKey);if(!r)return;let s=JSON.parse(r);for(let[m,x]of Object.entries(s))x&&typeof x.timestamp=="number"&&!this.isExpired(x.timestamp)&&this.cache.set(m,x)}catch{}}saveToStorage(){try{let r={};this.cache.forEach((s,m)=>{r[m]=s}),localStorage.setItem(this.storageKey,JSON.stringify(r))}catch{}}isExpired(r){return Date.now()-r>=this.ttl}evictIfNeeded(){if(this.cache.size<=this.maxEntries)return;let r=[...this.cache.entries()].sort((m,x)=>m[1].timestamp-x[1].timestamp),s=r.length-this.maxEntries;for(let m=0;m<s;m++)this.cache.delete(r[m][0]);this.saveToStorage()}get(r){let s=this.cache.get(r);return s&&!this.isExpired(s.timestamp)?s.value:(s&&(this.cache.delete(r),this.saveToStorage()),null)}set(r,s){this.cache.set(r,{value:s,timestamp:Date.now()}),this.saveToStorage(),this.evictIfNeeded()}clear(){this.cache.clear();try{localStorage.removeItem(this.storageKey)}catch{}}},Ee=class{constructor(r){if(this.shareData=null,this.sharePromise=null,!r.shareUrl)throw new Error("shareUrl 是必需参数");let{apiBase:s,shareId:m}=h(r.shareUrl);this.apiBase=s,this.shareId=m,this.cache=new ae(`umami-runtime-${m}`,36e5)}async getShareData(){return this.shareData?this.shareData:this.sharePromise?this.sharePromise:(this.sharePromise=(async()=>{let r=await F(`${this.apiBase}/share/${this.shareId}`);if(!r.ok)throw this.shareData=null,this.sharePromise=null,new Error(`获取分享信息失败: ${r.status}`);let s=await r.json();return this.shareData=s,s})(),this.sharePromise)}async authedFetch(r){let{websiteId:s,token:m}=await this.getShareData(),x=await F(`${this.apiBase}/websites/${s}${r}`,{headers:{"x-umami-share-token":m,[z]:"1"}});if(!x.ok)throw x.status===401&&(this.shareData=null,this.sharePromise=null),new Error(`请求 ${r} 失败: ${x.status}`);return await x.json()}async getStats(r){let s=P(),m=`${r?`stats-${r}`:"stats-site"}-${s}`,x=this.cache.get(m);if(x)return{...x,_fromCache:!0};let L=new URLSearchParams({startAt:"0",endAt:s.toString()});r&&L.set("path",`eq.${r}`);let B=await this.authedFetch(`/stats?${L.toString()}`),me={pageviews:n(B.pageviews),visitors:n(B.visitors),visits:n(B.visits)};return B.bounces!==void 0&&(me.bounces=n(B.bounces)),B.totaltime!==void 0&&(me.totaltime=n(B.totaltime)),this.cache.set(m,me),me}getSiteStats(){return this.getStats()}getPageStats(r){return this.getStats(r)}async getActiveVisitors(){let r=await this.authedFetch("/active");return typeof r?.visitors=="number"?r.visitors:0}clearCache(){this.cache.clear(),this.shareData=null,this.sharePromise=null}};function N(){let r=()=>Promise.resolve({pageviews:0,visitors:0,visits:0});window.oddmisc={getStats:r,getSiteStats:r,getPageStats:r,getActiveVisitors:()=>Promise.resolve(0),clearCache:()=>{}}}function be(r){if(!r.shareUrl)console.log("[oddmisc] shareUrl 未配置，跳过初始化"),N();else try{let s=new Ee(r);window.oddmisc={umami:s,getStats:m=>s.getStats(m),getSiteStats:()=>s.getSiteStats(),getPageStats:m=>s.getPageStats(m),getActiveVisitors:()=>s.getActiveVisitors(),clearCache:()=>s.clearCache()},console.log("[oddmisc] Umami runtime client initialized")}catch(s){console.warn("[oddmisc] 初始化失败:",s instanceof Error?s.message:s),N()}window.dispatchEvent(new CustomEvent("oddmisc-ready",{detail:{client:window.oddmisc}}))}return T(p)})();typeof window<"u"&&typeof zt<"u"&&zt.initUmamiRuntime({shareUrl:"https://cloud.umami.is/analytics/eu/share/BywgdGzJ6ra6T7Pb"});async function _r(){const[t,a,c,D,I,E]=await Promise.all([ke(()=>import("./Swup.Cz2sqVT0.js").then(n=>n.default),__vite__mapDeps([0,1])),ke(()=>import("./SwupA11yPlugin.COK5EHWy.js").then(n=>n.default),__vite__mapDeps([2,1,3])),ke(()=>import("./SwupPreloadPlugin.BmKT5rcH.js").then(n=>n.default),__vite__mapDeps([4,1,3])),ke(()=>import("./SwupScrollPlugin.DXF80AYT.js").then(n=>n.default),__vite__mapDeps([5,1,3])),ke(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(n=>n.default),__vite__mapDeps([6,3])),ke(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(n=>n.default),__vite__mapDeps([7,3]))]),T=Se('"a[href=\\"#\\"]"'),p=(n,h,{el:P,event:ae})=>typeof n=="string"&&n.startsWith("/")?h.startsWith(n):typeof n=="string"?P?.matches(n)??!1:n instanceof RegExp?n.test(h):typeof n=="function"?n(h,{el:P,event:ae}):Array.isArray(n)?n.some(Ee=>p(Ee,h,{el:P,event:ae})):!1,z=new t({ignoreVisit:(n,{el:h,event:P}={})=>h?.closest("[data-no-swup]")||p(T,n,{el:h,event:P}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(Se("{}")),new c(Se('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new D(Se("{}")),new I(Se('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new E(Se("{}"))]}),F=n=>document.dispatchEvent(new Event(n));z.hooks.before("content:replace",()=>F("astro:before-swap")),z.hooks.on("content:replace",()=>F("astro:after-swap")),z.hooks.on("page:view",()=>F("astro:page-load")),window.swup=z}mr(_r);
