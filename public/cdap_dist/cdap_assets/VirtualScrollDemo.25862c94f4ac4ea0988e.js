(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{2373:function(e,n,t){"use strict";t.r(n);var r,a=t(0),i=t.n(a),l=t(511),o=t(13),c=t.n(o),u=t(1480),f=t(1478),s=t(1479),d=function(e,n){var t="function"==typeof Symbol&&e[Symbol.iterator];if(!t)return e;var r,a,i=t.call(e),l=[];try{for(;(void 0===n||n-- >0)&&!(r=i.next()).done;)l.push(r.value)}catch(e){a={error:e}}finally{try{r&&!r.done&&(t=i.return)&&t.call(i)}finally{if(a)throw a.error}}return l},m=function(){return{container:{marginTop:"20px"},root:{height:30,lineHeight:"30px",display:"flex",justifyContent:"space-between",padding:"0 10px"},row:{lineHeight:"20px",background:"hotpink",maxWidth:"200px",margin:"0 10px",boxShadow:"0 0 1px 0 rgba(0, 0, 0, 0.5)"},checkbox:{padding:"0 10px"}}},p=c()(m)((function(e){var n=e.index,t=e.classes;return i.a.createElement("div",{className:t.root+" "+t.row,key:n},i.a.createElement("strong",null,"row index ",n))})),h=new Array(100).fill(null);function y(e,n,t){if(e){if(r)return r;var a=h.slice(t,t+n);return(a=a.map((function(e,n){return i.a.createElement(p,{key:n+t,index:n+t})}))).length<n&&(r=new Promise((function(e){setTimeout((function(){h=h.concat(new Array(100).fill(null)),e(h.slice(t,t+n).map((function(e,n){return i.a.createElement(p,{key:n+t,index:n+t})}))),r=null}),2e3)}))),a}return h.slice(t,t+n).map((function(e,n){return i.a.createElement(p,{key:n+t,index:n+t})}))}n.default=c()(m)((function(e){var n=e.classes,t=d(Object(a.useState)(!0),2),r=t[0],o=t[1];return Object(a.useEffect)((function(){h=r?new Array(100).fill(null):new Array(1e5).fill(null)}),[r]),i.a.createElement("div",{className:n.container},i.a.createElement(u.a,null,i.a.createElement(f.a,{className:n.checkbox,control:i.a.createElement(s.a,{checked:r,onChange:function(){return o(!r)},name:"promisify",color:"primary"}),label:"Promisify"})),i.a.createElement(l.a,{itemCount:function(){return h.length},visibleChildCount:20,childHeight:30,renderList:y.bind(null,r),childrenUnderFold:5}))}))}}]);