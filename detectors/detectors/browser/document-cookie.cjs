"use strict";var i=Object.defineProperty;var n=Object.getOwnPropertyDescriptor;var p=Object.getOwnPropertyNames;var a=Object.prototype.hasOwnProperty;var l=(o,e)=>{for(var t in e)i(o,t,{get:e[t],enumerable:!0})},u=(o,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let c of p(e))!a.call(o,c)&&c!==t&&i(o,c,{get:()=>e[c],enumerable:!(r=n(e,c))||r.enumerable});return o};var L=o=>u(i({},"__esModule",{value:!0}),o);var k={};l(k,{documentCookieDetector:()=>f,initDocumentCookieDetector:()=>s});module.exports=L(k);var m=(o,e)=>{let t=o?.split(";").map(r=>r.trim()).find(r=>r.startsWith(e))?.split("=")[1];return t?[t]:[]};var s=(o="lang")=>()=>m(document?.cookie,o),f=s();
