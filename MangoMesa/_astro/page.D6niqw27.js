const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Swup.Cz2sqVT0.js","_astro/Swup.modern.D7qINR80.js","_astro/SwupA11yPlugin.COK5EHWy.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.BmKT5rcH.js","_astro/SwupScrollPlugin.DXF80AYT.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as Ee}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{$ as x,A as Ta,F as ie,I as Sa,J as o,K as S,L as Ue,M as Ia,N as C,O as Ea,P as ut,S as P,V as e,X as c,Y as ne,Z as Na,a as Da,b as ot,et as ae,f as Ne,g as za,h as de,it as Aa,j as f,k as y,m as Ca,nt as Z,ot as At,q as Ma,rt as La,st as n,t as Ke,w as Oa,y as st}from"./client.CVK8X0vf.js";var Pa=`
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
`;function Ot(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=Pa,document.head.appendChild(t)}var H;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})(H||(H={}));var kr=new TextEncoder,qa=new TextDecoder,ct=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const p=this.buffer[this.pos++];if(t|=BigInt(p&127)<<a,(p&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return qa.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function lt(t){const a=new ct(t),p={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:H.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const z=a.readTag();if(!z)break;switch(z.fieldNo){case 1:p.timestamp=Number(a.readVarint());break;case 2:p.deviceId=a.readString();break;case 3:p.deviceName=a.readString();break;case 4:p.appName=a.readString();break;case 5:p.windowTitle=a.readString();break;case 6:p.status=Number(a.readVarint());break;case 7:p.osInfo=a.readString();break;case 8:p.idleSeconds=Number(a.readVarint());break;case 9:{const I=a.readBytes(),E=new ct(I);let N="",v="";for(;E.hasMore;){const A=E.readTag();if(!A)break;A.fieldNo===1?N=E.readString():A.fieldNo===2?v=E.readString():E.skip(A.wireType)}N&&p.metadata&&(p.metadata[N]=v);break}default:a.skip(z.wireType)}}return p}function Fa(t){const a=new ct(t);let p=null;const z=[],I=[];let E=Date.now();for(;a.hasMore;){const N=a.readTag();if(!N)break;switch(N.fieldNo){case 1:p=lt(a.readBytes());break;case 2:{const v=a.readBytes();z.push(lt(v));break}case 3:{const v=a.readBytes();I.push(lt(v));break}case 4:E=Number(a.readVarint());break;default:a.skip(N.wireType)}}return{current:p,devices:z,history:I,serverTime:E}}function je(t,a=Date.now(),p="zh"){const z=Math.max(0,a-t),I=Math.floor(z/1e3),E=Math.floor(I/60),N=Math.floor(E/60),v=Math.floor(N/24);return p==="zh"?I<45?"刚刚":E<60?`${E}分钟前`:N<24?`${N}小时前`:v===1?"昨天":v<30?`${v}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):I<45?"just now":E<60?`${E}m ago`:N<24?`${N}h ago`:v===1?"yesterday":v<30?`${v}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function pt(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Va(t,a=Date.now(),p="zh"){if(!t||t<=0)return"";const z=pt(t);if(!z)return"";const I=je(t,a,p);return p==="zh"?`最后活跃时间: ${z} (${I})`:`Last active: ${z} (${I})`}function Ra(t,a=Date.now(),p="zh"){if(!t?.appName)return{statusType:"offline",sentence:p==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const z=t.lastSeen??t.timestamp,I=Math.max(0,a-z),E=Math.floor(I/1e3),N=je(z,a,p);let v="active";t.status===H.OFFLINE||t.offline||E>259200?v="offline":t.status===H.AWAY||E>1800?v="away":(t.status===H.IDLE||E>180)&&(v="idle");const A=v==="active"&&E<120,R=t.deviceName||t.name||t.deviceId||t.id||(p==="zh"?"Linux设备":"Device");let s="";if(t.media?.title&&A){const g=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;p==="zh"?s=`正在 ${R} 收听 ${g}`:s=`Listening to ${g} on ${R}`}else p==="zh"?A?s=`正在 ${R} 使用 ${t.appName}`:v==="offline"?s=`最后在使用: ${t.appName}`:s=`${N}在 ${R} 使用 ${t.appName}`:A?s=`Using ${t.appName} on ${R}`:v==="offline"?s=`Last used: ${t.appName}`:s=`${N} used ${t.appName} on ${R}`;return{statusType:v,sentence:s,appName:t.appName,deviceName:R,relativeTime:N}}var Ba=C('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),$a=C('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),dt=C('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),Ua=C('<span class="wid-capsule__prefix">最后使用:</span> <strong class="wid-capsule__app"> </strong> <!>',1),Ha=C('<span class="wid-capsule__media-icon">🎵</span> <strong class="wid-capsule__app"> </strong> <!>',1),Wa=C('<strong class="wid-capsule__app"> </strong> <!>',1),ja=C("<span> </span>"),Ya=ut('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>'),Ga=ut('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>'),Ka=ut('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>'),Ja=C('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> </span></div>'),Xa=C('<div class="wid-current-card__window-title"> </div>'),Za=C('<span class="wid-current-card__active-hint"> </span>'),Qa=C('<span class="wid-current-card__os-info"> </span>'),er=C('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <span class="wid-current-card__device"> </span></div> <!> <!> <div class="wid-current-card__footer"><span class="wid-current-card__time"> </span> <!> <!></div></div>'),tr=C('<div class="wid-panel__empty">正在获取设备状态...</div>'),ar=C('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),rr=C('<div class="wid-panel__empty">当前暂无已登记设备</div>'),Ct=C('<span class="wid-device-card__sep">·</span> <span class="wid-device-card__win-title"> </span>',1),ir=C('<span class="wid-device-card__abs-time"> </span>'),nr=C('<div class="wid-device-card__app"><span class="wid-device-card__muted-label">最后使用:</span> <span class="wid-device-card__app-title"> </span> <!></div> <div class="wid-device-card__time"> <!></div>',1),or=C('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span> <!></div> <div class="wid-device-card__time"><!></div>',1),sr=C('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),lr=C('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),dr=C('<div class="wid-timeline__title"> </div>'),cr=C('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> </span> <span class="wid-timeline__time"> </span></div> <!> <div class="wid-timeline__device"> </div></div></li>'),pr=C('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),ur=C('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button"><!> <span class="wid-panel__refresh-label"><!></span></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),fr=C('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function vr(t,a){Aa(a,!0),Ot();let p=Ke(a,"endpoint",3,"/api/activity"),z=Ke(a,"maxHistoryDisplay",3,5),I=Ke(a,"refreshInterval",3,0),E=Ke(a,"class",3,"");const N=Z(()=>Array.isArray(p())?p().map(i=>i.trim()).filter(Boolean):typeof p()=="string"?p().split(",").map(i=>i.trim()).filter(Boolean):["/api/activity"]);let v=ae(null),A=ae(!1),R=ae(!1),s=ae(null),g=ae(!1),B=ae(Na(Date.now())),oe=ae(null),ze=ae(!1),D=ae("idle"),ye=ae(0),r=ae(0),l=null,m=null,k=null;function L(){l&&(clearInterval(l),l=null),m&&(clearTimeout(m),m=null),k&&(clearTimeout(k),k=null)}let W=ae(0),_e=ae(0);const b=Z(()=>e(v)?.current??null),Xe=Z(()=>e(v)?.devices??[]),ft=Z(()=>e(v)?.history??[]),Ae=Z(()=>!e(v)&&e(A)),Ce=Z(()=>!e(v)&&!e(A)&&!!e(s)),re=Z(()=>{if(!e(v)||!e(b))return!1;if(e(b).offline||e(b).status===H.OFFLINE)return!0;const i=e(b).lastSeen??e(b).timestamp;return!!(i&&e(B)-i>12e4)}),vt=Z(()=>{if(!e(re))return"";const i=e(b)?.lastSeen??e(b)?.timestamp??0;return Va(i,e(B),"zh")}),ke=Z(()=>Ra(e(b),e(B),"zh")),Pt=Z(()=>{if(e(re))return"离线";switch(e(ke).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),_t={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},mt=Z(()=>{const i=e(Xe).length>0?e(Xe):e(b)?[e(b)]:[],_={desktop:[],laptop:[],server:[],other:[]};for(const w of i){const M=(w.type||"desktop").toLowerCase();M==="desktop"?_.desktop.push(w):M==="laptop"?_.laptop.push(w):M==="server"?_.server.push(w):_.other.push(w)}return["desktop","laptop","server","other"].filter(w=>_[w].length>0).map(w=>({key:w,label:_t[w]?.label??w,icon:_t[w]?.icon??"💻",devices:_[w]}))}),wt=Z(()=>e(Xe).filter(i=>!i.offline&&i.status!==H.OFFLINE&&e(B)-(i.lastSeen??i.timestamp)<=12e4).length),qt=Z(()=>e(ft).slice(0,z()));let Me=null;async function Le(i=!1){if(e(A)&&!i)return!1;i&&Me&&Me.abort(),x(A,!0),i&&x(R,!0);const _=new AbortController;Me=_;const w=setTimeout(()=>_.abort(),9e3);let M=!1;try{x(s,null);let q=null;for(const Q of e(N)){if(_.signal.aborted)break;try{const T=await fetch(Q,{signal:_.signal});if(!T.ok){q=new Error(`HTTP ${T.status}`);continue}const Y=T.headers.get("content-type")??"";if(Y.includes("application/x-protobuf")){const G=await T.arrayBuffer();x(v,Fa(new Uint8Array(G)),!0),M=!0;break}else if(Y.includes("application/json")||Y.includes("text/plain")){const G=await T.text();try{const ee=JSON.parse(G);if(ee&&(ee.current!==void 0||ee.devices!==void 0||ee.serverTime!==void 0)){x(v,ee,!0),M=!0;break}}catch{continue}}}catch(T){if(T?.name==="AbortError"){q=T;break}q=T;continue}}M?(x(B,Date.now(),!0),x(ye,Date.now(),!0),x(s,null)):q?.name==="AbortError"?x(s,"连接状态服务器超时，请点击重试"):x(s,"无法连接至状态服务器")}catch(q){q?.name==="AbortError"?x(s,"连接状态服务器超时，请点击重试"):x(s,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",q)}finally{clearTimeout(w),Me===_&&(Me=null),x(A,!1),x(R,!1)}return M}let Oe=null;function ht(){I()>0&&!Oe&&(Oe=setInterval(()=>{document.visibilityState==="visible"&&Le()},I()))}function Ft(){Oe&&(clearInterval(Oe),Oe=null)}function gt(){if(typeof window>"u"||(x(ze,window.innerWidth<768),!e(oe)))return;const i=e(oe).getBoundingClientRect();x(W,Math.round(i.left+i.width/2),!0),x(W,Math.max(210,Math.min(window.innerWidth-210,e(W))),!0),x(_e,Math.round(window.innerHeight-i.top),!0)}function Vt(){x(g,!e(g)),e(g)?(x(B,Date.now(),!0),gt(),!e(v)&&!e(A)&&Le()):(L(),x(D,"idle"))}async function bt(i){if(i?.stopPropagation(),e(D)==="refreshing")return;const _=5e3,w=Date.now()-e(ye);if(e(ye)>0&&w<_){L(),x(D,"cooldown");const M=()=>{const Q=_-(Date.now()-e(ye));Q<=0?(L(),x(D,"idle")):x(r,Math.max(1,Math.ceil(Q/1e3)),!0)};M(),l=setInterval(M,200);const q=Math.min(1800,Math.max(800,_-w));m=setTimeout(()=>{L(),x(D,"idle")},q);return}L(),x(D,"refreshing"),await Le(!0)?(x(D,"done"),k=setTimeout(()=>{x(D,"idle")},700)):x(D,"idle")}function Rt(i){return document.body.appendChild(i),{destroy(){i.parentNode&&i.parentNode.removeChild(i)}}}Ma(()=>{if(!(typeof document>"u")&&e(g)){const i=document.body.style.overflow,_=document.body.style.paddingRight,w=window.innerWidth-document.documentElement.clientWidth;return w>0&&(document.body.style.paddingRight=`${w}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=i,document.body.style.paddingRight=_}}}),Oa(()=>{let i=null;typeof IntersectionObserver<"u"&&e(oe)?(i=new IntersectionObserver(M=>{for(const q of M)if(q.isIntersecting){Le(),ht(),i?.disconnect(),i=null;break}},{rootMargin:"60px"}),i.observe(e(oe))):(Le(),ht());const _=()=>{e(g)&&gt()},w=M=>{M.key==="Escape"&&e(g)&&(x(g,!1),L(),x(D,"idle"))};return window.addEventListener("resize",_),window.addEventListener("keydown",w),()=>{Ft(),L(),i&&i.disconnect(),window.removeEventListener("resize",_),window.removeEventListener("keydown",w)}});var xt=fr(),Pe=ne(xt),qe=o(Pe),yt=o(qe);let kt;var Ze=c(yt,2),Bt=o(Ze),$t=i=>{var _=Ba();At(2),f(i,_)},Ut=i=>{var _=$a();At(2),f(i,_)},Ht=i=>{var _=Ua(),w=c(ne(_),2),M=o(w,!0);n(w);var q=c(w,2),Q=T=>{var Y=dt(),G=c(ne(Y),2),ee=o(G,!0);n(G),S(()=>y(ee,e(vt))),f(T,Y)};P(q,T=>{e(vt)&&T(Q)}),S(()=>y(M,e(b)?.appName||"离线")),f(i,_)},Wt=i=>{var _=Ha(),w=c(ne(_),2),M=o(w,!0);n(w);var q=c(w,2),Q=T=>{var Y=dt(),G=c(ne(Y),2),ee=o(G,!0);n(G),S(()=>y(ee,e(b).media.artist)),f(T,Y)};P(q,T=>{e(b).media.artist&&T(Q)}),S(()=>y(M,e(b).media.title)),f(i,_)},jt=i=>{var _=Wa(),w=ne(_),M=o(w,!0);n(w);var q=c(w,2),Q=T=>{var Y=dt(),G=c(ne(Y),2),ee=o(G,!0);n(G),S(()=>y(ee,e(b).windowTitle)),f(T,Y)};P(q,T=>{e(b).windowTitle&&e(b).windowTitle!==e(b).appName&&T(Q)}),S(()=>y(M,e(b).appName)),f(i,_)},Yt=i=>{var _=ja(),w=o(_,!0);n(_),S(()=>y(w,e(Pt))),f(i,_)};P(Bt,i=>{e(Ae)?i($t):e(Ce)?i(Ut,1):e(re)?i(Ht,2):e(b)?.media?.title?i(Wt,3):e(b)?.appName?i(jt,4):i(Yt,-1)}),n(Ze);var Gt=c(Ze,2);let Tt;n(qe),n(Pe),Da(Pe,i=>x(oe,i),()=>e(oe));var Kt=c(Pe,2),Jt=i=>{var _=ur(),w=o(_),M=c(w,2),q=c(o(M),2),Q=c(o(q),2),T=o(Q);let Y;var G=o(T),ee=d=>{var h=Ya();f(d,h)},Xt=d=>{var h=Ga();f(d,h)},Zt=d=>{var h=Ka();let X;S(()=>X=de(h,0,"wid-panel__refresh-icon",null,X,{"wid-panel__refresh-icon--spin":e(D)==="refreshing"})),f(d,h)};P(G,d=>{e(D)==="done"?d(ee):e(D)==="cooldown"?d(Xt,1):d(Zt,-1)});var St=c(G,2),Qt=o(St),ea=d=>{var h=ie();S(()=>y(h,`请等待 ${e(r)??""} 秒刷新`)),f(d,h)},ta=d=>{var h=ie("正在刷新...");f(d,h)},aa=d=>{var h=ie("已同步");f(d,h)};P(Qt,d=>{e(D)==="cooldown"?d(ea):e(D)==="refreshing"?d(ta,1):e(D)==="done"&&d(aa,2)}),n(St),n(T);var ra=c(T,2);n(Q),n(q);var Qe=c(q,2),It=o(Qe),ia=d=>{var h=er();let X;var ue=o(h),F=o(ue);let ce;var fe=o(F,!0);n(F);var se=c(F,2),me=o(se,!0);n(se);var ve=c(se,2),Te=o(ve);n(ve),n(ue);var we=c(ue,2),Se=$=>{var j=Ja(),pe=c(o(j),2),Re=o(pe,!0);n(pe),n(j),S(()=>y(Re,e(b).mediaTitle)),f($,j)};P(we,$=>{e(b).mediaTitle&&$(Se)});var he=c(we,2),Ie=$=>{var j=Xa(),pe=o(j,!0);n(j),S(()=>y(pe,e(b).windowTitle)),f($,j)};P(he,$=>{e(b).windowTitle&&$(Ie)});var u=c(he,2),V=o(u),le=o(V);n(V);var ge=c(V,2),Fe=$=>{var j=Za(),pe=o(j);n(j),S(()=>y(pe,`🟢 活跃于 ${(e(b).deviceName||e(b).name||e(b).deviceId)??""}`)),f($,j)};P(ge,$=>{e(re)||$(Fe)});var Ve=c(ge,2),Ye=$=>{var j=Qa(),pe=o(j,!0);n(j),S(()=>y(pe,e(b).osInfo)),f($,j)};P(Ve,$=>{e(b).osInfo&&$(Ye)}),n(u),n(h),S($=>{X=de(h,1,"wid-current-card",null,X,{"wid-current-card--offline":e(re)}),ce=de(F,1,"wid-tag",null,ce,{"wid-tag--primary":!e(re),"wid-tag--muted":e(re)}),y(fe,e(re)?"最后使用":"当前活跃"),y(me,e(b).appName||"未知应用"),y(Te,`@${(e(b).deviceName||e(b).name||e(b).deviceId)??""}`),y(le,`${e(ke).prefix??""}${e(ke).action??""} · ${$??""}`)},[()=>pt(e(b).timestamp,"zh")]),f(d,h)};P(It,d=>{e(b)&&d(ia)});var et=c(It,2),na=o(et),oa=d=>{var h=tr();f(d,h)},sa=d=>{var h=ar(),X=o(h),ue=o(X,!0);n(X);var F=c(X,2);n(h),S(()=>y(ue,e(s))),Ue("click",F,()=>bt()),f(d,h)},la=d=>{var h=rr();f(d,h)},da=d=>{var h=Ia(),X=ne(h);st(X,17,()=>e(mt),ot,(ue,F)=>{var ce=lr(),fe=o(ce),se=o(fe),me=o(se,!0);n(se);var ve=c(se,2),Te=o(ve,!0);n(ve);var we=c(ve,2),Se=o(we,!0);n(we),n(fe);var he=c(fe,2);st(he,21,()=>e(F).devices,ot,(Ie,u)=>{const V=Z(()=>e(u).offline||e(u).status===H.OFFLINE||e(B)-(e(u).lastSeen??e(u).timestamp)>12e4);var le=sr();let ge;var Fe=o(le),Ve=o(Fe),Ye=o(Ve);let $;var j=c(Ye,2),pe=o(j,!0);n(j),n(Ve);var Re=c(Ve,2);let Dt;var _a=o(Re),ma=O=>{var K=ie("离线");f(O,K)},wa=O=>{var K=ie("正在活跃");f(O,K)},ha=O=>{var K=ie("空闲");f(O,K)},ga=O=>{var K=ie("离开");f(O,K)},ba=O=>{var K=ie("在线");f(O,K)};P(_a,O=>{e(V)?O(ma):e(u).status===H.ACTIVE?O(wa,1):e(u).status===H.IDLE?O(ha,2):e(u).status===H.AWAY?O(ga,3):O(ba,-1)}),n(Re),n(Fe);var zt=c(Fe,2),xa=o(zt),ya=O=>{var K=nr(),be=ne(K),xe=c(o(be),2),tt=o(xe,!0);n(xe);var at=c(xe,2),rt=U=>{var J=Ct(),te=c(ne(J),2),$e=o(te,!0);n(te),S(()=>{Ne(te,"title",e(u).windowTitle),y($e,e(u).windowTitle)}),f(U,J)};P(at,U=>{e(u).windowTitle&&e(u).windowTitle!==e(u).appName&&U(rt)}),n(be);var Be=c(be,2),Ge=o(Be),it=c(Ge),nt=U=>{var J=ir(),te=o(J);n(J),S($e=>y(te,`(${$e??""})`),[()=>pt(e(u).lastSeen??e(u).timestamp)]),f(U,J)};P(it,U=>{(e(u).lastSeen||e(u).timestamp)&&U(nt)}),n(Be),S(U=>{y(tt,e(u).appName||"无记录"),y(Ge,`最后活跃: ${U??""} `)},[()=>je(e(u).lastSeen??e(u).timestamp,e(B),"zh")]),f(O,K)},ka=O=>{var K=or(),be=ne(K),xe=o(be),tt=o(xe,!0);n(xe);var at=c(xe,2),rt=U=>{var J=Ct(),te=c(ne(J),2),$e=o(te,!0);n(te),S(()=>{Ne(te,"title",e(u).windowTitle),y($e,e(u).windowTitle)}),f(U,J)};P(at,U=>{e(u).windowTitle&&e(u).windowTitle!==e(u).appName&&U(rt)}),n(be);var Be=c(be,2),Ge=o(Be),it=U=>{var J=ie();S(te=>y(J,`已空闲 ${te??""} 分钟`),[()=>Math.floor(e(u).idleSeconds/60)]),f(U,J)},nt=U=>{var J=ie();S(te=>y(J,`活跃于 ${te??""}`),[()=>je(e(u).lastSeen??e(u).timestamp,e(B),"zh")]),f(U,J)};P(Ge,U=>{e(u).status===H.IDLE&&e(u).idleSeconds&&e(u).idleSeconds>60?U(it):U(nt,-1)}),n(Be),S(()=>y(tt,e(u).appName||"活动中")),f(O,K)};P(xa,O=>{e(V)?O(ya):O(ka,-1)}),n(zt),n(le),S(()=>{ge=de(le,1,"wid-device-card",null,ge,{"wid-device-card--offline":e(V),"wid-device-card--active":!e(V)&&e(u).status===H.ACTIVE}),$=de(Ye,1,"wid-device-card__dot",null,$,{"wid-device-card__dot--active":!e(V)&&e(u).status===H.ACTIVE,"wid-device-card__dot--idle":!e(V)&&e(u).status===H.IDLE,"wid-device-card__dot--away":!e(V)&&e(u).status===H.AWAY,"wid-device-card__dot--offline":e(V)}),y(pe,e(u).name||e(u).deviceName||e(u).id||e(u).deviceId),Dt=de(Re,1,"wid-device-card__badge",null,Dt,{"wid-device-card__badge--active":!e(V)&&e(u).status===H.ACTIVE,"wid-device-card__badge--idle":!e(V)&&e(u).status===H.IDLE,"wid-device-card__badge--offline":e(V)})}),f(Ie,le)}),n(he),n(ce),S(()=>{y(me,e(F).icon),y(Te,e(F).label),y(Se,e(F).devices.length)}),f(ue,ce)}),f(d,h)};P(na,d=>{e(A)&&!e(v)?d(oa):e(s)&&!e(v)?d(sa,1):e(mt).length===0?d(la,2):d(da,-1)}),n(et);var ca=c(et,2),pa=d=>{var h=pr(),X=c(o(h),2);st(X,21,()=>e(qt),ot,(ue,F)=>{var ce=cr(),fe=c(o(ce),2),se=o(fe),me=o(se),ve=o(me,!0);n(me);var Te=c(me,2),we=o(Te,!0);n(Te),n(se);var Se=c(se,2),he=V=>{var le=dr(),ge=o(le,!0);n(le),S(()=>{Ne(le,"title",e(F).windowTitle),y(ge,e(F).windowTitle)}),f(V,le)};P(Se,V=>{e(F).windowTitle&&e(F).windowTitle!==e(F).appName&&V(he)});var Ie=c(Se,2),u=o(Ie,!0);n(Ie),n(fe),n(ce),S(V=>{y(ve,e(F).appName),y(we,V),y(u,e(F).deviceName||e(F).name)},[()=>je(e(F).timestamp,e(B),"zh")]),f(ue,ce)}),n(X),n(h),f(d,h)};P(ca,d=>{e(ft).length>0&&d(pa)}),n(Qe);var Et=c(Qe,2),Nt=c(o(Et),2),ua=o(Nt),fa=d=>{var h=ie();S(()=>y(h,`🟢 ${e(wt)??""} 台在线 · 按需刷新`)),f(d,h)},va=d=>{var h=ie("⚪ 全设备离线 · 按需刷新");f(d,h)};P(ua,d=>{e(wt)>0?d(fa):d(va,-1)}),n(Nt),n(Et),n(M),n(_),za(_,d=>Rt?.(d)),S(()=>{Ca(M,`--anchor-bottom: ${e(_e)}px; --anchor-left: ${e(W)}px;`),Y=de(T,1,"wid-panel__refresh-pill",null,Y,{"wid-panel__refresh-pill--expanded":e(D)!=="idle","wid-panel__refresh-pill--cooldown":e(D)==="cooldown","wid-panel__refresh-pill--done":e(D)==="done"}),T.disabled=e(D)==="refreshing",Ne(T,"aria-label",e(D)==="cooldown"?`请等待 ${e(r)} 秒后刷新`:e(D)==="refreshing"?"正在刷新状态...":e(D)==="done"?"已同步":"手动刷新状态"),Ne(T,"title",e(D)==="cooldown"?`请等待 ${e(r)} 秒后刷新`:"手动刷新")}),Ue("click",w,()=>x(g,!1)),Ue("click",T,bt),Ue("click",ra,()=>{x(g,!1),L(),x(D,"idle")}),f(i,_)};P(Kt,i=>{e(g)&&i(Jt)}),S(()=>{de(Pe,1,`wid-capsule-wrapper ${E()}`),de(qe,1,`wid-capsule wid-capsule--${e(Ae)?"loading":e(Ce)?"error":e(re)?"offline":e(ke).statusType}`),Ne(qe,"aria-expanded",e(g)),kt=de(yt,1,"wid-capsule__dot",null,kt,{"wid-capsule__dot--pulse":e(Ae),"wid-capsule__dot--active":!e(re)&&!e(Ae)&&!e(Ce)&&e(ke).statusType==="active","wid-capsule__dot--idle":!e(re)&&!e(Ae)&&!e(Ce)&&e(ke).statusType==="idle","wid-capsule__dot--offline":e(re)||e(Ce)}),Tt=de(Gt,0,"wid-capsule__chevron",null,Tt,{"wid-capsule__chevron--open":e(g)})}),Ue("click",qe,Vt),f(t,xt),La()}Sa(["click"]);var He=null,We=null;function _r(t={}){if(typeof window>"u"||typeof document>"u")return;Ot();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let p=0;const z=25;let I=null;function E(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const s=window.location.pathname.toLowerCase();return a.routeFilter.some(g=>s.startsWith(g.toLowerCase()))}function N(){if(I&&(clearTimeout(I),I=null),!E()){v();return}if(document.querySelector(".wid-mounted-portal"))return;const s=document.querySelector(a.targetSelector);if(!s?.parentElement){p<z&&(p++,I=setTimeout(N,80));return}p=0;const g=document.createElement("div");g.className="wid-mounted-portal",g.style.width="100%",g.style.display="flex",g.style.justifyContent="center",s.insertAdjacentElement(a.position,g);try{He=Ea(vr,{target:g,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),We=g}catch(B){console.error("[what-im-doing] Failed to mount Svelte capsule:",B),g.remove(),We=null}}function v(){if(I&&(clearTimeout(I),I=null),p=0,He){try{Ta(He)}catch{}He=null}We&&(We.remove(),We=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",N):N();const A=window.swup,R=()=>{E()?(!document.querySelector(".wid-mounted-portal")||!He)&&(v(),p=0,N()):v()};A?.hooks?A.hooks.on("page:view",R):document.addEventListener("swup:contentReplaced",R)}function Je(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,_r(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>Je()),window.__WHAT_IM_DOING_CONFIG__?Je():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>Je()):setTimeout(Je,0));function De(t){return JSON.parse(t,mr)}function mr(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const p=a[0];if(a=a[1],p===":regex:"){const z=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(z[1],z[2]||"")}if(p===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function Mt(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function wr(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function hr(t,{delayAfterLoad:a=0}={}){wr(()=>{a>0?setTimeout(()=>Mt(t),a):Mt(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/api/activity, https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));var Lt=(()=>{var t=Object.defineProperty,a=Object.getOwnPropertyDescriptor,p=Object.getOwnPropertyNames,z=Object.prototype.hasOwnProperty,I=(r,l)=>{for(var m in l)t(r,m,{get:l[m],enumerable:!0})},E=(r,l,m,k)=>{if(l&&typeof l=="object"||typeof l=="function")for(let L of p(l))!z.call(r,L)&&L!==m&&t(r,L,{get:()=>l[L],enumerable:!(k=a(l,L))||k.enumerable});return r},N=r=>E(t({},"__esModule",{value:!0}),r),v={};I(v,{initUmamiRuntime:()=>ye});var A="x-umami-share-context";async function R(r,l,m=1e4){let k=new AbortController,L=setTimeout(()=>k.abort(),m);try{return await fetch(r,{...l,signal:k.signal})}catch(W){throw W instanceof DOMException&&W.name==="AbortError"?new Error(`[oddmisc] 请求超时 (${m}ms): ${r}`):W}finally{clearTimeout(L)}}function s(r){return typeof r=="number"?r:r&&typeof r.value=="number"?r.value:0}function g(r){let l=new URL(r),m=l.pathname.split("/"),k=m.indexOf("share");if(k===-1||k===m.length-1)throw new Error("无效的分享 URL：未找到 share 路径");let L=m[k+1];if(!L)throw new Error("无效的分享 URL：缺少分享 ID");let W=m.slice(0,k).join("/");return{apiBase:`${l.protocol}//${l.host}${W}/api`,shareId:L}}function B(){return Math.floor(Date.now()/3e5)*3e5}var oe=class{constructor(r,l,m=100){this.storageKey=r,this.ttl=l,this.maxEntries=m,this.cache=new Map,this.loadFromStorage()}loadFromStorage(){try{let r=localStorage.getItem(this.storageKey);if(!r)return;let l=JSON.parse(r);for(let[m,k]of Object.entries(l))k&&typeof k.timestamp=="number"&&!this.isExpired(k.timestamp)&&this.cache.set(m,k)}catch{}}saveToStorage(){try{let r={};this.cache.forEach((l,m)=>{r[m]=l}),localStorage.setItem(this.storageKey,JSON.stringify(r))}catch{}}isExpired(r){return Date.now()-r>=this.ttl}evictIfNeeded(){if(this.cache.size<=this.maxEntries)return;let r=[...this.cache.entries()].sort((m,k)=>m[1].timestamp-k[1].timestamp),l=r.length-this.maxEntries;for(let m=0;m<l;m++)this.cache.delete(r[m][0]);this.saveToStorage()}get(r){let l=this.cache.get(r);return l&&!this.isExpired(l.timestamp)?l.value:(l&&(this.cache.delete(r),this.saveToStorage()),null)}set(r,l){this.cache.set(r,{value:l,timestamp:Date.now()}),this.saveToStorage(),this.evictIfNeeded()}clear(){this.cache.clear();try{localStorage.removeItem(this.storageKey)}catch{}}},ze=class{constructor(r){if(this.shareData=null,this.sharePromise=null,!r.shareUrl)throw new Error("shareUrl 是必需参数");let{apiBase:l,shareId:m}=g(r.shareUrl);this.apiBase=l,this.shareId=m,this.cache=new oe(`umami-runtime-${m}`,36e5)}async getShareData(){return this.shareData?this.shareData:this.sharePromise?this.sharePromise:(this.sharePromise=(async()=>{let r=await R(`${this.apiBase}/share/${this.shareId}`);if(!r.ok)throw this.shareData=null,this.sharePromise=null,new Error(`获取分享信息失败: ${r.status}`);let l=await r.json();return this.shareData=l,l})(),this.sharePromise)}async authedFetch(r){let{websiteId:l,token:m}=await this.getShareData(),k=await R(`${this.apiBase}/websites/${l}${r}`,{headers:{"x-umami-share-token":m,[A]:"1"}});if(!k.ok)throw k.status===401&&(this.shareData=null,this.sharePromise=null),new Error(`请求 ${r} 失败: ${k.status}`);return await k.json()}async getStats(r){let l=B(),m=`${r?`stats-${r}`:"stats-site"}-${l}`,k=this.cache.get(m);if(k)return{...k,_fromCache:!0};let L=new URLSearchParams({startAt:"0",endAt:l.toString()});r&&L.set("path",`eq.${r}`);let W=await this.authedFetch(`/stats?${L.toString()}`),_e={pageviews:s(W.pageviews),visitors:s(W.visitors),visits:s(W.visits)};return W.bounces!==void 0&&(_e.bounces=s(W.bounces)),W.totaltime!==void 0&&(_e.totaltime=s(W.totaltime)),this.cache.set(m,_e),_e}getSiteStats(){return this.getStats()}getPageStats(r){return this.getStats(r)}async getActiveVisitors(){let r=await this.authedFetch("/active");return typeof r?.visitors=="number"?r.visitors:0}clearCache(){this.cache.clear(),this.shareData=null,this.sharePromise=null}};function D(){let r=()=>Promise.resolve({pageviews:0,visitors:0,visits:0});window.oddmisc={getStats:r,getSiteStats:r,getPageStats:r,getActiveVisitors:()=>Promise.resolve(0),clearCache:()=>{}}}function ye(r){if(!r.shareUrl)console.log("[oddmisc] shareUrl 未配置，跳过初始化"),D();else try{let l=new ze(r);window.oddmisc={umami:l,getStats:m=>l.getStats(m),getSiteStats:()=>l.getSiteStats(),getPageStats:m=>l.getPageStats(m),getActiveVisitors:()=>l.getActiveVisitors(),clearCache:()=>l.clearCache()},console.log("[oddmisc] Umami runtime client initialized")}catch(l){console.warn("[oddmisc] 初始化失败:",l instanceof Error?l.message:l),D()}window.dispatchEvent(new CustomEvent("oddmisc-ready",{detail:{client:window.oddmisc}}))}return N(v)})();typeof window<"u"&&typeof Lt<"u"&&Lt.initUmamiRuntime({shareUrl:"https://cloud.umami.is/analytics/eu/share/BywgdGzJ6ra6T7Pb"});async function gr(){const[t,a,p,z,I,E]=await Promise.all([Ee(()=>import("./Swup.Cz2sqVT0.js").then(s=>s.default),__vite__mapDeps([0,1])),Ee(()=>import("./SwupA11yPlugin.COK5EHWy.js").then(s=>s.default),__vite__mapDeps([2,1,3])),Ee(()=>import("./SwupPreloadPlugin.BmKT5rcH.js").then(s=>s.default),__vite__mapDeps([4,1,3])),Ee(()=>import("./SwupScrollPlugin.DXF80AYT.js").then(s=>s.default),__vite__mapDeps([5,1,3])),Ee(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(s=>s.default),__vite__mapDeps([6,3])),Ee(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(s=>s.default),__vite__mapDeps([7,3]))]),N=De('"a[href=\\"#\\"]"'),v=(s,g,{el:B,event:oe})=>typeof s=="string"&&s.startsWith("/")?g.startsWith(s):typeof s=="string"?B?.matches(s)??!1:s instanceof RegExp?s.test(g):typeof s=="function"?s(g,{el:B,event:oe}):Array.isArray(s)?s.some(ze=>v(ze,g,{el:B,event:oe})):!1,A=new t({ignoreVisit:(s,{el:g,event:B}={})=>g?.closest("[data-no-swup]")||v(N,s,{el:g,event:B}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(De("{}")),new p(De('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new z(De("{}")),new I(De('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new E(De("{}"))]}),R=s=>document.dispatchEvent(new Event(s));A.hooks.before("content:replace",()=>R("astro:before-swap")),A.hooks.on("content:replace",()=>R("astro:after-swap")),A.hooks.on("page:view",()=>R("astro:page-load")),window.swup=A}hr(gr);
