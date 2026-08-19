(()=>{var w0=Object.defineProperty;var ir=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var b0=(e,t,r)=>()=>{if(r)throw r[0];try{return e&&(t=e(e=0)),t}catch(n){throw r=[n],n}};var $0=(e,t)=>{for(var r in t)w0(e,r,{get:t[r],enumerable:!0})};var em={};$0(em,{InferenceSession:()=>Os,TRACE:()=>nn,TRACE_EVENT_BEGIN:()=>Qt,TRACE_EVENT_END:()=>Xt,TRACE_FUNC_BEGIN:()=>gt,TRACE_FUNC_END:()=>nt,Tensor:()=>mt,default:()=>F_,env:()=>ke,registerBackend:()=>pr});async function Po(e={}){var t=e,r=!!globalThis.window,n=!!globalThis.WorkerGlobalScope,i=n&&self.name?.startsWith("em-pthread");t.mountExternalData=(o,c)=>{o.startsWith("./")&&(o=o.substring(2)),(t.Zc||(t.Zc=new Map)).set(o,c)},t.unmountExternalData=()=>{delete t.Zc},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,ae:!0}).buffer.constructor;let s=o=>async(...c)=>{try{if(t.$c)throw Error("Session already started");let m=t.$c={Nd:c[0],errors:[]},f=await o(...c);if(t.$c!==m)throw Error("Session mismatch");t.gd?.flush();let x=m.errors;if(0<x.length){let E=await Promise.all(x);if(E=E.filter(M=>M),0<E.length)throw Error(E.join(`
`))}return f}finally{t.$c=null}};t.jsepInit=(o,c)=>{if(o==="webgpu"){[t.gd,t.Dd,t.Hd,t.jd,t.Gd,t.ac,t.Id,t.Kd,t.Ed,t.Fd,t.Jd]=c;let m=t.gd;t.jsepRegisterBuffer=(f,x,E,M)=>m.registerBuffer(f,x,E,M),t.jsepGetBuffer=f=>m.getBuffer(f),t.jsepCreateDownloader=(f,x,E)=>m.createDownloader(f,x,E),t.jsepOnCreateSession=f=>{m.onCreateSession(f)},t.jsepOnReleaseSession=f=>{m.onReleaseSession(f)},t.jsepOnRunStart=f=>m.onRunStart(f),t.Ld=(f,x)=>{m.upload(f,x)}}else if(o==="webnn"){let m=c[0];[t.Zd,t.vd,t.webnnEnsureTensor,t.xd,t.webnnDownloadTensor,t.Yd,t.webnnEnableTraceEvent]=c.slice(1),t.webnnReleaseTensorId=t.vd,t.webnnUploadTensor=t.xd,t.webnnRegisterMLContext=t.Yd,t.webnnOnRunStart=f=>m.onRunStart(f),t.webnnOnRunEnd=m.onRunEnd.bind(m),t.webnnOnReleaseSession=f=>{m.onReleaseSession(f)},t.webnnCreateMLTensorDownloader=(f,x)=>m.createMLTensorDownloader(f,x),t.webnnRegisterMLTensor=(f,x,E,M)=>m.registerMLTensor(f,x,E,M),t.webnnCreateMLContext=f=>m.createMLContext(f),t.webnnRegisterMLConstant=(f,x,E,M,N,q)=>m.registerMLConstant(f,x,E,M,N,t.Zc,q),t.webnnRegisterGraphInput=m.registerGraphInput.bind(m),t.webnnIsGraphInput=m.isGraphInput.bind(m),t.webnnRegisterGraphOutput=m.registerGraphOutput.bind(m),t.webnnIsGraphOutput=m.isGraphOutput.bind(m),t.webnnCreateTemporaryTensor=m.createTemporaryTensor.bind(m),t.webnnIsGraphInputOutputTypeSupported=m.isGraphInputOutputTypeSupported.bind(m)}};let a=()=>{let o=c=>(...m)=>{let f=xt;return m=c(...m),xt!=f?new Promise((x,E)=>{ai={resolve:x,reject:E}}):m};(()=>{for(let c of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[c]=o(t[c])})(),s!==void 0&&(t._OrtRun=s(t._OrtRun),t._OrtRunWithBinding=s(t._OrtRunWithBinding)),a=void 0};t.asyncInit=()=>{a?.()};var u,l,d=(o,c)=>{throw c},p=ft.url,h="";if(r||n){try{h=new URL(".",p).href}catch{}n&&(l=o=>{var c=new XMLHttpRequest;return c.open("GET",o,!1),c.responseType="arraybuffer",c.send(null),new Uint8Array(c.response)}),u=async o=>{if(A(o))return new Promise((m,f)=>{var x=new XMLHttpRequest;x.open("GET",o,!0),x.responseType="arraybuffer",x.onload=()=>{x.status==200||x.status==0&&x.response?m(x.response):f(x.status)},x.onerror=f,x.send(null)});var c=await fetch(o,{credentials:"same-origin"});if(c.ok)return c.arrayBuffer();throw Error(c.status+" : "+c.url)}}var g,y,_,b,k,v,w=console.log.bind(console),T=console.error.bind(console),S=w,I=T,C=!1,A=o=>o.startsWith("file://");function $(){Ve.buffer!=H.buffer&&K()}if(i){let o=function(c){try{var m=c.data,f=m.Uc;if(f==="load"){let x=[];self.onmessage=E=>x.push(E),v=()=>{postMessage({Uc:"loaded"});for(let E of x)o(E);self.onmessage=o};for(let E of m.Ad)t[E]&&!t[E].proxy||(t[E]=(...M)=>{postMessage({Uc:"callHandler",zd:E,args:M})},E=="print"&&(S=t[E]),E=="printErr"&&(I=t[E]));Ve=m.Vd,K(),y=m.Wd,Be(),$n()}else if(f==="run"){(function(x){var E=($(),P)[x+52>>>2>>>0];x=($(),P)[x+56>>>2>>>0],Va(E,E-x),le(E)})(m.Tc),ci(m.Tc,0,0,1,0,0),zr(),ni(m.Tc),U||(Ua(),U=!0);try{Ar(m.Pd,m.dd)}catch(x){if(x!="unwind")throw x}}else m.target!=="setimmediate"&&(f==="checkMailbox"?U&&fn():f&&(I(`worker: received unknown command ${f}`),I(m)))}catch(x){throw La(),x}};var B=o,U=!1;self.onunhandledrejection=c=>{throw c.reason||c},self.onmessage=o}var H,W,G,j,z,P,ee,X,V,oe,D,F=!1;function K(){var o=Ve.buffer;t.HEAP8=H=new Int8Array(o),G=new Int16Array(o),t.HEAPU8=W=new Uint8Array(o),j=new Uint16Array(o),t.HEAP32=z=new Int32Array(o),t.HEAPU32=P=new Uint32Array(o),ee=new Float32Array(o),X=new Float64Array(o),V=new BigInt64Array(o),oe=new BigUint64Array(o)}function re(){F=!0,i?v():zt.tb()}function he(o){throw I(o="Aborted("+o+")"),C=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),k?.(o),o}function Ee(){return{a:{ma:Og,hb:Mg,g:Yn,J:br,f:ae,o:Ne,h:at,ha:er,b:fe,T:We,Ia:Te,n:ln,_:$t,Ya:vt,Ea:Pt,Ga:Ut,Za:Lt,Wa:Ft,Pa:Or,Va:qe,ka:Nr,Fa:$r,Ca:Wt,Xa:dn,Da:cn,cb:Jn,ea:bm,xa:$m,va:xm,da:Sm,O:Tm,H:Im,wa:Em,Z:Rm,ya:Bm,Sa:Dm,Aa:Um,Ja:Lm,ta:Fm,fa:Wm,Ra:ni,$a:qm,R:jm,s:Ym,c:ti,ib:Jm,y:eg,M:tg,D:rg,m:ng,t:va,jb:ig,I:sg,S:ag,j:og,v:ug,r:lg,l:dg,Ma:cg,Na:pg,Oa:hg,Ka:Ta,La:Ia,ua:Ea,eb:mg,bb:yg,u:wg,aa:bg,ga:$g,ab:gg,V:vg,_a:xg,Ba:kg,F:fg,U:Sg,la:wn,za:Ig,gb:Tg,fb:Eg,Ta:Ma,Ua:Oa,Ha:Qe,$:Na,ja:Ra,Qa:Ba,ia:Da,lb:g0,na:l0,mb:m0,oa:u0,G:Jg,d:Dg,q:Rg,w:Ng,B:jg,pb:s0,K:Xg,x:Ug,pa:a0,X:d0,ba:i0,nb:f0,ob:h0,ra:e0,qa:n0,qb:t0,N:Zg,Y:o0,e:Pg,A:Lg,k:Bg,kb:_0,p:Wg,z:qg,C:Fg,E:Gg,L:Kg,rb:Yg,Q:c0,ca:Qg,W:p0,sb:Hg,sa:Vg,P:r0,i:zg,a:Ve,db:Jt}}}async function Be(){function o(f,x){var E=zt=f.exports;f={};for(let[M,N]of Object.entries(E))typeof N=="function"?(E=Gm(N),f[M]=E):f[M]=N;return zt=f,zt=(function(){var M=zt,N=Q=>ue=>Q(ue)>>>0,q=Q=>()=>Q()>>>0;return(M=Object.assign({},M)).ub=N(M.ub),M.Yb=q(M.Yb),M._b=N(M._b),M.mc=N(M.mc),M.nc=q(M.nc),M.rc=N(M.rc),M})(),un.push(zt.$b),Pa=(f=zt).ub,Ua=f.vb,t._OrtInit=f.wb,t._OrtGetLastError=f.xb,t._OrtCreateSessionOptions=f.yb,t._OrtAppendExecutionProvider=f.zb,t._OrtAddFreeDimensionOverride=f.Ab,t._OrtAddSessionConfigEntry=f.Bb,t._OrtReleaseSessionOptions=f.Cb,t._OrtCreateSession=f.Db,t._OrtReleaseSession=f.Eb,t._OrtGetInputOutputCount=f.Fb,t._OrtGetInputOutputMetadata=f.Gb,t._OrtFree=f.Hb,t._OrtCreateTensor=f.Ib,t._OrtGetTensorData=f.Jb,t._OrtReleaseTensor=f.Kb,t._OrtCreateRunOptions=f.Lb,t._OrtAddRunConfigEntry=f.Mb,t._OrtReleaseRunOptions=f.Nb,t._OrtCreateBinding=f.Ob,t._OrtBindInput=f.Pb,t._OrtBindOutput=f.Qb,t._OrtClearBoundOutputs=f.Rb,t._OrtReleaseBinding=f.Sb,t._OrtRunWithBinding=f.Tb,t._OrtRun=f.Ub,t._OrtEndProfiling=f.Vb,t._JsepOutput=f.Wb,t._JsepGetNodeName=f.Xb,bn=f.Yb,kt=t._free=f.Zb,Pr=t._malloc=f._b,ci=f.bc,La=f.cc,Fa=f.dc,Wa=f.ec,pi=f.fc,qa=f.gc,Ga=f.hc,ce=f.ic,Ur=f.jc,Va=f.kc,le=f.lc,hi=f.mc,de=f.nc,Ha=f.oc,fi=f.pc,ja=f.qc,Ka=f.rc,Qa=f.sc,mi=f.tc,Xa=f.uc,Za=f.vc,Ya=f.wc,Ja=f.xc,eo=f.yc,to=f.zc,ro=f.Ac,no=f.Bc,io=f.Cc,so=f.Dc,ao=f.Ec,oo=f.Fc,uo=f.Gc,lo=f.Hc,co=f.Ic,po=f.Jc,ho=f.Kc,fo=f.Lc,mo=f.Mc,go=f.Nc,_o=f.Oc,yo=f.Pc,wo=f.Rc,bo=f.Sc,$o=f.bd,vo=f.cd,xo=f.hd,ko=f.kd,So=f.ld,To=f.md,Io=f.nd,Eo=f.od,Co=f.pd,zo=f.qd,Ao=f.rd,Mo=f.wd,Oo=f.Rd,No=f.Sd,Ro=f.Td,Bo=f.Ud,y=x,zt}var c,m=Ee();return t.instantiateWasm?new Promise(f=>{t.instantiateWasm(m,(x,E)=>{f(o(x,E))})}):i?o(new WebAssembly.Instance(y,Ee()),y):(D??=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",h):h+"ort-wasm-simd-threaded.jsep.wasm":new URL("ort-wasm-simd-threaded.jsep.wasm",ft.url).href,c=await(async function(f){var x=D;if(!g&&!A(x))try{var E=fetch(x,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(E,f)}catch(M){I(`wasm streaming compile failed: ${M}`),I("falling back to ArrayBuffer instantiation")}return(async function(M,N){try{var q=await(async function(Q){if(!g)try{var ue=await u(Q);return new Uint8Array(ue)}catch{}if(Q==D&&g)Q=new Uint8Array(g);else{if(!l)throw"both async and sync fetching of the wasm failed";Q=l(Q)}return Q})(M);return await WebAssembly.instantiate(q,N)}catch(Q){I(`failed to asynchronously prepare wasm: ${Q}`),he(Q)}})(x,f)})(m),o(c.instance,c.module))}class Fe{name="ExitStatus";constructor(c){this.message=`Program terminated with exit(${c})`,this.status=c}}var Se=o=>{o.terminate(),o.onmessage=()=>{}},$e=[],Pe=0,st=null,Nt=o=>{Oe.length==0&&(Rt(),bt(Oe[0]));var c=Oe.pop();if(!c)return 6;yt.push(c),wt[o.Tc]=c,c.Tc=o.Tc;var m={Uc:"run",Pd:o.Od,dd:o.dd,Tc:o.Tc};return c.postMessage(m,o.ud),0},Ke=0,ve=(o,c,...m)=>{var f,x=16*m.length,E=de(),M=hi(x),N=M>>>3;for(f of m)typeof f=="bigint"?(($(),V)[N++>>>0]=1n,($(),V)[N++>>>0]=f):(($(),V)[N++>>>0]=0n,($(),X)[N++>>>0]=f);return o=Fa(o,0,x,M,c),le(E),o};function Jt(o){if(i)return ve(0,1,o);if(_=o,!(0<Ke)){for(var c of yt)Se(c);for(c of Oe)Se(c);Oe=[],yt=[],wt={},C=!0}d(0,new Fe(o))}function je(o){if(i)return ve(1,0,o);Qe(o)}var Qe=o=>{if(_=o,i)throw je(o),"unwind";Jt(o)},Oe=[],yt=[],un=[],wt={},Cr=o=>{var c=o.Tc;delete wt[c],Oe.push(o),yt.splice(yt.indexOf(o),1),o.Tc=0,Wa(c)};function zr(){un.forEach(o=>o())}var bt=o=>new Promise(c=>{o.onmessage=x=>{var E=x.data;if(x=E.Uc,E.ad&&E.ad!=bn()){var M=wt[E.ad];M?M.postMessage(E,E.ud):I(`Internal error! Worker sent a message "${x}" to target pthread ${E.ad}, but that thread no longer exists!`)}else x==="checkMailbox"?fn():x==="spawnThread"?Nt(E):x==="cleanupThread"?hn(()=>{Cr(wt[E.Qd])}):x==="loaded"?(o.loaded=!0,c(o)):E.target==="setimmediate"?o.postMessage(E):x==="uncaughtException"?o.onerror(E.error):x==="callHandler"?t[E.zd](...E.args):x&&I(`worker sent an unknown command ${x}`)},o.onerror=x=>{throw I(`worker sent an error! ${x.filename}:${x.lineno}: ${x.message}`),x};var m,f=[];for(m of[])t.propertyIsEnumerable(m)&&f.push(m);o.postMessage({Uc:"load",Ad:f,Vd:Ve,Wd:y})});function Rt(){var o=new Worker((()=>{let c=URL;return ft.url>"file:"&&ft.url<"file;"?new c("ort.bundle.min.mjs",ft.url):new URL(ft.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});Oe.push(o)}var Ve,Ar=(o,c)=>{Ke=0,o=mi(o,c),0<Ke?_=o:pi(o)},It=[],Xe=0;function Yn(o){var c=new pe(o>>>=0);return($(),H)[c.Vc+12>>>0]==0&&(Et(c,!0),Xe--),Y(c,!1),It.push(c),Ka(o)}var Bt=0,br=()=>{ce(0,0);var o=It.pop();Ha(o.ed),Bt=0};function Et(o,c){c=c?1:0,($(),H)[o.Vc+12>>>0]=c}function Y(o,c){c=c?1:0,($(),H)[o.Vc+13>>>0]=c}class pe{constructor(c){this.ed=c,this.Vc=c-24}}var Ce=o=>{var c=Bt;if(!c)return Ur(0),0;var m=new pe(c);($(),P)[m.Vc+16>>>2>>>0]=c;var f=($(),P)[m.Vc+4>>>2>>>0];if(!f)return Ur(0),c;for(var x of o){if(x===0||x===f)break;if(ja(x,f,m.Vc+16))return Ur(x),c}return Ur(f),c};function ae(){return Ce([])}function Ne(o){return Ce([o>>>0])}function at(o,c,m,f){return Ce([o>>>0,c>>>0,m>>>0,f>>>0])}var er=()=>{var o=It.pop();o||he("no exception to throw");var c=o.ed;throw($(),H)[o.Vc+13>>>0]==0&&(It.push(o),Y(o,!0),Et(o,!1),Xe++),fi(c),Bt=c};function fe(o,c,m){var f=new pe(o>>>=0);throw c>>>=0,m>>>=0,($(),P)[f.Vc+16>>>2>>>0]=0,($(),P)[f.Vc+4>>>2>>>0]=c,($(),P)[f.Vc+8>>>2>>>0]=m,fi(o),Xe++,Bt=o}var We=()=>Xe;function tr(o,c,m,f){return i?ve(2,1,o,c,m,f):Te(o,c,m,f)}function Te(o,c,m,f){if(o>>>=0,c>>>=0,m>>>=0,f>>>=0,!globalThis.SharedArrayBuffer)return 6;var x=[];return i&&x.length===0?tr(o,c,m,f):(o={Od:m,Tc:o,dd:f,ud:x},i?(o.Uc="spawnThread",postMessage(o,x),0):Nt(o))}function ln(o){throw Bt||=o>>>0,Bt}var Dt=globalThis.TextDecoder&&new TextDecoder,Mr=(o,c,m,f)=>{if(m=c+m,f)return m;for(;o[c]&&!(c>=m);)++c;return c},Re=(o,c=0,m,f)=>{if(16<(m=Mr(o,c>>>=0,m,f))-c&&o.buffer&&Dt)return Dt.decode(o.buffer instanceof ArrayBuffer?o.subarray(c,m):o.slice(c,m));for(f="";c<m;){var x=o[c++];if(128&x){var E=63&o[c++];if((224&x)==192)f+=String.fromCharCode((31&x)<<6|E);else{var M=63&o[c++];65536>(x=(240&x)==224?(15&x)<<12|E<<6|M:(7&x)<<18|E<<12|M<<6|63&o[c++])?f+=String.fromCharCode(x):(x-=65536,f+=String.fromCharCode(55296|x>>10,56320|1023&x))}}else f+=String.fromCharCode(x)}return f},we=(o,c,m)=>(o>>>=0)?Re(($(),W),o,c,m):"";function $t(o,c,m){return i?ve(3,1,o,c,m):0}function vt(o,c){if(i)return ve(4,1,o,c)}function Pt(o,c){if(i)return ve(5,1,o,c)}function Ut(o,c,m){if(i)return ve(6,1,o,c,m)}function Lt(o,c,m){return i?ve(7,1,o,c,m):0}function Ft(o,c){if(i)return ve(8,1,o,c)}function Or(o,c,m){if(i)return ve(9,1,o,c,m)}function qe(o,c,m,f){if(i)return ve(10,1,o,c,m,f)}function Nr(o,c,m,f){if(i)return ve(11,1,o,c,m,f)}function $r(o,c,m,f){if(i)return ve(12,1,o,c,m,f)}function Wt(o){if(i)return ve(13,1,o)}function dn(o,c){if(i)return ve(14,1,o,c)}function cn(o,c,m){if(i)return ve(15,1,o,c,m)}var Jn=()=>he(""),et=o=>{o>>>=0;for(var c="";;){var m=($(),W)[o++>>>0];if(!m)return c;c+=String.fromCharCode(m)}},Rr={},Br={},ei={},vr=class extends Error{constructor(o){super(o),this.name="BindingError"}};function Ct(o,c,m={}){return(function(f,x,E={}){var M=x.name;if(!f)throw new vr(`type "${M}" must have a positive integer typeid pointer`);if(Br.hasOwnProperty(f)){if(E.Bd)return;throw new vr(`Cannot register type '${M}' twice`)}Br[f]=x,delete ei[f],Rr.hasOwnProperty(f)&&(x=Rr[f],delete Rr[f],x.forEach(N=>N()))})(o,c,m)}var ma=(o,c,m)=>{switch(c){case 1:return m?f=>($(),H)[f>>>0]:f=>($(),W)[f>>>0];case 2:return m?f=>($(),G)[f>>>1>>>0]:f=>($(),j)[f>>>1>>>0];case 4:return m?f=>($(),z)[f>>>2>>>0]:f=>($(),P)[f>>>2>>>0];case 8:return m?f=>($(),V)[f>>>3>>>0]:f=>($(),oe)[f>>>3>>>0];default:throw new TypeError(`invalid integer width (${c}): ${o}`)}};function bm(o,c,m,f,x){o>>>=0,m>>>=0,c=et(c>>>0);let E=M=>M;if(f=f===0n){let M=8*m;E=N=>BigInt.asUintN(M,N),x=E(x)}Ct(o,{name:c,Qc:E,Xc:(M,N)=>(typeof N=="number"&&(N=BigInt(N)),N),Wc:ma(c,m,!f),Yc:null})}function $m(o,c,m,f){Ct(o>>>=0,{name:c=et(c>>>0),Qc:function(x){return!!x},Xc:function(x,E){return E?m:f},Wc:function(x){return this.Qc(($(),W)[x>>>0])},Yc:null})}var ga=[],rr=[0,1,,1,null,1,!0,1,!1,1];function ti(o){9<(o>>>=0)&&--rr[o+1]==0&&(rr[o]=void 0,ga.push(o))}var tt=o=>{if(!o)throw new vr(`Cannot use deleted val. handle = ${o}`);return rr[o]},ot=o=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let c=ga.pop()||rr.length;return rr[c]=o,rr[c+1]=1,c}};function ri(o){return this.Qc(($(),P)[o>>>2>>>0])}var vm={name:"emscripten::val",Qc:o=>{var c=tt(o);return ti(o),c},Xc:(o,c)=>ot(c),Wc:ri,Yc:null};function xm(o){return Ct(o>>>0,vm)}var km=(o,c)=>{switch(c){case 4:return function(m){return this.Qc(($(),ee)[m>>>2>>>0])};case 8:return function(m){return this.Qc(($(),X)[m>>>3>>>0])};default:throw new TypeError(`invalid float width (${c}): ${o}`)}};function Sm(o,c,m){m>>>=0,Ct(o>>>=0,{name:c=et(c>>>0),Qc:f=>f,Xc:(f,x)=>x,Wc:km(c,m),Yc:null})}function Tm(o,c,m,f,x){o>>>=0,m>>>=0,c=et(c>>>0);let E=N=>N;if(f===0){var M=32-8*m;E=N=>N<<M>>>M,x=E(x)}Ct(o,{name:c,Qc:E,Xc:(N,q)=>q,Wc:ma(c,m,f!==0),Yc:null})}function Im(o,c,m){function f(E){var M=($(),P)[E>>>2>>>0];return E=($(),P)[E+4>>>2>>>0],new x(($(),H).buffer,E,M)}var x=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][c];Ct(o>>>=0,{name:m=et(m>>>0),Qc:f,Wc:f},{Bd:!0})}var qt=(o,c,m)=>{var f=($(),W);if(c>>>=0,0<m){var x=c;m=c+m-1;for(var E=0;E<o.length;++E){var M=o.codePointAt(E);if(127>=M){if(c>=m)break;f[c++>>>0]=M}else if(2047>=M){if(c+1>=m)break;f[c++>>>0]=192|M>>6,f[c++>>>0]=128|63&M}else if(65535>=M){if(c+2>=m)break;f[c++>>>0]=224|M>>12,f[c++>>>0]=128|M>>6&63,f[c++>>>0]=128|63&M}else{if(c+3>=m)break;f[c++>>>0]=240|M>>18,f[c++>>>0]=128|M>>12&63,f[c++>>>0]=128|M>>6&63,f[c++>>>0]=128|63&M,E++}}f[c>>>0]=0,o=c-x}else o=0;return o},pn=o=>{for(var c=0,m=0;m<o.length;++m){var f=o.charCodeAt(m);127>=f?c++:2047>=f?c+=2:55296<=f&&57343>=f?(c+=4,++m):c+=3}return c};function Em(o,c){Ct(o>>>=0,{name:c=et(c>>>0),Qc(m){var f=($(),P)[m>>>2>>>0];return f=we(m+4,f,!0),kt(m),f},Xc(m,f){f instanceof ArrayBuffer&&(f=new Uint8Array(f));var x=typeof f=="string";if(!(x||ArrayBuffer.isView(f)&&f.BYTES_PER_ELEMENT==1))throw new vr("Cannot pass non-string to std::string");var E=x?pn(f):f.length,M=Pr(4+E+1),N=M+4;return($(),P)[M>>>2>>>0]=E,x?qt(f,N,E+1):($(),W).set(f,N>>>0),m!==null&&m.push(kt,M),M},Wc:ri,Yc(m){kt(m)}})}var _a=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,Cm=(o,c,m)=>{if(o>>>=1,16<(c=Mr(($(),j),o,c/2,m))-o&&_a)return _a.decode(($(),j).slice(o,c));for(m="";o<c;++o){var f=($(),j)[o>>>0];m+=String.fromCharCode(f)}return m},zm=(o,c,m)=>{if(m??=2147483647,2>m)return 0;var f=c;m=(m-=2)<2*o.length?m/2:o.length;for(var x=0;x<m;++x){var E=o.charCodeAt(x);($(),G)[c>>>1>>>0]=E,c+=2}return($(),G)[c>>>1>>>0]=0,c-f},Am=o=>2*o.length,Mm=(o,c,m)=>{var f="";o>>>=2;for(var x=0;!(x>=c/4);x++){var E=($(),P)[o+x>>>0];if(!E&&!m)break;f+=String.fromCodePoint(E)}return f},Om=(o,c,m)=>{if(c>>>=0,m??=2147483647,4>m)return 0;var f=c;m=f+m-4;for(var x=0;x<o.length;++x){var E=o.codePointAt(x);if(65535<E&&x++,($(),z)[c>>>2>>>0]=E,(c+=4)+4>m)break}return($(),z)[c>>>2>>>0]=0,c-f},Nm=o=>{for(var c=0,m=0;m<o.length;++m)65535<o.codePointAt(m)&&m++,c+=4;return c};function Rm(o,c,m){if(o>>>=0,c>>>=0,m=et(m>>>=0),c===2)var f=Cm,x=zm,E=Am;else f=Mm,x=Om,E=Nm;Ct(o,{name:m,Qc:M=>{var N=($(),P)[M>>>2>>>0];return N=f(M+4,N*c,!0),kt(M),N},Xc:(M,N)=>{if(typeof N!="string")throw new vr(`Cannot pass non-string to C++ string type ${m}`);var q=E(N),Q=Pr(4+q+c);return($(),P)[Q>>>2>>>0]=q/c,x(N,Q+4,q+c),M!==null&&M.push(kt,Q),Q},Wc:ri,Yc(M){kt(M)}})}function Bm(o,c){Ct(o>>>=0,{Cd:!0,name:c=et(c>>>0),Qc:()=>{},Xc:()=>{}})}function Dm(o){ci(o>>>0,!n,1,!r,131072,!1),zr()}var hn=o=>{if(!C)try{if(o(),!(0<Ke))try{i?bn()&&pi(_):Qe(_)}catch(c){c instanceof Fe||c=="unwind"||d(0,c)}}catch(c){c instanceof Fe||c=="unwind"||d(0,c)}},Pm=!Atomics.waitAsync||globalThis.navigator?.userAgent&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function ni(o){o>>>=0,Pm||(Atomics.waitAsync(($(),z),o>>>2,o).value.then(fn),o+=128,Atomics.store(($(),z),o>>>2,1))}var fn=()=>hn(()=>{var o=bn();o&&(ni(o),Ga())});function Um(o,c){(o>>>=0)==c>>>0?setTimeout(fn):i?postMessage({ad:o,Uc:"checkMailbox"}):(o=wt[o])&&o.postMessage({Uc:"checkMailbox"})}var ii=[];function Lm(o,c,m,f,x){for(c>>>=0,x>>>=0,ii.length=0,m=x>>>3,f=x+f>>>3;m<f;){var E;E=($(),V)[m++>>>0]?($(),V)[m++>>>0]:($(),X)[m++>>>0],ii.push(E)}return(c?gi[c]:Ag[o])(...ii)}var Fm=()=>{Ke=0};function Wm(o){o>>>=0,i?postMessage({Uc:"cleanupThread",Qd:o}):Cr(wt[o])}function qm(o){}var mn=o=>{try{o()}catch(c){he(c)}};function Gm(o){var c=(...m)=>{gn.push(o);try{return o(...m)}finally{C||(gn.pop(),xt&&Gt===1&&gn.length===0&&(Gt=0,Ke+=1,mn(No),typeof Fibers<"u"&&Fibers.ce()))}};return ba.set(o,c),c}var Gt=0,xt=null,ya=0,gn=[],si=new Map,wa=new Map,ba=new Map,Vm=0,ai=null,Hm=[],$a=o=>(function(c){if(!C){if(Gt===0){var m=!1,f=!1;c((x=0)=>{if(!C&&(ya=x,m=!0,f)){Gt=2,mn(()=>Ro(xt)),typeof MainLoop<"u"&&MainLoop.yd&&MainLoop.resume(),x=!1;try{var E=(function(){var q=($(),z)[xt+8>>>2>>>0];return q=wa.get(q),q=ba.get(q),--Ke,q()})()}catch(q){E=q,x=!0}var M=!1;if(!xt){var N=ai;N&&(ai=null,(x?N.reject:N.resolve)(E),M=!0)}if(x&&!M)throw E}}),f=!0,m||(Gt=1,xt=(function(){var x=Pr(65548),E=x+12;if(($(),P)[x>>>2>>>0]=E,($(),P)[x+4>>>2>>>0]=E+65536,E=gn[0],!si.has(E)){var M=Vm++;si.set(E,M),wa.set(M,E)}return E=si.get(E),($(),z)[x+8>>>2>>>0]=E,x})(),typeof MainLoop<"u"&&MainLoop.yd&&MainLoop.pause(),mn(()=>Oo(xt)))}else Gt===2?(Gt=0,mn(Bo),kt(xt),xt=null,Hm.forEach(hn)):he(`invalid state: ${Gt}`);return ya}})(c=>{o().then(c)});function jm(o){return o>>>=0,$a(async()=>{var c=await tt(o);return ot(c)})}var oi=[],Km=o=>{var c=oi.length;return oi.push(o),c},Qm=(o,c)=>{for(var m=Array(o),f=0;f<o;++f){var x=f,E=($(),P)[c+4*f>>>2>>>0],M=Br[E];if(M===void 0)throw o=`parameter ${f}`,E=Pa(E),c=et(E),kt(E),new vr(`${o} has unknown type ${c}`);m[x]=M}return m},Xm=(o,c,m)=>{var f=[];return o=o(f,m),f.length&&(($(),P)[c>>>2>>>0]=ot(f)),o},Zm={},_n=o=>{var c=Zm[o];return c===void 0?et(o):c};function Ym(o,c,m){var[f,...x]=Qm(o,c>>>0);c=f.Xc.bind(f);var E=x.map(q=>q.Wc.bind(q));o--;var M={toValue:tt};switch(o=E.map((q,Q)=>{var ue=`argFromPtr${Q}`;return M[ue]=q,`${ue}(args${Q?"+"+8*Q:""})`}),m){case 0:var N="toValue(handle)";break;case 2:N="new (toValue(handle))";break;case 3:N="";break;case 1:M.getStringOrSymbol=_n,N="toValue(handle)[getStringOrSymbol(methodName)]"}return N+=`(${o})`,f.Cd||(M.toReturnWire=c,M.emval_returnValue=Xm,N=`return emval_returnValue(toReturnWire, destructorsRef, ${N})`),N=`return function (handle, methodName, destructorsRef, args) {
  ${N}
  }`,m=new Function(Object.keys(M),N)(...Object.values(M)),N=`methodCaller<(${x.map(q=>q.name)}) => ${f.name}>`,Km(Object.defineProperty(m,"name",{value:N}))}function Jm(o,c){return c>>>=0,(o=tt(o>>>0))==tt(c)}function eg(o){return(o>>>=0)?(o=_n(o),ot(globalThis[o])):ot(globalThis)}function tg(o){return o=_n(o>>>0),ot(t[o])}function rg(o,c){return c>>>=0,o=tt(o>>>0),c=tt(c),ot(o[c])}function ng(o){9<(o>>>=0)&&(rr[o+1]+=1)}function va(o,c,m,f,x){return oi[o>>>0](c>>>0,m>>>0,f>>>0,x>>>0)}function ig(o,c,m,f,x){return va(o>>>0,c>>>0,m>>>0,f>>>0,x>>>0)}function sg(){return ot([])}function ag(o){o=tt(o>>>0);for(var c=Array(o.length),m=0;m<o.length;m++)c[m]=o[m];return ot(c)}function og(o){return ot(_n(o>>>0))}function ug(){return ot({})}function lg(o){for(var c=tt(o>>>=0);c.length;){var m=c.pop();c.pop()(m)}ti(o)}function dg(o,c,m){c>>>=0,m>>>=0,o=tt(o>>>0),c=tt(c),m=tt(m),o[c]=m}function cg(o,c){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),c>>>=0,o=new Date(1e3*o),($(),z)[c>>>2>>>0]=o.getUTCSeconds(),($(),z)[c+4>>>2>>>0]=o.getUTCMinutes(),($(),z)[c+8>>>2>>>0]=o.getUTCHours(),($(),z)[c+12>>>2>>>0]=o.getUTCDate(),($(),z)[c+16>>>2>>>0]=o.getUTCMonth(),($(),z)[c+20>>>2>>>0]=o.getUTCFullYear()-1900,($(),z)[c+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,($(),z)[c+28>>>2>>>0]=o}var xa=o=>o%4==0&&(o%100!=0||o%400==0),ka=[0,31,60,91,121,152,182,213,244,274,305,335],Sa=[0,31,59,90,120,151,181,212,243,273,304,334];function pg(o,c){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),c>>>=0,o=new Date(1e3*o),($(),z)[c>>>2>>>0]=o.getSeconds(),($(),z)[c+4>>>2>>>0]=o.getMinutes(),($(),z)[c+8>>>2>>>0]=o.getHours(),($(),z)[c+12>>>2>>>0]=o.getDate(),($(),z)[c+16>>>2>>>0]=o.getMonth(),($(),z)[c+20>>>2>>>0]=o.getFullYear()-1900,($(),z)[c+24>>>2>>>0]=o.getDay();var m=(xa(o.getFullYear())?ka:Sa)[o.getMonth()]+o.getDate()-1|0;($(),z)[c+28>>>2>>>0]=m,($(),z)[c+36>>>2>>>0]=-60*o.getTimezoneOffset(),m=new Date(o.getFullYear(),6,1).getTimezoneOffset();var f=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(m!=f&&o.getTimezoneOffset()==Math.min(f,m)),($(),z)[c+32>>>2>>>0]=o}function hg(o){o>>>=0;var c=new Date(($(),z)[o+20>>>2>>>0]+1900,($(),z)[o+16>>>2>>>0],($(),z)[o+12>>>2>>>0],($(),z)[o+8>>>2>>>0],($(),z)[o+4>>>2>>>0],($(),z)[o>>>2>>>0],0),m=($(),z)[o+32>>>2>>>0],f=c.getTimezoneOffset(),x=new Date(c.getFullYear(),6,1).getTimezoneOffset(),E=new Date(c.getFullYear(),0,1).getTimezoneOffset(),M=Math.min(E,x);return 0>m?($(),z)[o+32>>>2>>>0]=+(x!=E&&M==f):0<m!=(M==f)&&(x=Math.max(E,x),c.setTime(c.getTime()+6e4*((0<m?M:x)-f))),($(),z)[o+24>>>2>>>0]=c.getDay(),m=(xa(c.getFullYear())?ka:Sa)[c.getMonth()]+c.getDate()-1|0,($(),z)[o+28>>>2>>>0]=m,($(),z)[o>>>2>>>0]=c.getSeconds(),($(),z)[o+4>>>2>>>0]=c.getMinutes(),($(),z)[o+8>>>2>>>0]=c.getHours(),($(),z)[o+12>>>2>>>0]=c.getDate(),($(),z)[o+16>>>2>>>0]=c.getMonth(),($(),z)[o+20>>>2>>>0]=c.getYear(),o=c.getTime(),BigInt(isNaN(o)?-1:o/1e3)}function Ta(o,c,m,f,x,E,M){return i?ve(16,1,o,c,m,f,x,E,M):-52}function Ia(o,c,m,f,x,E){if(i)return ve(17,1,o,c,m,f,x,E)}var Dr={},fg=()=>performance.timeOrigin+performance.now();function Ea(o,c){if(i)return ve(18,1,o,c);if(Dr[o]&&(clearTimeout(Dr[o].id),delete Dr[o]),!c)return 0;var m=setTimeout(()=>{delete Dr[o],hn(()=>qa(o,performance.timeOrigin+performance.now()))},c);return Dr[o]={id:m,be:c},0}function mg(o,c,m,f){o>>>=0,c>>>=0,m>>>=0,f>>>=0;var x=new Date().getFullYear(),E=new Date(x,0,1).getTimezoneOffset();x=new Date(x,6,1).getTimezoneOffset();var M=Math.max(E,x);($(),P)[o>>>2>>>0]=60*M,($(),z)[c>>>2>>>0]=+(E!=x),o=(c=N=>{var q=Math.abs(N);return`UTC${0<=N?"-":"+"}${String(Math.floor(q/60)).padStart(2,"0")}${String(q%60).padStart(2,"0")}`})(E),c=c(x),x<E?(qt(o,m,17),qt(c,f,17)):(qt(o,f,17),qt(c,m,17))}var gg=()=>Date.now(),_g=1;function yg(o,c,m){if(m>>>=0,!(0<=o&&3>=o))return 28;if(o===0)o=Date.now();else{if(!_g)return 52;o=performance.timeOrigin+performance.now()}return o=Math.round(1e6*o),($(),V)[m>>>3>>>0]=BigInt(o),0}var ui=[],Ca=(o,c)=>{ui.length=0;for(var m;m=($(),W)[o++>>>0];){var f=m!=105;c+=(f&=m!=112)&&c%8?4:0,ui.push(m==112?($(),P)[c>>>2>>>0]:m==106?($(),V)[c>>>3>>>0]:m==105?($(),z)[c>>>2>>>0]:($(),X)[c>>>3>>>0]),c+=f?8:4}return ui};function wg(o,c,m){return o>>>=0,c=Ca(c>>>0,m>>>0),gi[o](...c)}function bg(o,c,m){return o>>>=0,c=Ca(c>>>0,m>>>0),gi[o](...c)}var $g=()=>{};function vg(o,c){return I(we(o>>>0,c>>>0))}var xg=()=>{throw Ke+=1,"unwind"};function kg(){return 4294901760}var Sg=()=>navigator.hardwareConcurrency,nr={},yn=o=>{var c;return(c=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+c[1]:(c=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+c[1]:0},za=o=>{for(var c of o)(o=yn(c))&&(nr[o]=c)};function Tg(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),za(o),nr.sd=yn(o[3]),nr.Md=o,nr.sd}function wn(o){if(!(o=nr[o>>>0]))return 0;var c;if(c=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=c[1];else if(c=/^\s+at (.*) \(.*\)$/.exec(o))o=c[1];else{if(!(c=/^(.+?)@/.exec(o)))return 0;o=c[1]}kt(wn.td??0),c=pn(o)+1;var m=Pr(c);return m&&qt(o,m,c),wn.td=m,wn.td}function Ig(o){o>>>=0;var c=($(),W).length;if(o<=c||4294901760<o)return!1;for(var m=1;4>=m;m*=2){var f=c*(1+.2/m);f=Math.min(f,o+100663296);e:{f=(Math.min(4294901760,65536*Math.ceil(Math.max(o,f)/65536))-Ve.buffer.byteLength+65535)/65536|0;try{Ve.grow(f),K();var x=1;break e}catch{}x=void 0}if(x)return!0}return!1}function Eg(o,c,m){if(o>>>=0,c>>>=0,nr.sd==o)var f=nr.Md;else(f=Error().stack.toString().split(`
`))[0]=="Error"&&f.shift(),za(f);for(var x=3;f[x]&&yn(f[x])!=o;)++x;for(o=0;o<m&&f[o+x];++o)($(),z)[c+4*o>>>2>>>0]=yn(f[o+x]);return o}var li,di={},Aa=()=>{if(!li){var o,c={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(globalThis.navigator?.language??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in di)di[o]===void 0?delete c[o]:c[o]=di[o];var m=[];for(o in c)m.push(`${o}=${c[o]}`);li=m}return li};function Ma(o,c){if(i)return ve(19,1,o,c);o>>>=0,c>>>=0;var m,f=0,x=0;for(m of Aa()){var E=c+f;($(),P)[o+x>>>2>>>0]=E,f+=qt(m,E,1/0)+1,x+=4}return 0}function Oa(o,c){if(i)return ve(20,1,o,c);o>>>=0,c>>>=0;var m=Aa();for(var f of(($(),P)[o>>>2>>>0]=m.length,o=0,m))o+=pn(f)+1;return($(),P)[c>>>2>>>0]=o,0}function Na(o){return i?ve(21,1,o):52}function Ra(o,c,m,f){return i?ve(22,1,o,c,m,f):52}function Ba(o,c,m,f){return i?ve(23,1,o,c,m,f):70}var Cg=[null,[],[]];function Da(o,c,m,f){if(i)return ve(24,1,o,c,m,f);c>>>=0,m>>>=0,f>>>=0;for(var x=0,E=0;E<m;E++){var M=($(),P)[c>>>2>>>0],N=($(),P)[c+4>>>2>>>0];c+=8;for(var q=0;q<N;q++){var Q=o,ue=($(),W)[M+q>>>0],ge=Cg[Q];ue===0||ue===10?((Q===1?S:I)(Re(ge)),ge.length=0):ge.push(ue)}x+=N}return($(),P)[f>>>2>>>0]=x,0}function zg(o){return o>>>0}i||(function(){for(var o=t.numThreads-1;o--;)Rt();$e.push(async()=>{var c=(async function(){if(!i)return Promise.all(Oe.map(bt))})();Pe++,await c,--Pe==0&&st&&(c=st,st=null,c())})})(),i||(Ve=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),K()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>de(),t.stackRestore=o=>le(o),t.stackAlloc=o=>hi(o),t.setValue=function(o,c,m="i8"){switch(m.endsWith("*")&&(m="*"),m){case"i1":case"i8":($(),H)[o>>>0]=c;break;case"i16":($(),G)[o>>>1>>>0]=c;break;case"i32":($(),z)[o>>>2>>>0]=c;break;case"i64":($(),V)[o>>>3>>>0]=BigInt(c);break;case"float":($(),ee)[o>>>2>>>0]=c;break;case"double":($(),X)[o>>>3>>>0]=c;break;case"*":($(),P)[o>>>2>>>0]=c;break;default:he(`invalid type for setValue: ${m}`)}},t.getValue=function(o,c="i8"){switch(c.endsWith("*")&&(c="*"),c){case"i1":case"i8":return($(),H)[o>>>0];case"i16":return($(),G)[o>>>1>>>0];case"i32":return($(),z)[o>>>2>>>0];case"i64":return($(),V)[o>>>3>>>0];case"float":return($(),ee)[o>>>2>>>0];case"double":return($(),X)[o>>>3>>>0];case"*":return($(),P)[o>>>2>>>0];default:he(`invalid type for getValue: ${c}`)}},t.UTF8ToString=we,t.stringToUTF8=qt,t.lengthBytesUTF8=pn;var Pa,Ua,bn,kt,Pr,ci,La,Fa,Wa,pi,qa,Ga,ce,Ur,Va,le,hi,de,Ha,fi,ja,Ka,Qa,mi,Xa,Za,Ya,Ja,eo,to,ro,no,io,so,ao,oo,uo,lo,co,po,ho,fo,mo,go,_o,yo,wo,bo,$o,vo,xo,ko,So,To,Io,Eo,Co,zo,Ao,Mo,Oo,No,Ro,Bo,zt,Ag=[Jt,je,tr,$t,vt,Pt,Ut,Lt,Ft,Or,qe,Nr,$r,Wt,dn,cn,Ta,Ia,Ea,Ma,Oa,Na,Ra,Ba,Da],gi={927244:(o,c,m,f,x)=>{if(t===void 0||!t.Zc)return 1;if((o=we(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.Zc.get(o)))return 2;if(c=Number(c>>>0),m=Number(m>>>0),f=Number(f>>>0),c+m>o.byteLength)return 3;try{let E=o.subarray(c,c+m);switch(x){case 0:($(),W).set(E,f>>>0);break;case 1:t.Xd?t.Xd(f,E):t.Ld(f,E);break;default:return 4}return 0}catch{return 4}},928068:(o,c,m)=>{t.xd(o,($(),W).subarray(c>>>0,c+m>>>0))},928132:()=>t.Zd(),928174:o=>{t.vd(o)},928211:()=>{t.Ed()},928242:()=>{t.Fd()},928271:()=>{t.Jd()},928296:o=>t.Dd(o),928329:o=>t.Hd(o),928361:(o,c,m)=>{t.jd(Number(o),Number(c),Number(m),!0)},928424:(o,c,m)=>{t.jd(Number(o),Number(c),Number(m))},928481:()=>typeof wasmOffsetConverter<"u",928538:o=>{t.ac("Abs",o,void 0)},928589:o=>{t.ac("Neg",o,void 0)},928640:o=>{t.ac("Floor",o,void 0)},928693:o=>{t.ac("Ceil",o,void 0)},928745:o=>{t.ac("Reciprocal",o,void 0)},928803:o=>{t.ac("Sqrt",o,void 0)},928855:o=>{t.ac("Exp",o,void 0)},928906:o=>{t.ac("Erf",o,void 0)},928957:o=>{t.ac("Sigmoid",o,void 0)},929012:(o,c,m)=>{t.ac("HardSigmoid",o,{alpha:c,beta:m})},929091:o=>{t.ac("Log",o,void 0)},929142:o=>{t.ac("Sin",o,void 0)},929193:o=>{t.ac("Cos",o,void 0)},929244:o=>{t.ac("Tan",o,void 0)},929295:o=>{t.ac("Asin",o,void 0)},929347:o=>{t.ac("Acos",o,void 0)},929399:o=>{t.ac("Atan",o,void 0)},929451:o=>{t.ac("Sinh",o,void 0)},929503:o=>{t.ac("Cosh",o,void 0)},929555:o=>{t.ac("Asinh",o,void 0)},929608:o=>{t.ac("Acosh",o,void 0)},929661:o=>{t.ac("Atanh",o,void 0)},929714:o=>{t.ac("Tanh",o,void 0)},929766:o=>{t.ac("Not",o,void 0)},929817:(o,c,m)=>{t.ac("Clip",o,{min:c,max:m})},929886:o=>{t.ac("Clip",o,void 0)},929938:(o,c)=>{t.ac("Elu",o,{alpha:c})},929996:o=>{t.ac("Gelu",o,void 0)},930048:o=>{t.ac("Relu",o,void 0)},930100:(o,c)=>{t.ac("LeakyRelu",o,{alpha:c})},930164:(o,c)=>{t.ac("ThresholdedRelu",o,{alpha:c})},930234:(o,c)=>{t.ac("Cast",o,{to:c})},930292:o=>{t.ac("Add",o,void 0)},930343:o=>{t.ac("Sub",o,void 0)},930394:o=>{t.ac("Mul",o,void 0)},930445:o=>{t.ac("Div",o,void 0)},930496:o=>{t.ac("Pow",o,void 0)},930547:o=>{t.ac("Equal",o,void 0)},930600:o=>{t.ac("Greater",o,void 0)},930655:o=>{t.ac("GreaterOrEqual",o,void 0)},930717:o=>{t.ac("Less",o,void 0)},930769:o=>{t.ac("LessOrEqual",o,void 0)},930828:(o,c,m,f,x)=>{t.ac("ReduceMean",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},931003:(o,c,m,f,x)=>{t.ac("ReduceMax",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},931177:(o,c,m,f,x)=>{t.ac("ReduceMin",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},931351:(o,c,m,f,x)=>{t.ac("ReduceProd",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},931526:(o,c,m,f,x)=>{t.ac("ReduceSum",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},931700:(o,c,m,f,x)=>{t.ac("ReduceL1",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},931873:(o,c,m,f,x)=>{t.ac("ReduceL2",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},932046:(o,c,m,f,x)=>{t.ac("ReduceLogSum",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},932223:(o,c,m,f,x)=>{t.ac("ReduceSumSquare",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},932403:(o,c,m,f,x)=>{t.ac("ReduceLogSumExp",o,{keepDims:!!c,noopWithEmptyAxes:!!m,axes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},932583:o=>{t.ac("Where",o,void 0)},932636:(o,c,m)=>{t.ac("Transpose",o,{perm:c?Array.from(($(),z).subarray(Number(c)>>>0,Number(m)>>>0)):[]})},932760:(o,c,m,f)=>{t.ac("DepthToSpace",o,{blocksize:c,mode:we(m),format:f?"NHWC":"NCHW"})},932893:(o,c,m,f)=>{t.ac("DepthToSpace",o,{blocksize:c,mode:we(m),format:f?"NHWC":"NCHW"})},933026:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze,Vt)=>{t.ac("ConvTranspose",o,{format:q?"NHWC":"NCHW",autoPad:c,dilations:[m],group:f,kernelShape:[x],pads:[E,M],strides:[N],wIsConst:()=>!!($(),H)[Q>>>0],outputPadding:ue?Array.from(($(),z).subarray(Number(ue)>>>0,Number(ge)>>>0)):[],outputShape:xe?Array.from(($(),z).subarray(Number(xe)>>>0,Number(ze)>>>0)):[],activation:we(Vt)})},933459:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze)=>{t.ac("ConvTranspose",o,{format:N?"NHWC":"NCHW",autoPad:c,dilations:Array.from(($(),z).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:f,kernelShape:Array.from(($(),z).subarray(Number(x)>>>0,2+(Number(x)>>>0)>>>0)),pads:Array.from(($(),z).subarray(Number(E)>>>0,4+(Number(E)>>>0)>>>0)),strides:Array.from(($(),z).subarray(Number(M)>>>0,2+(Number(M)>>>0)>>>0)),wIsConst:()=>!!($(),H)[q>>>0],outputPadding:Q?Array.from(($(),z).subarray(Number(Q)>>>0,Number(ue)>>>0)):[],outputShape:ge?Array.from(($(),z).subarray(Number(ge)>>>0,Number(xe)>>>0)):[],activation:we(ze)})},934120:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze,Vt)=>{t.ac("ConvTranspose",o,{format:q?"NHWC":"NCHW",autoPad:c,dilations:[m],group:f,kernelShape:[x],pads:[E,M],strides:[N],wIsConst:()=>!!($(),H)[Q>>>0],outputPadding:ue?Array.from(($(),z).subarray(Number(ue)>>>0,Number(ge)>>>0)):[],outputShape:xe?Array.from(($(),z).subarray(Number(xe)>>>0,Number(ze)>>>0)):[],activation:we(Vt)})},934553:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze)=>{t.ac("ConvTranspose",o,{format:N?"NHWC":"NCHW",autoPad:c,dilations:Array.from(($(),z).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:f,kernelShape:Array.from(($(),z).subarray(Number(x)>>>0,2+(Number(x)>>>0)>>>0)),pads:Array.from(($(),z).subarray(Number(E)>>>0,4+(Number(E)>>>0)>>>0)),strides:Array.from(($(),z).subarray(Number(M)>>>0,2+(Number(M)>>>0)>>>0)),wIsConst:()=>!!($(),H)[q>>>0],outputPadding:Q?Array.from(($(),z).subarray(Number(Q)>>>0,Number(ue)>>>0)):[],outputShape:ge?Array.from(($(),z).subarray(Number(ge)>>>0,Number(xe)>>>0)):[],activation:we(ze)})},935214:(o,c)=>{t.ac("GlobalAveragePool",o,{format:c?"NHWC":"NCHW"})},935305:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze)=>{t.ac("AveragePool",o,{format:ze?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from(($(),z).subarray(Number(E)>>>0,Number(M)>>>0)):[],kernel_shape:N?Array.from(($(),z).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:Q?Array.from(($(),z).subarray(Number(Q)>>>0,Number(ue)>>>0)):[],strides:ge?Array.from(($(),z).subarray(Number(ge)>>>0,Number(xe)>>>0)):[]})},935784:(o,c)=>{t.ac("GlobalAveragePool",o,{format:c?"NHWC":"NCHW"})},935875:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze)=>{t.ac("AveragePool",o,{format:ze?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from(($(),z).subarray(Number(E)>>>0,Number(M)>>>0)):[],kernel_shape:N?Array.from(($(),z).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:Q?Array.from(($(),z).subarray(Number(Q)>>>0,Number(ue)>>>0)):[],strides:ge?Array.from(($(),z).subarray(Number(ge)>>>0,Number(xe)>>>0)):[]})},936354:(o,c)=>{t.ac("GlobalMaxPool",o,{format:c?"NHWC":"NCHW"})},936441:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze)=>{t.ac("MaxPool",o,{format:ze?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from(($(),z).subarray(Number(E)>>>0,Number(M)>>>0)):[],kernel_shape:N?Array.from(($(),z).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:Q?Array.from(($(),z).subarray(Number(Q)>>>0,Number(ue)>>>0)):[],strides:ge?Array.from(($(),z).subarray(Number(ge)>>>0,Number(xe)>>>0)):[]})},936916:(o,c)=>{t.ac("GlobalMaxPool",o,{format:c?"NHWC":"NCHW"})},937003:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze)=>{t.ac("MaxPool",o,{format:ze?"NHWC":"NCHW",auto_pad:c,ceil_mode:m,count_include_pad:f,storage_order:x,dilations:E?Array.from(($(),z).subarray(Number(E)>>>0,Number(M)>>>0)):[],kernel_shape:N?Array.from(($(),z).subarray(Number(N)>>>0,Number(q)>>>0)):[],pads:Q?Array.from(($(),z).subarray(Number(Q)>>>0,Number(ue)>>>0)):[],strides:ge?Array.from(($(),z).subarray(Number(ge)>>>0,Number(xe)>>>0)):[]})},937478:(o,c,m,f,x)=>{t.ac("Gemm",o,{alpha:c,beta:m,transA:f,transB:x})},937582:o=>{t.ac("MatMul",o,void 0)},937636:(o,c,m,f)=>{t.ac("ArgMax",o,{keepDims:!!c,selectLastIndex:!!m,axis:f})},937744:(o,c,m,f)=>{t.ac("ArgMin",o,{keepDims:!!c,selectLastIndex:!!m,axis:f})},937852:(o,c)=>{t.ac("Softmax",o,{axis:c})},937915:(o,c)=>{t.ac("Concat",o,{axis:c})},937975:(o,c,m,f,x)=>{t.ac("Split",o,{axis:c,numOutputs:m,splitSizes:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},938131:o=>{t.ac("Expand",o,void 0)},938185:(o,c)=>{t.ac("Gather",o,{axis:Number(c)})},938256:(o,c)=>{t.ac("GatherElements",o,{axis:Number(c)})},938335:(o,c)=>{t.ac("GatherND",o,{batch_dims:Number(c)})},938414:(o,c,m,f,x,E,M,N,q,Q,ue)=>{t.ac("Resize",o,{antialias:c,axes:m?Array.from(($(),z).subarray(Number(m)>>>0,Number(f)>>>0)):[],coordinateTransformMode:we(x),cubicCoeffA:E,excludeOutside:M,extrapolationValue:N,keepAspectRatioPolicy:we(q),mode:we(Q),nearestMode:we(ue)})},938776:(o,c,m,f,x,E,M)=>{t.ac("Slice",o,{starts:c?Array.from(($(),z).subarray(Number(c)>>>0,Number(m)>>>0)):[],ends:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[],axes:E?Array.from(($(),z).subarray(Number(E)>>>0,Number(M)>>>0)):[]})},939040:o=>{t.ac("Tile",o,void 0)},939092:(o,c,m)=>{t.ac("InstanceNormalization",o,{epsilon:c,format:m?"NHWC":"NCHW"})},939206:(o,c,m)=>{t.ac("InstanceNormalization",o,{epsilon:c,format:m?"NHWC":"NCHW"})},939320:o=>{t.ac("Range",o,void 0)},939373:(o,c)=>{t.ac("Einsum",o,{equation:we(c)})},939454:(o,c,m,f,x)=>{t.ac("Pad",o,{mode:c,value:m,pads:f?Array.from(($(),z).subarray(Number(f)>>>0,Number(x)>>>0)):[]})},939597:(o,c,m,f,x,E)=>{t.ac("BatchNormalization",o,{epsilon:c,momentum:m,spatial:!!x,trainingMode:!!f,format:E?"NHWC":"NCHW"})},939766:(o,c,m,f,x,E)=>{t.ac("BatchNormalization",o,{epsilon:c,momentum:m,spatial:!!x,trainingMode:!!f,format:E?"NHWC":"NCHW"})},939935:(o,c,m)=>{t.ac("CumSum",o,{exclusive:Number(c),reverse:Number(m)})},940032:(o,c,m)=>{t.ac("DequantizeLinear",o,{axis:c,blockSize:m})},940122:(o,c,m,f,x)=>{t.ac("GridSample",o,{align_corners:c,mode:we(m),padding_mode:we(f),format:x?"NHWC":"NCHW"})},940292:(o,c,m,f,x)=>{t.ac("GridSample",o,{align_corners:c,mode:we(m),padding_mode:we(f),format:x?"NHWC":"NCHW"})},940462:(o,c)=>{t.ac("ScatterND",o,{reduction:we(c)})},940547:(o,c,m,f,x,E,M,N,q)=>{t.ac("Attention",o,{numHeads:c,isUnidirectional:m,maskFilterValue:f,scale:x,doRotary:E,qkvHiddenSizes:M?Array.from(($(),z).subarray(Number(N)>>>0,Number(N)+M>>>0)):[],pastPresentShareBuffer:!!q})},940819:o=>{t.ac("BiasAdd",o,void 0)},940874:o=>{t.ac("BiasSplitGelu",o,void 0)},940935:o=>{t.ac("FastGelu",o,void 0)},940991:(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze,Vt,_i)=>{t.ac("Conv",o,{format:ge?"NHWC":"NCHW",auto_pad:c,dilations:m?Array.from(($(),z).subarray(Number(m)>>>0,Number(f)>>>0)):[],group:x,kernel_shape:E?Array.from(($(),z).subarray(Number(E)>>>0,Number(M)>>>0)):[],pads:N?Array.from(($(),z).subarray(Number(N)>>>0,Number(q)>>>0)):[],strides:Q?Array.from(($(),z).subarray(Number(Q)>>>0,Number(ue)>>>0)):[],w_is_const:()=>!!($(),H)[Number(xe)>>>0],activation:we(ze),activation_params:Vt?Array.from(($(),ee).subarray(Number(Vt)>>>0,Number(_i)>>>0)):[]})},941575:o=>{t.ac("Gelu",o,void 0)},941627:(o,c,m,f,x,E,M,N,q)=>{t.ac("GroupQueryAttention",o,{numHeads:c,kvNumHeads:m,scale:f,softcap:x,doRotary:E,rotaryInterleaved:M,smoothSoftmax:N,localWindowSize:q})},941844:(o,c,m,f)=>{t.ac("LayerNormalization",o,{axis:c,epsilon:m,simplified:!!f})},941955:(o,c,m,f)=>{t.ac("LayerNormalization",o,{axis:c,epsilon:m,simplified:!!f})},942066:(o,c,m,f,x,E)=>{t.ac("MatMulNBits",o,{k:c,n:m,accuracyLevel:f,bits:x,blockSize:E})},942193:(o,c,m,f,x,E)=>{t.ac("MultiHeadAttention",o,{numHeads:c,isUnidirectional:m,maskFilterValue:f,scale:x,doRotary:E})},942352:(o,c)=>{t.ac("QuickGelu",o,{alpha:c})},942416:(o,c,m,f,x)=>{t.ac("RotaryEmbedding",o,{interleaved:!!c,numHeads:m,rotaryEmbeddingDim:f,scale:x})},942555:(o,c,m)=>{t.ac("SkipLayerNormalization",o,{epsilon:c,simplified:!!m})},942657:(o,c,m)=>{t.ac("SkipLayerNormalization",o,{epsilon:c,simplified:!!m})},942759:(o,c,m,f)=>{t.ac("GatherBlockQuantized",o,{gatherAxis:c,quantizeAxis:m,blockSize:f})},942880:o=>{t.Id(o)},942914:(o,c)=>t.Kd(Number(o),Number(c),t.$c.Nd,t.$c.errors)};function Mg(o,c,m){return $a(async()=>{await t.Gd(Number(o),Number(c),Number(m))})}function Og(){return typeof wasmOffsetConverter<"u"}function Ng(o,c,m,f){var x=de();try{return no(o,c,m,f)}catch(E){if(le(x),E!==E+0)throw E;ce(1,0)}}function Rg(o,c,m){var f=de();try{return Ja(o,c,m)}catch(x){if(le(f),x!==x+0)throw x;ce(1,0)}}function Bg(o,c,m){var f=de();try{Qa(o,c,m)}catch(x){if(le(f),x!==x+0)throw x;ce(1,0)}}function Dg(o,c){var m=de();try{return mi(o,c)}catch(f){if(le(m),f!==f+0)throw f;ce(1,0)}}function Pg(o){var c=de();try{Xa(o)}catch(m){if(le(c),m!==m+0)throw m;ce(1,0)}}function Ug(o,c,m,f,x,E,M){var N=de();try{return to(o,c,m,f,x,E,M)}catch(q){if(le(N),q!==q+0)throw q;ce(1,0)}}function Lg(o,c){var m=de();try{io(o,c)}catch(f){if(le(m),f!==f+0)throw f;ce(1,0)}}function Fg(o,c,m,f,x,E){var M=de();try{Za(o,c,m,f,x,E)}catch(N){if(le(M),N!==N+0)throw N;ce(1,0)}}function Wg(o,c,m,f){var x=de();try{ro(o,c,m,f)}catch(E){if(le(x),E!==E+0)throw E;ce(1,0)}}function qg(o,c,m,f,x){var E=de();try{Ya(o,c,m,f,x)}catch(M){if(le(E),M!==M+0)throw M;ce(1,0)}}function Gg(o,c,m,f,x,E,M){var N=de();try{ao(o,c,m,f,x,E,M)}catch(q){if(le(N),q!==q+0)throw q;ce(1,0)}}function Vg(o,c,m,f,x,E,M){var N=de();try{oo(o,c,m,f,x,E,M)}catch(q){if(le(N),q!==q+0)throw q;ce(1,0)}}function Hg(o,c,m,f,x,E,M,N){var q=de();try{po(o,c,m,f,x,E,M,N)}catch(Q){if(le(q),Q!==Q+0)throw Q;ce(1,0)}}function jg(o,c,m,f,x){var E=de();try{return so(o,c,m,f,x)}catch(M){if(le(E),M!==M+0)throw M;ce(1,0)}}function Kg(o,c,m,f,x,E,M,N){var q=de();try{ho(o,c,m,f,x,E,M,N)}catch(Q){if(le(q),Q!==Q+0)throw Q;ce(1,0)}}function Qg(o,c,m,f,x,E,M,N,q,Q,ue,ge){var xe=de();try{uo(o,c,m,f,x,E,M,N,q,Q,ue,ge)}catch(ze){if(le(xe),ze!==ze+0)throw ze;ce(1,0)}}function Xg(o,c,m,f,x,E){var M=de();try{return lo(o,c,m,f,x,E)}catch(N){if(le(M),N!==N+0)throw N;ce(1,0)}}function Zg(o,c,m){var f=de();try{return fo(o,c,m)}catch(x){if(le(f),x!==x+0)throw x;return ce(1,0),0n}}function Yg(o,c,m,f,x,E,M,N,q){var Q=de();try{eo(o,c,m,f,x,E,M,N,q)}catch(ue){if(le(Q),ue!==ue+0)throw ue;ce(1,0)}}function Jg(o){var c=de();try{return mo(o)}catch(m){if(le(c),m!==m+0)throw m;ce(1,0)}}function e0(o,c,m){var f=de();try{return go(o,c,m)}catch(x){if(le(f),x!==x+0)throw x;ce(1,0)}}function t0(o,c){var m=de();try{return Mo(o,c)}catch(f){if(le(m),f!==f+0)throw f;return ce(1,0),0n}}function r0(o,c,m,f,x){var E=de();try{_o(o,c,m,f,x)}catch(M){if(le(E),M!==M+0)throw M;ce(1,0)}}function n0(o){var c=de();try{return yo(o)}catch(m){if(le(c),m!==m+0)throw m;return ce(1,0),0n}}function i0(o,c,m,f,x,E){var M=de();try{return ko(o,c,m,f,x,E)}catch(N){if(le(M),N!==N+0)throw N;ce(1,0)}}function s0(o,c,m,f,x,E){var M=de();try{return So(o,c,m,f,x,E)}catch(N){if(le(M),N!==N+0)throw N;ce(1,0)}}function a0(o,c,m,f,x,E,M,N){var q=de();try{return co(o,c,m,f,x,E,M,N)}catch(Q){if(le(q),Q!==Q+0)throw Q;ce(1,0)}}function o0(o,c,m,f,x){var E=de();try{return To(o,c,m,f,x)}catch(M){if(le(E),M!==M+0)throw M;return ce(1,0),0n}}function u0(o,c,m,f){var x=de();try{return Io(o,c,m,f)}catch(E){if(le(x),E!==E+0)throw E;ce(1,0)}}function l0(o,c,m,f){var x=de();try{return Eo(o,c,m,f)}catch(E){if(le(x),E!==E+0)throw E;ce(1,0)}}function d0(o,c,m,f,x,E,M,N,q,Q,ue,ge){var xe=de();try{return Co(o,c,m,f,x,E,M,N,q,Q,ue,ge)}catch(ze){if(le(xe),ze!==ze+0)throw ze;ce(1,0)}}function c0(o,c,m,f,x,E,M,N,q,Q,ue){var ge=de();try{vo(o,c,m,f,x,E,M,N,q,Q,ue)}catch(xe){if(le(ge),xe!==xe+0)throw xe;ce(1,0)}}function p0(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze,Vt,_i){var y0=de();try{xo(o,c,m,f,x,E,M,N,q,Q,ue,ge,xe,ze,Vt,_i)}catch(yi){if(le(y0),yi!==yi+0)throw yi;ce(1,0)}}function h0(o,c,m,f){var x=de();try{return zo(o,c,m,f)}catch(E){if(le(x),E!==E+0)throw E;ce(1,0)}}function f0(o,c,m,f,x){var E=de();try{return Ao(o,c,m,f,x)}catch(M){if(le(E),M!==M+0)throw M;ce(1,0)}}function m0(o,c,m){var f=de();try{return wo(o,c,m)}catch(x){if(le(f),x!==x+0)throw x;ce(1,0)}}function g0(o,c,m){var f=de();try{return bo(o,c,m)}catch(x){if(le(f),x!==x+0)throw x;ce(1,0)}}function _0(o,c,m,f){var x=de();try{$o(o,c,m,f)}catch(E){if(le(x),E!==E+0)throw E;ce(1,0)}}function $n(){if(0<Pe)st=$n;else if(i)b?.(t),re();else{for(var o=$e;0<o.length;)o.shift()(t);0<Pe?st=$n:(t.calledRun=!0,C||(re(),b?.(t)))}}return i||(zt=await Be(),$n()),t.PTR_SIZE=4,F?t:new Promise((o,c)=>{b=o,k=c})}var ft,As,v0,x0,k0,S0,L,Ir,T0,rn,Lr,Ht,pr,Do,gc,_c,I0,yc,E0,wi,Ue,wc,ke,C0,bc,$c,z0,vn,vc,xc,kc,Sc,Tc,A0,lr,Zr,bi,Ic,M0,Ec,Cc,O0,Ye,Ms,mt,zc,nn,$i,gt,nt,Qt,Xt,Ac,Mc,N0,Os,R0,B0,D0,P0,U0,Nc,it,Ns,Rc,vi,xi,Bc,L0,Dc,Pc,Uo,F0,ki,ms,Lo,Ze,Uc,xn,Fo,Wo,Si,qo,Ti,Lc,Ii,Fc,Rs,Ei,kn,Fr,Ci,Go,Vo,Ho,Bs,Ie,gr,ht,Dn,be,Ds,Wc,W0,jo,Ko,Qo,Wr,Xo,qc,q0,dr,Mt,cr,Gn,Pn,Ps,Us,gs,ne,Ls,Gc,Zo,Yo,Jo,eu,Fs,tu,me,Ot,ru,Sr,O,Un,Vc,Hc,jc,ie,Ws,Kc,zi,_s,Ai,nu,Mi,iu,Oi,Ni,Ri,su,Qc,G0,qr,au,Xc,V0,qs,Bi,Sn,Tn,ou,uu,Di,ys,lu,Zc,H0,du,ye,Me,Tr,In,De,Ge,te,Ae,ws,kr,Zt,J,Gr,R,Z,Yc,Gs,cu,Jc,se,pu,Pi,hu,fu,mu,gu,Je,ep,tp,Yt,_u,yu,wu,bu,$u,vu,xu,ku,Su,Tu,ut,rp,np,ip,sp,ap,op,up,lp,dp,cp,j0,lt,Iu,Ln,bs,dt,Eu,Cu,zu,Au,Mu,Ou,Nu,Ru,Bu,Du,ct,pp,hp,fp,mp,gp,_p,yp,wp,bp,$p,Vs,Ui,vp,xp,$s,K0,Pu,En,Uu,Lu,Fu,sn,Wu,kp,Hs,qu,Gu,Vu,Sp,Q0,Hu,ju,Tp,X0,Ku,_e,Ip,Ep,Cp,zp,Ap,Mp,Op,Np,Rp,Qu,Bp,Dp,Pp,Up,Jr,Lp,Bn,Fp,Wp,qp,Gp,Vp,Hp,jp,Kp,Qp,Xp,Zp,Yp,Jp,eh,th,rh,Li,nh,vs,xs,ih,sh,ah,Xu,Zu,oh,js,Yu,Ju,uh,Z0,el,tl,pt,lh,dh,ch,ph,hh,fh,mh,gh,_h,yh,Y0,rl,nl,il,sl,wh,bh,J0,hr,fr,mr,Ks,_r,Le,$h,Qs,vh,e_,tn,Xs,Zs,al,ol,ks,Fi,ul,Ss,ll,Fn,Ys,dl,xh,t_,cl,Wi,Vr,pl,qi,hl,kh,Sh,r_,Th,Ih,n_,fl,Cn,ml,zn,Ts,Gi,gl,_l,Is,i_,Eh,s_,yl,wl,bl,Vi,Ch,$l,Hi,vl,zh,a_,xl,Ah,Mh,o_,kl,Sl,Tl,Oh,Nh,u_,An,Hr,ji,Il,El,Cl,zl,Ki,Al,Rh,Bh,l_,Ml,Qi,Ol,Nl,Dh,d_,Rl,Ph,c_,Bl,Dl,Uh,Lh,p_,Pl,Fh,Wh,h_,Ul,Ll,qh,Gh,f_,Fl,Wl,Vh,Hh,m_,ql,Gl,jh,Kh,g_,St,At,sr,ar,Vl,Hl,jl,Kl,Ql,Xl,Zl,Yl,Qh,Xh,__,He,Jl,Zh,Xi,ed,en,Yh,Jh,td,rd,nd,id,Es,ef,tf,rf,sd,Wn,nf,sf,ad,od,Zi,ud,af,y_,Yi,ld,dd,of,w_,cd,pd,uf,b_,hd,lf,$_,fd,md,gd,df,cf,v_,_d,yd,wd,bd,$d,vd,xd,kd,pf,x_,jr,Ji,es,ts,rs,Sd,Td,ns,is,hf,ff,ss,mf,gf,as,_f,yf,wf,bf,k_,Id,Ed,$f,vf,S_,Cd,zd,xf,T_,Ad,Md,kf,Sf,I_,Od,Nd,Rd,os,Bd,Dd,Pd,Ud,Ld,Fd,Wd,qd,us,Gd,Vd,Hd,jd,Kd,Tf,If,E_,Qd,Xd,Ef,C_,Zd,Kr,Yd,ls,Jd,ec,Cf,zf,z_,tc,rc,Af,Mf,A_,ds,nc,ic,sc,Of,M_,ac,oc,Nf,O_,Rf,N_,Bf,R_,Df,uc,lc,dc,Pf,B_,Uf,Mn,cc,Lf,D_,pc,Js,ea,jt,hc,cs,qn,ta,ra,ps,na,ia,sa,Wf,Kt,rt,xr,Qr,Xr,On,hs,Nn,or,ur,fc,qf,Gf,Vf,Hf,jf,Kf,Qf,Xf,fs,mc,Zf,P_,Yf,Cs,zs,Jf,U_,L_,F_,aa=b0(()=>{ft={};As=Object.defineProperty,v0=Object.getOwnPropertyDescriptor,x0=Object.getOwnPropertyNames,k0=Object.prototype.hasOwnProperty,S0=(e=>typeof ir<"u"?ir:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof ir<"u"?ir:t)[r]}):e)(function(e){if(typeof ir<"u")return ir.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),L=(e,t)=>()=>(e&&(t=e(e=0)),t),Ir=(e,t)=>{for(var r in t)As(e,r,{get:t[r],enumerable:!0})},T0=(e,t,r,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of x0(t))!k0.call(e,i)&&i!==r&&As(e,i,{get:()=>t[i],enumerable:!(n=v0(t,i))||n.enumerable});return e},rn=e=>T0(As({},"__esModule",{value:!0}),e),_c=L(()=>{"use strict";Lr=new Map,Ht=[],pr=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let n=Lr.get(e);if(n===void 0)Lr.set(e,{backend:t,priority:r});else{if(n.priority>r)return;if(n.priority===r&&n.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let i=Ht.indexOf(e);i!==-1&&Ht.splice(i,1);for(let s=0;s<Ht.length;s++)if(Lr.get(Ht[s]).priority<=r){Ht.splice(s,0,e);return}Ht.push(e)}return}throw new TypeError("not a valid backend")},Do=async e=>{let t=Lr.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(n){return r||(t.error=`${n}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},gc=async e=>{let t=e.executionProviders||[],r=t.map(l=>typeof l=="string"?l:l.name),n=r.length===0?Ht:r,i,s=[],a=new Set;for(let l of n){let d=await Do(l);typeof d=="string"?s.push({name:l,err:d}):(i||(i=d),i===d&&a.add(l))}if(!i)throw new Error(`no available backend found. ERR: ${s.map(l=>`[${l.name}] ${l.err}`).join(", ")}`);for(let{name:l,err:d}of s)r.includes(l)&&console.warn(`removing requested execution provider "${l}" from session options because it is not available: ${d}`);let u=t.filter(l=>a.has(typeof l=="string"?l:l.name));return[i,new Proxy(e,{get:(l,d)=>d==="executionProviders"?u:Reflect.get(l,d)})]}}),I0=L(()=>{"use strict";_c()}),E0=L(()=>{"use strict";yc="1.24.1"}),wc=L(()=>{"use strict";E0(),wi="warning",Ue={wasm:{},webgl:{},webgpu:{},versions:{common:yc},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);wi=e}},get logLevel(){return wi}},Object.defineProperty(Ue,"logLevel",{enumerable:!0})}),C0=L(()=>{"use strict";wc(),ke=Ue}),z0=L(()=>{"use strict";bc=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let n=r.getContext("2d");if(n!=null){let i,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(i=e.dims[2],s=e.dims[3]):(i=e.dims[3],s=e.dims[2]);let a=t?.format!==void 0?t.format:"RGB",u=t?.norm,l,d;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?d=[0,0,0,0]:typeof u.bias=="number"?d=[u.bias,u.bias,u.bias,u.bias]:(d=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(d[3]=u.bias[3]));let p=s*i,h=0,g=p,y=p*2,_=-1;a==="RGBA"?(h=0,g=p,y=p*2,_=p*3):a==="RGB"?(h=0,g=p,y=p*2):a==="RBG"&&(h=0,y=p,g=p*2);for(let b=0;b<s;b++)for(let k=0;k<i;k++){let v=(e.data[h++]-d[0])*l[0],w=(e.data[g++]-d[1])*l[1],T=(e.data[y++]-d[2])*l[2],S=_===-1?255:(e.data[_++]-d[3])*l[3];n.fillStyle="rgba("+v+","+w+","+T+","+S+")",n.fillRect(k,b,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},$c=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),n;if(r!=null){let i,s,a;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(i=e.dims[2],s=e.dims[1],a=e.dims[3]):(i=e.dims[3],s=e.dims[2],a=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",l=t?.norm,d,p;l===void 0||l.mean===void 0?d=[255,255,255,255]:typeof l.mean=="number"?d=[l.mean,l.mean,l.mean,l.mean]:(d=[l.mean[0],l.mean[1],l.mean[2],255],l.mean[3]!==void 0&&(d[3]=l.mean[3])),l===void 0||l.bias===void 0?p=[0,0,0,0]:typeof l.bias=="number"?p=[l.bias,l.bias,l.bias,l.bias]:(p=[l.bias[0],l.bias[1],l.bias[2],0],l.bias[3]!==void 0&&(p[3]=l.bias[3]));let h=s*i;if(t!==void 0&&(t.format!==void 0&&a===4&&t.format!=="RGBA"||a===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,y=0,_=1,b=2,k=3,v=0,w=h,T=h*2,S=-1;u==="RGBA"?(v=0,w=h,T=h*2,S=h*3):u==="RGB"?(v=0,w=h,T=h*2):u==="RBG"&&(v=0,T=h,w=h*2),n=r.createImageData(i,s);for(let I=0;I<s*i;y+=g,_+=g,b+=g,k+=g,I++)n.data[y]=(e.data[v++]-p[0])*d[0],n.data[_]=(e.data[w++]-p[1])*d[1],n.data[b]=(e.data[T++]-p[2])*d[2],n.data[k]=S===-1?255:(e.data[S++]-p[3])*d[3]}else throw new Error("Can not access image data");return n}}),A0=L(()=>{"use strict";Ms(),vn=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:n}=t,i=t.norm??{mean:255,bias:0},s,a;typeof i.mean=="number"?s=[i.mean,i.mean,i.mean,i.mean]:s=[i.mean[0],i.mean[1],i.mean[2],i.mean[3]??255],typeof i.bias=="number"?a=[i.bias,i.bias,i.bias,i.bias]:a=[i.bias[0],i.bias[1],i.bias[2],i.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",l=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",d=r*n,p=l==="RGBA"?new Float32Array(d*4):new Float32Array(d*3),h=4,g=0,y=1,_=2,b=3,k=0,v=d,w=d*2,T=-1;u==="RGB"&&(h=3,g=0,y=1,_=2,b=-1),l==="RGBA"?T=d*3:l==="RBG"?(k=0,w=d,v=d*2):l==="BGR"&&(w=0,v=d,k=d*2);for(let S=0;S<d;S++,g+=h,_+=h,y+=h,b+=h)p[k++]=(e[g]+a[0])/s[0],p[v++]=(e[y]+a[1])/s[1],p[w++]=(e[_]+a[2])/s[2],T!==-1&&b!==-1&&(p[T++]=(e[b]+a[3])/s[3]);return l==="RGBA"?new Ye("float32",p,[1,4,r,n]):new Ye("float32",p,[1,3,r,n])},vc=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,n=typeof ImageData<"u"&&e instanceof ImageData,i=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,s=typeof e=="string",a,u=t??{},l=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},d=p=>typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||p instanceof OffscreenCanvas?p.getContext("2d"):null;if(r){let p=l();p.width=e.width,p.height=e.height;let h=d(p);if(h!=null){let g=e.height,y=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,y=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=y}else u.tensorFormat="RGBA",u.height=g,u.width=y;h.drawImage(e,0,0),a=h.getImageData(0,0,y,g).data}else throw new Error("Can not access image data")}else if(n){let p,h;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(p=t.resizedHeight,h=t.resizedWidth):(p=e.height,h=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=p,u.width=h,t!==void 0){let g=l();g.width=h,g.height=p;let y=d(g);if(y!=null)y.putImageData(e,0,0),a=y.getImageData(0,0,h,p).data;else throw new Error("Can not access image data")}else a=e.data}else if(i){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let p=l();p.width=e.width,p.height=e.height;let h=d(p);if(h!=null){let g=e.height,y=e.width;return h.drawImage(e,0,0,y,g),a=h.getImageData(0,0,y,g).data,u.height=g,u.width=y,vn(a,u)}else throw new Error("Can not access image data")}else{if(s)return new Promise((p,h)=>{let g=l(),y=d(g);if(!e||!y)return h();let _=new Image;_.crossOrigin="Anonymous",_.src=e,_.onload=()=>{g.width=_.width,g.height=_.height,y.drawImage(_,0,0,g.width,g.height);let b=y.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,p(vn(b.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(a!==void 0)return vn(a,u);throw new Error("Input data provided is not supported - aborted tensor creation")},xc=(e,t)=>{let{width:r,height:n,download:i,dispose:s}=t,a=[1,n,r,4];return new Ye({location:"texture",type:"float32",texture:e,dims:a,download:i,dispose:s})},kc=(e,t)=>{let{dataType:r,dims:n,download:i,dispose:s}=t;return new Ye({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:n,download:i,dispose:s})},Sc=(e,t)=>{let{dataType:r,dims:n,download:i,dispose:s}=t;return new Ye({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:n,download:i,dispose:s})},Tc=(e,t,r)=>new Ye({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),M0=L(()=>{"use strict";lr=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),Zr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),bi=!1,Ic=()=>{if(!bi){bi=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,n=typeof r<"u"&&r.from;e&&(lr.set("int64",BigInt64Array),Zr.set(BigInt64Array,"int64")),t&&(lr.set("uint64",BigUint64Array),Zr.set(BigUint64Array,"uint64")),n?(lr.set("float16",r),Zr.set(r,"float16")):lr.set("float16",Uint16Array)}}}),O0=L(()=>{"use strict";Ms(),Ec=e=>{let t=1;for(let r=0;r<e.length;r++){let n=e[r];if(typeof n!="number"||!Number.isSafeInteger(n))throw new TypeError(`dims[${r}] must be an integer, got: ${n}`);if(n<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${n}`);t*=n}return t},Cc=(e,t)=>{switch(e.location){case"cpu":return new Ye(e.type,e.data,t);case"cpu-pinned":return new Ye({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Ye({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Ye({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Ye({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Ms=L(()=>{"use strict";z0(),A0(),M0(),O0(),Ye=class{constructor(e,t,r){Ic();let n,i;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,n=e.type,i=e.dims,e.location){case"cpu-pinned":{let a=lr.get(n);if(!a)throw new TypeError(`unsupported type "${n}" to create tensor from pinned buffer`);if(!(e.data instanceof a))throw new TypeError(`buffer should be of type ${a.name}`);this.cpuData=e.data;break}case"texture":{if(n!=="float32")throw new TypeError(`unsupported type "${n}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(n!=="float32"&&n!=="float16"&&n!=="int32"&&n!=="int64"&&n!=="uint32"&&n!=="uint8"&&n!=="bool"&&n!=="uint4"&&n!=="int4")throw new TypeError(`unsupported type "${n}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(n!=="float32"&&n!=="float16"&&n!=="int32"&&n!=="int64"&&n!=="uint32"&&n!=="uint64"&&n!=="int8"&&n!=="uint8"&&n!=="bool"&&n!=="uint4"&&n!=="int4")throw new TypeError(`unsupported type "${n}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let a,u;if(typeof e=="string")if(n=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");a=t}else{let l=lr.get(e);if(l===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&l===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${l.name} as data.`);e==="uint64"||e==="int64"?a=l.from(t,BigInt):a=l.from(t)}else if(t instanceof l)a=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")a=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&l!==Uint16Array)a=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${n} tensor's data must be type of ${l}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let l=typeof e[0];if(l==="string")n="string",a=e;else if(l==="boolean")n="bool",a=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${l}.`)}else if(e instanceof Uint8ClampedArray)n="uint8",a=Uint8Array.from(e);else{let l=Zr.get(e.constructor);if(l===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);n=l,a=e}if(u===void 0)u=[a.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");i=u,this.cpuData=a,this.dataLocation="cpu"}let s=Ec(i);if(this.cpuData&&s!==this.cpuData.length&&!((n==="uint4"||n==="int4")&&Math.ceil(s/2)===this.cpuData.length))throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);this.type=n,this.dims=i,this.size=s}static async fromImage(e,t){return vc(e,t)}static fromTexture(e,t){return xc(e,t)}static fromGpuBuffer(e,t){return kc(e,t)}static fromMLTensor(e,t){return Sc(e,t)}static fromPinnedBuffer(e,t,r){return Tc(e,t,r)}toDataURL(e){return bc(this,e)}toImageData(e){return $c(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return Cc(this,e)}}}),zc=L(()=>{"use strict";Ms(),mt=Ye}),Ac=L(()=>{"use strict";wc(),nn=(e,t)=>{(typeof Ue.trace>"u"?!Ue.wasm.trace:!Ue.trace)||console.timeStamp(`${e}::ORT::${t}`)},$i=(e,t)=>{let r=new Error().stack?.split(/\r\n|\r|\n/g)||[],n=!1;for(let i=0;i<r.length;i++){if(n&&!r[i].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[i].trim().split(" ")[1]}`;t&&(s+=`::${t}`),nn("CPU",s);return}r[i].includes("TRACE_FUNC")&&(n=!0)}},gt=e=>{(typeof Ue.trace>"u"?!Ue.wasm.trace:!Ue.trace)||$i("BEGIN",e)},nt=e=>{(typeof Ue.trace>"u"?!Ue.wasm.trace:!Ue.trace)||$i("END",e)},Qt=e=>{(typeof Ue.trace>"u"?!Ue.wasm.trace:!Ue.trace)||console.time(`ORT::${e}`)},Xt=e=>{(typeof Ue.trace>"u"?!Ue.wasm.trace:!Ue.trace)||console.timeEnd(`ORT::${e}`)}}),N0=L(()=>{"use strict";_c(),zc(),Ac(),Mc=class Oc{constructor(t){this.handler=t}async run(t,r,n){gt(),Qt("InferenceSession.run");let i={},s={};if(typeof t!="object"||t===null||t instanceof mt||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let a=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof mt)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");a=!1;for(let d of r){if(typeof d!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(d)===-1)throw new RangeError(`'fetches' contains invalid output name: ${d}.`);i[d]=null}if(typeof n=="object"&&n!==null)s=n;else if(typeof n<"u")throw new TypeError("'options' must be an object.")}else{let d=!1,p=Object.getOwnPropertyNames(r);for(let h of this.outputNames)if(p.indexOf(h)!==-1){let g=r[h];(g===null||g instanceof mt)&&(d=!0,a=!1,i[h]=g)}if(d){if(typeof n=="object"&&n!==null)s=n;else if(typeof n<"u")throw new TypeError("'options' must be an object.")}else s=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let d of this.inputNames)if(typeof t[d]>"u")throw new Error(`input '${d}' is missing in 'feeds'.`);if(a)for(let d of this.outputNames)i[d]=null;let u=await this.handler.run(t,i,s),l={};for(let d in u)if(Object.hasOwnProperty.call(u,d)){let p=u[d];p instanceof mt?l[d]=p:l[d]=new mt(p.type,p.data,p.dims)}return Xt("InferenceSession.run"),nt(),l}async release(){return this.handler.dispose()}static async create(t,r,n,i){gt(),Qt("InferenceSession.create");let s,a={};if(typeof t=="string"){if(s=t,typeof r=="object"&&r!==null)a=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(s=t,typeof r=="object"&&r!==null)a=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let p=t,h=0,g=t.byteLength;if(typeof r=="object"&&r!==null)a=r;else if(typeof r=="number"){if(h=r,!Number.isSafeInteger(h))throw new RangeError("'byteOffset' must be an integer.");if(h<0||h>=p.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${p.byteLength}).`);if(g=t.byteLength-h,typeof n=="number"){if(g=n,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||h+g>p.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${p.byteLength-h}].`);if(typeof i=="object"&&i!==null)a=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else if(typeof n<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");s=new Uint8Array(p,h,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,l]=await gc(a),d=await u.createInferenceSessionHandler(s,l);return Xt("InferenceSession.create"),nt(),new Oc(d)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),R0=L(()=>{"use strict";N0(),Os=Mc}),B0=L(()=>{"use strict"}),D0=L(()=>{"use strict"}),P0=L(()=>{"use strict"}),U0=L(()=>{"use strict"}),Nc={};Ir(Nc,{InferenceSession:()=>Os,TRACE:()=>nn,TRACE_EVENT_BEGIN:()=>Qt,TRACE_EVENT_END:()=>Xt,TRACE_FUNC_BEGIN:()=>gt,TRACE_FUNC_END:()=>nt,Tensor:()=>mt,env:()=>ke,registerBackend:()=>pr});it=L(()=>{"use strict";I0(),C0(),R0(),zc(),B0(),D0(),Ac(),P0(),U0()}),Ns=L(()=>{"use strict"}),Rc={};Ir(Rc,{default:()=>Bc});L0=L(()=>{"use strict";Wf(),gr(),Rs(),vi="ort-wasm-proxy-worker",xi=globalThis.self?.name===vi,xi&&(self.onmessage=e=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":Bs(r.wasm).then(()=>{Js(r).then(()=>{postMessage({type:t})},n=>{postMessage({type:t,err:n})})},n=>{postMessage({type:t,err:n})});break;case"init-ep":{let{epName:n,env:i}=r;ea(i,n).then(()=>{postMessage({type:t})},s=>{postMessage({type:t,err:s})});break}case"copy-from":{let{buffer:n}=r,i=qn(n);postMessage({type:t,out:i});break}case"create":{let{model:n,options:i}=r;ta(n,i).then(s=>{postMessage({type:t,out:s})},s=>{postMessage({type:t,err:s})});break}case"release":ra(r),postMessage({type:t});break;case"run":{let{sessionId:n,inputIndices:i,inputs:s,outputIndices:a,options:u}=r;na(n,i,s,a,new Array(a.length).fill(null),u).then(l=>{l.some(d=>d[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:l},sa([...s,...l]))},l=>{postMessage({type:t,err:l})});break}case"end-profiling":ia(r),postMessage({type:t});break;default:}}catch(n){postMessage({type:t,err:n})}}),Bc=xi?null:e=>new Worker(e??Ze,{type:"module",name:vi})}),Dc={};Ir(Dc,{default:()=>Pc});F0=L(()=>{"use strict";Pc=Po,Uo=globalThis.self?.name?.startsWith("em-pthread"),Uo&&Po()}),Rs=L(()=>{"use strict";Ns(),ki=typeof location>"u"?void 0:location.origin,ms=ft.url>"file:"&&ft.url<"file;",Lo=()=>{if(ms){let e=URL;return new URL(new e("ort.bundle.min.mjs",ft.url).href,ki).href}return ft.url},Ze=Lo(),Uc=()=>{if(Ze&&!Ze.startsWith("blob:"))return Ze.substring(0,Ze.lastIndexOf("/")+1)},xn=(e,t)=>{try{let r=t??Ze;return(r?new URL(e,r):new URL(e)).origin===ki}catch{return!1}},Fo=(e,t)=>{let r=t??Ze;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Wo=(e,t)=>`${t??"./"}${e}`,Si=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},qo=async e=>(await import(e)).default,Ti=(L0(),rn(Rc)).default,Lc=async()=>{if(!Ze)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(xn(Ze))return[void 0,Ti()];let e=await Si(Ze);return[e,Ti(e)]},Ii=(F0(),rn(Dc)).default,Fc=async(e,t,r,n)=>{let i=Ii&&!(e||t);if(i)if(Ze)i=xn(Ze);else if(n&&!r)i=!0;else throw new Error("cannot determine the script source URL.");if(i)return[void 0,Ii];{let s="ort-wasm-simd-threaded.jsep.mjs",a=e??Fo(s,t),u=r&&a&&!xn(a,t),l=u?await Si(a):a??Wo(s,t);return[u?l:void 0,await qo(l)]}}}),gr=L(()=>{"use strict";Rs(),kn=!1,Fr=!1,Ci=!1,Go=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Vo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Ho=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Bs=async e=>{if(kn)return Promise.resolve();if(Fr)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Ci)throw new Error("previous call to 'initializeWebAssembly()' failed.");Fr=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Ho())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Vo())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let n=Go();r>1&&!n&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let i=e.wasmPaths,s=typeof i=="string"?i:void 0,a=i?.mjs,u=a?.href??a,l=i?.wasm,d=l?.href??l,p=e.wasmBinary,[h,g]=await Fc(u,s,r>1,!!p||!!d),y=!1,_=[];if(t>0&&_.push(new Promise(b=>{setTimeout(()=>{y=!0,b()},t)})),_.push(new Promise((b,k)=>{let v={numThreads:r};if(p)v.wasmBinary=p;else if(d||s)v.locateFile=w=>d??s+w;else if(u&&u.indexOf("blob:")!==0)v.locateFile=w=>new URL(w,u).href;else if(h){let w=Uc();w&&(v.locateFile=T=>w+T)}g(v).then(w=>{Fr=!1,kn=!0,Ei=w,b(),h&&URL.revokeObjectURL(h)},w=>{Fr=!1,Ci=!0,k(w)})})),await Promise.race(_),y)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},Ie=()=>{if(kn&&Ei)return Ei;throw new Error("WebAssembly is not initialized yet.")}}),Ds=L(()=>{"use strict";gr(),ht=(e,t)=>{let r=Ie(),n=r.lengthBytesUTF8(e)+1,i=r._malloc(n);return r.stringToUTF8(e,i,n),t.push(i),i},Dn=(e,t,r,n)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([i,s])=>{let a=t?t+i:i;if(typeof s=="object")Dn(s,a+".",r,n);else if(typeof s=="string"||typeof s=="number")n(a,s.toString());else if(typeof s=="boolean")n(a,s?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof s}`)})},be=e=>{let t=Ie(),r=t.stackSave();try{let n=t.PTR_SIZE,i=t.stackAlloc(2*n);t._OrtGetLastError(i,i+n);let s=Number(t.getValue(i,n===4?"i32":"i64")),a=t.getValue(i+n,"*"),u=a?t.UTF8ToString(a):"";throw new Error(`${e} ERROR_CODE: ${s}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),W0=L(()=>{"use strict";gr(),Ds(),Wc=e=>{let t=Ie(),r=0,n=[],i=e||{};try{if(e?.logSeverityLevel===void 0)i.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)i.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(i.terminate=!1);let s=0;return e?.tag!==void 0&&(s=ht(e.tag,n)),r=t._OrtCreateRunOptions(i.logSeverityLevel,i.logVerbosityLevel,!!i.terminate,s),r===0&&be("Can't create run options."),e?.extra!==void 0&&Dn(e.extra,"",new WeakSet,(a,u)=>{let l=ht(a,n),d=ht(u,n);t._OrtAddRunConfigEntry(r,l,d)!==0&&be(`Can't set a run config entry: ${a} - ${u}.`)}),[r,n]}catch(s){throw r!==0&&t._OrtReleaseRunOptions(r),n.forEach(a=>t._free(a)),s}}}),q0=L(()=>{"use strict";gr(),Ds(),jo=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},Ko=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},Qo=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},Wr=(e,t,r,n)=>{let i=ht(t,n),s=ht(r,n);Ie()._OrtAddSessionConfigEntry(e,i,s)!==0&&be(`Can't set a session config entry: ${t} - ${r}.`)},Xo=async(e,t,r)=>{let n=t.executionProviders;for(let i of n){let s=typeof i=="string"?i:i.name,a=[];switch(s){case"webnn":if(s="WEBNN",typeof i!="string"){let h=i?.deviceType;h&&Wr(e,"deviceType",h,r)}break;case"webgpu":if(s="JS",typeof i!="string"){let h=i;if(h?.preferredLayout){if(h.preferredLayout!=="NCHW"&&h.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${h.preferredLayout}`);Wr(e,"preferredLayout",h.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${s}`)}let u=ht(s,r),l=a.length,d=0,p=0;if(l>0){d=Ie()._malloc(l*Ie().PTR_SIZE),r.push(d),p=Ie()._malloc(l*Ie().PTR_SIZE),r.push(p);for(let h=0;h<l;h++)Ie().setValue(d+h*Ie().PTR_SIZE,a[h][0],"*"),Ie().setValue(p+h*Ie().PTR_SIZE,a[h][1],"*")}await Ie()._OrtAppendExecutionProvider(e,u,d,p,l)!==0&&be(`Can't append execution provider: ${s}.`)}},qc=async e=>{let t=Ie(),r=0,n=[],i=e||{};Qo(i);try{let s=jo(i.graphOptimizationLevel??"all"),a=Ko(i.executionMode??"sequential"),u=typeof i.logId=="string"?ht(i.logId,n):0,l=i.logSeverityLevel??2;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log severity level is not valid: ${l}`);let d=i.logVerbosityLevel??0;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log verbosity level is not valid: ${d}`);let p=typeof i.optimizedModelFilePath=="string"?ht(i.optimizedModelFilePath,n):0;if(r=t._OrtCreateSessionOptions(s,!!i.enableCpuMemArena,!!i.enableMemPattern,a,!!i.enableProfiling,0,u,l,d,p),r===0&&be("Can't create session options."),i.executionProviders&&await Xo(r,i,n),i.enableGraphCapture!==void 0){if(typeof i.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${i.enableGraphCapture}`);Wr(r,"enableGraphCapture",i.enableGraphCapture.toString(),n)}if(i.freeDimensionOverrides)for(let[h,g]of Object.entries(i.freeDimensionOverrides)){if(typeof h!="string")throw new Error(`free dimension override name must be a string: ${h}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let y=ht(h,n);t._OrtAddFreeDimensionOverride(r,y,g)!==0&&be(`Can't set a free dimension override: ${h} - ${g}.`)}return i.extra!==void 0&&Dn(i.extra,"",new WeakSet,(h,g)=>{Wr(r,h,g,n)}),[r,n]}catch(s){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&be("Can't release session options."),n.forEach(a=>t._free(a)),s}}}),ne=L(()=>{"use strict";dr=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},Mt=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},cr=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],n=typeof t=="number"?t:t.reduce((i,s)=>i*s,1);return r>0?Math.ceil(n*r):void 0},Gn=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Pn=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Ps=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Us=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",gs=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Gc=L(()=>{"use strict";Ns(),Ls=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),n=r?parseInt(r,10):0;if(n<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let i=t.body.getReader(),s;try{s=new ArrayBuffer(n)}catch(u){if(u instanceof RangeError){let l=Math.ceil(n/65536);s=new WebAssembly.Memory({initial:l,maximum:l}).buffer}else throw u}let a=0;for(;;){let{done:u,value:l}=await i.read();if(u)break;let d=l.byteLength;new Uint8Array(s,a,d).set(l),a+=d}return new Uint8Array(s,0,n)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),Ot=L(()=>{"use strict";ne(),Zo=["V","I","W","E","F"],Yo=(e,t)=>{console.log(`[${Zo[e]},${new Date().toISOString()}]${t}`)},Fs=(e,t)=>{Jo=e,eu=t},tu=(e,t)=>{let r=Pn(e),n=Pn(Jo);r>=n&&Yo(r,typeof t=="function"?t():t)},me=(...e)=>{eu&&tu(...e)}}),ie=L(()=>{"use strict";ru=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Sr=class{static calcShape(e,t,r=!1){let n=e.length,i=t.length;if(n===0)return t;if(i===0)return e;let s=Math.max(e.length,t.length),a=new Array(s);if(r){if(n<2||i<2)return;let u=ru.calcMatMulShape([e[n-2],e[n-1]],[t[i-2],t[i-1]]);if(u===void 0)return;[a[s-2],a[s-1]]=u}for(let u=r?3:1;u<=s;u++){let l=n-u<0?1:e[n-u],d=i-u<0?1:t[i-u];if(l!==d&&l>1&&d>1)return;let p=Math.max(l,d);if(l&&d)a[s-u]=Math.max(l,d);else{if(p>1)return;a[s-u]=0}}return a}static isValidBroadcast(e,t){let r=e.length,n=t.length;if(r>n)return!1;for(let i=1;i<=r;i++)if(e[r-i]!==1&&e[r-i]!==t[n-i])return!1;return!0}},O=class Rn{static size(t){return Rn.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let n=t.length;if(n===0)return[];let i=new Array(n),s=n-1;for(;s>=0;){if(t[s]%r===0){i[s]=t[s]/r;break}if(r%t[s]!==0)throw new Error("cannot convert shape");i[s]=1,r/=t[s],s--}for(s--;s>=0;s--)i[s]=t[s];return i}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Rn.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Rn.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,n){let i=1;for(let s=r;s<n;s++){if(t[s]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");i*=Number(t[s])}return i}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let n=new Array(r);n[r-1]=1,n[r-2]=t[r-1];for(let i=r-3;i>=0;--i)n[i]=n[i+1]*t[i+1];return n}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(n=>this.normalizeAxis(n,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(n=>t[n]):t.slice().reverse()}static padShape(t,r){let n=t.length;return t.map((i,s)=>i+r[s]+r[s+n])}static areEqual(t,r){return t.length!==r.length?!1:t.every((n,i)=>n===r[i])}},Un=class Yr{static adjustPoolAttributes(t,r,n,i,s,a){if(!t&&n.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=n.length?n.push(r[u+2]):n[u]=r[u+2];for(let u=0;u<n.length;u++)if(u<i.length){if(i[u]<0)throw new Error("strides should be greater than or equal to 1")}else i.push(1);for(let u=0;u<n.length;u++)if(u<s.length){if(s[u]<0)throw new Error("dilations should be greater than or equal to 1")}else s.push(1);for(let u=0;u<n.length*2;u++)if(u<a.length){if(a[u]<0)throw new Error("pad should be greater than or equal to 1")}else a.push(0);for(let u=0;u<n.length;u++){if(n[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(a[u]>=n[u]||a[u+n.length]>=n[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,n,i,s,a,u){if(u){if(s.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(i.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let l=0;l<t.length-2;l++)Yr.adjustPadAndReturnShape(t[l+(a?1:2)],r[l],n[l],i[l],s,l,l+t.length-2,u)}}static computePoolOutputShape(t,r,n,i,s,a,u){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let l=[r[0],r[1]];return Yr.computeShapeHelper(t,r,l,n,i,s,a,u),l}static computeConvOutputShape(t,r,n,i,s,a,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let l=[t[0],r[0]];return Yr.computeShapeHelper(!1,t,l,n,i,s,a,u),l}static computeShapeHelper(t,r,n,i,s,a,u,l){if(t)for(let d=0;d<r.length-2;d++)n.push(1);else for(let d=0;d<r.length-2;d++)n.push(Yr.adjustPadAndReturnShape(r[d+2],i[d],s[d],a[d],u,d,d+r.length-2,l))}static adjustPadAndReturnShape(t,r,n,i,s,a,u,l){let d=n*(i-1)+1;if(l&&l!=="NOTSET")switch(l){case"VALID":return s[a]=0,s[u]=0,Math.floor((t-d)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(n!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let p=((t+r-1)/r-1)*r+i-t;return s[a]=Math.floor(l==="SAME_LOWER"?(p+1)/2:p/2),s[u]=p-s[a],Math.floor((t+p-i)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+s[a]+s[u]-d)/r+1)}},Vc=class{static getShapeOfGemmResult(e,t,r,n,i){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let s,a,u;t?(s=e[1],a=e[0]):(s=e[0],a=e[1]);let l=-1;if(n?(u=r[0],l=1):(u=r[1],l=0),r[l]!==a)throw new Error("dimension mismatch");if(s<=0||u<=0||a<=0)throw new Error("invalid shape specified");if(i&&!Sr.isValidBroadcast(i,[s,u]))throw new Error("gemm: invalid bias shape for broadcast");return[s,u,a]}},Hc=-34028234663852886e22,jc=34028234663852886e22}),Kc=L(()=>{"use strict";ne(),Ws=(e,t)=>new(Gn(t))(e)}),G0=L(()=>{"use strict";ne(),Ot(),zi=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),_s=(e,t)=>{if(t==="int32")return e;let r=zi.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let n=r/8;if(e.byteLength%n!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${n}.`);let i=e.byteLength/n,s=new(Gn(t))(e.buffer,e.byteOffset,i);switch(t){case"int64":case"uint64":{let a=new Int32Array(i);for(let u=0;u<i;u++){let l=s[u];if(l>2147483647n||l<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");a[u]=Number(l)}return new Uint8Array(a.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&s.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let a=Int32Array.from(s,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Ai=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,n=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let i=BigInt64Array.from(n,BigInt);return new Uint8Array(i.buffer)}case"uint64":{if(n.some(s=>s<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let i=BigUint64Array.from(n,BigInt);return new Uint8Array(i.buffer)}case"int8":{if(n.some(s=>s<-128||s>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let i=Int8Array.from(n,Number);return new Uint8Array(i.buffer)}case"uint8":{if(n.some(i=>i<0||i>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(n,Number)}case"uint32":{if(n.some(s=>s<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let i=Uint32Array.from(n,Number);return new Uint8Array(i.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},nu=1,Mi=()=>nu++,iu=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Oi=(e,t)=>{let r=zi.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((n,i)=>n*i)*r/8):0},Ni=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:n,dataType:i,shape:s,fallbackDataType:a}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=n,this.dataType=i,this.tensorShape=s,this.fallbackDataType=a}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Oi(this.dataType,this.tensorShape)}destroy(){me("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Ai(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((n,i)=>n===r[i])}setIsDataConverted(e){this.isDataConverted=e}},Ri=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,n){let i=this.tensorManager.getMLContext(e),s=this.tensorManager.getMLOpSupportLimits(e),a;if(!s?.input.dataTypes.includes(t)){if(a=iu.get(t),!a||s?.input.dataTypes.includes(a))throw new Error(`WebNN backend does not support data type: ${t}`);me("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${a}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(i,t,r))return this.wrapper.tensor;if(n){if(this.wrapper.byteLength!==Oi(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,a),n&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=_s(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else me("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?Ai(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},su=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Mi();return this.tensorTrackersById.set(e,new Ri(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,n,i){me("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${n}, copyOld: ${i}}`);let s=this.tensorTrackersById.get(t);if(!s)throw new Error("Tensor not found.");return s.ensureTensor(e,r,n,i)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){me("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,n){let i=this.getMLContext(e),s=Mi(),a=new Ni({sessionId:e,context:i,tensor:t,dataType:r,shape:n});return this.tensorTrackersById.set(s,new Ri(this,a)),this.externalTensors.add(a),s}async getCachedTensor(e,t,r,n,i,s,a){let u=this.getMLContext(e);for(let[d,p]of this.freeTensors.entries())if(p.canReuseTensor(u,t,r)){me("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${a?`fallbackDataType: ${a},`:""} shape: ${r}`);let h=this.freeTensors.splice(d,1)[0];return h.sessionId=e,h}me("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${a?`fallbackDataType: ${a},`:""} shape: ${r}}`);let l=await u.createTensor({dataType:a??t,shape:r,dimensions:r,usage:n,writable:i,readable:s});return new Ni({sessionId:e,context:u,tensor:l,dataType:t,shape:r,fallbackDataType:a})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},Qc=(...e)=>new su(...e)}),V0=L(()=>{"use strict";ne(),gr(),Kc(),G0(),Ot(),qr=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),au=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),n=Object.keys(t).sort();return r.length===n.length&&r.every((i,s)=>i===n[s]&&e[i]===t[i])},Xc=class{constructor(e){this.tensorManager=Qc(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,Fs(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){me("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){me("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)me("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(n=>n.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let n=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:n}),n}}else if(e===void 0){let r=this.mlContextCache.findIndex(n=>n.options===void 0&&n.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let n=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:n}),n}}let t=this.mlContextCache.findIndex(r=>au(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let n=this.mlContextCache.findIndex(i=>i.mlContext===t);n!==-1&&this.mlContextCache.splice(n,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){me("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,n,i){let s=qr.get(r);if(!s)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,s,n,i)}async createTemporaryTensor(e,t,r){me("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let n=qr.get(t);if(!n)throw new Error(`Unsupported ONNX data type: ${t}`);let i=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,i,n,r,!1);let s=this.temporarySessionTensorIds.get(e);return s?s.push(i):this.temporarySessionTensorIds.set(e,[i]),i}uploadTensor(e,t){if(!Ie().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");me("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return Ws(r,t)}}registerMLTensor(e,t,r,n){let i=qr.get(r);if(!i)throw new Error(`Unsupported ONNX data type: ${r}`);let s=this.tensorManager.registerTensor(e,t,i,n);return me("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${i}, dimensions: ${n}} -> {tensorId: ${s}}`),s}registerMLConstant(e,t,r,n,i,s,a=!1){if(!s)throw new Error("External mounted files are not available.");let u=e;e.startsWith("./")&&(u=e.substring(2));let l=s.get(u);if(!l)throw new Error(`File with name ${u} not found in preloaded files.`);if(t+r>l.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let d=l.slice(t,t+r).buffer,p;switch(i.dataType){case"float32":p=new Float32Array(d);break;case"float16":p=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(d):new Uint16Array(d);break;case"int32":p=new Int32Array(d);break;case"uint32":p=new Uint32Array(d);break;case"int64":if(a){let h=_s(new Uint8Array(d),"int64");p=new Int32Array(h.buffer),i.dataType="int32"}else p=new BigInt64Array(d);break;case"uint64":p=new BigUint64Array(d);break;case"int8":p=new Int8Array(d);break;case"int4":case"uint4":case"uint8":p=new Uint8Array(d);break;default:throw new Error(`Unsupported data type: ${i.dataType} in creating WebNN Constant from external data.`)}return me("verbose",()=>`[WebNN] registerMLConstant {dataType: ${i.dataType}, shape: ${i.shape}}} ${a?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),n.constant(i,p)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let n=qr.get(dr(t)),i=this.mlOpSupportLimitsBySessionId.get(e);return typeof n>"u"?!1:r?!!i?.input.dataTypes.includes(n):!!i?.output.dataTypes.includes(n)}flush(){}}}),qs=L(()=>{"use strict"}),H0=L(()=>{"use strict";Ot(),qs(),Bi=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),Sn=[],Tn=e=>Math.ceil(Number(e)/16)*16,ou=e=>{for(let t=0;t<Sn.length;t++){let r=Sn[t];if(e<=r)return r}return Math.ceil(e/16)*16},uu=1,Di=()=>uu++,ys=async(e,t,r,n)=>{let i=Tn(r),s=e.device.createBuffer({size:i,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let a=e.getCommandEncoder();e.endComputePass(),a.copyBufferToBuffer(t,0,s,0,i),e.flush(),await s.mapAsync(GPUMapMode.READ);let u=s.getMappedRange();if(n){let l=n();return l.set(new Uint8Array(u,0,r)),l}else return new Uint8Array(u.slice(0,r))}finally{s.destroy()}},lu=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Bi)Sn.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,n=t.byteOffset,i=t.byteLength,s=Tn(i),a=this.storageCache.get(e);if(!a)throw new Error("gpu data for uploading does not exist");if(Number(a.originalSize)!==i)throw new Error(`inconsistent data size. gpu data size=${a.originalSize}, data size=${i}`);let u=this.backend.device.createBuffer({mappedAtCreation:!0,size:s,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),l=u.getMappedRange();new Uint8Array(l).set(new Uint8Array(r,n,i)),u.unmap();let d=this.backend.device.createCommandEncoder();d.copyBufferToBuffer(u,0,a.gpuData.buffer,0,s),this.backend.device.queue.submit([d.finish()]),u.destroy(),me("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let n=this.storageCache.get(t);if(!n)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==n.originalSize)throw new Error("inconsistent source and destination gpu data size");let i=Tn(r.originalSize),s=this.backend.getCommandEncoder();this.backend.endComputePass(),s.copyBufferToBuffer(r.gpuData.buffer,0,n.gpuData.buffer,0,i)}registerExternalBuffer(e,t,r){let n;if(r){if(n=r[0],e===r[1])return me("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${n}, buffer is the same, skip.`),n;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else n=Di();return this.storageCache.set(n,{gpuData:{id:n,type:0,buffer:e},originalSize:t}),me("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${n}, registered.`),n}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),me("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=ou(e),n,i=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,s=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(i||s){let u=(i?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?n=u.pop():n=this.backend.device.createBuffer({size:r,usage:t}):n=this.backend.device.createBuffer({size:r,usage:t})}else n=this.backend.device.createBuffer({size:r,usage:t});let a={id:Di(),type:0,buffer:n};return this.storageCache.set(a.id,{gpuData:a,originalSize:Number(e)}),me("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${a.id}`),a}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return me("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await ys(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Bi.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(me("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},Zc=(...e)=>new lu(...e)}),Me=L(()=>{"use strict";du=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},ye=e=>new du(e)}),se=L(()=>{"use strict";ne(),ie(),Tr=64,In=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},De=(e,t=1)=>{let r=In(e,t);return typeof r=="string"?r:r[0]},Ge=(e,t=1)=>{let r=In(e,t);return typeof r=="string"?r:r[1]},te=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:O.computeStrides(r)})}),t},Ae=e=>e%4===0?4:e%2===0?2:1,ws=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,kr=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,Zt=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,J=(e,t,r,n)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?n==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:n==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,Gr=(e,t,r,n,i)=>{let s=typeof r=="number",a=s?r:r.length,u=[...new Array(a).keys()],l=a<2?"u32":a<=4?`vec${a}<u32>`:`array<u32, ${a}>`,d=In(t,i),p=typeof d=="string"?d:d[1],h=typeof d=="string"?d:d[0],g={indices:l,value:p,storage:h,tensor:t},y=D=>typeof D=="string"?D:`${D}u`,_={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},b=s?"uniforms.":"",k=`${b}${e}_shape`,v=`${b}${e}_strides`,w="";for(let D=0;D<a-1;D++)w+=`
    let dim${D} = current / ${J(v,D,a)};
    let rest${D} = current % ${J(v,D,a)};
    indices[${D}] = dim${D};
    current = rest${D};
    `;w+=`indices[${a-1}] = current;`;let T=a<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${w}
    return indices;
  }`,S=D=>(_.offsetToIndices=!0,a<2?D:`o2i_${e}(${D})`),I=[];if(a>=2)for(let D=a-1;D>=0;D--)I.push(`${J(v,D,a)} * (indices[${D}])`);let C=a<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${I.join("+")};
  }`,A=D=>(_.indicesToOffset=!0,a<2?D:`i2o_${e}(${D})`),$=(...D)=>a===0?"0u":`${g.indices}(${D.map(y).join(",")})`,B=(D,F)=>a<2?`${D}`:`${J(D,F,a)}`,U=(D,F,K)=>a<2?`${D}=${K};`:`${J(D,F,a)}=${K};`,H={},W=(D,F)=>{_.broadcastedIndicesToOffset=!0;let K=`${F.name}broadcastedIndicesTo${e}Offset`;if(K in H)return`${K}(${D})`;let re=[];for(let he=a-1;he>=0;he--){let Ee=F.indicesGet("outputIndices",he+F.rank-a);re.push(`${B(v,he)} * (${Ee} % ${B(k,he)})`)}return H[K]=`fn ${K}(outputIndices: ${F.type.indices}) -> u32 {
             return ${re.length>0?re.join("+"):"0u"};
           }`,`${K}(${D})`},G=(D,F)=>(()=>{if(g.storage===g.value)return`${e}[${D}]=${F};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${D}]=vec2<u32>(u32(${F}), select(0u, 0xFFFFFFFFu, ${F} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${D}]=vec2<u32>(u32(${F}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${D}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${F}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),j=D=>(()=>{if(g.storage===g.value)return`${e}[${D}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${D}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${D}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${D}] & 0xFFu), bool(${e}[${D}] & 0xFF00u), bool(${e}[${D}] & 0xFF0000u), bool(${e}[${D}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),z=a<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${p} {
    return ${j(`i2o_${e}(indices)`)};
  }`,P=a<2?"":(()=>{let D=u.map(K=>`d${K}: u32`).join(", "),F=u.map(K=>`d${K}`).join(", ");return`
  fn get_${e}(${D}) -> ${p} {
    return get_${e}ByIndices(${$(F)});
  }`})(),ee=(...D)=>{if(D.length!==a)throw new Error(`indices length must be ${a}`);let F=D.map(y).join(",");return a===0?j("0u"):a===1?j(F[0]):(_.get=!0,_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}(${F})`)},X=D=>a<2?j(D):(_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}ByIndices(${D})`),V=a<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${p}) {
    ${G(`i2o_${e}(indices)`,"value")}
  }`,oe=a<2?"":(()=>{let D=u.map(K=>`d${K}: u32`).join(", "),F=u.map(K=>`d${K}`).join(", ");return`
  fn set_${e}(${D}, value: ${p}) {
    set_${e}ByIndices(${$(F)}, value);
  }`})();return{impl:()=>{let D=[],F=!1;return _.offsetToIndices&&(D.push(T),F=!0),_.indicesToOffset&&(D.push(C),F=!0),_.broadcastedIndicesToOffset&&(Object.values(H).forEach(K=>D.push(K)),F=!0),_.set&&(D.push(oe),F=!0),_.setByIndices&&(D.push(V),F=!0),_.get&&(D.push(P),F=!0),_.getByIndices&&(D.push(z),F=!0),!s&&F&&D.unshift(`const ${k} = ${g.indices}(${r.join(",")});`,`const ${v} = ${g.indices}(${O.computeStrides(r).join(",")});`),D.join(`
`)},type:g,offsetToIndices:S,indicesToOffset:A,broadcastedIndicesToOffset:W,indices:$,indicesGet:B,indicesSet:U,set:(...D)=>{if(D.length!==a+1)throw new Error(`indices length must be ${a}`);let F=D[a];if(typeof F!="string")throw new Error("value must be string");let K=D.slice(0,a).map(y).join(",");return a===0?G("0u",F):a===1?G(K[0],F):(_.set=!0,_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}(${K}, ${F})`)},setByOffset:G,setByIndices:(D,F)=>a<2?G(D,F):(_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}ByIndices(${D}, ${F});`),get:ee,getByOffset:j,getByIndices:X,usage:n,name:e,strides:v,shape:k,rank:a}},R=(e,t,r,n=1)=>Gr(e,t,r,"input",n),Z=(e,t,r,n=1)=>Gr(e,t,r,"output",n),Yc=(e,t,r)=>Gr(e,t,r,"atomicOutput",1),Gs=(e,t,r,n=1)=>Gr(e,t,r,"internal",n),cu=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=Tr){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],n=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||n>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${n}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*n>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${n}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let i=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,s=i?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,a=i?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*n}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${n})
  fn main(${s}) {
    ${a}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",n=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${n}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:n}of this.uniforms)if(n&&n>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(n/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(n/4)}>`);else{let i=n==null||n===1?r:`vec${n}<${r}>`;e.push(`${t}:${i}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},Jc=(e,t)=>new cu(e,t)}),Yt=L(()=>{"use strict";ne(),ie(),Me(),se(),pu=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Pi=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),hu=(e,t)=>O.sortBasedOnPerm(e,Pi(e.length,t)),fu=(e,t,r,n)=>{let i=`fn perm(i: ${n.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let s=0;s<t;++s)i+=`a[${e[s]}]=i[${s}];`;return i+="return a;}"},mu=(e,t)=>{let r=[],n=[];for(let i=0;i<e.length;++i)e[i]!==1&&r.push(e[i]),e[t[i]]!==1&&n.push(t[i]);return{newShape:r,newPerm:n}},gu=(e,t)=>{let r=0;for(let n=0;n<e.length;++n)if(t[e[n]]!==1){if(e[n]<r)return!1;r=e[n]}return!0},Je=(e,t)=>{let r=e.dataType,n=e.dims.length,i=Pi(n,t),s=hu(e.dims,i),a=e.dims,u=s,l=n<2||gu(i,e.dims),d;if(l)return d=_=>{let b=R("input",r,a,4),k=Z("output",r,u,4);return`
  ${_.registerUniform("output_size","u32").declareVariables(b,k)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=O.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64/4)},programUniforms:[{type:12,data:Math.ceil(_/4)}]}},getShaderSource:d};let{newShape:p,newPerm:h}=mu(e.dims,i),g=O.areEqual(h,[2,3,1]),y=O.areEqual(h,[3,1,2]);if(p.length===2||g||y){a=g?[p[0],p[1]*p[2]]:y?[p[0]*p[1],p[2]]:p,u=[a[1],a[0]];let _=16;return d=b=>{let k=R("a",r,a.length),v=Z("output",r,u.length);return`
  ${b.registerUniform("output_size","u32").declareVariables(k,v)}
  var<workgroup> tile : array<array<${v.type.value}, ${_+1}>, ${_}>;
  ${b.mainStart([_,_,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${_} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${_}u + local_id.x;
    let input_row = workgroup_id_x * ${_}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${k.getByIndices(`${k.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${_}u + local_id.x;
    let output_row = workgroup_id_y * ${_}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${v.setByIndices(`${v.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let b=O.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/_),y:Math.ceil(u[0]/_)},programUniforms:[{type:12,data:b},...te(a,u)]}},getShaderSource:d}}return d=_=>{let b=R("a",r,a.length),k=Z("output",r,u.length);return`
  ${_.registerUniform("output_size","u32").declareVariables(b,k)}

  ${fu(i,n,b,k)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${k.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${k.setByOffset("global_idx",b.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let _=O.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...te(a,u)]}},getShaderSource:d}},ep=(e,t)=>{pu(e.inputs,t.perm),e.compute(Je(e.inputs[0],t.perm))},tp=e=>ye({perm:e.perm})}),j0=L(()=>{"use strict";ne(),ie(),se(),Vs(),Yt(),_u={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},yu={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},wu={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},bu={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},$u=(e,t)=>{let r=[];for(let n=t-e;n<t;++n)r.push(n);return r},vu=(e,t)=>{let r=[],n=e.length;for(let s=0;s<n;s++)t.indexOf(s)===-1&&r.push(e[s]);let i=t.map(s=>e[s]);return[r,i]},xu=(e,t)=>{let r=e.length+t.length,n=[],i=0;for(let s=0;s<r;s++)t.indexOf(s)===-1?n.push(e[i++]):n.push(1);return n},ku=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Su=(e,t)=>{let r=[];if(!ku(e,t)){for(let n=0;n<t;++n)e.indexOf(n)===-1&&r.push(n);e.forEach(n=>r.push(n))}return r},Tu=(e,t,r,n,i,s,a)=>{let u=r[0].dims,l=O.size(s),d=O.size(a),p=R("_A",r[0].dataType,u),h=Z("output",i,s),g=64;l===1&&(g=256);let y=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,_=b=>`
        ${b.registerUniform("reduceSize","u32").declareVariables(p,h)}
        ${y}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${b.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${wu[n]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${p.getByOffset("offset + k")});
           bestValue = ${_u[n]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${yu[n]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${h.setByOffset("outputIndex",`${n==="mean"?`${h.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${h.type.storage}(${bu[n]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:s,dataType:i}],dispatchGroup:{x:l},programUniforms:[{type:12,data:d}]})}},ut=(e,t,r,n)=>{let i=e.inputs.length===1?r:bs(e.inputs,r),s=i.axes;s.length===0&&!i.noopWithEmptyAxes&&(s=e.inputs[0].dims.map((y,_)=>_));let a=O.normalizeAxes(s,e.inputs[0].dims.length),u=a,l=e.inputs[0],d=Su(u,e.inputs[0].dims.length);d.length>0&&(l=e.compute(Je(e.inputs[0],d),{inputs:[0],outputs:[-1]})[0],u=$u(u.length,l.dims.length));let[p,h]=vu(l.dims,u),g=p;i.keepDims&&(g=xu(p,a)),e.compute(Tu(t,i.cacheKey,[l],n,e.inputs[0].dataType,g,h),{inputs:[l]})},rp=(e,t)=>{ut(e,"ReduceMeanShared",t,"mean")},np=(e,t)=>{ut(e,"ReduceL1Shared",t,"l1")},ip=(e,t)=>{ut(e,"ReduceL2Shared",t,"l2")},sp=(e,t)=>{ut(e,"ReduceLogSumExpShared",t,"logSumExp")},ap=(e,t)=>{ut(e,"ReduceMaxShared",t,"max")},op=(e,t)=>{ut(e,"ReduceMinShared",t,"min")},up=(e,t)=>{ut(e,"ReduceProdShared",t,"prod")},lp=(e,t)=>{ut(e,"ReduceSumShared",t,"sum")},dp=(e,t)=>{ut(e,"ReduceSumSquareShared",t,"sumSquare")},cp=(e,t)=>{ut(e,"ReduceLogSumShared",t,"logSum")}}),Vs=L(()=>{"use strict";ne(),ie(),Me(),se(),j0(),lt=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},Iu=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Ln=(e,t,r,n,i,s,a=!1,u=!1)=>{let l=[],d=r[0].dims,p=d.length,h=O.normalizeAxes(i,p),g=!u&&h.length===0;d.forEach((b,k)=>{g||h.indexOf(k)>=0?a&&l.push(1):l.push(b)});let y=l.length,_=O.size(l);return{name:e,shaderCache:t,getShaderSource:b=>{let k=[],v=R("_A",r[0].dataType,p),w=Z("output",s,y),T=n(v,w,h),S=T[2];for(let I=0,C=0;I<p;I++)g||h.indexOf(I)>=0?(a&&C++,S=`for(var j${I}: u32 = 0; j${I} < ${d[I]}; j${I}++) {
                  ${T[2].includes("last_index")?`let last_index = j${I};`:""}
                  ${v.indicesSet("input_indices",I,`j${I}`)}
                  ${S}
                }`):(k.push(`${v.indicesSet("input_indices",I,w.indicesGet("output_indices",C))};`),C++);return`

        ${b.registerUniform("output_size","u32").declareVariables(v,w)}

        ${b.mainStart()}
          ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${v.type.indices};
          let output_indices = ${w.offsetToIndices("global_idx")};

          ${k.join(`
`)}
          ${T[0]}       // init ops for reduce max/min
          ${T[1]}
          ${S}
          ${T[3]}
          ${T.length===4?w.setByOffset("global_idx","value"):T.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:l,dataType:s}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...te(d,l)]})}},bs=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(n=>r.push(Number(n))),ye({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},dt=(e,t,r,n)=>{let i=e.inputs,s=i.length===1?r:bs(i,r);e.compute(Ln(t,{hint:s.cacheKey,inputDependencies:["rank"]},[i[0]],s.noopWithEmptyAxes&&s.axes.length===0?Iu:n,s.axes,i[0].dataType,s.keepDims,s.noopWithEmptyAxes),{inputs:[0]})},Eu=(e,t)=>{lt(e.inputs),dt(e,"ReduceLogSum",t,(r,n)=>[`var value = ${n.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},Cu=(e,t)=>{lt(e.inputs),dt(e,"ReduceL1",t,(r,n)=>[`var value = ${n.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},zu=(e,t)=>{lt(e.inputs),dt(e,"ReduceL2",t,(r,n)=>[`var t = ${n.type.value}(0); var value = ${n.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Au=(e,t)=>{lt(e.inputs),dt(e,"ReduceLogSumExp",t,(r,n)=>[`var value = ${n.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Mu=(e,t)=>{lt(e.inputs),dt(e,"ReduceMax",t,(r,n,i)=>{let s=[];for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&s.push(r.indicesSet("input_indices",a,0));return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Ou=(e,t)=>{lt(e.inputs),dt(e,"ReduceMean",t,(r,n,i)=>{let s=1;for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&(s*=e.inputs[0].dims[a]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${n.type.value}(sum / ${s});`]})},Nu=(e,t)=>{lt(e.inputs),dt(e,"ReduceMin",t,(r,n,i)=>{let s=[];for(let a=0;a<r.rank;a++)(i.indexOf(a)>=0||i.length===0)&&s.push(`input_indices[${a}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Ru=(e,t)=>{lt(e.inputs),dt(e,"ReduceProd",t,(r,n)=>[`var value = ${n.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},Bu=(e,t)=>{lt(e.inputs),dt(e,"ReduceSum",t,(r,n)=>[`var value = ${n.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},Du=(e,t)=>{lt(e.inputs),dt(e,"ReduceSumSquare",t,(r,n)=>[`var t = ${n.type.value}(0); var value = ${n.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},ct=(e,t,r)=>{if(t.length===0)return r;let n=1,i=1;for(let s=0;s<t.length;s++)t.indexOf(s)===-1?n*=e[s]:i*=e[s];return i<32&&n>1024},pp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ou(e,t):rp(e,t)},hp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Cu(e,t):np(e,t)},fp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?zu(e,t):ip(e,t)},mp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Au(e,t):sp(e,t)},gp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Mu(e,t):ap(e,t)},_p=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Nu(e,t):op(e,t)},yp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ru(e,t):up(e,t)},wp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Bu(e,t):lp(e,t)},bp=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Du(e,t):dp(e,t)},$p=(e,t)=>{ct(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Eu(e,t):cp(e,t)}}),K0=L(()=>{"use strict";ne(),Me(),Vs(),Ui=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},vp=(e,t)=>{Ui(e.inputs);let r=(n,i,s)=>{let a=[];for(let u=0;u<n.rank;u++)(s.indexOf(u)>=0||s.length===0)&&a.push(`input_indices[${u}] = 0;`);return[`${a.join(`
`)}`,`var value = ${n.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${n.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${n.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",i.setByOffset("global_idx","best_index")]};e.compute(Ln("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},xp=(e,t)=>{Ui(e.inputs);let r=(n,i,s)=>{let a=[];for(let u=0;u<n.rank;u++)(s.indexOf(u)>=0||s.length===0)&&a.push(`input_indices[${u}] = 0;`);return[`${a.join(`
`)}`,`var value = ${n.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${n.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${n.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",i.setByOffset("global_idx","best_index")]};e.compute(Ln("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},$s=e=>ye(e)}),Hs=L(()=>{"use strict";ne(),ie(),qs(),se(),Pu=(e,t)=>{let r=e[0],n=e[1],i=e[2],s=e[3],a=e[4],u=e[5];if(a&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let l=r.dims[0],d=r.dims[1],p=r.dims[2];if(i.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(n.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(n.dims[0]!==p)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(i.dims[0]!==n.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let h=i.dims[0]/3,g=h,y=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let T of t.qkvHiddenSizes)if(T%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");h=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],y=t.qkvHiddenSizes[2]}let _=d;if(h!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(i.dims[0]!==h+g+y)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let b=0;if(a){if(g!==y)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(a.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(a.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(a.dims[1]!==l)throw new Error('Input "past" second dimension must be batch_size');if(a.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(a.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(b=a.dims[3])}let k=_+b,v=-1,w=0;if(s)throw new Error("Mask not supported");if(a)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==l||u.dims[1]!==t.numHeads||u.dims[2]!==d||u.dims[3]!==k)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:l,sequenceLength:d,pastSequenceLength:b,kvSequenceLength:_,totalSequenceLength:k,maxSequenceLength:v,inputHiddenSize:p,hiddenSize:h,vHiddenSize:y,headSize:Math.floor(h/t.numHeads),vHeadSize:Math.floor(y/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},En=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,Uu=(e,t,r,n,i,s,a,u)=>{let l=Ae(a?1:s),d=64,p=s/l;p<d&&(d=32);let h=Math.ceil(s/l/d),g=[{type:12,data:t},{type:12,data:r},{type:12,data:n},{type:12,data:i},{type:12,data:p},{type:12,data:h}],y=De(e.dataType,l),_=Ge(1,l),b=["type"];a&&b.push("type"),u&&b.push("type");let k=v=>{let w=Z("x",e.dataType,e.dims,l),T=[w],S=a?R("seq_lens",a.dataType,a.dims):void 0;S&&T.push(S);let I=u?R("total_sequence_length_input",u.dataType,u.dims):void 0;I&&T.push(I);let C=Ge(e.dataType),A=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${d}>;
  var<workgroup> thread_sum: array<f32, ${d}>;
  ${v.registerUniforms(A).declareVariables(...T)}
  ${v.mainStart([d,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${En(S,I,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${d}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${a?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${_}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${_}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(l){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${d}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${_}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${_}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(l){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${l}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${d}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${w.type.value}(${C}(1.0) / ${C}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${_}(x[offset + i]);
        x[offset + i] = ${w.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${a?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${w.type.value}(${C}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${d};${y};${l}`,inputDependencies:b},getShaderSource:k,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:i,z:t*r},programUniforms:g})}},Lu=(e,t,r,n,i,s,a,u,l)=>{let d=a+s.kvSequenceLength,p=[s.batchSize,s.numHeads,s.sequenceLength,d],h=e>1&&n,g=s.kvNumHeads?s.kvNumHeads:s.numHeads,y=h?[s.batchSize,g,d,s.headSize]:void 0,_=s.nReps?s.nReps:1,b=s.scale===0?1/Math.sqrt(s.headSize):s.scale,k=Ae(s.headSize),v=s.headSize/k,w=12,T={x:Math.ceil(d/w),y:Math.ceil(s.sequenceLength/w),z:s.batchSize*s.numHeads},S=[{type:12,data:s.sequenceLength},{type:12,data:v},{type:12,data:d},{type:12,data:s.numHeads},{type:12,data:s.headSize},{type:1,data:b},{type:12,data:a},{type:12,data:s.kvSequenceLength},{type:12,data:_}],I=h&&n&&O.size(n.dims)>0,C=["type","type"];I&&C.push("type"),i&&C.push("type"),u&&C.push("type"),l&&C.push("type");let A=[{dims:p,dataType:t.dataType,gpuDataType:0}];h&&A.push({dims:y,dataType:t.dataType,gpuDataType:0});let $=B=>{let U=R("q",t.dataType,t.dims,k),H=R("key",r.dataType,r.dims,k),W=[U,H];if(I){let V=R("past_key",n.dataType,n.dims,k);W.push(V)}i&&W.push(R("attention_bias",i.dataType,i.dims));let G=u?R("seq_lens",u.dataType,u.dims):void 0;G&&W.push(G);let j=l?R("total_sequence_length_input",l.dataType,l.dims):void 0;j&&W.push(j);let z=Z("output",t.dataType,p),P=[z];h&&P.push(Z("present_key",t.dataType,y,k));let ee=Ge(1,k),X=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;

  var<workgroup> tileQ: array<${U.type.storage}, ${w*w}>;
  var<workgroup> tileK: array<${U.type.storage}, ${w*w}>;
  ${B.registerUniforms(X).declareVariables(...W,...P)}
  ${B.mainStart([w,w,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${_===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${_===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${En(G,j,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${I&&h?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${h?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${ee}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${I&&h?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${h?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${ee}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(k){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${k}`)}})()};
        output[outputIdx] = ${z.type.value} (sum * uniforms.alpha) + ${i?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${k};${i!==void 0};${n!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:A,dispatchGroup:T,programUniforms:S}),getShaderSource:$}},Fu=(e,t,r,n,i,s,a=void 0,u=void 0)=>{let l=s+i.kvSequenceLength,d=i.nReps?i.nReps:1,p=i.vHiddenSize*d,h=e>1&&n,g=i.kvNumHeads?i.kvNumHeads:i.numHeads,y=h?[i.batchSize,g,l,i.headSize]:void 0,_=[i.batchSize,i.sequenceLength,p],b=12,k={x:Math.ceil(i.vHeadSize/b),y:Math.ceil(i.sequenceLength/b),z:i.batchSize*i.numHeads},v=[{type:12,data:i.sequenceLength},{type:12,data:l},{type:12,data:i.vHeadSize},{type:12,data:i.numHeads},{type:12,data:i.headSize},{type:12,data:p},{type:12,data:s},{type:12,data:i.kvSequenceLength},{type:12,data:d}],w=h&&n&&O.size(n.dims)>0,T=["type","type"];w&&T.push("type"),a&&T.push("type"),u&&T.push("type");let S=[{dims:_,dataType:t.dataType,gpuDataType:0}];h&&S.push({dims:y,dataType:t.dataType,gpuDataType:0});let I=C=>{let A=R("probs",t.dataType,t.dims),$=R("v",r.dataType,r.dims),B=[A,$];w&&B.push(R("past_value",n.dataType,n.dims));let U=a?R("seq_lens",a.dataType,a.dims):void 0;a&&B.push(U);let H=u?R("total_sequence_length_input",u.dataType,u.dims):void 0;u&&B.push(H);let W=[Z("output",t.dataType,_)];h&&W.push(Z("present_value",t.dataType,y));let G=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${b}u;
  var<workgroup> tileQ: array<${A.type.value}, ${b*b}>;
  var<workgroup> tileV: array<${A.type.value}, ${b*b}>;
  ${C.registerUniforms(G).declareVariables(...B,...W)}
  ${C.mainStart([b,b,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${d===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${d===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${En(U,H,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${w&&h?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${h?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${A.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${w&&h?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${h?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${n!==void 0};${e}`,inputDependencies:T},getRunData:()=>({outputs:S,dispatchGroup:k,programUniforms:v}),getShaderSource:I}},sn=(e,t,r,n,i,s,a,u,l,d,p=void 0,h=void 0)=>{let g=Math.min(e.outputCount,1+(a?1:0)+(u?1:0)),y=g>1?d.pastSequenceLength:0,_=y+d.kvSequenceLength,b=l&&O.size(l.dims)>0?l:void 0,k=[t,r];g>1&&a&&O.size(a.dims)>0&&k.push(a),b&&k.push(b),p&&k.push(p),h&&k.push(h);let v=e.compute(Lu(g,t,r,a,b,d,y,p,h),{inputs:k,outputs:g>1?[-1,1]:[-1]})[0];e.compute(Uu(v,d.batchSize,d.numHeads,y,d.sequenceLength,_,p,h),{inputs:p&&h?[v,p,h]:[v],outputs:[]});let w=[v,n];g>1&&u&&O.size(u.dims)>0&&w.push(u),p&&w.push(p),h&&w.push(h),e.compute(Fu(g,v,n,u,d,y,p,h),{inputs:w,outputs:g>1?[0,2]:[0]})},Wu=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],n=t.sequenceLength,i=t.inputHiddenSize,s=t.headSize,a=12,u={x:Math.ceil(t.headSize/a),y:Math.ceil(t.sequenceLength/a),z:t.batchSize*t.numHeads},l=[e.inputs[0],e.inputs[1],e.inputs[2]],d=[{type:12,data:n},{type:12,data:i},{type:12,data:s},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],p=h=>{let g=Z("output_q",l[0].dataType,r),y=Z("output_k",l[0].dataType,r),_=Z("output_v",l[0].dataType,r),b=R("input",l[0].dataType,l[0].dims),k=R("weight",l[1].dataType,l[1].dims),v=R("bias",l[2].dataType,l[2].dims),w=b.type.storage,T=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${a}u;
  var<workgroup> tileInput: array<${w}, ${a*a}>;
  var<workgroup> tileWeightQ: array<${w}, ${a*a}>;
  var<workgroup> tileWeightK: array<${w}, ${a*a}>;
  var<workgroup> tileWeightV: array<${w}, ${a*a}>;
  ${h.registerUniforms(T).declareVariables(b,k,v,g,y,_)}
  ${h.mainStart([a,a,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${w}(0);
    var valueK = ${w}(0);
    var valueV = ${w}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:d}),getShaderSource:p},{inputs:l,outputs:[-1,-1,-1]})},kp=(e,t)=>{let r=Pu(e.inputs,t),[n,i,s]=Wu(e,r);return sn(e,n,i,s,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),Q0=L(()=>{"use strict";it(),ne(),ie(),Me(),se(),qu=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(n,i,s)=>{let a=i.length;if(a!==n.length)throw new Error(`${s}: num dimensions != ${a}`);i.forEach((u,l)=>{if(u!==n[l])throw new Error(`${s}: dim[${l}] do not match`)})};if(e[0].dims.length>1){let n=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,n,"Invalid input scale"),r(e[2].dims,n,"Invalid input B"),r(e[3].dims,n,"Invalid input mean"),r(e[4].dims,n,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},Gu=(e,t)=>{let{epsilon:r,spatial:n,format:i}=t,s=e[0].dims,a=n?Ae(s[s.length-1]):1,u=i==="NHWC"&&s.length>1?a:1,l=O.size(s)/a,d=n,p=d?s.length:s,h=R("x",e[0].dataType,e[0].dims,a),g=R("scale",e[1].dataType,e[1].dims,u),y=R("bias",e[2].dataType,e[2].dims,u),_=R("inputMean",e[3].dataType,e[3].dims,u),b=R("inputVar",e[4].dataType,e[4].dims,u),k=Z("y",e[0].dataType,p,a),v=()=>{let T="";if(n)T=`let cOffset = ${s.length===1?"0u":i==="NHWC"?`outputIndices[${s.length-1}] / ${a}`:"outputIndices[1]"};`;else if(i==="NCHW")T=`
            ${k.indicesSet("outputIndices","0","0")}
            let cOffset = ${k.indicesToOffset("outputIndices")};`;else{T=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${s.length-1}];`;for(let S=1;S<g.rank;S++)T+=`cIndices[${S}] = outputIndices[${S}];`;T+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return T},w=T=>`
  const epsilon = ${r};
  ${T.registerUniform("outputSize","u32").declareVariables(h,g,y,_,b,k)}
  ${T.mainStart()}
  ${T.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${k.offsetToIndices(`global_idx * ${a}`)};
    ${v()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${y.getByOffset("cOffset")};
    let inputMean = ${_.getByOffset("cOffset")};
    let inputVar = ${b.getByOffset("cOffset")};
    let x = ${h.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${k.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${n}_${a}`,inputDependencies:d?["rank","type","type","type","type"]:void 0},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d?[{type:12,data:l},...te(s)]:[{type:12,data:l}]})}},Vu=e=>ye(e),Sp=(e,t)=>{let{inputs:r,outputCount:n}=e,i=Vu({...t,outputCount:n});if(ke.webgpu.validateInputContent&&qu(r,i),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(Gu(r,i))}}),X0=L(()=>{"use strict";ie(),se(),Hu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},ju=e=>{let t=e[0].dims,r=e[0].dims[2],n=O.size(t)/4,i=e[0].dataType,s=R("input",i,t,4),a=R("bias",i,[r],4),u=R("residual",i,t,4),l=Z("output",i,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)}}),getShaderSource:d=>`
  const channels = ${r}u / 4;
  ${d.declareVariables(s,a,u,l)}

  ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes(n)}
    let value = ${s.getByOffset("global_idx")}
      + ${a.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${l.setByOffset("global_idx","value")}
  }`}},Tp=e=>{Hu(e.inputs),e.compute(ju(e.inputs))}}),js=L(()=>{"use strict";ne(),ie(),Me(),se(),Ku=(e,t,r,n,i,s,a)=>{let u=Math.ceil(t/4),l="";typeof i=="string"?l=`${i}(a)`:l=i("a");let d=R("inputData",r,[u],4),p=Z("outputData",n,[u],4),h=[{name:"vec_size",type:"u32"}];return a&&h.push(...a),`
      ${e.registerUniforms(h).declareVariables(d,p)}

  ${s??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${d.getByOffset("global_idx")};
    ${p.setByOffset("global_idx",l)}
  }`},_e=(e,t,r,n,i,s=e.dataType,a,u)=>{let l=[{type:12,data:Math.ceil(O.size(e.dims)/4)}];return a&&l.push(...a),{name:t,shaderCache:{hint:i,inputDependencies:["type"]},getShaderSource:d=>Ku(d,O.size(e.dims),e.dataType,s,r,n,u),getRunData:d=>({outputs:[{dims:e.dims,dataType:s}],dispatchGroup:{x:Math.ceil(O.size(d[0].dims)/64/4)},programUniforms:l})}},Ip=e=>{e.compute(_e(e.inputs[0],"Abs","abs"))},Ep=e=>{e.compute(_e(e.inputs[0],"Acos","acos"))},Cp=e=>{e.compute(_e(e.inputs[0],"Acosh","acosh"))},zp=e=>{e.compute(_e(e.inputs[0],"Asin","asin"))},Ap=e=>{e.compute(_e(e.inputs[0],"Asinh","asinh"))},Mp=e=>{e.compute(_e(e.inputs[0],"Atan","atan"))},Op=e=>{e.compute(_e(e.inputs[0],"Atanh","atanh"))},Np=e=>ye(e),Rp=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(_e(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},Qu=e=>{let t,r,n=e.length>=2&&e[1].data!==0,i=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=n?e[1].getFloat32Array()[0]:-34028234663852886e22,r=i?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=n?e[1].getUint16Array()[0]:64511,r=i?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return ye({min:t,max:r})},Bp=(e,t)=>{let r=t||Qu(e.inputs),n=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"Clip",i=>`clamp(${i}, vec4<${n}>(uniforms.min), vec4<${n}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:n},{name:"max",type:n}]),{inputs:[0]})},Dp=e=>{e.compute(_e(e.inputs[0],"Ceil","ceil"))},Pp=e=>{e.compute(_e(e.inputs[0],"Cos","cos"))},Up=e=>{e.compute(_e(e.inputs[0],"Cosh","cosh"))},Jr=e=>ye(e),Lp=(e,t)=>{let r=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"Elu",n=>`elu_vf32(${n})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Bn=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,Fp=e=>{let t=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Bn(t)))},Wp=e=>{e.compute(_e(e.inputs[0],"Exp","exp"))},qp=e=>{e.compute(_e(e.inputs[0],"Floor","floor"))},Gp=e=>{let t=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Bn(t)))},Vp=(e,t)=>{let r=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"LeakyRelu",n=>`select(leaky_relu_alpha_ * ${n}, ${n}, ${n} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},Hp=e=>{e.compute(_e(e.inputs[0],"Not",t=>`!${t}`))},jp=e=>{e.compute(_e(e.inputs[0],"Neg",t=>`-${t}`))},Kp=e=>{e.compute(_e(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},Qp=e=>{let t=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},Xp=e=>{e.compute(_e(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Zp=e=>ye(e),Yp=(e,t)=>{let r=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"HardSigmoid",n=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${n} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Jp=e=>{e.compute(_e(e.inputs[0],"Sin","sin"))},eh=e=>{e.compute(_e(e.inputs[0],"Sinh","sinh"))},th=e=>{e.compute(_e(e.inputs[0],"Sqrt","sqrt"))},rh=e=>{e.compute(_e(e.inputs[0],"Tan","tan"))},Li=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,nh=e=>{e.compute(_e(e.inputs[0],"Tanh",Li))},vs=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Li("v")};
}
`,xs=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,ih=e=>{let t=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"FastGelu",xs,vs(t),void 0,e.inputs[0].dataType))},sh=(e,t)=>{let r=Ge(e.inputs[0].dataType);return e.compute(_e(e.inputs[0],"ThresholdedRelu",n=>`select(vec4<${r}>(0.0), ${n}, ${n} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},ah=e=>{e.compute(_e(e.inputs[0],"Log","log"))},Xu=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,Zu=e=>`quick_gelu_impl(${e})`,oh=(e,t)=>{let r=Ge(e.inputs[0].dataType);e.compute(_e(e.inputs[0],"QuickGelu",Zu,Xu(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),Z0=L(()=>{"use strict";ie(),se(),js(),Yu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Ju=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=R("input",e[0].dataType,e[0].dims,4),n=R("bias",e[0].dataType,[e[0].dims[2]],4),i=Z("output",e[0].dataType,t,4),s=O.size(t)/4,a=De(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,n,i)}

  ${Bn(a)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(s)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${i.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},uh=e=>{Yu(e.inputs),e.compute(Ju(e.inputs))}}),Y0=L(()=>{"use strict";ne(),ie(),se(),el=(e,t,r,n,i,s,a,u,l,d,p,h)=>{let g,y;typeof u=="string"?g=y=(w,T)=>`${u}((${w}),(${T}))`:typeof u=="function"?g=y=u:(g=u.scalar,y=u.vector);let _=Z("outputData",p,n.length,4),b=R("aData",l,t.length,4),k=R("bData",d,r.length,4),v;if(i)if(s){let w=O.size(t)===1,T=O.size(r)===1,S=t.length>0&&t[t.length-1]%4===0,I=r.length>0&&r[r.length-1]%4===0;w||T?v=_.setByOffset("global_idx",y(w?`${b.type.value}(${b.getByOffset("0")}.x)`:b.getByOffset("global_idx"),T?`${k.type.value}(${k.getByOffset("0")}.x)`:k.getByOffset("global_idx"))):v=`
            let outputIndices = ${_.offsetToIndices("global_idx * 4u")};
            let offsetA = ${b.broadcastedIndicesToOffset("outputIndices",_)};
            let offsetB = ${k.broadcastedIndicesToOffset("outputIndices",_)};
            ${_.setByOffset("global_idx",y(a||S?b.getByOffset("offsetA / 4u"):`${b.type.value}(${b.getByOffset("offsetA / 4u")}[offsetA % 4u])`,a||I?k.getByOffset("offsetB / 4u"):`${k.type.value}(${k.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else v=_.setByOffset("global_idx",y(b.getByOffset("global_idx"),k.getByOffset("global_idx")));else{if(!s)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let w=(T,S,I="")=>{let C=`aData[indexA${S}][componentA${S}]`,A=`bData[indexB${S}][componentB${S}]`;return`
            let outputIndices${S} = ${_.offsetToIndices(`global_idx * 4u + ${S}u`)};
            let offsetA${S} = ${b.broadcastedIndicesToOffset(`outputIndices${S}`,_)};
            let offsetB${S} = ${k.broadcastedIndicesToOffset(`outputIndices${S}`,_)};
            let indexA${S} = offsetA${S} / 4u;
            let indexB${S} = offsetB${S} / 4u;
            let componentA${S} = offsetA${S} % 4u;
            let componentB${S} = offsetB${S} % 4u;
            ${T}[${S}] = ${I}(${g(C,A)});
          `};p===9?v=`
            var data = vec4<u32>(0);
            ${w("data",0,"u32")}
            ${w("data",1,"u32")}
            ${w("data",2,"u32")}
            ${w("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:v=`
            ${w("outputData[global_idx]",0)}
            ${w("outputData[global_idx]",1)}
            ${w("outputData[global_idx]",2)}
            ${w("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(b,k,_)}

        ${h??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${v}
      }`},tl=(e,t,r,n,i,s,a=r.dataType)=>{let u=r.dims.map(Number),l=n.dims.map(Number),d=!O.areEqual(u,l),p=u,h=O.size(u),g=!1,y=!1,_=[d];if(d){let b=Sr.calcShape(u,l,!1);if(!b)throw new Error("Can't perform binary op on the given tensors");p=b.slice(),h=O.size(p);let k=O.size(u)===1,v=O.size(l)===1,w=u.length>0&&u[u.length-1]%4===0,T=l.length>0&&l[l.length-1]%4===0;_.push(k),_.push(v),_.push(w),_.push(T);let S=1;for(let I=1;I<p.length;I++){let C=u[u.length-I],A=l[l.length-I];if(C===A)S*=C;else break}S%4===0?(y=!0,g=!0):(k||v||w||T)&&(g=!0)}else g=!0;return _.push(g),{name:e,shaderCache:{hint:t+_.map(b=>b.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:b=>el(b,u,l,p,g,d,y,i,r.dataType,n.dataType,a,s),getRunData:()=>({outputs:[{dims:p,dataType:a}],dispatchGroup:{x:Math.ceil(h/64/4)},programUniforms:[{type:12,data:Math.ceil(O.size(p)/4)},...te(u,l,p)]})}},pt=(e,t,r,n,i,s)=>{e.compute(tl(t,i??"",e.inputs[0],e.inputs[1],r,n,s))},lh=e=>{pt(e,"Add",(t,r)=>`${t}+${r}`)},dh=e=>{pt(e,"Div",(t,r)=>`${t}/${r}`)},ch=e=>{pt(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},ph=e=>{pt(e,"Mul",(t,r)=>`${t}*${r}`)},hh=e=>{let t=R("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;pt(e,"Pow",{scalar:(r,n)=>`pow_custom(${r},${n})`,vector:(r,n)=>`pow_vector_custom(${r},${n})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},fh=e=>{pt(e,"Sub",(t,r)=>`${t}-${r}`)},mh=e=>{pt(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},gh=e=>{pt(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},_h=e=>{pt(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},yh=e=>{pt(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),J0=L(()=>{"use strict";ne(),ie(),Me(),se(),rl=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,n=e[r],i=n.dataType,s=n.dims.length;e.forEach((a,u)=>{if(u!==r){if(a.dataType!==i)throw new Error("input tensors should be one type");if(a.dims.length!==s)throw new Error("input tensors should have the same shape");a.dims.forEach((l,d)=>{if(d!==t&&l!==n.dims[d])throw new Error("non concat dimensions must match")})}})},nl=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,il=(e,t)=>{let r=e.length,n=[];for(let i=0;i<r;++i){let s=t.setByOffset("global_idx",e[i].getByIndices("indices"));r===1?n.push(s):i===0?n.push(`if (inputIndex == ${i}u) { ${s} }`):i===r-1?n.push(`else { ${s} }`):n.push(`else if (inputIndex == ${i}) { ${s} }`)}return n.join(`
`)},sl=(e,t,r,n)=>{let i=O.size(r),s=new Array(e.length),a=new Array(e.length),u=0,l=[],d=[],p=[{type:12,data:i}];for(let b=0;b<e.length;++b)u+=e[b].dims[t],s[b]=u,d.push(e[b].dims.length),a[b]=R(`input${b}`,n,d[b]),l.push("rank"),p.push({type:12,data:s[b]});for(let b=0;b<e.length;++b)p.push(...te(e[b].dims));p.push(...te(r));let h=Z("output",n,r.length),g=h.indicesGet("indices",t),y=Array.from(Array(s.length).keys()).map(b=>`uniforms.sizeInConcatAxis${b}`).join(","),_=b=>`

  ${(()=>{b.registerUniform("outputSize","u32");for(let k=0;k<e.length;k++)b.registerUniform(`sizeInConcatAxis${k}`,"u32");return b.declareVariables(...a,h)})()}

  ${nl(s.length,y)}

  ${b.mainStart()}
    ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${h.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${s.length}u>(${y});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${il(a,h)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:r,dataType:n}],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:p}),getShaderSource:_}},wh=(e,t)=>{let r=e.inputs,n=r[0].dims,i=O.normalizeAxis(t.axis,n.length);rl(r,i);let s=n.slice();s[i]=r.reduce((u,l)=>u+(l.dims.length>i?l.dims[i]:0),0);let a=r.filter(u=>O.size(u.dims)>0);e.compute(sl(a,i,s,r[0].dataType),{inputs:a})},bh=e=>ye({axis:e.axis})}),_r=L(()=>{"use strict";ne(),ie(),hr=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},fr=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},mr=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},Ks=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,n]=e?.activation_params||[.2,.5];return{activation:t,alpha:r,beta:n}}else if(t==="Clip"){let[r,n]=e?.activation_params||[Hc,jc];return{activation:t,clipMax:n,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Qs=L(()=>{"use strict";Le=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},$h=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),e_=L(()=>{"use strict";vh=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),Zs=L(()=>{"use strict";ne(),ie(),se(),_r(),tn=(e,t,r,n,i)=>{let s=n-r;return`
      ${Array.from({length:r}).map((a,u)=>`
      if (${J(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,J(i,u+s,n))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},Xs=(e,t,r,n,i=!1,s)=>{let a=e[0].dims,u=e[1].dims,l=a[a.length-2],d=u[u.length-1],p=a[a.length-1],h=Ae(d),g=Ae(p),y=Ae(l),_=O.size(r)/h/y,b=e.length>2,k=n?n.slice(0,-2):r.slice(0,-2),v=[O.size(k),l,d],w=[{type:12,data:_},{type:12,data:l},{type:12,data:d},{type:12,data:p}];fr(t,w),w.push(...te(k,a,u)),b&&w.push(...te(e[2].dims)),w.push(...te(v));let T=S=>{let I=Gs("batch_dims",e[0].dataType,k.length),C=R("a",e[0].dataType,a.length,g),A=R("b",e[1].dataType,u.length,h),$=Z("output",e[0].dataType,v.length,h),B=De($.type.tensor),U=hr(t,$.type.value,B),H=[C,A],W="";if(b){let z=i?h:1;H.push(R("bias",e[2].dataType,e[2].dims.length,z)),W=`${i?`value += bias[col / ${z}];`:`value += ${$.type.value}(bias[row + i]);`}`}let G=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];mr(t,G);let j=()=>{let z=`var a_data: ${C.type.value};`;for(let P=0;P<g;P++)z+=`
              let b_data${P} = b[(b_offset + (k + ${P}) * uniforms.N + col) / ${h}];`;for(let P=0;P<y;P++){z+=`a_data = a[(a_offset + (row + ${P}) * uniforms.K + k) / ${g}];`;for(let ee=0;ee<g;ee++)z+=`
            values[${P}] = fma(${A.type.value}(a_data${g===1?"":`[${ee}]`}), b_data${ee}, values[${P}]);
`}return z};return`
  ${S.registerUniforms(G).registerInternalVariables(I).declareVariables(...H,$)}
  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${h})) * ${h};
    var index1 = global_idx / (uniforms.N / ${h});
    let stride1 = uniforms.M / ${y};
    let row = (index1 % stride1) * ${y};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${I.offsetToIndices("batch")};`}

    var a_indices: ${C.type.indices};
    ${tn("a_indices",C,C.rank-2,I.rank,"batch_indices")}
    ${C.indicesSet("a_indices",C.rank-2,0)}
    ${C.indicesSet("a_indices",C.rank-1,0)}
    let a_offset = ${C.indicesToOffset("a_indices")};

    var b_indices: ${A.type.indices};
    ${tn("b_indices",A,A.rank-2,I.rank,"batch_indices")}
    ${A.indicesSet("b_indices",A.rank-2,0)}
    ${A.indicesSet("b_indices",A.rank-1,0)}
    let b_offset = ${A.indicesToOffset("b_indices")};
    var values: array<${$.type.value}, ${y}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${j()}
    }
    for (var i = 0u; i < ${y}u; i++) {
      var value = values[i];
      ${W}
      ${U}
      let cur_indices = ${$.type.indices}(batch, row + i, col);
      let offset = ${$.indicesToOffset("cur_indices")};
      ${$.setByOffset(`offset / ${h}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${h};${g};${y};${i}`,inputDependencies:b?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:w}),getShaderSource:T}}}),Ys=L(()=>{"use strict";ne(),ie(),se(),_r(),Zs(),Qs(),al=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,ol=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,ks=(e,t,r="f32",n,i=!1,s=32,a=!1,u=32)=>{let l=t[1]*e[1],d=t[0]*e[0],p=i?l:s,h=i?s:l,g=p/t[0],y=s/t[1];if(!((i&&g===4&&e[1]===4||!i&&(g===3||g===4))&&p%t[0]===0&&s%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${i} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${p} must be divisible by workgroupSize[0]${t[0]}. tileInner ${s} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${p/g}>, ${h}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${d/e[0]}>, ${s}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${a?"0":"i32(globalId.z)"};
  ${n?`let batchIndices = ${n.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${l};

  let num_tiles = ${a?`${Math.ceil(u/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${a?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${y};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${al(i,n)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${n?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${ol(i,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},Fi=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,ul=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Ss=(e,t,r="f32",n,i=!1,s=32,a=!1,u=32,l=!1)=>{let d=e[1]*t[1],p=e[0]*t[0],h=i?d:s,g=i?s:d;if(!(g%t[1]===0&&h%t[0]===0&&s%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}, tileInner ${s} must be divisible by workgroupSize[1]${t[1]}`);let y=g/t[1],_=h/t[0],b=s/t[1],k=l?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${d};
    let globalColStart = i32(workgroupId.x) * ${p};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          ${Fi(i,n)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${s}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${p}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${n?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${i?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${d};

let tileRowA = i32(localId.y) * ${y};
let tileColA = i32(localId.x) * ${_};
let tileRowB = i32(localId.y) * ${b};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${_}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Fi(i,n)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${b}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${n?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${ul(i)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${h}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${p}>, ${s}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${a?"0":"i32(globalId.z)"};
    ${n?`let batchIndices = ${n.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${a?`${Math.ceil(u/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${a?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${k}
  }
`},ll=(e,t,r,n,i=!1)=>{let[s,a,u,l]=n,d=De(n[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Le(e,d)} {
      var value = ${Le(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${a.type.indices};
        ${tn("aIndices",a,a.rank-2,s.rank,"batchIndices")}
        ${a.indicesSet("aIndices",a.rank-2,"u32(row)")}
        ${a.indicesSet("aIndices",a.rank-1,"u32(colIn)")}
        value = ${a.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${Le(e,d)} {
      var value = ${Le(e,d)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${tn("bIndices",u,u.rank-2,s.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Le(e,d)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${i?"bias[colIn]":`${Le(e,d)}(bias[row])`};`:""}
        ${r}
        ${l.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Fn=(e,t,r,n,i=!1,s)=>{let a=e[0].dims,u=e[1].dims,l=a.slice(0,-2),d=u.slice(0,-2),p=n?n.slice(0,-2):r.slice(0,-2),h=O.size(p),g=a[a.length-2],y=a[a.length-1],_=u[u.length-1],b=y%4===0&&_%4===0,k=g<=8?[4,1,1]:[4,4,1],v=[8,8,1],w=[Math.ceil(_/v[0]/k[0]),Math.ceil(g/v[1]/k[1]),Math.ceil(h/v[2]/k[2])],T=b?4:1,S=[...l,g,y/T],I=S.length,C=[...d,y,_/T],A=C.length,$=[h,g,_/T],B=[{type:6,data:g},{type:6,data:_},{type:6,data:y}];fr(t,B),B.push(...te(p,S,C));let U=["rank","rank"],H=e.length>2;H&&(B.push(...te(e[2].dims)),U.push("rank")),B.push(...te($));let W=G=>{let j=p.length,z=Gs("batchDims",e[0].dataType,j,1),P=De(e[0].dataType),ee=R("a",e[0].dataType,I,T),X=R("b",e[1].dataType,A,T),V=Z("result",e[0].dataType,$.length,T),oe=[ee,X];if(H){let he=i?T:1;oe.push(R("bias",e[2].dataType,e[2].dims.length,he))}let D=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];mr(t,D);let F=De(V.type.tensor),K=hr(t,V.type.value,F),re=ll(T,H,K,[z,ee,X,V],i);return`
  ${G.registerUniforms(D).registerInternalVariables(z).declareVariables(...oe,V)}
  ${re}
  ${b?ks(k,v,P,z):Ss(k,v,P,z)}
                   `};return{name:"MatMul",shaderCache:{hint:`${k};${t.activation};${b};${i}`,inputDependencies:U},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:w[0],y:w[1],z:w[2]},programUniforms:B}),getShaderSource:W}}}),t_=L(()=>{"use strict";ne(),Ot(),se(),_r(),Qs(),e_(),Ys(),dl=(e,t,r,n,i=!1,s,a=4,u=4,l=4,d="f32")=>{let p=B=>{switch(B){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${d}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${B} is not supported.`)}},h=B=>{switch(B){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${B} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,y=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,_=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",b=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",k=e?"row":"col",v=e?"col":"row",w=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${k} / outWidth;
    let outCol = ${k} % outWidth;

    let WRow = ${v} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${v} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${v} % inChannels;
    var resData = ${Le(a,d)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${_} && xCol >= 0 && xCol < ${b}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${p(a)}
    }
    return resData;`,T=e?t&&n?`
    let col = colIn * ${a};
    ${w}`:`
    let col = colIn * ${a};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${w}
    }
    return ${Le(a,d)}(0.0);`:n&&r?`
    let col = colIn * ${a};
    ${w}`:`
    let col = colIn * ${a};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${w}
    }
    return ${Le(a,d)}(0.0);`,S=e?n&&r?h(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${h(u)}
    }
    return ${Le(u,d)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${h(u)}
    }
    return ${Le(u,d)}(0.0);`,I=Le(l,d),C=Le(e?a:u,d),A=Le(e?u:a,d),$=hr(s,I,d);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?T:S}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?S:T}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${I}) {
      let col = colIn * ${l};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${y}
      ${$h(i)}
      ${$}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},xh=(e,t,r,n,i,s,a,u,l)=>{let d=t.format==="NHWC",p=d?e[0].dims[3]:e[0].dims[1],h=r[0],g=d?r[2]:r[3],y=d?r[1]:r[2],_=d?r[3]:r[1],b=d&&(p%4===0||p%3===0)&&_%4===0,k=d?_:g*y,v=d?g*y:_,w=[8,8,1],T=n<=8?[4,1,1]:[4,4,1],S=[Math.ceil(k/w[0]/T[0]),Math.ceil(v/w[1]/T[1]),Math.ceil(h/w[2]/T[2])];me("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${S}`);let I=b?d&&p%4!==0?3:4:1,C=w[1]*T[1],A=w[0]*T[0],$=Math.max(w[0]*I,w[1]),B=n%C===0,U=i%A===0,H=s%$===0,W=b?[I,4,4]:[1,1,1],G=[{type:6,data:n},{type:6,data:i},{type:6,data:s},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];fr(t,G),G.push(...te(e[0].dims,e[1].dims));let j=["rank","rank"];a&&(G.push(...te(e[2].dims)),j.push("rank")),G.push(...te(r));let z=P=>{let ee=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];mr(t,ee);let X=b?4:1,V=De(e[0].dataType),oe=`
      fn setOutputAtIndex(flatIndex : i32, value : ${b?`vec4<${V}>`:V}) {
        result[flatIndex] = ${b?`vec4<${V}>`:V}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${b?`vec4<${V}>`:V}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${b?"/ 4":""}, value);
      }`,D=R("x",e[0].dataType,e[0].dims.length,I===3?1:I),F=R("w",e[1].dataType,e[1].dims.length,X),K=[D,F],re=Z("result",e[0].dataType,r.length,X);if(a){let he=R("bias",e[2].dataType,e[2].dims.length,X);K.push(he),oe+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${b?`vec4<${V}>`:V} {
          return bias[coords.${d?"w":"y"}${b?"/ 4":""}];
        }`}return`
        ${vh("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${P.registerUniforms(ee).declareVariables(...K,re)}
        ${oe}
        ${dl(d,B,U,H,a,t,W[0],W[1],W[2],V)}
        ${b?ks(T,w,V,void 0,!d,$):Ss(T,w,V,void 0,!d,$,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${I};${b};${B};${U};${H};${C};${A};${$}`,inputDependencies:j},getRunData:()=>({outputs:[{dims:l?l(r):r,dataType:e[0].dataType}],dispatchGroup:{x:S[0],y:S[1],z:S[2]},programUniforms:G}),getShaderSource:z}}}),r_=L(()=>{"use strict";ne(),Ot(),ie(),se(),_r(),Qs(),cl=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Wi=e=>typeof e=="number"?[e,e,e]:e,Vr=(e,t)=>t<=1?e:e+(e-1)*(t-1),pl=(e,t,r,n=1)=>{let i=Vr(t,n);return Math.floor((e[0]*(r-1)-r+i)/2)},qi=(e,t,r,n,i)=>{i==null&&(i=pl(e,t[0],n[0]));let s=[0,0,0,r];for(let a=0;a<3;a++)e[a]+2*i>=t[a]&&(s[a]=Math.trunc((e[a]-t[a]+2*i)/n[a]+1));return s},hl=(e,t,r,n,i,s,a,u,l,d)=>{let p,h,g,y;if(e==="VALID"&&(e=0),typeof e=="number"){p={top:e,bottom:e,left:e,right:e,front:e,back:e};let _=qi([t,r,n,1],[u,l,d],1,[i,s,a],e);h=_[0],g=_[1],y=_[2]}else if(Array.isArray(e)){if(!e.every((b,k,v)=>b===v[0]))throw Error(`Unsupported padding parameter: ${e}`);p={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let _=qi([t,r,n,1],[u,l,d],1,[i,s,a],e[0]);h=_[0],g=_[1],y=_[2]}else if(e==="SAME_UPPER"){h=Math.ceil(t/i),g=Math.ceil(r/s),y=Math.ceil(n/a);let _=(h-1)*i+u-t,b=(g-1)*s+l-r,k=(y-1)*a+d-n,v=Math.floor(_/2),w=_-v,T=Math.floor(b/2),S=b-T,I=Math.floor(k/2),C=k-I;p={top:T,bottom:S,left:I,right:C,front:v,back:w}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:p,outDepth:h,outHeight:g,outWidth:y}},kh=(e,t,r,n,i,s=!1,a="channelsLast")=>{let u,l,d,p,h;if(a==="channelsLast")[u,l,d,p,h]=e;else if(a==="channelsFirst")[u,h,l,d,p]=e;else throw new Error(`Unknown dataFormat ${a}`);let[g,,y,_,b]=t,[k,v,w]=Wi(r),[T,S,I]=Wi(n),C=Vr(y,T),A=Vr(_,S),$=Vr(b,I),{padInfo:B,outDepth:U,outHeight:H,outWidth:W}=hl(i,l,d,p,k,v,w,C,A,$),G=s?g*h:g,j=[0,0,0,0,0];return a==="channelsFirst"?j=[u,G,U,H,W]:a==="channelsLast"&&(j=[u,U,H,W,G]),{batchSize:u,dataFormat:a,inDepth:l,inHeight:d,inWidth:p,inChannels:h,outDepth:U,outHeight:H,outWidth:W,outChannels:G,padInfo:B,strideDepth:k,strideHeight:v,strideWidth:w,filterDepth:y,filterHeight:_,filterWidth:b,effectiveFilterDepth:C,effectiveFilterHeight:A,effectiveFilterWidth:$,dilationDepth:T,dilationHeight:S,dilationWidth:I,inShape:e,outShape:j,filterShape:t}},Sh=(e,t,r,n,i,s)=>{let a=s==="channelsLast",u=a?e[0].dims[3]:e[0].dims[1],l=!1,d=[64,1,1],p={x:r.map((w,T)=>T)},h=[Math.ceil(cl(p.x.map(w=>r[w]))/d[0]),1,1];me("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${h}`);let g=l?a&&u%4!==0?3:4:1,y=O.size(r),_=[{type:12,data:y},{type:12,data:n},{type:12,data:i},{type:12,data:t.strides},{type:12,data:t.dilations}];fr(t,_),_.push(...te(e[0].dims,e[1].dims));let b=["rank","rank"],k=e.length===3;k&&(_.push(...te(e[2].dims)),b.push("rank")),_.push(...te(r));let v=w=>{let T=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:n.length},{name:"pads",type:"u32",length:i.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];mr(t,T);let S=l?4:1,I=De(e[0].dataType),C=R("x",e[0].dataType,e[0].dims.length,g===3?1:g),A=R("W",e[1].dataType,e[1].dims.length,S),$=[C,A],B=Z("result",e[0].dataType,r.length,S),U="";if(k){let G=R("bias",e[2].dataType,e[2].dims.length,S);$.push(G),U+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${l?`vec4<${I}>`:I} {
          return bias[${a?J("coords",4,5):J("coords",1,5)}${l?"/ 4":""}];
        }`}let H=Le(g,I),W=hr(t,H,I);return`
            ${U}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${C.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${A.getByIndices("aIndices")};
            }
          ${w.registerUniforms(T).declareVariables(...$,B)}
          ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${B.offsetToIndices("global_idx")};
              let batch = ${J("coords",0,C.rank)};
              let d2 = ${a?J("coords",C.rank-1,C.rank):J("coords",1,C.rank)};
              let xFRCCorner = vec3<u32>(${a?J("coords",1,C.rank):J("coords",2,C.rank)},
              ${a?J("coords",2,C.rank):J("coords",3,C.rank)},
              ${a?J("coords",3,C.rank):J("coords",4,C.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${a?J("uniforms.x_shape",1,C.rank):J("uniforms.x_shape",2,C.rank)};
              let xShapeZ = ${a?J("uniforms.x_shape",2,C.rank):J("uniforms.x_shape",3,C.rank)};
              let xShapeW = ${a?J("uniforms.x_shape",3,C.rank):J("uniforms.x_shape",4,C.rank)};
              let xShapeU = ${a?J("uniforms.x_shape",4,C.rank):J("uniforms.x_shape",1,C.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${a?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${a?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${a?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${a?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${k?"value = value + getBiasByOutputCoords(coords)":""};
              ${W}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${a};${g};${k}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:h[0],y:h[1],z:h[2]},programUniforms:_}),getShaderSource:v}}}),n_=L(()=>{"use strict";ne(),ie(),se(),_r(),Th=(e,t,r,n)=>{let i=e.length>2,s=i?"value += b[output_channel];":"",a=e[0].dims,u=e[1].dims,l=t.format==="NHWC",d=l?r[3]:r[1],p=d/t.group,h=l&&p>=4?Ae(d):1,g=O.size(r)/h,y=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:p}];fr(t,y),y.push(...te(a,[u[0],u[1],u[2],u[3]/h]));let _=i?["rank","rank","rank"]:["rank","rank"];y.push(...te([r[0],r[1],r[2],r[3]/h]));let b=k=>{let v=Z("output",e[0].dataType,r.length,h),w=De(v.type.tensor),T=hr(t,v.type.value,w),S=R("x",e[0].dataType,a.length),I=R("w",e[1].dataType,u.length,h),C=[S,I];i&&C.push(R("b",e[2].dataType,e[2].dims,h));let A=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];mr(t,A);let $=l?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${S.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${I.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${S.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${I.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${k.registerUniforms(A).declareVariables(...C,v)}

  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${v.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${l?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${l?1:2}], outputIndices[${l?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${h} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${l?2:1}];

    var value: ${v.type.value} = ${v.type.value}(0);
    ${$}
    ${s}
    ${T}
    ${v.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${h}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:b}},Ih=(e,t,r,n)=>{let i=e.length>2,s=Ae(r[3]),a=Ae(r[2]),u=O.size(r)/s/a,l=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/s],d=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/s],p=[r[0],r[1],r[2],r[3]/s],h=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];fr(t,h),h.push(...te(l,d,p));let g=(a-1)*t.strides[1]+d[1],y=_=>{let b=Z("output",e[0].dataType,p.length,s),k=De(b.type.tensor),v=hr(t,b.type.value,k),w=R("x",e[0].dataType,l.length,s),T=R("w",e[1].dataType,d.length,s),S=[w,T];i&&S.push(R("b",e[2].dataType,e[2].dims,s));let I=i?"value += b[output_channel];":"",C=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return mr(t,C),`
  ${_.registerUniforms(C).declareVariables(...S,b)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${a}u;
    let col = (index1 % width1) * ${a}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${w.type.value}, ${g}>;
    var values: array<${b.type.value}, ${a}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${d[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${w.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${w.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${d[1]}; w_width++) {
          let w_val = ${T.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${a}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${a}u; i++) {
      var value = values[i];
      ${I}
      ${v}
      ${b.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${s};${a};${g};${d[0]};${d[1]}`,inputDependencies:i?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:h}),getShaderSource:y}}}),i_=L(()=>{"use strict";ie(),t_(),r_(),Ys(),n_(),_r(),Zs(),Yt(),fl=(e,t,r,n,i,s)=>{let a=e[0],u=e.slice(s?1:2,s?3:4),l=u.length,d=t[0],p=t.slice(2).map((g,y)=>g+(g-1)*(r[y]-1)),h=u.map((g,y)=>g+n[y]+n[y+l]).map((g,y)=>Math.floor((g-p[y]+i[y])/i[y]));return h.splice(0,0,a),h.splice(s?3:1,0,d),h},Cn=[2,3,1,0],ml=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],n=e[1].dims[1]*t.group;if(r!==n)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let i=e[0].dims.length-2;if(t.dilations.length!==i)throw new Error(`dilations should be ${i}D`);if(t.strides.length!==i)throw new Error(`strides should be ${i}D`);if(t.pads.length!==i*2)throw new Error(`pads should be ${i*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},zn=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let s=2;s<t[1].dims.length;++s)r[s-2]===0&&(r[s-2]=t[1].dims[s]);let n=e.pads.slice();Un.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,n,e.format==="NHWC",e.autoPad);let i=Object.assign({},e);return Object.assign(i,{kernelShape:r,pads:n}),i},Ts=e=>{let t=Ks(e),r=e.format,n=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],i=e.dilations,s=e.group,a=e.kernel_shape,u=e.pads,l=e.strides,d=e.w_is_const();return{autoPad:n,format:r,dilations:i,group:s,kernelShape:a,pads:u,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},Gi=(e,t,r,n)=>{let i=r.format==="NHWC",s=fl(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,i);if(r.group!==1){let C=[t[0]];if(i){let A=e.kernelCustomData.wT??e.compute(Je(t[1],Cn),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=A),C.push(A)}else C.push(t[1]);t.length===3&&C.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&i&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Ih(C,r,s,n),{inputs:C}):e.compute(Th(C,r,s,n),{inputs:C});return}let a=t.length===3,u=t[0].dims[i?1:2],l=t[0].dims[i?2:3],d=t[0].dims[i?3:1],p=t[1].dims[2],h=t[1].dims[3],g=s[i?1:2],y=s[i?2:3],_=s[i?3:1],b=i&&p===u&&h===l&&r.pads[0]===0&&r.pads[1]===0;if(b||p===1&&h===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let C=s[0],A,$,B,U=[];if(i){let G=e.kernelCustomData.wT??e.compute(Je(t[1],Cn),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=G),b){let j=u*l*d;A=t[0].reshape([1,C,j]),$=G.reshape([1,j,_]),B=[1,C,_]}else A=t[0].reshape([C,u*l,d]),$=G.reshape([1,d,_]),B=[C,g*y,_];U.push(A),U.push($)}else A=t[0].reshape([C,d,u*l]),$=t[1].reshape([1,_,d]),B=[C,_,g*y],U.push($),U.push(A);a&&U.push(t[2]);let H=B[2],W=U[0].dims[U[0].dims.length-1];H<8&&W<8?e.compute(Xs(U,r,s,B,i,n),{inputs:U}):e.compute(Fn(U,r,s,B,i,n),{inputs:U});return}let k=!0,v=e.kernelCustomData.wT??e.compute(Je(t[1],Cn),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=v);let w=[t[0],v];a&&w.push(t[2]);let T=i?g*y:_,S=i?_:g*y,I=p*h*d;e.compute(xh(w,r,s,T,S,I,a,k,n),{inputs:w})},gl=(e,t)=>{let r=t.format==="NHWC",n=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&n.push(e.inputs[2]);let i=[0,t.pads[0],0,t.pads[1]],s=[1].concat(t.strides),a=[1].concat(t.dilations),u=[1].concat(t.kernelShape),l=zn({...t,pads:i,strides:s,dilations:a,kernelShape:u},n);Gi(e,n,l,d=>r?[d[0],d[2],d[3]]:[d[0],d[1],d[3]])},_l=(e,t,r)=>{let n=r.format==="NHWC"?"channelsLast":"channelsFirst",i=zn(r,t),s=r.autoPad==="NOTSET"?r.pads:r.autoPad,a=kh(t[0].dims,t[1].dims,r.strides,r.dilations,s,!1,n);e.compute(Sh(t,i,a.outShape,[a.filterDepth,a.filterHeight,a.filterWidth],[a.padInfo.front,a.padInfo.top,a.padInfo.left],n))},Is=(e,t)=>{if(ml(e.inputs,t),e.inputs[0].dims.length===3)gl(e,t);else if(e.inputs[0].dims.length===5)_l(e,e.inputs,t);else{let r=zn(t,e.inputs);Gi(e,e.inputs,r)}}}),s_=L(()=>{"use strict";ne(),Ot(),ie(),se(),Eh=(e,t,r)=>{let n=e.length>2,i=t.outputShape,s=t.format==="NHWC",a=t.group,u=e[1].dims,l=u[2]/a,d=u[3],p=s?Ae(l):1,h=s&&d===1&&l>=4,g=h?Math.floor(l/4)*4:Math.floor(l/p)*p,y=l-g,_=s?Ae(d):1,b=s?d===1?p:_:1,k=O.size(i)/_,v=[Math.ceil(k/64),1,1];me("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${v}`);let w=["rank","rank"],T=[t.strides[0],t.strides[1]],S=[t.kernelShape[s?1:2],t.kernelShape[s?2:3]],I=[t.dilations[0],t.dilations[1]],C=[S[0]+(t.dilations[0]<=1?0:(t.kernelShape[s?1:2]-1)*(t.dilations[0]-1)),S[1]+(t.dilations[1]<=1?0:(t.kernelShape[s?2:3]-1)*(t.dilations[1]-1))],A=[C[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),C[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],$=[{type:12,data:k},{type:12,data:T},{type:12,data:S},{type:12,data:I},{type:12,data:C},{type:6,data:A},{type:12,data:g},{type:12,data:l},{type:12,data:d},...te(e[0].dims,e[1].dims)];n&&($.push(...te(e[2].dims)),w.push("rank")),$.push(...te(i));let B=U=>{let H=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:T.length},{name:"filter_dims",type:"u32",length:S.length},{name:"dilations",type:"u32",length:S.length},{name:"effective_filter_dims",type:"u32",length:C.length},{name:"pads",type:"i32",length:A.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],W=De(e[0].dataType),G=s?1:2,j=s?2:3,z=s?3:1,P=R("W",e[1].dataType,e[1].dims.length,b),ee=R("Dy",e[0].dataType,e[0].dims.length,p),X=[ee,P];n&&X.push(R("bias",e[2].dataType,[i[z]].length,_));let V=Z("result",e[0].dataType,i.length,_),oe=()=>{let K="";if(h)p===4?K+=`
        let xValue = ${ee.getByOffset("x_offset")};
        let wValue = ${P.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:p===2?K+=`
          dotProd = dotProd + dot(vec4<${W}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}), vec4<${W}>(${P.getByOffset("w_offset")}, ${P.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:p===1&&(K+=`
          dotProd = dotProd + dot(vec4<${W}>(${ee.getByOffset("x_offset")}, ${ee.getByOffset("x_offset + 1u")}, ${ee.getByOffset("x_offset + 2u")}, ${ee.getByOffset("x_offset + 3u")}), vec4<${W}>(${P.getByOffset("w_offset")}, ${P.getByOffset("w_offset + 1u")}, ${P.getByOffset("w_offset + 2u")}, ${P.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(K+=`
                  let xValue = ${s?ee.getByOffset(`${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${p}`):ee.get("batch","inputChannel","idyR","idyC")};
        `,p===1)K+=`
          let w_offset = ${P.indicesToOffset(`${P.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${P.getByOffset(`w_offset / ${b}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let re=0;re<p;re++)K+=`
            let wValue${re} = ${P.getByOffset(`${P.indicesToOffset(`${P.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${re}, wOutChannel)`)} / ${b}`)};
            dotProd = dotProd + xValue[${re}] * wValue${re};`;return K},D=()=>{if(y===0)return"";if(!h)throw new Error(`packInputAs4 ${h} is not true.`);let K="";if(p===1){K+="dotProd = dotProd";for(let re=0;re<y;re++)K+=`
            + ${ee.getByOffset(`x_offset + ${re}`)} * ${P.getByOffset(`w_offset + ${re}`)}`;K+=";"}else if(p===2){if(y!==2)throw new Error(`Invalid inputChannelsRemainder ${y}.`);K+=`
          let xValue = ${ee.getByOffset("x_offset")};
          let wValue = ${P.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return K},F=`
            let outputIndices = ${V.offsetToIndices(`global_idx * ${_}`)};
            let batch = ${V.indicesGet("outputIndices",0)};
            let d1 = ${V.indicesGet("outputIndices",z)};
            let r = ${V.indicesGet("outputIndices",G)};
            let c = ${V.indicesGet("outputIndices",j)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${V.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${W}(dyRCorner) + ${W}(wR)) / ${W}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${W}(uniforms.Dy_shape[${G}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${W}(dyCCorner) + ${W}(wC)) / ${W}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${W}(uniforms.Dy_shape[${j}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${h?`
                var x_offset = ${ee.indicesToOffset(`${ee.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${p};
                var w_offset = ${P.indicesToOffset(`${P.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${b};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${h?4:p}) {
                  ${oe()}
                  inputChannel = inputChannel + ${h?4:p};
                }
                ${D()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${n?` + bias[d1 / ${_}]`:""};
            ${V.setByOffset("global_idx","value")};
          `;return`
    ${U.registerUniforms(H).declareVariables(...X,V)}
      ${U.mainStart()}
      ${U.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${F}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${p}${b}${_}${h}${y}`,inputDependencies:w},getRunData:()=>({dispatchGroup:{x:v[0],y:v[1],z:v[2]},outputs:[{dims:r?r(i):i,dataType:e[0].dataType}],programUniforms:$}),getShaderSource:B}}}),a_=L(()=>{"use strict";s_(),_r(),Yt(),yl=(e,t,r,n,i,s)=>(e-1)*t+r+(n-1)*i+1-s,wl=(e,t,r,n,i)=>{let s=Math.floor(e/2);t==="SAME_UPPER"?(r[n]=s,r[i]=e-s):t==="SAME_LOWER"&&(r[n]=e-s,r[i]=s)},bl=(e,t,r,n,i,s,a,u,l,d)=>{let p=e.length-2,h=d.length===0;l.length<p&&l.push(...Array(p-l.length).fill(0));let g=e[0],y=t[u?3:1]*i;for(let _=0,b=e.length-p-(u?1:0);_<p;++_,++b){let k=e[b],v=h?k*a[_]:d[_],w=yl(k,a[_],s[_],t[b],r[_],v);wl(w,n,s,_,_+p),h&&d.push(a[_]*(k-1)+l[_]+(t[b]-1)*r[_]+1-s[_]-s[_+p])}d.splice(0,0,g),d.splice(u?3:1,0,y)},Vi=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((h,g)=>h*g,1)===0){r.length=0;for(let h=2;h<t[1].dims.length;++h)r.push(t[1].dims[h])}let n=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(n?3:1,0,t[1].dims[1]);let i=e.pads.slice(),s=e.outputShape.slice(),a=e.outputPadding.slice(),u=t[0].dims,l=e.dilations.slice();if(l.reduce((h,g)=>h+g,0)===0){let h=t[0].dims.length-2;l=new Array(h).fill(1)}let d=e.strides.slice();if(d.reduce((h,g)=>h+g,0)===0){let h=t[0].dims.length-2;d=new Array(h).fill(1)}bl(u,r,l,e.autoPad,e.group,i,d,n,a,s);let p=Object.assign({},e);return Object.assign(p,{kernelShape:r,pads:i,outputPadding:a,outputShape:s,dilations:l,strides:d}),p},Ch=e=>{let t=Ks(e),r=e.format,n=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],i=e.dilations,s=e.group,a=e.kernelShape,u=e.pads,l=e.strides,d=e.wIsConst(),p=e.outputPadding,h=e.outputShape;return{autoPad:n,format:r,dilations:i,group:s,kernelShape:a,outputPadding:p,outputShape:h,pads:u,strides:l,wIsConst:d,...t,cacheKey:`${e.format};${t.activation};`}},$l=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],n=e[1].dims[0];if(r!==n)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let i=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==i))throw new Error("invalid bias");let s=e[0].dims.length-2;if(t.dilations.reduce((a,u)=>a+u,0)>0&&t.dilations.length!==s)throw new Error(`dilations should be ${s}D`);if(t.strides.reduce((a,u)=>a+u,0)>0&&t.strides.length!==s)throw new Error(`strides should be ${s}D`);if(t.pads.reduce((a,u)=>a+u,0)>0&&t.pads.length!==s*2)throw new Error(`pads should be ${s*2}D`);if(t.outputPadding.length!==s&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${s}D`);if(t.kernelShape.reduce((a,u)=>a+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},Hi=(e,t,r,n)=>{let i=e.kernelCustomData.wT??e.compute(Je(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=i);let s=[t[0],i];t.length===3&&s.push(t[2]),e.compute(Eh(s,r,n),{inputs:s})},vl=(e,t)=>{let r=t.format==="NHWC",n=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&n.push(e.inputs[2]);let i=t.kernelShape;(i.length===0||i[0]===0)&&(i=[e.inputs[1].dims[2]]);let s=t.dilations;(s.length===0||s[0]===0)&&(s=[1]);let a=t.strides;(a.length===0||a[0]===0)&&(a=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],a=[1].concat(a),s=[1].concat(s),i=[1].concat(i);let l=t.outputPadding;l=[0].concat(l);let d=Vi({...t,pads:u,strides:a,dilations:s,kernelShape:i,outputPadding:l},n);Hi(e,n,d,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},zh=(e,t)=>{if($l(e.inputs,t),e.inputs[0].dims.length===3)vl(e,t);else{let r=Vi(t,e.inputs);Hi(e,e.inputs,r)}}}),o_=L(()=>{"use strict";ne(),ie(),Me(),se(),xl=(e,t,r,n)=>{let i=O.size(t),s=t.length,a=R("input",e,s),u=Z("output",e,s),l=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),d=O.normalizeAxis(l,s),p=h=>{let g=` i32(${a.indicesGet("inputIndices","uniforms.axis")}) `,y=J("uniforms.input_shape","uniforms.axis",s),_=n.reverse?g+(n.exclusive?" + 1":""):"0",b=n.reverse?y:g+(n.exclusive?"":" + 1");return`
                ${h.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(a,u)}
                ${h.mainStart()}
                  ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${_};
                  let last : i32 = ${b};
                  for (var i : i32 = first; i < last; i++) {
                    ${a.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${a.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:n.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:[{type:12,data:i},{type:12,data:d},...te(t,t)]}),getShaderSource:p}},Ah=(e,t)=>{let r=e.inputs[0].dims,n=e.inputs[0].dataType,i=e.inputs[1];e.compute(xl(n,r,i,t),{inputs:[0]})},Mh=e=>{let t=e.exclusive===1,r=e.reverse===1;return ye({exclusive:t,reverse:r})}}),u_=L(()=>{"use strict";ne(),ie(),Me(),se(),kl=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Sl=(e,t,r,n)=>{let i=[];i.push(`fn perm(i: ${n.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let s=0;s<t;++s)i.push(r.indicesSet("a",e[s],`i[${s}]`));return i.push("return a;}"),i.join(`
`)},Tl=(e,t)=>{let r,n,i,s,a,u,l=t.format==="NHWC",d=t.blocksize,p=t.mode==="DCR";l?([r,n,i,s]=e.dims,a=p?[r,n,i,d,d,s/d**2]:[r,n,i,s/d**2,d,d],u=p?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,n,i,s]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],a=p?[r,d,d,s/d**2,n,i]:[r,s/d**2,d,d,n,i],u=p?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let h=e.reshape(a),g=h.dims.length,y=e.dataType,_=R("a",y,g),b=Z("output",y,g),k=v=>`
  ${v.registerUniform("output_size","u32").declareVariables(_,b)}

  ${Sl(u,g,_,b)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${b.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${b.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:v=>{let w=l?[r,n*d,i*d,s/d**2]:[r,s/d**2,n*d,i*d],T=O.size(w),S=h.dims,I=O.sortBasedOnPerm(S,u);return{outputs:[{dims:w,dataType:v[0].dataType}],dispatchGroup:{x:Math.ceil(T/64)},programUniforms:[{type:12,data:T},...te(S,I)]}},getShaderSource:k}},Oh=(e,t)=>{kl(e.inputs),e.compute(Tl(e.inputs[0],t))},Nh=e=>ye({blocksize:e.blocksize,mode:e.mode,format:e.format})}),l_=L(()=>{"use strict";ne(),ie(),Me(),se(),An="[a-zA-Z]|\\.\\.\\.",Hr="("+An+")+",ji="^"+Hr+"$",Il="("+Hr+",)*"+Hr,El="^"+Il+"$",Cl=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},zl=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,n]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(El)))throw new Error("Invalid LHS term");if(r.split(",").forEach((i,s)=>{let a=e[s].dims.slice();if(!i.match(RegExp(ji)))throw new Error("Invalid LHS term");let u=this.processTerm(i,!0,a,s);this.lhs.push(u)}),n==="")n+=[...this.symbolToInfo.entries()].filter(([i,s])=>s.count===1||i==="...").map(([i])=>i).join("");else if(!n.match(RegExp(Hr)))throw new Error("Invalid RHS");n.match(RegExp(An,"g"))?.forEach(i=>{if(i==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(i);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(n,!1,this.outputDims)}addSymbol(e,t,r){let n=this.symbolToInfo.get(e);if(n!==void 0){if(n.dimValue!==t&&n.count!==1)throw new Error("Dimension mismatch");n.count++,n.inputIndices.push(r)}else n={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,n)}processTerm(e,t,r,n=-1){let i=r.length,s=!1,a=[],u=0;if(!e.match(RegExp(ji))&&!t&&e!=="")throw new Error("Invalid LHS term");let l=e.match(RegExp(An,"g")),d=new Cl(n);return l?.forEach((p,h)=>{if(p==="..."){if(s)throw new Error("Only one ellipsis is allowed per input term");s=!0;let g=i-l.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(a=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==a.length||this.ellipsisDims.toString()!==a.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=a;else throw new Error("Ellipsis must be specified in the LHS");for(let y=0;y<a.length;y++){let _=String.fromCharCode(48+y);d.addSymbol(_,h+y),this.addSymbol(_,r[u++],n)}}else d.addSymbol(p,h+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(p,r[u++],n)}),d}},Ki=e=>e+"_max",Al=(e,t,r,n)=>{let i=e.map(d=>d.length).map((d,p)=>R(`input${p}`,t,d)),s=O.size(n),a=Z("output",t,n.length),u=[...r.symbolToInfo.keys()].filter(d=>!r.rhs.symbolToIndices.has(d)),l=d=>{let p=[],h="var prod = 1.0;",g="var sum = 0.0;",y="sum += prod;",_=[],b=[],k=[],v=[],w=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((S,I)=>{if(r.rhs.symbolToIndices.has(I)){let C=r.rhs.symbolToIndices.get(I)?.[0];C!==void 0&&r.lhs.forEach((A,$)=>{if(S.inputIndices.includes($)){let B=A.symbolToIndices.get(I);if(B===void 0)throw new Error("Invalid symbol error");B.forEach(U=>{p.push(`${i[$].indicesSet(`input${$}Indices`,U,a.indicesGet("outputIndices",C))}`)})}})}else r.lhs.forEach((C,A)=>{if(S.inputIndices.includes(A)){let $=C.symbolToIndices.get(I);if($===void 0)throw new Error("Invalid symbol error");$.forEach(B=>{_.push(`${i[A].indicesSet(`input${A}Indices`,B,`${I}`)}`)}),v.push(`prod *= ${i[A].getByIndices(`input${A}Indices`)};`)}}),b.push(`for(var ${I}: u32 = 0; ${I} < uniforms.${Ki(I)}; ${I}++) {`),k.push("}")});let T=w?[...p,`let sum = ${i.map((S,I)=>S.getByIndices(`input${I}Indices`)).join(" * ")};`]:[...p,g,...b,..._,h,...v,y,...k];return`
            ${d.registerUniforms(u.map(S=>({name:`${Ki(S)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...i,a)}

            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${a.offsetToIndices("global_idx")};
            ${i.map((S,I)=>`var input${I}Indices: ${i[I].type.indices};`).join(`
`)}
            ${T.join(`
`)};
            ${a.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let d=u.filter(h=>r.symbolToInfo.has(h)).map(h=>({type:12,data:r.symbolToInfo.get(h)?.dimValue||0}));d.push({type:12,data:s});let p=e.map((h,g)=>[...te(h)]).reduce((h,g)=>h.concat(g),d);return p.push(...te(n)),{outputs:[{dims:n,dataType:t}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}},getShaderSource:l}},Rh=(e,t)=>{let r=new zl(e.inputs,t.equation),n=r.outputDims,i=e.inputs.map((s,a)=>s.dims);e.compute(Al(i,e.inputs[0].dataType,r,n))},Bh=e=>{let t=e.equation.replace(/\s+/g,"");return ye({equation:t})}}),d_=L(()=>{"use strict";ne(),ie(),se(),Ml=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),n=r.length<t.length?0:r.length-t.length,i=t.length<r.length?0:t.length-r.length;for(;n<r.length&&i<t.length;++n,++i)if(r[n]!==t[i]&&r[n]!==1&&t[i]!==1)throw new Error("Expand requires shape to be broadcastable to input")},Qi=(e,t)=>{let r=e.length-t.length,n=[];for(let i=0;i<r;++i)n.push(e[i]);for(let i=0;i<t.length;++i)n.push(t[i]===1?e[i+r]:t[i]);return n},Ol=(e,t)=>e.length>t.length?Qi(e,t):Qi(t,e),Nl=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),n=Ol(t,r),i=e[0].dataType,s=i===9||O.size(t)===1,a=i===9||t.length>0&&t[t.length-1]%4===0?4:1,u=s||n.length>0&&n[n.length-1]%4===0?4:1,l=Math.ceil(O.size(n)/u),d=h=>{let g=R("input",i,t.length,a),y=Z("output",i,n.length,u),_;if(i===9){let b=(k,v,w="")=>`
          let outputIndices${v} = ${y.offsetToIndices(`outputOffset + ${v}u`)};
          let offset${v} = ${g.broadcastedIndicesToOffset(`outputIndices${v}`,y)};
          let index${v} = offset${v} / 4u;
          let component${v} = offset${v} % 4u;
          ${k}[${v}] = ${w}(${g.getByOffset(`index${v}`)}[component${v}]);
        `;_=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${b("data",0,"u32")}
        ${b("data",1,"u32")}
        ${b("data",2,"u32")}
        ${b("data",3,"u32")}
        ${y.setByOffset("global_idx","data")}
      }`}else _=`
        let outputIndices = ${y.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",y)};
        let data = ${y.type.value}(${g.getByOffset(`inputOffset / ${a}`)});
        ${y.setByOffset("global_idx","data")}
      }`;return`
    ${h.registerUniform("vec_size","u32").declareVariables(g,y)}
    ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${_}`},p=[{type:12,data:l},...te(t,n)];return{name:"Expand",shaderCache:{hint:`${n.length};${a}${u}`,inputDependencies:["rank"]},getShaderSource:d,getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p})}},Dh=e=>{Ml(e.inputs),e.compute(Nl(e.inputs),{inputs:[0]})}}),c_=L(()=>{"use strict";ne(),ie(),se(),js(),Rl=e=>{let t=e[0].dataType,r=O.size(e[0].dims),n=O.size(e[1].dims),i=n%4===0,s=a=>{let u=R("x",t,[1],4),l=R("bias",t,[1],4),d=Z("y",t,[1],4),p=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],h=y=>`
      let bias${y}_offset: u32 = (global_idx * 4 + ${y}) % uniforms.bias_size;
      let bias${y} = ${l.getByOffset(`bias${y}_offset / 4`)}[bias${y}_offset % 4];`,g=i?`
      let bias = ${l.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${h(0)}${h(1)}${h(2)}${h(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${a.registerUniforms(p).declareVariables(u,l,d)}

    ${vs(Ge(t))}

    ${a.mainStart(Tr)}
      ${a.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${d.setByOffset("global_idx",xs("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${i}`,inputDependencies:["type","type"]},getShaderSource:s,getRunData:a=>({outputs:[{dims:a[0].dims,dataType:a[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:n}],dispatchGroup:{x:Math.ceil(r/Tr/4)}})}},Ph=e=>{e.inputs.length<2||O.size(e.inputs[1].dims)===0?ih(e):e.compute(Rl(e.inputs))}}),p_=L(()=>{"use strict";ne(),ie(),Me(),se(),Bl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},Dl=(e,t)=>{let r=e[0].dims,n=e[1].dims,i=r.length,s=O.normalizeAxis(t.axis,i),a=r.slice(0);a.splice(s,1,...n);let u=r[s],l=e[0].dataType===9?4:1,d=Math.ceil(O.size(a)/l),p=[{type:12,data:d},{type:6,data:u},{type:12,data:s},...te(e[0].dims,e[1].dims,a)],h=g=>{let y=R("data",e[0].dataType,e[0].dims.length,l),_=R("inputIndices",e[1].dataType,e[1].dims.length),b=Z("output",e[0].dataType,a.length,l),k=w=>{let T=n.length,S=`var indicesIndices${w}  = ${_.type.indices}(0);`;for(let I=0;I<T;I++)S+=`${T>1?`indicesIndices${w}[${I}]`:`indicesIndices${w}`} = ${a.length>1?`outputIndices${w}[uniforms.axis + ${I}]`:`outputIndices${w}`};`;S+=`
          var idx${w} = ${_.getByIndices(`indicesIndices${w}`)};
          if (idx${w} < 0) {
            idx${w} = idx${w} + uniforms.axisDimLimit;
          }
          var dataIndices${w} : ${y.type.indices};
        `;for(let I=0,C=0;I<i;I++)I===s?(S+=`${i>1?`dataIndices${w}[${I}]`:`dataIndices${w}`} = u32(idx${w});`,C+=T):(S+=`${i>1?`dataIndices${w}[${I}]`:`dataIndices${w}`} = ${a.length>1?`outputIndices${w}[${C}]`:`outputIndices${w}`};`,C++);return S},v;if(e[0].dataType===9){let w=(T,S,I="")=>`
          let outputIndices${S} = ${b.offsetToIndices(`outputOffset + ${S}u`)};
          ${k(S)};
          let offset${S} = ${y.indicesToOffset(`dataIndices${S}`)};
          let index${S} = offset${S} / 4u;
          let component${S} = offset${S} % 4u;
          ${T}[${S}] = ${I}(${y.getByOffset(`index${S}`)}[component${S}]);
        `;v=`
        let outputOffset = global_idx * ${l};
        var value = vec4<u32>(0);
        ${w("value",0,"u32")}
        ${w("value",1,"u32")}
        ${w("value",2,"u32")}
        ${w("value",3,"u32")}
        ${b.setByOffset("global_idx","value")}
      `}else v=`
      let outputIndices = ${b.offsetToIndices("global_idx")};
      ${k("")};
      let value = ${y.getByIndices("dataIndices")};
      ${b.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(y,_,b)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${v}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p}),getShaderSource:h}},Uh=e=>ye({axis:e.axis}),Lh=(e,t)=>{let r=e.inputs;Bl(r),e.compute(Dl(e.inputs,t))}}),h_=L(()=>{"use strict";ne(),ie(),se(),Pl=(e,t,r,n,i,s,a,u,l)=>{let d=[{type:12,data:s},{type:12,data:n},{type:12,data:i},{type:12,data:r},{type:12,data:a},{type:12,data:u},{type:12,data:l}],p=[s];d.push(...te(t.dims,p));let h=g=>{let y=R("indices_data",t.dataType,t.dims.length),_=Z("input_slice_offsets_data",12,1,1),b=[y,_],k=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:i.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(k).declareVariables(...b)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${i.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${i.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:d}),getShaderSource:h},{inputs:[t],outputs:[-1]})[0]},Fh=(e,t)=>{let r=e.inputs,n=r[0].dims,i=r[0].dataType,s=r[1].dims,a=s[s.length-1],u=O.sizeToDimension(s,s.length-1),l=O.sizeFromDimension(n,t.batchDims+a),d=O.sizeToDimension(n,t.batchDims),p=O.sizeFromDimension(n,t.batchDims),h=u/d,g=new Array(a),y=l;for(let S=0;S<a;++S)g[a-1-S]=y,y*=n[t.batchDims+a-1-S];let _=Pl(e,r[1],g,t.batchDims,n,u,h,p,a),b=t.batchDims+a;if(b>n.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let k=s.slice(0,-1).concat(n.slice(b)),v=O.size(k),w=[{type:12,data:v},{type:12,data:l},...te(r[0].dims,_.dims,k)],T=S=>{let I=R("data",r[0].dataType,r[0].dims.length),C=R("slice_offsets",12,_.dims.length),A=Z("output",r[0].dataType,k.length);return`
          ${S.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(I,C,A)}
            ${S.mainStart()}
            ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:k,dataType:i}],dispatchGroup:{x:Math.ceil(v/64)},programUniforms:w}),getShaderSource:T},{inputs:[r[0],_]})},Wh=e=>({batchDims:e.batch_dims,cacheKey:""})}),f_=L(()=>{"use strict";ne(),ie(),Me(),se(),Ul=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=O.normalizeAxis(t.quantizeAxis,e[0].dims.length),n=t.blockSize,i=e[0],s=e[2],a=e.length===4?e[3]:void 0;if(s.dims.length!==i.dims.length||!i.dims.map((u,l)=>l===r?Math.ceil(u/n)===s.dims[l]:u===s.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(a){if(a.dataType!==i.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(a.dims.length!==s.dims.length||!a.dims.map((u,l)=>u===s.dims[l]).reduce((u,l)=>u&&l,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},Ll=(e,t)=>{let r=e[0].dims,n=e[1].dims,i=r.length,s=O.normalizeAxis(t.gatherAxis,i),a=O.normalizeAxis(t.quantizeAxis,i),u=r.slice(0);u.splice(s,1,...n);let l=O.size(u),d=e[2].dataType,p=e[0].dataType===22,h=[{type:12,data:l},{type:12,data:a},{type:12,data:s},{type:12,data:t.blockSize},...te(...e.map((y,_)=>y.dims),u)],g=y=>{let _=R("data",e[0].dataType,e[0].dims.length),b=R("inputIndices",e[1].dataType,e[1].dims.length),k=R("scales",e[2].dataType,e[2].dims.length),v=e.length>3?R("zeroPoint",e[3].dataType,e[3].dims.length):void 0,w=Z("output",d,u.length),T=[_,b,k];v&&T.push(v);let S=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${y.registerUniforms(S).declareVariables(...T,w)}
        ${y.mainStart()}
        let output_indices = ${w.offsetToIndices("global_idx")};
        var indices_indices = ${b.type.indices}(0);
        ${n.length>1?`
          for (var i: u32 = 0; i < ${n.length}; i++) {
            let index = ${w.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${b.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${w.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${_.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${w.indicesGet("output_indices","i")};
          ${_.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${b.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[s]};
        }
        ${_.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${w.indicesGet("output_indices",`i + ${n.length} - 1`)};
          ${_.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${_.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${_.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${p?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${k.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${k.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${k.getByIndices("scale_indices")};
        ${v?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${v.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${v.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${p?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Ge(d)}(quantized_data - zero_point) * scale;
        ${w.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((y,_)=>_!==1).map(y=>y.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(y,_)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:d}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:h}),getShaderSource:g}},qh=(e,t)=>{let r=e.inputs;Ul(r,t),e.compute(Ll(e.inputs,t))},Gh=e=>ye({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),m_=L(()=>{"use strict";ne(),ie(),Me(),se(),Fl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},Wl=(e,t)=>{let r=e[0].dims,n=e[0].dataType,i=r.length,s=e[1].dims,a=e[1].dataType,u=O.normalizeAxis(t.axis,i),l=r[u],d=s.slice(0),p=O.size(d),h=R("input",n,i),g=R("indicesInput",a,s.length),y=Z("output",n,d.length),_=[{type:12,data:p},{type:6,data:l},{type:12,data:u}];return _.push(...te(r,s,d)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:d,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:_}),getShaderSource:b=>`
      ${b.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(h,g,y)}
      ${b.mainStart()}
      ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${y.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${h.type.indices}(outputIndices);
      ${h.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${h.getByIndices("inputIndices")};

      ${y.setByOffset("global_idx","value")};
  }`}},Vh=e=>ye({axis:e.axis}),Hh=(e,t)=>{let r=e.inputs;Fl(r),e.compute(Wl(e.inputs,t))}}),g_=L(()=>{"use strict";ne(),ie(),se(),ql=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},Gl=(e,t)=>{let r=e[0].dims.slice(),n=e[1].dims.slice(),[i,s,a]=Vc.getShapeOfGemmResult(r,t.transA,n,t.transB,e.length===3?e[2].dims:void 0),u=[i,s];if(!u)throw new Error("Can't use gemm on the given tensors");let l=16,d=Math.ceil(s/l),p=Math.ceil(i/l),h=!0,g=O.size(u),y=[{type:12,data:h?d:g},{type:12,data:i},{type:12,data:s},{type:12,data:a},{type:1,data:t.alpha},{type:1,data:t.beta}],_=["type","type"];e.length===3&&(y.push(...te(e[2].dims)),_.push("rank")),y.push(...te(u));let b=v=>{let w="";t.transA&&t.transB?w="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?w="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?w="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(w="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let T=t.alpha===1?"":"value *= uniforms.alpha;",S=R("a",e[0].dataType,e[0].dims),I=R("b",e[1].dataType,e[1].dims),C=S.type.value,A=null,$=[S,I];e.length===3&&(A=R("c",e[2].dataType,e[2].dims.length),$.push(A));let B=Z("output",e[0].dataType,u.length);$.push(B);let U=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${v.registerUniforms(U).declareVariables(...$)}

  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${C}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${w}
    }

    ${T}
    ${A!=null?`let cOffset = ${A.broadcastedIndicesToOffset("vec2(m, n)",B)}; value += ${C}(uniforms.beta) * ${A.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},k=v=>{let w=R("a",e[0].dataType,e[0].dims),T=R("b",e[1].dataType,e[1].dims),S=null,I=[w,T];e.length===3&&(S=R("c",e[2].dataType,e[2].dims.length),I.push(S));let C=Z("output",e[0].dataType,u.length);I.push(C);let A=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],$="",B="";t.transA&&t.transB?(B=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,$="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(B=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,$="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(B=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,$="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(B=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${w.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${T.type.value}(0);
      }
      `,$="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let U=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${v.registerUniforms(A).declareVariables(...I)}
  var<workgroup> tile_a: array<array<${w.type.storage}, ${l}>, ${l}>;
  var<workgroup> tile_b: array<array<${T.type.storage}, ${l}>, ${l}>;
  ${v.mainStart([l,l,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${l};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${l};
    let num_tiles = (uniforms.K - 1) / ${l} + 1;
    var k_start = 0u;
    var value = ${C.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${B}
      k_start = k_start + ${l};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${l}; k++) {
        ${$}
      }
      workgroupBarrier();
    }

    ${U}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${S!=null?`let cOffset = ${S.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${C.type.value}(uniforms.beta) * ${S.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return h?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:d*p},programUniforms:y}),getShaderSource:k}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:b}},jh=e=>{let t=e.transA,r=e.transB,n=e.alpha,i=e.beta;return{transA:t,transB:r,alpha:n,beta:i,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Kh=(e,t)=>{ql(e.inputs),e.compute(Gl(e.inputs,t))}}),__=L(()=>{"use strict";ne(),ie(),Me(),se(),[St,At,sr,ar]=[0,1,2,3],Vl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},Hl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,jl=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,Kl=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,Ql=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,Xl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${St}] = batch;
     indices[${At}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${sr}] = u32(r);
            indices[${ar}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${sr}] = u32(clamp(r, 0, H - 1));
          indices[${ar}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${sr}] = gs_reflect(r, border[1], border[3]);
          indices[${ar}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,Zl=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${St}], indices[${At}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${St}], indices[${At}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${St}], indices[${At}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${St}], indices[${At}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${St}], indices[${At}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${St}], indices[${At}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,Yl=(e,t)=>{let r=R("x",e[0].dataType,e[0].dims.length),n=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],i=R("grid",e[1].dataType,n.length,2),s=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(s=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[St,At,sr,ar]=[0,3,1,2]);let a=Z("output",e[0].dataType,s.length),u=r.type.value,l=O.size(s),d=[{type:12,data:l},...te(e[0].dims,n,s)],p=h=>`
  ${h.registerUniform("output_size","u32").declareVariables(r,i,a)}
  ${Hl}
  ${jl(u)}
  ${Kl(t)}
  ${Ql(t)}
  ${Xl(r,u,t)}

  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${sr}]);
      let W_in = i32(uniforms.x_shape[${ar}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${a.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${St}], indices[${sr}], indices[${ar}]);
      let nxy = ${i.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${Zl(a,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:h=>{let g=O.size(s);return{outputs:[{dims:s,dataType:h[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:d}},getShaderSource:p}},Qh=(e,t)=>{Vl(e.inputs),e.compute(Yl(e.inputs,t))},Xh=e=>ye({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),Jh=L(()=>{"use strict";ne(),ie(),Me(),qs(),Hs(),se(),Yt(),He=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,Jl=(e,t)=>{let r=e[0],n=He(e,1),i=He(e,2),s=He(e,3),a=He(e,4),u=He(e,5),l=He(e,6),d=He(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let p=r.dims[0],h=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],y=h,_=0,b=0,k=Math.floor(g/t.numHeads);if(l&&d&&O.size(l.dims)&&O.size(d.dims)){if(l.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(l.dims[0]!==p||l.dims[1]!==t.numHeads||l.dims[3]!==k)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[0]!==p||d.dims[1]!==t.numHeads||d.dims[3]!==k)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[2]!==d.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(d.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');_=l.dims[2],b=l.dims[2]}else if(l&&O.size(l.dims)||d&&O.size(d.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v;if(n&&O.size(n.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(n.dims.length<3||n.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==n.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(n.dims.length===3){if(n.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');v=2,y=n.dims[1]}else if(n.dims.length===5){if(n.dims[2]!==t.numHeads||n.dims[3]!==2||n.dims[4]!==k)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(i)throw new Error('Expect "value" be none when "key" has packed kv format.');v=5,y=n.dims[1]}else{if(n.dims[1]!==t.numHeads||n.dims[3]!==k)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');v=0,y=n.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}if(s&&O.size(s.dims)>0){if(s.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(n&&n.dims.length===5&&n.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let w=_+y,T=0;if(a&&O.size(a.dims)>0){T=8;let A=a.dims;throw A.length===1?A[0]===p?T=1:A[0]===3*p+2&&(T=3):A.length===2&&A[0]===p&&A[1]===w&&(T=5),T===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let S=!1,I=g;if(i&&O.size(i.dims)>0){if(i.dims.length!==3&&i.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(i.dims.length===3){if(y!==i.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');I=i.dims[2]}else{if(y!==i.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');I=i.dims[1]*i.dims[3],S=!0}}let C=!1;if(a&&O.size(a.dims)>0)throw new Error("Key padding mask is not supported");if(u&&O.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==p||u.dims[1]!==t.numHeads||u.dims[2]!==h||u.dims[3]!==w)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:p,sequenceLength:h,pastSequenceLength:_,kvSequenceLength:y,totalSequenceLength:w,maxSequenceLength:b,inputHiddenSize:0,hiddenSize:g,vHiddenSize:I,headSize:k,vHeadSize:Math.floor(I/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:T,scale:t.scale,broadcastResPosBias:C,passPastInKv:S,qkvFormat:v}},Zh=e=>ye({...e}),Xi=ye({perm:[0,2,1,3]}),ed=(e,t,r,n,i,s,a)=>{let u=[n,i,s],l=O.size(u),d=[{type:12,data:l},{type:12,data:a},{type:12,data:s}],p=h=>{let g=Z("qkv_with_bias",t.dataType,u),y=R("qkv",t.dataType,u),_=R("bias",r.dataType,u),b=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${h.registerUniforms(b).declareVariables(y,_,g)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:d}),getShaderSource:p},{inputs:[t,r],outputs:[-1]})[0]},en=(e,t,r,n,i,s,a,u)=>{let l=s;if(a&&O.size(a.dims)>0){if(n===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return l=ed(e,s,a,t,n,r*i,u),l=l.reshape([t,n,r,i]),r===1||n===1?l:e.compute(Je(l,Xi.perm),{inputs:[l],outputs:[-1]})[0]}else return s.dims.length===3&&(l=s.reshape([t,n,r,i])),r===1||n===1?l:e.compute(Je(l,Xi.perm),{inputs:[l],outputs:[-1]})[0]},Yh=(e,t)=>{let r=Jl(e.inputs,t),n=e.inputs[0],i=He(e.inputs,1),s=He(e.inputs,2),a=He(e.inputs,3),u=He(e.inputs,4),l=He(e.inputs,5),d=He(e.inputs,6),p=He(e.inputs,7);if(n.dims.length===5)throw new Error("Packed QKV is not implemented");if(i?.dims.length===5)throw new Error("Packed KV is not implemented");let h=i&&s&&i.dims.length===4&&s.dims.length===4,g=en(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,n,a,0);if(h)return sn(e,g,i,s,u,void 0,d,p,l,r);if(!i||!s)throw new Error("key and value must be provided");let y=en(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,i,a,r.hiddenSize),_=en(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,s,a,2*r.hiddenSize);sn(e,g,y,_,u,void 0,d,p,l,r)}}),rf=L(()=>{"use strict";ne(),ie(),Me(),se(),td=e=>{if(!e||e.length<1)throw new Error("too few inputs")},rd=(e,t)=>{let r=[],n=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),n=r.length),ye({numOutputs:n,axis:t.axis,splitSizes:r})},nd=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${J("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,id=e=>{let t=e.length,r=[];for(let n=0;n<t;++n){let i=e[n].setByIndices("indices","input[global_idx]");t===1?r.push(i):n===0?r.push(`if (output_number == ${n}u) { ${i} }`):n===t-1?r.push(`else { ${i} }`):r.push(`else if (output_number == ${n}) { ${i} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Es=(e,t)=>{let r=e[0].dims,n=O.size(r),i=e[0].dataType,s=O.normalizeAxis(t.axis,r.length),a=new Array(t.numOutputs),u=R("input",i,r.length),l=new Array(t.numOutputs),d=[],p=[],h=0,g=[{type:12,data:n}];for(let _=0;_<t.numOutputs;_++){h+=t.splitSizes[_],l[_]=h;let b=r.slice();b[s]=t.splitSizes[_],p.push(b),a[_]=Z(`output${_}`,i,b.length),d.push({dims:p[_],dataType:e[0].dataType})}g.push({type:12,data:l},...te(r,...p));let y=_=>`
  ${_.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",l.length).declareVariables(u,...a)}
  ${nd(l.length)}
  ${id(a)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",s)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${J("uniforms.size_in_split_axis","output_number - 1u",l.length)};
      ${u.indicesSet("indices",s,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:y,getRunData:()=>({outputs:d,dispatchGroup:{x:Math.ceil(n/64)},programUniforms:g})}},ef=(e,t)=>{td(e.inputs);let r=e.inputs.length===1?t:rd(e.inputs,t);e.compute(Es(e.inputs,r),{inputs:[0]})},tf=e=>{let t=e.axis,r=e.splitSizes,n=e.numOutputs<0?r.length:e.numOutputs;if(n!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return ye({axis:t,numOutputs:n,splitSizes:r})}}),sf=L(()=>{"use strict";ne(),ie(),Me(),se(),sd=(e,t)=>{let[r,n,i,s]=e,{numHeads:a,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!O.areEqual(n.dims,[])&&!O.areEqual(n.dims,[1])&&n.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${n.dims.length}`);if(i.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${i.dims.length}`);if(s.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${s.dims.length}`);if(!O.areEqual(i.dims,s.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&a===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let l=r.dims[0],d=r.dims[r.dims.length-2],p=i.dims[0],h=O.sizeFromDimension(r.dims,1)/d,g=u===0?i.dims[1]*2:h/a;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(n.dims.length===2){if(l!==n.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${n.dims[0]}`);if(d!==n.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${n.dims[1]}`)}if(g/2!==i.dims[1]&&u/2!==i.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${i.dims[1]}`);if(d>p)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported")},Wn=(e,t)=>{let{interleaved:r,numHeads:n,rotaryEmbeddingDim:i,scale:s}=t,a=e[0].dims[0],u=O.sizeFromDimension(e[0].dims,1),l=e[0].dims[e[0].dims.length-2],d=u/l,p=e[2].dims[1],h=i===0?p*2:d/n,g=new Array(a,l,d/h,h-p),y=O.computeStrides(g),_=[{type:1,data:s},{type:12,data:g},{type:12,data:y},...e[0].dims.length===3?new Array({type:12,data:[u,d,h,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,h,l*h,1]}):[],...te(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],b=k=>{let v=R("input",e[0].dataType,e[0].dims.length),w=R("position_ids",e[1].dataType,e[1].dims.length),T=R("cos_cache",e[2].dataType,e[2].dims.length),S=R("sin_cache",e[3].dataType,e[3].dims.length),I=Z("output",e[0].dataType,e[0].dims.length);return k.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:y.length},{name:"input_output_strides",type:"u32",length:y.length}]),`
        ${k.declareVariables(v,w,T,S,I)}

        ${k.mainStart(Tr)}
          let half_rotary_emb_dim = uniforms.${T.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${k.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${w.broadcastedIndicesToOffset("bsnh.xy",Z("",w.type.tensor,2))};
            let position_id =
                u32(${w.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${v.getByOffset("i")} * ${T.get("position_id","bsnh[3]")} -
                ${v.getByOffset("j")} * ${S.get("position_id","bsnh[3]")};
            ${I.setByOffset("i","re")}
            let im = ${v.getByOffset("i")} * ${S.get("position_id","bsnh[3]")} +
                ${v.getByOffset("j")} * ${T.get("position_id","bsnh[3]")};
            ${I.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${I.setByOffset("k",v.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:ye({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:b,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(g)/Tr)},programUniforms:_})}},nf=(e,t)=>{sd(e.inputs,t),e.compute(Wn(e.inputs,t))}}),y_=L(()=>{"use strict";Me(),ne(),Hs(),Jh(),rf(),Yt(),sf(),se(),ad=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],n=e[1],i=e[2],s=e[3],a=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,l=r.dims[0],d=r.dims[1],p=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],h=d,g=0,y=!n||n.dims.length===0,_=Math.floor(y?p/(t.numHeads+2*t.kvNumHeads):p/t.numHeads);y&&(p=_*t.numHeads);let b=s&&s.dims.length!==0,k=a&&a.dims.length!==0;if(b&&s.dims.length===4&&s.dims[0]===l&&s.dims[1]!==t.kvNumHeads&&s.dims[2]===t.kvNumHeads&&s.dims[3]===_)throw new Error("BSNH pastKey/pastValue is not supported");if(b&&k){if(s.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(a.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=s.dims[2]}else if(b||k)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let v=1;if(n&&n.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(n.dims.length<3||n.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==n.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(n.dims.length===3){if(r.dims[2]%n.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');h=n.dims[1]}else if(n.dims.length===5){if(n.dims[2]!==t.numHeads||n.dims[3]!==2||n.dims[4]!==_)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(i)throw new Error('Expect "value" be none when "key" has packed kv format.');h=n.dims[1]}else{if(n.dims[1]!==t.numHeads||n.dims[3]!==_)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');h=n.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');v=3}let w=0,T=!1,S=t.kvNumHeads?_*t.kvNumHeads:p;if(i&&i.dims.length>0){if(i.dims.length!==3&&i.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(i.dims.length===3){if(h!==i.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');S=i.dims[2]}else{if(h!==i.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');S=i.dims[1]*i.dims[3],T=!0}}let I=e.length>4?e[5]:void 0;if(I&&I.dims.length!==1&&I.dims[0]!==l)throw new Error('Input "seqlens" is expected to have 1 dimension and the same dim 0 as batch_size');return{batchSize:l,sequenceLength:d,pastSequenceLength:g,kvSequenceLength:h,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:p,vHiddenSize:S,headSize:_,vHeadSize:Math.floor(S/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:w,scale:t.scale,broadcastResPosBias:!1,passPastInKv:T,qkvFormat:v}},od=ye({perm:[0,2,1,3]}),Zi=(e,t,r)=>{let n=t,i=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(n=t.reshape([r.batchSize,r.kvSequenceLength,i,r.headSize]),n=e.compute(Je(n,od.perm),{inputs:[n],outputs:[-1]})[0]),n},ud=(e,t,r,n)=>{let i=7,s=["type","type"],a=[e*t],u=e*t,l=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],d=p=>{let h=R("seq_lens",r.dataType,r.dims),g=R("total_seq_lens",n.dataType,n.dims),y=Z("pos_ids",i,a),_=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${p.registerUniforms(_).declareVariables(h,g,y)}
  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${h.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${y.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:s},getRunData:()=>({outputs:[{dims:a,dataType:i}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:d}},af=(e,t)=>{let r=ad(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let n=e.inputs[0],i=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,s=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,a=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,l=e.inputs.length>4?e.inputs[5]:void 0,d=e.inputs.length>5?e.inputs[6]:void 0,p=r.kvNumHeads?r.kvNumHeads:r.numHeads,h=ye({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,p*r.headSize,p*r.headSize]}),[g,y,_]=!i&&!s?e.compute(Es([n],h),{inputs:[n],outputs:[-1,-1,-1]}):[n,i,s],b,k;if(t.doRotary){let S=e.compute(ud(r.batchSize,r.sequenceLength,l,d),{inputs:[l,d],outputs:[-1]})[0],I=e.inputs[7],C=e.inputs[8],A=ye({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),$=[g,S,I,C],B=[-1];b=e.compute(Wn($,A),{inputs:$,outputs:B})[0],$.splice(0,1,y);let U=ye({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});k=e.compute(Wn($,U),{inputs:$,outputs:B})[0]}let v=en(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?b:g,void 0,0),w=Zi(e,t.doRotary?k:y,r),T=Zi(e,_,r);sn(e,v,w,T,void 0,void 0,a,u,void 0,r,l,d)}}),w_=L(()=>{"use strict";ne(),ie(),Yt(),se(),Yi=(e,t,r,n,i,s,a,u)=>{let l=Ae(s),d=l===1?"f32":`vec${l}f`,p=l===1?"vec2f":`mat2x${l}f`,h=i*a,g=64;h===1&&(g=256);let y=[i,a,s/l],_=[i,a,2],b=["rank","type","type"],k=[];k.push(...te(y,_));let v=w=>{let T=R("x",t.dataType,3,l),S=R("scale",r.dataType,r.dims),I=R("bias",n.dataType,n.dims),C=Z("output",1,3,2),A=[T,S,I,C];return`
  var<workgroup> workgroup_shared : array<${p}, ${g}>;
  const workgroup_size = ${g}u;
  ${w.declareVariables(...A)}
  ${w.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${d}(0);
    var squared_sum = ${d}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${d}(${T.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${p}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${Zt("workgroup_shared[0][0]",l)} / f32(hight * ${l});
      let squared_sum_final = ${Zt("workgroup_shared[0][1]",l)} / f32(hight * ${l});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${l};${u};${g}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:_,dataType:1}],dispatchGroup:{x:h},programUniforms:k}),getShaderSource:v},{inputs:[t,r,n],outputs:[-1]})[0]},ld=(e,t,r)=>{let n=t[0].dims,i=n,s=2,a=n[0],u=n[1],l=O.sizeFromDimension(n,s),d=Ae(l),p=O.size(i)/d,h=Yi(e,t[0],t[1],t[2],a,l,u,r.epsilon),g=[a,u,l/d],y=[a,u],_=["type","none"],b=k=>{let v=R("x",t[0].dataType,g.length,d),w=R("scale_shift",1,y.length,2),T=Z("output",t[0].dataType,g.length,d),S=[v,w,T];return`
  ${k.registerUniform("output_size","u32").declareVariables(...S)}
  ${k.mainStart()}
  ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${T.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${w.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${v.getByOffset("global_idx")} * ${T.type.value}(scale_shift.x) + ${T.type.value}(scale_shift.y);
      ${T.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${d}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:i,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:[{type:12,data:p},...te(g,y,g)]}),getShaderSource:b},{inputs:[t[0],h]})},dd=(e,t,r)=>{let n=t[0].dims,i=n,s=n[0],a=n[n.length-1],u=O.sizeFromDimension(n,1)/a,l=Ae(a),d=O.size(i)/l,p=[{type:12,data:u},{type:12,data:Math.floor(a/l)}],h=["type","type"],g=!1,y=[0,n.length-1];for(let v=0;v<n.length-2;v++)g=g||n[v+1]!==1,y.push(v+1);g=g&&n[n.length-1]!==1;let _=g?e.compute(Je(e.inputs[0],y),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:n.length},(v,w)=>n[y[w]])),b=Yi(e,_,t[1],t[2],s,u,a,r.epsilon),k=v=>{let w=De(t[0].dataType),T=l===1?"vec2f":`mat${l}x2f`,S=A=>{let $=A===0?"x":"y",B=l===1?"f32":`vec${l}f`;switch(l){case 1:return`${w}(${B}(scale.${$}))`;case 2:return`vec2<${w}>(${B}(scale[0].${$}, scale[1].${$}))`;case 4:return`vec4<${w}>(${B}(scale[0].${$}, scale[1].${$}, scale[2].${$}, scale[3].${$}))`;default:throw new Error(`Not supported compoents ${l}`)}},I=R("input",t[0].dataType,t[0].dims,l),C=Z("output",t[0].dataType,i,l);return`
  @group(0) @binding(0) var<storage, read> input : array<${I.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${T}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${C.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${v.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${S(0)}, ${S(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${l}`,inputDependencies:h},getRunData:()=>({outputs:[{dims:i,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p}),getShaderSource:k},{inputs:[t[0],b]})},of=(e,t)=>{t.format==="NHWC"?dd(e,e.inputs,t):ld(e,e.inputs,t)}}),b_=L(()=>{"use strict";ne(),ie(),se(),cd=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},pd=(e,t,r)=>{let n=t.simplified,i=e[0].dims,s=e[1],a=!n&&e[2],u=i,l=O.normalizeAxis(t.axis,i.length),d=O.sizeToDimension(i,l),p=O.sizeFromDimension(i,l),h=O.size(s.dims),g=a?O.size(a.dims):0;if(h!==p||a&&g!==p)throw new Error(`Size of X.shape()[axis:] == ${p}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${h} and bias size of ${g}`);let y=[];for(let I=0;I<i.length;++I)I<l?y.push(i[I]):y.push(1);let _=Ae(p),b=["type","type"],k=[{type:12,data:d},{type:1,data:p},{type:12,data:Math.floor(p/_)},{type:1,data:t.epsilon}];a&&b.push("type");let v=r>1,w=r>2,T=I=>{let C=De(e[0].dataType),A=[R("x",e[0].dataType,e[0].dims,_),R("scale",s.dataType,s.dims,_)];a&&A.push(R("bias",a.dataType,a.dims,_)),A.push(Z("output",e[0].dataType,u,_)),v&&A.push(Z("mean_data_output",1,y)),w&&A.push(Z("inv_std_output",1,y));let $=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${I.registerUniforms($).declareVariables(...A)}
  ${I.mainStart()}
    ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${ws("f32",_)};
    var mean_square_vector = ${ws("f32",_)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${kr(C,_,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${Zt("mean_vector",_)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${Zt("mean_square_vector",_)} / uniforms.norm_size ${n?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${kr(C,_,"x[j + offset]")};
      let f32scale = ${kr(C,_,"scale[j]")};
      output[j + offset] = ${A[0].type.value}((f32input ${n?"":"- mean"}) * inv_std_dev * f32scale
        ${a?`+ ${kr(C,_,"bias[j]")}`:""}
      );
    }

    ${v?"mean_data_output[global_idx] = mean":""};
    ${w?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},S=[{dims:u,dataType:e[0].dataType}];return v&&S.push({dims:y,dataType:1}),w&&S.push({dims:y,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${_};${r};${n}`,inputDependencies:b},getRunData:()=>({outputs:S,dispatchGroup:{x:Math.ceil(d/64)},programUniforms:k}),getShaderSource:T}},uf=(e,t)=>{cd(e.inputs),e.compute(pd(e.inputs,t,e.outputCount))}}),$_=L(()=>{"use strict";ie(),Zs(),Ys(),hd=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},lf=e=>{hd(e.inputs);let t=Sr.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],n=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&n<8)e.compute(Xs(e.inputs,{activation:""},t));else{let i=t[t.length-2],s=O.size(e.inputs[0].dims.slice(0,-2)),a=O.size(e.inputs[1].dims.slice(0,-2));if(s!==1&&i===1&&a===1){let u=e.inputs[0].reshape([1,s,n]),l=e.inputs[1].reshape([1,n,r]),d=[1,s,r],p=[u,l];e.compute(Fn(p,{activation:""},t,d),{inputs:p})}else e.compute(Fn(e.inputs,{activation:""},t))}}}),v_=L(()=>{"use strict";ne(),ie(),Me(),se(),fd=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],n=r.dims.length;if(r.dims[n-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let i=Math.floor((t.k+t.blockSize-1)/t.blockSize),s=t.blockSize/8*t.bits,a=e[1];if(!O.areEqual(a.dims,[t.n,i,s]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(O.size(u)!==t.n*i)throw new Error("scales input size error.");if(e.length===4){let l=e[3].dims,d=t.n*(t.bits===8?i:Math.floor((i*t.bits+7)/8));if(O.size(l)!==d)throw new Error("zeroPoints input size error.")}},md=(e,t)=>{let r=e[0].dims,n=r.length,i=r[n-2],s=t.k,a=t.n,u=r.slice(0,n-2),l=O.size(u),d=e[1].dims[2]/4,p=e[0].dataType,h=Ae(t.k),g=Ae(d),y=Ae(a),_=u.concat([i,a]),b=i>1&&a/y%2===0?2:1,k=O.size(_)/y/b,v=64,w=[],T=[l,i,s/h],S=O.convertShape(e[1].dims).slice();S.splice(-1,1,d/g),w.push(...te(T)),w.push(...te(S)),w.push(...te(e[2].dims)),e.length===4&&w.push(...te(O.convertShape(e[3].dims)));let I=[l,i,a/y];w.push(...te(I));let C=A=>{let $=T.length,B=R("a",e[0].dataType,$,h),U=R("b",12,S.length,g),H=R("scales",e[2].dataType,e[2].dims.length),W=[B,U,H],G=e.length===4?R("zero_points",12,e[3].dims.length):void 0;G&&W.push(G);let j=I.length,z=Z("output",e[0].dataType,j,y),P=De(e[0].dataType),ee=(()=>{switch(h){case 1:return`array<${P}, 8>`;case 2:return`mat4x2<${P}>`;case 4:return`mat2x4<${P}>`;default:throw new Error(`${h}-component is not supported.`)}})(),X=()=>{let D=`
          // reuse a data
            var input_offset = ${B.indicesToOffset(`${B.type.indices}(batch, row, word_offset)`)};
            var a_data: ${ee};
            for (var j: u32 = 0; j < ${8/h}; j++) {
              a_data[j] = ${B.getByOffset("input_offset")};
              input_offset++;
            }
          `;for(let F=0;F<y*b;F++)D+=`
            b_value = ${g===1?`b${F}_data`:`b${F}_data[i]`};
            b_value_lower = unpack4xU8(b_value & b_mask);
            b_value_upper = unpack4xU8((b_value >> 4) & b_mask);
            b_quantized_values = ${ee}(${Array.from({length:4},(K,re)=>`${P}(b_value_lower[${re}]), ${P}(b_value_upper[${re}])`).join(", ")});
            b_dequantized_values = ${h===1?`${ee}(${Array.from({length:8},(K,re)=>`(b_quantized_values[${re}] - ${G?`zero_point${F}`:"zero_point"}) * scale${F}`).join(", ")});`:`(b_quantized_values - ${ee}(${Array(8).fill(`${G?`zero_point${F}`:"zero_point"}`).join(",")})) * scale${F};`};
            workgroup_shared[local_id.x * ${b} + ${Math.floor(F/y)}]${y>1?`[${F%y}]`:""} += ${Array.from({length:8/h},(K,re)=>`${h===1?`a_data[${re}] * b_dequantized_values[${re}]`:`dot(a_data[${re}], b_dequantized_values[${re}])`}`).join(" + ")};
          `;return D},V=()=>{let D=`
            var col_index = col * ${y};
            ${G?`
            let zero_point_bytes_per_col = (nBlocksPerCol + 1) / 2;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${P}(8);`}
            `;for(let F=0;F<y*b;F++)D+=`
            let scale${F} = ${H.getByOffset("col_index * nBlocksPerCol + block")};
            ${G?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block >> 0x1u);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            zero_point_word = ${G.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${F} = ${P}((zero_point_word) & 0xFu);`:""}
            col_index += 1;`;return D},oe=()=>{let D=`col_index = col * ${y};`;for(let F=0;F<y*b;F++)D+=`
            let b${F}_data = ${U.getByIndices(`${U.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return D+=`
            var b_value: u32;
            let b_mask: u32 = 0x0F0F0F0Fu;
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${ee};
            var b_dequantized_values: ${ee};`,D};return`
        var<workgroup> workgroup_shared: array<${z.type.value}, ${b*v}>;
        ${A.declareVariables(...W,z)}
        ${A.mainStart([v,1,1])}
          let output_indices = ${z.offsetToIndices(`(global_idx / ${v}) * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${v}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/h};
            ${V()}
            for (var word: u32 = 0; word < ${d}; word += ${g}) {
              ${oe()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${X()}
                word_offset += ${8/h};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${b}) {
            var output_value: ${z.type.value} = ${z.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${v}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${b};
            }
            ${z.setByIndices(`${z.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${h};${g};${y};${b};${v}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:p}],dispatchGroup:{x:k},programUniforms:w}),getShaderSource:C}},gd=(e,t)=>{let r=e[0].dims,n=r.length,i=r[n-2],s=t.k,a=t.n,u=r.slice(0,n-2),l=O.size(u),d=e[1].dims[2]/4,p=e[0].dataType,h=Ae(t.k),g=Ae(d),y=u.concat([i,a]),_=128,b=a%8===0?8:a%4===0?4:1,k=_/b,v=k*g*8,w=v/h,T=v/t.blockSize,S=O.size(y)/b,I=[],C=[l,i,s/h],A=O.convertShape(e[1].dims).slice();A.splice(-1,1,d/g),I.push(...te(C)),I.push(...te(A)),I.push(...te(e[2].dims)),e.length===4&&I.push(...te(O.convertShape(e[3].dims)));let $=[l,i,a];I.push(...te($));let B=U=>{let H=C.length,W=R("a",e[0].dataType,H,h),G=R("b",12,A.length,g),j=R("scales",e[2].dataType,e[2].dims.length),z=[W,G,j],P=e.length===4?R("zero_points",12,e[3].dims.length):void 0;P&&z.push(P);let ee=$.length,X=Z("output",e[0].dataType,ee),V=De(e[0].dataType),oe=()=>{switch(h){case 1:return`
          let a_data0 = vec4<${V}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${V}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${V}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${V}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${h}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${W.type.value}, ${w}>;
        var<workgroup> inter_results: array<array<${X.type.value}, ${k}>, ${b}>;
        ${U.declareVariables(...z,X)}
        ${U.mainStart([k,b,1])}
          let output_indices = ${X.offsetToIndices(`workgroup_index * ${b}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${T} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${w};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${w}; a_offset += ${_})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${W.getByIndices(`${W.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${W.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${T} + local_id.x;
            ${P?`
            let zero_point_bytes_per_col = (n_blocks_per_col + 1) / 2;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block >> 0x1u);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            let zero_point_word = ${P.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${V}((zero_point_word) & 0xFu);`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${V}(8);`}
            let scale = ${j.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${G.getByIndices(`${G.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/h};
            for (var i: u32 = 0; i < ${g}; i++) {
              ${oe()}
              let b_value = ${g===1?"b_data":"b_data[i]"};
              let b_value_lower = unpack4xU8(b_value & 0x0F0F0F0Fu);
              let b_value_upper = unpack4xU8((b_value >> 4) & 0x0F0F0F0Fu);
              let b_quantized_values = mat2x4<${V}>(${Array.from({length:4},(D,F)=>`${V}(b_value_lower[${F}]), ${V}(b_value_upper[${F}])`).join(", ")});
              let b_dequantized_values = (b_quantized_values - mat2x4<${V}>(${Array(8).fill("zero_point").join(",")})) * scale;
              inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(D,F)=>`${`dot(a_data${F}, b_dequantized_values[${F}])`}`).join(" + ")};
              word_offset += ${8/h};
            }
            workgroupBarrier();
          }

          if (local_idx < ${b}) {
            var output_value: ${X.type.value} = ${X.type.value}(0);
            for (var b = 0u; b < ${k}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${X.setByIndices(`${X.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${h};${g};${k};${b}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:p}],dispatchGroup:{x:S},programUniforms:I}),getShaderSource:B}},df=(e,t)=>{fd(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(gd(e.inputs,t)):e.compute(md(e.inputs,t))},cf=e=>ye(e)}),x_=L(()=>{"use strict";ne(),ie(),se(),_d=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},yd=(e,t,r)=>{let n="";for(let i=t-1;i>=0;--i)n+=`
            k = i32(${e.indicesGet("indices",i)}) - ${J("uniforms.pads",i,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${J("uniforms.x_shape",i,t)})) {
              break;
            }
            offset += k * i32(${J("uniforms.x_strides",i,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${n}
            value = x[offset];
          }
      `},wd=(e,t,r)=>{let n="";for(let i=t-1;i>=0;--i)n+=`
                k = i32(${e.indicesGet("indices",i)}) - ${J("uniforms.pads",i,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${J("uniforms.x_shape",i,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${J("uniforms.x_shape",i,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${J("uniforms.x_strides",i,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${n}
              value = x[offset];
          `},bd=(e,t,r)=>{let n="";for(let i=t-1;i>=0;--i)n+=`
                k = i32(${e.indicesGet("indices",i)}) - ${J("uniforms.pads",i,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${J("uniforms.x_shape",i,t)})) {
                  k = i32(${J("uniforms.x_shape",i,t)}) - 1;
                }
                offset += k * i32(${J("uniforms.x_strides",i,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${n}
              value = x[offset];
          `},$d=(e,t,r)=>{let n="";for(let i=t-1;i>=0;--i)n+=`
                k = i32(${e.indicesGet("indices",i)}) - ${J("uniforms.pads",i,r)};
                if (k < 0)  {
                  k += i32(${J("uniforms.x_shape",i,t)}]);
                }
                if (k >= i32(${J("uniforms.x_shape",i,t)})) {
                  k -= i32(${J("uniforms.x_shape",i,t)});
                }
                offset += k * i32(${J("uniforms.x_strides",i,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${n}
              value = x[offset];
          `},vd=(e,t,r)=>{switch(r.mode){case 0:return yd(e,t,r.pads.length);case 1:return wd(e,t,r.pads.length);case 2:return bd(e,t,r.pads.length);case 3:return $d(e,t,r.pads.length);default:throw new Error("Invalid mode")}},xd=(e,t)=>{let r=O.padShape(e[0].dims.slice(),t.pads),n=e[0].dims,i=O.size(r),s=[{type:12,data:i},{type:6,data:t.pads}],a=e.length>=3&&e[2].data;t.mode===0&&s.push({type:a?e[2].dataType:1,data:t.value}),s.push(...te(e[0].dims,r));let u=["rank"],l=d=>{let p=Z("output",e[0].dataType,r.length),h=R("x",e[0].dataType,n.length),g=h.type.value,y=vd(p,n.length,t),_=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&_.push({name:"constant_value",type:a?g:"f32"}),`
            ${d.registerUniforms(_).declareVariables(h,p)}
            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${p.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${y}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${a}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(r)/64)},programUniforms:s}),getShaderSource:l}},kd=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),n=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,i=e[0].dims.length,s=new Int32Array(2*i).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let l=0;l<u.length;l++)s[Number(u[l])]=Number(r[l]),s[Number(u[l])+i]=Number(r[l+u.length])}else r.forEach((u,l)=>s[Number(l)]=Number(u));let a=[];return s.forEach(u=>a.push(u)),{mode:t.mode,value:n,pads:a}}else return t},pf=(e,t)=>{_d(e.inputs);let r=kd(e.inputs,t);e.compute(xd(e.inputs,r),{inputs:[0]})}}),k_=L(()=>{"use strict";it(),ne(),ie(),se(),jr=e=>{if(ke.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},Ji=(e,t,r)=>{let n=t.format==="NHWC",i=e.dims.slice();n&&i.splice(1,0,i.pop());let s=Object.hasOwnProperty.call(t,"dilations"),a=t.kernelShape.slice(),u=t.strides.slice(),l=s?t.dilations.slice():[],d=t.pads.slice();Un.adjustPoolAttributes(r,i,a,u,l,d);let p=Un.computePoolOutputShape(r,i,u,l,a,d,t.autoPad),h=Object.assign({},t);s?Object.assign(h,{kernelShape:a,strides:u,pads:d,dilations:l,cacheKey:t.cacheKey}):Object.assign(h,{kernelShape:a,strides:u,pads:d,cacheKey:t.cacheKey});let g=p.slice();return g.push(g.splice(1,1)[0]),[h,n?g:p]},es=(e,t)=>{let r=t.format==="NHWC",n=O.size(e),i=O.size(t.kernelShape),s=[{type:12,data:n},{type:12,data:i}],a=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],l=t.strides[t.strides.length-1],d=t.pads[t.pads.length/2-1],p=t.pads[t.pads.length-1],h=!!(d+p);s.push({type:12,data:u},{type:12,data:l},{type:12,data:d},{type:12,data:p}),a.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let y=t.kernelShape[t.kernelShape.length-2],_=t.strides[t.strides.length-2],b=t.pads[t.pads.length/2-2],k=t.pads[t.pads.length-2];g=!!(b+k),s.push({type:12,data:y},{type:12,data:_},{type:12,data:b},{type:12,data:k}),a.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[s,a,!0,h,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=O.computeStrides(t.kernelShape);s.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),a.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let l=t.pads.reduce((d,p)=>d+p);return[s,a,!!l,!1,!1]}},ts=(e,t,r,n,i,s,a,u,l,d,p,h)=>{let g=i.format==="NHWC",y=t.type.value,_=Z("output",t.type.tensor,n);if(i.kernelShape.length<=2){let b="",k="",v="",w=r-(g?2:1);if(p?b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${w}] < 0 || xIndices[${w}]
                      >= uniforms.x_shape[${w}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`:b=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${w}] = indices[${w}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`,i.kernelShape.length===2){let T=r-(g?3:2);h?k=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${T}] = indices[${T}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${T}] < 0 || xIndices[${T}] >= uniforms.x_shape[${T}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:k=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${T}] = indices[${T}] * uniforms.sh - uniforms.phStart + j;
                `,v=`
              }
            `}return`
            ${e.registerUniforms(l).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var value = ${y}(${u});
              var pad = 0;
              ${k}
              ${b}
              ${v}
              ${a}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let b=i.kernelShape.length,k=i.pads.length,v="";return d?v=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${s}
              }`:v=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${s}
            `,`
            ${e.registerUniforms(l).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var offsets: array<u32, ${b}>;

              var value = ${y}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${b-1}u; j++) {
                  offsets[j] = offset / ${J("uniforms.kernelStrides","j",b)};
                  offset -= offsets[j] * ${J("uniforms.kernelStrides","j",b)};
                }
                offsets[${b-1}] = offset;

                isPad = false;
                for (var j = ${r-b}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${J("uniforms.strides",`j - ${r-b}u`,b)}
                    + offsets[j - ${r-b}u] - ${J("uniforms.pads","j - 2u",k)};
                  ${v}
              }
              ${a}

              output[global_idx] = value;
            }`}},rs=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Sd=e=>`${rs(e)};${e.countIncludePad}`,Td=e=>`${rs(e)};${e.storageOrder};${e.dilations}`,ns=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),is=(e,t,r,n)=>{let[i,s]=Ji(t,n,r),a=R("x",t.dataType,t.dims.length),u=a.type.value,l="value += x_val;",d="";i.countIncludePad?d+=`value /= ${u}(uniforms.kernelSize);`:d+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[p,h,g,y,_]=es(s,i);p.push(...te(t.dims,s));let b=["rank"];return{name:e,shaderCache:{hint:`${n.cacheKey};${g};${y};${_}`,inputDependencies:b},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(s)/64)},programUniforms:p}),getShaderSource:k=>ts(k,a,t.dims.length,s.length,i,l,d,0,h,g,y,_)}},hf=e=>{let t=e.count_include_pad!==0,r=ns(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let n={countIncludePad:t,...r,cacheKey:""};return{...n,cacheKey:Sd(n)}},ff=(e,t)=>{jr(e.inputs),e.compute(is("AveragePool",e.inputs[0],!1,t))},ss={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},mf=e=>{let t=e.format;return{format:t,...ss,cacheKey:t}},gf=(e,t)=>{jr(e.inputs),e.compute(is("GlobalAveragePool",e.inputs[0],!0,t))},as=(e,t,r,n)=>{let[i,s]=Ji(t,n,r),a=`
      value = max(x_val, value);
    `,u="",l=R("x",t.dataType,t.dims.length),d=["rank"],[p,h,g,y,_]=es(s,i);return p.push(...te(t.dims,s)),{name:e,shaderCache:{hint:`${n.cacheKey};${g};${y};${_}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(s)/64)},programUniforms:p}),getShaderSource:b=>ts(b,l,t.dims.length,s.length,i,a,u,t.dataType===10?-65504:-1e5,h,g,y,_)}},_f=(e,t)=>{jr(e.inputs),e.compute(as("MaxPool",e.inputs[0],!1,t))},yf=e=>{let t=e.storage_order,r=e.dilations,n=ns(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(n.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let i={storageOrder:t,dilations:r,...n,cacheKey:""};return{...i,cacheKey:Td(i)}},wf=e=>{let t=e.format;return{format:t,...ss,cacheKey:t}},bf=(e,t)=>{jr(e.inputs),e.compute(as("GlobalMaxPool",e.inputs[0],!0,t))}}),S_=L(()=>{"use strict";ne(),ie(),Me(),se(),Id=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[0].dataType===6&&e.length>2)throw new Error("In the case of dequantizing int32 there is no zero point.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,n)=>r===e[2].dims[n]).reduce((r,n)=>r&&n,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((i,s)=>s===t.axis||i===e[0].dims[s]).reduce((i,s)=>i&&s,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],n=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/n)||t.blockSize>Math.ceil(r/(n-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Ed=(e,t)=>{let r=O.normalizeAxis(t.axis,e[0].dims.length),n=e[0].dataType,i=n===3,s=e[0].dims,a=e[1].dataType,u=O.size(s),l=n===3||n===2,d=l?[Math.ceil(O.size(e[0].dims)/4)]:e[0].dims,p=e[1].dims,h=e.length>2?e[2]:void 0,g=h?l?[Math.ceil(O.size(h.dims)/4)]:h.dims:void 0,y=p.length===0||p.length===1&&p[0]===1,_=y===!1&&p.length===1,b=Ae(u),k=y&&(!l||b===4),v=k?b:1,w=k&&!l?b:1,T=R("input",l?12:n,d.length,w),S=R("scale",a,p.length),I=h?R("zero_point",l?12:n,g.length):void 0,C=Z("output",a,s.length,v),A=[T,S];I&&A.push(I);let $=[d,p];h&&$.push(g);let B=[{type:12,data:u/v},{type:12,data:r},{type:12,data:t.blockSize},...te(...$,s)],U=H=>{let W=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${H.registerUniforms(W).declareVariables(...A,C)}
      ${H.mainStart()}
          ${H.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${C.offsetToIndices("global_idx")};

          // Set input x
          ${l?`
            let input = ${T.getByOffset("global_idx / 4")};
            let x_vec = ${i?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${v===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${T.getByOffset("global_idx")};`};

          // Set scale input
          ${y?`let scale_value= ${S.getByOffset("0")}`:_?`
            let scale_index = ${C.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${S.getByOffset("scale_index")};`:`
            var scale_indices: ${S.type.indices} = output_indices;
            let index = ${S.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${S.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${S.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${I?y?l?`
                let zero_point_input = ${I.getByOffset("0")};
                let zero_point_vec =  ${i?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${I.getByOffset("0")}`:_?l?`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${I.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${i?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${I.getByOffset("zero_point_index")};`:l?`
                let zero_point_offset = ${S.indicesToOffset("scale_indices")};
                let zero_point_input = ${I.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${i?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${I.getByIndices("scale_indices")};`:`let zero_point_value = ${l?i?"i32":"u32":T.type.value}(0);`};
      // Compute and write output
      ${C.setByOffset("global_idx",`${C.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:I?["rank","rank","rank"]:["rank","rank"]},getShaderSource:U,getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/v/64),y:1,z:1},programUniforms:B})}},$f=(e,t)=>{Id(e.inputs,t),e.compute(Ed(e.inputs,t))},vf=e=>ye({axis:e.axis,blockSize:e.blockSize})}),T_=L(()=>{"use strict";it(),ne(),se(),Cd=(e,t,r)=>{let n=e===t,i=e<t&&r<0,s=e>t&&r>0;if(n||i||s)throw new Error("Range these inputs' contents are invalid.")},zd=(e,t,r,n)=>{let i=Math.abs(Math.ceil((t-e)/r)),s=[i],a=i,u=[{type:12,data:a},{type:n,data:e},{type:n,data:r},...te(s)],l=d=>{let p=Z("output",n,s.length),h=p.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:h},{name:"delta",type:h}];return`
        ${d.registerUniforms(g).declareVariables(p)}
        ${d.mainStart()}
        ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${h}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${n}`},getShaderSource:l,getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:u})}},xf=e=>{let t=0,r=0,n=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],n=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],n=e.inputs[2].getFloat32Array()[0]),ke.webgpu.validateInputContent&&Cd(t,r,n),e.compute(zd(t,r,n,e.inputs[0].dataType),{inputs:[]})}}),I_=L(()=>{"use strict";ne(),ie(),Me(),se(),Ad=(e,t,r,n)=>{if(e!=="none"&&n!=="i32"&&n!=="u32"&&n!=="f32")throw new Error(`Input ${n} is not supported with reduction ${e}.`);let i=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,s=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return n==="i32"||n==="u32"?`atomicAdd(&${t}, bitcast<${n}>(${r}));`:`
              ${i}bitcast<${n}>(oldValue) + (${r})${s}`;case"max":return n==="i32"||n==="u32"?`atomicMax(&${t}, bitcast<${n}>(${r}));`:`
                ${i}max(bitcast<f32>(oldValue), (${r}))${s}`;case"min":return n==="i32"||n==="u32"?`atomicMin(&${t}, bitcast<${n}>(${r}));`:`${i}min(bitcast<${n}>(oldValue), (${r}))${s}`;case"mul":return`${i}(bitcast<${n}>(oldValue) * (${r}))${s}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Md=(e,t)=>{let r=e[0].dims,n=e[1].dims,i=r,s=1,a=Math.ceil(O.sizeToDimension(n,n.length-1)/s),u=n[n.length-1],l=O.sizeFromDimension(r,u),d=[{type:12,data:a},{type:12,data:u},{type:12,data:l},...te(e[1].dims,e[2].dims,i)],p=h=>{let g=R("indices",e[1].dataType,e[1].dims.length),y=R("updates",e[2].dataType,e[2].dims.length,s),_=t.reduction!=="none"&&t.reduction!==""?Yc("output",e[0].dataType,i.length):Z("output",e[0].dataType,i.length,s);return`
      ${h.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,y,_)}
      ${h.mainStart()}
        ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Ad(t.reduction,"output[data_offset + i]","value",_.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:d}),getShaderSource:p}},kf=e=>ye({reduction:e.reduction}),Sf=(e,t)=>{e.compute(Md(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),E_=L(()=>{"use strict";ne(),ie(),Me(),se(),Od=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Nd=(e,t,r)=>{t.every(i=>i>=0&&i<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let n=new Array(r).fill(1);return t.forEach((i,s)=>n[i]=e[s]),n},Rd=(e,t,r,n,i,s)=>{let[a,u,l]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],d=e[0].dims.length;if(a>0&&e.length>a&&e[a].dims.length>0)e[a].getFloat32Array().forEach(p=>s.push(p));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(p=>n.push(p)),n.length!==0&&n.length!==d&&r>=18&&n.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Od(n,t),t.axes.length>0&&Nd(n,t.axes,d).forEach((p,h)=>n[h]=p)}if(l>0&&e.length>l&&e[l].dims.length===1&&e[l].dims[0]>0&&(e[l].getBigInt64Array().forEach(p=>i.push(Number(p))),i.length!==0&&i.length!==d&&r>=18&&i.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(n.length!==0&&n.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof n<"u"&&typeof i<"u"&&n.length>0&&i.length>d)throw new Error("Resize requires only of scales or sizes to be specified")},os=(e,t,r,n)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${n}(big / (${r}));
  let fract = ${n}(big % (${r})) / ${n}(${r});
  return whole + fract;
`,Bd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${os("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${os("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Dd=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Pd=(e,t,r)=>{let n=new Array(r).fill(0).concat(new Array(r).fill(1)),i=e.length===0?n:e.slice();return t.length>0?(t.forEach((s,a)=>{n[s]=i[a],n[a+r]=i[t.length+a]}),n):i},Ud=(e,t,r,n)=>{let i=[];if(r.length>0)if(n.length>0){if(e.forEach(s=>i.push(s)),Math.max(...n)>e.length)throw new Error("axes is out of bound");n.forEach((s,a)=>i[s]=r[a])}else r.forEach(s=>i.push(s));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");i=e.map((s,a)=>Math.round(s*t[a]))}return i},Ld=(e,t,r)=>{let n=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(s=>t[s]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(s=>t[s]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let i=e.slice();return r.axes.length>0?(r.axes.forEach(s=>t[s]=n),r.axes.forEach(s=>i[s]=Math.round(e[s]*t[s]))):(t.fill(n,0,t.length),i.forEach((s,a)=>i[a]=Math.round(s*t[a]))),i},Fd=(e,t,r,n,i)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${J("uniforms.scales","i",n)};
        var roi_low = ${J("uniforms.roi","i",i)};
        var roi_hi = ${J("uniforms.roi",`i + ${t.length}`,i)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${J("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${J("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,Wd=(e,t,r,n,i,s,a)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${n.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${J("uniforms.scales","i",i)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${J("uniforms.roi","i",s)};
          var roi_hi = ${J("uniforms.roi",`i + ${r.length}`,s)};
          var input_shape_i = ${J("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${J("uniforms.output_shape","i",n.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${a} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,qd=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${J("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,us=(e,t,r,n)=>e.rank>n?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",Gd=(e,t,r,n,i)=>{let[s,a,u,l]=r.length===2?[-1,0,1,-1]:[0,2,3,1],d=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${d} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",a,`max(0, min(row, ${r[a]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${us(e,l,s,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${d} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${d} = originalIndices[${a}];
      var col:${d} = originalIndices[${u}];
      ${n?`if (row < 0 || row > (${r[a]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${i};
      }`:""};
      row = max(0, min(row, ${r[a]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${l}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${s}])`:"0"};
      var x11: ${d} = getInputValue(batch, channel, row1, col1);
      var x12: ${d} = getInputValue(batch, channel, row1, col2);
      var x21: ${d} = getInputValue(batch, channel, row2, col1);
      var x22: ${d} = getInputValue(batch, channel, row2, col2);
      var dx1: ${d} = abs(row - ${d}(row1));
      var dx2: ${d} = abs(${d}(row2) - row);
      var dy1: ${d} = abs(col - ${d}(col1));
      var dy2: ${d} = abs(${d}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},Vd=(e,t,r,n,i,s,a,u,l,d)=>{let p=r.length===2,h=!0,[g,y]=p?[0,1]:h?[2,3]:[1,2],_=e.type.value,b=k=>{let v=k===g?"row":"col";return`
      fn ${v}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${_} {
        var output_index = ${t.indicesGet("output_indices",k)};
        var originalIdx: ${_} = getOriginalCoordinateFromResizedCoordinate(output_index, ${i[k]},
        ${n[k]}, ${r[k]}, ${s[k]}, ${s[k]} + ${r.length});
        var fractOriginalIdx: ${_} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[k]} - 1))) {
          return ${l};
        }
        var data: array<${_}, 4> = array<${_}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${v}: ${_} = originalIdx + ${_}(i);
          if (${v} < 0 || ${v} >= ${r[k]}) {
            ${d?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${l};`:`${v} = max(0, min(${v}, ${r[k]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",k,`u32(${v})`)};
          data[i + 1] = ${k===g?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${b(g)};
    ${b(y)};
  fn getCubicInterpolationCoefs(s: ${_}) -> array<${_}, 4> {
    var absS = abs(s);
    var coeffs: array<${_}, 4> = array<${_}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${_} = 1.0 - absS;
    var twoMinusAbsS: ${_} = 2.0 - absS;
    var onePlusAbsS: ${_} = 1.0 + absS;
    coeffs[0] = ((${a} * onePlusAbsS - 5 * ${a}) * onePlusAbsS + 8 * ${a}) * onePlusAbsS - 4 * ${a};
    coeffs[1] = ((${a} + 2) * absS - (${a} + 3)) * absS * absS + 1;
    coeffs[2] = ((${a} + 2) * oneMinusAbsS - (${a} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${a} * twoMinusAbsS - 5 * ${a}) * twoMinusAbsS + 8 * ${a}) * twoMinusAbsS - 4 * ${a};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${_}, 4>, coefs: array<${_}, 4>) -> ${_} {
    var coefsSum: ${_} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${_} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},Hd=(e,t,r,n,i)=>{let[s,a,u,l,d]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",a,`max(0, min(depth, ${r[a]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",l,`max(0, min(width, ${r[l]} - 1))`)};
      ${us(e,d,s,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${p} = originalIndices[${a}];
      var height:${p} = originalIndices[${u}];
      var width:${p} = originalIndices[${l}];
      ${n?`if (depth < 0 || depth > (${r[a]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[l]} - 1)) {
      return ${i};
        }`:""};

    depth = max(0, min(depth, ${r[a]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[l]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${s}])`:"0"};

      var x111: ${p} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${p} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${p} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${p} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${p} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${p} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${p} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${p} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${p} = abs(depth - ${p}(depth1));
      var dx2: ${p} = abs(${p}(depth2) - depth);
      var dy1: ${p} = abs(height - ${p}(height1));
      var dy2: ${p} = abs(${p}(height2) - height);
      var dz1: ${p} = abs(width - ${p}(width1));
      var dz2: ${p} = abs(${p}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},jd=(e,t,r,n,i,s)=>{let a=e.dims,u=Pd(s,t.axes,a.length),l=Ud(a,n,i,t.axes),d=n.slice();n.length===0&&(d=a.map((w,T)=>w===0?1:l[T]/w),t.keepAspectRatioPolicy!=="stretch"&&(l=Ld(a,d,t)));let p=Z("output",e.dataType,l.length),h=R("input",e.dataType,a.length),g=O.size(l),y=a.length===l.length&&a.every((w,T)=>w===l[T]),_=t.coordinateTransformMode==="tf_crop_and_resize",b=t.extrapolationValue,k=h.type.value,v=w=>`
      ${y?"":`
      ${Bd(t.coordinateTransformMode,k)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${qd(h,a)};
              ${Dd(t.nearestMode,r,k)};
              ${Wd(h,p,a,l,d.length,u.length,_)};
              `;case"linear":return`
              ${Fd(p,a,l,d.length,u.length)};
              ${(()=>{if(a.length===2||a.length===4)return`${Gd(h,p,a,_,b)}`;if(a.length===3||a.length===5)return`${Hd(h,p,a,_,b)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(a.length===2||a.length===4)return`${Vd(h,p,a,l,d,u,t.cubicCoeffA,_,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${w.registerUniform("output_size","u32").registerUniform("scales","f32",d.length).registerUniform("roi","f32",u.length).declareVariables(h,p)}
      ${w.mainStart()}
        ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${y?"output[global_idx] = input[global_idx];":`
        let output_indices = ${p.offsetToIndices("global_idx")};
        var input_indices: ${h.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${h.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${a.length===2||a.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${d.length>0?t.mode==="cubic"?d:d.length:""}|${i.length>0?i:""}|${u.length>0?u:""}|${y}|${t.mode==="nearest"?a.length:a}`,inputDependencies:["rank"]},getShaderSource:v,getRunData:()=>({outputs:[{dims:l,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:d},{type:1,data:u},...te(a,l)]})}},Kd=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},Tf=(e,t)=>{let r=[],n=[],i=[],s=Kd(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Rd(e.inputs,t,s,r,n,i),e.compute(jd(e.inputs[0],t,s,r,n,i),{inputs:[0]})},If=e=>{let t=e.antialias,r=e.axes,n=e.coordinateTransformMode,i=e.cubicCoeffA,s=e.excludeOutside!==0,a=e.extrapolationValue,u=e.keepAspectRatioPolicy,l=e.mode,d=e.nearestMode===""?"simple":e.nearestMode;return ye({antialias:t,axes:r,coordinateTransformMode:n,cubicCoeffA:i,excludeOutside:s,extrapolationValue:a,keepAspectRatioPolicy:u,mode:l,nearestMode:d})}}),C_=L(()=>{"use strict";ne(),ie(),se(),Qd=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],n=e[2];if(t.dataType!==r.dataType||t.dataType!==n.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let i=t.dims[t.dims.length-1],s=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==i)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==s)throw new Error("Skip must have the same sequence length as input");if(n.dims.length!==1)throw new Error("Gamma must be 1D");if(n.dims[n.dims.length-1]!==i)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let a=e[3];if(a.dims.length!==1)throw new Error("Beta must be 1D");if(a.dims[a.dims.length-1]!==i)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let a=e[4];if(a.dims.length!==1)throw new Error("Bias must be 1D");if(a.dims[a.dims.length-1]!==i)throw new Error("Bias must have the same hidden size as input")}},Xd=(e,t,r,n)=>{let i=t.simplified,s=e[0].dims,a=O.size(s),u=s,l=a,d=s.slice(-1)[0],p=n?s.slice(0,-1).concat(1):[],h=!i&&e.length>3,g=e.length>4,y=n&&r>1,_=n&&r>2,b=r>3,k=64,v=Ae(d),w=[{type:12,data:l},{type:12,data:v},{type:12,data:d},{type:1,data:t.epsilon}],T=I=>{let C=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],A=[R("x",e[0].dataType,e[0].dims,v),R("skip",e[1].dataType,e[1].dims,v),R("gamma",e[2].dataType,e[2].dims,v)];h&&A.push(R("beta",e[3].dataType,e[3].dims,v)),g&&A.push(R("bias",e[4].dataType,e[4].dims,v)),A.push(Z("output",e[0].dataType,u,v)),y&&A.push(Z("mean_output",1,p)),_&&A.push(Z("inv_std_output",1,p)),b&&A.push(Z("input_skip_bias_sum",e[0].dataType,u,v));let $=De(e[0].dataType),B=De(1,v);return`

      ${I.registerUniforms(C).declareVariables(...A)}
      var<workgroup> sum_shared : array<${B}, ${k}>;
      var<workgroup> sum_squared_shared : array<${B}, ${k}>;

      ${I.mainStart([k,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${k};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${k};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${k-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":$+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${b?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${kr($,v,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${k};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${Zt("sum",v)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${Zt("square_sum",v)} / f32(uniforms.hidden_size) ${i?"":"- mean * mean"} + uniforms.epsilon);
        ${y?"mean_output[global_idx] = mean;":""}
        ${_?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${i?"":`- ${$}(mean)`}) *
            ${$}(inv_std_dev) * gamma[offset1d + i]
            ${h?"+ beta[offset1d + i]":""};
        }
      }`},S=[{dims:u,dataType:e[0].dataType}];return r>1&&S.push({dims:p,dataType:1}),r>2&&S.push({dims:p,dataType:1}),r>3&&S.push({dims:s,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${v};${y};${_};${b}`,inputDependencies:e.map((I,C)=>"type")},getShaderSource:T,getRunData:()=>({outputs:S,dispatchGroup:{x:Math.ceil(l/d)},programUniforms:w})}},Ef=(e,t)=>{Qd(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(Xd(e.inputs,t,e.outputCount,!1),{outputs:r})}}),z_=L(()=>{"use strict";ne(),ie(),Me(),se(),Zd=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,n)=>{if(e[n+1].dataType!==6&&e[n+1].dataType!==7)throw new Error(`Input ${n} must be an array of int32 or int64`)})},Kr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(n=>r.push(Number(n)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(n=>r.push(Number(n)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},Yd=(e,t)=>{if(e.length>1){let r=Kr(e,1),n=Kr(e,2),i=Kr(e,3);return i.length===0&&(i=[...Array(e[0].dims.length).keys()]),ye({starts:r,ends:n,axes:i})}else return t},ls=(e,t,r,n,i)=>{let s=e;return e<0&&(s+=r[n[t]]),i[t]<0?Math.max(0,Math.min(s,r[n[t]]-1)):Math.max(0,Math.min(s,r[n[t]]))},Jd=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${J("uniforms.input_shape","i",r.length)};
            let steps_i = ${J("uniforms.steps","i",r.length)};
            let signs_i = ${J("uniforms.signs","i",r.length)};
            let starts_i = ${J("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,ec=(e,t)=>{let r=e[0].dims,n=O.size(r),i=t.axes.length>0?O.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],s=Kr(e,4);s.forEach(v=>v!==0||(()=>{throw new Error("step cannot be 0")})),s.length===0&&(s=Array(i.length).fill(1));let a=t.starts.map((v,w)=>ls(v,w,r,i,s)),u=t.ends.map((v,w)=>ls(v,w,r,i,s));if(i.length!==a.length||i.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(i.length!==r.length)for(let v=0;v<r.length;++v)i.includes(v)||(a.splice(v,0,0),u.splice(v,0,r[v]),s.splice(v,0,1));let l=s.map(v=>Math.sign(v));s.forEach((v,w,T)=>{if(v<0){let S=(u[w]-a[w])/v,I=a[w],C=I+S*s[w];a[w]=C,u[w]=I,T[w]=-v}});let d=r.slice(0);i.forEach((v,w)=>{d[v]=Math.ceil((u[v]-a[v])/s[v])});let p={dims:d,dataType:e[0].dataType},h=Z("output",e[0].dataType,d.length),g=R("input",e[0].dataType,e[0].dims.length),y=O.size(d),_=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:a.length},{name:"signs",type:"i32",length:l.length},{name:"steps",type:"u32",length:s.length}],b=[{type:12,data:y},{type:12,data:a},{type:6,data:l},{type:12,data:s},...te(e[0].dims,d)],k=v=>`
      ${v.registerUniforms(_).declareVariables(g,h)}
        ${Jd(g,h,r)}
        ${v.mainStart()}
          ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${h.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${h.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${l.length}_${a.length}_${s.length}`,inputDependencies:["rank"]},getShaderSource:k,getRunData:()=>({outputs:[p],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:b})}},Cf=(e,t)=>{Zd(e.inputs,t);let r=Yd(e.inputs,t);e.compute(ec(e.inputs,r),{inputs:[0]})},zf=e=>{let t=e.starts,r=e.ends,n=e.axes;return ye({starts:t,ends:r,axes:n})}}),A_=L(()=>{"use strict";ne(),ie(),Me(),Yt(),se(),tc=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},rc=(e,t)=>{let r=e.inputs[0],n=r.dims,i=O.size(n),s=n.length,a=O.normalizeAxis(t.axis,s),u=a<n.length-1,l,d=[];u?(d=Array.from({length:s},(A,$)=>$),d[a]=s-1,d[s-1]=a,l=e.compute(Je(r,d),{inputs:[r],outputs:[-1]})[0]):l=r;let p=l.dims,h=p[s-1],g=i/h,y=Ae(h),_=h/y,b=64;g===1&&(b=256);let k=(A,$)=>$===4?`max(max(${A}.x, ${A}.y), max(${A}.z, ${A}.w))`:$===2?`max(${A}.x, ${A}.y)`:$===3?`max(max(${A}.x, ${A}.y), ${A}.z)`:A,v=R("x",l.dataType,l.dims,y),w=Z("result",l.dataType,l.dims,y),T=v.type.value,S=De(l.dataType)==="f32"?`var threadMax = ${T}(-3.4028234663852886e+38f);`:`var threadMax = ${T}(-65504.0h);`,I=A=>`
      var<workgroup> rowMaxShared : ${T};
      var<workgroup> rowSumShared : ${T};
      var<workgroup> threadShared : array<${T}, ${b}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${T} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${T}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${A.registerUniform("packedCols","i32").declareVariables(v,w)}
      ${A.mainStart(b)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${b};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${S}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${T}(${k("threadShared[0]",y)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${T}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${T}(${Zt("threadShared[0]",y)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${T}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,C=e.compute({name:"Softmax",shaderCache:{hint:`${y};${b}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:p,dataType:l.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:_}]}),getShaderSource:I},{inputs:[l],outputs:[u?-1:0]})[0];u&&e.compute(Je(C,d),{inputs:[C]})},Af=(e,t)=>{tc(e.inputs),rc(e,t)},Mf=e=>ye({axis:e.axis})}),M_=L(()=>{"use strict";ne(),ie(),se(),ds=e=>Array.from(e.getBigInt64Array(),Number),nc=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(ds(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},ic=(e,t)=>{let r=[];for(let n=0;n<e.length;++n)r.push(e[n]*t[n]);return r},sc=(e,t)=>{let r=e[0].dims,n=t??ds(e[1]),i=ic(r,n),s=O.size(i),a=e[0].dataType,u=R("input",a,r.length),l=Z("output",a,i.length),d=p=>`
      const inputShape = ${u.indices(...r)};
      ${p.registerUniform("output_size","u32").declareVariables(u,l)}
      ${p.mainStart()}
      ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${l.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${l.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${l.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${n}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:[{type:12,data:s},...te(e[0].dims,i)]}),getShaderSource:d}},Of=e=>{nc(e.inputs),e.compute(sc(e.inputs),{inputs:[0]})}}),O_=L(()=>{"use strict";ne(),ie(),se(),ac=(e,t,r,n,i)=>{let s=Z("output_data",i,r.length,4),a=R("a_data",t[1].dataType,t[1].dims.length,4),u=R("b_data",t[2].dataType,t[2].dims.length,4),l=R("c_data",t[0].dataType,t[0].dims.length,4),d,p=(h,g,y)=>`select(${g}, ${h}, ${y})`;if(!n)d=s.setByOffset("global_idx",p(a.getByOffset("global_idx"),u.getByOffset("global_idx"),l.getByOffset("global_idx")));else{let h=(g,y,_="")=>{let b=`a_data[index_a${y}][component_a${y}]`,k=`b_data[index_b${y}][component_b${y}]`,v=`bool(c_data[index_c${y}] & (0xffu << (component_c${y} * 8)))`;return`
            let output_indices${y} = ${s.offsetToIndices(`global_idx * 4u + ${y}u`)};
            let offset_a${y} = ${a.broadcastedIndicesToOffset(`output_indices${y}`,s)};
            let offset_b${y} = ${u.broadcastedIndicesToOffset(`output_indices${y}`,s)};
            let offset_c${y} = ${l.broadcastedIndicesToOffset(`output_indices${y}`,s)};
            let index_a${y} = offset_a${y} / 4u;
            let index_b${y} = offset_b${y} / 4u;
            let index_c${y} = offset_c${y} / 4u;
            let component_a${y} = offset_a${y} % 4u;
            let component_b${y} = offset_b${y} % 4u;
            let component_c${y} = offset_c${y} % 4u;
            ${g}[${y}] = ${_}(${p(b,k,v)});
          `};i===9?d=`
            var data = vec4<u32>(0);
            ${h("data",0,"u32")}
            ${h("data",1,"u32")}
            ${h("data",2,"u32")}
            ${h("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:d=`
            ${h("output_data[global_idx]",0)}
            ${h("output_data[global_idx]",1)}
            ${h("output_data[global_idx]",2)}
            ${h("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(l,a,u,s)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${d}
      }`},oc=e=>{let t=e[1].dims,r=e[2].dims,n=e[0].dims,i=e[1].dataType,s=!(O.areEqual(t,r)&&O.areEqual(r,n)),a=t,u=O.size(t);if(s){let d=Sr.calcShape(Sr.calcShape(t,r,!1),n,!1);if(!d)throw new Error("Can't perform where op on the given tensors");a=d,u=O.size(a)}let l=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:d=>ac(d,e,a,s,i),getRunData:()=>({outputs:[{dims:a,dataType:i}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:l},...te(n,t,r,a)]})}},Nf=e=>{e.compute(oc(e.inputs))}}),N_=L(()=>{"use strict";K0(),Hs(),Q0(),X0(),Z0(),Y0(),J0(),i_(),a_(),o_(),u_(),l_(),d_(),c_(),p_(),h_(),f_(),m_(),g_(),__(),y_(),w_(),b_(),$_(),v_(),Jh(),x_(),k_(),S_(),T_(),I_(),Vs(),E_(),sf(),C_(),z_(),A_(),rf(),M_(),Yt(),js(),O_(),Rf=new Map([["Abs",[Ip]],["Acos",[Ep]],["Acosh",[Cp]],["Add",[lh]],["ArgMax",[xp,$s]],["ArgMin",[vp,$s]],["Asin",[zp]],["Asinh",[Ap]],["Atan",[Mp]],["Atanh",[Op]],["Attention",[kp]],["AveragePool",[ff,hf]],["BatchNormalization",[Sp]],["BiasAdd",[Tp]],["BiasSplitGelu",[uh]],["Cast",[Rp,Np]],["Ceil",[Dp]],["Clip",[Bp]],["Concat",[wh,bh]],["Conv",[Is,Ts]],["ConvTranspose",[zh,Ch]],["Cos",[Pp]],["Cosh",[Up]],["CumSum",[Ah,Mh]],["DepthToSpace",[Oh,Nh]],["DequantizeLinear",[$f,vf]],["Div",[dh]],["Einsum",[Rh,Bh]],["Elu",[Lp,Jr]],["Equal",[ch]],["Erf",[Fp]],["Exp",[Wp]],["Expand",[Dh]],["FastGelu",[Ph]],["Floor",[qp]],["FusedConv",[Is,Ts]],["Gather",[Lh,Uh]],["GatherElements",[Hh,Vh]],["GatherBlockQuantized",[qh,Gh]],["GatherND",[Fh,Wh]],["Gelu",[Gp]],["Gemm",[Kh,jh]],["GlobalAveragePool",[gf,mf]],["GlobalMaxPool",[bf,wf]],["Greater",[mh]],["GreaterOrEqual",[_h]],["GridSample",[Qh,Xh]],["GroupQueryAttention",[af]],["HardSigmoid",[Yp,Zp]],["InstanceNormalization",[of]],["LayerNormalization",[uf]],["LeakyRelu",[Vp,Jr]],["Less",[gh]],["LessOrEqual",[yh]],["Log",[ah]],["MatMul",[lf]],["MatMulNBits",[df,cf]],["MaxPool",[_f,yf]],["Mul",[ph]],["MultiHeadAttention",[Yh,Zh]],["Neg",[jp]],["Not",[Hp]],["Pad",[pf]],["Pow",[hh]],["QuickGelu",[oh,Jr]],["Range",[xf]],["Reciprocal",[Kp]],["ReduceMin",[_p]],["ReduceMean",[pp]],["ReduceMax",[gp]],["ReduceSum",[wp]],["ReduceProd",[yp]],["ReduceL1",[hp]],["ReduceL2",[fp]],["ReduceLogSum",[$p]],["ReduceLogSumExp",[mp]],["ReduceSumSquare",[bp]],["Relu",[Qp]],["Resize",[Tf,If]],["RotaryEmbedding",[nf]],["ScatterND",[Sf,kf]],["Sigmoid",[Xp]],["Sin",[Jp]],["Sinh",[eh]],["Slice",[Cf,zf]],["SkipLayerNormalization",[Ef]],["Split",[ef,tf]],["Sqrt",[th]],["Softmax",[Af,Mf]],["Sub",[fh]],["Tan",[rh]],["Tanh",[nh]],["ThresholdedRelu",[sh,Jr]],["Tile",[Of]],["Transpose",[ep,tp]],["Where",[Nf]]])}),R_=L(()=>{"use strict";it(),Ot(),se(),Bf=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,n,i){gt(e.programInfo.name);let s=this.backend.device,a=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let d of t)u.push({binding:u.length,resource:{buffer:d.buffer}});for(let d of r)u.push({binding:u.length,resource:{buffer:d.buffer}});i&&u.push({binding:u.length,resource:i});let l=s.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let d={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:l,dispatchGroup:n};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(d)}a.setPipeline(e.computePipeline),a.setBindGroup(0,l),a.dispatchWorkgroups(...n),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),nt(e.programInfo.name)}dispose(){}build(e,t){gt(e.name);let r=this.backend.device,n=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(d=>{r.features.has(d.feature)&&n.push(`enable ${d.extension};`)});let i=Jc(t,this.backend.device.limits),s=e.getShaderSource(i),a=`${n.join(`
`)}
${i.additionalImplementations}
${s}`,u=r.createShaderModule({code:a,label:e.name});me("verbose",()=>`[WebGPU] ${e.name} shader code: ${a}`);let l=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return nt(e.name),{programInfo:e,computePipeline:l,uniformVariablesInfo:i.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,n=typeof e=="number"?1:e.z||1,i=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=i&&r<=i&&n<=i)return[t,r,n];let s=t*r*n,a=Math.ceil(Math.sqrt(s));if(a>i){if(a=Math.ceil(Math.cbrt(s)),a>i)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[a,a,a]}else return[a,a,1]}}}),Df={};Ir(Df,{WebGpuBackend:()=>Pf});B_=L(()=>{"use strict";it(),ne(),Ot(),Kc(),H0(),N_(),R_(),uc=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let n=0;n<e.length;++n){let i=e[n].dataType;switch(t[n]){case"none":{r.push("");break}case"type":{r.push(`${i}`);break}case"rank":{let s=e[n].dims.length;r.push(`${i};${s}`);break}case"dims":{let s=e[n].dims.join(",");r.push(`${i};${s}`);break}default:throw new Error(`unsupported input dependency: ${t[n]}`)}}return r.join("|")},lc=(e,t,r)=>{let n=e.name;return e.shaderCache?.hint&&(n+="["+e.shaderCache.hint+"]"),n+=":"+r+`:${uc(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,n},dc=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},Pf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],n={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},i=s=>t.features.has(s)&&r.push(s)&&!0;i("chromium-experimental-timestamp-query-inside-passes")||i("timestamp-query"),i("shader-f16"),i("subgroups"),this.device=await t.requestDevice(n),this.adapterInfo=new dc(t.info||await t.requestAdapterInfo()),this.gpuDataManager=Zc(this),this.programManager=new Bf(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Fs(e.logLevel,!!e.debug),this.device.onuncapturederror=s=>{s.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${s.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!1}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose()}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;gt(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let n=0;n<t.length/2;n++){let i=r[n],s=i.kernelId,a=this.kernels.get(s),u=a.kernelType,l=a.kernelName,d=i.programName,p=i.inputTensorViews,h=i.outputTensorViews,g=t[n*2],y=t[n*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=g);let _=Number(g-this.queryTimeBase),b=Number(y-this.queryTimeBase);if(!Number.isSafeInteger(_)||!Number.isSafeInteger(b))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:p.map(k=>({dims:k.dims,dataType:Mt(k.dataType)})),outputsMetadata:h.map(k=>({dims:k.dims,dataType:Mt(k.dataType)})),kernelId:s,kernelType:u,kernelName:l,programName:d,startTime:_,endTime:b});else{let k="";p.forEach((w,T)=>{k+=`input[${T}]: [${w.dims}] | ${Mt(w.dataType)}, `});let v="";h.forEach((w,T)=>{v+=`output[${T}]: [${w.dims}] | ${Mt(w.dataType)}, `}),console.log(`[profiling] kernel "${s}|${u}|${l}|${d}" ${k}${v}start time: ${_} ns, execution time: ${b-_} ns`)}nn("GPU",`${d}::${g}::${y}`)}e.unmap(),this.pendingQueries.delete(e)}),nt()}run(e,t,r,n,i,s){gt(e.name);let a=[];for(let w=0;w<t.length;++w){let T=t[w].data;if(T===0)continue;let S=this.gpuDataManager.get(T);if(!S)throw new Error(`no GPU data for input: ${T}`);a.push(S)}let{outputs:u,dispatchGroup:l,programUniforms:d}=e.getRunData(t),p=r.length===0?u.map((w,T)=>T):r;if(p.length!==u.length)throw new Error(`Output size ${p.length} must be equal to ${u.length}.`);let h=[],g=[];for(let w=0;w<u.length;++w){if(!Number.isInteger(p[w])||p[w]<-3||p[w]>=s)throw new Error(`Invalid output index: ${p[w]}`);if(p[w]===-3)continue;let T=p[w]===-1,S=p[w]===-2,I=T||S?i(u[w].dataType,u[w].dims):n(p[w],u[w].dataType,u[w].dims);if(h.push(I),I.data===0)continue;let C=this.gpuDataManager.get(I.data);if(!C)throw new Error(`no GPU data for output: ${I.data}`);if(T&&this.temporaryData.push(C),S){let A=this.kernelPersistentData.get(this.currentKernelId);A||(A=[],this.kernelPersistentData.set(this.currentKernelId,A)),A.push(C)}g.push(C)}if(a.length!==t.length||g.length!==h.length){if(g.length===0)return nt(e.name),h;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let y;if(d){let w=0,T=[];d.forEach(A=>{let $=typeof A.data=="number"?[A.data]:A.data;if($.length===0)return;let B=A.type===10?2:4,U,H;A.type===10?(H=$.length>4?16:$.length>2?8:$.length*B,U=$.length>4?16:B*$.length):(H=$.length<=2?$.length*B:16,U=16),w=Math.ceil(w/H)*H,T.push(w);let W=A.type===10?8:4;w+=$.length>4?Math.ceil($.length/W)*U:$.length*B});let S=16;w=Math.ceil(w/S)*S;let I=new ArrayBuffer(w);d.forEach((A,$)=>{let B=T[$],U=typeof A.data=="number"?[A.data]:A.data;if(A.type===6)new Int32Array(I,B,U.length).set(U);else if(A.type===12)new Uint32Array(I,B,U.length).set(U);else if(A.type===10)new Uint16Array(I,B,U.length).set(U);else if(A.type===1)new Float32Array(I,B,U.length).set(U);else throw new Error(`Unsupported uniform type: ${Mt(A.type)}`)});let C=this.gpuDataManager.create(w,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(C.buffer,0,I,0,w),this.gpuDataManager.release(C.id),y={offset:0,size:w,buffer:C.buffer}}let _=this.programManager.normalizeDispatchGroupSize(l),b=_[1]===1&&_[2]===1,k=lc(e,t,b),v=this.programManager.getArtifact(k);if(v||(v=this.programManager.build(e,_),this.programManager.setArtifact(k,v),me("info",()=>`[artifact] key: ${k}, programName: ${e.name}`)),d&&v.uniformVariablesInfo){if(d.length!==v.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${v.uniformVariablesInfo.length}, got ${d.length} in program "${v.programInfo.name}".`);for(let w=0;w<d.length;w++){let T=d[w],S=T.type,I=typeof T.data=="number"?1:T.data.length,[C,A]=v.uniformVariablesInfo[w];if(S!==C||I!==A)throw new Error(`Uniform variable ${w} mismatch: expect type ${C} with size ${A}, got type ${S} with size ${I} in program "${v.programInfo.name}".`)}}if(me("info",()=>`[ProgramManager] run "${e.name}" (key=${k}) with ${_[0]}x${_[1]}x${_[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let w={kernelId:this.currentKernelId,programName:v.programInfo.name,inputTensorViews:t,outputTensorViews:h};this.pendingKernels.push(w),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(w)}return this.programManager.run(v,a,g,_,y),nt(e.name),h}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,n){let i=Rf.get(e);if(!i)throw new Error(`kernel not implemented: ${e}`);let s={kernelType:e,kernelName:n,kernelEntry:i[0],attributes:[i[1],r]};this.kernels.set(t,s)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let n=this.kernels.get(e);if(!n)throw new Error(`kernel not created: ${e}`);let i=n.kernelType,s=n.kernelName,a=n.kernelEntry,u=n.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${i}] ${s}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),me("info",()=>`[WebGPU] Start to run kernel "[${i}] ${s}"...`);let l=this.env.debug;this.temporaryData=[];try{return l&&this.device.pushErrorScope("validation"),a(t,u[1]),0}catch(d){return r.push(Promise.resolve(`[WebGPU] Kernel "[${i}] ${s}" failed. ${d}`)),1}finally{l&&r.push(this.device.popErrorScope().then(d=>d?`GPU validation error for kernel "[${i}] ${s}": ${d.message}`:null));for(let d of this.temporaryData)this.gpuDataManager.release(d.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,n){let i=this.sessionExternalDataMapping.get(e);i||(i=new Map,this.sessionExternalDataMapping.set(e,i));let s=i.get(t),a=this.gpuDataManager.registerExternalBuffer(r,n,s);return i.set(t,[a,r]),a}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let n=await ys(this,e,t);return Ws(n.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){me("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){me("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){me("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let n=0;n<r;n++){let i=this.getComputePassEncoder(),s=e[n];this.writeTimestamp(this.pendingDispatchNumber*2),i.setPipeline(s.computePipeline),i.setBindGroup(0,s.bindGroup),i.dispatchWorkgroups(...s.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[n]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),Uf={};Ir(Uf,{init:()=>Lf});D_=L(()=>{"use strict";ne(),Ot(),ie(),V0(),Mn=class Ff{constructor(t,r,n,i){this.module=t,this.dataType=r,this.data=n,this.dims=i}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(O.size(t)!==O.size(this.dims))throw new Error("Invalid new shape");return new Ff(this.module,this.dataType,this.data,t)}},cc=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let n=e.PTR_SIZE,i=r/e.PTR_SIZE,s=n===4?"i32":"i64";this.opKernelContext=Number(e.getValue(n*i++,s));let a=Number(e.getValue(n*i++,s));this.outputCount=Number(e.getValue(n*i++,s)),this.customDataOffset=Number(e.getValue(n*i++,"*")),this.customDataSize=Number(e.getValue(n*i++,s));let u=[];for(let l=0;l<a;l++){let d=Number(e.getValue(n*i++,s)),p=Number(e.getValue(n*i++,"*")),h=Number(e.getValue(n*i++,s)),g=[];for(let y=0;y<h;y++)g.push(Number(e.getValue(n*i++,s)));u.push(new Mn(e,d,p,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map(a=>typeof a=="number"?this.inputs[a]:a)??this.inputs,n=t?.outputs??[],i=(a,u,l)=>new Mn(this.module,u,this.output(a,l),l),s=(a,u)=>{let l=cr(a,u);if(!l)throw new Error(`Unsupported data type: ${a}`);let d=l>0?this.backend.gpuDataManager.create(l).id:0;return new Mn(this.module,a,d,u)};return this.backend.run(e,r,n,i,s,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let n=this.module.PTR_SIZE,i=n===4?"i32":"i64",s=this.module.stackAlloc((1+t.length)*n);this.module.setValue(s,t.length,i);for(let a=0;a<t.length;a++)this.module.setValue(s+n*(a+1),t[a],i);return this.module._JsepOutput(this.opKernelContext,e,s)}catch(n){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${n}`)}finally{this.module.stackRestore(r)}}},Lf=async(e,t,r,n)=>{let i=t.jsepInit;if(!i)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let s=(B_(),rn(Df)).WebGpuBackend,a=new s;await a.initialize(r,n),i("webgpu",[a,u=>a.alloc(Number(u)),u=>a.free(u),(u,l,d,p=!1)=>{if(p)me("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(l)}, size=${Number(d)}`),a.memcpy(Number(u),Number(l));else{me("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(l)}, size=${Number(d)}`);let h=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(d));a.upload(Number(l),h)}},async(u,l,d)=>{me("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${l}, size=${d}`),await a.download(Number(u),()=>t.HEAPU8.subarray(Number(l)>>>0,Number(l+d)>>>0))},(u,l,d)=>a.createKernel(u,Number(l),d,t.UTF8ToString(t._JsepGetNodeName(Number(l)))),u=>a.releaseKernel(u),(u,l,d,p)=>{me("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${d}, kernel=${u}, contextDataOffset=${l}`);let h=new cc(t,a,Number(l));return a.computeKernel(Number(u),h,p)},()=>a.captureBegin(),()=>a.captureEnd(),()=>a.replay()])}else{let s=new Xc(r);i("webnn",[s,()=>s.reserveTensorId(),a=>s.releaseTensorId(a),async(a,u,l,d,p)=>s.ensureTensor(a,u,l,d,p),(a,u)=>{s.uploadTensor(a,u)},async(a,u)=>s.downloadTensor(a,u),(a,u)=>s.registerMLContext(a,u),!!r.trace])}}}),Wf=L(()=>{"use strict";it(),W0(),q0(),ne(),gr(),Ds(),Gc(),pc=(e,t)=>{Ie()._OrtInit(e,t)!==0&&be("Can't initialize onnxruntime.")},Js=async e=>{pc(e.wasm.numThreads,Pn(e.logLevel))},ea=async(e,t)=>{Ie().asyncInit?.();let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let n=e.webgpu.powerPreference;if(n!==void 0&&n!=="low-power"&&n!=="high-performance")throw new Error(`Invalid powerPreference setting: "${n}"`);let i=e.webgpu.forceFallbackAdapter;if(i!==void 0&&typeof i!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${i}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:n,forceFallbackAdapter:i}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let n=(D_(),rn(Uf)).init;t==="webgpu"&&await n("webgpu",Ie(),e,r),t==="webnn"&&await n("webnn",Ie(),e)}},jt=new Map,hc=e=>{let t=Ie(),r=t.stackSave();try{let n=t.PTR_SIZE,i=t.stackAlloc(2*n);t._OrtGetInputOutputCount(e,i,i+n)!==0&&be("Can't get session input/output count.");let s=n===4?"i32":"i64";return[Number(t.getValue(i,s)),Number(t.getValue(i+n,s))]}finally{t.stackRestore(r)}},cs=(e,t)=>{let r=Ie(),n=r.stackSave(),i=0;try{let s=r.PTR_SIZE,a=r.stackAlloc(2*s);r._OrtGetInputOutputMetadata(e,t,a,a+s)!==0&&be("Can't get session input/output metadata.");let u=Number(r.getValue(a,"*"));i=Number(r.getValue(a+s,"*"));let l=r.HEAP32[i/4];if(l===0)return[u,0];let d=r.HEAPU32[i/4+1],p=[];for(let h=0;h<d;h++){let g=Number(r.getValue(i+8+h*s,"*"));p.push(g!==0?r.UTF8ToString(g):Number(r.getValue(i+8+(h+d)*s,"*")))}return[u,l,p]}finally{r.stackRestore(n),i!==0&&r._OrtFree(i)}},qn=e=>{let t=Ie(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},ta=async(e,t)=>{let r,n,i=Ie();Array.isArray(e)?[r,n]=e:e.buffer===i.HEAPU8.buffer?[r,n]=[e.byteOffset,e.byteLength]:[r,n]=qn(e);let s=0,a=0,u=0,l=[],d=[],p=[];try{if([a,l]=await qc(t),t?.externalData&&i.mountExternalData){let S=[];for(let I of t.externalData){let C=typeof I=="string"?I:I.path;S.push(Ls(typeof I=="string"?I:I.data).then(A=>{i.mountExternalData(C,A)}))}await Promise.all(S)}for(let S of t?.executionProviders??[])if((typeof S=="string"?S:S.name)==="webnn"){if(i.shouldTransferToMLTensor=!1,typeof S!="string"){let I=S,C=I?.context,A=I?.gpuDevice,$=I?.deviceType,B=I?.powerPreference;C?i.currentContext=C:A?i.currentContext=await i.webnnCreateMLContext(A):i.currentContext=await i.webnnCreateMLContext({deviceType:$,powerPreference:B})}else i.currentContext=await i.webnnCreateMLContext();break}s=await i._OrtCreateSession(r,n,a),i.webgpuOnCreateSession?.(s),s===0&&be("Can't create a session."),i.jsepOnCreateSession?.(),i.currentContext&&(i.webnnRegisterMLContext(s,i.currentContext),i.currentContext=void 0,i.shouldTransferToMLTensor=!0);let[h,g]=hc(s),y=!!t?.enableGraphCapture,_=[],b=[],k=[],v=[],w=[];for(let S=0;S<h;S++){let[I,C,A]=cs(s,S);I===0&&be("Can't get an input name."),d.push(I);let $=i.UTF8ToString(I);_.push($),k.push(C===0?{name:$,isTensor:!1}:{name:$,isTensor:!0,type:Mt(C),shape:A})}for(let S=0;S<g;S++){let[I,C,A]=cs(s,S+h);I===0&&be("Can't get an output name."),p.push(I);let $=i.UTF8ToString(I);b.push($),v.push(C===0?{name:$,isTensor:!1}:{name:$,isTensor:!0,type:Mt(C),shape:A});{if(y&&t?.preferredOutputLocation===void 0){w.push("gpu-buffer");continue}let B=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[$]??"cpu",U=i.webnnIsGraphOutput;if(B==="cpu"&&U&&U(s,$)){w.push("ml-tensor-cpu-output");continue}if(B!=="cpu"&&B!=="cpu-pinned"&&B!=="gpu-buffer"&&B!=="ml-tensor")throw new Error(`Not supported preferred output location: ${B}.`);if(y&&B!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${B}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);w.push(B)}}let T=null;return w.some(S=>S==="gpu-buffer"||S==="ml-tensor"||S==="ml-tensor-cpu-output")&&(u=i._OrtCreateBinding(s),u===0&&be("Can't create IO binding."),T={handle:u,outputPreferredLocations:w,outputPreferredLocationsEncoded:w.map(S=>S==="ml-tensor-cpu-output"?"ml-tensor":S).map(S=>gs(S))}),jt.set(s,[s,d,p,T,y,!1]),[s,_,b,k,v]}catch(h){throw d.forEach(g=>i._OrtFree(g)),p.forEach(g=>i._OrtFree(g)),u!==0&&i._OrtReleaseBinding(u)!==0&&be("Can't release IO binding."),s!==0&&i._OrtReleaseSession(s)!==0&&be("Can't release session."),h}finally{i._free(r),a!==0&&i._OrtReleaseSessionOptions(a)!==0&&be("Can't release session options."),l.forEach(h=>i._free(h)),i.unmountExternalData?.()}},ra=e=>{let t=Ie(),r=jt.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[n,i,s,a,u]=r;a&&(u&&t._OrtClearBoundOutputs(a.handle)!==0&&be("Can't clear bound outputs."),t._OrtReleaseBinding(a.handle)!==0&&be("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),i.forEach(l=>t._OrtFree(l)),s.forEach(l=>t._OrtFree(l)),t._OrtReleaseSession(n)!==0&&be("Can't release session."),jt.delete(e)},ps=async(e,t,r,n,i,s,a=!1)=>{if(!e){t.push(0);return}let u=Ie(),l=u.PTR_SIZE,d=e[0],p=e[1],h=e[3],g=h,y,_;if(d==="string"&&(h==="gpu-buffer"||h==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(a&&h!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${s} when enableGraphCapture is true.`);if(h==="gpu-buffer"){let v=e[2].gpuBuffer;_=cr(dr(d),p);{let w=u.jsepRegisterBuffer;if(!w)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');y=w(n,s,v,_)}}else if(h==="ml-tensor"){let v=e[2].mlTensor;_=cr(dr(d),p);let w=u.webnnRegisterMLTensor;if(!w)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');y=w(n,v,dr(d),p)}else{let v=e[2];if(Array.isArray(v)){_=l*v.length,y=u._malloc(_),r.push(y);for(let w=0;w<v.length;w++){if(typeof v[w]!="string")throw new TypeError(`tensor data at index ${w} is not a string`);u.setValue(y+w*l,ht(v[w],r),"*")}}else{let w=u.webnnIsGraphInput,T=u.webnnIsGraphOutput;if(d!=="string"&&w&&T){let S=u.UTF8ToString(i);if(w(n,S)||T(n,S)){let I=dr(d);_=cr(I,p),g="ml-tensor";let C=u.webnnCreateTemporaryTensor,A=u.webnnUploadTensor;if(!C||!A)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let $=await C(n,I,p);A($,new Uint8Array(v.buffer,v.byteOffset,v.byteLength)),y=$}else _=v.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,_),y)}else _=v.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(v.buffer,v.byteOffset,_),y)}}let b=u.stackSave(),k=u.stackAlloc(4*p.length);try{p.forEach((w,T)=>u.setValue(k+T*l,w,l===4?"i32":"i64"));let v=u._OrtCreateTensor(dr(d),y,_,k,p.length,gs(g));v===0&&be(`Can't create tensor for input/output. session=${n}, index=${s}.`),t.push(v)}finally{u.stackRestore(b)}},na=async(e,t,r,n,i,s)=>{let a=Ie(),u=a.PTR_SIZE,l=jt.get(e);if(!l)throw new Error(`cannot run inference. invalid session id: ${e}`);let d=l[0],p=l[1],h=l[2],g=l[3],y=l[4],_=l[5],b=t.length,k=n.length,v=0,w=[],T=[],S=[],I=[],C=[],A=a.stackSave(),$=a.stackAlloc(b*u),B=a.stackAlloc(b*u),U=a.stackAlloc(k*u),H=a.stackAlloc(k*u);try{[v,w]=Wc(s),Qt("wasm prepareInputOutputTensor");for(let z=0;z<b;z++)await ps(r[z],T,I,e,p[t[z]],t[z],y);for(let z=0;z<k;z++)await ps(i[z],S,I,e,h[n[z]],b+n[z],y);Xt("wasm prepareInputOutputTensor");for(let z=0;z<b;z++)a.setValue($+z*u,T[z],"*"),a.setValue(B+z*u,p[t[z]],"*");for(let z=0;z<k;z++)a.setValue(U+z*u,S[z],"*"),a.setValue(H+z*u,h[n[z]],"*");if(g&&!_){let{handle:z,outputPreferredLocations:P,outputPreferredLocationsEncoded:ee}=g;if(p.length!==b)throw new Error(`input count from feeds (${b}) is expected to be always equal to model's input count (${p.length}).`);Qt("wasm bindInputsOutputs");for(let X=0;X<b;X++){let V=t[X];await a._OrtBindInput(z,p[V],T[X])!==0&&be(`Can't bind input[${X}] for session=${e}.`)}for(let X=0;X<k;X++){let V=n[X];i[X]?.[3]?(C.push(S[X]),a._OrtBindOutput(z,h[V],S[X],0)!==0&&be(`Can't bind pre-allocated output[${X}] for session=${e}.`)):a._OrtBindOutput(z,h[V],0,ee[V])!==0&&be(`Can't bind output[${X}] to ${P[X]} for session=${e}.`)}Xt("wasm bindInputsOutputs"),jt.set(e,[d,p,h,g,y,!0])}a.jsepOnRunStart?.(d),a.webnnOnRunStart?.(d);let W;g?W=await a._OrtRunWithBinding(d,g.handle,k,U,v):W=await a._OrtRun(d,B,$,b,H,k,U,v),W!==0&&be("failed to call OrtRun().");let G=[],j=[];Qt("wasm ProcessOutputTensor");for(let z=0;z<k;z++){let P=Number(a.getValue(U+z*u,"*"));if(P===S[z]||C.includes(S[z])){G.push(i[z]),P!==S[z]&&a._OrtReleaseTensor(P)!==0&&be("Can't release tensor.");continue}let ee=a.stackSave(),X=a.stackAlloc(4*u),V=!1,oe,D=0;try{a._OrtGetTensorData(P,X,X+u,X+2*u,X+3*u)!==0&&be(`Can't access output tensor data on index ${z}.`);let F=u===4?"i32":"i64",K=Number(a.getValue(X,F));D=a.getValue(X+u,"*");let re=a.getValue(X+u*2,"*"),he=Number(a.getValue(X+u*3,F)),Ee=[];for(let Se=0;Se<he;Se++)Ee.push(Number(a.getValue(re+Se*u,F)));a._OrtFree(re)!==0&&be("Can't free memory for tensor dims.");let Be=Ee.reduce((Se,$e)=>Se*$e,1);oe=Mt(K);let Fe=g?.outputPreferredLocations[n[z]];if(oe==="string"){if(Fe==="gpu-buffer"||Fe==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let Se=[];for(let $e=0;$e<Be;$e++){let Pe=a.getValue(D+$e*u,"*"),st=a.getValue(D+($e+1)*u,"*"),Nt=$e===Be-1?void 0:st-Pe;Se.push(a.UTF8ToString(Pe,Nt))}G.push([oe,Ee,Se,"cpu"])}else if(Fe==="gpu-buffer"&&Be>0){let Se=a.jsepGetBuffer;if(!Se)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let $e=Se(D),Pe=cr(K,Be);if(Pe===void 0||!Ps(oe))throw new Error(`Unsupported data type: ${oe}`);V=!0,G.push([oe,Ee,{gpuBuffer:$e,download:a.jsepCreateDownloader($e,Pe,oe),dispose:()=>{a._OrtReleaseTensor(P)!==0&&be("Can't release tensor.")}},"gpu-buffer"])}else if(Fe==="ml-tensor"&&Be>0){let Se=a.webnnEnsureTensor,$e=a.webnnIsGraphInputOutputTypeSupported;if(!Se||!$e)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(cr(K,Be)===void 0||!Us(oe))throw new Error(`Unsupported data type: ${oe}`);if(!$e(e,oe,!1))throw new Error(`preferredLocation "ml-tensor" for ${oe} output is not supported by current WebNN Context.`);let Pe=await Se(e,D,K,Ee,!1);V=!0,G.push([oe,Ee,{mlTensor:Pe,download:a.webnnCreateMLTensorDownloader(D,oe),dispose:()=>{a.webnnReleaseTensorId(D),a._OrtReleaseTensor(P)}},"ml-tensor"])}else if(Fe==="ml-tensor-cpu-output"&&Be>0){let Se=a.webnnCreateMLTensorDownloader(D,oe)(),$e=G.length;V=!0,j.push((async()=>{let Pe=[$e,await Se];return a.webnnReleaseTensorId(D),a._OrtReleaseTensor(P),Pe})()),G.push([oe,Ee,[],"cpu"])}else{let Se=Gn(oe),$e=new Se(Be);new Uint8Array($e.buffer,$e.byteOffset,$e.byteLength).set(a.HEAPU8.subarray(D,D+$e.byteLength)),G.push([oe,Ee,$e,"cpu"])}}finally{a.stackRestore(ee),oe==="string"&&D&&a._free(D),V||a._OrtReleaseTensor(P)}}g&&!y&&(a._OrtClearBoundOutputs(g.handle)!==0&&be("Can't clear bound outputs."),jt.set(e,[d,p,h,g,y,!1]));for(let[z,P]of await Promise.all(j))G[z][2]=P;return Xt("wasm ProcessOutputTensor"),G}finally{a.webnnOnRunEnd?.(d),a.stackRestore(A),T.forEach(W=>a._OrtReleaseTensor(W)),S.forEach(W=>a._OrtReleaseTensor(W)),I.forEach(W=>a._free(W)),v!==0&&a._OrtReleaseRunOptions(v),w.forEach(W=>a._free(W))}},ia=e=>{let t=Ie(),r=jt.get(e);if(!r)throw new Error("invalid session id");let n=r[0],i=t._OrtEndProfiling(n);i===0&&be("Can't get an profile file name."),t._OrtFree(i)},sa=e=>{let t=[];for(let r of e){let n=r[2];!Array.isArray(n)&&"buffer"in n&&t.push(n.buffer)}return t}}),Xf=L(()=>{"use strict";it(),Wf(),gr(),Rs(),Kt=()=>!!ke.wasm.proxy&&typeof document<"u",xr=!1,Qr=!1,Xr=!1,Nn=new Map,or=(e,t)=>{let r=Nn.get(e);r?r.push(t):Nn.set(e,[t])},ur=()=>{if(xr||!Qr||Xr||!rt)throw new Error("worker not ready")},fc=e=>{switch(e.data.type){case"init-wasm":xr=!1,e.data.err?(Xr=!0,hs[1](e.data.err)):(Qr=!0,hs[0]()),On&&(URL.revokeObjectURL(On),On=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Nn.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},qf=async()=>{if(!Qr){if(xr)throw new Error("multiple calls to 'initWasm()' detected.");if(Xr)throw new Error("previous call to 'initWasm()' failed.");if(xr=!0,Kt())return new Promise((e,t)=>{rt?.terminate(),Lc().then(([r,n])=>{try{rt=n,rt.onerror=s=>t(s),rt.onmessage=fc,hs=[e,t];let i={type:"init-wasm",in:ke};!i.in.wasm.wasmPaths&&(r||ms)&&(i.in.wasm.wasmPaths={wasm:new URL("ort-wasm-simd-threaded.jsep.wasm",ft.url).href}),rt.postMessage(i),On=r}catch(i){t(i)}},t)});try{await Bs(ke.wasm),await Js(ke),Qr=!0}catch(e){throw Xr=!0,e}finally{xr=!1}}},Gf=async e=>{if(Kt())return ur(),new Promise((t,r)=>{or("init-ep",[t,r]);let n={type:"init-ep",in:{epName:e,env:ke}};rt.postMessage(n)});await ea(ke,e)},Vf=async e=>Kt()?(ur(),new Promise((t,r)=>{or("copy-from",[t,r]);let n={type:"copy-from",in:{buffer:e}};rt.postMessage(n,[e.buffer])})):qn(e),Hf=async(e,t)=>{if(Kt()){if(t?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return ur(),new Promise((r,n)=>{or("create",[r,n]);let i={type:"create",in:{model:e,options:{...t}}},s=[];e instanceof Uint8Array&&s.push(e.buffer),rt.postMessage(i,s)})}else return ta(e,t)},jf=async e=>{if(Kt())return ur(),new Promise((t,r)=>{or("release",[t,r]);let n={type:"release",in:e};rt.postMessage(n)});ra(e)},Kf=async(e,t,r,n,i,s)=>{if(Kt()){if(r.some(a=>a[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(i.some(a=>a))throw new Error("pre-allocated output tensor is not supported for proxy.");return ur(),new Promise((a,u)=>{or("run",[a,u]);let l=r,d={type:"run",in:{sessionId:e,inputIndices:t,inputs:l,outputIndices:n,options:s}};rt.postMessage(d,sa(l))})}else return na(e,t,r,n,i,s)},Qf=async e=>{if(Kt())return ur(),new Promise((t,r)=>{or("end-profiling",[t,r]);let n={type:"end-profiling",in:e};rt.postMessage(n)});ia(e)}}),P_=L(()=>{"use strict";it(),Xf(),ne(),Ns(),Gc(),fs=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},mc=e=>{switch(e[3]){case"cpu":return new mt(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Ps(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:n,dispose:i}=e[2];return mt.fromGpuBuffer(r,{dataType:t,dims:e[1],download:n,dispose:i})}case"ml-tensor":{let t=e[0];if(!Us(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:n,dispose:i}=e[2];return mt.fromMLTensor(r,{dataType:t,dims:e[1],download:n,dispose:i})}default:throw new Error(`invalid data location: ${e[3]}`)}},Zf=class{async fetchModelAndCopyToWasmMemory(e){return Vf(await Ls(e))}async loadModel(e,t){gt();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Hf(r,t),nt()}async dispose(){return jf(this.sessionId)}async run(e,t,r){gt();let n=[],i=[];Object.entries(e).forEach(h=>{let g=h[0],y=h[1],_=this.inputNames.indexOf(g);if(_===-1)throw new Error(`invalid input '${g}'`);n.push(y),i.push(_)});let s=[],a=[];Object.entries(t).forEach(h=>{let g=h[0],y=h[1],_=this.outputNames.indexOf(g);if(_===-1)throw new Error(`invalid output '${g}'`);s.push(y),a.push(_)});let u=n.map((h,g)=>fs(h,()=>`input "${this.inputNames[i[g]]}"`)),l=s.map((h,g)=>h?fs(h,()=>`output "${this.outputNames[a[g]]}"`):null),d=await Kf(this.sessionId,i,u,a,l,r),p={};for(let h=0;h<d.length;h++)p[this.outputNames[a[h]]]=s[h]??mc(d[h]);return nt(),p}startProfiling(){}endProfiling(){Qf(this.sessionId)}}}),Yf={};Ir(Yf,{OnnxruntimeWebAssemblyBackend:()=>zs,initializeFlags:()=>Cs,wasmBackend:()=>Jf});U_=L(()=>{"use strict";it(),Xf(),P_(),Cs=()=>{(typeof ke.wasm.initTimeout!="number"||ke.wasm.initTimeout<0)&&(ke.wasm.initTimeout=0);let e=ke.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),ke.wasm.simd=!1),typeof ke.wasm.proxy!="boolean"&&(ke.wasm.proxy=!1),typeof ke.wasm.trace!="boolean"&&(ke.wasm.trace=!1),typeof ke.wasm.numThreads!="number"||!Number.isInteger(ke.wasm.numThreads)||ke.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)ke.wasm.numThreads=1;else{let t=typeof navigator>"u"?S0("node:os").cpus().length:navigator.hardwareConcurrency;ke.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},zs=class{async init(e){Cs(),await qf(),await Gf(e)}async createInferenceSessionHandler(e,t){let r=new Zf;return await r.loadModel(e,t),r}},Jf=new zs});it();it();it();L_="1.24.1",F_=Nc;{let e=(U_(),rn(Yf)).wasmBackend;pr("webgpu",e,5),pr("webnn",e,5),pr("cpu",e,10),pr("wasm",e,10)}Object.defineProperty(ke.versions,"web",{value:L_,enumerable:!0});});aa();async function Vn({backend:e="webgpu",wasmPaths:t,numThreads:r}={}){let n;try{let i=await Promise.resolve().then(()=>(aa(),em));n=i.default||i,console.log("[Parakeet.js] ORT structure:",{hasDefault:!!i.default,hasEnv:!!n.env,hasWasm:!!n.env?.wasm,hasWebgpu:!!n.env?.webgpu,keys:Object.keys(n).slice(0,10)}),n.env||(console.log("[Parakeet.js] Trying alternative access patterns..."),console.log("[Parakeet.js] ortModule keys:",Object.keys(i)),i.ort&&(n=i.ort,console.log("[Parakeet.js] Found ort in ortModule.ort")))}catch(i){throw console.error("[Parakeet.js] Failed to import onnxruntime-web:",i),new Error("Failed to load ONNX Runtime Web. Please check your network connection.")}if(!n||!n.env)throw new Error("ONNX Runtime Web loaded but env is not available. This might be a bundling issue.");if(!n.env.wasm.wasmPaths){let s=n.env.versions?.common||"1.24.1";n.env.versions?.common||console.warn("Parakeet.js: Could not auto-detect onnxruntime-web version. Using fallback version; set ort.env.wasm.wasmPaths manually for best results."),n.env.wasm.wasmPaths=`https://cdn.jsdelivr.net/npm/onnxruntime-web@${s}/dist/`}if((e==="wasm"||e==="webgpu")&&(typeof SharedArrayBuffer<"u"?(n.env.wasm.numThreads=r||navigator.hardwareConcurrency||4,n.env.wasm.simd=!0,console.log(`[Parakeet.js] WASM configured with ${n.env.wasm.numThreads} threads, SIMD enabled`)):(console.warn("[Parakeet.js] SharedArrayBuffer not available - using single-threaded WASM"),n.env.wasm.numThreads=1),n.env.wasm.proxy=!1),e==="webgpu"){let i="gpu"in navigator;if(console.log(`[Parakeet.js] WebGPU supported: ${i}`),i)try{console.log("[Parakeet.js] WebGPU will be initialized automatically when creating session")}catch(s){console.warn("[Parakeet.js] WebGPU initialization failed:",s),console.warn("[Parakeet.js] Falling back to WASM"),e="wasm"}else console.warn("[Parakeet.js] WebGPU not supported \u2013 falling back to WASM"),e="wasm"}return typeof globalThis<"u"&&(globalThis.ort=n),n}async function W_(e){let t=await fetch(e);if(!t.ok)throw new Error(`Failed to fetch ${e}: ${t.status}`);return t.text()}var Hn=class e{constructor(t){this.id2token=t,this.blankToken="<blk>",this.blankId=t.findIndex(r=>r==="<blk>"),this.blankId===-1&&(console.warn("[ParakeetTokenizer] Blank token <blk> not found in vocabulary, defaulting to 1024"),this.blankId=1024),this.sanitizedTokens=this.id2token.map(r=>r&&r.replace(/\u2581/g," "))}static async fromUrl(t){let n=(await W_(t)).split(/\r?\n/).filter(Boolean),i=[];for(let s of n){let[a,u]=s.split(/\s+/),l=parseInt(u,10);if(isNaN(l)||!a){console.warn(`[ParakeetTokenizer] Skipping invalid vocab line: ${JSON.stringify(s)}`);continue}i[l]=a}return new e(i)}decode(t){let r=[];for(let i of t){if(i===this.blankId)continue;let s=this.sanitizedTokens[i];s!==void 0&&r.push(s)}let n=r.join("");return n=n.replace(/^\s+/,""),n=n.replace(/\s+(?=[^\w\s])/g,""),n=n.replace(/\s+/g," "),n.trim()}};var jn=class{constructor(t,r={}){this.modelUrl=t,this.opts=r,this.opts.enableGraphCapture===void 0&&(this.opts.enableGraphCapture=this.opts.backend==="wasm"),this.session=null,this.ort=null,this._sessionPromise=null}async _ensureSession(){if(!this.session){if(this._sessionPromise){await this._sessionPromise;return}this._sessionPromise=(async()=>{this.ort=await Vn(this.opts);let t=this.opts.enableGraphCapture?{enableProfiling:this.opts.enableProfiling||!1,enableGraphCapture:!0}:{enableProfiling:this.opts.enableProfiling||!1},r=async()=>{try{return await this.ort.InferenceSession.create(this.modelUrl,t)}catch(n){let i=(n.message||"")+"";if(t.enableGraphCapture&&i.includes("graph capture"))return console.warn("[Preprocessor] Graph capture unsupported, retrying without it"),await this.ort.InferenceSession.create(this.modelUrl,{...t,enableGraphCapture:!1});throw n}};this.session=await r()})();try{await this._sessionPromise}catch(t){throw this._sessionPromise=null,t}finally{this.session&&(this._sessionPromise=null)}}}async process(t){await this._ensureSession();let r;t instanceof Float32Array?r=t.byteOffset===0&&t.buffer.byteLength===t.byteLength?t:new Float32Array(t):r=new Float32Array(t);let n=new this.ort.Tensor("float32",r,[1,r.length]),i=new BigInt64Array([BigInt(r.length)]),s=new this.ort.Tensor("int64",i,[1]),a={waveforms:n,waveforms_lens:s},u=await this.session.run(a),l=u.features,d=u.features_lens,p=new Float32Array(l.data),h=Number(d.data[0]);return n.dispose?.(),s.dispose?.(),l.dispose?.(),d.dispose?.(),{features:p,length:h}}};var nm=5960464477539063e-23,_t=257,Kn=Math.SQRT1_2,tm=new Map,rm=new Map,oa=null,ca=200/3,Qn=1e3,ua=Qn/ca,im=Math.log(6.4)/27;function la(e){return e>=Qn?ua+Math.log(e/Qn)/im:e/ca}function sm(e){return e>=ua?Qn*Math.exp(im*(e-ua)):e*ca}function am(e){let n=new Float64Array(_t);for(let p=0;p<_t;p++)n[p]=8e3*p/(_t-1);let i=la(0),s=la(8e3),a=e+2,u=new Float64Array(a);for(let p=0;p<a;p++)u[p]=sm(i+(s-i)*p/(a-1));let l=new Float64Array(a-1);for(let p=0;p<a-1;p++)l[p]=u[p+1]-u[p];let d=new Float32Array(e*_t);for(let p=0;p<e;p++){let h=2/(u[p+2]-u[p]),g=p*_t;for(let y=0;y<_t;y++){let _=(n[y]-u[p])/l[p],b=(u[p+2]-n[y])/l[p+1];d[g+y]=Math.max(0,Math.min(_,b))*h}}return d}function q_(e){let t=tm.get(e);return t||(t=am(e),tm.set(e,t)),t}function om(){let e=new Float64Array(512),t=56;for(let r=0;r<400;r++)e[t+r]=.5*(1-Math.cos(2*Math.PI*r/399));return e}function G_(){return oa||(oa=om()),oa}function da(e){let t=rm.get(e);if(t)return t;let r=Math.log2(e);if(1<<r!==e)throw new Error(`FFT size must be power-of-two. Received: ${e}`);let n=e>>1,i=new Float64Array(n),s=new Float64Array(n);for(let l=0;l<n;l++){let d=-2*Math.PI*l/e;i[l]=Math.cos(d),s[l]=Math.sin(d)}let a=new Uint32Array(e);for(let l=0;l<e;l++){let d=l,p=0;for(let h=0;h<r;h++)p=p<<1|d&1,d>>=1;a[l]=p}let u={cos:i,sin:s,bitrev:a};return rm.set(e,u),u}function um(e,t,r,n){if(n.bitrev&&n.bitrev.length===r){let i=n.bitrev;for(let s=0;s<r;s++){let a=i[s];if(s<a){let u=e[s];e[s]=e[a],e[a]=u,u=t[s],t[s]=t[a],t[a]=u}}}else{let i=0;for(let s=0;s<r-1;s++){if(s<i){let u=e[s];e[s]=e[i],e[i]=u,u=t[s],t[s]=t[i],t[i]=u}let a=r>>1;for(;a<=i;)i-=a,a>>=1;i+=a}}if(r>=2)for(let i=0;i<r;i+=2){let s=i,a=i+1,u=e[a],l=t[a];e[a]=e[s]-u,t[a]=t[s]-l,e[s]+=u,t[s]+=l}if(r>=4)for(let i=0;i<r;i+=4){let s=i,a=i+2,u=e[a],l=t[a];e[a]=e[s]-u,t[a]=t[s]-l,e[s]+=u,t[s]+=l;let d=i+1,p=i+3,h=t[p],g=-e[p];e[p]=e[d]-h,t[p]=t[d]-g,e[d]+=h,t[d]+=g}if(r>=8)for(let i=0;i<r;i+=8){{let s=i,a=i+4,u=e[a],l=t[a];e[a]=e[s]-u,t[a]=t[s]-l,e[s]+=u,t[s]+=l}{let s=Kn,a=-Kn,u=i+1,l=u+4,d=e[l]*s-t[l]*a,p=e[l]*a+t[l]*s;e[l]=e[u]-d,t[l]=t[u]-p,e[u]+=d,t[u]+=p}{let s=i+2,a=s+4,u=t[a],l=-e[a];e[a]=e[s]-u,t[a]=t[s]-l,e[s]+=u,t[s]+=l}{let s=-Kn,a=-Kn,u=i+3,l=u+4,d=e[l]*s-t[l]*a,p=e[l]*a+t[l]*s;e[l]=e[u]-d,t[l]=t[u]-p,e[u]+=d,t[u]+=p}}for(let i=16;i<=r;i<<=1){let s=i>>1,a=r/i;for(let u=0;u<r;u+=i)for(let l=0;l<s;l++){let d=l*a,p=n.cos[d],h=n.sin[d],g=u+l,y=g+s,_=e[y]*p-t[y]*h,b=e[y]*h+t[y]*p;e[y]=e[g]-_,t[y]=t[g]-b,e[g]+=_,t[g]+=b}}}var Tt=class{constructor(t={}){this.nMels=t.nMels||128,this.melFilterbank=q_(this.nMels),this.hannWindow=G_(),this.twiddles=da(512),this.twiddlesHalf=da(256),this._fftRe=new Float64Array(256),this._fftIm=new Float64Array(256),this._powerBuf=new Float32Array(_t),this._paddedBuffer=null,this.fbBounds=new Int32Array(this.nMels*2);for(let r=0;r<this.nMels;r++){let n=r*_t,i=-1,s=-1;for(let a=0;a<_t;a++)this.melFilterbank[n+a]>0&&(i===-1&&(i=a),s=a);i===-1&&(i=0,s=-1),this.fbBounds[r*2]=i,this.fbBounds[r*2+1]=s+1}}process(t){let{rawMel:r,nFrames:n,featuresLen:i}=this.computeRawMel(t);return i===0?{features:new Float32Array(0),length:0}:{features:this.normalizeFeatures(r,n,i),length:i}}computeRawMel(t,r=0,n=null){let i=t.length;if(i===0)return{rawMel:n?n.subarray(0,0):new Float32Array(0),nFrames:0,featuresLen:0};let s=256,a=i+2*s,u=!1;if(!this._paddedBuffer||this._paddedBuffer.length<a){let $=Math.ceil(a*1.2);this._paddedBuffer=new Float64Array($),u=!0}let l=this._paddedBuffer;l[s]=Math.fround(t[0]);for(let $=1;$<i;$++)l[s+$]=Math.fround(t[$]-.97*t[$-1]);u||l.fill(0,s+i,a);let d=Math.floor((a-512)/160)+1,p=Math.floor(i/160);if(p===0)return{rawMel:new Float32Array(0),nFrames:0,featuresLen:0};let h=this.nMels*d,g;if(n&&n.length>=h){if(g=n.subarray(0,h),r>0)for(let $=0;$<this.nMels;$++)g.fill(0,$*d,$*d+r)}else g=new Float32Array(h);let y=this._fftRe,_=this._fftIm,b=this._powerBuf,k=this.hannWindow,v=this.melFilterbank,w=this.nMels,T=this.twiddles,S=this.twiddlesHalf,I=this.fbBounds,C=256,A=C>>1;for(let $=r;$<d;$++){let B=$*160;for(let j=0;j<C;j++){let z=j<<1;y[j]=l[B+z]*k[z],_[j]=l[B+z+1]*k[z+1]}um(y,_,C,S);let U=y[0],H=_[0];b[0]=(U+H)*(U+H),b[C]=(U-H)*(U-H);for(let j=1;j<A;j++){let z=y[j],P=_[j],ee=y[C-j],X=_[C-j],V=.5*(z+ee),oe=.5*(P-X),D=.5*(P+X),F=-.5*(z-ee),K=T.cos[j],re=T.sin[j],he=D*K-F*re,Ee=D*re+F*K,Be=V+he,Fe=oe+Ee;b[j]=Be*Be+Fe*Fe;let Se=V-he,$e=oe-Ee;b[C-j]=Se*Se+$e*$e}let W=y[A],G=_[A];b[A]=W*W+G*G;for(let j=0;j<w;j++){let z=0,P=j*_t,ee=I[j*2],X=I[j*2+1];for(let V=ee;V<X;V++)z+=b[V]*v[P+V];g[j*d+$]=Math.log(z+nm)}}return{rawMel:g,nFrames:d,featuresLen:p}}normalizeFeatures(t,r,n,i=null){let s=this.nMels,a=s*n,u;i&&i.length>=a?u=i.subarray(0,a):u=new Float32Array(a);for(let l=0;l<s;l++){let d=l*r,p=l*n,h=0;for(let b=0;b<n;b++)h+=t[d+b];let g=h/n,y=0;for(let b=0;b<n;b++){let k=t[d+b]-g;y+=k*k}let _=n>1?1/(Math.sqrt(y/(n-1))+1e-5):0;for(let b=0;b<n;b++)u[p+b]=(t[d+b]-g)*_}return u}},Er=class{constructor(t={}){this.preprocessor=new Tt({nMels:t.nMels||128}),this.nMels=this.preprocessor.nMels,this.boundaryFrames=t.boundaryFrames||3,this._cachedRawMel=null,this._cachedNFrames=0,this._cachedAudioLen=0,this._cachedFeaturesLen=0,this._rawBuffers=[null,null],this._bufIdx=0,this._featuresBuffer=null}reset(){this._cachedRawMel=null,this._cachedNFrames=0,this._cachedAudioLen=0,this._cachedFeaturesLen=0,this._bufIdx=0}process(t,r=0){let n=t.length;if(n===0)return{features:new Float32Array(0),length:0,cached:!1,cachedFrames:0,newFrames:0};let i=r>0&&this._cachedRawMel!==null&&r<=this._cachedAudioLen,s=Math.floor(n/160)+1,a=this.nMels*s,u=this._rawBuffers[this._bufIdx];if(!u||u.length<a){let k=Math.ceil(a*1.2);u=new Float32Array(k),this._rawBuffers[this._bufIdx]=u}let l=Math.floor(n/160),d=this.nMels*l;if(!this._featuresBuffer||this._featuresBuffer.length<d){let k=Math.ceil(d*1.2);this._featuresBuffer=new Float32Array(k)}if(!i){let{rawMel:k,nFrames:v,featuresLen:w}=this.preprocessor.computeRawMel(t,0,u),T=this.preprocessor.normalizeFeatures(k,v,w,this._featuresBuffer);return this._cachedRawMel=k,this._cachedNFrames=v,this._cachedAudioLen=n,this._cachedFeaturesLen=w,this._bufIdx^=1,{features:new Float32Array(T),length:w,cached:!1,cachedFrames:0,newFrames:w}}let p=Math.floor(r/160),h=Math.max(0,Math.min(p-this.boundaryFrames,this._cachedFeaturesLen)),{rawMel:g,nFrames:y,featuresLen:_}=this.preprocessor.computeRawMel(t,h,u);if(h>0&&this._cachedRawMel)for(let k=0;k<this.nMels;k++){let v=k*this._cachedNFrames,w=k*y;g.set(this._cachedRawMel.subarray(v,v+h),w)}let b=this.preprocessor.normalizeFeatures(g,y,_,this._featuresBuffer);return this._cachedRawMel=g,this._cachedNFrames=y,this._cachedAudioLen=n,this._cachedFeaturesLen=_,this._bufIdx^=1,{features:new Float32Array(b),length:_,cached:!0,cachedFrames:h,newFrames:_-h}}clear(){this.reset()}},pa={SAMPLE_RATE:16e3,N_FFT:512,WIN_LENGTH:400,HOP_LENGTH:160,PREEMPH:.97,LOG_ZERO_GUARD:nm,N_FREQ_BINS:_t};function V_(e){if(!(e instanceof Float32Array||e instanceof Float64Array))throw new TypeError("ParakeetModel.transcribeLongAudio expected audio to be Float32Array or Float64Array.");for(let t=0;t<e.length;++t)if(!Number.isFinite(e[t]))throw new Error(`ParakeetModel.transcribeLongAudio expected finite audio samples; found ${e[t]} at index ${t}.`)}function H_(e){let t=Number(e);return!Number.isFinite(t)||t<=0?0:Math.max(20,Math.min(180,t))}function j_(e){return{audioDurationS:e,preprocess_ms:0,encode_ms:0,decode_ms:0,tokenize_ms:0,total_ms:0,cached_frames:0,new_frames:0,hasMetrics:!1,hasMelCache:!1}}function yr(e,t,r){typeof r=="number"&&Number.isFinite(r)&&(e[t]+=r)}function lm(e,t){!t||typeof t!="object"||(e.hasMetrics=!0,yr(e,"preprocess_ms",t.preprocess_ms),yr(e,"encode_ms",t.encode_ms),yr(e,"decode_ms",t.decode_ms),yr(e,"tokenize_ms",t.tokenize_ms),yr(e,"total_ms",t.total_ms),t.mel_cache&&typeof t.mel_cache=="object"&&(e.hasMelCache=!0,yr(e,"cached_frames",t.mel_cache.cached_frames),yr(e,"new_frames",t.mel_cache.new_frames)))}function ha(e){if(!e?.hasMetrics)return null;let t=e.total_ms>0?e.total_ms:e.preprocess_ms+e.encode_ms+e.decode_ms+e.tokenize_ms,r={preprocess_ms:e.preprocess_ms,encode_ms:e.encode_ms,decode_ms:e.decode_ms,tokenize_ms:e.tokenize_ms,total_ms:t,rtf:t>0?e.audioDurationS/(t/1e3):0};return e.hasMelCache&&(r.mel_cache={cached_frames:e.cached_frames,new_frames:e.new_frames}),r}function fa(e){let t="";for(let r of e){let n=r?.text??"";n&&(t?/^[,.;:!?)}\]]+$/.test(n)?t+=n:t+=` ${n}`:t=n)}return t}function dm(e){return e.map(t=>({text:t.text,timestamp:[t.start_time,t.end_time]}))}function cm(e){return String(e??"").normalize("NFKC").toLowerCase().replace(/^[("'“‘\[{]+/g,"").replace(/[.,!?;:)"'”’\]}]+$/g,"").trim()}function pm(e){return String(e??"").normalize("NFKC").toLowerCase().trim()}function wr(e){let t=[];for(let r of e){let n=t.at(-1),i=cm(n?.text),s=cm(r?.text);if(n&&i===s&&(i.length>0||pm(n.text)===pm(r.text))&&r.start_time<n.end_time){let a=n.end_time-n.start_time;r.end_time-r.start_time>a&&(t[t.length-1]=r);continue}t.push(r)}return t}var K_=/[!?…](?:["')\]]+)?$/u,Q_=/\.(?:["')\]]+)?$/u,X_=/["')\]]+$/gu,Z_=/^[("'“‘\[{]+/u,Y_=/^(?:[A-Z]\.){2,}$/,J_=/^[A-Z]\.$/,ey=/^(?:[IVXLCDM]+)\.$/i,ty=/^\d+\.$/,ry=3,ny=new Set(["mr.","mrs.","ms.","dr.","prof.","sr.","jr.","vs.","etc.","e.g.","i.e."]);function iy(e){return String(e??"").replace(X_,"")}function sy(e){let t=String(e??"").replace(Z_,"");return/^[A-Z]/.test(t)}function ay(e,t,r=0){if(!t)return!1;if(r>=ry)return!0;let n=String(e?.text??"");if(!n)return!1;if(K_.test(n))return!0;if(!Q_.test(n))return!1;let i=iy(n),s=i.toLowerCase();return ny.has(s)||Y_.test(i)||J_.test(i)||ey.test(i)||ty.test(i)?!1:sy(t.text)}function mm(e){if(!Array.isArray(e)||e.length===0)return[];let t=[],r=[];for(let n=0;n<e.length;++n){let i=e[n];r.push(i);let s=e[n+1]??null,a=s?Math.max(0,s.start_time-i.end_time):0;ay(i,s,a)&&(t.push({words:r,text:fa(r),timestamp:[r[0].start_time,r[r.length-1].end_time]}),r=[])}return r.length>0&&t.push({words:r,text:fa(r),timestamp:[r[0].start_time,r[r.length-1].end_time]}),t}function gm(e,t=""){return!Array.isArray(e)||e.length===0?t?[{text:t,timestamp:[0,0]}]:[]:mm(e).map(r=>({text:r.text,timestamp:r.timestamp}))}function oy(e){return e.flatMap(t=>t.words)}function uy(e,t){let r=Array.isArray(e)?e:[],n=Array.isArray(t)?t:[];if(r.length===0)return wr(n);if(n.length===0)return wr(r);let i=r[0].start_time;return n[0].start_time<=i+1e-6?wr(n):wr([...r,...n])}function hm(e){return String(e??"").normalize("NFKC").replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/\s+/g," ").trim().toLowerCase()}function ly(e,t){let r=hm(t.text);return r?e.some(n=>hm(n.text)===r&&Math.abs(n.timestamp[1]-t.timestamp[1])<.15):!1}function fm(e,t){ly(e,t)||e.push(t)}function dy(e,t){let r=e,n=.5+1;for(let i=0;i<t.length-1;++i){let s=t[i],a=t[i+1],u=s.end_time,l=a.start_time;if(!(l-u<.2))for(let p of[u,l]){if(p+1e-6<e)continue;let h=p-e;h<=.5&&h<n&&(r=p,n=h)}}return r}async function cy({audio:e,samplingRate:t,chunkLengthS:r,baseTimeOffset:n,transcribeWindow:i}){let s=e.length/t,a=Math.min(10,Math.max(0,r-1)),u=Math.max(1,r-a),l=Math.max(4,Math.ceil(Math.max(0,s-r)/1)+2),d=[],p=[],h="",g=0,y=!1;for(let v=0;v<l&&g<s-1e-6;++v){let w=Math.min(s,g+r),T=Math.max(0,Math.min(e.length-1,Math.floor(g*t))),S=Math.max(T+1,Math.min(e.length,Math.ceil(w*t))),I=e.subarray(T,S),C=w>=s-1e-6,A=await i(I,n+g);h=A.text??h;let $=Array.isArray(A.words)?A.words:[],B=y?uy(p,$):wr($),U=mm(B);if(C){for(let W of U)fm(d,W);p=[];break}if(U.length>1){let W=U[U.length-1],G=W.timestamp[0],j=Math.max(0,G-n);if(j>=g+1-1e-6){let z=U.slice(0,-1);for(let ee of z)fm(d,ee);p=wr(W.words);let P=Math.min(s,Math.max(0,dy(G,B)-n));if(y=P>j+1e-6,P>g+1e-6){g=P;continue}}}p=B,y=!0;let H=Math.min(s,g+u);if(H<=g+1e-6)break;g=H}let _=wr([...oy(d),...p]),b=_.length>0?fa(_):String(h??"").trim(),k=gm(_,b);return{text:b,words:_,chunks:k}}async function _m(e,t,r=16e3,n={}){if(V_(t),typeof r!="number"||!Number.isFinite(r)||r<=0)throw new Error("ParakeetModel.transcribeLongAudio expected `sampleRate` to be a positive finite number.");let{returnTimestamps:i=!1,chunkLengthS:s=0,timeOffset:a=0,...u}=n;if(typeof a!="number"||!Number.isFinite(a)||a<0)throw new Error("ParakeetModel.transcribeLongAudio expected `timeOffset` to be a finite non-negative number.");let l=i==="word",d=i===!0||l,p=H_(s),h=t.length/r,g=p<=0&&h>180,y=p>0?p:g?90:0,_=j_(h),b=async(T,S)=>{let I=await e.transcribe(T,r,{...u,_skipAudioValidation:!0,returnTimestamps:!0,timeOffset:S});return lm(_,I.metrics),{text:I.utterance_text??"",words:Array.isArray(I.words)?I.words:[]}};if(y>0){let T=await cy({audio:t,samplingRate:r,chunkLengthS:y,baseTimeOffset:a,transcribeWindow:b}),S={text:T.text,metrics:ha(_)};return d&&(S.words=T.words,S.chunks=l?dm(T.words):T.chunks),S}let k=await e.transcribe(t,r,{...u,_skipAudioValidation:!0,returnTimestamps:d,timeOffset:a});lm(_,k.metrics);let v=k.utterance_text??"";if(!d)return{text:v,metrics:ha(_)};let w=Array.isArray(k.words)?k.words:[];return{text:v,words:w,chunks:l?dm(w):gm(w,v),metrics:ha(_)}}function py(e,t){if(!(e instanceof Float32Array||e instanceof Float64Array))return e;let r=null,n=0;for(let i=0;i<e.length;++i)Number.isFinite(e[i])||(r||(r=e.slice()),r[i]=0,n+=1);return r?(console.warn(`[Parakeet.js] ${t} received ${n} non-finite audio sample(s); replacing them with 0 for compatibility.`),r):e}function hy(e,t){return Number.isFinite(e)?e:(console.warn(`[Parakeet.js] ${t} received non-finite timeOffset; using 0 for compatibility.`),0)}var an=class e{constructor({tokenizer:t,encoderSession:r,joinerSession:n,preprocessor:i,ort:s,subsampling:a=8,windowStride:u=.01,normalizer:l=g=>g,onnxPreprocessor:d=null,nMels:p,maxIncrementalCacheSize:h=50}){this.tokenizer=t,this.encoderSession=r,this.joinerSession=n,this.preprocessor=i,this.ort=s,this._onnxPreprocessor=d,this._jsPreprocessor=i instanceof Tt?i:null,this._incrementalMel=i instanceof Tt?new Er({nMels:i.nMels}):null,this.blankId=t.blankId,this.predHidden=640,this.predLayers=2,this.maxTokensPerStep=10;let g=this.predLayers,y=this.predHidden,_=g*1*y,b=new Float32Array(_);this._combState1=new s.Tensor("float32",b,[g,1,y]),this._combState2=new s.Tensor("float32",b.slice(),[g,1,y]),this._normalizer=l,this.subsampling=a,this.windowStride=u,this._nMels=p||128,this._targetIdArray=new Int32Array(1),this._targetTensor=new s.Tensor("int32",this._targetIdArray,[1,1]),this._targetLenArray=new Int32Array([1]),this._targetLenTensor=new s.Tensor("int32",this._targetLenArray,[1]),this._encoderFrameBuffer=null,this._encoderFrameTensor=null,this._incrementalCache=new Map,this.maxIncrementalCacheSize=h,this._warnedMissingDecoderStates=!1,this._warnedMissingDurationLogits=!1}static async fromUrls(t){let{encoderUrl:r,decoderUrl:n,tokenizerUrl:i,preprocessorUrl:s,encoderDataUrl:a,decoderDataUrl:u,filenames:l,backend:d="webgpu-hybrid",wasmPaths:p,subsampling:h=8,windowStride:g=.01,verbose:y=!1,enableProfiling:_=!1,enableGraphCapture:b,cpuThreads:k=void 0,preprocessorBackend:v="js",nMels:w}=t,T=v==="js";if(console.log(`[Parakeet.js] Preprocessor backend requested: '${v}' \u2192 ${T?"JS (mel.js)":"ONNX"}`),!r||!n||!i||!s&&!T)throw new Error('fromUrls requires encoderUrl, decoderUrl, tokenizerUrl and preprocessorUrl (preprocessorUrl not needed if preprocessorBackend="js")');let S=d;d.startsWith("webgpu")&&(S="webgpu");let I=await Vn({backend:S,wasmPaths:p,numThreads:k}),C=!!b&&d==="webgpu-strict",A=d==="wasm",$={executionProviders:[],graphOptimizationLevel:"all",executionMode:"parallel",enableCpuMemArena:!0,enableMemPattern:!0,enableProfiling:_,enableGraphCapture:C,logSeverityLevel:y?0:2};d==="webgpu-hybrid"?$.executionProviders=[{name:"webgpu",deviceType:"gpu",powerPreference:"high-performance"},"wasm"]:d==="webgpu-strict"?$.executionProviders=[{name:"webgpu",deviceType:"gpu",powerPreference:"high-performance"}]:d==="wasm"&&($.executionProviders=["wasm"]),console.log(`[Parakeet.js] Creating ONNX sessions with execution mode '${d}'. Providers:`,$.executionProviders),y&&console.log("[Parakeet.js] Verbose logging enabled for ONNX Runtime.");let B={...$};a&&l?.encoder&&(B.externalData=[{data:a,path:l.encoder+".data"}]);let U={...$};u&&l?.decoder&&(U.externalData=[{data:u,path:l.decoder+".data"}]),d.startsWith("webgpu")&&(U.executionProviders=["wasm"]);async function H(K,re){try{return await I.InferenceSession.create(K,re)}catch(he){let Ee=(he.message||"")+"";if(re.enableGraphCapture&&Ee.includes("graph capture")){console.warn("[Parakeet] Graph-capture unsupported for this model/backend; retrying without it");let Be={...re,enableGraphCapture:!1};return await I.InferenceSession.create(K,Be)}throw he}}let W=Hn.fromUrl(i),G=w||128,j=new Tt({nMels:G}),z=null;!T&&s?(z=new jn(s,{backend:"wasm",wasmPaths:p,enableProfiling:_,enableGraphCapture:!1,numThreads:k}),console.log(`[Parakeet.js] ONNX preprocessor session created (${G} mel bins)`)):!T&&!s&&console.warn("[Parakeet.js] ONNX preprocessor requested but no URL provided \u2014 falling back to JS");let P=T?j:z||j,ee=Promise.resolve(P);console.log(`[Parakeet.js] Active preprocessor: ${(P===j?"js":"onnx")==="js"?"JS (mel.js) \u2014 no ONNX preprocessor needed":"ONNX (nemo128.onnx)"}, ${G} mel bins`);let V,oe;d==="webgpu-hybrid"?(V=await H(r,B),oe=await H(n,U)):[V,oe]=await Promise.all([H(r,B),H(n,U)]);let[D,F]=await Promise.all([W,ee]);try{let K=new Float32Array(1600);await F.process(K),y&&console.log("[Parakeet.js] Preprocessor warmed up")}catch(K){console.warn("[Parakeet.js] Preprocessor warm-up failed (non-fatal):",K.message)}return new e({tokenizer:D,encoderSession:V,joinerSession:oe,preprocessor:F,ort:I,subsampling:h,windowStride:g,onnxPreprocessor:z!==F?z:null,nMels:G})}async _runCombinedStep(t,r,n=null){let i=typeof r=="number"?r:this.blankId;this._targetIdArray[0]=i;let s=n?.state1||this._combState1,a=n?.state2||this._combState2,u={encoder_outputs:t,targets:this._targetTensor,target_length:this._targetLenTensor,input_states_1:s,input_states_2:a},l=await this.joinerSession.run(u),d=l.outputs,p=l.output_states_1,h=l.output_states_2,g=new Set;for(let I of Object.values(l))!I||typeof I.dispose!="function"||g.has(I)||(g.add(I),!(I===d||I===p||I===h)&&I.dispose());let y=this.tokenizer.id2token.length,_=I=>{d?.dispose?.();let C=new Set,A=$=>{if($)for(let B of[$.state1,$.state2])!B||B===this._combState1||B===this._combState2||C.has(B)||(C.add(B),B.dispose?.())};throw A({state1:p,state2:h}),A(n),new Error(I)};(!d||!d.data||typeof d.data.subarray!="function")&&_("ParakeetModel decoder output did not include a valid `outputs` tensor.");let b=d.data;b.length<y&&_(`ParakeetModel decoder output is too small (${b.length}) for vocab size ${y}.`);let k=b.length,v=b.subarray(0,y),w=b.subarray(y,k);(!p||!h)&&!this._warnedMissingDecoderStates&&(this._warnedMissingDecoderStates=!0,console.warn("[Parakeet.js] Decoder output did not include both decoder state tensors; reusing the previous state for compatibility.")),w.length===0&&!this._warnedMissingDurationLogits&&(this._warnedMissingDurationLogits=!0,console.warn("[Parakeet.js] Decoder output did not include TDT duration logits; defaulting duration step to 0 for compatibility."));let T=0;if(w.length){let I=-1/0;for(let C=0;C<w.length;++C)w[C]>I&&(I=w[C],T=C)}return{tokenLogits:v,step:T,newState:{state1:p||s,state2:h||a},_logitsTensor:d}}_snapshotDecoderState(t){if(!t)return null;let r=t.state1,n=t.state2;return{s1:new Float32Array(r.data),s2:new Float32Array(n.data),dims1:r.dims.slice(),dims2:n.dims.slice()}}_restoreDecoderState(t){if(!t)return null;let r=new this.ort.Tensor("float32",new Float32Array(t.s1),t.dims1),n=new this.ort.Tensor("float32",new Float32Array(t.s2),t.dims2);return{state1:r,state2:n}}async computeFeatures(t,r=16e3,n={}){let{prefixSamples:i=0,_skipAudioValidation:s=!1}=n,a=s?t:py(t,"ParakeetModel.computeFeatures");if(this._incrementalMel&&i>0){let p=this._incrementalMel.process(a,i),h=p.length;return{features:p.features,T:h,melBins:this._nMels,cached:p.cached,cachedFrames:p.cachedFrames,newFrames:p.newFrames}}let{features:u,length:l}=await this.preprocessor.process(a),d=u.length/this._nMels;return{features:u,T:d,melBins:this._nMels,validLength:l}}setPreprocessorBackend(t){if(t==="onnx"){if(!this._onnxPreprocessor)throw new Error("ONNX preprocessor not available. Load model with preprocessorUrl to enable ONNX backend.");this.preprocessor=this._onnxPreprocessor,this._incrementalMel=null,console.log("[Parakeet.js] Switched to ONNX preprocessor")}else if(t==="js")this._jsPreprocessor||(this._jsPreprocessor=new Tt({nMels:128})),this.preprocessor=this._jsPreprocessor,this._incrementalMel=new Er({nMels:this._jsPreprocessor.nMels}),console.log("[Parakeet.js] Switched to JS preprocessor (incremental caching enabled)");else throw new Error(`Unknown preprocessor backend: ${t}. Use 'js' or 'onnx'.`)}getPreprocessorBackend(){return this.preprocessor instanceof Tt?"js":"onnx"}resetMelCache(){this._incrementalMel&&this._incrementalMel.reset()}clearIncrementalCache(){this._incrementalCache.clear()}_disposeDecoderState(t,r=null){t&&(t.state1&&t.state1!==this._combState1&&t.state1!==r?.state1&&t.state1.dispose?.(),t.state2&&t.state2!==this._combState2&&t.state2!==r?.state2&&t.state2.dispose?.())}getFrameTimeStride(){return this.subsampling*this.windowStride}frameToTime(t,r=0){return r+t*this.getFrameTimeStride()}getStreamingConstants(){return{subsampling:this.subsampling,windowStride:this.windowStride,frameTimeStride:this.getFrameTimeStride(),melBins:this._nMels,blankId:this.blankId,maxTokensPerStep:this.maxTokensPerStep}}async transcribe(t,r=16e3,n={}){let{returnTimestamps:i=!1,returnConfidences:s=!1,temperature:a=1,debug:u=!1,enableProfiling:l=!0,skipCMVN:d=!1,frameStride:p=1,previousDecoderState:h=null,returnDecoderState:g=!1,timeOffset:y=0,returnTokenIds:_=!1,returnFrameIndices:b=!1,returnLogProbs:k=!1,returnTdtSteps:v=!1,prefixSamples:w=0,precomputedFeatures:T=null,_skipAudioValidation:S=!1}=n,I=hy(y,"ParakeetModel.transcribe"),C=u||l,A,$=0,B=0,U=0,H=0;C&&(A=performance.now());let W,G,j,z,P,ee=T?"mel-worker":this.getPreprocessorBackend();if(T)W=T.features,G=T.T,j=T.melBins,z={},console.log(`[Parakeet] Preprocessor: mel-worker (precomputed ${G} frames \xD7 ${j} mel bins, 0 ms)`);else if(C){let Y=performance.now();({features:W,T:G,melBins:j,validLength:P,...z}=await this.computeFeatures(t,r,{prefixSamples:w,_skipAudioValidation:S})),$=performance.now()-Y;let pe=z?.cached?` (cached: ${z.cachedFrames} frames, new: ${z.newFrames} frames)`:"";console.log(`[Parakeet] Preprocessor: ${ee}, ${G} frames \xD7 ${j} mel bins, ${$.toFixed(1)} ms${pe}`)}else({features:W,T:G,melBins:j,validLength:P,...z}=await this.computeFeatures(t,r,{prefixSamples:w,_skipAudioValidation:S}));if(!W||!W.length||G<=0||j<=0)return{utterance_text:"",words:[],tokens:[],confidence_scores:{overall_log_prob:null,frame:null,frame_avg:null},metrics:C?{preprocess_ms:+$.toFixed(1),encode_ms:0,decode_ms:0,tokenize_ms:0,total_ms:+(performance.now()-A).toFixed(1),rtf:0}:null,is_final:!n?.incremental};let X=t?t.length/r:G*pa.HOP_LENGTH/r,V=new this.ort.Tensor("float32",W,[1,j,G]),oe=P??G,D=new this.ort.Tensor("int64",BigInt64Array.from([BigInt(oe)]),[1]),F;try{if(C){let Y=performance.now(),pe=await this.encoderSession.run({audio_signal:V,length:D});B=performance.now()-Y,F=pe.outputs??Object.values(pe)[0]}else{let Y=await this.encoderSession.run({audio_signal:V,length:D});F=Y.outputs??Object.values(Y)[0]}}finally{V.dispose?.(),D.dispose?.()}let[,K,re]=F.dims,he;if(F.dims.length===3&&F.dims[0]===1&&F.dims[1]===K&&F.dims[2]===re){he=new Float32Array(re*K);let Y=F.data;for(let pe=0;pe<re;pe++){let Ce=pe*K,ae=0;for(;ae<=K-8;ae+=8){let Ne=ae*re+pe;he[Ce+ae]=Y[Ne],he[Ce+ae+1]=Y[Ne+re],he[Ce+ae+2]=Y[Ne+2*re],he[Ce+ae+3]=Y[Ne+3*re],he[Ce+ae+4]=Y[Ne+4*re],he[Ce+ae+5]=Y[Ne+5*re],he[Ce+ae+6]=Y[Ne+6*re],he[Ce+ae+7]=Y[Ne+7*re]}for(;ae<K;ae++)he[Ce+ae]=Y[ae*re+pe]}}else console.warn("[Parakeet] Unexpected encoder output format:",F.dims),he=new Float32Array(F.data);F.dispose?.(),(!this._encoderFrameBuffer||this._encoderFrameBuffer.length!==K)&&(this._encoderFrameBuffer=new Float32Array(K),this._encoderFrameTensor=new this.ort.Tensor("float32",this._encoderFrameBuffer,[1,K,1]));let Ee=[],Be=[],Fe=[],Se=new Map,$e=0,Pe=[],st=[],Nt=[],Ke=this.subsampling*this.windowStride,ve=0,Jt=I,je=null;h&&(je=this._restoreDecoderState(h),u&&console.log("[Parakeet] Restored decoder state from previous chunk"));let Qe=0,Oe=n.incremental;if(Oe&&Oe.cacheKey){Qe=Math.max(0,Math.min(re,Math.floor(((Oe.prefixSeconds||0)+1e-6)/Ke)));let Y=this._incrementalCache.get(Oe.cacheKey);Y&&Y.prefixFrames===Qe&&Y.D===K&&(ve=Qe,Jt=I+Qe*Ke,je=this._restoreDecoderState(Y.state),u&&console.log(`[Parakeet] Incremental cache hit: skipping ${Qe}/${re} frames (${(Qe/re*100).toFixed(0)}%)`),this._incrementalCache.delete(Oe.cacheKey),this._incrementalCache.set(Oe.cacheKey,Y))}let yt=0,un=C?performance.now():0,wt=ve>0||Qe===0;for(let Y=ve;Y<re;){let pe=Y*K;this._encoderFrameBuffer.set(he.subarray(pe,pe+K));let Ce=Ee.length?Ee[Ee.length-1]:this.blankId,{tokenLogits:ae,step:Ne,newState:at,_logitsTensor:er}=await this._runCombinedStep(this._encoderFrameTensor,Ce,je),fe=-1/0,We=0,tr=ae.length,Te=0;for(;Te<tr%8;Te++)ae[Te]>fe&&(fe=ae[Te],We=Te);for(;Te<tr;Te+=8){let Re=ae[Te],we=ae[Te+1],$t=ae[Te+2],vt=ae[Te+3],Pt=ae[Te+4],Ut=ae[Te+5],Lt=ae[Te+6],Ft=ae[Te+7];Re>fe&&(fe=Re,We=Te),we>fe&&(fe=we,We=Te+1),$t>fe&&(fe=$t,We=Te+2),vt>fe&&(fe=vt,We=Te+3),Pt>fe&&(fe=Pt,We=Te+4),Ut>fe&&(fe=Ut,We=Te+5),Lt>fe&&(fe=Lt,We=Te+6),Ft>fe&&(fe=Ft,We=Te+7)}let ln=fe;a!==1&&(ln=fe/a);let Dt=1,Mr=0;if(s||k){let Re=1/a,we=0,$t=0,vt=0,Pt=0,Ut=0,Lt=0,Ft=0,Or=0,qe=0,Nr=ae.length;for(;qe<=Nr-8;qe+=8){let Wt=(ae[qe]-fe)*Re,dn=(ae[qe+1]-fe)*Re,cn=(ae[qe+2]-fe)*Re,Jn=(ae[qe+3]-fe)*Re,et=(ae[qe+4]-fe)*Re,Rr=(ae[qe+5]-fe)*Re,Br=(ae[qe+6]-fe)*Re,ei=(ae[qe+7]-fe)*Re;we+=Math.exp(Wt),$t+=Math.exp(dn),vt+=Math.exp(cn),Pt+=Math.exp(Jn),Ut+=Math.exp(et),Lt+=Math.exp(Rr),Ft+=Math.exp(Br),Or+=Math.exp(ei)}let $r=we+$t+vt+Pt+Ut+Lt+Ft+Or;for(;qe<Nr;qe++)$r+=Math.exp((ae[qe]-fe)*Re);if(Dt=1/$r,Mr=fe*Re-ln-Math.log($r),s){let Wt=Se.get(Y);Wt?(Wt.sum+=Dt,Wt.count+=1):Se.set(Y,{sum:Dt,count:1}),$e+=Math.log(Dt)}}if(er?.dispose?.(),We!==this.blankId){if(this._disposeDecoderState(je,at),je=at,Ee.push(We),b&&Pe.push(Y),k&&st.push(Mr),v&&Nt.push(Ne),i){let Re=Ne>0?Ne:1,we=Math.min(re,Y+Math.max(1,Re)),$t=Jt+Y*Ke,vt=Jt+we*Ke;Be.push([$t,vt])}s&&Fe.push(Dt),yt+=1}else this._disposeDecoderState(at,je);if(Ne>0?(Y+=Ne,yt=0):(We===this.blankId||yt>=this.maxTokensPerStep)&&(Y+=p,yt=0),Oe&&Oe.cacheKey&&!wt&&Y>=Qe){let Re=this._snapshotDecoderState(je);if(!this._incrementalCache.has(Oe.cacheKey)&&this._incrementalCache.size>=this.maxIncrementalCacheSize){let we=this._incrementalCache.keys().next().value;u&&console.log(`[Parakeet] Incremental cache full (${this.maxIncrementalCacheSize}); evicting oldest entry: ${we}`),this._incrementalCache.delete(we)}this._incrementalCache.has(Oe.cacheKey)&&this._incrementalCache.delete(Oe.cacheKey),this._incrementalCache.set(Oe.cacheKey,{state:Re,prefixFrames:Qe,D:K}),wt=!0}}C&&(U=performance.now()-un);let Cr;C&&(Cr=performance.now());let zr=this._normalizer(this.tokenizer.decode(Ee));if(C&&(H=performance.now()-Cr),!i&&!s){if(C){let Ce=performance.now()-A,ae=X/(Ce/1e3);console.log(`[Perf] RTF: ${ae.toFixed(2)}x (audio ${X.toFixed(2)} s, time ${(Ce/1e3).toFixed(2)} s)`),console.table({Preprocess:`${$.toFixed(1)} ms`,Encode:`${B.toFixed(1)} ms`,Decode:`${U.toFixed(1)} ms`,Tokenize:`${H.toFixed(1)} ms`,Total:`${Ce.toFixed(1)} ms`})}let Y=C?{preprocess_ms:+$.toFixed(1),encode_ms:+B.toFixed(1),decode_ms:+U.toFixed(1),tokenize_ms:+H.toFixed(1),total_ms:+(performance.now()-A).toFixed(1),rtf:+(X/((performance.now()-A)/1e3)).toFixed(2),preprocessor_backend:ee,mel_cache:z?.cached?{cached_frames:z.cachedFrames,new_frames:z.newFrames}:null}:null,pe={utterance_text:zr,words:[],metrics:Y,is_final:!h};return g&&(pe.decoderState=this._snapshotDecoderState(je)),_&&(pe.tokenIds=Ee.slice()),b&&(pe.frameIndices=Pe.slice()),k&&(pe.logProbs=st.slice()),v&&(pe.tdtSteps=Nt.slice()),this._disposeDecoderState(je,h),pe}let bt=[],Rt=[],Ve="",Ar=0,It=0,Xe=[];if(Ee.forEach((Y,pe)=>{let Ce=this.tokenizer.id2token[Y];if(Ce===this.tokenizer.blankToken)return;let ae=Ce.startsWith("\u2581"),Ne=ae?Ce.slice(1):Ce,at=Be[pe]||[null,null],er=Fe[pe],fe={token:Ne,raw_token:Ce,is_word_start:ae};if(i&&(fe.start_time=+at[0].toFixed(3),fe.end_time=+at[1].toFixed(3)),s&&(fe.confidence=+er.toFixed(4)),Rt.push(fe),ae){if(Ve){let We=Xe.length?Xe.reduce((tr,Te)=>tr+Te,0)/Xe.length:0;bt.push({text:Ve,start_time:+Ar.toFixed(3),end_time:+It.toFixed(3),confidence:+We.toFixed(4)})}Ve=Ne,i&&(Ar=at[0],It=at[1]),Xe=s?[er]:[]}else Ve+=Ne,i&&(It=at[1]),s&&Xe.push(er)}),Ve){let Y=Xe.length?Xe.reduce((pe,Ce)=>pe+Ce,0)/Xe.length:0;bt.push({text:Ve,start_time:+Ar.toFixed(3),end_time:+It.toFixed(3),confidence:+Y.toFixed(4)})}let Yn=bt.length&&s?bt.reduce((Y,pe)=>Y+pe.confidence,0)/bt.length:null,Bt=Rt.length&&s?Rt.reduce((Y,pe)=>Y+(pe.confidence||0),0)/Rt.length:null;if(C){let Y=performance.now()-A,pe=X/(Y/1e3);console.log(`[Perf] RTF: ${pe.toFixed(2)}x (audio ${X.toFixed(2)} s, time ${(Y/1e3).toFixed(2)} s)`),console.table({Preprocess:`${$.toFixed(1)} ms`,Encode:`${B.toFixed(1)} ms`,Decode:`${U.toFixed(1)} ms`,Tokenize:`${H.toFixed(1)} ms`,Total:`${Y.toFixed(1)} ms`})}let br=Array.from(Se.entries()).sort((Y,pe)=>Y[0]-pe[0]).map(([,Y])=>Y.sum/Y.count),Et={utterance_text:zr,words:bt,tokens:Rt,confidence_scores:s?{token:Fe.map(Y=>+Y.toFixed(4)),token_avg:+Bt?.toFixed(4),word:bt.map(Y=>Y.confidence),word_avg:+Yn?.toFixed(4),frame:br.map(Y=>+Y.toFixed(4)),frame_avg:br.length?+(br.reduce((Y,pe)=>Y+pe,0)/br.length).toFixed(4):null,overall_log_prob:+$e.toFixed(6)}:{overall_log_prob:null,frame:null,frame_avg:null},metrics:C?{preprocess_ms:+$.toFixed(1),encode_ms:+B.toFixed(1),decode_ms:+U.toFixed(1),tokenize_ms:+H.toFixed(1),total_ms:+(performance.now()-A).toFixed(1),rtf:+(X/((performance.now()-A)/1e3)).toFixed(2),preprocessor_backend:ee,mel_cache:z?.cached?{cached_frames:z.cachedFrames,new_frames:z.newFrames}:null}:null,is_final:!Oe&&!h};return g&&(Et.decoderState=this._snapshotDecoderState(je)),_&&(Et.tokenIds=Ee.slice()),b&&(Et.frameIndices=Pe.slice()),k&&(Et.logProbs=st.map(Y=>+Y.toFixed(6))),v&&(Et.tdtSteps=Nt.slice()),this._disposeDecoderState(je,h),Et}createStreamingTranscriber(t={}){return new Xn(this,t)}async transcribeLongAudio(t,r=16e3,n={}){return _m(this,t,r,n)}endProfiling(){try{this.encoderSession?.endProfiling()}catch{}try{this.joinerSession?.endProfiling()}catch{}let t=this.ort?.env?.wasm?.FS;if(!t)return console.warn("[Parakeet] Profiling FS not accessible"),null;let r=t.readdir("/tmp").filter(i=>i.startsWith("profile_")&&i.endsWith(".json"));if(!r.length)return console.warn("[Parakeet] No profiling files found. Was profiling enabled?"),null;let n={};for(let i of r)try{let s=t.readFile("/tmp/"+i,{encoding:"utf8"}),a=JSON.parse(s),u=0,l=0;for(let d of a)if(d.cat==="Node"){let p=d.args?.provider;p==="webgpu"?u+=d.dur:p&&(l+=d.dur)}n[i]={gpu_us:u,cpu_us:l,total_us:u+l}}catch(s){console.warn("[Parakeet] Failed to parse profile file",i,s)}return console.table(n),n}},Xn=class{constructor(t,r={}){this.model=t,this.opts={returnTimestamps:r.returnTimestamps??!0,returnConfidences:r.returnConfidences??!1,returnTokenIds:r.returnTokenIds??!1,sampleRate:r.sampleRate??16e3,debug:r.debug??!1},this._decoderState=null,this._currentOffset=0,this._totalWords=[],this._totalTokenIds=[],this._chunkCount=0,this._isFinalized=!1,this._metrics={preprocess_ms:0,encode_ms:0,decode_ms:0,tokenize_ms:0,total_ms:0,cached_frames:0,new_frames:0},this._hasMetrics=!1,this._hasMelCacheMetrics=!1}_accumulateMetrics(t){if(!(!t||typeof t!="object")){this._hasMetrics=!0;for(let r of["preprocess_ms","encode_ms","decode_ms","tokenize_ms","total_ms"])typeof t[r]=="number"&&Number.isFinite(t[r])&&(this._metrics[r]+=t[r]);t.mel_cache&&typeof t.mel_cache=="object"&&(this._hasMelCacheMetrics=!0,typeof t.mel_cache.cached_frames=="number"&&Number.isFinite(t.mel_cache.cached_frames)&&(this._metrics.cached_frames+=t.mel_cache.cached_frames),typeof t.mel_cache.new_frames=="number"&&Number.isFinite(t.mel_cache.new_frames)&&(this._metrics.new_frames+=t.mel_cache.new_frames))}}_getCumulativeMetrics(){if(!this._hasMetrics)return null;let t=this._metrics.total_ms>0?this._metrics.total_ms:this._metrics.preprocess_ms+this._metrics.encode_ms+this._metrics.decode_ms+this._metrics.tokenize_ms,r={preprocess_ms:this._metrics.preprocess_ms,encode_ms:this._metrics.encode_ms,decode_ms:this._metrics.decode_ms,tokenize_ms:this._metrics.tokenize_ms,total_ms:t,rtf:t>0?this._currentOffset/(t/1e3):0};return this._hasMelCacheMetrics&&(r.mel_cache={cached_frames:this._metrics.cached_frames,new_frames:this._metrics.new_frames}),r}async processChunk(t){if(this._isFinalized)throw new Error("Streamer is finalized. Create a new instance to process more audio.");let r=t.length/this.opts.sampleRate,n=await this.model.transcribe(t,this.opts.sampleRate,{returnTimestamps:this.opts.returnTimestamps,returnConfidences:this.opts.returnConfidences,returnTokenIds:this.opts.returnTokenIds,previousDecoderState:this._decoderState,returnDecoderState:!0,timeOffset:this._currentOffset});return this._decoderState=n.decoderState,this._currentOffset+=r,this._chunkCount++,this._accumulateMetrics(n.metrics),n.words&&n.words.length>0&&this._totalWords.push(...n.words),this.opts.returnTokenIds&&n.tokenIds&&this._totalTokenIds.push(...n.tokenIds),this.opts.debug&&console.log(`[Streamer] Chunk ${this._chunkCount}: "${n.utterance_text}" (${n.words?.length||0} words, offset: ${this._currentOffset.toFixed(2)}s)`),{chunkText:n.utterance_text,chunkWords:n.words||[],text:this._totalWords.map(i=>i.text).join(" "),words:this._totalWords.slice(),totalDuration:this._currentOffset,chunkCount:this._chunkCount,is_final:!1,...this.opts.returnTokenIds?{tokenIds:this._totalTokenIds.slice()}:{},...this.opts.returnConfidences&&n.confidence_scores?{confidence_scores:n.confidence_scores}:{},metrics:this._getCumulativeMetrics()}}finalize(){return this._isFinalized=!0,{text:this._totalWords.map(t=>t.text).join(" "),words:this._totalWords.slice(),totalDuration:this._currentOffset,chunkCount:this._chunkCount,is_final:!0,...this.opts.returnTokenIds?{tokenIds:this._totalTokenIds.slice()}:{},metrics:this._getCumulativeMetrics()}}reset(){this._decoderState=null,this._currentOffset=0,this._totalWords=[],this._totalTokenIds=[],this._chunkCount=0,this._isFinalized=!1,this._metrics={preprocess_ms:0,encode_ms:0,decode_ms:0,tokenize_ms:0,total_ms:0,cached_frames:0,new_frames:0},this._hasMetrics=!1,this._hasMelCacheMetrics=!1}getState(){return{hasDecoderState:this._decoderState!==null,currentOffset:this._currentOffset,wordCount:this._totalWords.length,chunkCount:this._chunkCount,isFinalized:this._isFinalized}}};async function ym(e){return an.fromUrls(e)}var _y="https://huggingface.co/Discourse/parakeet-tdt-0.6b-v3-onnx/resolve/main",Zn=16e3,yy="resenha-stt-model",wy=.4,on=null,wm=Promise.resolve();async function by(e,t){let r=await caches.open(yy).catch(()=>null),n=r?await r.match(e):null;if(!n){let i=await fetch(e);if(!i.ok)throw new Error(`${t} fetch failed: ${i.status}`);let s=Number(i.headers.get("content-length"))||0,[a,u]=i.body.tee(),l=r?r.put(e,new Response(u)).then(()=>!0).catch(()=>!1):Promise.resolve(!1),d=a.getReader(),p=[],h=0;for(;;){let{done:g,value:y}=await d.read();if(g)break;h+=y.length,r||p.push(y),self.postMessage({type:"progress",loaded:h,total:s,file:t})}r?(await l&&(n=await r.match(e)),n??=await fetch(e)):n=new Response(new Blob(p))}return URL.createObjectURL(await n.blob())}self.onmessage=e=>{let t=e.data;t?.type==="init"?$y(t.config):t?.type==="transcribe"&&vy(t)};async function $y(e){try{if(!navigator.gpu)throw new Error("WebGPU is not available in this browser");ke.wasm.wasmPaths={mjs:e.ortWasmJsUrl,wasm:e.ortWasmBinaryUrl};let t={backend:e.backend||"webgpu",encoderQuant:e.encoderQuant||"fp32",decoderQuant:e.decoderQuant||"int8",cpuThreads:1,progress:({loaded:i,total:s,file:a})=>self.postMessage({type:"progress",loaded:i,total:s,file:a})},r=(e.modelBaseUrl||_y).replace(/\/$/,""),n=i=>by(`${r}/${i}`,i);on=await ym({...t,encoderUrl:await n("encoder-model.onnx"),encoderDataUrl:await n("encoder-model.onnx.data"),decoderUrl:await n("decoder_joint-model.int8.onnx"),tokenizerUrl:await n("vocab.txt"),filenames:{encoder:"encoder-model.onnx"},preprocessorBackend:"js"}),await on.transcribe(new Float32Array(Zn),Zn),self.postMessage({type:"ready"})}catch(t){on=null,self.postMessage({type:"error",message:String(t?.message||t)})}}function vy({jobId:e,roomId:t,userId:r,pcm:n}){let i=new Float32Array(n);!on||i.length<Zn*wy||(wm=wm.then(async()=>{let s=await on.transcribe(i,Zn),a=s?.utterance_text??s?.text??"";console.debug("[resenha] stt result",JSON.stringify({text:a,samples:i.length,metrics:s?.metrics})),self.postMessage({type:"caption",jobId:e,roomId:t,userId:r,text:a})}).catch(s=>{self.postMessage({type:"job-error",jobId:e,roomId:t,userId:r,message:String(s?.message||s)})}))}})();
/*! Bundled license information:

onnxruntime-web/dist/ort.bundle.min.mjs:
  (*!
   * ONNX Runtime Web v1.24.1
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
  (**
   * @license
   * Copyright 2021 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2020 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
  (**
   * @license
   * Copyright 2019 Google LLC. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =============================================================================
   *)
*/
