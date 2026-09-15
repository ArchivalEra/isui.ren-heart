const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Swup.okfGCf0T.js","_astro/Swup.modern.C2CFcRcI.js","_astro/SwupA11yPlugin.DvfTARzg.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.SkV6a72Q.js","_astro/SwupScrollPlugin.CznjUOSB.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as ve}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{$ as m,A as xa,F as B,I as ya,J as n,K as E,L as ze,M as ka,N as S,O as Ia,P as it,S as V,V as e,X as u,Y as oe,Z as Ta,a as Na,b as Ze,et as j,f as Qe,g as Ea,h as $,it as Sa,j as p,k as y,m as za,nt as P,ot as Et,q as Da,rt as Ma,st as i,t as He,w as Aa,y as et}from"./client.CVK8X0vf.js";var Ca=`
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
`;function zt(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=Ca,document.head.appendChild(t)}var C;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})(C||(C={}));var br=new TextEncoder,La=new TextDecoder,at=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const d=this.buffer[this.pos++];if(t|=BigInt(d&127)<<a,(d&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return La.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function tt(t){const a=new at(t),d={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:C.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const T=a.readTag();if(!T)break;switch(T.fieldNo){case 1:d.timestamp=Number(a.readVarint());break;case 2:d.deviceId=a.readString();break;case 3:d.deviceName=a.readString();break;case 4:d.appName=a.readString();break;case 5:d.windowTitle=a.readString();break;case 6:d.status=Number(a.readVarint());break;case 7:d.osInfo=a.readString();break;case 8:d.idleSeconds=Number(a.readVarint());break;case 9:{const g=a.readBytes(),b=new at(g);let x="",c="";for(;b.hasMore;){const N=b.readTag();if(!N)break;N.fieldNo===1?x=b.readString():N.fieldNo===2?c=b.readString():b.skip(N.wireType)}x&&d.metadata&&(d.metadata[x]=c);break}default:a.skip(T.wireType)}}return d}function Oa(t){const a=new at(t);let d=null;const T=[],g=[];let b=Date.now();for(;a.hasMore;){const x=a.readTag();if(!x)break;switch(x.fieldNo){case 1:d=tt(a.readBytes());break;case 2:{const c=a.readBytes();T.push(tt(c));break}case 3:{const c=a.readBytes();g.push(tt(c));break}case 4:b=Number(a.readVarint());break;default:a.skip(x.wireType)}}return{current:d,devices:T,history:g,serverTime:b}}function qa(t){if(!t)return"";const a=t.charAt(0);return a>="a"&&a<="z"?a.toUpperCase()+t.slice(1):t}function we(t,a=Date.now(),d="zh"){const T=Math.max(0,a-t),g=Math.floor(T/1e3),b=Math.floor(g/60),x=Math.floor(b/60),c=Math.floor(x/24);return d==="zh"?g<45?"刚刚":b<60?`${b}分钟前`:x<24?`${x}小时前`:c===1?"昨天":c<30?`${c}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):g<45?"just now":b<60?`${b}m ago`:x<24?`${x}h ago`:c===1?"yesterday":c<30?`${c}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function rt(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Va(t,a=Date.now(),d="zh"){if(!t||t<=0)return"";const T=rt(t);if(!T)return"";const g=we(t,a,d);return d==="zh"?`最后活跃时间: ${T} (${g})`:`Last active: ${T} (${g})`}function Fa(t,a=Date.now(),d="zh"){if(!t?.appName)return{statusType:"offline",sentence:d==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const T=t.lastSeen??t.timestamp,g=Math.max(0,a-T),b=Math.floor(g/1e3),x=we(T,a,d);let c="active";t.status===C.OFFLINE||t.offline||b>259200?c="offline":t.status===C.AWAY||b>1800?c="away":(t.status===C.IDLE||b>180)&&(c="idle");const N=c==="active"&&b<120,O=t.deviceName||t.name||t.deviceId||t.id||(d==="zh"?"Linux设备":"Device");let o="";if(t.media?.title&&N){const w=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;d==="zh"?o=`正在 ${O} 收听 ${w}`:o=`Listening to ${w} on ${O}`}else d==="zh"?N?o=`正在 ${O} 使用 ${t.appName}`:c==="offline"?o=`最后在使用: ${t.appName}`:o=`${x}在 ${O} 使用 ${t.appName}`:N?o=`Using ${t.appName} on ${O}`:c==="offline"?o=`Last used: ${t.appName}`:o=`${x} used ${t.appName} on ${O}`;return{statusType:c,sentence:o,appName:t.appName,deviceName:O,relativeTime:x}}var Pa=S('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ra=S('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),Ha=S('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),Wa=S('<span class="wid-capsule__prefix">离线</span> <!>',1),Ba=S('<span class="wid-capsule__media-icon">🎵</span> <span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),ja=S('<span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Ua=S("<span> </span>"),Ya=it('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>'),Ga=it('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>'),$a=it('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>'),Ka=S('<span class="wid-current-card__device"> </span>'),Xa=S('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> </span></div>'),Ja=S('<span class="wid-current-card__os-info"> </span>'),Za=S('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <!></div> <!> <div class="wid-current-card__footer"><span class="wid-current-card__time"> </span> <!></div></div>'),Qa=S('<div class="wid-panel__empty">正在获取设备状态...</div>'),er=S('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),tr=S('<div class="wid-panel__empty">当前暂无已登记设备</div>'),ar=S('<span class="wid-device-card__abs-time"> </span>'),rr=S('<div class="wid-device-card__app"><span class="wid-device-card__muted-label">最后使用:</span> <span class="wid-device-card__app-title"> </span></div> <div class="wid-device-card__time"> <!></div>',1),ir=S('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span></div> <div class="wid-device-card__time"><!></div>',1),nr=S('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),or=S('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),sr=S('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> <!></span> <span class="wid-timeline__time"> </span></div></div></li>'),dr=S('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),lr=S('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button"><!> <span class="wid-panel__refresh-label"><!></span></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),cr=S('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function pr(t,a){Sa(a,!0),zt();let d=He(a,"endpoint",3,"/api/activity"),T=He(a,"maxHistoryDisplay",3,5),g=He(a,"refreshInterval",3,0),b=He(a,"class",3,"");const x=P(()=>Array.isArray(d())?d().map(r=>r.trim()).filter(Boolean):typeof d()=="string"?d().split(",").map(r=>r.trim()).filter(Boolean):["/api/activity"]);let c=j(null),N=j(!1),O=j(!1),o=j(null),w=j(!1),M=j(Ta(Date.now())),Q=j(null),Be=j(!1),k=j("idle"),Ae=j(0),Ce=j(0),Le=null,Oe=null,qe=null;function ae(){Le&&(clearInterval(Le),Le=null),Oe&&(clearTimeout(Oe),Oe=null),qe&&(clearTimeout(qe),qe=null)}let Ve=j(0),nt=j(0);const h=P(()=>e(c)?.current??null),je=P(()=>e(c)?.devices??[]),ot=P(()=>e(c)?.history??[]),he=P(()=>!e(c)&&e(N)),ge=P(()=>!e(c)&&!e(N)&&!!e(o)),Y=P(()=>{if(!e(c)||!e(h))return!1;if(e(h).offline||e(h).status===C.OFFLINE)return!0;const r=e(h).lastSeen??e(h).timestamp;return!!(r&&e(M)-r>12e4)}),st=P(()=>{if(!e(Y))return"";const r=e(h)?.lastSeen??e(h)?.timestamp??0;return Va(r,e(M),"zh")}),dt=P(()=>e(h)&&(e(h).deviceName||e(h).name||e(h).deviceId||e(h).id)||""),Dt=P(()=>qa(e(h)?.appName||"")),Fe=P(()=>Fa(e(h),e(M),"zh")),Mt=P(()=>{if(e(Y))return"离线";switch(e(Fe).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),lt={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},ct=P(()=>{const r=e(je).length>0?e(je):e(h)?[e(h)]:[],l={desktop:[],laptop:[],server:[],other:[]};for(const _ of r){const I=(_.type||"desktop").toLowerCase();I==="desktop"?l.desktop.push(_):I==="laptop"?l.laptop.push(_):I==="server"?l.server.push(_):l.other.push(_)}return["desktop","laptop","server","other"].filter(_=>l[_].length>0).map(_=>({key:_,label:lt[_]?.label??_,icon:lt[_]?.icon??"💻",devices:l[_]}))}),pt=P(()=>e(je).filter(r=>!r.offline&&r.status!==C.OFFLINE&&e(M)-(r.lastSeen??r.timestamp)<=12e4).length),At=P(()=>e(ot).slice(0,T()));let be=null;async function xe(r=!1){if(e(N)&&!r)return!1;r&&be&&be.abort(),m(N,!0),r&&m(O,!0);const l=new AbortController;be=l;const _=setTimeout(()=>l.abort(),9e3);let I=!1;try{m(o,null);let A=null;for(const K of e(x)){if(l.signal.aborted)break;try{const D=await fetch(K,{signal:l.signal});if(!D.ok){A=new Error(`HTTP ${D.status}`);continue}const re=D.headers.get("content-type")??"";if(re.includes("application/x-protobuf")){const fe=await D.arrayBuffer();m(c,Oa(new Uint8Array(fe)),!0),I=!0;break}else if(re.includes("application/json")||re.includes("text/plain")){const fe=await D.text();try{const se=JSON.parse(fe);if(se&&(se.current!==void 0||se.devices!==void 0||se.serverTime!==void 0)){m(c,se,!0),I=!0;break}}catch{continue}}}catch(D){if(D?.name==="AbortError"){A=D;break}A=D;continue}}I?(m(M,Date.now(),!0),m(Ae,Date.now(),!0),m(o,null)):A?.name==="AbortError"?m(o,"连接状态服务器超时，请点击重试"):m(o,"无法连接至状态服务器")}catch(A){A?.name==="AbortError"?m(o,"连接状态服务器超时，请点击重试"):m(o,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",A)}finally{clearTimeout(_),be===l&&(be=null),m(N,!1),m(O,!1)}return I}let ye=null;function ft(){g()>0&&!ye&&(ye=setInterval(()=>{document.visibilityState==="visible"&&xe()},g()))}function Ct(){ye&&(clearInterval(ye),ye=null)}function ut(){if(typeof window>"u"||(m(Be,window.innerWidth<768),!e(Q)))return;const r=e(Q).getBoundingClientRect();m(Ve,Math.round(r.left+r.width/2),!0),m(Ve,Math.max(210,Math.min(window.innerWidth-210,e(Ve))),!0),m(nt,Math.round(window.innerHeight-r.top),!0)}function Lt(){m(w,!e(w)),e(w)?(m(M,Date.now(),!0),ut(),!e(c)&&!e(N)&&xe()):(ae(),m(k,"idle"))}async function _t(r){if(r?.stopPropagation(),e(k)==="refreshing")return;const l=5e3,_=Date.now()-e(Ae);if(e(Ae)>0&&_<l){ae(),m(k,"cooldown");const I=()=>{const K=l-(Date.now()-e(Ae));K<=0?(ae(),m(k,"idle")):m(Ce,Math.max(1,Math.ceil(K/1e3)),!0)};I(),Le=setInterval(I,200);const A=Math.min(1800,Math.max(800,l-_));Oe=setTimeout(()=>{ae(),m(k,"idle")},A);return}ae(),m(k,"refreshing"),await xe(!0)?(m(k,"done"),qe=setTimeout(()=>{m(k,"idle")},700)):m(k,"idle")}function Ot(r){return document.body.appendChild(r),{destroy(){r.parentNode&&r.parentNode.removeChild(r)}}}Da(()=>{if(!(typeof document>"u")&&e(w)){const r=document.body.style.overflow,l=document.body.style.paddingRight,_=window.innerWidth-document.documentElement.clientWidth;return _>0&&(document.body.style.paddingRight=`${_}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=r,document.body.style.paddingRight=l}}}),Aa(()=>{let r=null;typeof IntersectionObserver<"u"&&e(Q)?(r=new IntersectionObserver(I=>{for(const A of I)if(A.isIntersecting){xe(),ft(),r?.disconnect(),r=null;break}},{rootMargin:"60px"}),r.observe(e(Q))):(xe(),ft());const l=()=>{e(w)&&ut()},_=I=>{I.key==="Escape"&&e(w)&&(m(w,!1),ae(),m(k,"idle"))};return window.addEventListener("resize",l),window.addEventListener("keydown",_),()=>{Ct(),ae(),r&&r.disconnect(),window.removeEventListener("resize",l),window.removeEventListener("keydown",_)}});var vt=cr(),ke=oe(vt),Ie=n(ke),mt=n(Ie);let wt;var Ue=u(mt,2),qt=n(Ue),Vt=r=>{var l=Pa();Et(2),p(r,l)},Ft=r=>{var l=Ra();Et(2),p(r,l)},Pt=r=>{var l=Wa(),_=u(oe(l),2),I=A=>{var K=Ha(),D=u(oe(K),2),re=n(D,!0);i(D),E(()=>y(re,e(st))),p(A,K)};V(_,A=>{e(st)&&A(I)}),p(r,l)},Rt=r=>{var l=Ba(),_=u(oe(l),4),I=n(_,!0);i(_),E(()=>y(I,e(h).media.title)),p(r,l)},Ht=r=>{var l=ja(),_=u(oe(l),2),I=n(_,!0);i(_),E(()=>y(I,e(Dt))),p(r,l)},Wt=r=>{var l=Ua(),_=n(l,!0);i(l),E(()=>y(_,e(Mt))),p(r,l)};V(qt,r=>{e(he)?r(Vt):e(ge)?r(Ft,1):e(Y)?r(Pt,2):e(h)?.media?.title?r(Rt,3):e(h)?.appName?r(Ht,4):r(Wt,-1)}),i(Ue);var Bt=u(Ue,2);let ht;i(Ie),i(ke),Na(ke,r=>m(Q,r),()=>e(Q));var jt=u(ke,2),Ut=r=>{var l=lr(),_=n(l),I=u(_,2),A=u(n(I),2),K=u(n(A),2),D=n(K);let re;var fe=n(D),se=s=>{var f=Ya();p(s,f)},Yt=s=>{var f=Ga();p(s,f)},Gt=s=>{var f=$a();let H;E(()=>H=$(f,0,"wid-panel__refresh-icon",null,H,{"wid-panel__refresh-icon--spin":e(k)==="refreshing"})),p(s,f)};V(fe,s=>{e(k)==="done"?s(se):e(k)==="cooldown"?s(Yt,1):s(Gt,-1)});var gt=u(fe,2),$t=n(gt),Kt=s=>{var f=B();E(()=>y(f,`请等待 ${e(Ce)??""} 秒刷新`)),p(s,f)},Xt=s=>{var f=B("正在刷新...");p(s,f)},Jt=s=>{var f=B("已同步");p(s,f)};V($t,s=>{e(k)==="cooldown"?s(Kt):e(k)==="refreshing"?s(Xt,1):e(k)==="done"&&s(Jt,2)}),i(gt),i(D);var Zt=u(D,2);i(K),i(A);var Ye=u(A,2),bt=n(Ye),Qt=s=>{var f=Za();let H;var ee=n(f),L=n(ee);let X;var ie=n(L,!0);i(L);var J=u(L,2),de=n(J,!0);i(J);var ne=u(J,2),Te=F=>{var q=Ka(),Z=n(q);i(q),E(()=>y(Z,`@${e(dt)??""}`)),p(F,q)};V(ne,F=>{e(dt)&&F(Te)}),i(ee);var le=u(ee,2),ue=F=>{var q=Xa(),Z=u(n(q),2),Pe=n(Z,!0);i(Z),i(q),E(()=>y(Pe,e(h).mediaTitle)),p(F,q)};V(le,F=>{e(h).mediaTitle&&F(ue)});var ce=u(le,2),G=n(ce),v=n(G);i(G);var W=u(G,2),_e=F=>{var q=Ja(),Z=n(q,!0);i(q),E(()=>y(Z,e(h).osInfo)),p(F,q)};V(W,F=>{e(h).osInfo&&F(_e)}),i(ce),i(f),E((F,q)=>{H=$(f,1,"wid-current-card",null,H,{"wid-current-card--offline":e(Y)}),X=$(L,1,"wid-tag",null,X,{"wid-tag--primary":!e(Y),"wid-tag--muted":e(Y)}),y(ie,e(Y)?"最后使用":"当前活跃"),y(de,e(h).appName||"idle"),y(v,`活跃于 ${F??""} · ${q??""}`)},[()=>we(e(h).lastSeen??e(h).timestamp,e(M),"zh"),()=>rt(e(h).lastSeen??e(h).timestamp,"zh")]),p(s,f)};V(bt,s=>{e(h)&&s(Qt)});var Ge=u(bt,2),ea=n(Ge),ta=s=>{var f=Qa();p(s,f)},aa=s=>{var f=er(),H=n(f),ee=n(H,!0);i(H);var L=u(H,2);i(f),E(()=>y(ee,e(o))),ze("click",L,()=>_t()),p(s,f)},ra=s=>{var f=tr();p(s,f)},ia=s=>{var f=ka(),H=oe(f);et(H,17,()=>e(ct),Ze,(ee,L)=>{var X=or(),ie=n(X),J=n(ie),de=n(J,!0);i(J);var ne=u(J,2),Te=n(ne,!0);i(ne);var le=u(ne,2),ue=n(le,!0);i(le),i(ie);var ce=u(ie,2);et(ce,21,()=>e(L).devices,Ze,(G,v)=>{const W=P(()=>e(v).offline||e(v).status===C.OFFLINE||e(M)-(e(v).lastSeen??e(v).timestamp)>12e4);var _e=nr();let F;var q=n(_e),Z=n(q),Pe=n(Z);let kt;var It=u(Pe,2),ca=n(It,!0);i(It),i(Z);var $e=u(Z,2);let Tt;var pa=n($e),fa=z=>{var R=B("离线");p(z,R)},ua=z=>{var R=B("正在活跃");p(z,R)},_a=z=>{var R=B("空闲");p(z,R)},va=z=>{var R=B("离开");p(z,R)},ma=z=>{var R=B("在线");p(z,R)};V(pa,z=>{e(W)?z(fa):e(v).status===C.ACTIVE?z(ua,1):e(v).status===C.IDLE?z(_a,2):e(v).status===C.AWAY?z(va,3):z(ma,-1)}),i($e),i(q);var Nt=u(q,2),wa=n(Nt),ha=z=>{var R=rr(),pe=oe(R),Ne=u(n(pe),2),Ke=n(Ne,!0);i(Ne),i(pe);var Ee=u(pe,2),Re=n(Ee),Xe=u(Re),Je=U=>{var te=ar(),Se=n(te);i(te),E(ba=>y(Se,`(${ba??""})`),[()=>rt(e(v).lastSeen??e(v).timestamp)]),p(U,te)};V(Xe,U=>{(e(v).lastSeen||e(v).timestamp)&&U(Je)}),i(Ee),E(U=>{y(Ke,e(v).appName||"无记录"),y(Re,`最后活跃: ${U??""} `)},[()=>we(e(v).lastSeen??e(v).timestamp,e(M),"zh")]),p(z,R)},ga=z=>{var R=ir(),pe=oe(R),Ne=n(pe),Ke=n(Ne,!0);i(Ne),i(pe);var Ee=u(pe,2),Re=n(Ee),Xe=U=>{var te=B();E(Se=>y(te,`已空闲 ${Se??""} 分钟`),[()=>Math.floor(e(v).idleSeconds/60)]),p(U,te)},Je=U=>{var te=B();E(Se=>y(te,`活跃于 ${Se??""}`),[()=>we(e(v).lastSeen??e(v).timestamp,e(M),"zh")]),p(U,te)};V(Re,U=>{e(v).status===C.IDLE&&e(v).idleSeconds&&e(v).idleSeconds>60?U(Xe):U(Je,-1)}),i(Ee),E(()=>y(Ke,e(v).appName||"活动中")),p(z,R)};V(wa,z=>{e(W)?z(ha):z(ga,-1)}),i(Nt),i(_e),E(()=>{F=$(_e,1,"wid-device-card",null,F,{"wid-device-card--offline":e(W),"wid-device-card--active":!e(W)&&e(v).status===C.ACTIVE}),kt=$(Pe,1,"wid-device-card__dot",null,kt,{"wid-device-card__dot--active":!e(W)&&e(v).status===C.ACTIVE,"wid-device-card__dot--idle":!e(W)&&e(v).status===C.IDLE,"wid-device-card__dot--away":!e(W)&&e(v).status===C.AWAY,"wid-device-card__dot--offline":e(W)}),y(ca,e(v).name||e(v).deviceName||e(v).id||e(v).deviceId),Tt=$($e,1,"wid-device-card__badge",null,Tt,{"wid-device-card__badge--active":!e(W)&&e(v).status===C.ACTIVE,"wid-device-card__badge--idle":!e(W)&&e(v).status===C.IDLE,"wid-device-card__badge--offline":e(W)})}),p(G,_e)}),i(ce),i(X),E(()=>{y(de,e(L).icon),y(Te,e(L).label),y(ue,e(L).devices.length)}),p(ee,X)}),p(s,f)};V(ea,s=>{e(N)&&!e(c)?s(ta):e(o)&&!e(c)?s(aa,1):e(ct).length===0?s(ra,2):s(ia,-1)}),i(Ge);var na=u(Ge,2),oa=s=>{var f=dr(),H=u(n(f),2);et(H,21,()=>e(At),Ze,(ee,L)=>{var X=sr(),ie=u(n(X),2),J=n(ie),de=n(J),ne=n(de),Te=u(ne),le=G=>{var v=B();E(()=>y(v,`@${(e(L).deviceName||e(L).name)??""}`)),p(G,v)};V(Te,G=>{(e(L).deviceName||e(L).name)&&G(le)}),i(de);var ue=u(de,2),ce=n(ue,!0);i(ue),i(J),i(ie),i(X),E(G=>{y(ne,`${e(L).appName??""} `),y(ce,G)},[()=>we(e(L).timestamp,e(M),"zh")]),p(ee,X)}),i(H),i(f),p(s,f)};V(na,s=>{e(ot).length>0&&s(oa)}),i(Ye);var xt=u(Ye,2),yt=u(n(xt),2),sa=n(yt),da=s=>{var f=B();E(()=>y(f,`🟢 ${e(pt)??""} 台在线 · 按需刷新`)),p(s,f)},la=s=>{var f=B("⚪ 全设备离线 · 按需刷新");p(s,f)};V(sa,s=>{e(pt)>0?s(da):s(la,-1)}),i(yt),i(xt),i(I),i(l),Ea(l,s=>Ot?.(s)),E(()=>{za(I,`--anchor-bottom: ${e(nt)}px; --anchor-left: ${e(Ve)}px;`),re=$(D,1,"wid-panel__refresh-pill",null,re,{"wid-panel__refresh-pill--expanded":e(k)!=="idle","wid-panel__refresh-pill--cooldown":e(k)==="cooldown","wid-panel__refresh-pill--done":e(k)==="done"}),D.disabled=e(k)==="refreshing",Qe(D,"aria-label",e(k)==="cooldown"?`请等待 ${e(Ce)} 秒后刷新`:e(k)==="refreshing"?"正在刷新状态...":e(k)==="done"?"已同步":"手动刷新状态"),Qe(D,"title",e(k)==="cooldown"?`请等待 ${e(Ce)} 秒后刷新`:"手动刷新")}),ze("click",_,()=>m(w,!1)),ze("click",D,_t),ze("click",Zt,()=>{m(w,!1),ae(),m(k,"idle")}),p(r,l)};V(jt,r=>{e(w)&&r(Ut)}),E(()=>{$(ke,1,`wid-capsule-wrapper ${b()}`),$(Ie,1,`wid-capsule wid-capsule--${e(he)?"loading":e(ge)?"error":e(Y)?"offline":e(Fe).statusType}`),Qe(Ie,"aria-expanded",e(w)),wt=$(mt,1,"wid-capsule__dot",null,wt,{"wid-capsule__dot--pulse":e(he),"wid-capsule__dot--active":!e(Y)&&!e(he)&&!e(ge)&&e(Fe).statusType==="active","wid-capsule__dot--idle":!e(Y)&&!e(he)&&!e(ge)&&e(Fe).statusType==="idle","wid-capsule__dot--offline":e(Y)||e(ge)}),ht=$(Bt,0,"wid-capsule__chevron",null,ht,{"wid-capsule__chevron--open":e(w)})}),ze("click",Ie,Lt),p(t,vt),Ma()}ya(["click"]);var De=null,Me=null;function fr(t={}){if(typeof window>"u"||typeof document>"u")return;zt();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let d=0;const T=25;let g=null;function b(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const o=window.location.pathname.toLowerCase();return a.routeFilter.some(w=>o.startsWith(w.toLowerCase()))}function x(){if(g&&(clearTimeout(g),g=null),!b()){c();return}if(document.querySelector(".wid-mounted-portal"))return;const o=document.querySelector(a.targetSelector);if(!o?.parentElement){d<T&&(d++,g=setTimeout(x,80));return}d=0;const w=document.createElement("div");w.className="wid-mounted-portal",w.style.width="100%",w.style.display="flex",w.style.justifyContent="center",o.insertAdjacentElement(a.position,w);try{De=Ia(pr,{target:w,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),Me=w}catch(M){console.error("[what-im-doing] Failed to mount Svelte capsule:",M),w.remove(),Me=null}}function c(){if(g&&(clearTimeout(g),g=null),d=0,De){try{xa(De)}catch{}De=null}Me&&(Me.remove(),Me=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",x):x();const N=window.swup,O=()=>{b()?(!document.querySelector(".wid-mounted-portal")||!De)&&(c(),d=0,x()):c()};N?.hooks?N.hooks.on("page:view",O):document.addEventListener("swup:contentReplaced",O)}function We(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,fr(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>We()),window.__WHAT_IM_DOING_CONFIG__?We():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>We()):setTimeout(We,0));function me(t){return JSON.parse(t,ur)}function ur(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const d=a[0];if(a=a[1],d===":regex:"){const T=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(T[1],T[2]||"")}if(d===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function St(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function _r(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function vr(t,{delayAfterLoad:a=0}={}){_r(()=>{a>0?setTimeout(()=>St(t),a):St(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/api/activity, https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));async function mr(){const[t,a,d,T,g,b]=await Promise.all([ve(()=>import("./Swup.okfGCf0T.js").then(o=>o.default),__vite__mapDeps([0,1])),ve(()=>import("./SwupA11yPlugin.DvfTARzg.js").then(o=>o.default),__vite__mapDeps([2,1,3])),ve(()=>import("./SwupPreloadPlugin.SkV6a72Q.js").then(o=>o.default),__vite__mapDeps([4,1,3])),ve(()=>import("./SwupScrollPlugin.CznjUOSB.js").then(o=>o.default),__vite__mapDeps([5,1,3])),ve(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(o=>o.default),__vite__mapDeps([6,3])),ve(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(o=>o.default),__vite__mapDeps([7,3]))]),x=me('["a[href=\\"#\\"]"]'),c=(o,w,{el:M,event:Q})=>typeof o=="string"&&o.startsWith("/")?w.startsWith(o):typeof o=="string"?M?.matches(o)??!1:o instanceof RegExp?o.test(w):typeof o=="function"?o(w,{el:M,event:Q}):Array.isArray(o)?o.some(Be=>c(Be,w,{el:M,event:Q})):!1,N=new t({ignoreVisit:(o,{el:w,event:M}={})=>w?.closest("[data-no-swup]")||c(x,o,{el:w,event:M}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(me("{}")),new d(me('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new T(me("{}")),new g(me('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new b(me("{}"))]}),O=o=>document.dispatchEvent(new Event(o));N.hooks.before("content:replace",()=>O("astro:before-swap")),N.hooks.on("content:replace",()=>O("astro:after-swap")),N.hooks.on("page:view",()=>O("astro:page-load")),window.swup=N}vr(mr);
