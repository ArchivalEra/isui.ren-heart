const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/Swup.Cz2sqVT0.js","_astro/Swup.modern.D7qINR80.js","_astro/SwupA11yPlugin.COK5EHWy.js","_astro/index.modern.DGWg1a9q.js","_astro/SwupPreloadPlugin.BmKT5rcH.js","_astro/SwupScrollPlugin.DXF80AYT.js","_astro/SwupHeadPlugin.CJV9x5S0.js","_astro/SwupScriptsPlugin.KOkp8JHL.js"])))=>i.map(i=>d[i]);
import{t as Ie}from"./preload-helper.DLd7ZaJy.js";import"./disclose-version.DwdwGuwu.js";import{$ as O,A as sa,F as ie,I as da,J as o,K as k,L as Re,M as la,N as E,O as ca,S as q,V as e,X as l,Y as X,Z as pa,a as ua,b as rt,et as ne,f as $e,g as fa,h as oe,it as va,j as v,k as b,m as _a,nt as J,ot as yt,q as ma,rt as wa,st as i,t as Ye,w as ha,y as it}from"./client.CVK8X0vf.js";var ga=`
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
`;function Tt(){if(typeof document>"u"||document.getElementById("wid-capsule-styles"))return;const t=document.createElement("style");t.id="wid-capsule-styles",t.textContent=ga,document.head.appendChild(t)}var $;(function(t){t[t.ACTIVITY_STATUS_UNKNOWN=0]="ACTIVITY_STATUS_UNKNOWN",t[t.ACTIVE=1]="ACTIVE",t[t.IDLE=2]="IDLE",t[t.AWAY=3]="AWAY",t[t.OFFLINE=4]="OFFLINE"})($||($={}));var ir=new TextEncoder,ba=new TextDecoder,st=class{buffer;pos=0;constructor(t){this.buffer=t}get hasMore(){return this.pos<this.buffer.length}readVarint(){let t=0n,a=0n;for(;this.pos<this.buffer.length;){const u=this.buffer[this.pos++];if(t|=BigInt(u&127)<<a,(u&128)===0)return t;if(a+=7n,a>=64n)throw new Error("Varint overflow while decoding Protobuf")}throw new Error("Unexpected EOF reading Varint")}readTag(){if(!this.hasMore)return null;const t=Number(this.readVarint());return{fieldNo:t>>3,wireType:t&7}}readString(){const t=this.readBytes();return ba.decode(t)}readBytes(){const t=Number(this.readVarint());if(this.pos+t>this.buffer.length)throw new Error("Buffer underflow reading length-delimited bytes");const a=this.buffer.subarray(this.pos,this.pos+t);return this.pos+=t,a}skip(t){switch(t){case 0:this.readVarint();break;case 1:this.pos+=8;break;case 2:{const a=Number(this.readVarint());this.pos+=a;break}case 5:this.pos+=4;break;default:throw new Error(`Unsupported wire type: ${t}`)}}};function nt(t){const a=new st(t),u={timestamp:0,deviceId:"",deviceName:"",appName:"",windowTitle:"",status:$.ACTIVITY_STATUS_UNKNOWN,osInfo:"",idleSeconds:0,metadata:{}};for(;a.hasMore;){const N=a.readTag();if(!N)break;switch(N.fieldNo){case 1:u.timestamp=Number(a.readVarint());break;case 2:u.deviceId=a.readString();break;case 3:u.deviceName=a.readString();break;case 4:u.appName=a.readString();break;case 5:u.windowTitle=a.readString();break;case 6:u.status=Number(a.readVarint());break;case 7:u.osInfo=a.readString();break;case 8:u.idleSeconds=Number(a.readVarint());break;case 9:{const S=a.readBytes(),T=new st(S);let m="",_="";for(;T.hasMore;){const C=T.readTag();if(!C)break;C.fieldNo===1?m=T.readString():C.fieldNo===2?_=T.readString():T.skip(C.wireType)}m&&u.metadata&&(u.metadata[m]=_);break}default:a.skip(N.wireType)}}return u}function ya(t){const a=new st(t);let u=null;const N=[],S=[];let T=Date.now();for(;a.hasMore;){const m=a.readTag();if(!m)break;switch(m.fieldNo){case 1:u=nt(a.readBytes());break;case 2:{const _=a.readBytes();N.push(nt(_));break}case 3:{const _=a.readBytes();S.push(nt(_));break}case 4:T=Number(a.readVarint());break;default:a.skip(m.wireType)}}return{current:u,devices:N,history:S,serverTime:T}}function Ne(t,a=Date.now(),u="zh"){const N=Math.max(0,a-t),S=Math.floor(N/1e3),T=Math.floor(S/60),m=Math.floor(T/60),_=Math.floor(m/24);return u==="zh"?S<45?"刚刚":T<60?`${T}分钟前`:m<24?`${m}小时前`:_===1?"昨天":_<30?`${_}天前`:new Date(t).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):S<45?"just now":T<60?`${T}m ago`:m<24?`${m}h ago`:_===1?"yesterday":_<30?`${_}d ago`:new Date(t).toLocaleDateString("en-US",{month:"short",day:"numeric"})}function It(t){if(!t||t<=0)return"";const a=new Date(t);return Number.isNaN(a.getTime())?"":`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")} ${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`}function xa(t,a=Date.now(),u="zh"){if(!t||t<=0)return"";const N=It(t);if(!N)return"";const S=Ne(t,a,u);return u==="zh"?`最后活跃时间: ${N} (${S})`:`Last active: ${N} (${S})`}function ka(t,a=Date.now(),u="zh"){if(!t?.appName)return{statusType:"offline",sentence:u==="zh"?"当前无活跃设备":"No active device",appName:"",deviceName:"",relativeTime:""};const N=t.lastSeen??t.timestamp,S=Math.max(0,a-N),T=Math.floor(S/1e3),m=Ne(N,a,u);let _="active";t.status===$.OFFLINE||t.offline||T>259200?_="offline":t.status===$.AWAY||T>1800?_="away":(t.status===$.IDLE||T>180)&&(_="idle");const C=_==="active"&&T<120,D=t.deviceName||t.name||t.deviceId||t.id||(u==="zh"?"Linux设备":"Device");let n="";if(t.media?.title&&C){const g=t.media.artist?`${t.media.title} - ${t.media.artist}`:t.media.title;u==="zh"?n=`正在 ${D} 收听 ${g}`:n=`Listening to ${g} on ${D}`}else u==="zh"?C?n=`正在 ${D} 使用 ${t.appName}`:_==="offline"?n=`最后在使用: ${t.appName}`:n=`${m}在 ${D} 使用 ${t.appName}`:C?n=`Using ${t.appName} on ${D}`:_==="offline"?n=`Last used: ${t.appName}`:n=`${m} used ${t.appName} on ${D}`;return{statusType:_,sentence:n,appName:t.appName,deviceName:D,relativeTime:m}}var Sa=E('<span class="wid-capsule__prefix">同步中:</span> <strong class="wid-capsule__app">正在连接状态...</strong>',1),Ta=E('<span class="wid-capsule__prefix">状态:</span> <strong class="wid-capsule__app">点击查看详情</strong>',1),ot=E('<span class="wid-capsule__sep">·</span> <span class="wid-capsule__title"> </span>',1),Ia=E('<span class="wid-capsule__prefix">最后使用:</span> <strong class="wid-capsule__app"> </strong> <!>',1),Ea=E('<span class="wid-capsule__media-icon">🎵</span> <strong class="wid-capsule__app"> </strong> <!>',1),Na=E('<strong class="wid-capsule__app"> </strong> <!>',1),Da=E("<span> </span>"),za=E('<div class="wid-current-card__media"><span class="wid-current-card__media-icon">🎵</span> <span class="wid-current-card__media-text"> <!></span></div>'),Aa=E('<div class="wid-current-card__window-title"> </div>'),Ca=E('<span class="wid-current-card__last-active"> </span>'),La=E('<span class="wid-current-card__active-hint"> </span>'),Ma=E('<span class="wid-current-card__os-info"> </span>'),Oa=E('<div><div class="wid-current-card__head"><span> </span> <strong class="wid-current-card__appname"> </strong> <span class="wid-current-card__device"> </span></div> <!> <!> <div class="wid-current-card__footer"><!> <!></div></div>'),Pa=E('<div class="wid-panel__empty">正在获取设备状态...</div>'),Fa=E('<div class="wid-panel__empty wid-panel__empty--error"><span> </span> <button type="button" class="wid-panel__retry-btn">点击重试</button></div>'),qa=E('<div class="wid-panel__empty">当前暂无已登记设备</div>'),xt=E('<span class="wid-device-card__sep">·</span> <span class="wid-device-card__win-title"> </span>',1),Va=E('<span class="wid-device-card__abs-time"> </span>'),Ra=E('<div class="wid-device-card__app"><span class="wid-device-card__muted-label">最后使用:</span> <span class="wid-device-card__app-title"> </span> <!></div> <div class="wid-device-card__time"> <!></div>',1),$a=E('<div class="wid-device-card__app"><span class="wid-device-card__app-title"> </span> <!></div> <div class="wid-device-card__time"><!></div>',1),Ba=E('<div><div class="wid-device-card__head"><div class="wid-device-card__name-wrapper"><span></span> <span class="wid-device-card__name"> </span></div> <span><!></span></div> <div class="wid-device-card__body"><!></div></div>'),Ua=E('<div class="wid-group"><div class="wid-group__header"><span class="wid-group__icon"> </span> <span class="wid-group__label"> </span> <span class="wid-group__count"> </span></div> <div class="wid-group__grid"></div></div>'),Wa=E('<div class="wid-timeline__title"> </div>'),Ha=E('<li class="wid-timeline__item"><div class="wid-timeline__dot"></div> <div class="wid-timeline__content"><div class="wid-timeline__row"><span class="wid-timeline__app"> </span> <span class="wid-timeline__time"> </span></div> <!> <div class="wid-timeline__device"> </div></div></li>'),ja=E('<div class="wid-history"><div class="wid-history__title">最近活动历史</div> <ul class="wid-timeline"></ul></div>'),Ya=E('<div class="wid-portal-layer"><div class="wid-scrim" role="presentation"></div> <div class="wid-panel" role="dialog" aria-modal="true" aria-label="设备舰队与实时活动"><div class="wid-panel__drag-handle" aria-hidden="true"></div> <div class="wid-panel__header"><div class="wid-panel__title"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"></path></svg> <span>设备舰队与实时活动</span></div> <div class="wid-panel__actions"><button type="button" class="wid-panel__btn wid-panel__btn--refresh" aria-label="手动刷新状态" title="手动刷新"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg></button> <button type="button" class="wid-panel__btn wid-panel__btn--close" aria-label="关闭详情" title="关闭">✕</button></div></div> <div class="wid-panel__body"><!> <div class="wid-fleet"><!></div> <!></div> <div class="wid-panel__footer"><span class="wid-panel__proto-badge">Cloudflare D1 Fleet Hub</span> <span class="wid-panel__status-hint"><!></span></div></div></div>'),Ga=E('<div><button type="button" aria-label="查看我的实时设备与活动历史"><span></span> <span class="wid-capsule__text"><!></span> <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41 1.41z"></path></svg></button></div> <!>',1);function Ka(t,a){va(a,!0),Tt();let u=Ye(a,"endpoint",3,"/api/activity"),N=Ye(a,"maxHistoryDisplay",3,5),S=Ye(a,"refreshInterval",3,0),T=Ye(a,"class",3,""),m=ne(null),_=ne(!1),C=ne(!1),D=ne(null),n=ne(!1),g=ne(pa(Date.now())),W=ne(null),ge=ne(!1),le=ne(0),De=ne(0);const p=J(()=>e(m)?.current??null),r=J(()=>e(m)?.devices??[]),d=J(()=>e(m)?.history??[]),f=J(()=>!e(m)&&e(_)),y=J(()=>!e(m)&&!e(_)&&!!e(D)),I=J(()=>{if(!e(m)||!e(p))return!1;if(e(p).offline||e(p).status===$.OFFLINE)return!0;const s=e(p).lastSeen??e(p).timestamp;return!!(s&&e(g)-s>12e4)}),B=J(()=>{if(!e(I))return"";const s=e(p)?.lastSeen??e(p)?.timestamp??0;return xa(s,e(g),"zh")}),se=J(()=>ka(e(p),e(g),"zh")),Et=J(()=>{if(e(I))return"离线";switch(e(se).statusType){case"active":return"正在活跃";case"idle":return"设备空闲";case"away":return"暂时离开";default:return"离线"}}),dt={desktop:{label:"台式工作站",icon:"🖥️"},laptop:{label:"便携笔记本",icon:"💻"},server:{label:"服务器集群",icon:"🖧"},mobile:{label:"移动设备",icon:"📱"},other:{label:"其它设备",icon:"📟"}},lt=J(()=>{const s=e(r).length>0?e(r):e(p)?[e(p)]:[],w={desktop:[],laptop:[],server:[],other:[]};for(const h of s){const z=(h.type||"desktop").toLowerCase();z==="desktop"?w.desktop.push(h):z==="laptop"?w.laptop.push(h):z==="server"?w.server.push(h):w.other.push(h)}return["desktop","laptop","server","other"].filter(h=>w[h].length>0).map(h=>({key:h,label:dt[h]?.label??h,icon:dt[h]?.icon??"💻",devices:w[h]}))}),ct=J(()=>e(r).filter(s=>!s.offline&&s.status!==$.OFFLINE&&e(g)-(s.lastSeen??s.timestamp)<=12e4).length),Nt=J(()=>e(d).slice(0,N()));let ze=null;async function be(s=!1){if(e(_)&&!s)return;s&&ze&&ze.abort(),O(_,!0),s&&O(C,!0);const w=new AbortController;ze=w;const h=setTimeout(()=>w.abort(),9e3);try{O(D,null);const z=await fetch(u(),{signal:w.signal});if(!z.ok){O(D,`状态服务响应异常 (${z.status})`);return}if((z.headers.get("content-type")??"").includes("application/x-protobuf")){const Y=await z.arrayBuffer();O(m,ya(new Uint8Array(Y)),!0)}else O(m,await z.json(),!0);O(g,Date.now(),!0),O(D,null)}catch(z){z?.name==="AbortError"?O(D,"连接状态服务器超时，请点击重试"):O(D,"无法连接至状态服务器"),console.debug("[what-im-doing] Telemetry fetch paused:",z)}finally{clearTimeout(h),ze===w&&(ze=null),O(_,!1),O(C,!1)}}let Ae=null;function pt(){S()>0&&!Ae&&(Ae=setInterval(()=>{document.visibilityState==="visible"&&be()},S()))}function Dt(){Ae&&(clearInterval(Ae),Ae=null)}function ut(){if(typeof window>"u"||(O(ge,window.innerWidth<768),!e(W)))return;const s=e(W).getBoundingClientRect();O(le,Math.round(s.left+s.width/2),!0),O(le,Math.max(210,Math.min(window.innerWidth-210,e(le))),!0),O(De,Math.round(window.innerHeight-s.top),!0)}function zt(){O(n,!e(n)),e(n)&&(O(g,Date.now(),!0),ut(),!e(m)&&!e(_)&&be())}function At(s){s.stopPropagation(),be(!0)}function Ct(s){return document.body.appendChild(s),{destroy(){s.parentNode&&s.parentNode.removeChild(s)}}}ma(()=>{if(!(typeof document>"u")&&e(n)){const s=document.body.style.overflow,w=document.body.style.paddingRight,h=window.innerWidth-document.documentElement.clientWidth;return h>0&&(document.body.style.paddingRight=`${h}px`),document.body.style.overflow="hidden",()=>{document.body.style.overflow=s,document.body.style.paddingRight=w}}}),ha(()=>{let s=null;typeof IntersectionObserver<"u"&&e(W)?(s=new IntersectionObserver(z=>{for(const Y of z)if(Y.isIntersecting){be(),pt(),s?.disconnect(),s=null;break}},{rootMargin:"60px"}),s.observe(e(W))):(be(),pt());const w=()=>{e(n)&&ut()},h=z=>{z.key==="Escape"&&e(n)&&O(n,!1)};return window.addEventListener("resize",w),window.addEventListener("keydown",h),()=>{Dt(),s&&s.disconnect(),window.removeEventListener("resize",w),window.removeEventListener("keydown",h)}});var ft=Ga(),Ce=X(ft),Le=o(Ce),vt=o(Le);let _t;var Ke=l(vt,2),Lt=o(Ke),Mt=s=>{var w=Sa();yt(2),v(s,w)},Ot=s=>{var w=Ta();yt(2),v(s,w)},Pt=s=>{var w=Ia(),h=l(X(w),2),z=o(h,!0);i(h);var Y=l(h,2),ce=U=>{var ae=ot(),Z=l(X(ae),2),fe=o(Z,!0);i(Z),k(()=>b(fe,e(B))),v(U,ae)};q(Y,U=>{e(B)&&U(ce)}),k(()=>b(z,e(p)?.appName||"离线")),v(s,w)},Ft=s=>{var w=Ea(),h=l(X(w),2),z=o(h,!0);i(h);var Y=l(h,2),ce=U=>{var ae=ot(),Z=l(X(ae),2),fe=o(Z,!0);i(Z),k(()=>b(fe,e(p).media.artist)),v(U,ae)};q(Y,U=>{e(p).media.artist&&U(ce)}),k(()=>b(z,e(p).media.title)),v(s,w)},qt=s=>{var w=Na(),h=X(w),z=o(h,!0);i(h);var Y=l(h,2),ce=U=>{var ae=ot(),Z=l(X(ae),2),fe=o(Z,!0);i(Z),k(()=>b(fe,e(p).windowTitle)),v(U,ae)};q(Y,U=>{e(p).windowTitle&&e(p).windowTitle!==e(p).appName&&U(ce)}),k(()=>b(z,e(p).appName)),v(s,w)},Vt=s=>{var w=Da(),h=o(w,!0);i(w),k(()=>b(h,e(Et))),v(s,w)};q(Lt,s=>{e(f)?s(Mt):e(y)?s(Ot,1):e(I)?s(Pt,2):e(p)?.media?.title?s(Ft,3):e(p)?.appName?s(qt,4):s(Vt,-1)}),i(Ke);var Rt=l(Ke,2);let mt;i(Le),i(Ce),ua(Ce,s=>O(W,s),()=>e(W));var $t=l(Ce,2),Bt=s=>{var w=Ya(),h=o(w),z=l(h,2),Y=l(o(z),2),ce=l(o(Y),2),U=o(ce),ae=o(U);let Z;i(U);var fe=l(U,2);i(ce),i(Y);var Je=l(Y,2),wt=o(Je),Ut=x=>{var A=Oa();let Q;var de=o(A),P=o(de);let re;var pe=o(P,!0);i(P);var ee=l(P,2),ve=o(ee,!0);i(ee);var ue=l(ee,2),ye=o(ue);i(ue),i(de);var _e=l(de,2),xe=F=>{var L=za(),G=l(o(L),2),Te=o(G,!0),Pe=l(Te),We=Fe=>{var He=ie();k(()=>b(He,`— ${e(p).media.artist??""}`)),v(Fe,He)};q(Pe,Fe=>{e(p).media.artist&&Fe(We)}),i(G),i(L),k(()=>b(Te,e(p).media.title)),v(F,L)};q(_e,F=>{e(p).media?.title&&!e(I)&&F(xe)});var me=l(_e,2),ke=F=>{var L=Aa(),G=o(L);i(L),k(()=>{$e(L,"title",e(p).windowTitle),b(G,`"${e(p).windowTitle??""}"`)}),v(F,L)};q(me,F=>{e(p).windowTitle&&e(p).windowTitle!==e(p).appName&&F(ke)});var c=l(me,2),V=o(c),te=F=>{var L=Ca(),G=o(L,!0);i(L),k(Te=>b(G,Te),[()=>e(B)||`最后活跃: ${Ne(e(p).lastSeen??e(p).timestamp,e(g),"zh")}`]),v(F,L)},Se=F=>{var L=La(),G=o(L);i(L),k(()=>b(G,`🟢 活跃于 ${(e(p).deviceName||e(p).name||e(p).deviceId)??""}`)),v(F,L)};q(V,F=>{e(I)?F(te):F(Se,-1)});var Me=l(V,2),Oe=F=>{var L=Ma(),G=o(L,!0);i(L),k(()=>b(G,e(p).osInfo)),v(F,L)};q(Me,F=>{e(p).osInfo&&F(Oe)}),i(c),i(A),k(()=>{Q=oe(A,1,"wid-current-card",null,Q,{"wid-current-card--offline":e(I)}),re=oe(P,1,"wid-tag",null,re,{"wid-tag--primary":!e(I),"wid-tag--muted":e(I)}),b(pe,e(I)?"最后使用":"当前活跃"),b(ve,e(p).appName||"未知应用"),b(ye,`@${(e(p).deviceName||e(p).name||e(p).deviceId)??""}`)}),v(x,A)};q(wt,x=>{e(p)&&x(Ut)});var Xe=l(wt,2),Wt=o(Xe),Ht=x=>{var A=Pa();v(x,A)},jt=x=>{var A=Fa(),Q=o(A),de=o(Q,!0);i(Q);var P=l(Q,2);i(A),k(()=>b(de,e(D))),Re("click",P,()=>be(!0)),v(x,A)},Yt=x=>{var A=qa();v(x,A)},Gt=x=>{var A=la(),Q=X(A);it(Q,17,()=>e(lt),rt,(de,P)=>{var re=Ua(),pe=o(re),ee=o(pe),ve=o(ee,!0);i(ee);var ue=l(ee,2),ye=o(ue,!0);i(ue);var _e=l(ue,2),xe=o(_e,!0);i(_e),i(pe);var me=l(pe,2);it(me,21,()=>e(P).devices,rt,(ke,c)=>{const V=J(()=>e(c).offline||e(c).status===$.OFFLINE||e(g)-(e(c).lastSeen??e(c).timestamp)>12e4);var te=Ba();let Se;var Me=o(te),Oe=o(Me),F=o(Oe);let L;var G=l(F,2),Te=o(G,!0);i(G),i(Oe);var Pe=l(Oe,2);let We;var Fe=o(Pe),He=M=>{var H=ie("离线");v(M,H)},ea=M=>{var H=ie("正在活跃");v(M,H)},ta=M=>{var H=ie("空闲");v(M,H)},aa=M=>{var H=ie("离开");v(M,H)},ra=M=>{var H=ie("在线");v(M,H)};q(Fe,M=>{e(V)?M(He):e(c).status===$.ACTIVE?M(ea,1):e(c).status===$.IDLE?M(ta,2):e(c).status===$.AWAY?M(aa,3):M(ra,-1)}),i(Pe),i(Me);var bt=l(Me,2),ia=o(bt),na=M=>{var H=Ra(),we=X(H),he=l(o(we),2),Ze=o(he,!0);i(he);var Qe=l(he,2),et=R=>{var j=xt(),K=l(X(j),2),Ve=o(K,!0);i(K),k(()=>{$e(K,"title",e(c).windowTitle),b(Ve,e(c).windowTitle)}),v(R,j)};q(Qe,R=>{e(c).windowTitle&&e(c).windowTitle!==e(c).appName&&R(et)}),i(we);var qe=l(we,2),je=o(qe),tt=l(je),at=R=>{var j=Va(),K=o(j);i(j),k(Ve=>b(K,`(${Ve??""})`),[()=>It(e(c).lastSeen??e(c).timestamp)]),v(R,j)};q(tt,R=>{(e(c).lastSeen||e(c).timestamp)&&R(at)}),i(qe),k(R=>{b(Ze,e(c).appName||"无记录"),b(je,`最后活跃: ${R??""} `)},[()=>Ne(e(c).lastSeen??e(c).timestamp,e(g),"zh")]),v(M,H)},oa=M=>{var H=$a(),we=X(H),he=o(we),Ze=o(he,!0);i(he);var Qe=l(he,2),et=R=>{var j=xt(),K=l(X(j),2),Ve=o(K,!0);i(K),k(()=>{$e(K,"title",e(c).windowTitle),b(Ve,e(c).windowTitle)}),v(R,j)};q(Qe,R=>{e(c).windowTitle&&e(c).windowTitle!==e(c).appName&&R(et)}),i(we);var qe=l(we,2),je=o(qe),tt=R=>{var j=ie();k(K=>b(j,`已空闲 ${K??""} 分钟`),[()=>Math.floor(e(c).idleSeconds/60)]),v(R,j)},at=R=>{var j=ie();k(K=>b(j,`活跃于 ${K??""}`),[()=>Ne(e(c).lastSeen??e(c).timestamp,e(g),"zh")]),v(R,j)};q(je,R=>{e(c).status===$.IDLE&&e(c).idleSeconds&&e(c).idleSeconds>60?R(tt):R(at,-1)}),i(qe),k(()=>b(Ze,e(c).appName||"活动中")),v(M,H)};q(ia,M=>{e(V)?M(na):M(oa,-1)}),i(bt),i(te),k(()=>{Se=oe(te,1,"wid-device-card",null,Se,{"wid-device-card--offline":e(V),"wid-device-card--active":!e(V)&&e(c).status===$.ACTIVE}),L=oe(F,1,"wid-device-card__dot",null,L,{"wid-device-card__dot--active":!e(V)&&e(c).status===$.ACTIVE,"wid-device-card__dot--idle":!e(V)&&e(c).status===$.IDLE,"wid-device-card__dot--away":!e(V)&&e(c).status===$.AWAY,"wid-device-card__dot--offline":e(V)}),b(Te,e(c).name||e(c).deviceName||e(c).id||e(c).deviceId),We=oe(Pe,1,"wid-device-card__badge",null,We,{"wid-device-card__badge--active":!e(V)&&e(c).status===$.ACTIVE,"wid-device-card__badge--idle":!e(V)&&e(c).status===$.IDLE,"wid-device-card__badge--offline":e(V)})}),v(ke,te)}),i(me),i(re),k(()=>{b(ve,e(P).icon),b(ye,e(P).label),b(xe,e(P).devices.length)}),v(de,re)}),v(x,A)};q(Wt,x=>{e(_)&&!e(m)?x(Ht):e(D)&&!e(m)?x(jt,1):e(lt).length===0?x(Yt,2):x(Gt,-1)}),i(Xe);var Kt=l(Xe,2),Jt=x=>{var A=ja(),Q=l(o(A),2);it(Q,21,()=>e(Nt),rt,(de,P)=>{var re=Ha(),pe=l(o(re),2),ee=o(pe),ve=o(ee),ue=o(ve,!0);i(ve);var ye=l(ve,2),_e=o(ye,!0);i(ye),i(ee);var xe=l(ee,2),me=V=>{var te=Wa(),Se=o(te,!0);i(te),k(()=>{$e(te,"title",e(P).windowTitle),b(Se,e(P).windowTitle)}),v(V,te)};q(xe,V=>{e(P).windowTitle&&e(P).windowTitle!==e(P).appName&&V(me)});var ke=l(xe,2),c=o(ke,!0);i(ke),i(pe),i(re),k(V=>{b(ue,e(P).appName),b(_e,V),b(c,e(P).deviceName||e(P).name)},[()=>Ne(e(P).timestamp,e(g),"zh")]),v(de,re)}),i(Q),i(A),v(x,A)};q(Kt,x=>{e(d).length>0&&x(Jt)}),i(Je);var ht=l(Je,2),gt=l(o(ht),2),Xt=o(gt),Zt=x=>{var A=ie();k(()=>b(A,`🟢 ${e(ct)??""} 台在线 · 按需刷新`)),v(x,A)},Qt=x=>{var A=ie("⚪ 全设备离线 · 按需刷新");v(x,A)};q(Xt,x=>{e(ct)>0?x(Zt):x(Qt,-1)}),i(gt),i(ht),i(z),i(w),fa(w,x=>Ct?.(x)),k(()=>{_a(z,`--anchor-bottom: ${e(De)}px; --anchor-left: ${e(le)}px;`),U.disabled=e(C),Z=oe(ae,0,"wid-panel__refresh-icon",null,Z,{"wid-panel__refresh-icon--spin":e(C)})}),Re("click",h,()=>O(n,!1)),Re("click",U,At),Re("click",fe,()=>O(n,!1)),v(s,w)};q($t,s=>{e(n)&&s(Bt)}),k(()=>{oe(Ce,1,`wid-capsule-wrapper ${T()}`),oe(Le,1,`wid-capsule wid-capsule--${e(f)?"loading":e(y)?"error":e(I)?"offline":e(se).statusType}`),$e(Le,"aria-expanded",e(n)),_t=oe(vt,1,"wid-capsule__dot",null,_t,{"wid-capsule__dot--pulse":e(f),"wid-capsule__dot--active":!e(I)&&!e(f)&&!e(y)&&e(se).statusType==="active","wid-capsule__dot--idle":!e(I)&&!e(f)&&!e(y)&&e(se).statusType==="idle","wid-capsule__dot--offline":e(I)||e(y)}),mt=oe(Rt,0,"wid-capsule__chevron",null,mt,{"wid-capsule__chevron--open":e(n)})}),Re("click",Le,zt),v(t,ft),wa()}da(["click"]);var Be=null,Ue=null;function Ja(t={}){if(typeof window>"u"||typeof document>"u")return;Tt();const a={endpoint:t.endpoint||"/api/activity",maxHistoryDisplay:t.maxHistoryDisplay??5,refreshInterval:t.refreshInterval??0,targetSelector:t.targetSelector||'a[aria-label="Go to About Page"]',position:t.position||"beforebegin",routeFilter:t.routeFilter};let u=0;const N=25;let S=null;function T(){if(!a.routeFilter||a.routeFilter.length===0)return!0;const n=window.location.pathname.toLowerCase();return a.routeFilter.some(g=>n.startsWith(g.toLowerCase()))}function m(){if(S&&(clearTimeout(S),S=null),!T()){_();return}if(document.querySelector(".wid-mounted-portal"))return;const n=document.querySelector(a.targetSelector);if(!n?.parentElement){u<N&&(u++,S=setTimeout(m,80));return}u=0;const g=document.createElement("div");g.className="wid-mounted-portal",g.style.width="100%",g.style.display="flex",g.style.justifyContent="center",n.insertAdjacentElement(a.position,g);try{Be=ca(Ka,{target:g,props:{endpoint:a.endpoint,maxHistoryDisplay:a.maxHistoryDisplay,refreshInterval:a.refreshInterval}}),Ue=g}catch(W){console.error("[what-im-doing] Failed to mount Svelte capsule:",W),g.remove(),Ue=null}}function _(){if(S&&(clearTimeout(S),S=null),u=0,Be){try{sa(Be)}catch{}Be=null}Ue&&(Ue.remove(),Ue=null)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",m):m();const C=window.swup,D=()=>{T()?(!document.querySelector(".wid-mounted-portal")||!Be)&&(_(),u=0,m()):_()};C?.hooks?C.hooks.on("page:view",D):document.addEventListener("swup:contentReplaced",D)}function Ge(){typeof window<"u"&&window.__WHAT_IM_DOING_CONFIG__&&!window.__WHAT_IM_DOING_MOUNTED__&&(window.__WHAT_IM_DOING_MOUNTED__=!0,Ja(window.__WHAT_IM_DOING_CONFIG__))}typeof window<"u"&&(window.addEventListener("what-im-doing:init",()=>Ge()),window.__WHAT_IM_DOING_CONFIG__?Ge():document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>Ge()):setTimeout(Ge,0));function Ee(t){return JSON.parse(t,Xa)}function Xa(t,a){if(Array.isArray(a)&&a.length===2&&typeof a[1]=="string"){const u=a[0];if(a=a[1],u===":regex:"){const N=a.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(N[1],N[2]||"")}if(u===":function:")return new Function(`return (${a}).apply(this, arguments);`)}return a}function kt(t,{timeoutFallback:a=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>t()):setTimeout(()=>t(),a)}function Za(t){document.readyState==="complete"?setTimeout(()=>t(),0):window.addEventListener("load",()=>t())}function Qa(t,{delayAfterLoad:a=0}={}){Za(()=>{a>0?setTimeout(()=>kt(t),a):kt(t)})}typeof window<"u"&&(window.__WHAT_IM_DOING_CONFIG__={endpoint:"https://api.mango-mesa.ccwu.cc/api/activity",routeFilter:["/MangoMesa"]},window.dispatchEvent(new CustomEvent("what-im-doing:init")));var St=(()=>{var t=Object.defineProperty,a=Object.getOwnPropertyDescriptor,u=Object.getOwnPropertyNames,N=Object.prototype.hasOwnProperty,S=(r,d)=>{for(var f in d)t(r,f,{get:d[f],enumerable:!0})},T=(r,d,f,y)=>{if(d&&typeof d=="object"||typeof d=="function")for(let I of u(d))!N.call(r,I)&&I!==f&&t(r,I,{get:()=>d[I],enumerable:!(y=a(d,I))||y.enumerable});return r},m=r=>T(t({},"__esModule",{value:!0}),r),_={};S(_,{initUmamiRuntime:()=>p});var C="x-umami-share-context";async function D(r,d,f=1e4){let y=new AbortController,I=setTimeout(()=>y.abort(),f);try{return await fetch(r,{...d,signal:y.signal})}catch(B){throw B instanceof DOMException&&B.name==="AbortError"?new Error(`[oddmisc] 请求超时 (${f}ms): ${r}`):B}finally{clearTimeout(I)}}function n(r){return typeof r=="number"?r:r&&typeof r.value=="number"?r.value:0}function g(r){let d=new URL(r),f=d.pathname.split("/"),y=f.indexOf("share");if(y===-1||y===f.length-1)throw new Error("无效的分享 URL：未找到 share 路径");let I=f[y+1];if(!I)throw new Error("无效的分享 URL：缺少分享 ID");let B=f.slice(0,y).join("/");return{apiBase:`${d.protocol}//${d.host}${B}/api`,shareId:I}}function W(){return Math.floor(Date.now()/3e5)*3e5}var ge=class{constructor(r,d,f=100){this.storageKey=r,this.ttl=d,this.maxEntries=f,this.cache=new Map,this.loadFromStorage()}loadFromStorage(){try{let r=localStorage.getItem(this.storageKey);if(!r)return;let d=JSON.parse(r);for(let[f,y]of Object.entries(d))y&&typeof y.timestamp=="number"&&!this.isExpired(y.timestamp)&&this.cache.set(f,y)}catch{}}saveToStorage(){try{let r={};this.cache.forEach((d,f)=>{r[f]=d}),localStorage.setItem(this.storageKey,JSON.stringify(r))}catch{}}isExpired(r){return Date.now()-r>=this.ttl}evictIfNeeded(){if(this.cache.size<=this.maxEntries)return;let r=[...this.cache.entries()].sort((f,y)=>f[1].timestamp-y[1].timestamp),d=r.length-this.maxEntries;for(let f=0;f<d;f++)this.cache.delete(r[f][0]);this.saveToStorage()}get(r){let d=this.cache.get(r);return d&&!this.isExpired(d.timestamp)?d.value:(d&&(this.cache.delete(r),this.saveToStorage()),null)}set(r,d){this.cache.set(r,{value:d,timestamp:Date.now()}),this.saveToStorage(),this.evictIfNeeded()}clear(){this.cache.clear();try{localStorage.removeItem(this.storageKey)}catch{}}},le=class{constructor(r){if(this.shareData=null,this.sharePromise=null,!r.shareUrl)throw new Error("shareUrl 是必需参数");let{apiBase:d,shareId:f}=g(r.shareUrl);this.apiBase=d,this.shareId=f,this.cache=new ge(`umami-runtime-${f}`,36e5)}async getShareData(){return this.shareData?this.shareData:this.sharePromise?this.sharePromise:(this.sharePromise=(async()=>{let r=await D(`${this.apiBase}/share/${this.shareId}`);if(!r.ok)throw this.shareData=null,this.sharePromise=null,new Error(`获取分享信息失败: ${r.status}`);let d=await r.json();return this.shareData=d,d})(),this.sharePromise)}async authedFetch(r){let{websiteId:d,token:f}=await this.getShareData(),y=await D(`${this.apiBase}/websites/${d}${r}`,{headers:{"x-umami-share-token":f,[C]:"1"}});if(!y.ok)throw y.status===401&&(this.shareData=null,this.sharePromise=null),new Error(`请求 ${r} 失败: ${y.status}`);return await y.json()}async getStats(r){let d=W(),f=`${r?`stats-${r}`:"stats-site"}-${d}`,y=this.cache.get(f);if(y)return{...y,_fromCache:!0};let I=new URLSearchParams({startAt:"0",endAt:d.toString()});r&&I.set("path",`eq.${r}`);let B=await this.authedFetch(`/stats?${I.toString()}`),se={pageviews:n(B.pageviews),visitors:n(B.visitors),visits:n(B.visits)};return B.bounces!==void 0&&(se.bounces=n(B.bounces)),B.totaltime!==void 0&&(se.totaltime=n(B.totaltime)),this.cache.set(f,se),se}getSiteStats(){return this.getStats()}getPageStats(r){return this.getStats(r)}async getActiveVisitors(){let r=await this.authedFetch("/active");return typeof r?.visitors=="number"?r.visitors:0}clearCache(){this.cache.clear(),this.shareData=null,this.sharePromise=null}};function De(){let r=()=>Promise.resolve({pageviews:0,visitors:0,visits:0});window.oddmisc={getStats:r,getSiteStats:r,getPageStats:r,getActiveVisitors:()=>Promise.resolve(0),clearCache:()=>{}}}function p(r){if(!r.shareUrl)console.log("[oddmisc] shareUrl 未配置，跳过初始化"),De();else try{let d=new le(r);window.oddmisc={umami:d,getStats:f=>d.getStats(f),getSiteStats:()=>d.getSiteStats(),getPageStats:f=>d.getPageStats(f),getActiveVisitors:()=>d.getActiveVisitors(),clearCache:()=>d.clearCache()},console.log("[oddmisc] Umami runtime client initialized")}catch(d){console.warn("[oddmisc] 初始化失败:",d instanceof Error?d.message:d),De()}window.dispatchEvent(new CustomEvent("oddmisc-ready",{detail:{client:window.oddmisc}}))}return m(_)})();typeof window<"u"&&typeof St<"u"&&St.initUmamiRuntime({shareUrl:"https://cloud.umami.is/analytics/eu/share/BywgdGzJ6ra6T7Pb"});async function er(){const[t,a,u,N,S,T]=await Promise.all([Ie(()=>import("./Swup.Cz2sqVT0.js").then(n=>n.default),__vite__mapDeps([0,1])),Ie(()=>import("./SwupA11yPlugin.COK5EHWy.js").then(n=>n.default),__vite__mapDeps([2,1,3])),Ie(()=>import("./SwupPreloadPlugin.BmKT5rcH.js").then(n=>n.default),__vite__mapDeps([4,1,3])),Ie(()=>import("./SwupScrollPlugin.DXF80AYT.js").then(n=>n.default),__vite__mapDeps([5,1,3])),Ie(()=>import("./SwupHeadPlugin.CJV9x5S0.js").then(n=>n.default),__vite__mapDeps([6,3])),Ie(()=>import("./SwupScriptsPlugin.KOkp8JHL.js").then(n=>n.default),__vite__mapDeps([7,3]))]),m=Ee('"a[href=\\"#\\"]"'),_=(n,g,{el:W,event:ge})=>typeof n=="string"&&n.startsWith("/")?g.startsWith(n):typeof n=="string"?W?.matches(n)??!1:n instanceof RegExp?n.test(g):typeof n=="function"?n(g,{el:W,event:ge}):Array.isArray(n)?n.some(le=>_(le,g,{el:W,event:ge})):!1,C=new t({ignoreVisit:(n,{el:g,event:W}={})=>g?.closest("[data-no-swup]")||_(m,n,{el:g,event:W}),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new a(Ee("{}")),new u(Ee('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new N(Ee("{}")),new S(Ee('{"awaitAssets":false,"persistAssets":false,"persistTags":"link[rel=stylesheet]:not([data-swup-optional]), style:not([data-swup-optional])"}')),new T(Ee("{}"))]}),D=n=>document.dispatchEvent(new Event(n));C.hooks.before("content:replace",()=>D("astro:before-swap")),C.hooks.on("content:replace",()=>D("astro:after-swap")),C.hooks.on("page:view",()=>D("astro:page-load")),window.swup=C}Qa(er);
