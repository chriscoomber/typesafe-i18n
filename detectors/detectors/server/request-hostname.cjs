"use strict";var c=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var n=Object.getOwnPropertyNames;var a=Object.prototype.hasOwnProperty;var i=(e,t)=>{for(var r in t)c(e,r,{get:t[r],enumerable:!0})},p=(e,t,r,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of n(t))!a.call(e,o)&&o!==r&&c(e,o,{get:()=>t[o],enumerable:!(s=m(t,o))||s.enumerable});return e};var u=e=>p(c({},"__esModule",{value:!0}),e);var L={};i(L,{initRequestHostnameDetector:()=>d});module.exports=u(L);var w=/^((?:\w{2,3}(?:-\w{3})?)(?:-\w{4})?(?:-\w{2}|-\d{3})?(?:-[\w\d]{5,8}|-\d[\w\d]{3})*)\./,d=e=>()=>{let t=e?.hostname?.match(w);return t&&t[1]?[t[1]]:[]};