const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Swup.Cz2sqVT0.js","_astro/Swup.modern.D7qINR80.js","_astro/SwupA11yPlugin.COK5EHWy.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.BmKT5rcH.js","_astro/SwupScrollPlugin.DXF80AYT.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as Te}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{$ as L,A as da,F as oe,I as la,J as o,K as y,L as Ve,M as ca,N as I,O as pa,S as V,V as e,X as l,Y as Q,Z as ua,a as fa,b as it,et as se,f as Re,g as va,h as de,it as ma,j as f,k as h,m as _a,nt as K,ot as xt,q as wa,rt as ha,st as n,t as Ge,w as ga,y as nt}from"./client.CVK8X0vf.js";var ba=`
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
}

.wid-panel__actions {
	display: flex;
	align-items: center;
	gap: 0.35rem;
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
`;function Et(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const a=document.createElement("style");a.id="wid-capsule-styles",a.textContent=ba,document.head.appendChild(a)}var U;(function(a){a[a.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",a[a.ACTIVE=1]="ACTIVE",a[a.IDLE=2]="IDLE",a[a.AWAY=3]="AWAY",a[a.OFFLINE=4]="OFFLINE"})(U||(U={}));var nr=new TextEncoder,ya=new TextDecoder,dt=class{buffer;pos=0;constructor(a){this.buffer=a}get hasMore(){return this.pos<this.buffer.length}readVarint(){let a=0n,r=0n;for(;this.pos<this.buffer.length;){const c=this.buffer[this.pos++];if(a|=BigInt(c&127)<<r,(c&128)===0)return a;if(r+=7n,r>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const a=Number(this.readVarint());return{fieldNo:a>>3,wireType:a&7}}readString(){const a=this.readBytes();return ya.decode(a)}readBytes(){const a=Number(this.readVarint());if(this.pos+a>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const r=this.buffer.subarray(this.pos,this.pos+a);return this.pos+=a,r}skip(a){switch(a){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const r=Number(this.readVarint());this.pos+=r;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${a}`)}}};function ot(a){const r=new dt(a),c={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:U.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;r.hasMore;){const N=r.readTag();if(!N)break;switch(N.fieldNo){case 1:c.timestamp=Number(r.readVarint());break;case 2:c.deviceId=r.readString();break;case 3:c.deviceName=r.readString();break;case 4:c.appName=r.readString();break;case 5:c.windowTitle=r.readString();break;case 6:c.status=Number(r.readVarint());break;case 7:c.osInfo=r.readString();break;case 8:c.idleSeconds=Number(r.readVarint());break;case 9:{const x=r.readBytes(),k=new dt(x);let S="",u="";for(;k.hasMore;){const D=k.readTag();if(!D)break;D.fieldNo===1?S=k.readString():D.fieldNo===2?u=k.readString():k.skip(D.wireType)}S&&c.metadata&&(c.metadata[S]=u);break}default:r.skip(N.wireType)}}return c}function xa(a){const r=new dt(a);let c=null;const N=[],x=[];let k=Date.now();for(;r.hasMore;){const S=r.readTag();if(!S)break;switch(S.fieldNo){case 1:c=ot(r.readBytes());break;case 2:{const u=r.readBytes();N.push(ot(u));break}case 3:{const u=r.readBytes();x.push(ot(u));break}case 4:k=Number(r.readVarint());break;default:r.skip(S.wireType)}}return{current:c,devices:N,history:x,serverTime:k}}function Ie(a,r=Date.now(),c="zh"){const N=Math.max(0,r-a),x=Math.floor(N/1e3),k=Math.floor(x/60),S=Math.floor(k/60),u=Math.floor(S/24);return c==="zh"?x<45?"刚刚":k<60?`${k}分钟前`:S<24?`${S}小时前`:u===1?"昨天":u<30?`${u}天前`:new Date(a).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):x<45?"just now":k<60?`${k}m ago`:S<24?`${S}h ago`:u===1?"yesterday":u<30?`${u}d ago`:new Date(a).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function It(a){if(!a||a<=0)return"";const r=new Date(a);return Number.isNaN(r.getTime())?"":`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")} ${String(r.getHours()).padStart(2,"0")}:${String(r.getMinutes()).padStart(2,"0")}`}function ka(a,r=Date.now(),c="zh"){if(!a||a<=0)return"";const N=It(a);if(!N)return"";const x=Ie(a,r,c);return c==="zh"?`最后活跃时间: ${N} (${x})`:`Last active: ${N} (${x})`}function Sa(a,r=Date.now(),c="zh"){if(!a?.appName)return{statusType:"offline",sentence:c==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const N=a.lastSeen??a.timestamp,x=Math.max(0,r-N),k=Math.floor(x/1e3),S=Ie(N,r,c);let u="active";a.status===U.OFFLINE||a.offline||k>259200?u="offline":a.status===U.AWAY||k>1800?u="away":(a.status===U.IDLE||k>180)&&(u="idle");const D=u==="active"&&k<120,M=a.deviceName||a.name||a.deviceId||a.id||(c==="zh"?"Linux设备":"Device");let s="";if(a.media?.title&&D){const w=a.media.artist?`${a.media.title} - ${a.media.artist}`:a.media.title;c==="zh"?s=`正在 ${M} 收听 ${w}`:s=`Listening to ${w} on ${M}`}else c==="zh"?D?s=`正在 ${M} 使用 ${a.appName}`:u==="offline"?s=`最后在使用: ${a.appName}`:s=`${S}在 ${M} 使用 ${a.appName}`:D?s=`Using ${a.appName} on ${M}`:u==="offline"?s=`Last used: ${a.appName}`:s=`${S} used ${a.appName} on ${M}`;return{statusType:u,sentence:s,appName:a.appName,deviceName:M,relativeTime:S}}var Ta=I('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ea=I('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),st=I('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),Ia=I('<span class="wid-capsule__prefix">最后使用:</span> <strong class="wid-capsule__app"> </strong> <!>',1),Na=I('<span class="wid-capsule__media-icon">🎵</span> <strong class="wid-capsule__app"> </strong> <!>',1),Da=I('<strong class="wid-capsule__app"> </strong> <!>',1),za=I("<span> </span>"),Aa=I('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> <!></span></div>'),Ca=I('<div class="wid-current-card__window-title"> </div>'),La=I('<span class="wid-current-card__last-active"> </span>'),Ma=I('<span class="wid-current-card__active-hint"> </span>'),Oa=I('<span class="wid-current-card__os-info"> </span>'),Pa=I('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <span class="wid-current-card__device"> </span></div> <!> <!> <div class="wid-current-card__footer"><!> <!></div></div>'),Fa=I('<div class="wid-panel__empty">正在获取设备状态...</div>'),qa=I('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),Va=I('<div class="wid-panel__empty">当前暂无已登记设备</div>'),kt=I('<span class="wid-device-card__sep">·</span> <span class="wid-device-card__win-title"> </span>',1),Ra=I('<span class="wid-device-card__abs-time"> </span>'),Ba=I('<div class="wid-device-card__app"><span class="wid-device-card__muted-label">最后使用:</span> <span class="wid-device-card__app-title"> </span> <!></div> <div class="wid-device-card__time"> <!></div>',1),$a=I('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span> <!></div> <div class="wid-device-card__time"><!></div>',1),Ua=I('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),Wa=I('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),Ha=I('<div class="wid-timeline__title"> </div>'),ja=I('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> </span> <span class="wid-timeline__time"> </span></div> <!> <div class="wid-timeline__device"> </div></div></li>'),Ya=I('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),Ga=I('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button" class="wid-panel__btn wid-panel__btn--refresh" aria-label="手动刷新状态" title="手动刷新"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),Ka=I('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function Ja(a,r){ma(r,!0),Et();let c=Ge(r,"endpoint",3,"/api/activity"),N=Ge(r,"maxHistoryDisplay",3,5),x=Ge(r,"refreshInterval",3,0),k=Ge(r,"class",3,"");const S=K(()=>Array.isArray(c())?c().map(i=>i.trim()).filter(Boolean):typeof c()=="string"?c().split(",").map(i=>i.trim()).filter(Boolean):["/api/activity"]);let u=se(null),D=se(!1),M=se(!1),s=se(null),w=se(!1),P=se(ua(Date.now())),ee=se(null),Ne=se(!1),fe=se(0),Ue=se(0);const t=K(()=>e(u)?.current??null),d=K(()=>e(u)?.devices??[]),v=K(()=>e(u)?.history??[]),g=K(()=>!e(u)&&e(D)),$=K(()=>!e(u)&&!e(D)&&!!e(s)),T=K(()=>{if(!e(u)||!e(t))return!1;if(e(t).offline||e(t).status===U.OFFLINE)return!0;const i=e(t).lastSeen??e(t).timestamp;return!!(i&&e(P)-i>12e4)}),ce=K(()=>{if(!e(T))return"";const i=e(t)?.lastSeen??e(t)?.timestamp??0;return ka(i,e(P),"zh")}),We=K(()=>Sa(e(t),e(P),"zh")),Nt=K(()=>{if(e(T))return"离线";switch(e(We).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),lt={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},ct=K(()=>{const i=e(d).length>0?e(d):e(t)?[e(t)]:[],m={desktop:[],laptop:[],server:[],other:[]};for(const _ of i){const z=(_.type||"desktop").toLowerCase();z==="desktop"?m.desktop.push(_):z==="laptop"?m.laptop.push(_):z==="server"?m.server.push(_):m.other.push(_)}return["desktop","laptop","server","other"].filter(_=>m[_].length>0).map(_=>({key:_,label:lt[_]?.label??_,icon:lt[_]?.icon??"💻",devices:m[_]}))}),pt=K(()=>e(d).filter(i=>!i.offline&&i.status!==U.OFFLINE&&e(P)-(i.lastSeen??i.timestamp)<=12e4).length),Dt=K(()=>e(v).slice(0,N()));let De=null;async function ge(i=!1){if(e(D)&&!i)return;i&&De&&De.abort(),L(D,!0),i&&L(M,!0);const m=new AbortController;De=m;const _=setTimeout(()=>m.abort(),9e3);try{L(s,null);let z=!1,W=null;for(const ie of e(S)){if(m.signal.aborted)break;try{const E=await fetch(ie,{signal:m.signal});if(!E.ok){W=new Error(`HTTP ${E.status}`);continue}const G=E.headers.get("content-type")??"";if(G.includes("application/x-protobuf")){const H=await E.arrayBuffer();L(u,xa(new Uint8Array(H)),!0),z=!0;break}else if(G.includes("application/json")||G.includes("text/plain")){const H=await E.text();try{const J=JSON.parse(H);if(J&&(J.current!==void 0||J.devices!==void 0||J.serverTime!==void 0)){L(u,J,!0),z=!0;break}}catch{continue}}}catch(E){if(E?.name==="AbortError"){W=E;break}W=E;continue}}z?(L(P,Date.now(),!0),L(s,null)):W?.name==="AbortError"?L(s,"连接状态服务器超时，请点击重试"):L(s,"无法连接至状态服务器")}catch(z){z?.name==="AbortError"?L(s,"连接状态服务器超时，请点击重试"):L(s,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",z)}finally{clearTimeout(_),De===m&&(De=null),L(D,!1),L(M,!1)}}let ze=null;function ut(){x()>0&&!ze&&(ze=setInterval(()=>{document.visibilityState==="visible"&&ge()},x()))}function zt(){ze&&(clearInterval(ze),ze=null)}function ft(){if(typeof window>"u"||(L(Ne,window.innerWidth<768),!e(ee)))return;const i=e(ee).getBoundingClientRect();L(fe,Math.round(i.left+i.width/2),!0),L(fe,Math.max(210,Math.min(window.innerWidth-210,e(fe))),!0),L(Ue,Math.round(window.innerHeight-i.top),!0)}function At(){L(w,!e(w)),e(w)&&(L(P,Date.now(),!0),ft(),!e(u)&&!e(D)&&ge())}function Ct(i){i.stopPropagation(),ge(!0)}function Lt(i){return document.body.appendChild(i),{destroy(){i.parentNode&&i.parentNode.removeChild(i)}}}wa(()=>{if(!(typeof document>"u")&&e(w)){const i=document.body.style.overflow,m=document.body.style.paddingRight,_=window.innerWidth-document.documentElement.clientWidth;return _>0&&(document.body.style.paddingRight=`${_}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=i,document.body.style.paddingRight=m}}}),ga(()=>{let i=null;typeof IntersectionObserver<"u"&&e(ee)?(i=new IntersectionObserver(z=>{for(const W of z)if(W.isIntersecting){ge(),ut(),i?.disconnect(),i=null;break}},{rootMargin:"60px"}),i.observe(e(ee))):(ge(),ut());const m=()=>{e(w)&&ft()},_=z=>{z.key==="Escape"&&e(w)&&L(w,!1)};return window.addEventListener("resize",m),window.addEventListener("keydown",_),()=>{zt(),i&&i.disconnect(),window.removeEventListener("resize",m),window.removeEventListener("keydown",_)}});var vt=Ka(),Ae=Q(vt),Ce=o(Ae),mt=o(Ce);let _t;var Je=l(mt,2),Mt=o(Je),Ot=i=>{var m=Ta();xt(2),f(i,m)},Pt=i=>{var m=Ea();xt(2),f(i,m)},Ft=i=>{var m=Ia(),_=l(Q(m),2),z=o(_,!0);n(_);var W=l(_,2),ie=E=>{var G=st(),H=l(Q(G),2),J=o(H,!0);n(H),y(()=>h(J,e(ce))),f(E,G)};V(W,E=>{e(ce)&&E(ie)}),y(()=>h(z,e(t)?.appName||"离线")),f(i,m)},qt=i=>{var m=Na(),_=l(Q(m),2),z=o(_,!0);n(_);var W=l(_,2),ie=E=>{var G=st(),H=l(Q(G),2),J=o(H,!0);n(H),y(()=>h(J,e(t).media.artist)),f(E,G)};V(W,E=>{e(t).media.artist&&E(ie)}),y(()=>h(z,e(t).media.title)),f(i,m)},Vt=i=>{var m=Da(),_=Q(m),z=o(_,!0);n(_);var W=l(_,2),ie=E=>{var G=st(),H=l(Q(G),2),J=o(H,!0);n(H),y(()=>h(J,e(t).windowTitle)),f(E,G)};V(W,E=>{e(t).windowTitle&&e(t).windowTitle!==e(t).appName&&E(ie)}),y(()=>h(z,e(t).appName)),f(i,m)},Rt=i=>{var m=za(),_=o(m,!0);n(m),y(()=>h(_,e(Nt))),f(i,m)};V(Mt,i=>{e(g)?i(Ot):e($)?i(Pt,1):e(T)?i(Ft,2):e(t)?.media?.title?i(qt,3):e(t)?.appName?i(Vt,4):i(Rt,-1)}),n(Je);var Bt=l(Je,2);let wt;n(Ce),n(Ae),fa(Ae,i=>L(ee,i),()=>e(ee));var $t=l(Ae,2),Ut=i=>{var m=Ga(),_=o(m),z=l(_,2),W=l(o(z),2),ie=l(o(W),2),E=o(ie),G=o(E);let H;n(E);var J=l(E,2);n(ie),n(W);var Xe=l(W,2),ht=o(Xe),Wt=b=>{var A=Pa();let te;var le=o(A),F=o(le);let ne;var pe=o(F,!0);n(F);var ae=l(F,2),ve=o(ae,!0);n(ae);var ue=l(ae,2),be=o(ue);n(ue),n(le);var me=l(le,2),ye=q=>{var C=Aa(),X=l(o(C),2),Se=o(X,!0),Oe=l(Se),He=Pe=>{var je=oe();y(()=>h(je,`— ${e(t).media.artist??""}`)),f(Pe,je)};V(Oe,Pe=>{e(t).media.artist&&Pe(He)}),n(X),n(C),y(()=>h(Se,e(t).media.title)),f(q,C)};V(me,q=>{e(t).media?.title&&!e(T)&&q(ye)});var _e=l(me,2),xe=q=>{var C=Ca(),X=o(C);n(C),y(()=>{Re(C,"title",e(t).windowTitle),h(X,`"${e(t).windowTitle??""}"`)}),f(q,C)};V(_e,q=>{e(t).windowTitle&&e(t).windowTitle!==e(t).appName&&q(xe)});var p=l(_e,2),R=o(p),re=q=>{var C=La(),X=o(C,!0);n(C),y(Se=>h(X,Se),[()=>e(ce)||`最后活跃: ${Ie(e(t).lastSeen??e(t).timestamp,e(P),"zh")}`]),f(q,C)},ke=q=>{var C=Ma(),X=o(C);n(C),y(()=>h(X,`🟢 活跃于 ${(e(t).deviceName||e(t).name||e(t).deviceId)??""}`)),f(q,C)};V(R,q=>{e(T)?q(re):q(ke,-1)});var Le=l(R,2),Me=q=>{var C=Oa(),X=o(C,!0);n(C),y(()=>h(X,e(t).osInfo)),f(q,C)};V(Le,q=>{e(t).osInfo&&q(Me)}),n(p),n(A),y(()=>{te=de(A,1,"wid-current-card",null,te,{"wid-current-card--offline":e(T)}),ne=de(F,1,"wid-tag",null,ne,{"wid-tag--primary":!e(T),"wid-tag--muted":e(T)}),h(pe,e(T)?"最后使用":"当前活跃"),h(ve,e(t).appName||"未知应用"),h(be,`@${(e(t).deviceName||e(t).name||e(t).deviceId)??""}`)}),f(b,A)};V(ht,b=>{e(t)&&b(Wt)});var Ze=l(ht,2),Ht=o(Ze),jt=b=>{var A=Fa();f(b,A)},Yt=b=>{var A=qa(),te=o(A),le=o(te,!0);n(te);var F=l(te,2);n(A),y(()=>h(le,e(s))),Ve("click",F,()=>ge(!0)),f(b,A)},Gt=b=>{var A=Va();f(b,A)},Kt=b=>{var A=ca(),te=Q(A);nt(te,17,()=>e(ct),it,(le,F)=>{var ne=Wa(),pe=o(ne),ae=o(pe),ve=o(ae,!0);n(ae);var ue=l(ae,2),be=o(ue,!0);n(ue);var me=l(ue,2),ye=o(me,!0);n(me),n(pe);var _e=l(pe,2);nt(_e,21,()=>e(F).devices,it,(xe,p)=>{const R=K(()=>e(p).offline||e(p).status===U.OFFLINE||e(P)-(e(p).lastSeen??e(p).timestamp)>12e4);var re=Ua();let ke;var Le=o(re),Me=o(Le),q=o(Me);let C;var X=l(q,2),Se=o(X,!0);n(X),n(Me);var Oe=l(Me,2);let He;var Pe=o(Oe),je=O=>{var j=oe("离线");f(O,j)},ta=O=>{var j=oe("正在活跃");f(O,j)},aa=O=>{var j=oe("空闲");f(O,j)},ra=O=>{var j=oe("离开");f(O,j)},ia=O=>{var j=oe("在线");f(O,j)};V(Pe,O=>{e(R)?O(je):e(p).status===U.ACTIVE?O(ta,1):e(p).status===U.IDLE?O(aa,2):e(p).status===U.AWAY?O(ra,3):O(ia,-1)}),n(Oe),n(Le);var yt=l(Le,2),na=o(yt),oa=O=>{var j=Ba(),we=Q(j),he=l(o(we),2),Qe=o(he,!0);n(he);var et=l(he,2),tt=B=>{var Y=kt(),Z=l(Q(Y),2),qe=o(Z,!0);n(Z),y(()=>{Re(Z,"title",e(p).windowTitle),h(qe,e(p).windowTitle)}),f(B,Y)};V(et,B=>{e(p).windowTitle&&e(p).windowTitle!==e(p).appName&&B(tt)}),n(we);var Fe=l(we,2),Ye=o(Fe),at=l(Ye),rt=B=>{var Y=Ra(),Z=o(Y);n(Y),y(qe=>h(Z,`(${qe??""})`),[()=>It(e(p).lastSeen??e(p).timestamp)]),f(B,Y)};V(at,B=>{(e(p).lastSeen||e(p).timestamp)&&B(rt)}),n(Fe),y(B=>{h(Qe,e(p).appName||"无记录"),h(Ye,`最后活跃: ${B??""} `)},[()=>Ie(e(p).lastSeen??e(p).timestamp,e(P),"zh")]),f(O,j)},sa=O=>{var j=$a(),we=Q(j),he=o(we),Qe=o(he,!0);n(he);var et=l(he,2),tt=B=>{var Y=kt(),Z=l(Q(Y),2),qe=o(Z,!0);n(Z),y(()=>{Re(Z,"title",e(p).windowTitle),h(qe,e(p).windowTitle)}),f(B,Y)};V(et,B=>{e(p).windowTitle&&e(p).windowTitle!==e(p).appName&&B(tt)}),n(we);var Fe=l(we,2),Ye=o(Fe),at=B=>{var Y=oe();y(Z=>h(Y,`已空闲 ${Z??""} 分钟`),[()=>Math.floor(e(p).idleSeconds/60)]),f(B,Y)},rt=B=>{var Y=oe();y(Z=>h(Y,`活跃于 ${Z??""}`),[()=>Ie(e(p).lastSeen??e(p).timestamp,e(P),"zh")]),f(B,Y)};V(Ye,B=>{e(p).status===U.IDLE&&e(p).idleSeconds&&e(p).idleSeconds>60?B(at):B(rt,-1)}),n(Fe),y(()=>h(Qe,e(p).appName||"活动中")),f(O,j)};V(na,O=>{e(R)?O(oa):O(sa,-1)}),n(yt),n(re),y(()=>{ke=de(re,1,"wid-device-card",null,ke,{"wid-device-card--offline":e(R),"wid-device-card--active":!e(R)&&e(p).status===U.ACTIVE}),C=de(q,1,"wid-device-card__dot",null,C,{"wid-device-card__dot--active":!e(R)&&e(p).status===U.ACTIVE,"wid-device-card__dot--idle":!e(R)&&e(p).status===U.IDLE,"wid-device-card__dot--away":!e(R)&&e(p).status===U.AWAY,"wid-device-card__dot--offline":e(R)}),h(Se,e(p).name||e(p).deviceName||e(p).id||e(p).deviceId),He=de(Oe,1,"wid-device-card__badge",null,He,{"wid-device-card__badge--active":!e(R)&&e(p).status===U.ACTIVE,"wid-device-card__badge--idle":!e(R)&&e(p).status===U.IDLE,"wid-device-card__badge--offline":e(R)})}),f(xe,re)}),n(_e),n(ne),y(()=>{h(ve,e(F).icon),h(be,e(F).label),h(ye,e(F).devices.length)}),f(le,ne)}),f(b,A)};V(Ht,b=>{e(D)&&!e(u)?b(jt):e(s)&&!e(u)?b(Yt,1):e(ct).length===0?b(Gt,2):b(Kt,-1)}),n(Ze);var Jt=l(Ze,2),Xt=b=>{var A=Ya(),te=l(o(A),2);nt(te,21,()=>e(Dt),it,(le,F)=>{var ne=ja(),pe=l(o(ne),2),ae=o(pe),ve=o(ae),ue=o(ve,!0);n(ve);var be=l(ve,2),me=o(be,!0);n(be),n(ae);var ye=l(ae,2),_e=R=>{var re=Ha(),ke=o(re,!0);n(re),y(()=>{Re(re,"title",e(F).windowTitle),h(ke,e(F).windowTitle)}),f(R,re)};V(ye,R=>{e(F).windowTitle&&e(F).windowTitle!==e(F).appName&&R(_e)});var xe=l(ye,2),p=o(xe,!0);n(xe),n(pe),n(ne),y(R=>{h(ue,e(F).appName),h(me,R),h(p,e(F).deviceName||e(F).name)},[()=>Ie(e(F).timestamp,e(P),"zh")]),f(le,ne)}),n(te),n(A),f(b,A)};V(Jt,b=>{e(v).length>0&&b(Xt)}),n(Xe);var gt=l(Xe,2),bt=l(o(gt),2),Zt=o(bt),Qt=b=>{var A=oe();y(()=>h(A,`🟢 ${e(pt)??""} 台在线 · 按需刷新`)),f(b,A)},ea=b=>{var A=oe("⚪ 全设备离线 · 按需刷新");f(b,A)};V(Zt,b=>{e(pt)>0?b(Qt):b(ea,-1)}),n(bt),n(gt),n(z),n(m),va(m,b=>Lt?.(b)),y(()=>{_a(z,`--anchor-bottom: ${e(Ue)}px; --anchor-left: ${e(fe)}px;`),E.disabled=e(M),H=de(G,0,"wid-panel__refresh-icon",null,H,{"wid-panel__refresh-icon--spin":e(M)})}),Ve("click",_,()=>L(w,!1)),Ve("click",E,Ct),Ve("click",J,()=>L(w,!1)),f(i,m)};V($t,i=>{e(w)&&i(Ut)}),y(()=>{de(Ae,1,`wid-capsule-wrapper ${k()}`),de(Ce,1,`wid-capsule wid-capsule--${e(g)?"loading":e($)?"error":e(T)?"offline":e(We).statusType}`),Re(Ce,"aria-expanded",e(w)),_t=de(mt,1,"wid-capsule__dot",null,_t,{"wid-capsule__dot--pulse":e(g),"wid-capsule__dot--active":!e(T)&&!e(g)&&!e($)&&e(We).statusType==="active","wid-capsule__dot--idle":!e(T)&&!e(g)&&!e($)&&e(We).statusType==="idle","wid-capsule__dot--offline":e(T)||e($)}),wt=de(Bt,0,"wid-capsule__chevron",null,wt,{"wid-capsule__chevron--open":e(w)})}),Ve("click",Ce,At),f(a,vt),ha()}la(["click"]);var Be=null,$e=null;function Xa(a={}){if(typeof window>"u"||typeof document>"u")return;Et();const r={endpoint:a.endpoint||"/api/activity",maxHistoryDisplay:a.maxHistoryDisplay??5,refreshInterval:a.refreshInterval??0,targetSelector:a.targetSelector||'a[aria-label="Go to About Page"]',position:a.position||"beforebegin",routeFilter:a.routeFilter};let c=0;const N=25;let x=null;function k(){if(!r.routeFilter||r.routeFilter.length===0)return!0;const s=window.location.pathname.toLowerCase();return r.routeFilter.some(w=>s.startsWith(w.toLowerCase()))}function S(){if(x&&(clearTimeout(x),x=null),!k()){u();return}if(document.querySelector(".wid-mounted-portal"))return;const s=document.querySelector(r.targetSelector);if(!s?.parentElement){c<N&&(c++,x=setTimeout(S,80));return}c=0;const w=document.createElement("div");w.className="wid-mounted-portal",w.style.width="100%",w.style.display="flex",w.style.justifyContent="center",s.insertAdjacentElement(r.position,w);try{Be=pa(Ja,{target:w,props:{endpoint:r.endpoint,maxHistoryDisplay:r.maxHistoryDisplay,refreshInterval:r.refreshInterval}}),$e=w}catch(P){console.error("[what-im-doing] Failed to mount Svelte capsule:",P),w.remove(),$e=null}}function u(){if(x&&(clearTimeout(x),x=null),c=0,Be){try{da(Be)}catch{}Be=null}$e&&($e.remove(),$e=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",S):S();const D=window.swup,M=()=>{k()?(!document.querySelector(".wid-mounted-portal")||!Be)&&(u(),c=0,S()):u()};D?.hooks?D.hooks.on("page:view",M):document.addEventListener("swup:contentReplaced",M)}function Ke(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,Xa(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>Ke()),window.__WHAT_IM_DOING_CONFIG__?Ke():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>Ke()):setTimeout(Ke,0));function Ee(a){return JSON.parse(a,Za)}function Za(a,r){if(Array.isArray(r)&&r.length===2&&typeof r[1]=="string"){const c=r[0];if(r=r[1],c===":regex:"){const N=r.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(N[1],N[2]||"")}if(c===":function:")return new Function(`return (${r}).apply(this, arguments);`)}return r}function St(a,{timeoutFallback:r=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>a()):setTimeout(()=>a(),r)}function Qa(a){document.readyState==="complete"?setTimeout(()=>a(),0):window.addEventListener("load",()=>a())}function er(a,{delayAfterLoad:r=0}={}){Qa(()=>{r>0?setTimeout(()=>St(a),r):St(a)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"/api/activity, https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));var Tt=(()=>{var a=Object.defineProperty,r=Object.getOwnPropertyDescriptor,c=Object.getOwnPropertyNames,N=Object.prototype.hasOwnProperty,x=(t,d)=>{for(var v in d)a(t,v,{get:d[v],enumerable:!0})},k=(t,d,v,g)=>{if(d&&typeof d=="object"||typeof d=="function")for(let $ of c(d))!N.call(t,$)&&$!==v&&a(t,$,{get:()=>d[$],enumerable:!(g=r(d,$))||g.enumerable});return t},S=t=>k(a({},"__esModule",{value:!0}),t),u={};x(u,{initUmamiRuntime:()=>Ue});var D="x-umami-share-context";async function M(t,d,v=1e4){let g=new AbortController,$=setTimeout(()=>g.abort(),v);try{return await fetch(t,{...d,signal:g.signal})}catch(T){throw T instanceof DOMException&&T.name==="AbortError"?new Error(`[oddmisc] 请求超时 (${v}ms): ${t}`):T}finally{clearTimeout($)}}function s(t){return typeof t=="number"?t:t&&typeof t.value=="number"?t.value:0}function w(t){let d=new URL(t),v=d.pathname.split("/"),g=v.indexOf("share");if(g===-1||g===v.length-1)throw new Error("无效的分享 URL：未找到 share 路径");let $=v[g+1];if(!$)throw new Error("无效的分享 URL：缺少分享 ID");let T=v.slice(0,g).join("/");return{apiBase:`${d.protocol}//${d.host}${T}/api`,shareId:$}}function P(){return Math.floor(Date.now()/3e5)*3e5}var ee=class{constructor(t,d,v=100){this.storageKey=t,this.ttl=d,this.maxEntries=v,this.cache=new Map,this.loadFromStorage()}loadFromStorage(){try{let t=localStorage.getItem(this.storageKey);if(!t)return;let d=JSON.parse(t);for(let[v,g]of Object.entries(d))g&&typeof g.timestamp=="number"&&!this.isExpired(g.timestamp)&&this.cache.set(v,g)}catch{}}saveToStorage(){try{let t={};this.cache.forEach((d,v)=>{t[v]=d}),localStorage.setItem(this.storageKey,JSON.stringify(t))}catch{}}isExpired(t){return Date.now()-t>=this.ttl}evictIfNeeded(){if(this.cache.size<=this.maxEntries)return;let t=[...this.cache.entries()].sort((v,g)=>v[1].timestamp-g[1].timestamp),d=t.length-this.maxEntries;for(let v=0;v<d;v++)this.cache.delete(t[v][0]);this.saveToStorage()}get(t){let d=this.cache.get(t);return d&&!this.isExpired(d.timestamp)?d.value:(d&&(this.cache.delete(t),this.saveToStorage()),null)}set(t,d){this.cache.set(t,{value:d,timestamp:Date.now()}),this.saveToStorage(),this.evictIfNeeded()}clear(){this.cache.clear();try{localStorage.removeItem(this.storageKey)}catch{}}},Ne=class{constructor(t){if(this.shareData=null,this.sharePromise=null,!t.shareUrl)throw new Error("shareUrl 是必需参数");let{apiBase:d,shareId:v}=w(t.shareUrl);this.apiBase=d,this.shareId=v,this.cache=new ee(`umami-runtime-${v}`,36e5)}async getShareData(){return this.shareData?this.shareData:this.sharePromise?this.sharePromise:(this.sharePromise=(async()=>{let t=await M(`${this.apiBase}/share/${this.shareId}`);if(!t.ok)throw this.shareData=null,this.sharePromise=null,new Error(`获取分享信息失败: ${t.status}`);let d=await t.json();return this.shareData=d,d})(),this.sharePromise)}async authedFetch(t){let{websiteId:d,token:v}=await this.getShareData(),g=await M(`${this.apiBase}/websites/${d}${t}`,{headers:{"x-umami-share-token":v,[D]:"1"}});if(!g.ok)throw g.status===401&&(this.shareData=null,this.sharePromise=null),new Error(`请求 ${t} 失败: ${g.status}`);return await g.json()}async getStats(t){let d=P(),v=`${t?`stats-${t}`:"stats-site"}-${d}`,g=this.cache.get(v);if(g)return{...g,_fromCache:!0};let $=new URLSearchParams({startAt:"0",endAt:d.toString()});t&&$.set("path",`eq.${t}`);let T=await this.authedFetch(`/stats?${$.toString()}`),ce={pageviews:s(T.pageviews),visitors:s(T.visitors),visits:s(T.visits)};return T.bounces!==void 0&&(ce.bounces=s(T.bounces)),T.totaltime!==void 0&&(ce.totaltime=s(T.totaltime)),this.cache.set(v,ce),ce}getSiteStats(){return this.getStats()}getPageStats(t){return this.getStats(t)}async getActiveVisitors(){let t=await this.authedFetch("/active");return typeof t?.visitors=="number"?t.visitors:0}clearCache(){this.cache.clear(),this.shareData=null,this.sharePromise=null}};function fe(){let t=()=>Promise.resolve({pageviews:0,visitors:0,visits:0});window.oddmisc={getStats:t,getSiteStats:t,getPageStats:t,getActiveVisitors:()=>Promise.resolve(0),clearCache:()=>{}}}function Ue(t){if(!t.shareUrl)console.log("[oddmisc] shareUrl 未配置，跳过初始化"),fe();else try{let d=new Ne(t);window.oddmisc={umami:d,getStats:v=>d.getStats(v),getSiteStats:()=>d.getSiteStats(),getPageStats:v=>d.getPageStats(v),getActiveVisitors:()=>d.getActiveVisitors(),clearCache:()=>d.clearCache()},console.log("[oddmisc] Umami runtime client initialized")}catch(d){console.warn("[oddmisc] 初始化失败:",d instanceof Error?d.message:d),fe()}window.dispatchEvent(new CustomEvent("oddmisc-ready",{detail:{client:window.oddmisc}}))}return S(u)})();typeof window<"u"&&typeof Tt<"u"&&Tt.initUmamiRuntime({shareUrl:"https://cloud.umami.is/analytics/eu/share/BywgdGzJ6ra6T7Pb"});async function tr(){const[a,r,c,N,x,k]=await Promise.all([Te(()=>import("./Swup.Cz2sqVT0.js").then(s=>s.default),__vite__mapDeps([0,1])),Te(()=>import("./SwupA11yPlugin.COK5EHWy.js").then(s=>s.default),__vite__mapDeps([2,1,3])),Te(()=>import("./SwupPreloadPlugin.BmKT5rcH.js").then(s=>s.default),__vite__mapDeps([4,1,3])),Te(()=>import("./SwupScrollPlugin.DXF80AYT.js").then(s=>s.default),__vite__mapDeps([5,1,3])),Te(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(s=>s.default),__vite__mapDeps([6,3])),Te(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(s=>s.default),__vite__mapDeps([7,3]))]),S=Ee('"a[href=\\"#\\"]"'),u=(s,w,{el:P,event:ee})=>typeof s=="string"&&s.startsWith("/")?w.startsWith(s):typeof s=="string"?P?.matches(s)??!1:s instanceof RegExp?s.test(w):typeof s=="function"?s(w,{el:P,event:ee}):Array.isArray(s)?s.some(Ne=>u(Ne,w,{el:P,event:ee})):!1,D=new a({ignoreVisit:(s,{el:w,event:P}={})=>w?.closest("[data-no-swup]")||u(S,s,{el:w,event:P}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new r(Ee("{}")),new c(Ee('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new N(Ee("{}")),new x(Ee('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new k(Ee("{}"))]}),M=s=>document.dispatchEvent(new Event(s));D.hooks.before("content:replace",()=>M("astro:before-swap")),D.hooks.on("content:replace",()=>M("astro:after-swap")),D.hooks.on("page:view",()=>M("astro:page-load")),window.swup=D}er(tr);
