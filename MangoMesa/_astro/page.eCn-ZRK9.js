const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/enhance.BWzq8njy.js","_astro/preload-helper.BdsFut8j.js","_astro/Swup.okfGCf0T.js","_astro/Swup.modern.C2CFcRcI.js","_astro/SwupA11yPlugin.DvfTARzg.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.SkV6a72Q.js","_astro/SwupScrollPlugin.CznjUOSB.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as _e}from"./preload-helper.BdsFut8j.js";import"./disclose-version.DwdwGuwu.js";import{$ as Sa,A as h,F as lt,H as e,I as j,J as za,L as La,M as l,N as Da,P as S,Q as p,R as De,S as O,T as Aa,X as de,Y as w,Z as L,a as Ma,at as Ca,b as rt,ct as At,f as it,g as Oa,h as X,it as V,j as qa,k as Fa,lt as u,m as Pa,nt as U,ot as Ra,q as x,t as je,tt as v,y as nt}from"./client.G4glzjEr.js";var Va=`
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
`;function Ot(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=Va,document.head.appendChild(t)}var A;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})(A||(A={}));var Nr=new TextEncoder,Wa=new TextDecoder,st=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const o=this.buffer[this.pos++];if(t|=BigInt(o&127)<<a,(o&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return Wa.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function ot(t){const a=new st(t),o={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:A.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const b=a.readTag();if(!b)break;switch(b.fieldNo){case 1:o.timestamp=Number(a.readVarint());break;case 2:o.deviceId=a.readString();break;case 3:o.deviceName=a.readString();break;case 4:o.appName=a.readString();break;case 5:o.windowTitle=a.readString();break;case 6:o.status=Number(a.readVarint());break;case 7:o.osInfo=a.readString();break;case 8:o.idleSeconds=Number(a.readVarint());break;case 9:{const y=a.readBytes(),k=new st(y);let T="",c="";for(;k.hasMore;){const N=k.readTag();if(!N)break;N.fieldNo===1?T=k.readString():N.fieldNo===2?c=k.readString():k.skip(N.wireType)}T&&o.metadata&&(o.metadata[T]=c);break}default:a.skip(b.wireType)}}return o}function Ha(t){const a=new st(t);let o=null;const b=[],y=[];let k=Date.now();for(;a.hasMore;){const T=a.readTag();if(!T)break;switch(T.fieldNo){case 1:o=ot(a.readBytes());break;case 2:{const c=a.readBytes();b.push(ot(c));break}case 3:{const c=a.readBytes();y.push(ot(c));break}case 4:k=Number(a.readVarint());break;default:a.skip(T.wireType)}}return{current:o,devices:b,history:y,serverTime:k}}function Ba(t){if(!t)return"";const a=t.charAt(0);return a>="a"&&a<="z"?a.toUpperCase()+t.slice(1):t}function he(t,a=Date.now(),o="zh"){const b=Math.max(0,a-t),y=Math.floor(b/1e3),k=Math.floor(y/60),T=Math.floor(k/60),c=Math.floor(T/24);return o==="zh"?y<45?"刚刚":k<60?`${k}分钟前`:T<24?`${T}小时前`:c===1?"昨天":c<30?`${c}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):y<45?"just now":k<60?`${k}m ago`:T<24?`${T}h ago`:c===1?"yesterday":c<30?`${c}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function dt(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function Ya(t,a=Date.now(),o="zh"){if(!t||t<=0)return"";const b=dt(t);if(!b)return"";const y=he(t,a,o);return o==="zh"?`最后活跃时间: ${b} (${y})`:`Last active: ${b} (${y})`}function ja(t,a=Date.now(),o="zh"){if(!t?.appName)return{statusType:"offline",sentence:o==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const b=t.lastSeen??t.timestamp,y=Math.max(0,a-b),k=Math.floor(y/1e3),T=he(b,a,o);let c="active";t.status===A.OFFLINE||t.offline||k>259200?c="offline":t.status===A.AWAY||k>1800?c="away":(t.status===A.IDLE||k>180)&&(c="idle");const N=c==="active"&&k<120,P=t.deviceName||t.name||t.deviceId||t.id||(o==="zh"?"Linux设备":"Device");let i="";if(t.media?.title&&N){const m=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;o==="zh"?i=`正在 ${P} 收听 ${m}`:i=`Listening to ${m} on ${P}`}else o==="zh"?N?i=`正在 ${P} 使用 ${t.appName}`:c==="offline"?i=`最后在使用: ${t.appName}`:i=`${T}在 ${P} 使用 ${t.appName}`:N?i=`Using ${t.appName} on ${P}`:c==="offline"?i=`Last used: ${t.appName}`:i=`${T} used ${t.appName} on ${P}`;return{statusType:c,sentence:i,appName:t.appName,deviceName:P,relativeTime:T}}var Ua=S('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ga=S('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),$a=S('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),Ka=S('<span class="wid-capsule__prefix">离线</span> <!>',1),Xa=S('<span class="wid-capsule__media-icon">🎵</span> <span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Ja=S('<span class="wid-capsule__prefix">正在</span> <strong class="wid-capsule__app"> </strong>',1),Qa=S("<span> </span>"),Za=lt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>'),er=lt('<svg class="wid-panel__refresh-icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>'),tr=lt('<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>'),ar=S('<span class="wid-current-card__device"> </span>'),rr=S('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> </span></div>'),ir=S('<span class="wid-current-card__os-info"> </span>'),nr=S('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <!></div> <!> <div class="wid-current-card__footer"><span class="wid-current-card__time"> </span> <!></div></div>'),or=S('<div class="wid-panel__empty">正在获取设备状态...</div>'),sr=S('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),dr=S('<div class="wid-panel__empty">当前暂无已登记设备</div>'),Mt=S('<div class="wid-device-card__win-title"> </div>'),lr=S('<span class="wid-device-card__abs-time"> </span>'),cr=S('<div class="wid-device-card__app"><span class="wid-device-card__muted-label"> </span> <span class="wid-device-card__app-title"> </span></div> <!> <div class="wid-device-card__time"> <!></div>',1),pr=S('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span></div> <!> <div class="wid-device-card__time"><!></div>',1),fr=S('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),ur=S('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),_r=S('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> <!></span> <span class="wid-timeline__time"> </span></div></div></li>'),vr=S('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),mr=S('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button"><!> <span class="wid-panel__refresh-label"><!></span></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),wr=S('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function hr(t,a){Ra(a,!0),Ot();let o=je(a,"endpoint",3,"/api/activity"),b=je(a,"maxHistoryDisplay",3,5),y=je(a,"refreshInterval",3,0),k=je(a,"class",3,"");const T=V(()=>Array.isArray(o())?o().map(r=>r.trim()).filter(Boolean):typeof o()=="string"?o().split(",").map(r=>r.trim()).filter(Boolean):["/api/activity"]);let c=U(null),N=U(!1),P=U(!1),i=U(null),m=U(!1),M=U(Sa(Date.now())),te=U(null),Ge=U(!1),I=U("idle"),Ce=U(0),Oe=U(0),qe=null,Fe=null,Pe=null;function ie(){qe&&(clearInterval(qe),qe=null),Fe&&(clearTimeout(Fe),Fe=null),Pe&&(clearTimeout(Pe),Pe=null)}let Re=U(0),ct=U(0);const g=V(()=>e(c)?.current??null),$e=V(()=>e(c)?.devices??[]),pt=V(()=>e(c)?.history??[]),ge=V(()=>!e(c)&&e(N)),be=V(()=>!e(c)&&!e(N)&&!!e(i)),$=V(()=>{if(!e(c)||!e(g))return!1;if(e(g).offline||e(g).status===A.OFFLINE)return!0;const r=e(g).lastSeen??e(g).timestamp,s=(e(g).type||"").toLowerCase()==="server"?9e5:12e4;return!!(r&&e(M)-r>s)}),ft=V(()=>{if(!e($))return"";const r=e(g)?.lastSeen??e(g)?.timestamp??0;return Ya(r,e(M),"zh")}),ut=V(()=>e(g)&&(e(g).deviceName||e(g).name||e(g).deviceId||e(g).id)||""),qt=V(()=>Ba(e(g)?.appName||"")),Ve=V(()=>ja(e(g),e(M),"zh")),Ft=V(()=>{if(e($))return"离线";switch(e(Ve).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),_t={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},vt=V(()=>{const r=e($e).length>0?e($e):e(g)?[e(g)]:[],s={desktop:[],laptop:[],server:[],other:[]};for(const _ of r){const E=(_.type||"desktop").toLowerCase();E==="desktop"?s.desktop.push(_):E==="laptop"?s.laptop.push(_):E==="server"?s.server.push(_):s.other.push(_)}return["desktop","laptop","server","other"].filter(_=>s[_].length>0).map(_=>({key:_,label:_t[_]?.label??_,icon:_t[_]?.icon??"💻",devices:s[_]}))}),mt=V(()=>e($e).filter(r=>{if(r.offline||r.status===A.OFFLINE)return!1;const s=(r.type||"").toLowerCase()==="server"?9e5:12e4;return e(M)-(r.lastSeen??r.timestamp)<=s}).length),Pt=V(()=>e(pt).slice(0,b()));let xe=null;async function ye(r=!1){if(e(N)&&!r)return!1;r&&xe&&xe.abort(),v(N,!0),r&&v(P,!0);const s=new AbortController;xe=s;const _=setTimeout(()=>s.abort(),9e3);let E=!1;try{v(i,null);let C=null;for(const J of e(T)){if(s.signal.aborted)break;try{const D=await fetch(J,{signal:s.signal});if(!D.ok){C=new Error(`HTTP ${D.status}`);continue}const ne=D.headers.get("content-type")??"";if(ne.includes("application/x-protobuf")){const ve=await D.arrayBuffer();v(c,Ha(new Uint8Array(ve)),!0),E=!0;break}else if(ne.includes("application/json")||ne.includes("text/plain")){const ve=await D.text();try{const le=JSON.parse(ve);if(le&&(le.current!==void 0||le.devices!==void 0||le.serverTime!==void 0)){v(c,le,!0),E=!0;break}}catch{continue}}}catch(D){if(D?.name==="AbortError"){C=D;break}C=D;continue}}E?(v(M,Date.now(),!0),v(Ce,Date.now(),!0),v(i,null)):C?.name==="AbortError"?v(i,"连接状态服务器超时，请点击重试"):v(i,"无法连接至状态服务器")}catch(C){C?.name==="AbortError"?v(i,"连接状态服务器超时，请点击重试"):v(i,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",C)}finally{clearTimeout(_),xe===s&&(xe=null),v(N,!1),v(P,!1)}return E}let ke=null;function wt(){y()>0&&!ke&&(ke=setInterval(()=>{document.visibilityState==="visible"&&ye()},y()))}function Rt(){ke&&(clearInterval(ke),ke=null)}function ht(){if(typeof window>"u"||(v(Ge,window.innerWidth<768),!e(te)))return;const r=e(te).getBoundingClientRect();v(Re,Math.round(r.left+r.width/2),!0),v(Re,Math.max(210,Math.min(window.innerWidth-210,e(Re))),!0),v(ct,Math.round(window.innerHeight-r.top),!0)}function Vt(){v(m,!e(m)),e(m)?(v(M,Date.now(),!0),ht(),!e(c)&&!e(N)&&ye()):(ie(),v(I,"idle"))}async function gt(r){if(r?.stopPropagation(),e(I)==="refreshing")return;const s=5e3,_=Date.now()-e(Ce);if(e(Ce)>0&&_<s){ie(),v(I,"cooldown");const E=()=>{const J=s-(Date.now()-e(Ce));J<=0?(ie(),v(I,"idle")):v(Oe,Math.max(1,Math.ceil(J/1e3)),!0)};E(),qe=setInterval(E,200);const C=Math.min(1800,Math.max(800,s-_));Fe=setTimeout(()=>{ie(),v(I,"idle")},C);return}ie(),v(I,"refreshing"),await ye(!0)?(v(I,"done"),Pe=setTimeout(()=>{v(I,"idle")},700)):v(I,"idle")}function Wt(r){return document.body.appendChild(r),{destroy(){r.parentNode&&r.parentNode.removeChild(r)}}}za(()=>{if(!(typeof document>"u")&&e(m)){const r=document.body.style.overflow,s=document.body.style.paddingRight,_=window.innerWidth-document.documentElement.clientWidth;return _>0&&(document.body.style.paddingRight=`${_}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=r,document.body.style.paddingRight=s}}}),Aa(()=>{let r=null;typeof IntersectionObserver<"u"&&e(te)?(r=new IntersectionObserver(E=>{for(const C of E)if(C.isIntersecting){ye(),wt(),r?.disconnect(),r=null;break}},{rootMargin:"60px"}),r.observe(e(te))):(ye(),wt());const s=()=>{e(m)&&ht()},_=E=>{E.key==="Escape"&&e(m)&&(v(m,!1),ie(),v(I,"idle"))};return window.addEventListener("resize",s),window.addEventListener("keydown",_),()=>{Rt(),ie(),r&&r.disconnect(),window.removeEventListener("resize",s),window.removeEventListener("keydown",_)}});var bt=wr(),Te=de(bt),Ie=w(Te),xt=w(Ie);let yt;var Ke=p(xt,2),Ht=w(Ke),Bt=r=>{var s=Ua();At(2),l(r,s)},Yt=r=>{var s=Ga();At(2),l(r,s)},jt=r=>{var s=Ka(),_=p(de(s),2),E=C=>{var J=$a(),D=p(de(J),2),ne=L(D,!0);x(()=>h(ne,e(ft))),l(C,J)};O(_,C=>{e(ft)&&C(E)}),l(r,s)},Ut=r=>{var s=Xa(),_=p(de(s),4),E=L(_,!0);x(()=>h(E,e(g).media.title)),l(r,s)},Gt=r=>{var s=Ja(),_=p(de(s),2),E=L(_,!0);x(()=>h(E,e(qt))),l(r,s)},$t=r=>{var s=Qa(),_=L(s,!0);x(()=>h(_,e(Ft))),l(r,s)};O(Ht,r=>{e(ge)?r(Bt):e(be)?r(Yt,1):e($)?r(jt,2):e(g)?.media?.title?r(Ut,3):e(g)?.appName?r(Gt,4):r($t,-1)}),u(Ke);var Kt=p(Ke,2);let kt;u(Ie),u(Te),Ma(Te,r=>v(te,r),()=>e(te));var Xt=p(Te,2),Jt=r=>{var s=mr(),_=w(s),E=p(_,2),C=p(w(E),2),J=p(w(C),2),D=w(J);let ne;var ve=w(D),le=n=>{var f=Za();l(n,f)},Qt=n=>{var f=er();l(n,f)},Zt=n=>{var f=tr();let Y;x(()=>Y=X(f,0,"wid-panel__refresh-icon",null,Y,{"wid-panel__refresh-icon--spin":e(I)==="refreshing"})),l(n,f)};O(ve,n=>{e(I)==="done"?n(le):e(I)==="cooldown"?n(Qt,1):n(Zt,-1)});var Tt=p(ve,2),ea=w(Tt),ta=n=>{var f=j();x(()=>h(f,`请等待 ${e(Oe)??""} 秒刷新`)),l(n,f)},aa=n=>{var f=j("正在刷新...");l(n,f)},ra=n=>{var f=j("已同步");l(n,f)};O(ea,n=>{e(I)==="cooldown"?n(ta):e(I)==="refreshing"?n(aa,1):e(I)==="done"&&n(ra,2)}),u(Tt),u(D);var ia=p(D,2);u(J),u(C);var Xe=p(C,2),It=w(Xe),na=n=>{var f=nr();let Y;var ae=w(f),R=w(ae);let Q;var oe=L(R,!0),se=p(R,2),ce=L(se,!0),pe=p(se,2),Ee=q=>{var B=ar(),re=L(B);x(()=>h(re,`@${e(ut)??""}`)),l(q,B)};O(pe,q=>{e(ut)&&q(Ee)}),u(ae);var me=p(ae,2),Ne=q=>{var B=rr(),re=p(w(B),2),Se=L(re,!0);u(B),x(()=>h(Se,e(g).mediaTitle)),l(q,B)};O(me,q=>{e(g).mediaTitle&&q(Ne)});var fe=p(me,2),Z=w(fe),d=L(Z),K=p(Z,2),H=q=>{var B=ir(),re=L(B,!0);x(()=>h(re,e(g).osInfo)),l(q,B)};O(K,q=>{e(g).osInfo&&q(H)}),u(fe),u(f),x((q,B)=>{Y=X(f,1,"wid-current-card",null,Y,{"wid-current-card--offline":e($)}),Q=X(R,1,"wid-tag",null,Q,{"wid-tag--primary":!e($),"wid-tag--muted":e($)}),h(oe,e($)?"最后使用":"当前活跃"),h(ce,e(g).appName||"idle"),h(d,`活跃于 ${q??""} · ${B??""}`)},[()=>he(e(g).lastSeen??e(g).timestamp,e(M),"zh"),()=>dt(e(g).lastSeen??e(g).timestamp,"zh")]),l(n,f)};O(It,n=>{e(g)&&n(na)});var Je=p(It,2),oa=w(Je),sa=n=>{var f=or();l(n,f)},da=n=>{var f=sr(),Y=w(f),ae=L(Y,!0),R=p(Y,2);u(f),x(()=>h(ae,e(i))),De("click",R,()=>gt()),l(n,f)},la=n=>{var f=dr();l(n,f)},ca=n=>{var f=Da(),Y=de(f);nt(Y,17,()=>e(vt),rt,(ae,R)=>{var Q=ur(),oe=w(Q),se=w(oe),ce=L(se,!0),pe=p(se,2),Ee=L(pe,!0),me=p(pe,2),Ne=L(me,!0);u(oe);var fe=p(oe,2);nt(fe,21,()=>e(R).devices,rt,(Z,d)=>{const K=V(()=>(e(d).type||"").toLowerCase()==="server"),H=V(()=>e(d).offline||e(d).status===A.OFFLINE||e(M)-(e(d).lastSeen??e(d).timestamp)>(e(K)?9e5:12e4));var q=fr();let B;var re=w(q),Se=w(re),St=w(Se);let zt;var ma=p(St,2),wa=L(ma,!0);u(Se);var Qe=p(Se,2);let Lt;var ha=w(Qe),ga=z=>{var F=j("离线");l(z,F)},ba=z=>{var F=j();x(()=>h(F,e(K)?"运行正常":"正在活跃")),l(z,F)},xa=z=>{var F=j();x(()=>h(F,e(K)?"待命中":"空闲")),l(z,F)},ya=z=>{var F=j();x(()=>h(F,e(K)?"服务降级":"离开")),l(z,F)},ka=z=>{var F=j("在线");l(z,F)};O(ha,z=>{e(H)?z(ga):e(d).status===A.ACTIVE?z(ba,1):e(d).status===A.IDLE?z(xa,2):e(d).status===A.AWAY?z(ya,3):z(ka,-1)}),u(Qe),u(re);var Dt=p(re,2),Ta=w(Dt),Ia=z=>{var F=cr(),ue=de(F),We=w(ue),Ze=L(We,!0),He=p(We,2),et=L(He,!0);u(ue);var ze=p(ue,2),tt=W=>{var Le=Mt(),at=L(Le,!0);x(()=>h(at,e(d).windowTitle)),l(W,Le)};O(ze,W=>{e(d).windowTitle&&W(tt)});var Be=p(ze,2),Ye=w(Be),G=p(Ye),ee=W=>{var Le=lr(),at=L(Le);x(Na=>h(at,`(${Na??""})`),[()=>dt(e(d).lastSeen??e(d).timestamp)]),l(W,Le)};O(G,W=>{(e(d).lastSeen||e(d).timestamp)&&W(ee)}),u(Be),x(W=>{h(Ze,e(K)?"服务:":"最后使用:"),h(et,e(d).appName||"无记录"),h(Ye,`${e(K)?"最后心跳:":"最后活跃:"} ${W??""} `)},[()=>he(e(d).lastSeen??e(d).timestamp,e(M),"zh")]),l(z,F)},Ea=z=>{var F=pr(),ue=de(F),We=w(ue),Ze=L(We,!0);u(ue);var He=p(ue,2),et=G=>{var ee=Mt(),W=L(ee,!0);x(()=>h(W,e(d).windowTitle)),l(G,ee)};O(He,G=>{e(d).windowTitle&&G(et)});var ze=p(He,2),tt=w(ze),Be=G=>{var ee=j();x(W=>h(ee,`已空闲 ${W??""} 分钟`),[()=>Math.floor(e(d).idleSeconds/60)]),l(G,ee)},Ye=G=>{var ee=j();x(W=>h(ee,`${e(K)?"心跳于":"活跃于"} ${W??""}`),[()=>he(e(d).lastSeen??e(d).timestamp,e(M),"zh")]),l(G,ee)};O(tt,G=>{!e(K)&&e(d).status===A.IDLE&&e(d).idleSeconds&&e(d).idleSeconds>60?G(Be):G(Ye,-1)}),u(ze),x(()=>h(Ze,e(d).appName||(e(K)?"服务运行中":"活动中"))),l(z,F)};O(Ta,z=>{e(H)?z(Ia):z(Ea,-1)}),u(Dt),u(q),x(()=>{B=X(q,1,"wid-device-card",null,B,{"wid-device-card--offline":e(H),"wid-device-card--active":!e(H)&&e(d).status===A.ACTIVE}),zt=X(St,1,"wid-device-card__dot",null,zt,{"wid-device-card__dot--active":!e(H)&&e(d).status===A.ACTIVE,"wid-device-card__dot--idle":!e(H)&&e(d).status===A.IDLE,"wid-device-card__dot--away":!e(H)&&e(d).status===A.AWAY,"wid-device-card__dot--offline":e(H)}),h(wa,e(d).name||e(d).deviceName||e(d).id||e(d).deviceId),Lt=X(Qe,1,"wid-device-card__badge",null,Lt,{"wid-device-card__badge--active":!e(H)&&e(d).status===A.ACTIVE,"wid-device-card__badge--idle":!e(H)&&e(d).status===A.IDLE,"wid-device-card__badge--away":!e(H)&&e(d).status===A.AWAY,"wid-device-card__badge--offline":e(H)})}),l(Z,q)}),u(fe),u(Q),x(()=>{h(ce,e(R).icon),h(Ee,e(R).label),h(Ne,e(R).devices.length)}),l(ae,Q)}),l(n,f)};O(oa,n=>{e(N)&&!e(c)?n(sa):e(i)&&!e(c)?n(da,1):e(vt).length===0?n(la,2):n(ca,-1)}),u(Je);var pa=p(Je,2),fa=n=>{var f=vr(),Y=p(w(f),2);nt(Y,21,()=>e(Pt),rt,(ae,R)=>{var Q=_r(),oe=p(w(Q),2),se=w(oe),ce=w(se),pe=w(ce),Ee=p(pe),me=Z=>{var d=j();x(()=>h(d,`@${(e(R).deviceName||e(R).name)??""}`)),l(Z,d)};O(Ee,Z=>{(e(R).deviceName||e(R).name)&&Z(me)}),u(ce);var Ne=p(ce,2),fe=L(Ne,!0);u(se),u(oe),u(Q),x(Z=>{h(pe,`${e(R).appName??""} `),h(fe,Z)},[()=>he(e(R).timestamp,e(M),"zh")]),l(ae,Q)}),u(Y),u(f),l(n,f)};O(pa,n=>{e(pt).length>0&&n(fa)}),u(Xe);var Et=p(Xe,2),Nt=p(w(Et),2),ua=w(Nt),_a=n=>{var f=j();x(()=>h(f,`🟢 ${e(mt)??""} 台在线 · 按需刷新`)),l(n,f)},va=n=>{var f=j("⚪ 全设备离线 · 按需刷新");l(n,f)};O(ua,n=>{e(mt)>0?n(_a):n(va,-1)}),u(Nt),u(Et),u(E),u(s),Oa(s,n=>Wt?.(n)),x(()=>{Pa(E,`--anchor-bottom: ${e(ct)}px; --anchor-left: ${e(Re)}px;`),ne=X(D,1,"wid-panel__refresh-pill",null,ne,{"wid-panel__refresh-pill--expanded":e(I)!=="idle","wid-panel__refresh-pill--cooldown":e(I)==="cooldown","wid-panel__refresh-pill--done":e(I)==="done"}),D.disabled=e(I)==="refreshing",it(D,"aria-label",e(I)==="cooldown"?`请等待 ${e(Oe)} 秒后刷新`:e(I)==="refreshing"?"正在刷新状态...":e(I)==="done"?"已同步":"手动刷新状态"),it(D,"title",e(I)==="cooldown"?`请等待 ${e(Oe)} 秒后刷新`:"手动刷新")}),De("click",_,()=>v(m,!1)),De("click",D,gt),De("click",ia,()=>{v(m,!1),ie(),v(I,"idle")}),l(r,s)};O(Xt,r=>{e(m)&&r(Jt)}),x(()=>{X(Te,1,`wid-capsule-wrapper ${k()}`),X(Ie,1,`wid-capsule wid-capsule--${e(ge)?"loading":e(be)?"error":e($)?"offline":e(Ve).statusType}`),it(Ie,"aria-expanded",e(m)),yt=X(xt,1,"wid-capsule__dot",null,yt,{"wid-capsule__dot--pulse":e(ge),"wid-capsule__dot--active":!e($)&&!e(ge)&&!e(be)&&e(Ve).statusType==="active","wid-capsule__dot--idle":!e($)&&!e(ge)&&!e(be)&&e(Ve).statusType==="idle","wid-capsule__dot--offline":e($)||e(be)}),kt=X(Kt,0,"wid-capsule__chevron",null,kt,{"wid-capsule__chevron--open":e(m)})}),De("click",Ie,Vt),l(t,bt),Ca()}La(["click"]);var Ae=null,Me=null;function gr(t={}){if(typeof window>"u"||typeof document>"u")return;Ot();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let o=0;const b=25;let y=null;function k(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const i=window.location.pathname.toLowerCase();return a.routeFilter.some(m=>i.startsWith(m.toLowerCase()))}function T(){if(y&&(clearTimeout(y),y=null),!k()){c();return}if(document.querySelector(".wid-mounted-portal"))return;const i=document.querySelector(a.targetSelector);if(!i?.parentElement){o<b&&(o++,y=setTimeout(T,80));return}o=0;const m=document.createElement("div");m.className="wid-mounted-portal",m.style.width="100%",m.style.display="flex",m.style.justifyContent="center",i.insertAdjacentElement(a.position,m);try{Ae=Fa(hr,{target:m,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),Me=m}catch(M){console.error("[what-im-doing] Failed to mount Svelte capsule:",M),m.remove(),Me=null}}function c(){if(y&&(clearTimeout(y),y=null),o=0,Ae){try{qa(Ae)}catch{}Ae=null}Me&&(Me.remove(),Me=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",T):T();const N=window.swup,P=()=>{k()?(!document.querySelector(".wid-mounted-portal")||!Ae)&&(c(),o=0,T()):c()};N?.hooks?N.hooks.on("page:view",P):document.addEventListener("swup:contentReplaced",P)}function Ue(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,gr(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>Ue()),window.__WHAT_IM_DOING_CONFIG__?Ue():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>Ue()):setTimeout(Ue,0));function we(t){return JSON.parse(t,br)}function br(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const o=a[0];if(a=a[1],o===":regex:"){const b=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(b[1],b[2]||"")}if(o===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function Ct(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function xr(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function yr(t,{delayAfterLoad:a=0}={}){xr(()=>{a>0?setTimeout(()=>Ct(t),a):Ct(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/activity, https://api.mango-mesa.ccwu.cc/activity, /api/activity, https://what-im-doing-hub.yaochenli083.workers.dev/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));window.__MELLOW_PLAYER_CONFIG__={engine:"auto",engineUrl:null,engineTimeoutMs:15e3,diagnostics:!0,labels:{play:"播放",pause:"暂停",mute:"静音",unmute:"取消静音",seek:"播放进度",volume:"音量",rate:"播放速度",fullscreen:"全屏",exitFullscreen:"退出全屏",loading:"正在准备播放…",error:"播放失败",diagnostics:"播放诊断",engine:"播放引擎",engineNative:"原生",engineMellow:"Mellow",requests:"有界请求数",transferred:"已传输",hardware:"硬件解码",hardwareEnabled:"已启用",hardwareDisabled:"不可用",startup:"就绪耗时",seekLatency:"最近跳转"},routeFilter:[],ticket:{endpoint:"/api/mp-ticket",hosts:["cdn-oracle.isui.ren"]}};(function(){var t="figure[data-artplayer]",a=!1;function o(){a||(a=!0,_e(()=>import("./enhance.BWzq8njy.js").then(function(b){b.watchArtPlayer(window.__MELLOW_PLAYER_CONFIG__)}),__vite__mapDeps([0,1])).catch(function(b){console.error("[mellow-player] runtime failed to load:",b)}))}if(document.querySelector(t)!==null){o();return}document.addEventListener("swup:content:replace",function(){setTimeout(function(){document.querySelector(t)!==null&&o()},0)})})();async function kr(){const[t,a,o,b,y,k]=await Promise.all([_e(()=>import("./Swup.okfGCf0T.js").then(i=>i.default),__vite__mapDeps([2,3])),_e(()=>import("./SwupA11yPlugin.DvfTARzg.js").then(i=>i.default),__vite__mapDeps([4,3,5])),_e(()=>import("./SwupPreloadPlugin.SkV6a72Q.js").then(i=>i.default),__vite__mapDeps([6,3,5])),_e(()=>import("./SwupScrollPlugin.CznjUOSB.js").then(i=>i.default),__vite__mapDeps([7,3,5])),_e(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(i=>i.default),__vite__mapDeps([8,5])),_e(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(i=>i.default),__vite__mapDeps([9,5]))]),T=we('["a[href=\\"#\\"]"]'),c=(i,m,{el:M,event:te})=>typeof i=="string"&&i.startsWith("/")?m.startsWith(i):typeof i=="string"?M?.matches(i)??!1:i instanceof RegExp?i.test(m):typeof i=="function"?i(m,{el:M,event:te}):Array.isArray(i)?i.some(Ge=>c(Ge,m,{el:M,event:te})):!1,N=new t({ignoreVisit:(i,{el:m,event:M}={})=>m?.closest("[data-no-swup]")||c(T,i,{el:m,event:M}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(we("{}")),new o(we('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new b(we("{}")),new y(we('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new k(we("{}"))]}),P=i=>document.dispatchEvent(new Event(i));N.hooks.before("content:replace",()=>P("astro:before-swap")),N.hooks.on("content:replace",()=>P("astro:after-swap")),N.hooks.on("page:view",()=>P("astro:page-load")),window.swup=N}yr(kr);
