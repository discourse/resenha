var Ih=Object.create;var ac=Object.defineProperty;var zh=Object.getOwnPropertyDescriptor;var Ch=Object.getOwnPropertyNames;var Ah=Object.getPrototypeOf,Oh=Object.prototype.hasOwnProperty;var ct=(P=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(P,{get:(L,U)=>(typeof require<"u"?require:L)[U]}):P)(function(P){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+P+'" is not supported')});var tt=(P,L)=>()=>{try{return L||P((L={exports:{}}).exports,L),L.exports}catch(U){throw L=0,U}};var Rh=(P,L,U,H)=>{if(L&&typeof L=="object"||typeof L=="function")for(let Z of Ch(L))!Oh.call(P,Z)&&Z!==U&&ac(P,Z,{get:()=>L[Z],enumerable:!(H=zh(L,Z))||H.enumerable});return P};var Bh=(P,L,U)=>(U=P!=null?Ih(Ah(P)):{},Rh(L||!P||!P.__esModule?ac(U,"default",{value:P,enumerable:!0}):U,P));var dn=tt(Ba=>{"use strict";Object.defineProperty(Ba,"__esModule",{value:!0});Ba.baseAssetPath=void 0;var Mh=typeof window<"u"&&typeof window.document<"u",sc=Mh?window.document.currentScript:null,nc="/";sc&&(nc=sc.src.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^/]+$/,"/"));Ba.baseAssetPath=nc});var Da=tt(Ma=>{"use strict";Object.defineProperty(Ma,"__esModule",{value:!0});Ma.defaultModelFetcher=void 0;var Dh=P=>fetch(P).then(L=>L.arrayBuffer());Ma.defaultModelFetcher=Dh});var di=tt(Pa=>{"use strict";Object.defineProperty(Pa,"__esModule",{value:!0});Pa.log=void 0;var pn=P=>L=>{console.log(`VAD | ${P} >`,L)};Pa.log={error:pn("error"),debug:pn("debug"),warn:pn("warn")}});var ca=tt(Ua=>{"use strict";Object.defineProperty(Ua,"__esModule",{value:!0});Ua.Message=void 0;var oc;(function(P){P.AudioFrame="AUDIO_FRAME",P.SpeechStart="SPEECH_START",P.VADMisfire="VAD_MISFIRE",P.SpeechEnd="SPEECH_END",P.SpeechStop="SPEECH_STOP",P.SpeechRealStart="SPEECH_REAL_START",P.FrameProcessed="FRAME_PROCESSED"})(oc||(Ua.Message=oc={}))});var Na=tt(sr=>{"use strict";Object.defineProperty(sr,"__esModule",{value:!0});sr.FrameProcessor=sr.validateOptions=sr.defaultFrameProcessorOptions=void 0;var ha=di(),Vr=ca();sr.defaultFrameProcessorOptions={positiveSpeechThreshold:.3,negativeSpeechThreshold:.25,preSpeechPadMs:800,redemptionMs:1400,minSpeechMs:400,submitUserSpeechOnPause:!1};function Ph(P){(P.positiveSpeechThreshold<0||P.positiveSpeechThreshold>1)&&ha.log.error("positiveSpeechThreshold should be a number between 0 and 1"),(P.negativeSpeechThreshold<0||P.negativeSpeechThreshold>P.positiveSpeechThreshold)&&ha.log.error("negativeSpeechThreshold should be between 0 and positiveSpeechThreshold"),P.preSpeechPadMs<0&&ha.log.error("preSpeechPadMs should be positive"),P.redemptionMs<0&&ha.log.error("redemptionMs should be positive"),P.minSpeechMs<0&&ha.log.error("minSpeechMs should be positive")}sr.validateOptions=Ph;var uc=P=>{let L=P.reduce((H,Z)=>(H.push(H.at(-1)+Z.length),H),[0]),U=new Float32Array(L.at(-1));return P.forEach((H,Z)=>{let C=L[Z];U.set(H,C)}),U};function lc(P,L){let U=Math.floor(P.redemptionMs/L),H=Math.floor(P.preSpeechPadMs/L),Z=Math.floor(P.minSpeechMs/L);return{redemptionFrames:U,preSpeechPadFrames:H,minSpeechFrames:Z}}var cn=class{constructor(L,U,H,Z){this.modelProcessFunc=L,this.modelResetFunc=U,this.options=H,this.msPerFrame=Z,this.speaking=!1,this.redemptionCounter=0,this.speechFrameCount=0,this.active=!1,this.speechRealStartFired=!1,this.setOptions=J=>{this.options={...this.options,...J};let{redemptionFrames:ge,preSpeechPadFrames:Se,minSpeechFrames:Ee}=lc(this.options,this.msPerFrame);this.redemptionFrames=ge,this.preSpeechPadFrames=Se,this.minSpeechFrames=Ee},this.reset=()=>{this.speaking=!1,this.speechRealStartFired=!1,this.audioBuffer=[],this.modelResetFunc(),this.redemptionCounter=0,this.speechFrameCount=0},this.pause=J=>{this.active=!1,this.options.submitUserSpeechOnPause?this.endSegment(J):this.reset()},this.resume=()=>{this.active=!0},this.endSegment=J=>{let ge=this.audioBuffer;this.audioBuffer=[];let Se=this.speaking;if(this.reset(),Se)if(ge.reduce((rt,_t)=>_t.isSpeech?rt+1:rt,0)>=this.minSpeechFrames){let rt=uc(ge.map(_t=>_t.frame));J({msg:Vr.Message.SpeechEnd,audio:rt})}else J({msg:Vr.Message.VADMisfire});return{}},this.process=async(J,ge)=>{if(!this.active)return;let Se=await this.modelProcessFunc(J),Ee=Se.isSpeech>=this.options.positiveSpeechThreshold;if(ge({probs:Se,msg:Vr.Message.FrameProcessed,frame:J}),this.audioBuffer.push({frame:J,isSpeech:Ee}),Ee&&(this.speechFrameCount++,this.redemptionCounter=0),Ee&&!this.speaking&&(this.speaking=!0,ge({msg:Vr.Message.SpeechStart})),this.speaking&&this.speechFrameCount===this.minSpeechFrames&&!this.speechRealStartFired&&(this.speechRealStartFired=!0,ge({msg:Vr.Message.SpeechRealStart})),Se.isSpeech<this.options.negativeSpeechThreshold&&this.speaking&&++this.redemptionCounter>=this.redemptionFrames){this.redemptionCounter=0,this.speechFrameCount=0,this.speaking=!1,this.speechRealStartFired=!1;let rt=this.audioBuffer;if(this.audioBuffer=[],rt.reduce((ze,xt)=>xt.isSpeech?ze+1:ze,0)>=this.minSpeechFrames){let ze=uc(rt.map(xt=>xt.frame));ge({msg:Vr.Message.SpeechEnd,audio:ze})}else ge({msg:Vr.Message.VADMisfire})}if(!this.speaking){for(;this.audioBuffer.length>this.preSpeechPadFrames;)this.audioBuffer.shift();this.speechFrameCount=0}},this.audioBuffer=[];let{redemptionFrames:C,preSpeechPadFrames:le,minSpeechFrames:be}=lc(this.options,this.msPerFrame);this.redemptionFrames=C,this.preSpeechPadFrames=le,this.minSpeechFrames=be,this.reset()}};sr.FrameProcessor=cn});var hc=tt((cc,hn)=>{"use strict";var Uh=(()=>{var P=Object.defineProperty,L=Object.getOwnPropertyDescriptor,U=Object.getOwnPropertyNames,H=Object.prototype.hasOwnProperty,Z=(e=>typeof ct<"u"?ct:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof ct<"u"?ct:t)[r]}):e)(function(e){if(typeof ct<"u")return ct.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),C=(e,t)=>()=>(e&&(t=e(e=0)),t),le=(e,t)=>{for(var r in t)P(e,r,{get:t[r],enumerable:!0})},be=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of U(t))!H.call(e,a)&&a!==r&&P(e,a,{get:()=>t[a],enumerable:!(i=L(t,a))||i.enumerable});return e},J=e=>be(P({},"__esModule",{value:!0}),e),ge,Se,Ee,rt,_t,ze=C(()=>{"use strict";ge=new Map,Se=[],Ee=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=ge.get(e);if(i===void 0)ge.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=Se.indexOf(e);a!==-1&&Se.splice(a,1);for(let s=0;s<Se.length;s++)if(ge.get(Se[s]).priority<=r){Se.splice(s,0,e);return}Se.push(e)}return}throw new TypeError("not a valid backend")},rt=async e=>{let t=ge.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},_t=async e=>{let t=e.executionProviders||[],r=t.map(u=>typeof u=="string"?u:u.name),i=r.length===0?Se:r,a,s=[],n=new Set;for(let u of i){let l=await rt(u);typeof l=="string"?s.push({name:u,err:l}):(a||(a=l),a===l&&n.add(u))}if(!a)throw new Error(`no available backend found. ERR: ${s.map(u=>`[${u.name}] ${u.err}`).join(", ")}`);for(let{name:u,err:l}of s)r.includes(u)&&console.warn(`removing requested execution provider "${u}" from session options because it is not available: ${l}`);let o=t.filter(u=>n.has(typeof u=="string"?u:u.name));return[a,new Proxy(e,{get:(u,l)=>l==="executionProviders"?o:Reflect.get(u,l)})]}}),xt=C(()=>{"use strict";ze()}),nr,Gr=C(()=>{"use strict";nr="1.27.0"}),or,Te,pi=C(()=>{"use strict";Gr(),or="warning",Te={wasm:{},webgl:{},webgpu:{},versions:{common:nr},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);or=e}},get logLevel(){return or}},Object.defineProperty(Te,"logLevel",{enumerable:!0})}),de,ja=C(()=>{"use strict";pi(),de=Te}),ci,hi,Ha=C(()=>{"use strict";ci=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,s;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],s=e.dims[3]):(a=e.dims[3],s=e.dims[2]);let n=t?.format!==void 0?t.format:"RGB",o=t?.norm,u,l;o===void 0||o.mean===void 0?u=[255,255,255,255]:typeof o.mean=="number"?u=[o.mean,o.mean,o.mean,o.mean]:(u=[o.mean[0],o.mean[1],o.mean[2],0],o.mean[3]!==void 0&&(u[3]=o.mean[3])),o===void 0||o.bias===void 0?l=[0,0,0,0]:typeof o.bias=="number"?l=[o.bias,o.bias,o.bias,o.bias]:(l=[o.bias[0],o.bias[1],o.bias[2],0],o.bias[3]!==void 0&&(l[3]=o.bias[3]));let p=s*a,d=0,h=p,m=p*2,f=-1;n==="RGBA"?(d=0,h=p,m=p*2,f=p*3):n==="RGB"?(d=0,h=p,m=p*2):n==="RBG"&&(d=0,m=p,h=p*2);for(let _=0;_<s;_++)for(let $=0;$<a;$++){let w=(e.data[d++]-l[0])*u[0],y=(e.data[h++]-l[1])*u[1],x=(e.data[m++]-l[2])*u[2],v=f===-1?255:(e.data[f++]-l[3])*u[3];i.fillStyle="rgba("+w+","+y+","+x+","+v+")",i.fillRect($,_,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},hi=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,s,n;t?.tensorLayout!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],s=e.dims[1],n=e.dims[3]):(a=e.dims[3],s=e.dims[2],n=e.dims[1]);let o=t!==void 0&&t.format!==void 0?t.format:"RGB",u=t?.norm,l,p;u===void 0||u.mean===void 0?l=[255,255,255,255]:typeof u.mean=="number"?l=[u.mean,u.mean,u.mean,u.mean]:(l=[u.mean[0],u.mean[1],u.mean[2],255],u.mean[3]!==void 0&&(l[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let d=s*a;if(t!==void 0&&(t.format!==void 0&&n===4&&t.format!=="RGBA"||n===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let h=4,m=0,f=1,_=2,$=3,w=0,y=d,x=d*2,v=-1;o==="RGBA"?(w=0,y=d,x=d*2,v=d*3):o==="RGB"?(w=0,y=d,x=d*2):o==="RBG"&&(w=0,x=d,y=d*2),i=r.createImageData(a,s);for(let E=0;E<s*a;m+=h,f+=h,_+=h,$+=h,E++)i.data[m]=(e.data[w++]-p[0])*l[0],i.data[f]=(e.data[y++]-p[1])*l[1],i.data[_]=(e.data[x++]-p[2])*l[2],i.data[$]=v===-1?255:(e.data[v++]-p[3])*l[3]}else throw new Error("Can not access image data");return i}}),Wt,fi,mi,gi,yi,_i,Ka=C(()=>{"use strict";lr(),Wt=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},s,n;typeof a.mean=="number"?s=[a.mean,a.mean,a.mean,a.mean]:s=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?n=[a.bias,a.bias,a.bias,a.bias]:n=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let o=t.format!==void 0?t.format:"RGBA",u=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",l=r*i,p=u==="RGBA"?new Float32Array(l*4):new Float32Array(l*3),d=4,h=0,m=1,f=2,_=3,$=0,w=l,y=l*2,x=-1;o==="RGB"&&(d=3,h=0,m=1,f=2,_=-1),u==="RGBA"?x=l*3:u==="RBG"?($=0,y=l,w=l*2):u==="BGR"&&(y=0,w=l,$=l*2);for(let v=0;v<l;v++,h+=d,f+=d,m+=d,_+=d)p[$++]=(e[h]+n[0])/s[0],p[w++]=(e[m]+n[1])/s[1],p[y++]=(e[f]+n[2])/s[2],x!==-1&&_!==-1&&(p[x++]=(e[_]+n[3])/s[3]);return u==="RGBA"?new Oe("float32",p,[1,4,r,i]):new Oe("float32",p,[1,3,r,i])},fi=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,s=typeof e=="string",n,o=t??{},u=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},l=p=>typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||p instanceof OffscreenCanvas?p.getContext("2d"):null;if(r){let p=u();p.width=e.width,p.height=e.height;let d=l(p);if(d!=null){let h=e.height,m=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(h=t.resizedHeight,m=t.resizedWidth),t!==void 0){if(o=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");o.tensorFormat="RGBA",o.height=h,o.width=m}else o.tensorFormat="RGBA",o.height=h,o.width=m;d.drawImage(e,0,0),n=d.getImageData(0,0,m,h).data}else throw new Error("Can not access image data")}else if(i){let p,d;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(p=t.resizedHeight,d=t.resizedWidth):(p=e.height,d=e.width),t!==void 0&&(o=t),o.format="RGBA",o.height=p,o.width=d,t!==void 0){let h=u();h.width=d,h.height=p;let m=l(h);if(m!=null)m.putImageData(e,0,0),n=m.getImageData(0,0,d,p).data;else throw new Error("Can not access image data")}else n=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let p=u();p.width=e.width,p.height=e.height;let d=l(p);if(d!=null){let h=e.height,m=e.width;return d.drawImage(e,0,0,m,h),n=d.getImageData(0,0,m,h).data,o.height=h,o.width=m,Wt(n,o)}else throw new Error("Can not access image data")}else{if(s)return new Promise((p,d)=>{let h=u(),m=l(h);if(!e||!m)return d();let f=new Image;f.crossOrigin="Anonymous",f.src=e,f.onload=()=>{h.width=f.width,h.height=f.height,m.drawImage(f,0,0,h.width,h.height);let _=m.getImageData(0,0,h.width,h.height);o.height=h.height,o.width=h.width,p(Wt(_.data,o))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(n!==void 0)return Wt(n,o);throw new Error("Input data provided is not supported - aborted tensor creation")},mi=(e,t)=>{let{width:r,height:i,download:a,dispose:s}=t,n=[1,i,r,4];return new Oe({location:"texture",type:"float32",texture:e,dims:n,download:a,dispose:s})},gi=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:s}=t;return new Oe({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:s})},yi=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:s}=t;return new Oe({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:s})},_i=(e,t,r)=>new Oe({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),it,St,ur,wi,Za=C(()=>{"use strict";it=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),St=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),ur=!1,wi=()=>{if(!ur){ur=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(it.set("int64",BigInt64Array),St.set(BigInt64Array,"int64")),t&&(it.set("uint64",BigUint64Array),St.set(BigUint64Array,"uint64")),i?(it.set("float16",r),St.set(r,"float16")):it.set("float16",Uint16Array)}}}),bi,$i,Qa=C(()=>{"use strict";lr(),bi=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},$i=(e,t)=>{switch(e.location){case"cpu":return new Oe(e.type,e.data,t);case"cpu-pinned":return new Oe({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Oe({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Oe({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Oe({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Oe,lr=C(()=>{"use strict";Ha(),Ka(),Za(),Qa(),Oe=class{constructor(e,t,r){wi();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let n=it.get(i);if(!n)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof n))throw new TypeError(`buffer should be of type ${n.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let n,o;if(typeof e=="string")if(i=e,o=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");n=t}else{let u=it.get(e);if(u===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&u===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${u.name} as data.`);e==="uint64"||e==="int64"?n=u.from(t,BigInt):n=u.from(t)}else if(t instanceof u)n=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")n=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&u!==Uint16Array)n=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${u}`)}else if(o=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let u=typeof e[0];if(u==="string")i="string",n=e;else if(u==="boolean")i="bool",n=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${u}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",n=Uint8Array.from(e);else{let u=St.get(e.constructor);if(u===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=u,n=e}if(o===void 0)o=[n.length];else if(!Array.isArray(o))throw new TypeError("A tensor's dims must be a number array");a=o,this.cpuData=n,this.dataLocation="cpu"}let s=bi(a);if(this.cpuData&&s!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(s/2)===this.cpuData.length))throw new Error(`Tensor's size(${s}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=s}static async fromImage(e,t){return fi(e,t)}static fromTexture(e,t){return mi(e,t)}static fromGpuBuffer(e,t){return gi(e,t)}static fromMLTensor(e,t){return yi(e,t)}static fromPinnedBuffer(e,t,r){return _i(e,t,r)}toDataURL(e){return ci(this,e)}toImageData(e){return hi(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return $i(this,e)}}}),Me,vi=C(()=>{"use strict";lr(),Me=Oe}),Pt,dr,je,Fe,Xe,Ye,xi=C(()=>{"use strict";pi(),Pt=(e,t)=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||console.timeStamp(`${e}::ORT::${t}`)},dr=(e,t)=>{let r=new Error().stack?.split(/\r\n|\r|\n/g)||[],i=!1;for(let a=0;a<r.length;a++){if(i&&!r[a].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[a].trim().split(" ")[1]}`;t&&(s+=`::${t}`),Pt("CPU",s);return}r[a].includes("TRACE_FUNC")&&(i=!0)}},je=e=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||dr("BEGIN",e)},Fe=e=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||dr("END",e)},Xe=e=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||console.time(`ORT::${e}`)},Ye=e=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||console.timeEnd(`ORT::${e}`)}}),Si,Xa=C(()=>{"use strict";ze(),vi(),xi(),Si=class dc{constructor(t){this.handler=t}async run(t,r,i){je(),Xe("InferenceSession.run");let a={},s={};if(typeof t!="object"||t===null||t instanceof Me||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let n=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Me)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");n=!1;for(let l of r){if(typeof l!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(l)===-1)throw new RangeError(`'fetches' contains invalid output name: ${l}.`);a[l]=null}if(typeof i=="object"&&i!==null)s=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let l=!1,p=Object.getOwnPropertyNames(r);for(let d of this.outputNames)if(p.indexOf(d)!==-1){let h=r[d];(h===null||h instanceof Me)&&(l=!0,n=!1,a[d]=h)}if(l){if(typeof i=="object"&&i!==null)s=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else s=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let l of this.inputNames)if(typeof t[l]>"u")throw new Error(`input '${l}' is missing in 'feeds'.`);if(n)for(let l of this.outputNames)a[l]=null;let o=await this.handler.run(t,a,s),u={};for(let l in o)if(Object.hasOwnProperty.call(o,l)){let p=o[l];p instanceof Me?u[l]=p:u[l]=new Me(p.type,p.data,p.dims)}return Ye("InferenceSession.run"),Fe(),u}async release(){return this.handler.dispose()}static async create(t,r,i,a){je(),Xe("InferenceSession.create");let s,n={};if(typeof t=="string"){if(s=t,typeof r=="object"&&r!==null)n=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(s=t,typeof r=="object"&&r!==null)n=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let p=t,d=0,h=t.byteLength;if(typeof r=="object"&&r!==null)n=r;else if(typeof r=="number"){if(d=r,!Number.isSafeInteger(d))throw new RangeError("'byteOffset' must be an integer.");if(d<0||d>=p.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${p.byteLength}).`);if(h=t.byteLength-d,typeof i=="number"){if(h=i,!Number.isSafeInteger(h))throw new RangeError("'byteLength' must be an integer.");if(h<=0||d+h>p.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${p.byteLength-d}].`);if(typeof a=="object"&&a!==null)n=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");s=new Uint8Array(p,d,h)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[o,u]=await _t(n),l=await o.createInferenceSessionHandler(s,u);return Ye("InferenceSession.create"),Fe(),new dc(l)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),pr,Ya=C(()=>{"use strict";Xa(),pr=Si}),Ja=C(()=>{"use strict"}),es=C(()=>{"use strict"}),ts=C(()=>{"use strict"}),rs=C(()=>{"use strict"}),Ti={};le(Ti,{InferenceSession:()=>pr,TRACE:()=>Pt,TRACE_EVENT_BEGIN:()=>Xe,TRACE_EVENT_END:()=>Ye,TRACE_FUNC_BEGIN:()=>je,TRACE_FUNC_END:()=>Fe,Tensor:()=>Me,env:()=>de,registerBackend:()=>Ee});var Ge=C(()=>{"use strict";xt(),ja(),Ya(),vi(),Ja(),es(),xi(),ts(),rs()}),cr=C(()=>{"use strict"}),Ei={};le(Ei,{default:()=>ki});var hr,fr,ki,is=C(()=>{"use strict";Fp(),nt(),wr(),hr="ort-wasm-proxy-worker",fr=globalThis.self?.name===hr,fr&&(self.onmessage=e=>{let{type:t,in:r}=e.data;try{switch(t){case"init-wasm":vr(r.wasm).then(()=>{Qs(r).then(()=>{postMessage({type:t})},i=>{postMessage({type:t,err:i})})},i=>{postMessage({type:t,err:i})});break;case"init-ep":{let{epName:i,env:a}=r;Xs(a,i).then(()=>{postMessage({type:t})},s=>{postMessage({type:t,err:s})});break}case"copy-from":{let{buffer:i}=r,a=Aa(i);postMessage({type:t,out:a});break}case"create":{let{model:i,options:a}=r;Js(i,a).then(s=>{postMessage({type:t,out:s})},s=>{postMessage({type:t,err:s})});break}case"release":en(r),postMessage({type:t});break;case"run":{let{sessionId:i,inputIndices:a,inputs:s,outputIndices:n,options:o}=r;rn(i,a,s,n,new Array(n.length).fill(null),o).then(u=>{u.some(l=>l[3]!=="cpu")?postMessage({type:t,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:t,out:u},sn([...s,...u]))},u=>{postMessage({type:t,err:u})});break}case"end-profiling":an(r),postMessage({type:t});break;default:}}catch(i){postMessage({type:t,err:i})}}),ki=fr?null:e=>new Worker(e??Re,{type:"classic",name:hr})}),Ii,zi,Re,mr,jt,Ci,Ai,gr,Oi,yr,Ri,_r,Bi,wr=C(()=>{"use strict";cr(),Ii=typeof location>"u"?void 0:location.origin,zi=()=>typeof document<"u"?document.currentScript?.src:typeof self<"u"?self.location?.href:void 0,Re=zi(),mr=()=>{if(Re&&!Re.startsWith("blob:"))return Re.substring(0,Re.lastIndexOf("/")+1)},jt=(e,t)=>{try{let r=t??Re;return(r?new URL(e,r):new URL(e)).origin===Ii}catch{return!1}},Ci=(e,t)=>{let r=t??Re;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},Ai=(e,t)=>`${t??"./"}${e}`,gr=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},Oi=async e=>(await import(e)).default,yr=(is(),J(Ei)).default,Ri=async()=>{if(!Re)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(jt(Re))return[void 0,yr()];let e=await gr(Re);return[e,yr(e)]},_r=void 0,Bi=async(e,t,r,i)=>{let a=_r&&!(e||t);if(a)if(Re)a=jt(Re)||i&&!r;else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,_r];{let s="ort-wasm-simd-threaded.jsep.mjs",n=e??Ci(s,t),o=r&&n&&!jt(n,t),u=o?await gr(n):n??Ai(s,t);return[o?u:void 0,await Oi(u)]}}}),br,Ht,Tt,$r,Mi,Di,Pi,vr,ue,nt=C(()=>{"use strict";wr(),Ht=!1,Tt=!1,$r=!1,Mi=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Di=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Pi=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},vr=async e=>{if(Ht)return Promise.resolve();if(Tt)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if($r)throw new Error("previous call to 'initializeWebAssembly()' failed.");Tt=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!Pi())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Di())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=Mi();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,s=typeof a=="string"?a:void 0,n=a?.mjs,o=n?.href??n,u=a?.wasm,l=u?.href??u,p=e.wasmBinary,[d,h]=await Bi(o,s,r>1,!!p||!!l),m=!1,f=[];if(t>0&&f.push(new Promise(_=>{setTimeout(()=>{m=!0,_()},t)})),f.push(new Promise((_,$)=>{let w={numThreads:r};if(p)w.wasmBinary=p,w.locateFile=y=>y;else if(l||s)w.locateFile=y=>l??s+y;else if(o&&o.indexOf("blob:")!==0)w.locateFile=y=>new URL(y,o).href;else if(d){let y=mr();y&&(w.locateFile=x=>y+x)}h(w).then(y=>{Tt=!1,Ht=!0,br=y,_(),d&&URL.revokeObjectURL(d)},y=>{Tt=!1,$r=!0,$(y)})})),await Promise.race(f),m)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},ue=()=>{if(Ht&&br)return br;throw new Error("WebAssembly is not initialized yet.")}}),De,Kt,re,xr=C(()=>{"use strict";nt(),De=(e,t)=>{let r=ue(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},Kt=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,s])=>{let n=t?t+a:a;if(typeof s=="object")Kt(s,n+".",r,i);else if(typeof s=="string"||typeof s=="number")i(n,s.toString());else if(typeof s=="boolean")i(n,s?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof s}`)})},re=e=>{let t=ue(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let s=Number(t.getValue(a,i===4?"i32":"i64")),n=t.getValue(a+i,"*"),o=n?t.UTF8ToString(n):"";throw new Error(`${e} ERROR_CODE: ${s}, ERROR_MESSAGE: ${o}`)}finally{t.stackRestore(r)}}}),Ui,as=C(()=>{"use strict";nt(),xr(),Ui=e=>{let t=ue(),r=0,i=[],a=e||{};try{if(e?.logSeverityLevel===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if(e?.logVerbosityLevel===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);e?.terminate===void 0&&(a.terminate=!1);let s=0;return e?.tag!==void 0&&(s=De(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,s),r===0&&re("Can't create run options."),e?.extra!==void 0&&Kt(e.extra,"",new WeakSet,(n,o)=>{let u=De(n,i),l=De(o,i);t._OrtAddRunConfigEntry(r,u,l)!==0&&re(`Can't set a run config entry: ${n} - ${o}.`)}),[r,i]}catch(s){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(n=>t._free(n)),s}}}),Ni,Li,qi,at,Vi,Fi,ss=C(()=>{"use strict";nt(),xr(),Ni=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},Li=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},qi=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},at=(e,t,r,i)=>{let a=De(t,i),s=De(r,i);ue()._OrtAddSessionConfigEntry(e,a,s)!==0&&re(`Can't set a session config entry: ${t} - ${r}.`)},Vi=async(e,t,r)=>{let i=t.executionProviders;for(let a of i){let s=typeof a=="string"?a:a.name,n=[];switch(s){case"webnn":if(s="WEBNN",at(e,"session.disable_quant_qdq","1",r),at(e,"session.disable_qdq_constant_folding","1",r),typeof a!="string"){let d=a?.deviceType;d&&at(e,"deviceType",d,r)}break;case"webgpu":if(s="JS",typeof a!="string"){let d=a;if(d?.preferredLayout){if(d.preferredLayout!=="NCHW"&&d.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${d.preferredLayout}`);at(e,"preferredLayout",d.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${s}`)}let o=De(s,r),u=n.length,l=0,p=0;if(u>0){l=ue()._malloc(u*ue().PTR_SIZE),r.push(l),p=ue()._malloc(u*ue().PTR_SIZE),r.push(p);for(let d=0;d<u;d++)ue().setValue(l+d*ue().PTR_SIZE,n[d][0],"*"),ue().setValue(p+d*ue().PTR_SIZE,n[d][1],"*")}await ue()._OrtAppendExecutionProvider(e,o,l,p,u)!==0&&re(`Can't append execution provider: ${s}.`)}},Fi=async e=>{let t=ue(),r=0,i=[],a=e||{};qi(a);try{let s=Ni(a.graphOptimizationLevel??"all"),n=Li(a.executionMode??"sequential"),o=typeof a.logId=="string"?De(a.logId,i):0,u=a.logSeverityLevel??2;if(!Number.isInteger(u)||u<0||u>4)throw new Error(`log severity level is not valid: ${u}`);let l=a.logVerbosityLevel??0;if(!Number.isInteger(l)||l<0||l>4)throw new Error(`log verbosity level is not valid: ${l}`);let p=typeof a.optimizedModelFilePath=="string"?De(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(s,!!a.enableCpuMemArena,!!a.enableMemPattern,n,!!a.enableProfiling,0,o,u,l,p),r===0&&re("Can't create session options."),a.executionProviders&&await Vi(r,a,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);at(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[d,h]of Object.entries(a.freeDimensionOverrides)){if(typeof d!="string")throw new Error(`free dimension override name must be a string: ${d}`);if(typeof h!="number"||!Number.isInteger(h)||h<0)throw new Error(`free dimension override value must be a non-negative integer: ${h}`);let m=De(d,i);t._OrtAddFreeDimensionOverride(r,m,h)!==0&&re(`Can't set a free dimension override: ${d} - ${h}.`)}return a.extra!==void 0&&Kt(a.extra,"",new WeakSet,(d,h)=>{at(r,d,h,i)}),[r,i]}catch(s){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&re("Can't release session options."),i.forEach(n=>t._free(n)),s}}}),ot,ut,lt,Sr,Tr,Er,kr,Wr,oe=C(()=>{"use strict";ot=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},ut=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},lt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,s)=>a*s,1);return r>0?Math.ceil(i*r):void 0},Sr=e=>{switch(e){case"float16":return typeof Float16Array<"u"?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Tr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Er=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",kr=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Wr=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Ir,Gi=C(()=>{"use strict";cr(),Ir=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),s;try{s=new ArrayBuffer(i)}catch(o){if(o instanceof RangeError){let u=Math.ceil(i/65536);s=new WebAssembly.Memory({initial:u,maximum:u}).buffer}else throw o}let n=0;for(;;){let{done:o,value:u}=await a.read();if(o)break;let l=u.byteLength;new Uint8Array(s,n,l).set(u),n+=l}return new Uint8Array(s,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),Wi,jr,Hr,Ut,Kr,Zr,we,ht=C(()=>{"use strict";oe(),Wi=["V","I","W","E","F"],jr=(e,t)=>{console.log(`[${Wi[e]},${new Date().toISOString()}]${t}`)},Kr=(e,t)=>{Hr=e,Ut=t},Zr=(e,t)=>{let r=Tr(e),i=Tr(Hr);r>=i&&jr(r,typeof t=="function"?t():t)},we=(...e)=>{Ut&&Zr(...e)}}),Qr,Nt,D,Yt,Xr,ji,Et,ae=C(()=>{"use strict";Qr=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Nt=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let s=Math.max(e.length,t.length),n=new Array(s);if(r){if(i<2||a<2)return;let o=Qr.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(o===void 0)return;[n[s-2],n[s-1]]=o}for(let o=r?3:1;o<=s;o++){let u=i-o<0?1:e[i-o],l=a-o<0?1:t[a-o];if(u!==l&&u>1&&l>1)return;let p=Math.max(u,l);if(u&&l)n[s-o]=Math.max(u,l);else{if(p>1)return;n[s-o]=0}}return n}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},D=class La{static size(t){return La.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),s=i-1;for(;s>=0;){if(t[s]%r===0){a[s]=t[s]/r;break}if(r%t[s]!==0)throw new Error("cannot convert shape");a[s]=1,r/=t[s],s--}for(s--;s>=0;s--)a[s]=t[s];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return La.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return La.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let s=r;s<i;s++){if(t[s]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[s])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,s)=>a+r[s]+r[s+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Yt=class fa{static adjustPoolAttributes(t,r,i,a,s,n){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let o=0;o<r.length-2;o++)o>=i.length?i.push(r[o+2]):i[o]=r[o+2];for(let o=0;o<i.length;o++)if(o<a.length){if(a[o]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let o=0;o<i.length;o++)if(o<s.length){if(s[o]<0)throw new Error("dilations should be greater than or equal to 1")}else s.push(1);for(let o=0;o<i.length*2;o++)if(o<n.length){if(n[o]<0)throw new Error("pad should be greater than or equal to 1")}else n.push(0);for(let o=0;o<i.length;o++){if(i[o]<=0)throw new Error("kernel shapes need to be greater than 0");if(n[o]>=i[o]||n[o+i.length]>=i[o])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,s,n,o){if(o){if(s.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let u=0;u<t.length-2;u++)fa.adjustPadAndReturnShape(t[u+(n?1:2)],r[u],i[u],a[u],s,u,u+t.length-2,o)}}static computePoolOutputShape(t,r,i,a,s,n,o){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let u=[r[0],r[1]];return fa.computeShapeHelper(t,r,u,i,a,s,n,o),u}static computeConvOutputShape(t,r,i,a,s,n,o){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let u=[t[0],r[0]];return fa.computeShapeHelper(!1,t,u,i,a,s,n,o),u}static computeShapeHelper(t,r,i,a,s,n,o,u){if(t)for(let l=0;l<r.length-2;l++)i.push(1);else for(let l=0;l<r.length-2;l++)i.push(fa.adjustPadAndReturnShape(r[l+2],a[l],s[l],n[l],o,l,l+r.length-2,u))}static adjustPadAndReturnShape(t,r,i,a,s,n,o,u){let l=i*(a-1)+1;if(u&&u!=="NOTSET")switch(u){case"VALID":return s[n]=0,s[o]=0,Math.floor((t-l)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let p=((t+r-1)/r-1)*r+a-t;return s[n]=Math.floor(u==="SAME_LOWER"?(p+1)/2:p/2),s[o]=p-s[n],Math.floor((t+p-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+s[n]+s[o]-l)/r+1)}},Xr=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let s,n,o;t?(s=e[1],n=e[0]):(s=e[0],n=e[1]);let u=-1;if(i?(o=r[0],u=1):(o=r[1],u=0),r[u]!==n)throw new Error("dimension mismatch");if(s<=0||o<=0||n<=0)throw new Error("invalid shape specified");if(a&&!Nt.isValidBroadcast(a,[s,o]))throw new Error("gemm: invalid bias shape for broadcast");return[s,o,n]}},ji=-34028234663852886e22,Et=34028234663852886e22}),Lt,Jt=C(()=>{"use strict";oe(),Lt=(e,t)=>new(Sr(t))(e)}),Zt,er,zr,Cr,kt,qt,Yr,Jr,ei,Hi,Ki,ya=C(()=>{"use strict";oe(),ht(),Zt=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),er=(e,t)=>{if(t==="int32")return e;let r=Zt.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,s=new(Sr(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let n=new Int32Array(a);for(let o=0;o<a;o++){let u=s[o];if(u>2147483647n||u<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");n[o]=Number(u)}return new Uint8Array(n.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&s.some(o=>o>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let n=Int32Array.from(s,Number);return new Uint8Array(n.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},zr=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(s=>s<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(s=>s<-128||s>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(s=>s<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},Cr=1,kt=()=>Cr++,qt=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Yr=(e,t)=>{let r=Zt.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},Jr=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:s,fallbackDataType:n}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=s,this.fallbackDataType=n}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Yr(this.dataType,this.tensorShape)}destroy(){we("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=zr(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return new Uint8Array(r).buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},ei=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),s=this.tensorManager.getMLOpSupportLimits(e),n;if(!s?.input.dataTypes.includes(t)){if(n=qt.get(t),!n||s?.input.dataTypes.includes(n))throw new Error(`WebNN backend does not support data type: ${t}`);we("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${n}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Yr(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let o=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,o,!0,!0,n),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=er(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else we("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){if(this.activeUpload){let t=this.wrapper?.isDataConverted?zr(this.activeUpload,this.wrapper?.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(t):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(t);return}else return t.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},Hi=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=kt();return this.tensorTrackersById.set(e,new ei(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){we("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let s=this.tensorTrackersById.get(t);if(!s)throw new Error("Tensor not found.");return s.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){we("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),s=kt(),n=new Jr({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(s,new ei(this,n)),this.externalTensors.add(n),s}async getCachedTensor(e,t,r,i,a,s,n){let o=this.getMLContext(e);for(let[l,p]of this.freeTensors.entries())if(p.canReuseTensor(o,t,r)){we("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${n?`fallbackDataType: ${n},`:""} shape: ${r}`);let d=this.freeTensors.splice(l,1)[0];return d.sessionId=e,d}we("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${n?`fallbackDataType: ${n},`:""} shape: ${r}}`);let u=await o.createTensor({dataType:n??t,shape:r,dimensions:r,usage:i,writable:a,readable:s});return new Jr({sessionId:e,context:o,tensor:u,dataType:t,shape:r,fallbackDataType:n})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},Ki=(...e)=>new Hi(...e)}),tr,Zi,Qi,Xi=C(()=>{"use strict";oe(),nt(),Jt(),ya(),ht(),tr=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),Zi=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,s)=>a===i[s]&&e[a]===t[a])},Qi=class{constructor(e){this.tensorManager=Ki(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,Kr(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){we("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){we("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)we("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>Zi(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){we("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let s=tr.get(r);if(!s)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,s,i,a)}async createTemporaryTensor(e,t,r){we("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=tr.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let s=this.temporarySessionTensorIds.get(e);return s?s.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!ue().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");we("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return Lt(r,t)}}registerMLTensor(e,t,r,i){let a=tr.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let s=this.tensorManager.registerTensor(e,t,a,i);return we("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${s}}`),s}registerMLConstant(e,t,r,i,a,s,n=!1){if(!s)throw new Error("External mounted files are not available.");let o=e;e.startsWith("./")&&(o=e.substring(2));let u=s.get(o);if(!u)throw new Error(`File with name ${o} not found in preloaded files.`);if(t+r>u.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let l=u.slice(t,t+r).buffer,p;switch(a.dataType){case"float32":p=new Float32Array(l);break;case"float16":p=typeof Float16Array<"u"?new Float16Array(l):new Uint16Array(l);break;case"int32":p=new Int32Array(l);break;case"uint32":p=new Uint32Array(l);break;case"int64":if(n){let d=er(new Uint8Array(l),"int64");p=new Int32Array(d.buffer),a.dataType="int32"}else p=new BigInt64Array(l);break;case"uint64":p=new BigUint64Array(l);break;case"int8":p=new Int8Array(l);break;case"int4":case"uint4":case"uint8":p=new Uint8Array(l);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return we("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${n?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,p)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=tr.get(ot(t)),a=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!a?.input.dataTypes.includes(i):!!a?.output.dataTypes.includes(i)}flush(){}}}),ti=C(()=>{"use strict"}),ri,ii,Ar,ai,si,ni,Yi,Ji,_a,ns=C(()=>{"use strict";ht(),ti(),ri=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),ii=[],Ar=e=>Math.ceil(Number(e)/16)*16,ai=e=>{for(let t=0;t<ii.length;t++){let r=ii[t];if(e<=r)return r}return Math.ceil(e/16)*16},si=1,ni=()=>si++,Yi=async(e,t,r,i)=>{let a=Ar(r),s=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let n=e.getCommandEncoder();e.endComputePass(),n.copyBufferToBuffer(t,0,s,0,a),e.flush(),await s.mapAsync(GPUMapMode.READ);let o=s.getMappedRange();if(i){let u=i();return u.set(new Uint8Array(o,0,r)),u}else return new Uint8Array(o.slice(0,r))}finally{s.destroy()}},Ji=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of ri)ii.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,s=Ar(a),n=this.storageCache.get(e);if(!n)throw new Error("gpu data for uploading does not exist");if(Number(n.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${n.originalSize}, data size=${a}`);let o=this.backend.device.createBuffer({mappedAtCreation:!0,size:s,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),u=o.getMappedRange();new Uint8Array(u).set(new Uint8Array(r,i,a)),o.unmap();let l=this.backend.device.createCommandEncoder();l.copyBufferToBuffer(o,0,n.gpuData.buffer,0,s),this.backend.device.queue.submit([l.finish()]),o.destroy(),we("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Ar(r.originalSize),s=this.backend.getCommandEncoder();this.backend.endComputePass(),s.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return we("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=ni();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),we("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),we("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=ai(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,s=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||s){let o=(a?this.freeBuffers:this.freeUniformBuffers).get(r);o?o.length>0?i=o.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let n={id:ni(),type:0,buffer:i};return this.storageCache.set(n.id,{gpuData:n,originalSize:Number(e)}),we("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${n.id}`),n}get(e){return this.storageCache.get(e)?.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return we("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await Yi(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=ri.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(we("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},_a=(...e)=>new Ji(...e)}),c,g,b=C(()=>{"use strict";c=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},g=e=>new c(e)}),T,S,B,I,k,O,V,G,q,M,ee,A,j,Ce,ce,fe,$e,K=C(()=>{"use strict";oe(),ae(),T=64,S=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},B=(e,t=1)=>{let r=S(e,t);return typeof r=="string"?r:r[0]},I=(e,t=1)=>{let r=S(e,t);return typeof r=="string"?r:r[1]},k=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:D.computeStrides(r)})}),t},O=e=>e%4===0?4:e%2===0?2:1,V=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,G=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,q=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,M=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,ee=(e,t,r,i,a)=>{let s=typeof r=="number",n=s?r:r.length,o=[...new Array(n).keys()],u=n<2?"u32":n<=4?`vec${n}<u32>`:`array<u32, ${n}>`,l=S(t,a),p=typeof l=="string"?l:l[1],d=typeof l=="string"?l:l[0],h={indices:u,value:p,storage:d,tensor:t},m=W=>typeof W=="string"?W:`${W}u`,f={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},_=s?"uniforms.":"",$=`${_}${e}_shape`,w=`${_}${e}_strides`,y="";for(let W=0;W<n-1;W++)y+=`
    let dim${W} = current / ${M(w,W,n)};
    let rest${W} = current % ${M(w,W,n)};
    indices[${W}] = dim${W};
    current = rest${W};
    `;y+=`indices[${n-1}] = current;`;let x=n<2?"":`
  fn o2i_${e}(offset: u32) -> ${h.indices} {
    var indices: ${h.indices};
    var current = offset;
    ${y}
    return indices;
  }`,v=W=>(f.offsetToIndices=!0,n<2?W:`o2i_${e}(${W})`),E=[];if(n>=2)for(let W=n-1;W>=0;W--)E.push(`${M(w,W,n)} * (indices[${W}])`);let z=n<2?"":`
  fn i2o_${e}(indices: ${h.indices}) -> u32 {
    return ${E.join("+")};
  }`,R=W=>(f.indicesToOffset=!0,n<2?W:`i2o_${e}(${W})`),N=(...W)=>n===0?"0u":`${h.indices}(${W.map(m).join(",")})`,F=(W,pe)=>n<2?`${W}`:`${M(W,pe,n)}`,Q=(W,pe,ne)=>n<2?`${W}=${ne};`:`${M(W,pe,n)}=${ne};`,ye={},ie=(W,pe)=>{f.broadcastedIndicesToOffset=!0;let ne=`${pe.name}broadcastedIndicesTo${e}Offset`;if(ne in ye)return`${ne}(${W})`;let Y=[];for(let Qe=n-1;Qe>=0;Qe--){let dt=pe.indicesGet("outputIndices",Qe+pe.rank-n);Y.push(`${F(w,Qe)} * (${dt} % ${F($,Qe)})`)}return ye[ne]=`fn ${ne}(outputIndices: ${pe.type.indices}) -> u32 {
             return ${Y.length>0?Y.join("+"):"0u"};
           }`,`${ne}(${W})`},se=(W,pe)=>(()=>{if(h.storage===h.value)return`${e}[${W}]=${pe};`;if(h.storage==="vec2<u32>"&&h.value==="i32")return`${e}[${W}]=vec2<u32>(u32(${pe}), select(0u, 0xFFFFFFFFu, ${pe} < 0));`;if(h.storage==="vec2<u32>"&&h.value==="u32")return`${e}[${W}]=vec2<u32>(u32(${pe}), 0u);`;if(h.storage==="u32"&&h.value==="vec4<bool>")return`${e}[${W}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${pe}));`;throw new Error(`not supported combination of storage type ${h.storage} and value type ${h.value} yet`)})(),ke=W=>(()=>{if(h.storage===h.value)return`${e}[${W}]`;if(h.storage==="vec2<u32>"&&h.value==="i32")return`i32(${e}[${W}].x)`;if(h.storage==="vec2<u32>"&&h.value==="u32")return`u32(${e}[${W}].x)`;if(h.storage==="u32"&&h.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${W}] & 0xFFu), bool(${e}[${W}] & 0xFF00u), bool(${e}[${W}] & 0xFF0000u), bool(${e}[${W}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${h.storage} and value type ${h.value} yet`)})(),X=n<2?"":`
  fn get_${e}ByIndices(indices: ${h.indices}) -> ${p} {
    return ${ke(`i2o_${e}(indices)`)};
  }`,te=n<2?"":(()=>{let W=o.map(ne=>`d${ne}: u32`).join(", "),pe=o.map(ne=>`d${ne}`).join(", ");return`
  fn get_${e}(${W}) -> ${p} {
    return get_${e}ByIndices(${N(pe)});
  }`})(),me=(...W)=>{if(W.length!==n)throw new Error(`indices length must be ${n}`);let pe=W.map(m).join(",");return n===0?ke("0u"):n===1?ke(pe[0]):(f.get=!0,f.getByIndices=!0,f.indicesToOffset=!0,`get_${e}(${pe})`)},_e=W=>n<2?ke(W):(f.getByIndices=!0,f.indicesToOffset=!0,`get_${e}ByIndices(${W})`),he=n<2?"":`
  fn set_${e}ByIndices(indices: ${h.indices}, value: ${p}) {
    ${se(`i2o_${e}(indices)`,"value")}
  }`,ve=n<2?"":(()=>{let W=o.map(ne=>`d${ne}: u32`).join(", "),pe=o.map(ne=>`d${ne}`).join(", ");return`
  fn set_${e}(${W}, value: ${p}) {
    set_${e}ByIndices(${N(pe)}, value);
  }`})();return{impl:()=>{let W=[],pe=!1;return f.offsetToIndices&&(W.push(x),pe=!0),f.indicesToOffset&&(W.push(z),pe=!0),f.broadcastedIndicesToOffset&&(Object.values(ye).forEach(ne=>W.push(ne)),pe=!0),f.set&&(W.push(ve),pe=!0),f.setByIndices&&(W.push(he),pe=!0),f.get&&(W.push(te),pe=!0),f.getByIndices&&(W.push(X),pe=!0),!s&&pe&&W.unshift(`const ${$} = ${h.indices}(${r.join(",")});`,`const ${w} = ${h.indices}(${D.computeStrides(r).join(",")});`),W.join(`
`)},type:h,offsetToIndices:v,indicesToOffset:R,broadcastedIndicesToOffset:ie,indices:N,indicesGet:F,indicesSet:Q,set:(...W)=>{if(W.length!==n+1)throw new Error(`indices length must be ${n}`);let pe=W[n];if(typeof pe!="string")throw new Error("value must be string");let ne=W.slice(0,n).map(m).join(",");return n===0?se("0u",pe):n===1?se(ne[0],pe):(f.set=!0,f.setByIndices=!0,f.indicesToOffset=!0,`set_${e}(${ne}, ${pe})`)},setByOffset:se,setByIndices:(W,pe)=>n<2?se(W,pe):(f.setByIndices=!0,f.indicesToOffset=!0,`set_${e}ByIndices(${W}, ${pe});`),get:me,getByOffset:ke,getByIndices:_e,usage:i,name:e,strides:w,shape:$,rank:n}},A=(e,t,r,i=1)=>ee(e,t,r,"input",i),j=(e,t,r,i=1)=>ee(e,t,r,"output",i),Ce=(e,t,r)=>ee(e,t,r,"atomicOutput",1),ce=(e,t,r,i=1)=>ee(e,t,r,"internal",i),fe=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=T){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,s=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,n=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${s}) {
    ${n}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},$e=(e,t)=>new fe(e,t)}),Pe,Ke,Ze,Vt,ea,oi,Je,ft,wt,It=C(()=>{"use strict";oe(),ae(),b(),K(),Pe=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Ke=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),Ze=(e,t)=>D.sortBasedOnPerm(e,Ke(e.length,t)),Vt=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let s=0;s<t;++s)a+=`a[${e[s]}]=i[${s}];`;return a+="return a;}"},ea=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},oi=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Je=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Ke(i,t),s=Ze(e.dims,a),n=e.dims,o=s,u=i<2||oi(a,e.dims),l;if(u)return l=f=>{let _=A("input",r,n,4),$=j("output",r,o,4);return`
  ${f.registerUniform("output_size","u32").declareVariables(_,$)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let f=D.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(f/64/4)},programUniforms:[{type:12,data:Math.ceil(f/4)}]}},getShaderSource:l};let{newShape:p,newPerm:d}=ea(e.dims,a),h=D.areEqual(d,[2,3,1]),m=D.areEqual(d,[3,1,2]);if(p.length===2||h||m){n=h?[p[0],p[1]*p[2]]:m?[p[0]*p[1],p[2]]:p,o=[n[1],n[0]];let f=16;return l=_=>{let $=A("a",r,n.length),w=j("output",r,o.length);return`
  ${_.registerUniform("output_size","u32").declareVariables($,w)}
  var<workgroup> tile : array<array<${w.type.value}, ${f+1}>, ${f}>;
  ${_.mainStart([f,f,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${f} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${f}u + local_id.x;
    let input_row = workgroup_id_x * ${f}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${$.getByIndices(`${$.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${f}u + local_id.x;
    let output_row = workgroup_id_y * ${f}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${w.setByIndices(`${w.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=D.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(o[1]/f),y:Math.ceil(o[0]/f)},programUniforms:[{type:12,data:_},...k(n,o)]}},getShaderSource:l}}return l=f=>{let _=A("a",r,n.length),$=j("output",r,o.length);return`
  ${f.registerUniform("output_size","u32").declareVariables(_,$)}

  ${Vt(a,i,_,$)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${$.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${$.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let f=D.size(s);return{outputs:[{dims:s,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:[{type:12,data:f},...k(n,o)]}},getShaderSource:l}},ft=(e,t)=>{Pe(e.inputs,t.perm),e.compute(Je(e.inputs[0],t.perm))},wt=e=>g({perm:e.perm})}),xe,mt,wa,zt,Or,Ue,et,ui,Rr,ta,gt,Ct,At,rr,Ne,Be,bt,ba,$a,Tn,En,Ac=C(()=>{"use strict";oe(),ae(),K(),us(),It(),xe={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},mt={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},wa={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},zt={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Or=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},Ue=(e,t)=>{let r=[],i=e.length;for(let s=0;s<i;s++)t.indexOf(s)===-1&&r.push(e[s]);let a=t.map(s=>e[s]);return[r,a]},et=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let s=0;s<r;s++)t.indexOf(s)===-1?i.push(e[a++]):i.push(1);return i},ui=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Rr=(e,t)=>{let r=[];if(!ui(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},ta=(e,t,r,i,a,s,n)=>{let o=r[0].dims,u=D.size(s),l=D.size(n),p=A("_A",r[0].dataType,o),d=j("output",a,s),h=64;u===1&&(h=256);let m=`
          var<workgroup> aBestValues : array<f32, ${h}>;
       `,f=_=>`
        ${_.registerUniform("reduceSize","u32").declareVariables(p,d)}
        ${m}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${_.mainStart(h)}

          let outputIndex = global_idx / ${h};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${wa[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${h}) {
           let candidate = f32(${p.getByOffset("offset + k")});
           bestValue = ${xe[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${h}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${mt[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${d.setByOffset("outputIndex",`${i==="mean"?`${d.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${d.type.storage}(${zt[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${h}`,inputDependencies:["type"]},getShaderSource:f,getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:u},programUniforms:[{type:12,data:l}]})}},gt=(e,t,r,i)=>{let a=e.inputs.length===1?r:os(e.inputs,r),s=a.axes;s.length===0&&!a.noopWithEmptyAxes&&(s=e.inputs[0].dims.map((m,f)=>f));let n=D.normalizeAxes(s,e.inputs[0].dims.length),o=n,u=e.inputs[0],l=Rr(o,e.inputs[0].dims.length);l.length>0&&(u=e.compute(Je(e.inputs[0],l),{inputs:[0],outputs:[-1]})[0],o=Or(o.length,u.dims.length));let[p,d]=Ue(u.dims,o),h=p;a.keepDims&&(h=et(p,n)),e.compute(ta(t,a.cacheKey,[u],i,e.inputs[0].dataType,h,d),{inputs:[u]})},Ct=(e,t)=>{gt(e,"ReduceMeanShared",t,"mean")},At=(e,t)=>{gt(e,"ReduceL1Shared",t,"l1")},rr=(e,t)=>{gt(e,"ReduceL2Shared",t,"l2")},Ne=(e,t)=>{gt(e,"ReduceLogSumExpShared",t,"logSumExp")},Be=(e,t)=>{gt(e,"ReduceMaxShared",t,"max")},bt=(e,t)=>{gt(e,"ReduceMinShared",t,"min")},ba=(e,t)=>{gt(e,"ReduceProdShared",t,"prod")},$a=(e,t)=>{gt(e,"ReduceSumShared",t,"sum")},Tn=(e,t)=>{gt(e,"ReduceSumSquareShared",t,"sumSquare")},En=(e,t)=>{gt(e,"ReduceLogSumShared",t,"logSum")}}),Ot,kn,va,os,Rt,In,zn,Cn,An,On,Rn,Bn,Mn,Dn,Pn,Bt,Un,Nn,Ln,qn,Vn,Fn,Gn,Wn,jn,Hn,us=C(()=>{"use strict";oe(),ae(),b(),K(),Ac(),Ot=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},kn=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],va=(e,t,r,i,a,s,n=!1,o=!1)=>{let u=[],l=r[0].dims,p=l.length,d=D.normalizeAxes(a,p),h=!o&&d.length===0;l.forEach((_,$)=>{h||d.indexOf($)>=0?n&&u.push(1):u.push(_)});let m=u.length,f=D.size(u);return{name:e,shaderCache:t,getShaderSource:_=>{let $=[],w=A("_A",r[0].dataType,p),y=j("output",s,m),x=i(w,y,d),v=x[2];for(let E=0,z=0;E<p;E++)h||d.indexOf(E)>=0?(n&&z++,v=`for(var j${E}: u32 = 0; j${E} < ${l[E]}; j${E}++) {
                  ${x[2].includes("last_index")?`let last_index = j${E};`:""}
                  ${w.indicesSet("input_indices",E,`j${E}`)}
                  ${v}
                }`):($.push(`${w.indicesSet("input_indices",E,y.indicesGet("output_indices",z))};`),z++);return`

        ${_.registerUniform("output_size","u32").declareVariables(w,y)}

        ${_.mainStart()}
          ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${w.type.indices};
          let output_indices = ${y.offsetToIndices("global_idx")};

          ${$.join(`
`)}
          ${x[0]}       // init ops for reduce max/min
          ${x[1]}
          ${v}
          ${x[3]}
          ${x.length===4?y.setByOffset("global_idx","value"):x.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:u,dataType:s}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:[{type:12,data:f},...k(l,u)]})}},os=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),g({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Rt=(e,t,r,i)=>{let a=e.inputs,s=a.length===1?r:os(a,r);e.compute(va(t,{hint:s.cacheKey,inputDependencies:["rank"]},[a[0]],s.noopWithEmptyAxes&&s.axes.length===0?kn:i,s.axes,a[0].dataType,s.keepDims,s.noopWithEmptyAxes),{inputs:[0]})},In=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},zn=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Cn=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},An=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},On=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceMax",t,(r,i,a)=>{let s=[];for(let n=0;n<r.rank;n++)(a.indexOf(n)>=0||a.length===0)&&s.push(r.indicesSet("input_indices",n,0));return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Rn=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceMean",t,(r,i,a)=>{let s=1;for(let n=0;n<r.rank;n++)(a.indexOf(n)>=0||a.length===0)&&(s*=e.inputs[0].dims[n]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${s});`]})},Bn=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceMin",t,(r,i,a)=>{let s=[];for(let n=0;n<r.rank;n++)(a.indexOf(n)>=0||a.length===0)&&s.push(`input_indices[${n}] = 0;`);return[`${s.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Mn=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},Dn=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},Pn=(e,t)=>{Ot(e.inputs),Rt(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Bt=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let s=0;s<t.length;s++)t.indexOf(s)===-1?i*=e[s]:a*=e[s];return a<32&&i>1024},Un=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Rn(e,t):Ct(e,t)},Nn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?zn(e,t):At(e,t)},Ln=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Cn(e,t):rr(e,t)},qn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?An(e,t):Ne(e,t)},Vn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?On(e,t):Be(e,t)},Fn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Bn(e,t):bt(e,t)},Gn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Mn(e,t):ba(e,t)},Wn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Dn(e,t):$a(e,t)},jn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Pn(e,t):Tn(e,t)},Hn=(e,t)=>{Bt(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?In(e,t):En(e,t)}}),ls,Kn,Zn,ds,Oc=C(()=>{"use strict";oe(),b(),us(),ls=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},Kn=(e,t)=>{ls(e.inputs);let r=(i,a,s)=>{let n=[];for(let o=0;o<i.rank;o++)(s.indexOf(o)>=0||s.length===0)&&n.push(`input_indices[${o}] = 0;`);return[`${n.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(va("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Zn=(e,t)=>{ls(e.inputs);let r=(i,a,s)=>{let n=[];for(let o=0;o<i.rank;o++)(s.indexOf(o)>=0||s.length===0)&&n.push(`input_indices[${o}] = 0;`);return[`${n.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(va("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},ds=e=>g(e)}),Qn,xa,Xn,Yn,Jn,ra,eo,to,ps=C(()=>{"use strict";oe(),ae(),ti(),K(),Qn=(e,t)=>{let r=e[0],i=e[1],a=e[2],s=e[3],n=e[4],o=e[5];if(n&&o)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let u=r.dims[0],l=r.dims[1],p=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==p)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let d=a.dims[0]/3,h=d,m=h;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let x of t.qkvHiddenSizes)if(x%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");d=t.qkvHiddenSizes[0],h=t.qkvHiddenSizes[1],m=t.qkvHiddenSizes[2]}let f=l;if(d!==h)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==d+h+m)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let _=0;if(n){if(h!==m)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(n.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(n.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(n.dims[1]!==u)throw new Error('Input "past" second dimension must be batch_size');if(n.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(n.dims[4]!==h/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(_=n.dims[3])}let $=f+_,w=-1,y=0;if(s)throw new Error("Mask not supported");if(n)throw new Error("past is not supported");if(o){if(o.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(o.dims[0]!==u||o.dims[1]!==t.numHeads||o.dims[2]!==l||o.dims[3]!==$)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:u,sequenceLength:l,pastSequenceLength:_,kvSequenceLength:f,totalSequenceLength:$,maxSequenceLength:w,inputHiddenSize:p,hiddenSize:d,vHiddenSize:m,headSize:Math.floor(d/t.numHeads),vHeadSize:Math.floor(m/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:y,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},xa=(e,t,r)=>t&&e?`
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
    `,Xn=(e,t,r,i,a,s,n,o)=>{let u=O(n?1:s),l=64,p=s/u;p<l&&(l=32);let d=Math.ceil(s/u/l),h=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:p},{type:12,data:d}],m=B(e.dataType,u),f=I(1,u),_=["type"];n&&_.push("type"),o&&_.push("type");let $=w=>{let y=j("x",e.dataType,e.dims,u),x=[y],v=n?A("seq_lens",n.dataType,n.dims):void 0;v&&x.push(v);let E=o?A("total_sequence_length_input",o.dataType,o.dims):void 0;E&&x.push(E);let z=I(e.dataType),R=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${l}>;
  var<workgroup> thread_sum: array<f32, ${l}>;
  ${w.registerUniforms(R).declareVariables(...x)}
  ${w.mainStart([l,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${xa(v,E,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${l}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${n?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${f}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${f}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(u){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${u}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${l}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${f}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${f}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(u){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${u}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${l}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${y.type.value}(${z}(1.0) / ${z}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${f}(x[offset + i]);
        x[offset + i] = ${y.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${n?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${y.type.value}(${z}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${l};${m};${u}`,inputDependencies:_},getShaderSource:$,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:h})}},Yn=(e,t,r,i,a,s,n,o,u)=>{let l=n+s.kvSequenceLength,p=[s.batchSize,s.numHeads,s.sequenceLength,l],d=e>1&&i,h=s.kvNumHeads?s.kvNumHeads:s.numHeads,m=d?[s.batchSize,h,l,s.headSize]:void 0,f=s.nReps?s.nReps:1,_=s.scale===0?1/Math.sqrt(s.headSize):s.scale,$=O(s.headSize),w=s.headSize/$,y=12,x={x:Math.ceil(l/y),y:Math.ceil(s.sequenceLength/y),z:s.batchSize*s.numHeads},v=[{type:12,data:s.sequenceLength},{type:12,data:w},{type:12,data:l},{type:12,data:s.numHeads},{type:12,data:s.headSize},{type:1,data:_},{type:12,data:n},{type:12,data:s.kvSequenceLength},{type:12,data:f}],E=d&&i&&D.size(i.dims)>0,z=["type","type"];E&&z.push("type"),a&&z.push("type"),o&&z.push("type"),u&&z.push("type");let R=[{dims:p,dataType:t.dataType,gpuDataType:0}];d&&R.push({dims:m,dataType:t.dataType,gpuDataType:0});let N=F=>{let Q=A("q",t.dataType,t.dims,$),ye=A("key",r.dataType,r.dims,$),ie=[Q,ye];if(E){let he=A("past_key",i.dataType,i.dims,$);ie.push(he)}a&&ie.push(A("attention_bias",a.dataType,a.dims));let se=o?A("seq_lens",o.dataType,o.dims):void 0;se&&ie.push(se);let ke=u?A("total_sequence_length_input",u.dataType,u.dims):void 0;ke&&ie.push(ke);let X=j("output",t.dataType,p),te=[X];d&&te.push(j("present_key",t.dataType,m,$));let me=I(1,$),_e=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${y}u;

  var<workgroup> tileQ: array<${Q.type.storage}, ${y*y}>;
  var<workgroup> tileK: array<${Q.type.storage}, ${y*y}>;
  ${F.registerUniforms(_e).declareVariables(...ie,...te)}
  ${F.mainStart([y,y,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${f===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${f===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${xa(se,ke,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E&&d?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${d?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${me}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E&&d?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${d?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${me}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch($){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${$}`)}})()};
        output[outputIdx] = ${X.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${$};${a!==void 0};${i!==void 0};${e}`,inputDependencies:z},getRunData:()=>({outputs:R,dispatchGroup:x,programUniforms:v}),getShaderSource:N}},Jn=(e,t,r,i,a,s,n=void 0,o=void 0)=>{let u=s+a.kvSequenceLength,l=a.nReps?a.nReps:1,p=a.vHiddenSize*l,d=e>1&&i,h=a.kvNumHeads?a.kvNumHeads:a.numHeads,m=d?[a.batchSize,h,u,a.headSize]:void 0,f=[a.batchSize,a.sequenceLength,p],_=12,$={x:Math.ceil(a.vHeadSize/_),y:Math.ceil(a.sequenceLength/_),z:a.batchSize*a.numHeads},w=[{type:12,data:a.sequenceLength},{type:12,data:u},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:p},{type:12,data:s},{type:12,data:a.kvSequenceLength},{type:12,data:l}],y=d&&i&&D.size(i.dims)>0,x=["type","type"];y&&x.push("type"),n&&x.push("type"),o&&x.push("type");let v=[{dims:f,dataType:t.dataType,gpuDataType:0}];d&&v.push({dims:m,dataType:t.dataType,gpuDataType:0});let E=z=>{let R=A("probs",t.dataType,t.dims),N=A("v",r.dataType,r.dims),F=[R,N];y&&F.push(A("past_value",i.dataType,i.dims));let Q=n?A("seq_lens",n.dataType,n.dims):void 0;n&&F.push(Q);let ye=o?A("total_sequence_length_input",o.dataType,o.dims):void 0;o&&F.push(ye);let ie=[j("output",t.dataType,f)];d&&ie.push(j("present_value",t.dataType,m));let se=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${_}u;
  var<workgroup> tileQ: array<${R.type.value}, ${_*_}>;
  var<workgroup> tileV: array<${R.type.value}, ${_*_}>;
  ${z.registerUniforms(se).declareVariables(...F,...ie)}
  ${z.mainStart([_,_,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${l===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${l===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${xa(Q,ye,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${y&&d?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${d?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${R.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${y&&d?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${d?`
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
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:x},getRunData:()=>({outputs:v,dispatchGroup:$,programUniforms:w}),getShaderSource:E}},ra=(e,t,r,i,a,s,n,o,u,l,p=void 0,d=void 0)=>{let h=Math.min(e.outputCount,1+(n?1:0)+(o?1:0)),m=h>1?n:void 0,f=h>1?o:void 0,_=h>1?l.pastSequenceLength:0,$=_+l.kvSequenceLength,w=u&&D.size(u.dims)>0?u:void 0,y=[t,r];m&&D.size(m.dims)>0&&y.push(m),w&&y.push(w),p&&y.push(p),d&&y.push(d);let x=e.compute(Yn(h,t,r,m,w,l,_,p,d),{inputs:y,outputs:h>1?[-1,1]:[-1]})[0];e.compute(Xn(x,l.batchSize,l.numHeads,_,l.sequenceLength,$,p,d),{inputs:p&&d?[x,p,d]:[x],outputs:[]});let v=[x,i];f&&D.size(f.dims)>0&&v.push(f),p&&v.push(p),d&&v.push(d),e.compute(Jn(h,x,i,f,l,_,p,d),{inputs:v,outputs:h>1?[0,2]:[0]})},eo=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,s=t.headSize,n=12,o={x:Math.ceil(t.headSize/n),y:Math.ceil(t.sequenceLength/n),z:t.batchSize*t.numHeads},u=[e.inputs[0],e.inputs[1],e.inputs[2]],l=[{type:12,data:i},{type:12,data:a},{type:12,data:s},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],p=d=>{let h=j("output_q",u[0].dataType,r),m=j("output_k",u[0].dataType,r),f=j("output_v",u[0].dataType,r),_=A("input",u[0].dataType,u[0].dims),$=A("weight",u[1].dataType,u[1].dims),w=A("bias",u[2].dataType,u[2].dims),y=_.type.storage,x=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${n}u;
  var<workgroup> tileInput: array<${y}, ${n*n}>;
  var<workgroup> tileWeightQ: array<${y}, ${n*n}>;
  var<workgroup> tileWeightK: array<${y}, ${n*n}>;
  var<workgroup> tileWeightV: array<${y}, ${n*n}>;
  ${d.registerUniforms(x).declareVariables(_,$,w,h,m,f)}
  ${d.mainStart([n,n,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${y}(0);
    var valueK = ${y}(0);
    var valueV = ${y}(0);
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
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:o,programUniforms:l}),getShaderSource:p},{inputs:u,outputs:[-1,-1,-1]})},to=(e,t)=>{let r=Qn(e.inputs,t),[i,a,s]=eo(e,r);return ra(e,i,a,s,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),ro,io,ao,so,Rc=C(()=>{"use strict";Ge(),oe(),ae(),b(),K(),ro=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,s)=>{let n=a.length;if(n!==i.length)throw new Error(`${s}: num dimensions != ${n}`);a.forEach((o,u)=>{if(o!==i[u])throw new Error(`${s}: dim[${u}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},io=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,s=e[0].dims,n=i?O(s[s.length-1]):1,o=a==="NHWC"&&s.length>1?n:1,u=D.size(s)/n,l=i,p=l?s.length:s,d=A("x",e[0].dataType,e[0].dims,n),h=A("scale",e[1].dataType,e[1].dims,o),m=A("bias",e[2].dataType,e[2].dims,o),f=A("inputMean",e[3].dataType,e[3].dims,o),_=A("inputVar",e[4].dataType,e[4].dims,o),$=j("y",e[0].dataType,p,n),w=()=>{let x="";if(i)x=`let cOffset = ${s.length===1?"0u":a==="NHWC"?`outputIndices[${s.length-1}] / ${n}`:"outputIndices[1]"};`;else if(a==="NCHW")x=`
            ${$.indicesSet("outputIndices","0","0")}
            let cOffset = ${$.indicesToOffset("outputIndices")};`;else{x=`var cIndices = ${h.type.indices}(0);
                       cIndices[0] = outputIndices[${s.length-1}];`;for(let v=1;v<h.rank;v++)x+=`cIndices[${v}] = outputIndices[${v}];`;x+=`let cOffset = ${h.indicesToOffset("cIndices")};`}return x},y=x=>`
  const epsilon = ${r};
  ${x.registerUniform("outputSize","u32").declareVariables(d,h,m,f,_,$)}
  ${x.mainStart()}
  ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${$.offsetToIndices(`global_idx * ${n}`)};
    ${w()}
    let scale = ${h.getByOffset("cOffset")};
    let bias = ${m.getByOffset("cOffset")};
    let inputMean = ${f.getByOffset("cOffset")};
    let inputVar = ${_.getByOffset("cOffset")};
    let x = ${d.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${$.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${n}`,inputDependencies:l?["rank","type","type","type","type"]:void 0},getShaderSource:y,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l?[{type:12,data:u},...k(s)]:[{type:12,data:u}]})}},ao=e=>g(e),so=(e,t)=>{let{inputs:r,outputCount:i}=e,a=ao({...t,outputCount:i});if(de.webgpu.validateInputContent&&ro(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(io(r,a))}}),no,oo,uo,Bc=C(()=>{"use strict";ae(),K(),no=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},oo=e=>{let t=e[0].dims,r=e[0].dims[2],i=D.size(t)/4,a=e[0].dataType,s=A("input",a,t,4),n=A("bias",a,[r],4),o=A("residual",a,t,4),u=j("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:l=>`
  const channels = ${r}u / 4;
  ${l.declareVariables(s,n,o,u)}

  ${l.mainStart()}
    ${l.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${s.getByOffset("global_idx")}
      + ${n.getByOffset("global_idx % channels")} + ${o.getByOffset("global_idx")};
    ${u.setByOffset("global_idx","value")}
  }`}},uo=e=>{no(e.inputs),e.compute(oo(e.inputs))}}),lo,Ie,po,co,ho,fo,mo,go,yo,_o,wo,bo,$o,vo,xo,So,ia,To,Sa,Eo,ko,Io,zo,Co,Ao,Oo,Ro,Bo,Mo,Do,Po,Uo,No,Lo,qo,cs,Vo,hs,fs,Fo,Go,Wo,jo,Ho,Ko,ms=C(()=>{"use strict";oe(),ae(),b(),K(),lo=(e,t,r,i,a,s,n)=>{let o=Math.ceil(t/4),u="";typeof a=="string"?u=`${a}(a)`:u=a("a");let l=A("inputData",r,[o],4),p=j("outputData",i,[o],4),d=[{name:"vec_size",type:"u32"}];return n&&d.push(...n),`
      ${e.registerUniforms(d).declareVariables(l,p)}

  ${s??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${l.getByOffset("global_idx")};
    ${p.setByOffset("global_idx",u)}
  }`},Ie=(e,t,r,i,a,s=e.dataType,n,o)=>{let u=[{type:12,data:Math.ceil(D.size(e.dims)/4)}];return n&&u.push(...n),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:l=>lo(l,D.size(e.dims),e.dataType,s,r,i,o),getRunData:l=>({outputs:[{dims:e.dims,dataType:s}],dispatchGroup:{x:Math.ceil(D.size(l[0].dims)/64/4)},programUniforms:u})}},po=e=>{e.compute(Ie(e.inputs[0],"Abs","abs"))},co=e=>{e.compute(Ie(e.inputs[0],"Acos","acos"))},ho=e=>{e.compute(Ie(e.inputs[0],"Acosh","acosh"))},fo=e=>{e.compute(Ie(e.inputs[0],"Asin","asin"))},mo=e=>{e.compute(Ie(e.inputs[0],"Asinh","asinh"))},go=e=>{e.compute(Ie(e.inputs[0],"Atan","atan"))},yo=e=>{e.compute(Ie(e.inputs[0],"Atanh","atanh"))},_o=e=>g(e),wo=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(Ie(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},bo=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return g({min:t,max:r})},$o=(e,t)=>{let r=t||bo(e.inputs),i=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},vo=e=>{e.compute(Ie(e.inputs[0],"Ceil","ceil"))},xo=e=>{e.compute(Ie(e.inputs[0],"Cos","cos"))},So=e=>{e.compute(Ie(e.inputs[0],"Cosh","cosh"))},ia=e=>g(e),To=(e,t)=>{let r=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},Sa=(e="f32")=>`
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
}`,Eo=e=>{let t=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,Sa(t)))},ko=e=>{e.compute(Ie(e.inputs[0],"Exp","exp"))},Io=e=>{e.compute(Ie(e.inputs[0],"Floor","floor"))},zo=e=>{let t=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,Sa(t)))},Co=(e,t)=>{let r=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},Ao=e=>{e.compute(Ie(e.inputs[0],"Not",t=>`!${t}`))},Oo=e=>{e.compute(Ie(e.inputs[0],"Neg",t=>`-${t}`))},Ro=e=>{e.compute(Ie(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},Bo=e=>{let t=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},Mo=e=>{e.compute(Ie(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},Do=e=>g(e),Po=(e,t)=>{let r=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},Uo=e=>{e.compute(Ie(e.inputs[0],"Sin","sin"))},No=e=>{e.compute(Ie(e.inputs[0],"Sinh","sinh"))},Lo=e=>{e.compute(Ie(e.inputs[0],"Sqrt","sqrt"))},qo=e=>{e.compute(Ie(e.inputs[0],"Tan","tan"))},cs=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,Vo=e=>{e.compute(Ie(e.inputs[0],"Tanh",cs))},hs=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${cs("v")};
}
`,fs=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,Fo=e=>{let t=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"FastGelu",fs,hs(t),void 0,e.inputs[0].dataType))},Go=(e,t)=>{let r=I(e.inputs[0].dataType);return e.compute(Ie(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Wo=e=>{e.compute(Ie(e.inputs[0],"Log","log"))},jo=(e,t)=>`
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
`,Ho=e=>`quick_gelu_impl(${e})`,Ko=(e,t)=>{let r=I(e.inputs[0].dataType);e.compute(Ie(e.inputs[0],"QuickGelu",Ho,jo(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),Zo,Qo,Xo,Mc=C(()=>{"use strict";ae(),K(),ms(),Zo=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},Qo=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=A("input",e[0].dataType,e[0].dims,4),i=A("bias",e[0].dataType,[e[0].dims[2]],4),a=j("output",e[0].dataType,t,4),s=D.size(t)/4,n=B(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)}}),getShaderSource:o=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${o.declareVariables(r,i,a)}

  ${Sa(n)}

  ${o.mainStart()}
    ${o.guardAgainstOutOfBoundsWorkgroupSizes(s)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Xo=e=>{Zo(e.inputs),e.compute(Qo(e.inputs))}}),Yo,Jo,Mt,eu,tu,ru,iu,au,su,nu,ou,uu,lu,Dc=C(()=>{"use strict";oe(),ae(),K(),Yo=(e,t,r,i,a,s,n,o,u,l,p,d)=>{let h,m;typeof o=="string"?h=m=(y,x)=>`${o}((${y}),(${x}))`:typeof o=="function"?h=m=o:(h=o.scalar,m=o.vector);let f=j("outputData",p,i.length,4),_=A("aData",u,t.length,4),$=A("bData",l,r.length,4),w;if(a)if(s){let y=D.size(t)===1,x=D.size(r)===1,v=t.length>0&&t[t.length-1]%4===0,E=r.length>0&&r[r.length-1]%4===0;y||x?w=f.setByOffset("global_idx",m(y?`${_.type.value}(${_.getByOffset("0")}.x)`:_.getByOffset("global_idx"),x?`${$.type.value}(${$.getByOffset("0")}.x)`:$.getByOffset("global_idx"))):w=`
            let outputIndices = ${f.offsetToIndices("global_idx * 4u")};
            let offsetA = ${_.broadcastedIndicesToOffset("outputIndices",f)};
            let offsetB = ${$.broadcastedIndicesToOffset("outputIndices",f)};
            ${f.setByOffset("global_idx",m(n||v?_.getByOffset("offsetA / 4u"):`${_.type.value}(${_.getByOffset("offsetA / 4u")}[offsetA % 4u])`,n||E?$.getByOffset("offsetB / 4u"):`${$.type.value}(${$.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else w=f.setByOffset("global_idx",m(_.getByOffset("global_idx"),$.getByOffset("global_idx")));else{if(!s)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let y=(x,v,E="")=>{let z=`aData[indexA${v}][componentA${v}]`,R=`bData[indexB${v}][componentB${v}]`;return`
            let outputIndices${v} = ${f.offsetToIndices(`global_idx * 4u + ${v}u`)};
            let offsetA${v} = ${_.broadcastedIndicesToOffset(`outputIndices${v}`,f)};
            let offsetB${v} = ${$.broadcastedIndicesToOffset(`outputIndices${v}`,f)};
            let indexA${v} = offsetA${v} / 4u;
            let indexB${v} = offsetB${v} / 4u;
            let componentA${v} = offsetA${v} % 4u;
            let componentB${v} = offsetB${v} % 4u;
            ${x}[${v}] = ${E}(${h(z,R)});
          `};p===9?w=`
            var data = vec4<u32>(0);
            ${y("data",0,"u32")}
            ${y("data",1,"u32")}
            ${y("data",2,"u32")}
            ${y("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:w=`
            ${y("outputData[global_idx]",0)}
            ${y("outputData[global_idx]",1)}
            ${y("outputData[global_idx]",2)}
            ${y("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(_,$,f)}

        ${d??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${w}
      }`},Jo=(e,t,r,i,a,s,n=r.dataType)=>{let o=r.dims.map(Number),u=i.dims.map(Number),l=!D.areEqual(o,u),p=o,d=D.size(o),h=!1,m=!1,f=[l];if(l){let _=Nt.calcShape(o,u,!1);if(!_)throw new Error("Can't perform binary op on the given tensors");p=_.slice(),d=D.size(p);let $=D.size(o)===1,w=D.size(u)===1,y=o.length>0&&o[o.length-1]%4===0,x=u.length>0&&u[u.length-1]%4===0;f.push($),f.push(w),f.push(y),f.push(x);let v=1;for(let E=1;E<p.length;E++){let z=o[o.length-E],R=u[u.length-E];if(z===R)v*=z;else break}v%4===0?(m=!0,h=!0):($||w||y||x)&&(h=!0)}else h=!0;return f.push(h),{name:e,shaderCache:{hint:t+f.map(_=>_.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:_=>Yo(_,o,u,p,h,l,m,a,r.dataType,i.dataType,n,s),getRunData:()=>({outputs:[{dims:p,dataType:n}],dispatchGroup:{x:Math.ceil(d/64/4)},programUniforms:[{type:12,data:Math.ceil(D.size(p)/4)},...k(o,u,p)]})}},Mt=(e,t,r,i,a,s)=>{e.compute(Jo(t,a??"",e.inputs[0],e.inputs[1],r,i,s))},eu=e=>{Mt(e,"Add",(t,r)=>`${t}+${r}`)},tu=e=>{Mt(e,"Div",(t,r)=>`${t}/${r}`)},ru=e=>{Mt(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},iu=e=>{Mt(e,"Mul",(t,r)=>`${t}*${r}`)},au=e=>{let t=A("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Mt(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
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
      `)},su=e=>{Mt(e,"Sub",(t,r)=>`${t}-${r}`)},nu=e=>{Mt(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},ou=e=>{Mt(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},uu=e=>{Mt(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},lu=e=>{Mt(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),du,pu,cu,hu,fu,mu,Pc=C(()=>{"use strict";oe(),ae(),b(),K(),du=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,s=i.dims.length;e.forEach((n,o)=>{if(o!==r){if(n.dataType!==a)throw new Error("input tensors should be one type");if(n.dims.length!==s)throw new Error("input tensors should have the same shape");n.dims.forEach((u,l)=>{if(l!==t&&u!==i.dims[l])throw new Error("non concat dimensions must match")})}})},pu=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,cu=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let s=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(s):a===0?i.push(`if (inputIndex == ${a}u) { ${s} }`):a===r-1?i.push(`else { ${s} }`):i.push(`else if (inputIndex == ${a}) { ${s} }`)}return i.join(`
`)},hu=(e,t,r,i)=>{let a=D.size(r),s=new Array(e.length),n=new Array(e.length),o=0,u=[],l=[],p=[{type:12,data:a}];for(let _=0;_<e.length;++_)o+=e[_].dims[t],s[_]=o,l.push(e[_].dims.length),n[_]=A(`input${_}`,i,l[_]),u.push("rank"),p.push({type:12,data:s[_]});for(let _=0;_<e.length;++_)p.push(...k(e[_].dims));p.push(...k(r));let d=j("output",i,r.length),h=d.indicesGet("indices",t),m=Array.from(Array(s.length).keys()).map(_=>`uniforms.sizeInConcatAxis${_}`).join(","),f=_=>`

  ${(()=>{_.registerUniform("outputSize","u32");for(let $=0;$<e.length;$++)_.registerUniform(`sizeInConcatAxis${$}`,"u32");return _.declareVariables(...n,d)})()}

  ${pu(s.length,m)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${d.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${h});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${s.length}u>(${m});
      ${h} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${cu(n,d)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:p}),getShaderSource:f}},fu=(e,t)=>{let r=e.inputs,i=r[0].dims,a=D.normalizeAxis(t.axis,i.length);du(r,a);let s=i.slice();s[a]=r.reduce((o,u)=>o+(u.dims.length>a?u.dims[a]:0),0);let n=r.filter(o=>D.size(o.dims)>0);e.compute(hu(n,a,s,r[0].dataType),{inputs:n})},mu=e=>g({axis:e.axis})}),Br,Mr,Dr,gs,Pr=C(()=>{"use strict";oe(),ae(),Br=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Mr=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},Dr=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},gs=e=>{let t=e?.activation||"";if(t==="HardSigmoid"){let[r,i]=e?.activation_params||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=e?.activation_params||[ji,Et];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=e?.activation_params||[.01];return{activation:t,alpha:r}}return{activation:t}}}),He,gu,ys=C(()=>{"use strict";He=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},gu=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),yu,Uc=C(()=>{"use strict";yu=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),aa,_s,ws=C(()=>{"use strict";oe(),ae(),K(),Pr(),aa=(e,t,r,i,a)=>{let s=i-r;return`
      ${Array.from({length:r}).map((n,o)=>`
      if (${M(t.shape,o,t.rank)} != 1) {
        ${t.indicesSet(e,o,M(a,o+s,i))}
      } else {
        ${t.indicesSet(e,o,0)}
      }`).join("")}
`},_s=(e,t,r,i,a=!1,s)=>{let n=e[0].dims,o=e[1].dims,u=n[n.length-2],l=o[o.length-1],p=n[n.length-1],d=O(l),h=O(p),m=O(u),f=D.size(r)/d/m,_=e.length>2,$=i?i.slice(0,-2):r.slice(0,-2),w=[D.size($),u,l],y=[{type:12,data:f},{type:12,data:u},{type:12,data:l},{type:12,data:p}];Mr(t,y),y.push(...k($,n,o)),_&&y.push(...k(e[2].dims)),y.push(...k(w));let x=v=>{let E=ce("batch_dims",e[0].dataType,$.length),z=A("a",e[0].dataType,n.length,h),R=A("b",e[1].dataType,o.length,d),N=j("output",e[0].dataType,w.length,d),F=B(N.type.tensor),Q=Br(t,N.type.value,F),ye=[z,R],ie="";if(_){let X=a?d:1;ye.push(A("bias",e[2].dataType,e[2].dims.length,X)),ie=`${a?`value += bias[col / ${X}];`:`value += ${N.type.value}(bias[row + i]);`}`}let se=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];Dr(t,se);let ke=()=>{let X=`var a_data: ${z.type.value};`;for(let te=0;te<h;te++)X+=`
              let b_data${te} = b[(b_offset + (k + ${te}) * uniforms.N + col) / ${d}];`;for(let te=0;te<m;te++){X+=`a_data = a[(a_offset + (row + ${te}) * uniforms.K + k) / ${h}];`;for(let me=0;me<h;me++)X+=`
            values[${te}] = fma(${R.type.value}(a_data${h===1?"":`[${me}]`}), b_data${me}, values[${te}]);
`}return X};return`
  ${v.registerUniforms(se).registerInternalVariables(E).declareVariables(...ye,N)}
  ${v.mainStart()}
    ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${d})) * ${d};
    var index1 = global_idx / (uniforms.N / ${d});
    let stride1 = uniforms.M / ${m};
    let row = (index1 % stride1) * ${m};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${E.offsetToIndices("batch")};`}

    var a_indices: ${z.type.indices};
    ${aa("a_indices",z,z.rank-2,E.rank,"batch_indices")}
    ${z.indicesSet("a_indices",z.rank-2,0)}
    ${z.indicesSet("a_indices",z.rank-1,0)}
    let a_offset = ${z.indicesToOffset("a_indices")};

    var b_indices: ${R.type.indices};
    ${aa("b_indices",R,R.rank-2,E.rank,"batch_indices")}
    ${R.indicesSet("b_indices",R.rank-2,0)}
    ${R.indicesSet("b_indices",R.rank-1,0)}
    let b_offset = ${R.indicesToOffset("b_indices")};
    var values: array<${N.type.value}, ${m}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${h}) {
      ${ke()}
    }
    for (var i = 0u; i < ${m}u; i++) {
      var value = values[i];
      ${ie}
      ${Q}
      let cur_indices = ${N.type.indices}(batch, row + i, col);
      let offset = ${N.indicesToOffset("cur_indices")};
      ${N.setByOffset(`offset / ${d}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${d};${h};${m};${a}`,inputDependencies:_?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(f/64)},programUniforms:y}),getShaderSource:x}}}),_u,wu,bs,$s,bu,vs,$u,Ta,xs=C(()=>{"use strict";oe(),ae(),K(),Pr(),ws(),ys(),_u=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,wu=(e,t)=>e?`
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
        }`,bs=(e,t,r="f32",i,a=!1,s=32,n=!1,o=32)=>{let u=t[1]*e[1],l=t[0]*e[0],p=a?u:s,d=a?s:u,h=p/t[0],m=s/t[1];if(!((a&&h===4&&e[1]===4||!a&&(h===3||h===4))&&p%t[0]===0&&s%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${h} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${h} must be 3 or 4.
  tileAWidth ${p} must be divisible by workgroupSize[0]${t[0]}. tileInner ${s} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${h}<${r}>, ${p/h}>, ${d}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${l/e[0]}>, ${s}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${h};
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
  let batch = ${n?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${u};

  let num_tiles = ${n?`${Math.ceil(o/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${n?`i32(globalId.z) * ${o}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${m};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${_u(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${m}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${h===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${wu(a,h)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},$s=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,bu=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",vs=(e,t,r="f32",i,a=!1,s=32,n=!1,o=32,u=!1)=>{let l=e[1]*t[1],p=e[0]*t[0],d=a?l:s,h=a?s:l;if(!(h%t[1]===0&&d%t[0]===0&&s%t[1]===0))throw new Error(`tileAHight ${h} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${d} must be divisible by workgroupSize[0]${t[0]}, tileInner ${s} must be divisible by workgroupSize[1]${t[1]}`);let m=h/t[1],f=d/t[0],_=s/t[1],$=u?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${l};
    let globalColStart = i32(workgroupId.x) * ${p};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${h}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${d}; inputCol = inputCol + ${t[0]}) {
          ${$s(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${s}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${p}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
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
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
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
let globalRowStart = i32(workgroupId.y) * ${l};

let tileRowA = i32(localId.y) * ${m};
let tileColA = i32(localId.x) * ${f};
let tileRowB = i32(localId.y) * ${_};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${m}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${f}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${$s(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${_}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
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
      ${bu(a)}
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
  var<workgroup> mm_Asub : array<array<${r}, ${d}>, ${h}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${p}>, ${s}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${s};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${n?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${n?`${Math.ceil(o/s)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${n?`i32(globalId.z) * ${o}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${$}
  }
`},$u=(e,t,r,i,a=!1)=>{let[s,n,o,u]=i,l=B(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${He(e,l)} {
      var value = ${He(e,l)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${n.type.indices};
        ${aa("aIndices",n,n.rank-2,s.rank,"batchIndices")}
        ${n.indicesSet("aIndices",n.rank-2,"u32(row)")}
        ${n.indicesSet("aIndices",n.rank-1,"u32(colIn)")}
        value = ${n.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${s.type.indices}) -> ${He(e,l)} {
      var value = ${He(e,l)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${o.type.indices};
        ${aa("bIndices",o,o.rank-2,s.rank,"batchIndices")}
        ${o.indicesSet("bIndices",o.rank-2,"u32(row)")}
        ${o.indicesSet("bIndices",o.rank-1,"u32(colIn)")}
        value = ${o.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${He(e,l)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${He(e,l)}(bias[row])`};`:""}
        ${r}
        ${u.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Ta=(e,t,r,i,a=!1,s)=>{let n=e[0].dims,o=e[1].dims,u=n.slice(0,-2),l=o.slice(0,-2),p=i?i.slice(0,-2):r.slice(0,-2),d=D.size(p),h=n[n.length-2],m=n[n.length-1],f=o[o.length-1],_=m%4===0&&f%4===0,$=h<=8?[4,1,1]:[4,4,1],w=[8,8,1],y=[Math.ceil(f/w[0]/$[0]),Math.ceil(h/w[1]/$[1]),Math.ceil(d/w[2]/$[2])],x=_?4:1,v=[...u,h,m/x],E=v.length,z=[...l,m,f/x],R=z.length,N=[d,h,f/x],F=[{type:6,data:h},{type:6,data:f},{type:6,data:m}];Mr(t,F),F.push(...k(p,v,z));let Q=["rank","rank"],ye=e.length>2;ye&&(F.push(...k(e[2].dims)),Q.push("rank")),F.push(...k(N));let ie=se=>{let ke=p.length,X=ce("batchDims",e[0].dataType,ke,1),te=B(e[0].dataType),me=A("a",e[0].dataType,E,x),_e=A("b",e[1].dataType,R,x),he=j("result",e[0].dataType,N.length,x),ve=[me,_e];if(ye){let Qe=a?x:1;ve.push(A("bias",e[2].dataType,e[2].dims.length,Qe))}let W=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];Dr(t,W);let pe=B(he.type.tensor),ne=Br(t,he.type.value,pe),Y=$u(x,ye,ne,[X,me,_e,he],a);return`
  ${se.registerUniforms(W).registerInternalVariables(X).declareVariables(...ve,he)}
  ${Y}
  ${_?bs($,w,te,X):vs($,w,te,X)}
                   `};return{name:"MatMul",shaderCache:{hint:`${$};${t.activation};${_};${a}`,inputDependencies:Q},getRunData:()=>({outputs:[{dims:s?s(r):r,dataType:e[0].dataType}],dispatchGroup:{x:y[0],y:y[1],z:y[2]},programUniforms:F}),getShaderSource:ie}}}),vu,xu,Nc=C(()=>{"use strict";oe(),ht(),K(),Pr(),ys(),Uc(),xs(),vu=(e,t,r,i,a=!1,s,n=4,o=4,u=4,l="f32")=>{let p=F=>{switch(F){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${l}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${F} is not supported.`)}},d=F=>{switch(F){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${F} is not supported.`)}},h=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,m=e?`
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
    `,f=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",_=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",$=e?"row":"col",w=e?"col":"row",y=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${$} / outWidth;
    let outCol = ${$} % outWidth;

    let WRow = ${w} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${w} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${w} % inChannels;
    var resData = ${He(n,l)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${f} && xCol >= 0 && xCol < ${_}) {
      ${h}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${p(n)}
    }
    return resData;`,x=e?t&&i?`
    let col = colIn * ${n};
    ${y}`:`
    let col = colIn * ${n};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${y}
    }
    return ${He(n,l)}(0.0);`:i&&r?`
    let col = colIn * ${n};
    ${y}`:`
    let col = colIn * ${n};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${y}
    }
    return ${He(n,l)}(0.0);`,v=e?i&&r?d(o):`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${d(o)}
    }
    return ${He(o,l)}(0.0);`:`
    let col = colIn * ${o};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${d(o)}
    }
    return ${He(o,l)}(0.0);`,E=He(u,l),z=He(e?n:o,l),R=He(e?o:n,l),N=Br(s,E,l);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${z} {
      ${e?x:v}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${R} {
      ${e?v:x}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${u};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${m}
      ${gu(a)}
      ${N}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},xu=(e,t,r,i,a,s,n,o,u)=>{let l=t.format==="NHWC",p=l?e[0].dims[3]:e[0].dims[1],d=r[0],h=l?r[2]:r[3],m=l?r[1]:r[2],f=l?r[3]:r[1],_=l&&(p%4===0||p%3===0)&&f%4===0,$=l?f:h*m,w=l?h*m:f,y=[8,8,1],x=i<=8?[4,1,1]:[4,4,1],v=[Math.ceil($/y[0]/x[0]),Math.ceil(w/y[1]/x[1]),Math.ceil(d/y[2]/x[2])];we("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${v}`);let E=_?l&&p%4!==0?3:4:1,z=y[1]*x[1],R=y[0]*x[0],N=Math.max(y[0]*E,y[1]),F=i%z===0,Q=a%R===0,ye=s%N===0,ie=_?[E,4,4]:[1,1,1],se=[{type:6,data:i},{type:6,data:a},{type:6,data:s},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Mr(t,se),se.push(...k(e[0].dims,e[1].dims));let ke=["rank","rank"];n&&(se.push(...k(e[2].dims)),ke.push("rank")),se.push(...k(r));let X=te=>{let me=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];Dr(t,me);let _e=_?4:1,he=B(e[0].dataType),ve=`
      fn setOutputAtIndex(flatIndex : i32, value : ${_?`vec4<${he}>`:he}) {
        result[flatIndex] = ${_?`vec4<${he}>`:he}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${_?`vec4<${he}>`:he}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${_?"/ 4":""}, value);
      }`,W=A("x",e[0].dataType,e[0].dims.length,E===3?1:E),pe=A("w",e[1].dataType,e[1].dims.length,_e),ne=[W,pe],Y=j("result",e[0].dataType,r.length,_e);if(n){let Qe=A("bias",e[2].dataType,e[2].dims.length,_e);ne.push(Qe),ve+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${_?`vec4<${he}>`:he} {
          return bias[coords.${l?"w":"y"}${_?"/ 4":""}];
        }`}return`
        ${yu("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${te.registerUniforms(me).declareVariables(...ne,Y)}
        ${ve}
        ${vu(l,F,Q,ye,n,t,ie[0],ie[1],ie[2],he)}
        ${_?bs(x,y,he,void 0,!l,N):vs(x,y,he,void 0,!l,N,!1,void 0,o)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${E};${_};${F};${Q};${ye};${z};${R};${N}`,inputDependencies:ke},getRunData:()=>({outputs:[{dims:u?u(r):r,dataType:e[0].dataType}],dispatchGroup:{x:v[0],y:v[1],z:v[2]},programUniforms:se}),getShaderSource:X}}}),Su,Ss,sa,Tu,Ts,Eu,ku,Iu,Lc=C(()=>{"use strict";oe(),ht(),ae(),K(),Pr(),ys(),Su=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Ss=e=>typeof e=="number"?[e,e,e]:e,sa=(e,t)=>t<=1?e:e+(e-1)*(t-1),Tu=(e,t,r,i=1)=>{let a=sa(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},Ts=(e,t,r,i,a)=>{a==null&&(a=Tu(e,t[0],i[0]));let s=[0,0,0,r];for(let n=0;n<3;n++)e[n]+2*a>=t[n]&&(s[n]=Math.trunc((e[n]-t[n]+2*a)/i[n]+1));return s},Eu=(e,t,r,i,a,s,n,o,u,l)=>{let p,d,h,m;if(e==="VALID"&&(e=0),typeof e=="number"){p={top:e,bottom:e,left:e,right:e,front:e,back:e};let f=Ts([t,r,i,1],[o,u,l],1,[a,s,n],e);d=f[0],h=f[1],m=f[2]}else if(Array.isArray(e)){if(!e.every((_,$,w)=>_===w[0]))throw Error(`Unsupported padding parameter: ${e}`);p={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let f=Ts([t,r,i,1],[o,u,l],1,[a,s,n],e[0]);d=f[0],h=f[1],m=f[2]}else if(e==="SAME_UPPER"){d=Math.ceil(t/a),h=Math.ceil(r/s),m=Math.ceil(i/n);let f=(d-1)*a+o-t,_=(h-1)*s+u-r,$=(m-1)*n+l-i,w=Math.floor(f/2),y=f-w,x=Math.floor(_/2),v=_-x,E=Math.floor($/2),z=$-E;p={top:x,bottom:v,left:E,right:z,front:w,back:y}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:p,outDepth:d,outHeight:h,outWidth:m}},ku=(e,t,r,i,a,s=!1,n="channelsLast")=>{let o,u,l,p,d;if(n==="channelsLast")[o,u,l,p,d]=e;else if(n==="channelsFirst")[o,d,u,l,p]=e;else throw new Error(`Unknown dataFormat ${n}`);let[h,,m,f,_]=t,[$,w,y]=Ss(r),[x,v,E]=Ss(i),z=sa(m,x),R=sa(f,v),N=sa(_,E),{padInfo:F,outDepth:Q,outHeight:ye,outWidth:ie}=Eu(a,u,l,p,$,w,y,z,R,N),se=s?h*d:h,ke=[0,0,0,0,0];return n==="channelsFirst"?ke=[o,se,Q,ye,ie]:n==="channelsLast"&&(ke=[o,Q,ye,ie,se]),{batchSize:o,dataFormat:n,inDepth:u,inHeight:l,inWidth:p,inChannels:d,outDepth:Q,outHeight:ye,outWidth:ie,outChannels:se,padInfo:F,strideDepth:$,strideHeight:w,strideWidth:y,filterDepth:m,filterHeight:f,filterWidth:_,effectiveFilterDepth:z,effectiveFilterHeight:R,effectiveFilterWidth:N,dilationDepth:x,dilationHeight:v,dilationWidth:E,inShape:e,outShape:ke,filterShape:t}},Iu=(e,t,r,i,a,s)=>{let n=s==="channelsLast",o=n?e[0].dims[3]:e[0].dims[1],u=!1,l=[64,1,1],p={x:r.map((y,x)=>x)},d=[Math.ceil(Su(p.x.map(y=>r[y]))/l[0]),1,1];we("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${d}`);let h=u?n&&o%4!==0?3:4:1,m=D.size(r),f=[{type:12,data:m},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Mr(t,f),f.push(...k(e[0].dims,e[1].dims));let _=["rank","rank"],$=e.length===3;$&&(f.push(...k(e[2].dims)),_.push("rank")),f.push(...k(r));let w=y=>{let x=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];Dr(t,x);let v=u?4:1,E=B(e[0].dataType),z=A("x",e[0].dataType,e[0].dims.length,h===3?1:h),R=A("W",e[1].dataType,e[1].dims.length,v),N=[z,R],F=j("result",e[0].dataType,r.length,v),Q="";if($){let se=A("bias",e[2].dataType,e[2].dims.length,v);N.push(se),Q+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${u?`vec4<${E}>`:E} {
          return bias[${n?M("coords",4,5):M("coords",1,5)}${u?"/ 4":""}];
        }`}let ye=He(h,E),ie=Br(t,ye,E);return`
            ${Q}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${z.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${R.getByIndices("aIndices")};
            }
          ${y.registerUniforms(x).declareVariables(...N,F)}
          ${y.mainStart()}
          ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${F.offsetToIndices("global_idx")};
              let batch = ${M("coords",0,z.rank)};
              let d2 = ${n?M("coords",z.rank-1,z.rank):M("coords",1,z.rank)};
              let xFRCCorner = vec3<u32>(${n?M("coords",1,z.rank):M("coords",2,z.rank)},
              ${n?M("coords",2,z.rank):M("coords",3,z.rank)},
              ${n?M("coords",3,z.rank):M("coords",4,z.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${n?M("uniforms.x_shape",1,z.rank):M("uniforms.x_shape",2,z.rank)};
              let xShapeZ = ${n?M("uniforms.x_shape",2,z.rank):M("uniforms.x_shape",3,z.rank)};
              let xShapeW = ${n?M("uniforms.x_shape",3,z.rank):M("uniforms.x_shape",4,z.rank)};
              let xShapeU = ${n?M("uniforms.x_shape",4,z.rank):M("uniforms.x_shape",1,z.rank)};
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
                      ${n?`let xValues = vec4<f32>(
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
                        ${n?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${n?`let xValues = vec2<f32>(
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
                      ${n?`let xValues = vec3<f32>(
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
              ${$?"value = value + getBiasByOutputCoords(coords)":""};
              ${ie}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${n};${h};${$}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:d[0],y:d[1],z:d[2]},programUniforms:f}),getShaderSource:w}}}),zu,Cu,qc=C(()=>{"use strict";oe(),ae(),K(),Pr(),zu=(e,t,r,i)=>{let a=e.length>2,s=a?"value += b[output_channel];":"",n=e[0].dims,o=e[1].dims,u=t.format==="NHWC",l=u?r[3]:r[1],p=l/t.group,d=u&&p>=4?O(l):1,h=D.size(r)/d,m=[{type:12,data:h},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:p}];Mr(t,m),m.push(...k(n,[o[0],o[1],o[2],o[3]/d]));let f=a?["rank","rank","rank"]:["rank","rank"];m.push(...k([r[0],r[1],r[2],r[3]/d]));let _=$=>{let w=j("output",e[0].dataType,r.length,d),y=B(w.type.tensor),x=Br(t,w.type.value,y),v=A("x",e[0].dataType,n.length),E=A("w",e[1].dataType,o.length,d),z=[v,E];a&&z.push(A("b",e[2].dataType,e[2].dims,d));let R=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];Dr(t,R);let N=u?`
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
            let xVal = ${v.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${E.get("wHeight","wWidth","wInChannel","output_channel")};
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

            let xVal = ${v.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${E.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${$.registerUniforms(R).declareVariables(...z,w)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${w.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${u?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${u?1:2}], outputIndices[${u?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${d} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${u?2:1}];

    var value: ${w.type.value} = ${w.type.value}(0);
    ${N}
    ${s}
    ${x}
    ${w.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${d}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:m}),getShaderSource:_}},Cu=(e,t,r,i)=>{let a=e.length>2,s=O(r[3]),n=O(r[2]),o=D.size(r)/s/n,u=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/s],l=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/s],p=[r[0],r[1],r[2],r[3]/s],d=[{type:12,data:o},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Mr(t,d),d.push(...k(u,l,p));let h=(n-1)*t.strides[1]+l[1],m=f=>{let _=j("output",e[0].dataType,p.length,s),$=B(_.type.tensor),w=Br(t,_.type.value,$),y=A("x",e[0].dataType,u.length,s),x=A("w",e[1].dataType,l.length,s),v=[y,x];a&&v.push(A("b",e[2].dataType,e[2].dims,s));let E=a?"value += b[output_channel];":"",z=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return Dr(t,z),`
  ${f.registerUniforms(z).declareVariables(...v,_)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${n}u;
    let col = (index1 % width1) * ${n}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${y.type.value}, ${h}>;
    var values: array<${_.type.value}, ${n}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${l[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${h}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${y.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${y.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${l[1]}; w_width++) {
          let w_val = ${x.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${n}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${n}u; i++) {
      var value = values[i];
      ${E}
      ${w}
      ${_.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${s};${n};${h};${l[0]};${l[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:d}),getShaderSource:m}}}),Au,Ea,Ou,ka,Es,ks,Ru,Bu,Is,Vc=C(()=>{"use strict";ae(),Nc(),Lc(),xs(),qc(),Pr(),ws(),It(),Au=(e,t,r,i,a,s)=>{let n=e[0],o=e.slice(s?1:2,s?3:4),u=o.length,l=t[0],p=t.slice(2).map((h,m)=>h+(h-1)*(r[m]-1)),d=o.map((h,m)=>h+i[m]+i[m+u]).map((h,m)=>Math.floor((h-p[m]+a[m])/a[m]));return d.splice(0,0,n),d.splice(s?3:1,0,l),d},Ea=[2,3,1,0],Ou=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},ka=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let s=2;s<t[1].dims.length;++s)r[s-2]===0&&(r[s-2]=t[1].dims[s]);let i=e.pads.slice();Yt.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},Es=e=>{let t=gs(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,s=e.group,n=e.kernel_shape,o=e.pads,u=e.strides,l=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:s,kernelShape:n,pads:o,strides:u,wIsConst:l,...t,cacheKey:`${e.format};${t.activation};`}},ks=(e,t,r,i)=>{let a=r.format==="NHWC",s=Au(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let z=[t[0]];if(a){let R=e.kernelCustomData.wT??e.compute(Je(t[1],Ea),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=R),z.push(R)}else z.push(t[1]);t.length===3&&z.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Cu(z,r,s,i),{inputs:z}):e.compute(zu(z,r,s,i),{inputs:z});return}let n=t.length===3,o=t[0].dims[a?1:2],u=t[0].dims[a?2:3],l=t[0].dims[a?3:1],p=t[1].dims[2],d=t[1].dims[3],h=s[a?1:2],m=s[a?2:3],f=s[a?3:1],_=a&&p===o&&d===u&&r.pads[0]===0&&r.pads[1]===0;if(_||p===1&&d===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let z=s[0],R,N,F,Q=[];if(a){let se=e.kernelCustomData.wT??e.compute(Je(t[1],Ea),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=se),_){let ke=o*u*l;R=t[0].reshape([1,z,ke]),N=se.reshape([1,ke,f]),F=[1,z,f]}else R=t[0].reshape([z,o*u,l]),N=se.reshape([1,l,f]),F=[z,h*m,f];Q.push(R),Q.push(N)}else R=t[0].reshape([z,l,o*u]),N=t[1].reshape([1,f,l]),F=[z,f,h*m],Q.push(N),Q.push(R);n&&Q.push(t[2]);let ye=F[2],ie=Q[0].dims[Q[0].dims.length-1];ye<8&&ie<8?e.compute(_s(Q,r,s,F,a,i),{inputs:Q}):e.compute(Ta(Q,r,s,F,a,i),{inputs:Q});return}let $=!0,w=e.kernelCustomData.wT??e.compute(Je(t[1],Ea),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=w);let y=[t[0],w];n&&y.push(t[2]);let x=a?h*m:f,v=a?f:h*m,E=p*d*l;e.compute(xu(y,r,s,x,v,E,n,$,i),{inputs:y})},Ru=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],s=[1].concat(t.strides),n=[1].concat(t.dilations),o=[1].concat(t.kernelShape),u=ka({...t,pads:a,strides:s,dilations:n,kernelShape:o},i);ks(e,i,u,l=>r?[l[0],l[2],l[3]]:[l[0],l[1],l[3]])},Bu=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=ka(r,t),s=r.autoPad==="NOTSET"?r.pads:r.autoPad,n=ku(t[0].dims,t[1].dims,r.strides,r.dilations,s,!1,i);e.compute(Iu(t,a,n.outShape,[n.filterDepth,n.filterHeight,n.filterWidth],[n.padInfo.front,n.padInfo.top,n.padInfo.left],i))},Is=(e,t)=>{if(Ou(e.inputs,t),e.inputs[0].dims.length===3)Ru(e,t);else if(e.inputs[0].dims.length===5)Bu(e,e.inputs,t);else{let r=ka(t,e.inputs);ks(e,e.inputs,r)}}}),Mu,Fc=C(()=>{"use strict";oe(),ht(),ae(),K(),Mu=(e,t,r)=>{let i=e.length>2,a=t.outputShape,s=t.format==="NHWC",n=t.group,o=e[1].dims,u=o[2]/n,l=o[3],p=s?O(u):1,d=s&&l===1&&u>=4,h=d?Math.floor(u/4)*4:Math.floor(u/p)*p,m=u-h,f=s?O(l):1,_=s?l===1?p:f:1,$=D.size(a)/f,w=[Math.ceil($/64),1,1];we("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${w}`);let y=["rank","rank"],x=[t.strides[0],t.strides[1]],v=[t.kernelShape[s?1:2],t.kernelShape[s?2:3]],E=[t.dilations[0],t.dilations[1]],z=[v[0]+(t.dilations[0]<=1?0:(t.kernelShape[s?1:2]-1)*(t.dilations[0]-1)),v[1]+(t.dilations[1]<=1?0:(t.kernelShape[s?2:3]-1)*(t.dilations[1]-1))],R=[z[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),z[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],N=[{type:12,data:$},{type:12,data:x},{type:12,data:v},{type:12,data:E},{type:12,data:z},{type:6,data:R},{type:12,data:h},{type:12,data:u},{type:12,data:l},...k(e[0].dims,e[1].dims)];i&&(N.push(...k(e[2].dims)),y.push("rank")),N.push(...k(a));let F=Q=>{let ye=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:x.length},{name:"filter_dims",type:"u32",length:v.length},{name:"dilations",type:"u32",length:v.length},{name:"effective_filter_dims",type:"u32",length:z.length},{name:"pads",type:"i32",length:R.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],ie=B(e[0].dataType),se=s?1:2,ke=s?2:3,X=s?3:1,te=A("W",e[1].dataType,e[1].dims.length,_),me=A("Dy",e[0].dataType,e[0].dims.length,p),_e=[me,te];i&&_e.push(A("bias",e[2].dataType,[a[X]].length,f));let he=j("result",e[0].dataType,a.length,f),ve=()=>{let ne="";if(d)p===4?ne+=`
        let xValue = ${me.getByOffset("x_offset")};
        let wValue = ${te.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:p===2?ne+=`
          dotProd = dotProd + dot(vec4<${ie}>(${me.getByOffset("x_offset")}, ${me.getByOffset("x_offset + 1u")}), vec4<${ie}>(${te.getByOffset("w_offset")}, ${te.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:p===1&&(ne+=`
          dotProd = dotProd + dot(vec4<${ie}>(${me.getByOffset("x_offset")}, ${me.getByOffset("x_offset + 1u")}, ${me.getByOffset("x_offset + 2u")}, ${me.getByOffset("x_offset + 3u")}), vec4<${ie}>(${te.getByOffset("w_offset")}, ${te.getByOffset("w_offset + 1u")}, ${te.getByOffset("w_offset + 2u")}, ${te.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(ne+=`
                  let xValue = ${s?me.getByOffset(`${me.indicesToOffset(`${me.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${p}`):me.get("batch","inputChannel","idyR","idyC")};
        `,p===1)ne+=`
          let w_offset = ${te.indicesToOffset(`${te.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${te.getByOffset(`w_offset / ${_}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let Y=0;Y<p;Y++)ne+=`
            let wValue${Y} = ${te.getByOffset(`${te.indicesToOffset(`${te.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${Y}, wOutChannel)`)} / ${_}`)};
            dotProd = dotProd + xValue[${Y}] * wValue${Y};`;return ne},W=()=>{if(m===0)return"";if(!d)throw new Error(`packInputAs4 ${d} is not true.`);let ne="";if(p===1){ne+="dotProd = dotProd";for(let Y=0;Y<m;Y++)ne+=`
            + ${me.getByOffset(`x_offset + ${Y}`)} * ${te.getByOffset(`w_offset + ${Y}`)}`;ne+=";"}else if(p===2){if(m!==2)throw new Error(`Invalid inputChannelsRemainder ${m}.`);ne+=`
          let xValue = ${me.getByOffset("x_offset")};
          let wValue = ${te.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return ne},pe=`
            let outputIndices = ${he.offsetToIndices(`global_idx * ${f}`)};
            let batch = ${he.indicesGet("outputIndices",0)};
            let d1 = ${he.indicesGet("outputIndices",X)};
            let r = ${he.indicesGet("outputIndices",se)};
            let c = ${he.indicesGet("outputIndices",ke)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${he.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${ie}(dyRCorner) + ${ie}(wR)) / ${ie}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${ie}(uniforms.Dy_shape[${se}]) || fract(dyR) > 0.0 ||
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
                let dyC = (${ie}(dyCCorner) + ${ie}(wC)) / ${ie}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${ie}(uniforms.Dy_shape[${ke}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${d?`
                var x_offset = ${me.indicesToOffset(`${me.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${p};
                var w_offset = ${te.indicesToOffset(`${te.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${_};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${d?4:p}) {
                  ${ve()}
                  inputChannel = inputChannel + ${d?4:p};
                }
                ${W()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${f}]`:""};
            ${he.setByOffset("global_idx","value")};
          `;return`
    ${Q.registerUniforms(ye).declareVariables(..._e,he)}
      ${Q.mainStart()}
      ${Q.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${pe}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${p}${_}${f}${d}${m}`,inputDependencies:y},getRunData:()=>({dispatchGroup:{x:w[0],y:w[1],z:w[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:N}),getShaderSource:F}}}),Du,Pu,Uu,zs,Nu,Lu,Cs,qu,Vu,Gc=C(()=>{"use strict";Fc(),Pr(),It(),Du=(e,t,r,i,a,s)=>(e-1)*t+r+(i-1)*a+1-s,Pu=(e,t,r,i,a)=>{let s=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=s,r[a]=e-s):t==="SAME_LOWER"&&(r[i]=e-s,r[a]=s)},Uu=(e,t,r,i,a,s,n,o,u,l)=>{let p=e.length-2,d=l.length===0;u.length<p&&u.push(...Array(p-u.length).fill(0));let h=e[0],m=t[o?3:1]*a;for(let f=0,_=e.length-p-(o?1:0);f<p;++f,++_){let $=e[_],w=d?$*n[f]:l[f],y=Du($,n[f],s[f],t[_],r[f],w);Pu(y,i,s,f,f+p),d&&l.push(n[f]*($-1)+u[f]+(t[_]-1)*r[f]+1-s[f]-s[f+p])}l.splice(0,0,h),l.splice(o?3:1,0,m)},zs=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((d,h)=>d*h,1)===0){r.length=0;for(let d=2;d<t[1].dims.length;++d)r.push(t[1].dims[d])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),s=e.outputShape.slice(),n=e.outputPadding.slice(),o=t[0].dims,u=e.dilations.slice();if(u.reduce((d,h)=>d+h,0)===0){let d=t[0].dims.length-2;u=new Array(d).fill(1)}let l=e.strides.slice();if(l.reduce((d,h)=>d+h,0)===0){let d=t[0].dims.length-2;l=new Array(d).fill(1)}Uu(o,r,u,e.autoPad,e.group,a,l,i,n,s);let p=Object.assign({},e);return Object.assign(p,{kernelShape:r,pads:a,outputPadding:n,outputShape:s,dilations:u,strides:l}),p},Nu=e=>{let t=gs(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,s=e.group??1,n=e.kernelShape,o=e.pads,u=e.strides,l=e.wIsConst(),p=e.outputPadding,d=e.outputShape;return{autoPad:i,format:r,dilations:a,group:s,kernelShape:n,outputPadding:p,outputShape:d,pads:o,strides:u,wIsConst:l,...t,cacheKey:`${e.format};${t.activation};`}},Lu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let s=e[0].dims.length-2;if(t.dilations.reduce((n,o)=>n+o,0)>0&&t.dilations.length!==s)throw new Error(`dilations should be ${s}D`);if(t.strides.reduce((n,o)=>n+o,0)>0&&t.strides.length!==s)throw new Error(`strides should be ${s}D`);if(t.pads.reduce((n,o)=>n+o,0)>0&&t.pads.length!==s*2)throw new Error(`pads should be ${s*2}D`);if(t.outputPadding.length!==s&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${s}D`);if(t.kernelShape.reduce((n,o)=>n+o,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},Cs=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(Je(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let s=[t[0],a];t.length===3&&s.push(t[2]),e.compute(Mu(s,r,i),{inputs:s})},qu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let s=t.dilations;(s.length===0||s[0]===0)&&(s=[1]);let n=t.strides;(n.length===0||n[0]===0)&&(n=[1]);let o=t.pads;o.length===0&&(o=[0,0]),o=[0,o[0],0,o[1]],n=[1].concat(n),s=[1].concat(s),a=[1].concat(a);let u=t.outputPadding;u=[0].concat(u);let l=zs({...t,pads:o,strides:n,dilations:s,kernelShape:a,outputPadding:u},i);Cs(e,i,l,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},Vu=(e,t)=>{if(Lu(e.inputs,t),e.inputs[0].dims.length===3)qu(e,t);else{let r=zs(t,e.inputs);Cs(e,e.inputs,r)}}}),Fu,Gu,Wu,Wc=C(()=>{"use strict";oe(),ae(),b(),K(),Fu=(e,t,r,i)=>{let a=D.size(t),s=t.length,n=A("input",e,s),o=j("output",e,s),u=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),l=D.normalizeAxis(u,s),p=d=>{let h=` i32(${n.indicesGet("inputIndices","uniforms.axis")}) `,m=M("uniforms.input_shape","uniforms.axis",s),f=i.reverse?h+(i.exclusive?" + 1":""):"0",_=i.reverse?m:h+(i.exclusive?"":" + 1");return`
                ${d.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(n,o)}
                ${d.mainStart()}
                  ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${o.offsetToIndices("global_idx")};
                  var sum = ${o.type.value}(0);
                  let first : i32 = ${f};
                  let last : i32 = ${_};
                  for (var i : i32 = first; i < last; i++) {
                    ${n.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${n.getByIndices("inputIndices")};
                  }
                  ${o.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:l},...k(t,t)]}),getShaderSource:p}},Gu=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(Fu(i,r,a,t),{inputs:[0]})},Wu=e=>{let t=e.exclusive===1,r=e.reverse===1;return g({exclusive:t,reverse:r})}}),ju,Hu,Ku,Zu,Qu,jc=C(()=>{"use strict";oe(),ae(),b(),K(),ju=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Hu=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let s=0;s<t;++s)a.push(r.indicesSet("a",e[s],`i[${s}]`));return a.push("return a;}"),a.join(`
`)},Ku=(e,t)=>{let r,i,a,s,n,o,u=t.format==="NHWC",l=t.blocksize,p=t.mode==="DCR";u?([r,i,a,s]=e.dims,n=p?[r,i,a,l,l,s/l**2]:[r,i,a,s/l**2,l,l],o=p?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,s]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],n=p?[r,l,l,s/l**2,i,a]:[r,s/l**2,l,l,i,a],o=p?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let d=e.reshape(n),h=d.dims.length,m=e.dataType,f=A("a",m,h),_=j("output",m,h),$=w=>`
  ${w.registerUniform("output_size","u32").declareVariables(f,_)}

  ${Hu(o,h,f,_)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${_.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${_.setByOffset("global_idx",f.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:w=>{let y=u?[r,i*l,a*l,s/l**2]:[r,s/l**2,i*l,a*l],x=D.size(y),v=d.dims,E=D.sortBasedOnPerm(v,o);return{outputs:[{dims:y,dataType:w[0].dataType}],dispatchGroup:{x:Math.ceil(x/64)},programUniforms:[{type:12,data:x},...k(v,E)]}},getShaderSource:$}},Zu=(e,t)=>{ju(e.inputs),e.compute(Ku(e.inputs[0],t))},Qu=e=>g({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Ia,na,As,Xu,Yu,Ju,el,Os,tl,rl,il,Hc=C(()=>{"use strict";oe(),ae(),b(),K(),Ia="[a-zA-Z]|\\.\\.\\.",na="("+Ia+")+",As="^"+na+"$",Xu="("+na+",)*"+na,Yu="^"+Xu+"$",Ju=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},el=class{constructor(e,t){this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Yu)))throw new Error("Invalid LHS term");if(r.split(",").forEach((a,s)=>{let n=e[s].dims.slice();if(!a.match(RegExp(As)))throw new Error("Invalid LHS term");let o=this.processTerm(a,!0,n,s);this.lhs.push(o)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([a,s])=>s.count===1||a==="...").map(([a])=>a).join("");else if(!i.match(RegExp(na)))throw new Error("Invalid RHS");i.match(RegExp(Ia,"g"))?.forEach(a=>{if(a==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(a);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,s=!1,n=[],o=0;if(!e.match(RegExp(As))&&!t&&e!=="")throw new Error("Invalid LHS term");let u=e.match(RegExp(Ia,"g")),l=new Ju(i);return u?.forEach((p,d)=>{if(p==="..."){if(s)throw new Error("Only one ellipsis is allowed per input term");s=!0;let h=a-u.length+1;if(h<0)throw new Error("Ellipsis out of bounds");if(n=r.slice(o,o+h),this.hasEllipsis){if(this.ellipsisDims.length!==n.length||this.ellipsisDims.toString()!==n.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=n;else throw new Error("Ellipsis must be specified in the LHS");for(let m=0;m<n.length;m++){let f=String.fromCharCode(48+m);l.addSymbol(f,d+m),this.addSymbol(f,r[o++],i)}}else l.addSymbol(p,d+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(p,r[o++],i)}),l}},Os=e=>e+"_max",tl=(e,t,r,i)=>{let a=e.map(l=>l.length).map((l,p)=>A(`input${p}`,t,l)),s=D.size(i),n=j("output",t,i.length),o=[...r.symbolToInfo.keys()].filter(l=>!r.rhs.symbolToIndices.has(l)),u=l=>{let p=[],d="var prod = 1.0;",h="var sum = 0.0;",m="sum += prod;",f=[],_=[],$=[],w=[],y=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((v,E)=>{if(r.rhs.symbolToIndices.has(E)){let z=r.rhs.symbolToIndices.get(E)?.[0];z!==void 0&&r.lhs.forEach((R,N)=>{if(v.inputIndices.includes(N)){let F=R.symbolToIndices.get(E);if(F===void 0)throw new Error("Invalid symbol error");F.forEach(Q=>{p.push(`${a[N].indicesSet(`input${N}Indices`,Q,n.indicesGet("outputIndices",z))}`)})}})}else r.lhs.forEach((z,R)=>{if(v.inputIndices.includes(R)){let N=z.symbolToIndices.get(E);if(N===void 0)throw new Error("Invalid symbol error");N.forEach(F=>{f.push(`${a[R].indicesSet(`input${R}Indices`,F,`${E}`)}`)}),w.push(`prod *= ${a[R].getByIndices(`input${R}Indices`)};`)}}),_.push(`for(var ${E}: u32 = 0; ${E} < uniforms.${Os(E)}; ${E}++) {`),$.push("}")});let x=y?[...p,`let sum = ${a.map((v,E)=>v.getByIndices(`input${E}Indices`)).join(" * ")};`]:[...p,h,..._,...f,d,...w,m,...$];return`
            ${l.registerUniforms(o.map(v=>({name:`${Os(v)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,n)}

            ${l.mainStart()}
            ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${n.offsetToIndices("global_idx")};
            ${a.map((v,E)=>`var input${E}Indices: ${a[E].type.indices};`).join(`
`)}
            ${x.join(`
`)};
            ${n.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let l=o.filter(d=>r.symbolToInfo.has(d)).map(d=>({type:12,data:r.symbolToInfo.get(d)?.dimValue||0}));l.push({type:12,data:s});let p=e.map((d,h)=>[...k(d)]).reduce((d,h)=>d.concat(h),l);return p.push(...k(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}},getShaderSource:u}},rl=(e,t)=>{let r=new el(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((s,n)=>s.dims);e.compute(tl(a,e.inputs[0].dataType,r,i))},il=e=>{let t=e.equation.replace(/\s+/g,"");return g({equation:t})}}),al,Rs,sl,nl,ol,Kc=C(()=>{"use strict";oe(),ae(),K(),al=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},Rs=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},sl=(e,t)=>e.length>t.length?Rs(e,t):Rs(t,e),nl=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=sl(t,r),a=e[0].dataType,s=a===9||D.size(t)===1,n=a===9||t.length>0&&t[t.length-1]%4===0?4:1,o=s||i.length>0&&i[i.length-1]%4===0?4:1,u=Math.ceil(D.size(i)/o),l=d=>{let h=A("input",a,t.length,n),m=j("output",a,i.length,o),f;if(a===9){let _=($,w,y="")=>`
          let outputIndices${w} = ${m.offsetToIndices(`outputOffset + ${w}u`)};
          let offset${w} = ${h.broadcastedIndicesToOffset(`outputIndices${w}`,m)};
          let index${w} = offset${w} / 4u;
          let component${w} = offset${w} % 4u;
          ${$}[${w}] = ${y}(${h.getByOffset(`index${w}`)}[component${w}]);
        `;f=`
        let outputOffset = global_idx * ${o};
        var data = vec4<u32>(0);
        ${_("data",0,"u32")}
        ${_("data",1,"u32")}
        ${_("data",2,"u32")}
        ${_("data",3,"u32")}
        ${m.setByOffset("global_idx","data")}
      }`}else f=`
        let outputIndices = ${m.offsetToIndices(`global_idx * ${o}`)};
        let inputOffset = ${h.broadcastedIndicesToOffset("outputIndices",m)};
        let data = ${m.type.value}(${h.getByOffset(`inputOffset / ${n}`)});
        ${m.setByOffset("global_idx","data")}
      }`;return`
    ${d.registerUniform("vec_size","u32").declareVariables(h,m)}
    ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${f}`},p=[{type:12,data:u},...k(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${n}${o}`,inputDependencies:["rank"]},getShaderSource:l,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:p})}},ol=e=>{al(e.inputs),e.compute(nl(e.inputs),{inputs:[0]})}}),ul,ll,Zc=C(()=>{"use strict";oe(),ae(),K(),ms(),ul=e=>{let t=e[0].dataType,r=D.size(e[0].dims),i=D.size(e[1].dims),a=i%4===0,s=n=>{let o=A("x",t,[1],4),u=A("bias",t,[1],4),l=j("y",t,[1],4),p=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],d=m=>`
      let bias${m}_offset: u32 = (global_idx * 4 + ${m}) % uniforms.bias_size;
      let bias${m} = ${u.getByOffset(`bias${m}_offset / 4`)}[bias${m}_offset % 4];`,h=a?`
      let bias = ${u.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${d(0)}${d(1)}${d(2)}${d(3)}
      let bias = ${o.type.value}(bias0, bias1, bias2, bias3);`;return`${n.registerUniforms(p).declareVariables(o,u,l)}

    ${hs(I(t))}

    ${n.mainStart(T)}
      ${n.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${o.getByOffset("global_idx")};
      ${h}
      let x_in = x + bias;
      ${l.setByOffset("global_idx",fs("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:s,getRunData:n=>({outputs:[{dims:n[0].dims,dataType:n[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/T/4)}})}},ll=e=>{e.inputs.length<2||D.size(e.inputs[1].dims)===0?Fo(e):e.compute(ul(e.inputs))}}),dl,pl,cl,hl,Qc=C(()=>{"use strict";oe(),ae(),b(),K(),dl=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},pl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,s=D.normalizeAxis(t.axis,a),n=r.slice(0);n.splice(s,1,...i);let o=r[s],u=e[0].dataType===9?4:1,l=Math.ceil(D.size(n)/u),p=[{type:12,data:l},{type:6,data:o},{type:12,data:s},...k(e[0].dims,e[1].dims,n)],d=h=>{let m=A("data",e[0].dataType,e[0].dims.length,u),f=A("inputIndices",e[1].dataType,e[1].dims.length),_=j("output",e[0].dataType,n.length,u),$=y=>{let x=i.length,v=`var indicesIndices${y}  = ${f.type.indices}(0);`;for(let E=0;E<x;E++)v+=`${x>1?`indicesIndices${y}[${E}]`:`indicesIndices${y}`} = ${n.length>1?`outputIndices${y}[uniforms.axis + ${E}]`:`outputIndices${y}`};`;v+=`
          var idx${y} = ${f.getByIndices(`indicesIndices${y}`)};
          if (idx${y} < 0) {
            idx${y} = idx${y} + uniforms.axisDimLimit;
          }
          var dataIndices${y} : ${m.type.indices};
        `;for(let E=0,z=0;E<a;E++)E===s?(v+=`${a>1?`dataIndices${y}[${E}]`:`dataIndices${y}`} = u32(idx${y});`,z+=x):(v+=`${a>1?`dataIndices${y}[${E}]`:`dataIndices${y}`} = ${n.length>1?`outputIndices${y}[${z}]`:`outputIndices${y}`};`,z++);return v},w;if(e[0].dataType===9){let y=(x,v,E="")=>`
          let outputIndices${v} = ${_.offsetToIndices(`outputOffset + ${v}u`)};
          ${$(v)};
          let offset${v} = ${m.indicesToOffset(`dataIndices${v}`)};
          let index${v} = offset${v} / 4u;
          let component${v} = offset${v} % 4u;
          ${x}[${v}] = ${E}(${m.getByOffset(`index${v}`)}[component${v}]);
        `;w=`
        let outputOffset = global_idx * ${u};
        var value = vec4<u32>(0);
        ${y("value",0,"u32")}
        ${y("value",1,"u32")}
        ${y("value",2,"u32")}
        ${y("value",3,"u32")}
        ${_.setByOffset("global_idx","value")}
      `}else w=`
      let outputIndices = ${_.offsetToIndices("global_idx")};
      ${$("")};
      let value = ${m.getByIndices("dataIndices")};
      ${_.setByOffset("global_idx","value")};
      `;return`
      ${h.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(m,f,_)}
      ${h.mainStart()}
        ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${w}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:n,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p}),getShaderSource:d}},cl=e=>g({axis:e.axis}),hl=(e,t)=>{let r=e.inputs;dl(r),e.compute(pl(e.inputs,t))}}),fl,ml,gl,Xc=C(()=>{"use strict";oe(),ae(),K(),fl=(e,t,r,i,a,s,n,o,u)=>{let l=[{type:12,data:s},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:n},{type:12,data:o},{type:12,data:u}],p=[s];l.push(...k(t.dims,p));let d=h=>{let m=A("indices_data",t.dataType,t.dims.length),f=j("input_slice_offsets_data",12,1,1),_=[m,f],$=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${h.registerUniforms($).declareVariables(..._)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:l}),getShaderSource:d},{inputs:[t],outputs:[-1]})[0]},ml=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,s=r[1].dims,n=s[s.length-1],o=D.sizeToDimension(s,s.length-1),u=D.sizeFromDimension(i,t.batchDims+n),l=D.sizeToDimension(i,t.batchDims),p=D.sizeFromDimension(i,t.batchDims),d=o/l,h=new Array(n),m=u;for(let v=0;v<n;++v)h[n-1-v]=m,m*=i[t.batchDims+n-1-v];let f=fl(e,r[1],h,t.batchDims,i,o,d,p,n),_=t.batchDims+n;if(_>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let $=s.slice(0,-1).concat(i.slice(_)),w=D.size($),y=[{type:12,data:w},{type:12,data:u},...k(r[0].dims,f.dims,$)],x=v=>{let E=A("data",r[0].dataType,r[0].dims.length),z=A("slice_offsets",12,f.dims.length),R=j("output",r[0].dataType,$.length);return`
          ${v.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(E,z,R)}
            ${v.mainStart()}
            ${v.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:$,dataType:a}],dispatchGroup:{x:Math.ceil(w/64)},programUniforms:y}),getShaderSource:x},{inputs:[r[0],f]})},gl=e=>({batchDims:e.batch_dims,cacheKey:""})}),yl,_l,wl,bl,Yc=C(()=>{"use strict";oe(),ae(),b(),K(),yl=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=D.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],s=e[2],n=e.length===4?e[3]:void 0;if(s.dims.length!==a.dims.length||!a.dims.map((o,u)=>u===r?Math.ceil(o/i)===s.dims[u]:o===s.dims[u]).reduce((o,u)=>o&&u,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(n){if(n.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(n.dims.length!==s.dims.length||!n.dims.map((o,u)=>o===s.dims[u]).reduce((o,u)=>o&&u,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},_l=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,s=D.normalizeAxis(t.gatherAxis,a),n=D.normalizeAxis(t.quantizeAxis,a),o=r.slice(0);o.splice(s,1,...i);let u=D.size(o),l=e[2].dataType,p=e[0].dataType===22,d=[{type:12,data:u},{type:12,data:n},{type:12,data:s},{type:12,data:t.blockSize},...k(...e.map((m,f)=>m.dims),o)],h=m=>{let f=A("data",e[0].dataType,e[0].dims.length),_=A("inputIndices",e[1].dataType,e[1].dims.length),$=A("scales",e[2].dataType,e[2].dims.length),w=e.length>3?A("zeroPoint",e[3].dataType,e[3].dims.length):void 0,y=j("output",l,o.length),x=[f,_,$];w&&x.push(w);let v=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${m.registerUniforms(v).declareVariables(...x,y)}
        ${m.mainStart()}
        let output_indices = ${y.offsetToIndices("global_idx")};
        var indices_indices = ${_.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${y.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${_.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${y.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${f.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${y.indicesGet("output_indices","i")};
          ${f.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${_.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[s]};
        }
        ${f.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${o.length}; i++) {
          let index = ${y.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${f.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${f.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${f.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${p?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${$.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${$.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${$.getByIndices("scale_indices")};
        ${w?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${w.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${w.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${p?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${I(l)}(quantized_data - zero_point) * scale;
        ${y.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((m,f)=>f!==1).map(m=>m.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(m,f)=>"rank")},getRunData:()=>({outputs:[{dims:o,dataType:l}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:d}),getShaderSource:h}},wl=(e,t)=>{let r=e.inputs;yl(r,t),e.compute(_l(e.inputs,t))},bl=e=>g({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),$l,vl,xl,Sl,Jc=C(()=>{"use strict";oe(),ae(),b(),K(),$l=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},vl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,s=e[1].dims,n=e[1].dataType,o=D.normalizeAxis(t.axis,a),u=r[o],l=s.slice(0),p=D.size(l),d=A("input",i,a),h=A("indicesInput",n,s.length),m=j("output",i,l.length),f=[{type:12,data:p},{type:6,data:u},{type:12,data:o}];return f.push(...k(r,s,l)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:l,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:f}),getShaderSource:_=>`
      ${_.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(d,h,m)}
      ${_.mainStart()}
      ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${m.offsetToIndices("global_idx")};

      var idx = ${h.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${d.type.indices}(outputIndices);
      ${d.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${d.getByIndices("inputIndices")};

      ${m.setByOffset("global_idx","value")};
  }`}},xl=e=>g({axis:e.axis}),Sl=(e,t)=>{let r=e.inputs;$l(r),e.compute(vl(e.inputs,t))}}),Tl,El,kl,Il,eh=C(()=>{"use strict";oe(),ae(),K(),Tl=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},El=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,s,n]=Xr.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),o=[a,s];if(!o)throw new Error("Can't use gemm on the given tensors");let u=16,l=Math.ceil(s/u),p=Math.ceil(a/u),d=!0,h=D.size(o),m=[{type:12,data:d?l:h},{type:12,data:a},{type:12,data:s},{type:12,data:n},{type:1,data:t.alpha},{type:1,data:t.beta}],f=["type","type"];e.length===3&&(m.push(...k(e[2].dims)),f.push("rank")),m.push(...k(o));let _=w=>{let y="";t.transA&&t.transB?y="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?y="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?y="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(y="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let x=t.alpha===1?"":"value *= uniforms.alpha;",v=A("a",e[0].dataType,e[0].dims),E=A("b",e[1].dataType,e[1].dims),z=v.type.value,R=null,N=[v,E];e.length===3&&(R=A("c",e[2].dataType,e[2].dims.length),N.push(R));let F=j("output",e[0].dataType,o.length);N.push(F);let Q=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${w.registerUniforms(Q).declareVariables(...N)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${z}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${y}
    }

    ${x}
    ${R!=null?`let cOffset = ${R.broadcastedIndicesToOffset("vec2(m, n)",F)}; value += ${z}(uniforms.beta) * ${R.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},$=w=>{let y=A("a",e[0].dataType,e[0].dims),x=A("b",e[1].dataType,e[1].dims),v=null,E=[y,x];e.length===3&&(v=A("c",e[2].dataType,e[2].dims.length),E.push(v));let z=j("output",e[0].dataType,o.length);E.push(z);let R=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],N="",F="";t.transA&&t.transB?(F=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,N="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(F=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,N="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(F=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,N="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(F=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${y.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${x.type.value}(0);
      }
      `,N="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let Q=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${w.registerUniforms(R).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${y.type.storage}, ${u}>, ${u}>;
  var<workgroup> tile_b: array<array<${x.type.storage}, ${u}>, ${u}>;
  ${w.mainStart([u,u,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${u};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${u};
    let num_tiles = (uniforms.K - 1) / ${u} + 1;
    var k_start = 0u;
    var value = ${z.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${F}
      k_start = k_start + ${u};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${u}; k++) {
        ${N}
      }
      workgroupBarrier();
    }

    ${Q}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${v!=null?`let cOffset = ${v.broadcastedIndicesToOffset("vec2(m, n)",z)}; value += ${z.type.value}(uniforms.beta) * ${v.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return d?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:l*p},programUniforms:m}),getShaderSource:$}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:o,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:m}),getShaderSource:_}},kl=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},Il=(e,t)=>{Tl(e.inputs),e.compute(El(e.inputs,t))}}),Ft,Qt,Ur,Nr,zl,Cl,Al,Ol,Rl,Bl,Ml,Dl,Pl,Ul,th=C(()=>{"use strict";oe(),ae(),b(),K(),[Ft,Qt,Ur,Nr]=[0,1,2,3],zl=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},Cl=`
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
`,Al=e=>`
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
`,Ol=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,Rl=e=>`
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
`,Bl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${Ft}] = batch;
     indices[${Qt}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${Ur}] = u32(r);
            indices[${Nr}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${Ur}] = u32(clamp(r, 0, H - 1));
          indices[${Nr}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${Ur}] = gs_reflect(r, border[1], border[3]);
          indices[${Nr}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,Ml=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${Ft}], indices[${Qt}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${Ft}], indices[${Qt}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${Ft}], indices[${Qt}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${Ft}], indices[${Qt}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${Ft}], indices[${Qt}], border);

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
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${Ft}], indices[${Qt}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,Dl=(e,t)=>{let r=A("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=A("grid",e[1].dataType,i.length,2),s=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(s=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[Ft,Qt,Ur,Nr]=[0,3,1,2]);let n=j("output",e[0].dataType,s.length),o=r.type.value,u=D.size(s),l=[{type:12,data:u},...k(e[0].dims,i,s)],p=d=>`
  ${d.registerUniform("output_size","u32").declareVariables(r,a,n)}
  ${Cl}
  ${Al(o)}
  ${Ol(t)}
  ${Rl(t)}
  ${Bl(r,o,t)}

  ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${Ur}]);
      let W_in = i32(uniforms.x_shape[${Nr}]);

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

      let indices = ${n.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${Ft}], indices[${Ur}], indices[${Nr}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${Ml(n,o,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:d=>{let h=D.size(s);return{outputs:[{dims:s,dataType:d[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:l}},getShaderSource:p}},Pl=(e,t)=>{zl(e.inputs),e.compute(Dl(e.inputs,t))},Ul=e=>g({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),st,Nl,Ll,Bs,ql,oa,Vl,Fl=C(()=>{"use strict";oe(),ae(),b(),ti(),ps(),K(),It(),st=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,Nl=(e,t)=>{let r=e[0],i=st(e,1),a=st(e,2),s=st(e,3),n=st(e,4),o=st(e,5),u=st(e,6),l=st(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let p=r.dims[0],d=r.dims[1],h=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],m=d,f=0,_=0,$=Math.floor(h/t.numHeads);if(u&&l&&D.size(u.dims)&&D.size(l.dims)){if(u.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(u.dims[0]!==p||u.dims[1]!==t.numHeads||u.dims[3]!==$)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(l.dims[0]!==p||l.dims[1]!==t.numHeads||l.dims[3]!==$)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(u.dims[2]!==l.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(l.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');f=u.dims[2],_=u.dims[2]}else if(u&&D.size(u.dims)||l&&D.size(l.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let w;if(i&&D.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');w=2,m=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==$)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');w=5,m=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==$)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');w=0,m=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');w=3}if(s&&D.size(s.dims)>0){if(s.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let y=f+m,x=0;if(n&&D.size(n.dims)>0){x=8;let R=n.dims;throw R.length===1?R[0]===p?x=1:R[0]===3*p+2&&(x=3):R.length===2&&R[0]===p&&R[1]===y&&(x=5),x===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let v=!1,E=h;if(a&&D.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(m!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');E=a.dims[2]}else{if(m!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');E=a.dims[1]*a.dims[3],v=!0}}let z=!1;if(n&&D.size(n.dims)>0)throw new Error("Key padding mask is not supported");if(o&&D.size(o.dims)>0){if(o.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(o.dims[0]!==p||o.dims[1]!==t.numHeads||o.dims[2]!==d||o.dims[3]!==y)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:p,sequenceLength:d,pastSequenceLength:f,kvSequenceLength:m,totalSequenceLength:y,maxSequenceLength:_,inputHiddenSize:0,hiddenSize:h,vHiddenSize:E,headSize:$,vHeadSize:Math.floor(E/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:x,scale:t.scale,broadcastResPosBias:z,passPastInKv:v,qkvFormat:w}},Ll=e=>g({...e}),Bs=g({perm:[0,2,1,3]}),ql=(e,t,r,i,a,s,n)=>{let o=[i,a,s],u=D.size(o),l=[{type:12,data:u},{type:12,data:n},{type:12,data:s}],p=d=>{let h=j("qkv_with_bias",t.dataType,o),m=A("qkv",t.dataType,o),f=A("bias",r.dataType,o),_=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${d.registerUniforms(_).declareVariables(m,f,h)}
  ${d.mainStart()}
    ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:o,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:l}),getShaderSource:p},{inputs:[t,r],outputs:[-1]})[0]},oa=(e,t,r,i,a,s,n,o)=>{let u=s;if(n&&D.size(n.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return u=ql(e,s,n,t,i,r*a,o),u=u.reshape([t,i,r,a]),r===1||i===1?u:e.compute(Je(u,Bs.perm),{inputs:[u],outputs:[-1]})[0]}else return s.dims.length===3&&(u=s.reshape([t,i,r,a])),r===1||i===1?u:e.compute(Je(u,Bs.perm),{inputs:[u],outputs:[-1]})[0]},Vl=(e,t)=>{let r=Nl(e.inputs,t),i=e.inputs[0],a=st(e.inputs,1),s=st(e.inputs,2),n=st(e.inputs,3),o=st(e.inputs,4),u=st(e.inputs,5),l=st(e.inputs,6),p=st(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if(a?.dims.length===5)throw new Error("Packed KV is not implemented");let d=a&&s&&a.dims.length===4&&s.dims.length===4,h=oa(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,n,0);if(d)return ra(e,h,a,s,o,void 0,l,p,u,r);if(!a||!s)throw new Error("key and value must be provided");let m=oa(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,n,r.hiddenSize),f=oa(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,s,n,2*r.hiddenSize);ra(e,h,m,f,o,void 0,l,p,u,r)}}),Gl,Wl,jl,Hl,Ms,Kl,Zl,Ql=C(()=>{"use strict";oe(),ae(),b(),K(),Gl=e=>{if(!e||e.length<1)throw new Error("too few inputs")},Wl=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),g({numOutputs:i,axis:t.axis,splitSizes:r})},jl=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${M("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,Hl=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Ms=(e,t)=>{let r=e[0].dims,i=D.size(r),a=e[0].dataType,s=D.normalizeAxis(t.axis,r.length),n=new Array(t.numOutputs),o=A("input",a,r.length),u=new Array(t.numOutputs),l=[],p=[],d=0,h=[{type:12,data:i}];for(let f=0;f<t.numOutputs;f++){d+=t.splitSizes[f],u[f]=d;let _=r.slice();_[s]=t.splitSizes[f],p.push(_),n[f]=j(`output${f}`,a,_.length),l.push({dims:p[f],dataType:e[0].dataType})}h.push({type:12,data:u},...k(r,...p));let m=f=>`
  ${f.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",u.length).declareVariables(o,...n)}
  ${jl(u.length)}
  ${Hl(n)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${o.offsetToIndices("global_idx")};
    var index = ${o.indicesGet("indices",s)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${M("uniforms.size_in_split_axis","output_number - 1u",u.length)};
      ${o.indicesSet("indices",s,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:m,getRunData:()=>({outputs:l,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:h})}},Kl=(e,t)=>{Gl(e.inputs);let r=e.inputs.length===1?t:Wl(e.inputs,t);e.compute(Ms(e.inputs,r),{inputs:[0]})},Zl=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return g({axis:t,numOutputs:i,splitSizes:r})}}),Xl,za,Yl,Jl=C(()=>{"use strict";oe(),ae(),b(),K(),Xl=(e,t)=>{let[r,i,a,s]=e,{numHeads:n,rotaryEmbeddingDim:o}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!D.areEqual(i.dims,[])&&!D.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(s.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${s.dims.length}`);if(!D.areEqual(a.dims,s.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(o>0&&n===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let u=r.dims[0],l=r.dims[r.dims.length-2],p=a.dims[0],d=D.sizeFromDimension(r.dims,1)/l,h=o===0?a.dims[1]*2:d/n;if(o>h)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(u!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(l!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(l>p)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");if(h/2!==a.dims[1]&&o/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`)},za=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:s}=t,n=e[0].dims[0],o=D.sizeFromDimension(e[0].dims,1),u=e[0].dims[e[0].dims.length-2],l=o/u,p=e[2].dims[1],d=a===0?p*2:l/i,h=new Array(n,u,l/d,d-p),m=D.computeStrides(h),f=[{type:1,data:s},{type:12,data:h},{type:12,data:m},...e[0].dims.length===3?new Array({type:12,data:[o,l,d,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[o,d,u*d,1]}):[],...k(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],_=$=>{let w=A("input",e[0].dataType,e[0].dims.length),y=A("position_ids",e[1].dataType,e[1].dims.length),x=A("cos_cache",e[2].dataType,e[2].dims.length),v=A("sin_cache",e[3].dataType,e[3].dims.length),E=j("output",e[0].dataType,e[0].dims.length);return $.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:h.length},{name:"global_strides",type:"u32",length:m.length},{name:"input_output_strides",type:"u32",length:m.length}]),`
        ${$.declareVariables(w,y,x,v,E)}

        ${$.mainStart(T)}
          let half_rotary_emb_dim = uniforms.${x.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${$.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${y.broadcastedIndicesToOffset("bsnh.xy",j("",y.type.tensor,2))};
            let position_id =
                u32(${y.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${w.getByOffset("i")} * ${x.get("position_id","bsnh[3]")} -
                ${w.getByOffset("j")} * ${v.get("position_id","bsnh[3]")};
            ${E.setByOffset("i","re")}
            let im = ${w.getByOffset("i")} * ${v.get("position_id","bsnh[3]")} +
                ${w.getByOffset("j")} * ${x.get("position_id","bsnh[3]")};
            ${E.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k",w.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:g({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(D.size(h)/T)},programUniforms:f})}},Yl=(e,t)=>{Xl(e.inputs,t),e.compute(za(e.inputs,t))}}),ed,td,Ds,rd,id,rh=C(()=>{"use strict";b(),oe(),ps(),Fl(),Ql(),It(),Jl(),K(),ed=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],s=e[3],n=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let o=!1,u=r.dims[0],l=r.dims[1],p=r.dims.length===3?o?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],d=l,h=0,m=!i||i.dims.length===0,f=Math.floor(m?p/(t.numHeads+2*t.kvNumHeads):p/t.numHeads);m&&(p=f*t.numHeads);let _=s&&s.dims.length!==0,$=n&&n.dims.length!==0;if(_&&s.dims.length===4&&s.dims[0]===u&&s.dims[1]!==t.kvNumHeads&&s.dims[2]===t.kvNumHeads&&s.dims[3]===f)throw new Error("BSNH pastKey/pastValue is not supported");if(_&&$){if(s.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(n.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');h=s.dims[2]}else if(_||$)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let w=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');d=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==f)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');d=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==f)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');d=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');w=3}let y=0,x=!1,v=t.kvNumHeads?f*t.kvNumHeads:p;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(d!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');v=a.dims[2]}else{if(d!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');v=a.dims[1]*a.dims[3],x=!0}}let E=e.length>4?e[5]:void 0;if(E){if(E.dims.length===0)throw new Error("seqlens_k must be at least 1D, got scalar.");let z=E.dims.reduce((R,N)=>R*N,1);if(z!==u)throw new Error(`seqlens_k must have batch_size (${u}) elements, got ${z}.`);for(let R=0;R<E.dims.length;R++)if(E.dims[R]!==1&&E.dims[R]!==u)throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${u}), got dims[${R}] = ${E.dims[R]}.`)}return{batchSize:u,sequenceLength:l,pastSequenceLength:h,kvSequenceLength:d,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:p,vHiddenSize:v,headSize:f,vHeadSize:Math.floor(v/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:y,scale:t.scale,broadcastResPosBias:!1,passPastInKv:x,qkvFormat:w}},td=g({perm:[0,2,1,3]}),Ds=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(Je(i,td.perm),{inputs:[i],outputs:[-1]})[0]),i},rd=(e,t,r,i)=>{let a=7,s=["type","type"],n=[e*t],o=e*t,u=[{type:12,data:o},{type:12,data:t},{type:12,data:e}],l=p=>{let d=A("seq_lens",r.dataType,r.dims),h=A("total_seq_lens",i.dataType,i.dims),m=j("pos_ids",a,n),f=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${p.registerUniforms(f).declareVariables(d,h,m)}
  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${h.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${d.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${m.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${m.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${m.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:s},getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:Math.ceil(o/64)},programUniforms:u}),getShaderSource:l}},id=(e,t)=>{let r=ed(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(e.inputs[1]?.dims.length===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,s=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,n=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,o=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,u=e.inputs.length>4?e.inputs[5]:void 0,l=e.inputs.length>5?e.inputs[6]:void 0,p=r.kvNumHeads?r.kvNumHeads:r.numHeads,d=g({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,p*r.headSize,p*r.headSize]}),[h,m,f]=!a&&!s?e.compute(Ms([i],d),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,s],_,$;if(t.doRotary){let v=e.compute(rd(r.batchSize,r.sequenceLength,u,l),{inputs:[u,l],outputs:[-1]})[0],E=e.inputs[7],z=e.inputs[8],R=g({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),N=[h,v,E,z],F=[-1];_=e.compute(za(N,R),{inputs:N,outputs:F})[0],N.splice(0,1,m);let Q=g({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});$=e.compute(za(N,Q),{inputs:N,outputs:F})[0]}let w=oa(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?_:h,void 0,0),y=Ds(e,t.doRotary?$:m,r),x=Ds(e,f,r);ra(e,w,y,x,void 0,void 0,n,o,void 0,r,u,l)}}),Ps,ad,sd,nd,ih=C(()=>{"use strict";oe(),ae(),It(),K(),Ps=(e,t,r,i,a,s,n,o)=>{let u=O(s),l=u===1?"f32":`vec${u}f`,p=u===1?"vec2f":`mat2x${u}f`,d=a*n,h=64;d===1&&(h=256);let m=[a,n,s/u],f=[a,n,2],_=["rank","type","type"],$=[];$.push(...k(m,f));let w=y=>{let x=A("x",t.dataType,3,u),v=A("scale",r.dataType,r.dims),E=A("bias",i.dataType,i.dims),z=j("output",1,3,2),R=[x,v,E,z];return`
  var<workgroup> workgroup_shared : array<${p}, ${h}>;
  const workgroup_size = ${h}u;
  ${y.declareVariables(...R)}
  ${y.mainStart(h)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${l}(0);
    var squared_sum = ${l}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${l}(${x.get("batch","channel","h")});
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
      let sum_final = ${q("workgroup_shared[0][0]",u)} / f32(hight * ${u});
      let squared_sum_final = ${q("workgroup_shared[0][1]",u)} / f32(hight * ${u});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${o}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${u};${o};${h}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:f,dataType:1}],dispatchGroup:{x:d},programUniforms:$}),getShaderSource:w},{inputs:[t,r,i],outputs:[-1]})[0]},ad=(e,t,r)=>{let i=t[0].dims,a=i,s=2,n=i[0],o=i[1],u=D.sizeFromDimension(i,s),l=O(u),p=D.size(a)/l,d=Ps(e,t[0],t[1],t[2],n,u,o,r.epsilon),h=[n,o,u/l],m=[n,o],f=["type","none"],_=$=>{let w=A("x",t[0].dataType,h.length,l),y=A("scale_shift",1,m.length,2),x=j("output",t[0].dataType,h.length,l),v=[w,y,x];return`
  ${$.registerUniform("output_size","u32").declareVariables(...v)}
  ${$.mainStart()}
  ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${x.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${y.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${w.getByOffset("global_idx")} * ${x.type.value}(scale_shift.x) + ${x.type.value}(scale_shift.y);
      ${x.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${l}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:[{type:12,data:p},...k(h,m,h)]}),getShaderSource:_},{inputs:[t[0],d]})},sd=(e,t,r)=>{let i=t[0].dims,a=i,s=i[0],n=i[i.length-1],o=D.sizeFromDimension(i,1)/n,u=O(n),l=D.size(a)/u,p=[{type:12,data:o},{type:12,data:Math.floor(n/u)}],d=["type","type"],h=!1,m=[0,i.length-1];for(let w=0;w<i.length-2;w++)h=h||i[w+1]!==1,m.push(w+1);h=h&&i[i.length-1]!==1;let f=h?e.compute(Je(e.inputs[0],m),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(w,y)=>i[m[y]])),_=Ps(e,f,t[1],t[2],s,o,n,r.epsilon),$=w=>{let y=B(t[0].dataType),x=u===1?"vec2f":`mat${u}x2f`,v=R=>{let N=R===0?"x":"y",F=u===1?"f32":`vec${u}f`;switch(u){case 1:return`${y}(${F}(scale.${N}))`;case 2:return`vec2<${y}>(${F}(scale[0].${N}, scale[1].${N}))`;case 4:return`vec4<${y}>(${F}(scale[0].${N}, scale[1].${N}, scale[2].${N}, scale[3].${N}))`;default:throw new Error(`Not supported compoents ${u}`)}},E=A("input",t[0].dataType,t[0].dims,u),z=j("output",t[0].dataType,a,u);return`
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${x}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${z.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${w.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${v(0)}, ${v(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${u}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(l/64)},programUniforms:p}),getShaderSource:$},{inputs:[t[0],_]})},nd=(e,t)=>{t.format==="NHWC"?sd(e,e.inputs,t):ad(e,e.inputs,t)}}),od,ud,ld,ah=C(()=>{"use strict";oe(),ae(),K(),od=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},ud=(e,t,r)=>{let i=t.simplified,a=e[0].dims,s=e[1],n=!i&&e[2],o=a,u=D.normalizeAxis(t.axis,a.length),l=D.sizeToDimension(a,u),p=D.sizeFromDimension(a,u),d=D.size(s.dims),h=n?D.size(n.dims):0;if(d!==p||n&&h!==p)throw new Error(`Size of X.shape()[axis:] == ${p}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${d} and bias size of ${h}`);let m=[];for(let E=0;E<a.length;++E)E<u?m.push(a[E]):m.push(1);let f=O(p),_=["type","type"],$=[{type:12,data:l},{type:1,data:p},{type:12,data:Math.floor(p/f)},{type:1,data:t.epsilon}];n&&_.push("type");let w=r>1,y=r>2,x=E=>{let z=B(e[0].dataType),R=[A("x",e[0].dataType,e[0].dims,f),A("scale",s.dataType,s.dims,f)];n&&R.push(A("bias",n.dataType,n.dims,f)),R.push(j("output",e[0].dataType,o,f)),w&&R.push(j("mean_data_output",1,m)),y&&R.push(j("inv_std_output",1,m));let N=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${E.registerUniforms(N).declareVariables(...R)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${V("f32",f)};
    var mean_square_vector = ${V("f32",f)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${G(z,f,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${q("mean_vector",f)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${q("mean_square_vector",f)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${G(z,f,"x[j + offset]")};
      let f32scale = ${G(z,f,"scale[j]")};
      output[j + offset] = ${R[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${n?`+ ${G(z,f,"bias[j]")}`:""}
      );
    }

    ${w?"mean_data_output[global_idx] = mean":""};
    ${y?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},v=[{dims:o,dataType:e[0].dataType}];return w&&v.push({dims:m,dataType:1}),y&&v.push({dims:m,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${f};${r};${i}`,inputDependencies:_},getRunData:()=>({outputs:v,dispatchGroup:{x:Math.ceil(l/64)},programUniforms:$}),getShaderSource:x}},ld=(e,t)=>{od(e.inputs),e.compute(ud(e.inputs,t,e.outputCount))}}),dd,pd,sh=C(()=>{"use strict";ae(),ws(),xs(),dd=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},pd=e=>{dd(e.inputs);let t=Nt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(_s(e.inputs,{activation:""},t));else{let a=t[t.length-2],s=D.size(e.inputs[0].dims.slice(0,-2)),n=D.size(e.inputs[1].dims.slice(0,-2));if(s!==1&&a===1&&n===1){let o=e.inputs[0].reshape([1,s,i]),u=e.inputs[1].reshape([1,i,r]),l=[1,s,r],p=[o,u];e.compute(Ta(p,{activation:""},t,l),{inputs:p})}else e.compute(Ta(e.inputs,{activation:""},t))}}}),cd,hd,fd,md,gd,nh=C(()=>{"use strict";oe(),ae(),b(),K(),cd=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),s=t.blockSize/8*t.bits,n=e[1];if(!D.areEqual(n.dims,[t.n,a,s]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let o=e[2].dims;if(D.size(o)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let u=e[3].dims,l=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(D.size(u)!==l)throw new Error("zeroPoints input size error.")}},hd=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],s=t.k,n=t.n,o=r.slice(0,i-2),u=D.size(o),l=e[1].dims[2]/4,p=e[0].dataType,d=O(t.k),h=O(l),m=O(n),f=o.concat([a,n]),_=a>1&&n/m%2===0?2:1,$=D.size(f)/m/_,w=64,y=[],x=[u,a,s/d],v=D.convertShape(e[1].dims).slice();v.splice(-1,1,l/h),y.push(...k(x)),y.push(...k(v)),y.push(...k(e[2].dims)),e.length===4&&y.push(...k(D.convertShape(e[3].dims)));let E=[u,a,n/m];y.push(...k(E));let z=R=>{let N=x.length,F=A("a",e[0].dataType,N,d),Q=A("b",12,v.length,h),ye=A("scales",e[2].dataType,e[2].dims.length),ie=[F,Q,ye],se=e.length===4?A("zero_points",12,e[3].dims.length):void 0;se&&ie.push(se);let ke=E.length,X=j("output",e[0].dataType,ke,m),te=B(e[0].dataType),me=(()=>{switch(d){case 1:return`array<${te}, 8>`;case 2:return`mat4x2<${te}>`;case 4:return`mat2x4<${te}>`;default:throw new Error(`${d}-component is not supported.`)}})(),_e=Math.floor(32/t.bits),he=Math.floor(_e/8),ve=()=>{let ne="";for(let Y=0;Y<he;Y++){let Qe=Y*t.bits*4,dt=Qe+t.bits;ne+=`
          // reuse a data (pass ${Y})
            var input_offset${Y>0?Y:""} = ${Y===0?F.indicesToOffset(`${F.type.indices}(batch, row, word_offset)`):"input_offset"};
            var a_data${Y>0?Y:""}: ${me};
            for (var j${Y>0?Y:""}: u32 = 0; j${Y>0?Y:""} < ${8/d}; j${Y>0?Y:""}++) {
              a_data${Y>0?Y:""}[j${Y>0?Y:""}] = ${F.getByOffset(`input_offset${Y>0?Y:""}`)};
              input_offset${Y>0?Y:""}++;
            }
          `;for(let Le=0;Le<m*_;Le++)ne+=`
            b_value = ${h===1?`b${Le}_data`:`b${Le}_data[i]`};
            ${t.bits===2?`{
              let half_word = b_value >> ${Y*16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }`:`b_value_lower = unpack4xU8((b_value >> ${Qe}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${dt}u) & b_mask);`}
            b_quantized_values = ${me}(${Array.from({length:4},(pt,Ae)=>`${te}(b_value_lower[${Ae}]), ${te}(b_value_upper[${Ae}])`).join(", ")});
            b_dequantized_values = ${d===1?`${me}(${Array.from({length:8},(pt,Ae)=>`(b_quantized_values[${Ae}] - ${se?`zero_point${Le}`:"zero_point"}) * scale${Le}`).join(", ")});`:`(b_quantized_values - ${me}(${Array(8).fill(`${se?`zero_point${Le}`:"zero_point"}`).join(",")})) * scale${Le};`};
            workgroup_shared[local_id.x * ${_} + ${Math.floor(Le/m)}]${m>1?`[${Le%m}]`:""} += ${Array.from({length:8/d},(pt,Ae)=>`${d===1?`a_data${Y>0?Y:""}[${Ae}] * b_dequantized_values[${Ae}]`:`dot(a_data${Y>0?Y:""}[${Ae}], b_dequantized_values[${Ae}])`}`).join(" + ")};
          `}return ne},W=()=>{let ne=`
            var col_index = col * ${m};
            ${se?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${te}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            `;for(let Y=0;Y<m*_;Y++)ne+=`
            let scale${Y} = ${ye.getByOffset("col_index * nBlocksPerCol + block")};
            ${se?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${se.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${Y} = ${te}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:""}
            col_index += 1;`;return ne},pe=()=>{let ne=`col_index = col * ${m};`;for(let Y=0;Y<m*_;Y++)ne+=`
            let b${Y}_data = ${Q.getByIndices(`${Q.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return ne+=`
            var b_value: u32;
            let b_mask: u32 = ${t.bits===2?"0x03030303u":"0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${me};
            var b_dequantized_values: ${me};`,ne};return`
        var<workgroup> workgroup_shared: array<${X.type.value}, ${_*w}>;
        ${R.declareVariables(...ie,X)}
        ${R.mainStart([w,1,1])}
          let output_indices = ${X.offsetToIndices(`(global_idx / ${w}) * ${_}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${w}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/d};
            ${W()}
            for (var word: u32 = 0; word < ${l}; word += ${h}) {
              ${pe()}
              for (var i: u32 = 0; i < ${h}; i++) {
                ${ve()}
                word_offset += ${_e/d};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${_}) {
            var output_value: ${X.type.value} = ${X.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${w}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${_};
            }
            ${X.setByIndices(`${X.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${d};${h};${m};${_};${w}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:f,dataType:p}],dispatchGroup:{x:$},programUniforms:y}),getShaderSource:z}},fd=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],s=t.k,n=t.n,o=r.slice(0,i-2),u=D.size(o),l=e[1].dims[2]/4,p=e[0].dataType,d=O(t.k),h=O(l),m=o.concat([a,n]),f=128,_=n%8===0?8:n%4===0?4:1,$=f/_,w=Math.floor(32/t.bits),y=$*h*w,x=y/d,v=y/t.blockSize,E=D.size(m)/_,z=[],R=[u,a,s/d],N=D.convertShape(e[1].dims).slice();N.splice(-1,1,l/h),z.push(...k(R)),z.push(...k(N)),z.push(...k(e[2].dims)),e.length===4&&z.push(...k(D.convertShape(e[3].dims)));let F=[u,a,n];z.push(...k(F));let Q=ye=>{let ie=R.length,se=A("a",e[0].dataType,ie,d),ke=A("b",12,N.length,h),X=A("scales",e[2].dataType,e[2].dims.length),te=[se,ke,X],me=e.length===4?A("zero_points",12,e[3].dims.length):void 0;me&&te.push(me);let _e=F.length,he=j("output",e[0].dataType,_e),ve=B(e[0].dataType),W=()=>{switch(d){case 1:return`
          let a_data0 = vec4<${ve}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${ve}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${ve}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${ve}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${d}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${se.type.value}, ${x}>;
        var<workgroup> inter_results: array<array<${he.type.value}, ${$}>, ${_}>;
        ${ye.declareVariables(...te,he)}
        ${ye.mainStart([$,_,1])}
          let output_indices = ${he.offsetToIndices(`workgroup_index * ${_}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${v} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${x};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${x}; a_offset += ${f})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${se.getByIndices(`${se.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${se.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${v} + local_id.x;
            ${me?`
            let zero_point_values_per_byte: u32 = ${Math.floor(8/t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${me.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${ve}((zero_point_word) & ${t.bits===2?"0x3u":"0xFu"});`:`
            // The default zero point is ${Math.pow(2,t.bits-1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${ve}(${Math.pow(2,t.bits-1).toFixed(1)});`}
            let scale = ${X.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${ke.getByIndices(`${ke.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/d};
            for (var i: u32 = 0; i < ${h}; i++) {
              let b_value = ${h===1?"b_data":"b_data[i]"};
              ${(()=>{let pe=Math.floor(w/8),ne="";for(let Y=0;Y<pe;Y++){let Qe=Y*t.bits*4,dt=Qe+t.bits;ne+=`
              ${W()}
              {${t.bits===2?`
                let half_word = b_value >> ${Y*16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);`:`
                let b_value_lower = unpack4xU8((b_value >> ${Qe}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${dt}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${ve}>(${Array.from({length:4},(Le,pt)=>`${ve}(b_value_lower[${pt}]), ${ve}(b_value_upper[${pt}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${ve}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(Le,pt)=>`${`dot(a_data${pt}, b_dequantized_values[${pt}])`}`).join(" + ")};
              }
              word_offset += ${8/d};`}return ne})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${_}) {
            var output_value: ${he.type.value} = ${he.type.value}(0);
            for (var b = 0u; b < ${$}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${he.setByIndices(`${he.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${d};${h};${$};${_}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:m,dataType:p}],dispatchGroup:{x:E},programUniforms:z}),getShaderSource:Q}},md=(e,t)=>{cd(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(fd(e.inputs,t)):e.compute(hd(e.inputs,t))},gd=e=>g(e)}),yd,_d,wd,bd,$d,vd,xd,Sd,Td,oh=C(()=>{"use strict";oe(),ae(),K(),yd=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},_d=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${M("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${M("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},wd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${M("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${M("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${M("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},bd=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${M("uniforms.x_shape",a,t)})) {
                  k = i32(${M("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${M("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},$d=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${M("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${M("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${M("uniforms.x_shape",a,t)})) {
                  k -= i32(${M("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${M("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},vd=(e,t,r)=>{switch(r.mode){case 0:return _d(e,t,r.pads.length);case 1:return wd(e,t,r.pads.length);case 2:return bd(e,t,r.pads.length);case 3:return $d(e,t,r.pads.length);default:throw new Error("Invalid mode")}},xd=(e,t)=>{let r=D.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=D.size(r),s=[{type:12,data:a},{type:6,data:t.pads}],n=e.length>=3&&e[2].data;t.mode===0&&s.push({type:n?e[2].dataType:1,data:t.value}),s.push(...k(e[0].dims,r));let o=["rank"],u=l=>{let p=j("output",e[0].dataType,r.length),d=A("x",e[0].dataType,i.length),h=d.type.value,m=vd(p,i.length,t),f=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&f.push({name:"constant_value",type:n?h:"f32"}),`
            ${l.registerUniforms(f).declareVariables(d,p)}
            ${l.mainStart()}
            ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${p.offsetToIndices("global_idx")};

            var value = ${h}(0);
            ${m}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${n}`,inputDependencies:o},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(D.size(r)/64)},programUniforms:s}),getShaderSource:u}},Sd=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,s=new Int32Array(2*a).fill(0);if(e.length>=4){let o=e[3].getBigInt64Array();for(let u=0;u<o.length;u++)s[Number(o[u])]=Number(r[u]),s[Number(o[u])+a]=Number(r[u+o.length])}else r.forEach((o,u)=>s[Number(u)]=Number(o));let n=[];return s.forEach(o=>n.push(o)),{mode:t.mode,value:i,pads:n}}else return t},Td=(e,t)=>{yd(e.inputs);let r=Sd(e.inputs,t);e.compute(xd(e.inputs,r),{inputs:[0]})}}),ua,Us,Ns,Ls,qs,Ed,kd,Vs,Fs,Id,zd,Gs,Cd,Ad,Ws,Od,Rd,Bd,Md,uh=C(()=>{"use strict";Ge(),oe(),ae(),K(),ua=e=>{if(de.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},Us=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let s=Object.hasOwnProperty.call(t,"dilations"),n=t.kernelShape.slice(),o=t.strides.slice(),u=s?t.dilations.slice():[],l=t.pads.slice();Yt.adjustPoolAttributes(r,a,n,o,u,l);let p=Yt.computePoolOutputShape(r,a,o,u,n,l,t.autoPad),d=Object.assign({},t);s?Object.assign(d,{kernelShape:n,strides:o,pads:l,dilations:u,cacheKey:t.cacheKey}):Object.assign(d,{kernelShape:n,strides:o,pads:l,cacheKey:t.cacheKey});let h=p.slice();return h.push(h.splice(1,1)[0]),[d,i?h:p]},Ns=(e,t)=>{let r=t.format==="NHWC",i=D.size(e),a=D.size(t.kernelShape),s=[{type:12,data:i},{type:12,data:a}],n=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let o=t.kernelShape[t.kernelShape.length-1],u=t.strides[t.strides.length-1],l=t.pads[t.pads.length/2-1],p=t.pads[t.pads.length-1],d=!!(l+p);s.push({type:12,data:o},{type:12,data:u},{type:12,data:l},{type:12,data:p}),n.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let h=!1;if(t.kernelShape.length===2){let m=t.kernelShape[t.kernelShape.length-2],f=t.strides[t.strides.length-2],_=t.pads[t.pads.length/2-2],$=t.pads[t.pads.length-2];h=!!(_+$),s.push({type:12,data:m},{type:12,data:f},{type:12,data:_},{type:12,data:$}),n.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[s,n,!0,d,h]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let o=D.computeStrides(t.kernelShape);s.push({type:12,data:o},{type:12,data:t.pads},{type:12,data:t.strides}),n.push({name:"kernelStrides",type:"u32",length:o.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let u=t.pads.reduce((l,p)=>l+p);return[s,n,!!u,!1,!1]}},Ls=(e,t,r,i,a,s,n,o,u,l,p,d)=>{let h=a.format==="NHWC",m=t.type.value,f=j("output",t.type.tensor,i);if(a.kernelShape.length<=2){let _="",$="",w="",y=r-(h?2:1);if(p?_=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${y}] < 0 || xIndices[${y}]
                      >= uniforms.x_shape[${y}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`:_=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${y}] = indices[${y}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${s}
                }`,a.kernelShape.length===2){let x=r-(h?3:2);d?$=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${x}] = indices[${x}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${x}] < 0 || xIndices[${x}] >= uniforms.x_shape[${x}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:$=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${x}] = indices[${x}] * uniforms.sh - uniforms.phStart + j;
                `,w=`
              }
            `}return`
            ${e.registerUniforms(u).declareVariables(t,f)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${f.offsetToIndices("global_idx")};
              var xIndices = ${f.offsetToIndices("global_idx")};

              var value = ${m}(${o});
              var pad = 0;
              ${$}
              ${_}
              ${w}
              ${n}

              output[global_idx] = value;
            }`}else{if(h)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let _=a.kernelShape.length,$=a.pads.length,w="";return l?w=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${s}
              }`:w=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${s}
            `,`
            ${e.registerUniforms(u).declareVariables(t,f)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${f.offsetToIndices("global_idx")};
              var xIndices = ${f.offsetToIndices("global_idx")};

              var offsets: array<u32, ${_}>;

              var value = ${m}(${o});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${_-1}u; j++) {
                  offsets[j] = offset / ${M("uniforms.kernelStrides","j",_)};
                  offset -= offsets[j] * ${M("uniforms.kernelStrides","j",_)};
                }
                offsets[${_-1}] = offset;

                isPad = false;
                for (var j = ${r-_}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${M("uniforms.strides",`j - ${r-_}u`,_)}
                    + offsets[j - ${r-_}u] - ${M("uniforms.pads","j - 2u",$)};
                  ${w}
              }
              ${n}

              output[global_idx] = value;
            }`}},qs=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Ed=e=>`${qs(e)};${e.countIncludePad}`,kd=e=>`${qs(e)};${e.storageOrder};${e.dilations}`,Vs=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),Fs=(e,t,r,i)=>{let[a,s]=Us(t,i,r),n=A("x",t.dataType,t.dims.length),o=n.type.value,u="value += x_val;",l="";a.countIncludePad?l+=`value /= ${o}(uniforms.kernelSize);`:l+=`value /= ${o}(i32(uniforms.kernelSize) - pad);`;let[p,d,h,m,f]=Ns(s,a);p.push(...k(t.dims,s));let _=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${h};${m};${f}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(D.size(s)/64)},programUniforms:p}),getShaderSource:$=>Ls($,n,t.dims.length,s.length,a,u,l,0,d,h,m,f)}},Id=e=>{let t=e.count_include_pad!==0,r=Vs(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:Ed(i)}},zd=(e,t)=>{ua(e.inputs),e.compute(Fs("AveragePool",e.inputs[0],!1,t))},Gs={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Cd=e=>{let t=e.format;return{format:t,...Gs,cacheKey:t}},Ad=(e,t)=>{ua(e.inputs),e.compute(Fs("GlobalAveragePool",e.inputs[0],!0,t))},Ws=(e,t,r,i)=>{let[a,s]=Us(t,i,r),n=`
      value = max(x_val, value);
    `,o="",u=A("x",t.dataType,t.dims.length),l=["rank"],[p,d,h,m,f]=Ns(s,a);return p.push(...k(t.dims,s)),{name:e,shaderCache:{hint:`${i.cacheKey};${h};${m};${f}`,inputDependencies:l},getRunData:()=>({outputs:[{dims:s,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(D.size(s)/64)},programUniforms:p}),getShaderSource:_=>Ls(_,u,t.dims.length,s.length,a,n,o,t.dataType===10?-65504:-1e5,d,h,m,f)}},Od=(e,t)=>{ua(e.inputs),e.compute(Ws("MaxPool",e.inputs[0],!1,t))},Rd=e=>{let t=e.storage_order,r=e.dilations,i=Vs(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:kd(a)}},Bd=e=>{let t=e.format;return{format:t,...Gs,cacheKey:t}},Md=(e,t)=>{ua(e.inputs),e.compute(Ws("GlobalMaxPool",e.inputs[0],!0,t))}}),Dd,Pd,Ud,Nd,lh=C(()=>{"use strict";oe(),ae(),b(),K(),Dd=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,s)=>s===t.axis||a===e[0].dims[s]).reduce((a,s)=>a&&s,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Pd=(e,t)=>{let r=D.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,s=e[0].dims,n=e[1].dataType,o=D.size(s),u=i===3||i===2,l=u?[Math.ceil(D.size(e[0].dims)/4)]:e[0].dims,p=e[1].dims,d=e.length>2?e[2]:void 0,h=d?u?[Math.ceil(D.size(d.dims)/4)]:d.dims:void 0,m=p.length===0||p.length===1&&p[0]===1,f=m===!1&&p.length===1,_=O(o),$=m&&(!u||_===4),w=$?_:1,y=$&&!u?_:1,x=A("input",u?12:i,l.length,y),v=A("scale",n,p.length),E=d?A("zero_point",u?12:i,h.length):void 0,z=j("output",n,s.length,w),R=[x,v];E&&R.push(E);let N=[l,p];d&&N.push(h);let F=[{type:12,data:o/w},{type:12,data:r},{type:12,data:t.blockSize},...k(...N,s)],Q=ye=>{let ie=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${ye.registerUniforms(ie).declareVariables(...R,z)}
      ${ye.mainStart()}
          ${ye.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${z.offsetToIndices("global_idx")};

          // Set input x
          ${u?`
            let input = ${x.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${w===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${x.getByOffset("global_idx")};`};

          // Set scale input
          ${m?`let scale_value= ${v.getByOffset("0")}`:f?`
            let scale_index = ${z.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${v.getByOffset("scale_index")};`:`
            var scale_indices: ${v.type.indices} = output_indices;
            let index = ${v.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${v.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${v.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E?m?u?`
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${E.getByOffset("0")}`:f?u?`
                let zero_point_index = ${z.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${z.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};`:u?`
                let zero_point_offset = ${v.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${E.getByIndices("scale_indices")};`:`let zero_point_value = ${u?a?"i32":"u32":x.type.value}(0);`};
      // Compute and write output
      ${z.setByOffset("global_idx",`${z.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:E?["rank","rank","rank"]:["rank","rank"]},getShaderSource:Q,getRunData:()=>({outputs:[{dims:s,dataType:n}],dispatchGroup:{x:Math.ceil(o/w/64),y:1,z:1},programUniforms:F})}},Ud=(e,t)=>{Dd(e.inputs,t),e.compute(Pd(e.inputs,t))},Nd=e=>g({axis:e.axis,blockSize:e.blockSize})}),Ld,qd,Vd,dh=C(()=>{"use strict";Ge(),oe(),K(),Ld=(e,t,r)=>{let i=e===t,a=e<t&&r<0,s=e>t&&r>0;if(i||a||s)throw new Error("Range these inputs' contents are invalid.")},qd=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),s=[a],n=a,o=[{type:12,data:n},{type:i,data:e},{type:i,data:r},...k(s)],u=l=>{let p=j("output",i,s.length),d=p.type.value,h=[{name:"outputSize",type:"u32"},{name:"start",type:d},{name:"delta",type:d}];return`
        ${l.registerUniforms(h).declareVariables(p)}
        ${l.mainStart()}
        ${l.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${d}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:u,getRunData:()=>({outputs:[{dims:s,dataType:i}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:o})}},Vd=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),de.webgpu.validateInputContent&&Ld(t,r,i),e.compute(qd(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),Fd,Gd,Wd,jd,ph=C(()=>{"use strict";oe(),ae(),b(),K(),Fd=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
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
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${s}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${s}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${s}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${s}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Gd=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,s=1,n=Math.ceil(D.sizeToDimension(i,i.length-1)/s),o=i[i.length-1],u=D.sizeFromDimension(r,o),l=[{type:12,data:n},{type:12,data:o},{type:12,data:u},...k(e[1].dims,e[2].dims,a)],p=d=>{let h=A("indices",e[1].dataType,e[1].dims.length),m=A("updates",e[2].dataType,e[2].dims.length,s),f=t.reduction!=="none"&&t.reduction!==""?Ce("output",e[0].dataType,a.length):j("output",e[0].dataType,a.length,s);return`
      ${d.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(h,m,f)}
      ${d.mainStart()}
        ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
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
    ${Fd(t.reduction,"output[data_offset + i]","value",f.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:l}),getShaderSource:p}},Wd=e=>g({reduction:e.reduction}),jd=(e,t)=>{e.compute(Gd(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Hd,Kd,Zd,js,Qd,Xd,Yd,Jd,ep,tp,rp,ip,Hs,ap,sp,np,op,up,lp,dp,ch=C(()=>{"use strict";oe(),ae(),b(),K(),Hd=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Kd=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,s)=>i[a]=e[s]),i},Zd=(e,t,r,i,a,s)=>{let[n,o,u]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],l=e[0].dims.length;if(n>0&&e.length>n&&e[n].dims.length>0)e[n].getFloat32Array().forEach(p=>s.push(p));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(o>0&&e.length>o&&e[o].dims.length===1&&e[o].dims[0]>0){if(e[o].getFloat32Array().forEach(p=>i.push(p)),i.length!==0&&i.length!==l&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Hd(i,t),t.axes.length>0&&Kd(i,t.axes,l).forEach((p,d)=>i[d]=p)}if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0&&(e[u].getBigInt64Array().forEach(p=>a.push(Number(p))),a.length!==0&&a.length!==l&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>l)throw new Error("Resize requires only of scales or sizes to be specified")},js=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,Qd=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${js("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${js("xResized","lengthOriginal - 1","lengthResized - 1",t)}
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
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",Xd=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",Yd=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((s,n)=>{i[s]=a[n],i[n+r]=a[t.length+n]}),i):a},Jd=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(s=>a.push(s)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((s,n)=>a[s]=r[n])}else r.forEach(s=>a.push(s));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((s,n)=>Math.round(s*t[n]))}return a},ep=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(s=>t[s]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(s=>t[s]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(s=>t[s]=i),r.axes.forEach(s=>a[s]=Math.round(e[s]*t[s]))):(t.fill(i,0,t.length),a.forEach((s,n)=>a[n]=Math.round(s*t[n]))),a},tp=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${M("uniforms.scales","i",i)};
        var roi_low = ${M("uniforms.roi","i",a)};
        var roi_hi = ${M("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${M("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${M("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,rp=(e,t,r,i,a,s,n)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${M("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${M("uniforms.roi","i",s)};
          var roi_hi = ${M("uniforms.roi",`i + ${r.length}`,s)};
          var input_shape_i = ${M("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${M("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${n} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
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
    }`,ip=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${M("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,Hs=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",ap=(e,t,r,i,a)=>{let[s,n,o,u]=r.length===2?[-1,0,1,-1]:[0,2,3,1],l=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${l} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",n,`max(0, min(row, ${r[n]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(col, ${r[o]} - 1))`)};
      ${Hs(e,u,s,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${l} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${l} = originalIndices[${n}];
      var col:${l} = originalIndices[${o}];
      ${i?`if (row < 0 || row > (${r[n]} - 1) || col < 0 || col > (${r[o]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[n]} - 1));
      col = max(0, min(col, ${r[o]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${u}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${s}])`:"0"};
      var x11: ${l} = getInputValue(batch, channel, row1, col1);
      var x12: ${l} = getInputValue(batch, channel, row1, col2);
      var x21: ${l} = getInputValue(batch, channel, row2, col1);
      var x22: ${l} = getInputValue(batch, channel, row2, col2);
      var dx1: ${l} = abs(row - ${l}(row1));
      var dx2: ${l} = abs(${l}(row2) - row);
      var dy1: ${l} = abs(col - ${l}(col1));
      var dy2: ${l} = abs(${l}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},sp=(e,t,r,i,a,s,n,o,u,l)=>{let p=r.length===2,d=!0,[h,m]=p?[0,1]:d?[2,3]:[1,2],f=e.type.value,_=$=>{let w=$===h?"row":"col";return`
      fn ${w}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${f} {
        var output_index = ${t.indicesGet("output_indices",$)};
        var originalIdx: ${f} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[$]},
        ${i[$]}, ${r[$]}, ${s[$]}, ${s[$]} + ${r.length});
        var fractOriginalIdx: ${f} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${o} && (originalIdx < 0 || originalIdx > (${r[$]} - 1))) {
          return ${u};
        }
        var data: array<${f}, 4> = array<${f}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${w}: ${f} = originalIdx + ${f}(i);
          if (${w} < 0 || ${w} >= ${r[$]}) {
            ${l?`coefs[i + 1] = 0.0;
                        continue;`:o?`return ${u};`:`${w} = max(0, min(${w}, ${r[$]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",$,`u32(${w})`)};
          data[i + 1] = ${$===h?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${_(h)};
    ${_(m)};
  fn getCubicInterpolationCoefs(s: ${f}) -> array<${f}, 4> {
    var absS = abs(s);
    var coeffs: array<${f}, 4> = array<${f}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${f} = 1.0 - absS;
    var twoMinusAbsS: ${f} = 2.0 - absS;
    var onePlusAbsS: ${f} = 1.0 + absS;
    coeffs[0] = ((${n} * onePlusAbsS - 5 * ${n}) * onePlusAbsS + 8 * ${n}) * onePlusAbsS - 4 * ${n};
    coeffs[1] = ((${n} + 2) * absS - (${n} + 3)) * absS * absS + 1;
    coeffs[2] = ((${n} + 2) * oneMinusAbsS - (${n} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${n} * twoMinusAbsS - 5 * ${n}) * twoMinusAbsS + 8 * ${n}) * twoMinusAbsS - 4 * ${n};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${f}, 4>, coefs: array<${f}, 4>) -> ${f} {
    var coefsSum: ${f} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${f} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},np=(e,t,r,i,a)=>{let[s,n,o,u,l]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",n,`max(0, min(depth, ${r[n]} - 1))`)};
      ${e.indicesSet("input_indices",o,`max(0, min(height, ${r[o]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(width, ${r[u]} - 1))`)};
      ${Hs(e,l,s,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${p} = originalIndices[${n}];
      var height:${p} = originalIndices[${o}];
      var width:${p} = originalIndices[${u}];
      ${i?`if (depth < 0 || depth > (${r[n]} - 1) || height < 0 || height > (${r[o]} - 1) || width < 0 || (width > ${r[u]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[n]} - 1));
      height = max(0, min(height, ${r[o]} - 1));
      width = max(0, min(width, ${r[u]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${l}])`:"0"};
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
    }`},op=(e,t,r,i,a,s)=>{let n=e.dims,o=Yd(s,t.axes,n.length),u=Jd(n,i,a,t.axes),l=i.slice();i.length===0&&(l=n.map((y,x)=>y===0?1:u[x]/y),t.keepAspectRatioPolicy!=="stretch"&&(u=ep(n,l,t)));let p=j("output",e.dataType,u.length),d=A("input",e.dataType,n.length),h=D.size(u),m=n.length===u.length&&n.every((y,x)=>y===u[x]),f=t.coordinateTransformMode==="tf_crop_and_resize",_=t.extrapolationValue,$=d.type.value,w=y=>`
      ${m?"":`
      ${Qd(t.coordinateTransformMode,$)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${ip(d,n)};
              ${Xd(t.nearestMode,r,$)};
              ${rp(d,p,n,u,l.length,o.length,f)};
              `;case"linear":return`
              ${tp(p,n,u,l.length,o.length)};
              ${(()=>{if(n.length===2||n.length===4)return`${ap(d,p,n,f,_)}`;if(n.length===3||n.length===5)return`${np(d,p,n,f,_)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(n.length===2||n.length===4)return`${sp(d,p,n,u,l,o,t.cubicCoeffA,f,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${y.registerUniform("output_size","u32").registerUniform("scales","f32",l.length).registerUniform("roi","f32",o.length).declareVariables(d,p)}
      ${y.mainStart()}
        ${y.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${m?"output[global_idx] = input[global_idx];":`
        let output_indices = ${p.offsetToIndices("global_idx")};
        var input_indices: ${d.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${d.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${n.length===2||n.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${l.length>0?t.mode==="cubic"?l:l.length:""}|${a.length>0?a:""}|${o.length>0?o:""}|${m}|${t.mode==="nearest"?n.length:n}`,inputDependencies:["rank"]},getShaderSource:w,getRunData:()=>({outputs:[{dims:u,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},{type:1,data:l},{type:1,data:o},...k(n,u)]})}},up=e=>{let t=e.customDataBuffer;return new Uint32Array(t.buffer,t.byteOffset,1)[0]},lp=(e,t)=>{let r=[],i=[],a=[],s=up(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Zd(e.inputs,t,s,r,i,a),e.compute(op(e.inputs[0],t,s,r,i,a),{inputs:[0]})},dp=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,s=e.excludeOutside!==0,n=e.extrapolationValue,o=e.keepAspectRatioPolicy,u=e.mode,l=e.nearestMode===""?"simple":e.nearestMode;return g({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:s,extrapolationValue:n,keepAspectRatioPolicy:o,mode:u,nearestMode:l})}}),pp,cp,hp,hh=C(()=>{"use strict";oe(),ae(),K(),pp=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],s=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==s)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let n=e[3];if(n.dims.length!==1)throw new Error("Beta must be 1D");if(n.dims[n.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let n=e[4];if(n.dims.length!==1)throw new Error("Bias must be 1D");if(n.dims[n.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},cp=(e,t,r,i)=>{let a=t.simplified,s=e[0].dims,n=D.size(s),o=s,u=n,l=s.slice(-1)[0],p=i?s.slice(0,-1).concat(1):[],d=!a&&e.length>3,h=e.length>4,m=i&&r>1,f=i&&r>2,_=r>3,$=64,w=O(l),y=[{type:12,data:u},{type:12,data:w},{type:12,data:l},{type:1,data:t.epsilon}],x=E=>{let z=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],R=[A("x",e[0].dataType,e[0].dims,w),A("skip",e[1].dataType,e[1].dims,w),A("gamma",e[2].dataType,e[2].dims,w)];d&&R.push(A("beta",e[3].dataType,e[3].dims,w)),h&&R.push(A("bias",e[4].dataType,e[4].dims,w)),R.push(j("output",e[0].dataType,o,w)),m&&R.push(j("mean_output",1,p)),f&&R.push(j("inv_std_output",1,p)),_&&R.push(j("input_skip_bias_sum",e[0].dataType,o,w));let N=B(e[0].dataType),F=B(1,w);return`

      ${E.registerUniforms(z).declareVariables(...R)}
      var<workgroup> sum_shared : array<${F}, ${$}>;
      var<workgroup> sum_squared_shared : array<${F}, ${$}>;

      ${E.mainStart([$,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${$};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${$};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${$-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${h?"bias[offset1d + i]":N+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${_?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${G(N,w,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${$};
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
        let mean = ${q("sum",w)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${q("square_sum",w)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${m?"mean_output[global_idx] = mean;":""}
        ${f?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${N}(mean)`}) *
            ${N}(inv_std_dev) * gamma[offset1d + i]
            ${d?"+ beta[offset1d + i]":""};
        }
      }`},v=[{dims:o,dataType:e[0].dataType}];return r>1&&v.push({dims:p,dataType:1}),r>2&&v.push({dims:p,dataType:1}),r>3&&v.push({dims:s,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${w};${m};${f};${_}`,inputDependencies:e.map((E,z)=>"type")},getShaderSource:x,getRunData:()=>({outputs:v,dispatchGroup:{x:Math.ceil(u/l)},programUniforms:y})}},hp=(e,t)=>{pp(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(cp(e.inputs,t,e.outputCount,!1),{outputs:r})}}),fp,la,mp,Ks,gp,yp,_p,wp,fh=C(()=>{"use strict";oe(),ae(),b(),K(),fp=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},la=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},mp=(e,t)=>{if(e.length>1){let r=la(e,1),i=la(e,2),a=la(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),g({starts:r,ends:i,axes:a})}else return t},Ks=(e,t,r,i,a)=>{let s=e;return e<0&&(s+=r[i[t]]),a[t]<0?Math.max(0,Math.min(s,r[i[t]]-1)):Math.max(0,Math.min(s,r[i[t]]))},gp=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${M("uniforms.input_shape","i",r.length)};
            let steps_i = ${M("uniforms.steps","i",r.length)};
            let signs_i = ${M("uniforms.signs","i",r.length)};
            let starts_i = ${M("uniforms.starts","i",r.length)};
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
      }`,yp=(e,t)=>{let r=e[0].dims,i=D.size(r),a=t.axes.length>0?D.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],s=la(e,4);s.forEach(w=>w!==0||(()=>{throw new Error("step cannot be 0")})),s.length===0&&(s=Array(a.length).fill(1));let n=t.starts.map((w,y)=>Ks(w,y,r,a,s)),o=t.ends.map((w,y)=>Ks(w,y,r,a,s));if(a.length!==n.length||a.length!==o.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let w=0;w<r.length;++w)a.includes(w)||(n.splice(w,0,0),o.splice(w,0,r[w]),s.splice(w,0,1));let u=s.map(w=>Math.sign(w));s.forEach((w,y,x)=>{if(w<0){let v=(o[y]-n[y])/w,E=n[y],z=E+v*s[y];n[y]=z,o[y]=E,x[y]=-w}});let l=r.slice(0);a.forEach((w,y)=>{l[w]=Math.ceil((o[w]-n[w])/s[w])});let p={dims:l,dataType:e[0].dataType},d=j("output",e[0].dataType,l.length),h=A("input",e[0].dataType,e[0].dims.length),m=D.size(l),f=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:n.length},{name:"signs",type:"i32",length:u.length},{name:"steps",type:"u32",length:s.length}],_=[{type:12,data:m},{type:12,data:n},{type:6,data:u},{type:12,data:s},...k(e[0].dims,l)],$=w=>`
      ${w.registerUniforms(f).declareVariables(h,d)}
        ${gp(h,d,r)}
        ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${d.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${d.setByOffset("global_idx",h.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${u.length}_${n.length}_${s.length}`,inputDependencies:["rank"]},getShaderSource:$,getRunData:()=>({outputs:[p],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:_})}},_p=(e,t)=>{fp(e.inputs,t);let r=mp(e.inputs,t);e.compute(yp(e.inputs,r),{inputs:[0]})},wp=e=>{let t=e.starts,r=e.ends,i=e.axes;return g({starts:t,ends:r,axes:i})}}),bp,$p,vp,xp,mh=C(()=>{"use strict";oe(),ae(),b(),It(),K(),bp=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},$p=(e,t)=>{let r=e.inputs[0],i=r.dims,a=D.size(i),s=i.length,n=D.normalizeAxis(t.axis,s),o=n<i.length-1,u,l=[];o?(l=Array.from({length:s},(R,N)=>N),l[n]=s-1,l[s-1]=n,u=e.compute(Je(r,l),{inputs:[r],outputs:[-1]})[0]):u=r;let p=u.dims,d=p[s-1],h=a/d,m=O(d),f=d/m,_=64;h===1&&(_=256);let $=(R,N)=>N===4?`max(max(${R}.x, ${R}.y), max(${R}.z, ${R}.w))`:N===2?`max(${R}.x, ${R}.y)`:N===3?`max(max(${R}.x, ${R}.y), ${R}.z)`:R,w=A("x",u.dataType,u.dims,m),y=j("result",u.dataType,u.dims,m),x=w.type.value,v=B(u.dataType)==="f32"?`var threadMax = ${x}(-3.4028234663852886e+38f);`:`var threadMax = ${x}(-65504.0h);`,E=R=>`
      var<workgroup> rowMaxShared : ${x};
      var<workgroup> rowSumShared : ${x};
      var<workgroup> threadShared : array<${x}, ${_}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${x} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${x}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${R.registerUniform("packedCols","i32").declareVariables(w,y)}
      ${R.mainStart(_)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${_};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${v}
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
          rowMaxShared = ${x}(${$("threadShared[0]",m)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${x}(0.0);
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
          rowSumShared = ${x}(${q("threadShared[0]",m)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${x}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,z=e.compute({name:"Softmax",shaderCache:{hint:`${m};${_}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:p,dataType:u.dataType}],dispatchGroup:{x:h},programUniforms:[{type:6,data:f}]}),getShaderSource:E},{inputs:[u],outputs:[o?-1:0]})[0];o&&e.compute(Je(z,l),{inputs:[z]})},vp=(e,t)=>{bp(e.inputs),$p(e,t)},xp=e=>g({axis:e.axis})}),Zs,Sp,Tp,Ep,kp,gh=C(()=>{"use strict";oe(),ae(),K(),Zs=e=>Array.from(e.getBigInt64Array(),Number),Sp=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(Zs(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},Tp=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},Ep=(e,t)=>{let r=e[0].dims,i=t??Zs(e[1]),a=Tp(r,i),s=D.size(a),n=e[0].dataType,o=A("input",n,r.length),u=j("output",n,a.length),l=p=>`
      const inputShape = ${o.indices(...r)};
      ${p.registerUniform("output_size","u32").declareVariables(o,u)}
      ${p.mainStart()}
      ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${u.offsetToIndices("global_idx")};
      var input_indices: ${o.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${o.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${u.indicesGet("output_indices","i")}  % input_dim_i;

        ${o.indicesSet("input_indices","i","input_dim_value")}
      }
      ${u.setByOffset("global_idx",o.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:[{type:12,data:s},...k(e[0].dims,a)]}),getShaderSource:l}},kp=e=>{Sp(e.inputs),e.compute(Ep(e.inputs),{inputs:[0]})}}),Ip,zp,Cp,yh=C(()=>{"use strict";oe(),ae(),K(),Ip=(e,t,r,i,a)=>{let s=j("output_data",a,r.length,4),n=A("a_data",t[1].dataType,t[1].dims.length,4),o=A("b_data",t[2].dataType,t[2].dims.length,4),u=A("c_data",t[0].dataType,t[0].dims.length,4),l,p=(d,h,m)=>`select(${h}, ${d}, ${m})`;if(!i)l=s.setByOffset("global_idx",p(n.getByOffset("global_idx"),o.getByOffset("global_idx"),u.getByOffset("global_idx")));else{let d=(h,m,f="")=>{let _=`a_data[index_a${m}][component_a${m}]`,$=`b_data[index_b${m}][component_b${m}]`,w=`bool(c_data[index_c${m}] & (0xffu << (component_c${m} * 8)))`;return`
            let output_indices${m} = ${s.offsetToIndices(`global_idx * 4u + ${m}u`)};
            let offset_a${m} = ${n.broadcastedIndicesToOffset(`output_indices${m}`,s)};
            let offset_b${m} = ${o.broadcastedIndicesToOffset(`output_indices${m}`,s)};
            let offset_c${m} = ${u.broadcastedIndicesToOffset(`output_indices${m}`,s)};
            let index_a${m} = offset_a${m} / 4u;
            let index_b${m} = offset_b${m} / 4u;
            let index_c${m} = offset_c${m} / 4u;
            let component_a${m} = offset_a${m} % 4u;
            let component_b${m} = offset_b${m} % 4u;
            let component_c${m} = offset_c${m} % 4u;
            ${h}[${m}] = ${f}(${p(_,$,w)});
          `};a===9?l=`
            var data = vec4<u32>(0);
            ${d("data",0,"u32")}
            ${d("data",1,"u32")}
            ${d("data",2,"u32")}
            ${d("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:l=`
            ${d("output_data[global_idx]",0)}
            ${d("output_data[global_idx]",1)}
            ${d("output_data[global_idx]",2)}
            ${d("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(u,n,o,s)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${l}
      }`},zp=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,s=!(D.areEqual(t,r)&&D.areEqual(r,i)),n=t,o=D.size(t);if(s){let l=Nt.calcShape(Nt.calcShape(t,r,!1),i,!1);if(!l)throw new Error("Can't perform where op on the given tensors");n=l,o=D.size(n)}let u=Math.ceil(o/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:l=>Ip(l,e,n,s,a),getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:Math.ceil(o/64/4)},programUniforms:[{type:12,data:u},...k(i,t,r,n)]})}},Cp=e=>{e.compute(zp(e.inputs))}}),Ap,_h=C(()=>{"use strict";Oc(),ps(),Rc(),Bc(),Mc(),Dc(),Pc(),Vc(),Gc(),Wc(),jc(),Hc(),Kc(),Zc(),Qc(),Xc(),Yc(),Jc(),eh(),th(),rh(),ih(),ah(),sh(),nh(),Fl(),oh(),uh(),lh(),dh(),ph(),us(),ch(),Jl(),hh(),fh(),mh(),Ql(),gh(),It(),ms(),yh(),Ap=new Map([["Abs",[po]],["Acos",[co]],["Acosh",[ho]],["Add",[eu]],["ArgMax",[Zn,ds]],["ArgMin",[Kn,ds]],["Asin",[fo]],["Asinh",[mo]],["Atan",[go]],["Atanh",[yo]],["Attention",[to]],["AveragePool",[zd,Id]],["BatchNormalization",[so]],["BiasAdd",[uo]],["BiasSplitGelu",[Xo]],["Cast",[wo,_o]],["Ceil",[vo]],["Clip",[$o]],["Concat",[fu,mu]],["Conv",[Is,Es]],["ConvTranspose",[Vu,Nu]],["Cos",[xo]],["Cosh",[So]],["CumSum",[Gu,Wu]],["DepthToSpace",[Zu,Qu]],["DequantizeLinear",[Ud,Nd]],["Div",[tu]],["Einsum",[rl,il]],["Elu",[To,ia]],["Equal",[ru]],["Erf",[Eo]],["Exp",[ko]],["Expand",[ol]],["FastGelu",[ll]],["Floor",[Io]],["FusedConv",[Is,Es]],["Gather",[hl,cl]],["GatherElements",[Sl,xl]],["GatherBlockQuantized",[wl,bl]],["GatherND",[ml,gl]],["Gelu",[zo]],["Gemm",[Il,kl]],["GlobalAveragePool",[Ad,Cd]],["GlobalMaxPool",[Md,Bd]],["Greater",[nu]],["GreaterOrEqual",[uu]],["GridSample",[Pl,Ul]],["GroupQueryAttention",[id]],["HardSigmoid",[Po,Do]],["InstanceNormalization",[nd]],["LayerNormalization",[ld]],["LeakyRelu",[Co,ia]],["Less",[ou]],["LessOrEqual",[lu]],["Log",[Wo]],["MatMul",[pd]],["MatMulNBits",[md,gd]],["MaxPool",[Od,Rd]],["Mul",[iu]],["MultiHeadAttention",[Vl,Ll]],["Neg",[Oo]],["Not",[Ao]],["Pad",[Td]],["Pow",[au]],["QuickGelu",[Ko,ia]],["Range",[Vd]],["Reciprocal",[Ro]],["ReduceMin",[Fn]],["ReduceMean",[Un]],["ReduceMax",[Vn]],["ReduceSum",[Wn]],["ReduceProd",[Gn]],["ReduceL1",[Nn]],["ReduceL2",[Ln]],["ReduceLogSum",[Hn]],["ReduceLogSumExp",[qn]],["ReduceSumSquare",[jn]],["Relu",[Bo]],["Resize",[lp,dp]],["RotaryEmbedding",[Yl]],["ScatterND",[jd,Wd]],["Sigmoid",[Mo]],["Sin",[Uo]],["Sinh",[No]],["Slice",[_p,wp]],["SkipLayerNormalization",[hp]],["Split",[Kl,Zl]],["Sqrt",[Lo]],["Softmax",[vp,xp]],["Sub",[su]],["Tan",[qo]],["Tanh",[Vo]],["ThresholdedRelu",[Go,ia]],["Tile",[kp]],["Transpose",[ft,wt]],["Where",[Cp]]])}),Op,wh=C(()=>{"use strict";Ge(),ht(),K(),Op=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){je(e.programInfo.name);let s=this.backend.device,n=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let o=[];for(let l of t)o.push({binding:o.length,resource:{buffer:l.buffer}});for(let l of r)o.push({binding:o.length,resource:{buffer:l.buffer}});a&&o.push({binding:o.length,resource:a});let u=s.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:o,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let l={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:u,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(l)}n.setPipeline(e.computePipeline),n.setBindGroup(0,u),n.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Fe(e.programInfo.name)}dispose(){}build(e,t){je(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(l=>{r.features.has(l.feature)&&i.push(`enable ${l.extension};`)});let a=$e(t,this.backend.device.limits),s=e.getShaderSource(a),n=`${i.join(`
`)}
${a.additionalImplementations}
${s}`,o=r.createShaderModule({code:n,label:e.name});we("verbose",()=>`[WebGPU] ${e.name} shader code: ${n}`);let u=r.createComputePipeline({compute:{module:o,entryPoint:"main"},layout:"auto",label:e.name});return Fe(e.name),{programInfo:e,computePipeline:u,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let s=t*r*i,n=Math.ceil(Math.sqrt(s));if(n>a){if(n=Math.ceil(Math.cbrt(s)),n>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[n,n,n]}else return[n,n,1]}}}),Rp={};le(Rp,{WebGpuBackend:()=>Pp});var Bp,Mp,Dp,Pp,bh=C(()=>{"use strict";Ge(),oe(),ht(),Jt(),ns(),_h(),wh(),Bp=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let s=e[i].dims.length;r.push(`${a};${s}`);break}case"dims":{let s=e[i].dims.join(",");r.push(`${a};${s}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},Mp=(e,t,r)=>{let i=e.name;return e.shaderCache?.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${Bp(t,e.shaderCache?.inputDependencies??new Array(t.length).fill("dims"))}`,i},Dp=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},Pp=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=o=>t.features.has(o)&&r.push(o)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i);let s=t,n=t.info??(typeof s.requestAdapterInfo=="function"?await s.requestAdapterInfo():void 0);this.adapterInfo=new Dp(n),this.gpuDataManager=_a(this),this.programManager=new Op(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Kr(e.logLevel,!!e.debug),this.device.onuncapturederror=o=>{o.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${o.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!0}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose(),this.device&&this.env?.webgpu&&this.device.lost.then(()=>{delete this.env.webgpu.device})}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;je(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let i=0;i<t.length/2;i++){let a=r[i],s=a.kernelId,n=this.kernels.get(s),o=n.kernelType,u=n.kernelName,l=a.programName,p=a.inputTensorViews,d=a.outputTensorViews,h=t[i*2],m=t[i*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=h);let f=Number(h-this.queryTimeBase),_=Number(m-this.queryTimeBase);if(!Number.isSafeInteger(f)||!Number.isSafeInteger(_))throw new RangeError("incorrect timestamp range");if(this.env.webgpu.profiling?.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:p.map($=>({dims:$.dims,dataType:ut($.dataType)})),outputsMetadata:d.map($=>({dims:$.dims,dataType:ut($.dataType)})),kernelId:s,kernelType:o,kernelName:u,programName:l,startTime:f,endTime:_});else{let $="";p.forEach((y,x)=>{$+=`input[${x}]: [${y.dims}] | ${ut(y.dataType)}, `});let w="";d.forEach((y,x)=>{w+=`output[${x}]: [${y.dims}] | ${ut(y.dataType)}, `}),console.log(`[profiling] kernel "${s}|${o}|${u}|${l}" ${$}${w}start time: ${f} ns, execution time: ${_-f} ns`)}Pt("GPU",`${l}::${h}::${m}`)}e.unmap(),this.pendingQueries.delete(e)}),Fe()}run(e,t,r,i,a,s){je(e.name);let n=[];for(let y=0;y<t.length;++y){let x=t[y].data;if(x===0)continue;let v=this.gpuDataManager.get(x);if(!v)throw new Error(`no GPU data for input: ${x}`);n.push(v)}let{outputs:o,dispatchGroup:u,programUniforms:l}=e.getRunData(t),p=r.length===0?o.map((y,x)=>x):r;if(p.length!==o.length)throw new Error(`Output size ${p.length} must be equal to ${o.length}.`);let d=[],h=[];for(let y=0;y<o.length;++y){if(!Number.isInteger(p[y])||p[y]<-3||p[y]>=s)throw new Error(`Invalid output index: ${p[y]}`);if(p[y]===-3)continue;let x=p[y]===-1,v=p[y]===-2,E=x||v?a(o[y].dataType,o[y].dims):i(p[y],o[y].dataType,o[y].dims);if(d.push(E),E.data===0)continue;let z=this.gpuDataManager.get(E.data);if(!z)throw new Error(`no GPU data for output: ${E.data}`);if(x&&this.temporaryData.push(z),v){let R=this.kernelPersistentData.get(this.currentKernelId);R||(R=[],this.kernelPersistentData.set(this.currentKernelId,R)),R.push(z)}h.push(z)}if(n.length!==t.length||h.length!==d.length){if(h.length===0)return Fe(e.name),d;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let m;if(l){let y=0,x=[];l.forEach(R=>{let N=typeof R.data=="number"?[R.data]:R.data;if(N.length===0)return;let F=R.type===10?2:4,Q,ye;R.type===10?(ye=N.length>4?16:N.length>2?8:N.length*F,Q=N.length>4?16:F*N.length):(ye=N.length<=2?N.length*F:16,Q=16),y=Math.ceil(y/ye)*ye,x.push(y);let ie=R.type===10?8:4;y+=N.length>4?Math.ceil(N.length/ie)*Q:N.length*F});let v=16;y=Math.ceil(y/v)*v;let E=new ArrayBuffer(y);l.forEach((R,N)=>{let F=x[N],Q=typeof R.data=="number"?[R.data]:R.data;if(R.type===6)new Int32Array(E,F,Q.length).set(Q);else if(R.type===12)new Uint32Array(E,F,Q.length).set(Q);else if(R.type===10)new Uint16Array(E,F,Q.length).set(Q);else if(R.type===1)new Float32Array(E,F,Q.length).set(Q);else throw new Error(`Unsupported uniform type: ${ut(R.type)}`)});let z=this.gpuDataManager.create(y,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(z.buffer,0,E,0,y),this.gpuDataManager.release(z.id),m={offset:0,size:y,buffer:z.buffer}}let f=this.programManager.normalizeDispatchGroupSize(u),_=f[1]===1&&f[2]===1,$=Mp(e,t,_),w=this.programManager.getArtifact($);if(w||(w=this.programManager.build(e,f),this.programManager.setArtifact($,w),we("info",()=>`[artifact] key: ${$}, programName: ${e.name}`)),l&&w.uniformVariablesInfo){if(l.length!==w.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${w.uniformVariablesInfo.length}, got ${l.length} in program "${w.programInfo.name}".`);for(let y=0;y<l.length;y++){let x=l[y],v=x.type,E=typeof x.data=="number"?1:x.data.length,[z,R]=w.uniformVariablesInfo[y];if(v!==z||E!==R)throw new Error(`Uniform variable ${y} mismatch: expect type ${z} with size ${R}, got type ${v} with size ${E} in program "${w.programInfo.name}".`)}}if(we("info",()=>`[ProgramManager] run "${e.name}" (key=${$}) with ${f[0]}x${f[1]}x${f[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let y={kernelId:this.currentKernelId,programName:w.programInfo.name,inputTensorViews:t,outputTensorViews:d};this.pendingKernels.push(y),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(y)}return this.programManager.run(w,n,h,f,m),Fe(e.name),d}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=Ap.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let s={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,s)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,s=i.kernelName,n=i.kernelEntry,o=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${s}" is not allowed to be called recursively`);this.currentKernelId=e,o[0]&&(o[1]=o[0](o[1]),o[0]=void 0),we("info",()=>`[WebGPU] Start to run kernel "[${a}] ${s}"...`);let u=this.env.debug;this.temporaryData=[];try{return u&&this.device.pushErrorScope("validation"),n(t,o[1]),0}catch(l){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${s}" failed. ${l}`)),1}finally{u&&r.push(this.device.popErrorScope().then(l=>l?`GPU validation error for kernel "[${a}] ${s}": ${l.message}`:null));for(let l of this.temporaryData)this.gpuDataManager.release(l.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let s=a.get(t),n=this.gpuDataManager.registerExternalBuffer(r,i,s);return a.set(t,[n,r]),n}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await Yi(this,e,t);return Lt(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){this.queryType="none",(this.env.webgpu.profiling?.mode==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){we("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){we("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){we("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),s=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(s.computePipeline),a.setBindGroup(0,s.bindGroup),a.dispatchWorkgroups(...s.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),Up={};le(Up,{init:()=>Lp});var Ca,Np,Lp,$h=C(()=>{"use strict";oe(),ht(),ae(),Xi(),Ca=class pc{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=D.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(D.size(t)!==D.size(this.dims))throw new Error("Invalid new shape");return new pc(this.module,this.dataType,this.data,t)}},Np=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,s=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,s));let n=Number(e.getValue(i*a++,s));this.outputCount=Number(e.getValue(i*a++,s)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,s));let o=[];for(let u=0;u<n;u++){let l=Number(e.getValue(i*a++,s)),p=Number(e.getValue(i*a++,"*")),d=Number(e.getValue(i*a++,s)),h=[];for(let m=0;m<d;m++)h.push(Number(e.getValue(i*a++,s)));o.push(new Ca(e,l,p,h))}this.inputs=o}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){let r=t?.inputs?.map(n=>typeof n=="number"?this.inputs[n]:n)??this.inputs,i=t?.outputs??[],a=(n,o,u)=>new Ca(this.module,o,this.output(n,u),u),s=(n,o)=>{let u=lt(n,o);if(!u)throw new Error(`Unsupported data type: ${n}`);let l=u>0?this.backend.gpuDataManager.create(u).id:0;return new Ca(this.module,n,l,o)};return this.backend.run(e,r,i,a,s,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",s=this.module.stackAlloc((1+t.length)*i);this.module.setValue(s,t.length,a);for(let n=0;n<t.length;n++)this.module.setValue(s+i*(n+1),t[n],a);return this.module._JsepOutput(this.opKernelContext,e,s)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},Lp=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let s=(bh(),J(Rp)).WebGpuBackend,n=new s;await n.initialize(r,i),a("webgpu",[n,o=>n.alloc(Number(o)),o=>n.free(o),(o,u,l,p=!1)=>{if(p)we("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(o)}, dst=${Number(u)}, size=${Number(l)}`),n.memcpy(Number(o),Number(u));else{we("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(o)}, gpuDataId=${Number(u)}, size=${Number(l)}`);let d=t.HEAPU8.subarray(Number(o>>>0),Number(o>>>0)+Number(l));n.upload(Number(u),d)}},async(o,u,l)=>{we("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${o}, dataOffset=${u}, size=${l}`),await n.download(Number(o),()=>t.HEAPU8.subarray(Number(u)>>>0,Number(u+l)>>>0))},(o,u,l)=>n.createKernel(o,Number(u),l,t.UTF8ToString(t._JsepGetNodeName(Number(u)))),o=>n.releaseKernel(o),(o,u,l,p)=>{we("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${l}, kernel=${o}, contextDataOffset=${u}`);let d=new Np(t,n,Number(u));return n.computeKernel(Number(o),d,p)},()=>n.captureBegin(),()=>n.captureEnd(),()=>n.replay()])}else{let s=new Qi(r);a("webnn",[s,()=>s.reserveTensorId(),n=>s.releaseTensorId(n),async(n,o,u,l,p)=>s.ensureTensor(n,o,u,l,p),(n,o)=>{s.uploadTensor(n,o)},async(n,o)=>s.downloadTensor(n,o),(n,o)=>s.registerMLContext(n,o),!!r.trace])}}}),qp,Qs,Xs,ir,Vp,Ys,Aa,Js,en,tn,rn,an,sn,Fp=C(()=>{"use strict";Ge(),as(),ss(),oe(),nt(),xr(),Gi(),qp=(e,t)=>{ue()._OrtInit(e,t)!==0&&re("Can't initialize onnxruntime.")},Qs=async e=>{qp(e.wasm.numThreads,Tr(e.logLevel))},Xs=async(e,t)=>{ue().asyncInit?.();let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let i=e.webgpu.powerPreference;if(i!==void 0&&i!=="low-power"&&i!=="high-performance")throw new Error(`Invalid powerPreference setting: "${i}"`);let a=e.webgpu.forceFallbackAdapter;if(a!==void 0&&typeof a!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${a}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:i,forceFallbackAdapter:a}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let i=($h(),J(Up)).init;t==="webgpu"&&await i("webgpu",ue(),e,r),t==="webnn"&&await i("webnn",ue(),e)}},ir=new Map,Vp=e=>{let t=ue(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&re("Can't get session input/output count.");let s=i===4?"i32":"i64";return[Number(t.getValue(a,s)),Number(t.getValue(a+i,s))]}finally{t.stackRestore(r)}},Ys=(e,t)=>{let r=ue(),i=r.stackSave(),a=0;try{let s=r.PTR_SIZE,n=r.stackAlloc(2*s);r._OrtGetInputOutputMetadata(e,t,n,n+s)!==0&&re("Can't get session input/output metadata.");let o=Number(r.getValue(n,"*"));a=Number(r.getValue(n+s,"*"));let u=r.HEAP32[a/4];if(u===0)return[o,0];let l=r.HEAPU32[a/4+1],p=[];for(let d=0;d<l;d++){let h=Number(r.getValue(a+8+d*s,"*"));p.push(h!==0?r.UTF8ToString(h):Number(r.getValue(a+8+(d+l)*s,"*")))}return[o,u,p]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},Aa=e=>{let t=ue(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},Js=async(e,t)=>{let r,i,a=ue();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Aa(e);let s=0,n=0,o=0,u=[],l=[],p=[];try{if([n,u]=await Fi(t),t?.externalData&&a.mountExternalData){let v=[];for(let E of t.externalData){let z=typeof E=="string"?E:E.path;v.push(Ir(typeof E=="string"?E:E.data).then(R=>{a.mountExternalData(z,R)}))}await Promise.all(v)}for(let v of t?.executionProviders??[])if((typeof v=="string"?v:v.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof v!="string"){let E=v,z=E?.context,R=E?.gpuDevice,N=E?.deviceType,F=E?.powerPreference;z?a.currentContext=z:R?a.currentContext=await a.webnnCreateMLContext(R):a.currentContext=await a.webnnCreateMLContext({deviceType:N,powerPreference:F})}else a.currentContext=await a.webnnCreateMLContext();break}s=await a._OrtCreateSession(r,i,n),a.webgpuOnCreateSession?.(s),s===0&&re("Can't create a session."),a.jsepOnCreateSession?.(),a.currentContext&&(a.webnnRegisterMLContext(s,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[d,h]=Vp(s),m=!!t?.enableGraphCapture,f=[],_=[],$=[],w=[],y=[];for(let v=0;v<d;v++){let[E,z,R]=Ys(s,v);E===0&&re("Can't get an input name."),l.push(E);let N=a.UTF8ToString(E);f.push(N),$.push(z===0?{name:N,isTensor:!1}:{name:N,isTensor:!0,type:ut(z),shape:R})}for(let v=0;v<h;v++){let[E,z,R]=Ys(s,v+d);E===0&&re("Can't get an output name."),p.push(E);let N=a.UTF8ToString(E);_.push(N),w.push(z===0?{name:N,isTensor:!1}:{name:N,isTensor:!0,type:ut(z),shape:R});{if(m&&t?.preferredOutputLocation===void 0){y.push("gpu-buffer");continue}let F=typeof t?.preferredOutputLocation=="string"?t.preferredOutputLocation:t?.preferredOutputLocation?.[N]??"cpu",Q=a.webnnIsGraphOutput;if(F==="cpu"&&Q&&Q(s,N)){y.push("ml-tensor-cpu-output");continue}if(F!=="cpu"&&F!=="cpu-pinned"&&F!=="gpu-buffer"&&F!=="ml-tensor")throw new Error(`Not supported preferred output location: ${F}.`);if(m&&F!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${F}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);y.push(F)}}let x=null;return y.some(v=>v==="gpu-buffer"||v==="ml-tensor"||v==="ml-tensor-cpu-output")&&(o=a._OrtCreateBinding(s),o===0&&re("Can't create IO binding."),x={handle:o,outputPreferredLocations:y,outputPreferredLocationsEncoded:y.map(v=>v==="ml-tensor-cpu-output"?"ml-tensor":v).map(v=>Wr(v))}),ir.set(s,[s,l,p,x,m,!1]),[s,f,_,$,w]}catch(d){throw l.forEach(h=>a._OrtFree(h)),p.forEach(h=>a._OrtFree(h)),o!==0&&a._OrtReleaseBinding(o)!==0&&re("Can't release IO binding."),s!==0&&a._OrtReleaseSession(s)!==0&&re("Can't release session."),d}finally{a._free(r),n!==0&&a._OrtReleaseSessionOptions(n)!==0&&re("Can't release session options."),u.forEach(d=>a._free(d)),a.unmountExternalData?.()}},en=e=>{let t=ue(),r=ir.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,s,n,o]=r;n&&(o&&t._OrtClearBoundOutputs(n.handle)!==0&&re("Can't clear bound outputs."),t._OrtReleaseBinding(n.handle)!==0&&re("Can't release IO binding.")),t.jsepOnReleaseSession?.(e),t.webnnOnReleaseSession?.(e),t.webgpuOnReleaseSession?.(e),a.forEach(u=>t._OrtFree(u)),s.forEach(u=>t._OrtFree(u)),t._OrtReleaseSession(i)!==0&&re("Can't release session."),ir.delete(e)},tn=async(e,t,r,i,a,s,n=!1)=>{if(!e){t.push(0);return}let o=ue(),u=o.PTR_SIZE,l=e[0],p=e[1],d=e[3],h=d,m,f;if(l==="string"&&(d==="gpu-buffer"||d==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(n&&d!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${s} when enableGraphCapture is true.`);if(d==="gpu-buffer"){let w=e[2].gpuBuffer;f=lt(ot(l),p);{let y=o.jsepRegisterBuffer;if(!y)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');m=y(i,s,w,f)}}else if(d==="ml-tensor"){let w=e[2].mlTensor;f=lt(ot(l),p);let y=o.webnnRegisterMLTensor;if(!y)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');m=y(i,w,ot(l),p)}else{let w=e[2];if(Array.isArray(w)){f=u*w.length,m=o._malloc(f),r.push(m);for(let y=0;y<w.length;y++){if(typeof w[y]!="string")throw new TypeError(`tensor data at index ${y} is not a string`);o.setValue(m+y*u,De(w[y],r),"*")}}else{let y=o.webnnIsGraphInput,x=o.webnnIsGraphOutput;if(l!=="string"&&y&&x){let v=o.UTF8ToString(a);if(y(i,v)||x(i,v)){let E=ot(l);f=lt(E,p),h="ml-tensor";let z=o.webnnCreateTemporaryTensor,R=o.webnnUploadTensor;if(!z||!R)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let N=await z(i,E,p);R(N,new Uint8Array(w.buffer,w.byteOffset,w.byteLength)),m=N}else f=w.byteLength,m=o._malloc(f),r.push(m),o.HEAPU8.set(new Uint8Array(w.buffer,w.byteOffset,f),m)}else f=w.byteLength,m=o._malloc(f),r.push(m),o.HEAPU8.set(new Uint8Array(w.buffer,w.byteOffset,f),m)}}let _=o.stackSave(),$=o.stackAlloc(4*p.length);try{p.forEach((y,x)=>o.setValue($+x*u,y,u===4?"i32":"i64"));let w=o._OrtCreateTensor(ot(l),m,f,$,p.length,Wr(h));w===0&&re(`Can't create tensor for input/output. session=${i}, index=${s}.`),t.push(w)}finally{o.stackRestore(_)}},rn=async(e,t,r,i,a,s)=>{let n=ue(),o=n.PTR_SIZE,u=ir.get(e);if(!u)throw new Error(`cannot run inference. invalid session id: ${e}`);let l=u[0],p=u[1],d=u[2],h=u[3],m=u[4],f=u[5],_=t.length,$=i.length,w=0,y=[],x=[],v=[],E=[],z=[],R=n.stackSave(),N=n.stackAlloc(_*o),F=n.stackAlloc(_*o),Q=n.stackAlloc($*o),ye=n.stackAlloc($*o);try{[w,y]=Ui(s),Xe("wasm prepareInputOutputTensor");for(let X=0;X<_;X++)await tn(r[X],x,E,e,p[t[X]],t[X],m);for(let X=0;X<$;X++)await tn(a[X],v,E,e,d[i[X]],_+i[X],m);Ye("wasm prepareInputOutputTensor");for(let X=0;X<_;X++)n.setValue(N+X*o,x[X],"*"),n.setValue(F+X*o,p[t[X]],"*");for(let X=0;X<$;X++)n.setValue(Q+X*o,v[X],"*"),n.setValue(ye+X*o,d[i[X]],"*");if(h&&!f){let{handle:X,outputPreferredLocations:te,outputPreferredLocationsEncoded:me}=h;if(p.length!==_)throw new Error(`input count from feeds (${_}) is expected to be always equal to model's input count (${p.length}).`);Xe("wasm bindInputsOutputs");for(let _e=0;_e<_;_e++){let he=t[_e];await n._OrtBindInput(X,p[he],x[_e])!==0&&re(`Can't bind input[${_e}] for session=${e}.`)}for(let _e=0;_e<$;_e++){let he=i[_e];a[_e]?.[3]?(z.push(v[_e]),n._OrtBindOutput(X,d[he],v[_e],0)!==0&&re(`Can't bind pre-allocated output[${_e}] for session=${e}.`)):n._OrtBindOutput(X,d[he],0,me[he])!==0&&re(`Can't bind output[${_e}] to ${te[_e]} for session=${e}.`)}Ye("wasm bindInputsOutputs"),ir.set(e,[l,p,d,h,m,!0])}n.jsepOnRunStart?.(l),n.webnnOnRunStart?.(l);let ie;h?ie=await n._OrtRunWithBinding(l,h.handle,$,Q,w):ie=await n._OrtRun(l,F,N,_,ye,$,Q,w),ie!==0&&re("failed to call OrtRun().");let se=[],ke=[];Xe("wasm ProcessOutputTensor");for(let X=0;X<$;X++){let te=Number(n.getValue(Q+X*o,"*"));if(te===v[X]||z.includes(v[X])){se.push(a[X]),te!==v[X]&&n._OrtReleaseTensor(te)!==0&&re("Can't release tensor.");continue}let me=n.stackSave(),_e=n.stackAlloc(4*o),he=!1,ve,W=0;try{n._OrtGetTensorData(te,_e,_e+o,_e+2*o,_e+3*o)!==0&&re(`Can't access output tensor data on index ${X}.`);let pe=o===4?"i32":"i64",ne=Number(n.getValue(_e,pe));W=n.getValue(_e+o,"*");let Y=n.getValue(_e+o*2,"*"),Qe=Number(n.getValue(_e+o*3,pe)),dt=[];for(let Ae=0;Ae<Qe;Ae++)dt.push(Number(n.getValue(Y+Ae*o,pe)));n._OrtFree(Y)!==0&&re("Can't free memory for tensor dims.");let Le=dt.reduce((Ae,qe)=>Ae*qe,1);ve=ut(ne);let pt=h?.outputPreferredLocations[i[X]];if(ve==="string"){if(pt==="gpu-buffer"||pt==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let Ae=[];for(let qe=0;qe<Le;qe++){let Xt=n.getValue(W+qe*o,"*"),Eh=n.getValue(W+(qe+1)*o,"*"),kh=qe===Le-1?void 0:Eh-Xt;Ae.push(n.UTF8ToString(Xt,kh))}se.push([ve,dt,Ae,"cpu"])}else if(pt==="gpu-buffer"&&Le>0){let Ae=n.jsepGetBuffer;if(!Ae)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let qe=Ae(W),Xt=lt(ne,Le);if(Xt===void 0||!Er(ve))throw new Error(`Unsupported data type: ${ve}`);he=!0,se.push([ve,dt,{gpuBuffer:qe,download:n.jsepCreateDownloader(qe,Xt,ve),dispose:()=>{n._OrtReleaseTensor(te)!==0&&re("Can't release tensor.")}},"gpu-buffer"])}else if(pt==="ml-tensor"&&Le>0){let Ae=n.webnnEnsureTensor,qe=n.webnnIsGraphInputOutputTypeSupported;if(!Ae||!qe)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(lt(ne,Le)===void 0||!kr(ve))throw new Error(`Unsupported data type: ${ve}`);if(!qe(e,ve,!1))throw new Error(`preferredLocation "ml-tensor" for ${ve} output is not supported by current WebNN Context.`);let Xt=await Ae(e,W,ne,dt,!1);he=!0,se.push([ve,dt,{mlTensor:Xt,download:n.webnnCreateMLTensorDownloader(W,ve),dispose:()=>{n.webnnReleaseTensorId(W),n._OrtReleaseTensor(te)}},"ml-tensor"])}else if(pt==="ml-tensor-cpu-output"&&Le>0){let Ae=n.webnnCreateMLTensorDownloader(W,ve)(),qe=se.length;he=!0,ke.push((async()=>{let Xt=[qe,await Ae];return n.webnnReleaseTensorId(W),n._OrtReleaseTensor(te),Xt})()),se.push([ve,dt,[],"cpu"])}else{let Ae=Sr(ve),qe=new Ae(Le);new Uint8Array(qe.buffer,qe.byteOffset,qe.byteLength).set(n.HEAPU8.subarray(W,W+qe.byteLength)),se.push([ve,dt,qe,"cpu"])}}finally{n.stackRestore(me),ve==="string"&&W&&n._free(W),he||n._OrtReleaseTensor(te)}}h&&!m&&(n._OrtClearBoundOutputs(h.handle)!==0&&re("Can't clear bound outputs."),ir.set(e,[l,p,d,h,m,!1]));for(let[X,te]of await Promise.all(ke))se[X][2]=te;return Ye("wasm ProcessOutputTensor"),se}finally{n.webnnOnRunEnd?.(l),n.stackRestore(R),x.forEach(ie=>n._OrtReleaseTensor(ie)),v.forEach(ie=>n._OrtReleaseTensor(ie)),E.forEach(ie=>n._free(ie)),w!==0&&n._OrtReleaseRunOptions(w),y.forEach(ie=>n._free(ie))}},an=e=>{let t=ue(),r=ir.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&re("Can't get an profile file name."),t._OrtFree(a)},sn=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),ar,$t,li,da,pa,Oa,nn,Ra,Lr,qr,Gp,Wp,jp,Hp,Kp,Zp,Qp,Xp,Yp=C(()=>{"use strict";Ge(),Fp(),nt(),wr(),ar=()=>!!de.wasm.proxy&&typeof document<"u",li=!1,da=!1,pa=!1,Ra=new Map,Lr=(e,t)=>{let r=Ra.get(e);r?r.push(t):Ra.set(e,[t])},qr=()=>{if(li||!da||pa||!$t)throw new Error("worker not ready")},Gp=e=>{switch(e.data.type){case"init-wasm":li=!1,e.data.err?(pa=!0,nn[1](e.data.err)):(da=!0,nn[0]()),Oa&&(URL.revokeObjectURL(Oa),Oa=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Ra.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}default:}},Wp=async()=>{if(!da){if(li)throw new Error("multiple calls to 'initWasm()' detected.");if(pa)throw new Error("previous call to 'initWasm()' failed.");if(li=!0,ar())return new Promise((e,t)=>{$t?.terminate(),Ri().then(([r,i])=>{try{$t=i,$t.onerror=s=>t(s),$t.onmessage=Gp,nn=[e,t];let a={type:"init-wasm",in:de};if(!a.in.wasm.wasmPaths&&r){let s=mr();s&&(a.in.wasm.wasmPaths=s)}$t.postMessage(a),Oa=r}catch(a){t(a)}},t)});try{await vr(de.wasm),await Qs(de),da=!0}catch(e){throw pa=!0,e}finally{li=!1}}},jp=async e=>{if(ar())return qr(),new Promise((t,r)=>{Lr("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:de}};$t.postMessage(i)});await Xs(de,e)},Hp=async e=>ar()?(qr(),new Promise((t,r)=>{Lr("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};$t.postMessage(i,[e.buffer])})):Aa(e),Kp=async(e,t)=>{if(ar()){if(t?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return qr(),new Promise((r,i)=>{Lr("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},s=[];e instanceof Uint8Array&&s.push(e.buffer),$t.postMessage(a,s)})}else return Js(e,t)},Zp=async e=>{if(ar())return qr(),new Promise((t,r)=>{Lr("release",[t,r]);let i={type:"release",in:e};$t.postMessage(i)});en(e)},Qp=async(e,t,r,i,a,s)=>{if(ar()){if(r.some(n=>n[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(n=>n))throw new Error("pre-allocated output tensor is not supported for proxy.");return qr(),new Promise((n,o)=>{Lr("run",[n,o]);let u=r,l={type:"run",in:{sessionId:e,inputIndices:t,inputs:u,outputIndices:i,options:s}};$t.postMessage(l,sn(u))})}else return rn(e,t,r,i,a,s)},Xp=async e=>{if(ar())return qr(),new Promise((t,r)=>{Lr("end-profiling",[t,r]);let i={type:"end-profiling",in:e};$t.postMessage(i)});an(e)}}),on,Jp,ec,vh=C(()=>{"use strict";Ge(),Yp(),oe(),cr(),Gi(),on=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Jp=e=>{switch(e[3]){case"cpu":return new Me(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Er(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Me.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!kr(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Me.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},ec=class{async fetchModelAndCopyToWasmMemory(e){return Hp(await Ir(e))}async loadModel(e,t){je();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Kp(r,t),Fe()}async dispose(){return Zp(this.sessionId)}async run(e,t,r){je();let i=[],a=[];Object.entries(e).forEach(d=>{let h=d[0],m=d[1],f=this.inputNames.indexOf(h);if(f===-1)throw new Error(`invalid input '${h}'`);i.push(m),a.push(f)});let s=[],n=[];Object.entries(t).forEach(d=>{let h=d[0],m=d[1],f=this.outputNames.indexOf(h);if(f===-1)throw new Error(`invalid output '${h}'`);s.push(m),n.push(f)});let o=i.map((d,h)=>on(d,()=>`input "${this.inputNames[a[h]]}"`)),u=s.map((d,h)=>d?on(d,()=>`output "${this.outputNames[n[h]]}"`):null),l=await Qp(this.sessionId,a,o,n,u,r),p={};for(let d=0;d<l.length;d++)p[this.outputNames[n[d]]]=s[d]??Jp(l[d]);return Fe(),p}startProfiling(){}endProfiling(){Xp(this.sessionId)}}}),tc={};le(tc,{OnnxruntimeWebAssemblyBackend:()=>ln,initializeFlags:()=>un,wasmBackend:()=>rc});var un,ln,rc,xh=C(()=>{"use strict";Ge(),Yp(),vh(),un=()=>{(typeof de.wasm.initTimeout!="number"||de.wasm.initTimeout<0)&&(de.wasm.initTimeout=0);let e=de.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),de.wasm.simd=!1),typeof de.wasm.proxy!="boolean"&&(de.wasm.proxy=!1),typeof de.wasm.trace!="boolean"&&(de.wasm.trace=!1),typeof de.wasm.numThreads!="number"||!Number.isInteger(de.wasm.numThreads)||de.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)de.wasm.numThreads=1;else{let t=typeof navigator>"u"?Z("node:os").cpus().length:navigator.hardwareConcurrency;de.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},ln=class{async init(e){un(),await Wp(),await jp(e)}async createInferenceSessionHandler(e,t){let r=new ec;return await r.loadModel(e,t),r}},rc=new ln}),ic={};le(ic,{InferenceSession:()=>pr,TRACE:()=>Pt,TRACE_EVENT_BEGIN:()=>Xe,TRACE_EVENT_END:()=>Ye,TRACE_FUNC_BEGIN:()=>je,TRACE_FUNC_END:()=>Fe,Tensor:()=>Me,default:()=>Th,env:()=>de,registerBackend:()=>Ee}),Ge(),Ge(),Ge();var Sh="1.27.0",Th=Ti;{let e=(xh(),J(tc)).wasmBackend;Ee("webgpu",e,5),Ee("webnn",e,5),Ee("cpu",e,10),Ee("wasm",e,10)}return Object.defineProperty(de.versions,"web",{value:Sh,enumerable:!0}),J(ic)})();typeof cc=="object"&&typeof hn=="object"&&(hn.exports=Uh)});var mc=tt(fc=>{"use strict";Object.defineProperty(fc,"__esModule",{value:!0})});var _c=tt(qa=>{"use strict";var yc;Object.defineProperty(qa,"__esModule",{value:!0});qa.SileroLegacy=void 0;var gc=di(),ma=class{constructor(L,U,H,Z,C){this.ortInstance=L,this._session=U,this._h=H,this._c=Z,this._sr=C,this.reset_state=()=>{let le=Array(128).fill(0);this._h=new this.ortInstance.Tensor("float32",le,[2,1,64]),this._c=new this.ortInstance.Tensor("float32",le,[2,1,64])},this.process=async le=>{let J={input:new this.ortInstance.Tensor("float32",le,[1,le.length]),h:this._h,c:this._c,sr:this._sr},ge=await this._session.run(J);this._h=ge.hn,this._c=ge.cn;let[Se]=ge.output?.data;return{notSpeech:1-Se,isSpeech:Se}},this.release=async()=>{await this._session.release(),this._h.dispose(),this._c.dispose(),this._sr.dispose()}}};qa.SileroLegacy=ma;yc=ma;ma.new=async(P,L)=>{gc.log.debug("initializing vad");let U=await L(),H=await P.InferenceSession.create(U),Z=new P.Tensor("int64",[16000n]),C=Array(128).fill(0),le=new P.Tensor("float32",C,[2,1,64]),be=new P.Tensor("float32",C,[2,1,64]);return gc.log.debug("vad is initialized"),new yc(P,H,le,be,Z)}});var vc=tt(Va=>{"use strict";var bc;Object.defineProperty(Va,"__esModule",{value:!0});Va.SileroV5=void 0;var wc=di();function $c(P){let L=Array(256).fill(0);return new P.Tensor("float32",L,[2,1,128])}var ga=class{constructor(L,U,H,Z){this._session=L,this._state=U,this._sr=H,this.ortInstance=Z,this.reset_state=()=>{this._state=$c(this.ortInstance)},this.process=async C=>{let be={input:new this.ortInstance.Tensor("float32",C,[1,C.length]),state:this._state,sr:this._sr},J=await this._session.run(be);if(!J.stateN)throw new Error("No state from model");if(this._state=J.stateN,!J.output?.data)throw new Error("No output from model");let ge=J.output.data[0];if(typeof ge!="number")throw new Error("Weird output data");return{notSpeech:1-ge,isSpeech:ge}},this.release=async()=>{await this._session.release(),this._state.dispose(),this._sr.dispose()}}};Va.SileroV5=ga;bc=ga;ga.new=async(P,L)=>{wc.log.debug("Loading VAD...");let U=await L(),H=await P.InferenceSession.create(U),Z=new P.Tensor("int64",[16000n]),C=$c(P);return wc.log.debug("...finished loading VAD"),new bc(H,C,Z,P)}});var fn=tt(Dt=>{"use strict";var Nh=Dt&&Dt.__createBinding||(Object.create?(function(P,L,U,H){H===void 0&&(H=U);var Z=Object.getOwnPropertyDescriptor(L,U);(!Z||("get"in Z?!L.__esModule:Z.writable||Z.configurable))&&(Z={enumerable:!0,get:function(){return L[U]}}),Object.defineProperty(P,H,Z)}):(function(P,L,U,H){H===void 0&&(H=U),P[H]=L[U]})),Lh=Dt&&Dt.__exportStar||function(P,L){for(var U in P)U!=="default"&&!Object.prototype.hasOwnProperty.call(L,U)&&Nh(L,P,U)};Object.defineProperty(Dt,"__esModule",{value:!0});Dt.SileroV5=Dt.SileroLegacy=void 0;Lh(mc(),Dt);var qh=_c();Object.defineProperty(Dt,"SileroLegacy",{enumerable:!0,get:function(){return qh.SileroLegacy}});var Vh=vc();Object.defineProperty(Dt,"SileroV5",{enumerable:!0,get:function(){return Vh.SileroV5}})});var gn=tt(Fa=>{"use strict";Object.defineProperty(Fa,"__esModule",{value:!0});Fa.Resampler=void 0;var Fh=di(),mn=class{constructor(L){this.options=L,this.process=U=>{let H=[];for(let Z of U)for(this.inputBuffer.push(Z);this.hasEnoughDataForFrame();){let C=this.generateOutputFrame();H.push(C)}return H},L.nativeSampleRate<16e3&&Fh.log.error("nativeSampleRate is too low. Should have 16000 = targetSampleRate <= nativeSampleRate"),this.inputBuffer=[]}async*stream(L){for(let U of L)for(this.inputBuffer.push(U);this.hasEnoughDataForFrame();)yield this.generateOutputFrame()}hasEnoughDataForFrame(){return this.inputBuffer.length*this.options.targetSampleRate/this.options.nativeSampleRate>=this.options.targetFrameSize}generateOutputFrame(){let L=new Float32Array(this.options.targetFrameSize),U=0,H=0;for(;U<this.options.targetFrameSize;){let Z=0,C=0;for(;H<Math.min(this.inputBuffer.length,(U+1)*this.options.nativeSampleRate/this.options.targetSampleRate);){let le=this.inputBuffer[H];le!==void 0&&(Z+=le,C++),H++}L[U]=Z/C,U++}return this.inputBuffer=this.inputBuffer.slice(H),L}};Fa.Resampler=mn});var xc=tt(yt=>{"use strict";var Gh=yt&&yt.__createBinding||(Object.create?(function(P,L,U,H){H===void 0&&(H=U);var Z=Object.getOwnPropertyDescriptor(L,U);(!Z||("get"in Z?!L.__esModule:Z.writable||Z.configurable))&&(Z={enumerable:!0,get:function(){return L[U]}}),Object.defineProperty(P,H,Z)}):(function(P,L,U,H){H===void 0&&(H=U),P[H]=L[U]})),Wh=yt&&yt.__setModuleDefault||(Object.create?(function(P,L){Object.defineProperty(P,"default",{enumerable:!0,value:L})}):function(P,L){P.default=L}),jh=yt&&yt.__importStar||function(P){if(P&&P.__esModule)return P;var L={};if(P!=null)for(var U in P)U!=="default"&&Object.prototype.hasOwnProperty.call(P,U)&&Gh(L,P,U);return Wh(L,P),L};Object.defineProperty(yt,"__esModule",{value:!0});yt.NonRealTimeVAD=yt.defaultNonRealTimeVADOptions=void 0;var yn=jh(hc()),Hh=dn(),Kh=Da(),wn=Na(),_n=ca(),Zh=fn(),Qh=gn();yt.defaultNonRealTimeVADOptions={...wn.defaultFrameProcessorOptions,modelURL:Hh.baseAssetPath+"silero_vad_legacy.onnx",modelFetcher:Kh.defaultModelFetcher};var bn=class{static async new(L={}){let U={...yt.defaultNonRealTimeVADOptions,...L};(0,wn.validateOptions)(U),U.ortConfig!==void 0&&U.ortConfig(yn);let H=()=>U.modelFetcher(U.modelURL),Z=await Zh.SileroLegacy.new(yn,H),C=new wn.FrameProcessor(Z.process,Z.reset_state,{positiveSpeechThreshold:U.positiveSpeechThreshold,negativeSpeechThreshold:U.negativeSpeechThreshold,redemptionMs:U.redemptionMs,preSpeechPadMs:U.preSpeechPadMs,minSpeechMs:U.minSpeechMs,submitUserSpeechOnPause:U.submitUserSpeechOnPause},1536/16);return C.resume(),new this(H,yn,U,C)}constructor(L,U,H,Z){this.modelFetcher=L,this.ort=U,this.options=H,this.frameProcessor=Z,this.frameSamples=1536}async*run(L,U){let H={nativeSampleRate:U,targetSampleRate:16e3,targetFrameSize:this.frameSamples},Z=new Qh.Resampler(H),C=0,le=0,be=0;for await(let ge of Z.stream(L)){let Se=[];await this.frameProcessor.process(ge,Ee=>{Se.push(Ee)});for(let Ee of Se)switch(Ee.msg){case _n.Message.SpeechStart:C=be*this.frameSamples/16;break;case _n.Message.SpeechEnd:le=(be+1)*this.frameSamples/16,yield{audio:Ee.audio,start:C,end:le};break;default:break}be++}let J=[];this.frameProcessor.endSegment(ge=>{J.push(ge)});for(let ge of J)ge.msg===_n.Message.SpeechEnd&&(yield{audio:ge.audio,start:C,end:be*this.frameSamples/16})}};yt.NonRealTimeVAD=bn});var Sc=tt(Gt=>{"use strict";Object.defineProperty(Gt,"__esModule",{value:!0});Gt.audioFileToArray=Gt.encodeWAV=Gt.arrayBufferToBase64=Gt.minFramesForTargetMS=void 0;function Xh(P,L,U=16e3){return Math.ceil(P*U/1e3/L)}Gt.minFramesForTargetMS=Xh;function Yh(P){let L=new Uint8Array(P),U=L.byteLength,H=new Array(U);for(let Z=0;Z<U;Z++){let C=L[Z];if(C===void 0)break;H[Z]=String.fromCharCode(C)}return btoa(H.join(""))}Gt.arrayBufferToBase64=Yh;function Jh(P,L=3,U=16e3,H=1,Z=32){let C=Z/8,le=H*C,be=new ArrayBuffer(44+P.length*C),J=new DataView(be);return Ga(J,0,"RIFF"),J.setUint32(4,36+P.length*C,!0),Ga(J,8,"WAVE"),Ga(J,12,"fmt "),J.setUint32(16,16,!0),J.setUint16(20,L,!0),J.setUint16(22,H,!0),J.setUint32(24,U,!0),J.setUint32(28,U*le,!0),J.setUint16(32,le,!0),J.setUint16(34,Z,!0),Ga(J,36,"data"),J.setUint32(40,P.length*C,!0),L===1?tf(J,44,P):ef(J,44,P),be}Gt.encodeWAV=Jh;function ef(P,L,U){for(let H=0;H<U.length;H++,L+=4)P.setFloat32(L,U[H],!0)}function tf(P,L,U){for(let H=0;H<U.length;H++,L+=2){let Z=Math.max(-1,Math.min(1,U[H]));P.setInt16(L,Z<0?Z*32768:Z*32767,!0)}}function Ga(P,L,U){for(let H=0;H<U.length;H++)P.setUint8(L+H,U.charCodeAt(H))}async function rf(P){let L=new OfflineAudioContext(1,1,44100),U=new FileReader,H=null;if(await new Promise(le=>{U.addEventListener("loadend",()=>{let be=U.result;L.decodeAudioData(be,J=>{H=J,L.startRendering().then(()=>{console.log("Rendering completed successfully"),le()}).catch(ge=>{console.error("Rendering failed: ",ge)})},J=>{console.log("Error with decoding audio data: ",J)})}),U.readAsArrayBuffer(P)}),H===null)throw Error("some shit");let Z=H,C=new Float32Array(Z.length);for(let le=0;le<Z.length;le++)for(let be=0;be<Z.numberOfChannels;be++){let J=Z.getChannelData(be)[le],ge=C[le];if(J===void 0||ge===void 0)throw new Error("sample or out[i] is undefined");C[le]=ge+J}return{audio:C,sampleRate:Z.sampleRate}}Gt.audioFileToArray=rf});var kc=tt((Ec,$n)=>{"use strict";var af=(()=>{var P=Object.defineProperty,L=Object.getOwnPropertyDescriptor,U=Object.getOwnPropertyNames,H=Object.prototype.hasOwnProperty,Z=(c=>typeof ct<"u"?ct:typeof Proxy<"u"?new Proxy(c,{get:(g,b)=>(typeof ct<"u"?ct:g)[b]}):c)(function(c){if(typeof ct<"u")return ct.apply(this,arguments);throw Error('Dynamic require of "'+c+'" is not supported')}),C=(c,g)=>()=>(c&&(g=c(c=0)),g),le=(c,g)=>{for(var b in g)P(c,b,{get:g[b],enumerable:!0})},be=(c,g,b,T)=>{if(g&&typeof g=="object"||typeof g=="function")for(let S of U(g))!H.call(c,S)&&S!==b&&P(c,S,{get:()=>g[S],enumerable:!(T=L(g,S))||T.enumerable});return c},J=c=>be(P({},"__esModule",{value:!0}),c),ge,Se,Ee,rt,_t,ze=C(()=>{"use strict";ge=new Map,Se=[],Ee=(c,g,b)=>{if(g&&typeof g.init=="function"&&typeof g.createInferenceSessionHandler=="function"){let T=ge.get(c);if(T===void 0)ge.set(c,{backend:g,priority:b});else{if(T.priority>b)return;if(T.priority===b&&T.backend!==g)throw new Error(`cannot register backend "${c}" using priority ${b}`)}if(b>=0){let S=Se.indexOf(c);S!==-1&&Se.splice(S,1);for(let B=0;B<Se.length;B++)if(ge.get(Se[B]).priority<=b){Se.splice(B,0,c);return}Se.push(c)}return}throw new TypeError("not a valid backend")},rt=async c=>{let g=ge.get(c);if(!g)return"backend not found.";if(g.initialized)return g.backend;if(g.aborted)return g.error;{let b=!!g.initPromise;try{return b||(g.initPromise=g.backend.init(c)),await g.initPromise,g.initialized=!0,g.backend}catch(T){return b||(g.error=`${T}`,g.aborted=!0),g.error}finally{delete g.initPromise}}},_t=async c=>{let g=c.executionProviders||[],b=g.map(O=>typeof O=="string"?O:O.name),T=b.length===0?Se:b,S,B=[],I=new Set;for(let O of T){let V=await rt(O);typeof V=="string"?B.push({name:O,err:V}):(S||(S=V),S===V&&I.add(O))}if(!S)throw new Error(`no available backend found. ERR: ${B.map(O=>`[${O.name}] ${O.err}`).join(", ")}`);for(let{name:O,err:V}of B)b.includes(O)&&console.warn(`removing requested execution provider "${O}" from session options because it is not available: ${V}`);let k=g.filter(O=>I.has(typeof O=="string"?O:O.name));return[S,new Proxy(c,{get:(O,V)=>V==="executionProviders"?k:Reflect.get(O,V)})]}}),xt=C(()=>{"use strict";ze()}),nr,Gr=C(()=>{"use strict";nr="1.27.0"}),or,Te,pi=C(()=>{"use strict";Gr(),or="warning",Te={wasm:{},webgl:{},webgpu:{},versions:{common:nr},set logLevel(c){if(c!==void 0){if(typeof c!="string"||["verbose","info","warning","error","fatal"].indexOf(c)===-1)throw new Error(`Unsupported logging level: ${c}`);or=c}},get logLevel(){return or}},Object.defineProperty(Te,"logLevel",{enumerable:!0})}),de,ja=C(()=>{"use strict";pi(),de=Te}),ci,hi,Ha=C(()=>{"use strict";ci=(c,g)=>{let b=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);b.width=c.dims[3],b.height=c.dims[2];let T=b.getContext("2d");if(T!=null){let S,B;g?.tensorLayout!==void 0&&g.tensorLayout==="NHWC"?(S=c.dims[2],B=c.dims[3]):(S=c.dims[3],B=c.dims[2]);let I=g?.format!==void 0?g.format:"RGB",k=g?.norm,O,V;k===void 0||k.mean===void 0?O=[255,255,255,255]:typeof k.mean=="number"?O=[k.mean,k.mean,k.mean,k.mean]:(O=[k.mean[0],k.mean[1],k.mean[2],0],k.mean[3]!==void 0&&(O[3]=k.mean[3])),k===void 0||k.bias===void 0?V=[0,0,0,0]:typeof k.bias=="number"?V=[k.bias,k.bias,k.bias,k.bias]:(V=[k.bias[0],k.bias[1],k.bias[2],0],k.bias[3]!==void 0&&(V[3]=k.bias[3]));let G=B*S,q=0,M=G,ee=G*2,A=-1;I==="RGBA"?(q=0,M=G,ee=G*2,A=G*3):I==="RGB"?(q=0,M=G,ee=G*2):I==="RBG"&&(q=0,ee=G,M=G*2);for(let j=0;j<B;j++)for(let Ce=0;Ce<S;Ce++){let ce=(c.data[q++]-V[0])*O[0],fe=(c.data[M++]-V[1])*O[1],$e=(c.data[ee++]-V[2])*O[2],K=A===-1?255:(c.data[A++]-V[3])*O[3];T.fillStyle="rgba("+ce+","+fe+","+$e+","+K+")",T.fillRect(Ce,j,1,1)}if("toDataURL"in b)return b.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},hi=(c,g)=>{let b=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),T;if(b!=null){let S,B,I;g?.tensorLayout!==void 0&&g.tensorLayout==="NHWC"?(S=c.dims[2],B=c.dims[1],I=c.dims[3]):(S=c.dims[3],B=c.dims[2],I=c.dims[1]);let k=g!==void 0&&g.format!==void 0?g.format:"RGB",O=g?.norm,V,G;O===void 0||O.mean===void 0?V=[255,255,255,255]:typeof O.mean=="number"?V=[O.mean,O.mean,O.mean,O.mean]:(V=[O.mean[0],O.mean[1],O.mean[2],255],O.mean[3]!==void 0&&(V[3]=O.mean[3])),O===void 0||O.bias===void 0?G=[0,0,0,0]:typeof O.bias=="number"?G=[O.bias,O.bias,O.bias,O.bias]:(G=[O.bias[0],O.bias[1],O.bias[2],0],O.bias[3]!==void 0&&(G[3]=O.bias[3]));let q=B*S;if(g!==void 0&&(g.format!==void 0&&I===4&&g.format!=="RGBA"||I===3&&g.format!=="RGB"&&g.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let M=4,ee=0,A=1,j=2,Ce=3,ce=0,fe=q,$e=q*2,K=-1;k==="RGBA"?(ce=0,fe=q,$e=q*2,K=q*3):k==="RGB"?(ce=0,fe=q,$e=q*2):k==="RBG"&&(ce=0,$e=q,fe=q*2),T=b.createImageData(S,B);for(let Pe=0;Pe<B*S;ee+=M,A+=M,j+=M,Ce+=M,Pe++)T.data[ee]=(c.data[ce++]-G[0])*V[0],T.data[A]=(c.data[fe++]-G[1])*V[1],T.data[j]=(c.data[$e++]-G[2])*V[2],T.data[Ce]=K===-1?255:(c.data[K++]-G[3])*V[3]}else throw new Error("Can not access image data");return T}}),Wt,fi,mi,gi,yi,_i,Ka=C(()=>{"use strict";lr(),Wt=(c,g)=>{if(c===void 0)throw new Error("Image buffer must be defined");if(g.height===void 0||g.width===void 0)throw new Error("Image height and width must be defined");if(g.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:b,width:T}=g,S=g.norm??{mean:255,bias:0},B,I;typeof S.mean=="number"?B=[S.mean,S.mean,S.mean,S.mean]:B=[S.mean[0],S.mean[1],S.mean[2],S.mean[3]??255],typeof S.bias=="number"?I=[S.bias,S.bias,S.bias,S.bias]:I=[S.bias[0],S.bias[1],S.bias[2],S.bias[3]??0];let k=g.format!==void 0?g.format:"RGBA",O=g.tensorFormat!==void 0&&g.tensorFormat!==void 0?g.tensorFormat:"RGB",V=b*T,G=O==="RGBA"?new Float32Array(V*4):new Float32Array(V*3),q=4,M=0,ee=1,A=2,j=3,Ce=0,ce=V,fe=V*2,$e=-1;k==="RGB"&&(q=3,M=0,ee=1,A=2,j=-1),O==="RGBA"?$e=V*3:O==="RBG"?(Ce=0,fe=V,ce=V*2):O==="BGR"&&(fe=0,ce=V,Ce=V*2);for(let K=0;K<V;K++,M+=q,A+=q,ee+=q,j+=q)G[Ce++]=(c[M]+I[0])/B[0],G[ce++]=(c[ee]+I[1])/B[1],G[fe++]=(c[A]+I[2])/B[2],$e!==-1&&j!==-1&&(G[$e++]=(c[j]+I[3])/B[3]);return O==="RGBA"?new Oe("float32",G,[1,4,b,T]):new Oe("float32",G,[1,3,b,T])},fi=async(c,g)=>{let b=typeof HTMLImageElement<"u"&&c instanceof HTMLImageElement,T=typeof ImageData<"u"&&c instanceof ImageData,S=typeof ImageBitmap<"u"&&c instanceof ImageBitmap,B=typeof c=="string",I,k=g??{},O=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},V=G=>typeof HTMLCanvasElement<"u"&&G instanceof HTMLCanvasElement||G instanceof OffscreenCanvas?G.getContext("2d"):null;if(b){let G=O();G.width=c.width,G.height=c.height;let q=V(G);if(q!=null){let M=c.height,ee=c.width;if(g!==void 0&&g.resizedHeight!==void 0&&g.resizedWidth!==void 0&&(M=g.resizedHeight,ee=g.resizedWidth),g!==void 0){if(k=g,g.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");k.tensorFormat="RGBA",k.height=M,k.width=ee}else k.tensorFormat="RGBA",k.height=M,k.width=ee;q.drawImage(c,0,0),I=q.getImageData(0,0,ee,M).data}else throw new Error("Can not access image data")}else if(T){let G,q;if(g!==void 0&&g.resizedWidth!==void 0&&g.resizedHeight!==void 0?(G=g.resizedHeight,q=g.resizedWidth):(G=c.height,q=c.width),g!==void 0&&(k=g),k.format="RGBA",k.height=G,k.width=q,g!==void 0){let M=O();M.width=q,M.height=G;let ee=V(M);if(ee!=null)ee.putImageData(c,0,0),I=ee.getImageData(0,0,q,G).data;else throw new Error("Can not access image data")}else I=c.data}else if(S){if(g===void 0)throw new Error("Please provide image config with format for Imagebitmap");let G=O();G.width=c.width,G.height=c.height;let q=V(G);if(q!=null){let M=c.height,ee=c.width;return q.drawImage(c,0,0,ee,M),I=q.getImageData(0,0,ee,M).data,k.height=M,k.width=ee,Wt(I,k)}else throw new Error("Can not access image data")}else{if(B)return new Promise((G,q)=>{let M=O(),ee=V(M);if(!c||!ee)return q();let A=new Image;A.crossOrigin="Anonymous",A.src=c,A.onload=()=>{M.width=A.width,M.height=A.height,ee.drawImage(A,0,0,M.width,M.height);let j=ee.getImageData(0,0,M.width,M.height);k.height=M.height,k.width=M.width,G(Wt(j.data,k))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(I!==void 0)return Wt(I,k);throw new Error("Input data provided is not supported - aborted tensor creation")},mi=(c,g)=>{let{width:b,height:T,download:S,dispose:B}=g,I=[1,T,b,4];return new Oe({location:"texture",type:"float32",texture:c,dims:I,download:S,dispose:B})},gi=(c,g)=>{let{dataType:b,dims:T,download:S,dispose:B}=g;return new Oe({location:"gpu-buffer",type:b??"float32",gpuBuffer:c,dims:T,download:S,dispose:B})},yi=(c,g)=>{let{dataType:b,dims:T,download:S,dispose:B}=g;return new Oe({location:"ml-tensor",type:b??"float32",mlTensor:c,dims:T,download:S,dispose:B})},_i=(c,g,b)=>new Oe({location:"cpu-pinned",type:c,data:g,dims:b??[g.length]})}),it,St,ur,wi,Za=C(()=>{"use strict";it=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),St=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),ur=!1,wi=()=>{if(!ur){ur=!0;let c=typeof BigInt64Array<"u"&&BigInt64Array.from,g=typeof BigUint64Array<"u"&&BigUint64Array.from,b=globalThis.Float16Array,T=typeof b<"u"&&b.from;c&&(it.set("int64",BigInt64Array),St.set(BigInt64Array,"int64")),g&&(it.set("uint64",BigUint64Array),St.set(BigUint64Array,"uint64")),T?(it.set("float16",b),St.set(b,"float16")):it.set("float16",Uint16Array)}}}),bi,$i,Qa=C(()=>{"use strict";lr(),bi=c=>{let g=1;for(let b=0;b<c.length;b++){let T=c[b];if(typeof T!="number"||!Number.isSafeInteger(T))throw new TypeError(`dims[${b}] must be an integer, got: ${T}`);if(T<0)throw new RangeError(`dims[${b}] must be a non-negative integer, got: ${T}`);g*=T}return g},$i=(c,g)=>{switch(c.location){case"cpu":return new Oe(c.type,c.data,g);case"cpu-pinned":return new Oe({location:"cpu-pinned",data:c.data,type:c.type,dims:g});case"texture":return new Oe({location:"texture",texture:c.texture,type:c.type,dims:g});case"gpu-buffer":return new Oe({location:"gpu-buffer",gpuBuffer:c.gpuBuffer,type:c.type,dims:g});case"ml-tensor":return new Oe({location:"ml-tensor",mlTensor:c.mlTensor,type:c.type,dims:g});default:throw new Error(`tensorReshape: tensor location ${c.location} is not supported`)}}}),Oe,lr=C(()=>{"use strict";Ha(),Ka(),Za(),Qa(),Oe=class{constructor(c,g,b){wi();let T,S;if(typeof c=="object"&&"location"in c)switch(this.dataLocation=c.location,T=c.type,S=c.dims,c.location){case"cpu-pinned":{let I=it.get(T);if(!I)throw new TypeError(`unsupported type "${T}" to create tensor from pinned buffer`);if(!(c.data instanceof I))throw new TypeError(`buffer should be of type ${I.name}`);this.cpuData=c.data;break}case"texture":{if(T!=="float32")throw new TypeError(`unsupported type "${T}" to create tensor from texture`);this.gpuTextureData=c.texture,this.downloader=c.download,this.disposer=c.dispose;break}case"gpu-buffer":{if(T!=="float32"&&T!=="float16"&&T!=="int32"&&T!=="int64"&&T!=="uint32"&&T!=="uint8"&&T!=="bool"&&T!=="uint4"&&T!=="int4")throw new TypeError(`unsupported type "${T}" to create tensor from gpu buffer`);this.gpuBufferData=c.gpuBuffer,this.downloader=c.download,this.disposer=c.dispose;break}case"ml-tensor":{if(T!=="float32"&&T!=="float16"&&T!=="int32"&&T!=="int64"&&T!=="uint32"&&T!=="uint64"&&T!=="int8"&&T!=="uint8"&&T!=="bool"&&T!=="uint4"&&T!=="int4")throw new TypeError(`unsupported type "${T}" to create tensor from MLTensor`);this.mlTensorData=c.mlTensor,this.downloader=c.download,this.disposer=c.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let I,k;if(typeof c=="string")if(T=c,k=b,c==="string"){if(!Array.isArray(g))throw new TypeError("A string tensor's data must be a string array.");I=g}else{let O=it.get(c);if(O===void 0)throw new TypeError(`Unsupported tensor type: ${c}.`);if(Array.isArray(g)){if(c==="float16"&&O===Uint16Array||c==="uint4"||c==="int4")throw new TypeError(`Creating a ${c} tensor from number array is not supported. Please use ${O.name} as data.`);c==="uint64"||c==="int64"?I=O.from(g,BigInt):I=O.from(g)}else if(g instanceof O)I=g;else if(g instanceof Uint8ClampedArray)if(c==="uint8")I=Uint8Array.from(g);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(c==="float16"&&g instanceof Uint16Array&&O!==Uint16Array)I=new globalThis.Float16Array(g.buffer,g.byteOffset,g.length);else throw new TypeError(`A ${T} tensor's data must be type of ${O}`)}else if(k=g,Array.isArray(c)){if(c.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let O=typeof c[0];if(O==="string")T="string",I=c;else if(O==="boolean")T="bool",I=Uint8Array.from(c);else throw new TypeError(`Invalid element type of data array: ${O}.`)}else if(c instanceof Uint8ClampedArray)T="uint8",I=Uint8Array.from(c);else{let O=St.get(c.constructor);if(O===void 0)throw new TypeError(`Unsupported type for tensor data: ${c.constructor}.`);T=O,I=c}if(k===void 0)k=[I.length];else if(!Array.isArray(k))throw new TypeError("A tensor's dims must be a number array");S=k,this.cpuData=I,this.dataLocation="cpu"}let B=bi(S);if(this.cpuData&&B!==this.cpuData.length&&!((T==="uint4"||T==="int4")&&Math.ceil(B/2)===this.cpuData.length))throw new Error(`Tensor's size(${B}) does not match data length(${this.cpuData.length}).`);this.type=T,this.dims=S,this.size=B}static async fromImage(c,g){return fi(c,g)}static fromTexture(c,g){return mi(c,g)}static fromGpuBuffer(c,g){return gi(c,g)}static fromMLTensor(c,g){return yi(c,g)}static fromPinnedBuffer(c,g,b){return _i(c,g,b)}toDataURL(c){return ci(this,c)}toImageData(c){return hi(this,c)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(c){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let g=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=g,c&&this.disposer&&(this.disposer(),this.disposer=void 0),g}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(c){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return $i(this,c)}}}),Me,vi=C(()=>{"use strict";lr(),Me=Oe}),Pt,dr,je,Fe,Xe,Ye,xi=C(()=>{"use strict";pi(),Pt=(c,g)=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||console.timeStamp(`${c}::ORT::${g}`)},dr=(c,g)=>{let b=new Error().stack?.split(/\r\n|\r|\n/g)||[],T=!1;for(let S=0;S<b.length;S++){if(T&&!b[S].includes("TRACE_FUNC")){let B=`FUNC_${c}::${b[S].trim().split(" ")[1]}`;g&&(B+=`::${g}`),Pt("CPU",B);return}b[S].includes("TRACE_FUNC")&&(T=!0)}},je=c=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||dr("BEGIN",c)},Fe=c=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||dr("END",c)},Xe=c=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||console.time(`ORT::${c}`)},Ye=c=>{(typeof Te.trace>"u"?!Te.wasm.trace:!Te.trace)||console.timeEnd(`ORT::${c}`)}}),Si,Xa=C(()=>{"use strict";ze(),vi(),xi(),Si=class Tc{constructor(g){this.handler=g}async run(g,b,T){je(),Xe("InferenceSession.run");let S={},B={};if(typeof g!="object"||g===null||g instanceof Me||Array.isArray(g))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let I=!0;if(typeof b=="object"){if(b===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(b instanceof Me)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(b)){if(b.length===0)throw new TypeError("'fetches' cannot be an empty array.");I=!1;for(let V of b){if(typeof V!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(V)===-1)throw new RangeError(`'fetches' contains invalid output name: ${V}.`);S[V]=null}if(typeof T=="object"&&T!==null)B=T;else if(typeof T<"u")throw new TypeError("'options' must be an object.")}else{let V=!1,G=Object.getOwnPropertyNames(b);for(let q of this.outputNames)if(G.indexOf(q)!==-1){let M=b[q];(M===null||M instanceof Me)&&(V=!0,I=!1,S[q]=M)}if(V){if(typeof T=="object"&&T!==null)B=T;else if(typeof T<"u")throw new TypeError("'options' must be an object.")}else B=b}}else if(typeof b<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let V of this.inputNames)if(typeof g[V]>"u")throw new Error(`input '${V}' is missing in 'feeds'.`);if(I)for(let V of this.outputNames)S[V]=null;let k=await this.handler.run(g,S,B),O={};for(let V in k)if(Object.hasOwnProperty.call(k,V)){let G=k[V];G instanceof Me?O[V]=G:O[V]=new Me(G.type,G.data,G.dims)}return Ye("InferenceSession.run"),Fe(),O}async release(){return this.handler.dispose()}static async create(g,b,T,S){je(),Xe("InferenceSession.create");let B,I={};if(typeof g=="string"){if(B=g,typeof b=="object"&&b!==null)I=b;else if(typeof b<"u")throw new TypeError("'options' must be an object.")}else if(g instanceof Uint8Array){if(B=g,typeof b=="object"&&b!==null)I=b;else if(typeof b<"u")throw new TypeError("'options' must be an object.")}else if(g instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&g instanceof SharedArrayBuffer){let G=g,q=0,M=g.byteLength;if(typeof b=="object"&&b!==null)I=b;else if(typeof b=="number"){if(q=b,!Number.isSafeInteger(q))throw new RangeError("'byteOffset' must be an integer.");if(q<0||q>=G.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${G.byteLength}).`);if(M=g.byteLength-q,typeof T=="number"){if(M=T,!Number.isSafeInteger(M))throw new RangeError("'byteLength' must be an integer.");if(M<=0||q+M>G.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${G.byteLength-q}].`);if(typeof S=="object"&&S!==null)I=S;else if(typeof S<"u")throw new TypeError("'options' must be an object.")}else if(typeof T<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof b<"u")throw new TypeError("'options' must be an object.");B=new Uint8Array(G,q,M)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[k,O]=await _t(I),V=await k.createInferenceSessionHandler(B,O);return Ye("InferenceSession.create"),Fe(),new Tc(V)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),pr,Ya=C(()=>{"use strict";Xa(),pr=Si}),Ja=C(()=>{"use strict"}),es=C(()=>{"use strict"}),ts=C(()=>{"use strict"}),rs=C(()=>{"use strict"}),Ti={};le(Ti,{InferenceSession:()=>pr,TRACE:()=>Pt,TRACE_EVENT_BEGIN:()=>Xe,TRACE_EVENT_END:()=>Ye,TRACE_FUNC_BEGIN:()=>je,TRACE_FUNC_END:()=>Fe,Tensor:()=>Me,env:()=>de,registerBackend:()=>Ee});var Ge=C(()=>{"use strict";xt(),ja(),Ya(),vi(),Ja(),es(),xi(),ts(),rs()}),cr=C(()=>{"use strict"}),Ei={};le(Ei,{default:()=>ki});var hr,fr,ki,is=C(()=>{"use strict";ji(),nt(),wr(),hr="ort-wasm-proxy-worker",fr=globalThis.self?.name===hr,fr&&(self.onmessage=c=>{let{type:g,in:b}=c.data;try{switch(g){case"init-wasm":vr(b.wasm).then(()=>{jr(b).then(()=>{postMessage({type:g})},T=>{postMessage({type:g,err:T})})},T=>{postMessage({type:g,err:T})});break;case"init-ep":{let{epName:T,env:S}=b;Hr(S,T).then(()=>{postMessage({type:g})},B=>{postMessage({type:g,err:B})});break}case"copy-from":{let{buffer:T}=b,S=we(T);postMessage({type:g,out:S});break}case"create":{let{model:T,options:S}=b;ht(T,S).then(B=>{postMessage({type:g,out:B})},B=>{postMessage({type:g,err:B})});break}case"release":Qr(b),postMessage({type:g});break;case"run":{let{sessionId:T,inputIndices:S,inputs:B,outputIndices:I,options:k}=b;D(T,S,B,I,new Array(I.length).fill(null),k).then(O=>{O.some(V=>V[3]!=="cpu")?postMessage({type:g,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:g,out:O},Xr([...B,...O]))},O=>{postMessage({type:g,err:O})});break}case"end-profiling":Yt(b),postMessage({type:g});break;default:}}catch(T){postMessage({type:g,err:T})}}),ki=fr?null:c=>new Worker(c??Re,{type:"classic",name:hr})}),Ii,zi,Re,mr,jt,Ci,Ai,gr,Oi,yr,Ri,_r,Bi,wr=C(()=>{"use strict";cr(),Ii=typeof location>"u"?void 0:location.origin,zi=()=>typeof document<"u"?document.currentScript?.src:typeof self<"u"?self.location?.href:void 0,Re=zi(),mr=()=>{if(Re&&!Re.startsWith("blob:"))return Re.substring(0,Re.lastIndexOf("/")+1)},jt=(c,g)=>{try{let b=g??Re;return(b?new URL(c,b):new URL(c)).origin===Ii}catch{return!1}},Ci=(c,g)=>{let b=g??Re;try{return(b?new URL(c,b):new URL(c)).href}catch{return}},Ai=(c,g)=>`${g??"./"}${c}`,gr=async c=>{let g=await(await fetch(c,{credentials:"same-origin"})).blob();return URL.createObjectURL(g)},Oi=async c=>(await import(c)).default,yr=(is(),J(Ei)).default,Ri=async()=>{if(!Re)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(jt(Re))return[void 0,yr()];let c=await gr(Re);return[c,yr(c)]},_r=void 0,Bi=async(c,g,b,T)=>{let S=_r&&!(c||g);if(S)if(Re)S=jt(Re)||T&&!b;else if(T&&!b)S=!0;else throw new Error("cannot determine the script source URL.");if(S)return[void 0,_r];{let B="ort-wasm-simd-threaded.mjs",I=c??Ci(B,g),k=b&&I&&!jt(I,g),O=k?await gr(I):I??Ai(B,g);return[k?O:void 0,await Oi(O)]}}}),br,Ht,Tt,$r,Mi,Di,Pi,vr,ue,nt=C(()=>{"use strict";wr(),Ht=!1,Tt=!1,$r=!1,Mi=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},Di=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},Pi=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},vr=async c=>{if(Ht)return Promise.resolve();if(Tt)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if($r)throw new Error("previous call to 'initializeWebAssembly()' failed.");Tt=!0;let g=c.initTimeout,b=c.numThreads;if(c.simd!==!1){if(c.simd==="relaxed"){if(!Pi())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!Di())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let T=Mi();b>1&&!T&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+b+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),c.numThreads=b=1);let S=c.wasmPaths,B=typeof S=="string"?S:void 0,I=S?.mjs,k=I?.href??I,O=S?.wasm,V=O?.href??O,G=c.wasmBinary,[q,M]=await Bi(k,B,b>1,!!G||!!V),ee=!1,A=[];if(g>0&&A.push(new Promise(j=>{setTimeout(()=>{ee=!0,j()},g)})),A.push(new Promise((j,Ce)=>{let ce={numThreads:b};if(G)ce.wasmBinary=G,ce.locateFile=fe=>fe;else if(V||B)ce.locateFile=fe=>V??B+fe;else if(k&&k.indexOf("blob:")!==0)ce.locateFile=fe=>new URL(fe,k).href;else if(q){let fe=mr();fe&&(ce.locateFile=$e=>fe+$e)}M(ce).then(fe=>{Tt=!1,Ht=!0,br=fe,j(),q&&URL.revokeObjectURL(q)},fe=>{Tt=!1,$r=!0,Ce(fe)})})),await Promise.race(A),ee)throw new Error(`WebAssembly backend initializing failed due to timeout: ${g}ms`)},ue=()=>{if(Ht&&br)return br;throw new Error("WebAssembly is not initialized yet.")}}),De,Kt,re,xr=C(()=>{"use strict";nt(),De=(c,g)=>{let b=ue(),T=b.lengthBytesUTF8(c)+1,S=b._malloc(T);return b.stringToUTF8(c,S,T),g.push(S),S},Kt=(c,g,b,T)=>{if(typeof c=="object"&&c!==null){if(b.has(c))throw new Error("Circular reference in options");b.add(c)}Object.entries(c).forEach(([S,B])=>{let I=g?g+S:S;if(typeof B=="object")Kt(B,I+".",b,T);else if(typeof B=="string"||typeof B=="number")T(I,B.toString());else if(typeof B=="boolean")T(I,B?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof B}`)})},re=c=>{let g=ue(),b=g.stackSave();try{let T=g.PTR_SIZE,S=g.stackAlloc(2*T);g._OrtGetLastError(S,S+T);let B=Number(g.getValue(S,T===4?"i32":"i64")),I=g.getValue(S+T,"*"),k=I?g.UTF8ToString(I):"";throw new Error(`${c} ERROR_CODE: ${B}, ERROR_MESSAGE: ${k}`)}finally{g.stackRestore(b)}}}),Ui,as=C(()=>{"use strict";nt(),xr(),Ui=c=>{let g=ue(),b=0,T=[],S=c||{};try{if(c?.logSeverityLevel===void 0)S.logSeverityLevel=2;else if(typeof c.logSeverityLevel!="number"||!Number.isInteger(c.logSeverityLevel)||c.logSeverityLevel<0||c.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${c.logSeverityLevel}`);if(c?.logVerbosityLevel===void 0)S.logVerbosityLevel=0;else if(typeof c.logVerbosityLevel!="number"||!Number.isInteger(c.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${c.logVerbosityLevel}`);c?.terminate===void 0&&(S.terminate=!1);let B=0;return c?.tag!==void 0&&(B=De(c.tag,T)),b=g._OrtCreateRunOptions(S.logSeverityLevel,S.logVerbosityLevel,!!S.terminate,B),b===0&&re("Can't create run options."),c?.extra!==void 0&&Kt(c.extra,"",new WeakSet,(I,k)=>{let O=De(I,T),V=De(k,T);g._OrtAddRunConfigEntry(b,O,V)!==0&&re(`Can't set a run config entry: ${I} - ${k}.`)}),[b,T]}catch(B){throw b!==0&&g._OrtReleaseRunOptions(b),T.forEach(I=>g._free(I)),B}}}),Ni,Li,qi,at,Vi,Fi,ss=C(()=>{"use strict";nt(),xr(),Ni=c=>{switch(c){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${c}`)}},Li=c=>{switch(c){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${c}`)}},qi=c=>{c.extra||(c.extra={}),c.extra.session||(c.extra.session={});let g=c.extra.session;g.use_ort_model_bytes_directly||(g.use_ort_model_bytes_directly="1"),c.executionProviders&&c.executionProviders.some(b=>(typeof b=="string"?b:b.name)==="webgpu")&&(c.enableMemPattern=!1)},at=(c,g,b,T)=>{let S=De(g,T),B=De(b,T);ue()._OrtAddSessionConfigEntry(c,S,B)!==0&&re(`Can't set a session config entry: ${g} - ${b}.`)},Vi=async(c,g,b)=>{let T=g.executionProviders;for(let S of T){let B=typeof S=="string"?S:S.name,I=[];switch(B){case"webnn":if(B="WEBNN",at(c,"session.disable_quant_qdq","1",b),at(c,"session.disable_qdq_constant_folding","1",b),typeof S!="string"){let q=S?.deviceType;q&&at(c,"deviceType",q,b)}break;case"webgpu":if(B="JS",typeof S!="string"){let q=S;if(q?.preferredLayout){if(q.preferredLayout!=="NCHW"&&q.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${q.preferredLayout}`);at(c,"preferredLayout",q.preferredLayout,b)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${B}`)}let k=De(B,b),O=I.length,V=0,G=0;if(O>0){V=ue()._malloc(O*ue().PTR_SIZE),b.push(V),G=ue()._malloc(O*ue().PTR_SIZE),b.push(G);for(let q=0;q<O;q++)ue().setValue(V+q*ue().PTR_SIZE,I[q][0],"*"),ue().setValue(G+q*ue().PTR_SIZE,I[q][1],"*")}await ue()._OrtAppendExecutionProvider(c,k,V,G,O)!==0&&re(`Can't append execution provider: ${B}.`)}},Fi=async c=>{let g=ue(),b=0,T=[],S=c||{};qi(S);try{let B=Ni(S.graphOptimizationLevel??"all"),I=Li(S.executionMode??"sequential"),k=typeof S.logId=="string"?De(S.logId,T):0,O=S.logSeverityLevel??2;if(!Number.isInteger(O)||O<0||O>4)throw new Error(`log severity level is not valid: ${O}`);let V=S.logVerbosityLevel??0;if(!Number.isInteger(V)||V<0||V>4)throw new Error(`log verbosity level is not valid: ${V}`);let G=typeof S.optimizedModelFilePath=="string"?De(S.optimizedModelFilePath,T):0;if(b=g._OrtCreateSessionOptions(B,!!S.enableCpuMemArena,!!S.enableMemPattern,I,!!S.enableProfiling,0,k,O,V,G),b===0&&re("Can't create session options."),S.executionProviders&&await Vi(b,S,T),S.enableGraphCapture!==void 0){if(typeof S.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${S.enableGraphCapture}`);at(b,"enableGraphCapture",S.enableGraphCapture.toString(),T)}if(S.freeDimensionOverrides)for(let[q,M]of Object.entries(S.freeDimensionOverrides)){if(typeof q!="string")throw new Error(`free dimension override name must be a string: ${q}`);if(typeof M!="number"||!Number.isInteger(M)||M<0)throw new Error(`free dimension override value must be a non-negative integer: ${M}`);let ee=De(q,T);g._OrtAddFreeDimensionOverride(b,ee,M)!==0&&re(`Can't set a free dimension override: ${q} - ${M}.`)}return S.extra!==void 0&&Kt(S.extra,"",new WeakSet,(q,M)=>{at(b,q,M,T)}),[b,T]}catch(B){throw b!==0&&g._OrtReleaseSessionOptions(b)!==0&&re("Can't release session options."),T.forEach(I=>g._free(I)),B}}}),ot,ut,lt,Sr,Tr,Er,kr,Wr,oe=C(()=>{"use strict";ot=c=>{switch(c){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${c}`)}},ut=c=>{switch(c){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${c}`)}},lt=(c,g)=>{let b=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][c],T=typeof g=="number"?g:g.reduce((S,B)=>S*B,1);return b>0?Math.ceil(T*b):void 0},Sr=c=>{switch(c){case"float16":return typeof Float16Array<"u"?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${c}`)}},Tr=c=>{switch(c){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${c}`)}},Er=c=>c==="float32"||c==="float16"||c==="int32"||c==="int64"||c==="uint32"||c==="uint8"||c==="bool"||c==="uint4"||c==="int4",kr=c=>c==="float32"||c==="float16"||c==="int32"||c==="int64"||c==="uint32"||c==="uint64"||c==="int8"||c==="uint8"||c==="bool"||c==="uint4"||c==="int4",Wr=c=>{switch(c){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${c}`)}}}),Ir,Gi=C(()=>{"use strict";cr(),Ir=async c=>{if(typeof c=="string"){let g=await fetch(c);if(!g.ok)throw new Error(`failed to load external data file: ${c}`);let b=g.headers.get("Content-Length"),T=b?parseInt(b,10):0;if(T<1073741824)return new Uint8Array(await g.arrayBuffer());{if(!g.body)throw new Error(`failed to load external data file: ${c}, no response body.`);let S=g.body.getReader(),B;try{B=new ArrayBuffer(T)}catch(k){if(k instanceof RangeError){let O=Math.ceil(T/65536);B=new WebAssembly.Memory({initial:O,maximum:O}).buffer}else throw k}let I=0;for(;;){let{done:k,value:O}=await S.read();if(k)break;let V=O.byteLength;new Uint8Array(B,I,V).set(O),I+=V}return new Uint8Array(B,0,T)}}else return c instanceof Blob?new Uint8Array(await c.arrayBuffer()):c instanceof Uint8Array?c:new Uint8Array(c)}}),Wi,jr,Hr,Ut,Kr,Zr,we,ht,Qr,Nt,D,Yt,Xr,ji=C(()=>{"use strict";Ge(),as(),ss(),oe(),nt(),xr(),Gi(),Wi=(c,g)=>{ue()._OrtInit(c,g)!==0&&re("Can't initialize onnxruntime.")},jr=async c=>{Wi(c.wasm.numThreads,Tr(c.logLevel))},Hr=async(c,g)=>{ue().asyncInit?.();let b=c.webgpu.adapter;if(g==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(b){if(typeof b.limits!="object"||typeof b.features!="object"||typeof b.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let T=c.webgpu.powerPreference;if(T!==void 0&&T!=="low-power"&&T!=="high-performance")throw new Error(`Invalid powerPreference setting: "${T}"`);let S=c.webgpu.forceFallbackAdapter;if(S!==void 0&&typeof S!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${S}"`);if(b=await navigator.gpu.requestAdapter({powerPreference:T,forceFallbackAdapter:S}),!b)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(g==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment")},Ut=new Map,Kr=c=>{let g=ue(),b=g.stackSave();try{let T=g.PTR_SIZE,S=g.stackAlloc(2*T);g._OrtGetInputOutputCount(c,S,S+T)!==0&&re("Can't get session input/output count.");let B=T===4?"i32":"i64";return[Number(g.getValue(S,B)),Number(g.getValue(S+T,B))]}finally{g.stackRestore(b)}},Zr=(c,g)=>{let b=ue(),T=b.stackSave(),S=0;try{let B=b.PTR_SIZE,I=b.stackAlloc(2*B);b._OrtGetInputOutputMetadata(c,g,I,I+B)!==0&&re("Can't get session input/output metadata.");let k=Number(b.getValue(I,"*"));S=Number(b.getValue(I+B,"*"));let O=b.HEAP32[S/4];if(O===0)return[k,0];let V=b.HEAPU32[S/4+1],G=[];for(let q=0;q<V;q++){let M=Number(b.getValue(S+8+q*B,"*"));G.push(M!==0?b.UTF8ToString(M):Number(b.getValue(S+8+(q+V)*B,"*")))}return[k,O,G]}finally{b.stackRestore(T),S!==0&&b._OrtFree(S)}},we=c=>{let g=ue(),b=g._malloc(c.byteLength);if(b===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${c.byteLength}.`);return g.HEAPU8.set(c,b),[b,c.byteLength]},ht=async(c,g)=>{let b,T,S=ue();Array.isArray(c)?[b,T]=c:c.buffer===S.HEAPU8.buffer?[b,T]=[c.byteOffset,c.byteLength]:[b,T]=we(c);let B=0,I=0,k=0,O=[],V=[],G=[];try{if([I,O]=await Fi(g),g?.externalData&&S.mountExternalData){let $e=[];for(let K of g.externalData){let Pe=typeof K=="string"?K:K.path;$e.push(Ir(typeof K=="string"?K:K.data).then(Ke=>{S.mountExternalData(Pe,Ke)}))}await Promise.all($e)}for(let $e of g?.executionProviders??[])if((typeof $e=="string"?$e:$e.name)==="webnn"){if(S.shouldTransferToMLTensor=!1,typeof $e!="string"){let K=$e,Pe=K?.context,Ke=K?.gpuDevice,Ze=K?.deviceType,Vt=K?.powerPreference;Pe?S.currentContext=Pe:Ke?S.currentContext=await S.webnnCreateMLContext(Ke):S.currentContext=await S.webnnCreateMLContext({deviceType:Ze,powerPreference:Vt})}else S.currentContext=await S.webnnCreateMLContext();break}B=await S._OrtCreateSession(b,T,I),S.webgpuOnCreateSession?.(B),B===0&&re("Can't create a session."),S.jsepOnCreateSession?.(),S.currentContext&&(S.webnnRegisterMLContext(B,S.currentContext),S.currentContext=void 0,S.shouldTransferToMLTensor=!0);let[q,M]=Kr(B),ee=!!g?.enableGraphCapture,A=[],j=[],Ce=[],ce=[],fe=[];for(let $e=0;$e<q;$e++){let[K,Pe,Ke]=Zr(B,$e);K===0&&re("Can't get an input name."),V.push(K);let Ze=S.UTF8ToString(K);A.push(Ze),Ce.push(Pe===0?{name:Ze,isTensor:!1}:{name:Ze,isTensor:!0,type:ut(Pe),shape:Ke})}for(let $e=0;$e<M;$e++){let[K,Pe,Ke]=Zr(B,$e+q);K===0&&re("Can't get an output name."),G.push(K);let Ze=S.UTF8ToString(K);j.push(Ze),ce.push(Pe===0?{name:Ze,isTensor:!1}:{name:Ze,isTensor:!0,type:ut(Pe),shape:Ke})}return Ut.set(B,[B,V,G,null,ee,!1]),[B,A,j,Ce,ce]}catch(q){throw V.forEach(M=>S._OrtFree(M)),G.forEach(M=>S._OrtFree(M)),k!==0&&S._OrtReleaseBinding(k)!==0&&re("Can't release IO binding."),B!==0&&S._OrtReleaseSession(B)!==0&&re("Can't release session."),q}finally{S._free(b),I!==0&&S._OrtReleaseSessionOptions(I)!==0&&re("Can't release session options."),O.forEach(q=>S._free(q)),S.unmountExternalData?.()}},Qr=c=>{let g=ue(),b=Ut.get(c);if(!b)throw new Error(`cannot release session. invalid session id: ${c}`);let[T,S,B,I,k]=b;I&&(k&&g._OrtClearBoundOutputs(I.handle)!==0&&re("Can't clear bound outputs."),g._OrtReleaseBinding(I.handle)!==0&&re("Can't release IO binding.")),g.jsepOnReleaseSession?.(c),g.webnnOnReleaseSession?.(c),g.webgpuOnReleaseSession?.(c),S.forEach(O=>g._OrtFree(O)),B.forEach(O=>g._OrtFree(O)),g._OrtReleaseSession(T)!==0&&re("Can't release session."),Ut.delete(c)},Nt=async(c,g,b,T,S,B,I=!1)=>{if(!c){g.push(0);return}let k=ue(),O=k.PTR_SIZE,V=c[0],G=c[1],q=c[3],M=q,ee,A;if(V==="string"&&(q==="gpu-buffer"||q==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(I&&q!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${B} when enableGraphCapture is true.`);if(q==="gpu-buffer"){let ce=c[2].gpuBuffer;A=lt(ot(V),G);{let fe=k.jsepRegisterBuffer;if(!fe)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');ee=fe(T,B,ce,A)}}else if(q==="ml-tensor"){let ce=c[2].mlTensor;A=lt(ot(V),G);let fe=k.webnnRegisterMLTensor;if(!fe)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');ee=fe(T,ce,ot(V),G)}else{let ce=c[2];if(Array.isArray(ce)){A=O*ce.length,ee=k._malloc(A),b.push(ee);for(let fe=0;fe<ce.length;fe++){if(typeof ce[fe]!="string")throw new TypeError(`tensor data at index ${fe} is not a string`);k.setValue(ee+fe*O,De(ce[fe],b),"*")}}else{let fe=k.webnnIsGraphInput,$e=k.webnnIsGraphOutput;if(V!=="string"&&fe&&$e){let K=k.UTF8ToString(S);if(fe(T,K)||$e(T,K)){let Pe=ot(V);A=lt(Pe,G),M="ml-tensor";let Ke=k.webnnCreateTemporaryTensor,Ze=k.webnnUploadTensor;if(!Ke||!Ze)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let Vt=await Ke(T,Pe,G);Ze(Vt,new Uint8Array(ce.buffer,ce.byteOffset,ce.byteLength)),ee=Vt}else A=ce.byteLength,ee=k._malloc(A),b.push(ee),k.HEAPU8.set(new Uint8Array(ce.buffer,ce.byteOffset,A),ee)}else A=ce.byteLength,ee=k._malloc(A),b.push(ee),k.HEAPU8.set(new Uint8Array(ce.buffer,ce.byteOffset,A),ee)}}let j=k.stackSave(),Ce=k.stackAlloc(4*G.length);try{G.forEach((fe,$e)=>k.setValue(Ce+$e*O,fe,O===4?"i32":"i64"));let ce=k._OrtCreateTensor(ot(V),ee,A,Ce,G.length,Wr(M));ce===0&&re(`Can't create tensor for input/output. session=${T}, index=${B}.`),g.push(ce)}finally{k.stackRestore(j)}},D=async(c,g,b,T,S,B)=>{let I=ue(),k=I.PTR_SIZE,O=Ut.get(c);if(!O)throw new Error(`cannot run inference. invalid session id: ${c}`);let V=O[0],G=O[1],q=O[2],M=O[3],ee=O[4],A=O[5],j=g.length,Ce=T.length,ce=0,fe=[],$e=[],K=[],Pe=[],Ke=[],Ze=I.stackSave(),Vt=I.stackAlloc(j*k),ea=I.stackAlloc(j*k),oi=I.stackAlloc(Ce*k),Je=I.stackAlloc(Ce*k);try{[ce,fe]=Ui(B),Xe("wasm prepareInputOutputTensor");for(let xe=0;xe<j;xe++)await Nt(b[xe],$e,Pe,c,G[g[xe]],g[xe],ee);for(let xe=0;xe<Ce;xe++)await Nt(S[xe],K,Pe,c,q[T[xe]],j+T[xe],ee);Ye("wasm prepareInputOutputTensor");for(let xe=0;xe<j;xe++)I.setValue(Vt+xe*k,$e[xe],"*"),I.setValue(ea+xe*k,G[g[xe]],"*");for(let xe=0;xe<Ce;xe++)I.setValue(oi+xe*k,K[xe],"*"),I.setValue(Je+xe*k,q[T[xe]],"*");I.jsepOnRunStart?.(V),I.webnnOnRunStart?.(V);let ft;ft=await I._OrtRun(V,ea,Vt,j,Je,Ce,oi,ce),ft!==0&&re("failed to call OrtRun().");let wt=[],It=[];Xe("wasm ProcessOutputTensor");for(let xe=0;xe<Ce;xe++){let mt=Number(I.getValue(oi+xe*k,"*"));if(mt===K[xe]||Ke.includes(K[xe])){wt.push(S[xe]),mt!==K[xe]&&I._OrtReleaseTensor(mt)!==0&&re("Can't release tensor.");continue}let wa=I.stackSave(),zt=I.stackAlloc(4*k),Or=!1,Ue,et=0;try{I._OrtGetTensorData(mt,zt,zt+k,zt+2*k,zt+3*k)!==0&&re(`Can't access output tensor data on index ${xe}.`);let ui=k===4?"i32":"i64",Rr=Number(I.getValue(zt,ui));et=I.getValue(zt+k,"*");let ta=I.getValue(zt+k*2,"*"),gt=Number(I.getValue(zt+k*3,ui)),Ct=[];for(let Ne=0;Ne<gt;Ne++)Ct.push(Number(I.getValue(ta+Ne*k,ui)));I._OrtFree(ta)!==0&&re("Can't free memory for tensor dims.");let At=Ct.reduce((Ne,Be)=>Ne*Be,1);Ue=ut(Rr);let rr=M?.outputPreferredLocations[T[xe]];if(Ue==="string"){if(rr==="gpu-buffer"||rr==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let Ne=[];for(let Be=0;Be<At;Be++){let bt=I.getValue(et+Be*k,"*"),ba=I.getValue(et+(Be+1)*k,"*"),$a=Be===At-1?void 0:ba-bt;Ne.push(I.UTF8ToString(bt,$a))}wt.push([Ue,Ct,Ne,"cpu"])}else if(rr==="gpu-buffer"&&At>0){let Ne=I.jsepGetBuffer;if(!Ne)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let Be=Ne(et),bt=lt(Rr,At);if(bt===void 0||!Er(Ue))throw new Error(`Unsupported data type: ${Ue}`);Or=!0,wt.push([Ue,Ct,{gpuBuffer:Be,download:I.jsepCreateDownloader(Be,bt,Ue),dispose:()=>{I._OrtReleaseTensor(mt)!==0&&re("Can't release tensor.")}},"gpu-buffer"])}else if(rr==="ml-tensor"&&At>0){let Ne=I.webnnEnsureTensor,Be=I.webnnIsGraphInputOutputTypeSupported;if(!Ne||!Be)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(lt(Rr,At)===void 0||!kr(Ue))throw new Error(`Unsupported data type: ${Ue}`);if(!Be(c,Ue,!1))throw new Error(`preferredLocation "ml-tensor" for ${Ue} output is not supported by current WebNN Context.`);let bt=await Ne(c,et,Rr,Ct,!1);Or=!0,wt.push([Ue,Ct,{mlTensor:bt,download:I.webnnCreateMLTensorDownloader(et,Ue),dispose:()=>{I.webnnReleaseTensorId(et),I._OrtReleaseTensor(mt)}},"ml-tensor"])}else if(rr==="ml-tensor-cpu-output"&&At>0){let Ne=I.webnnCreateMLTensorDownloader(et,Ue)(),Be=wt.length;Or=!0,It.push((async()=>{let bt=[Be,await Ne];return I.webnnReleaseTensorId(et),I._OrtReleaseTensor(mt),bt})()),wt.push([Ue,Ct,[],"cpu"])}else{let Ne=Sr(Ue),Be=new Ne(At);new Uint8Array(Be.buffer,Be.byteOffset,Be.byteLength).set(I.HEAPU8.subarray(et,et+Be.byteLength)),wt.push([Ue,Ct,Be,"cpu"])}}finally{I.stackRestore(wa),Ue==="string"&&et&&I._free(et),Or||I._OrtReleaseTensor(mt)}}M&&!ee&&(I._OrtClearBoundOutputs(M.handle)!==0&&re("Can't clear bound outputs."),Ut.set(c,[V,G,q,M,ee,!1]));for(let[xe,mt]of await Promise.all(It))wt[xe][2]=mt;return Ye("wasm ProcessOutputTensor"),wt}finally{I.webnnOnRunEnd?.(V),I.stackRestore(Ze),$e.forEach(ft=>I._OrtReleaseTensor(ft)),K.forEach(ft=>I._OrtReleaseTensor(ft)),Pe.forEach(ft=>I._free(ft)),ce!==0&&I._OrtReleaseRunOptions(ce),fe.forEach(ft=>I._free(ft))}},Yt=c=>{let g=ue(),b=Ut.get(c);if(!b)throw new Error("invalid session id");let T=b[0],S=g._OrtEndProfiling(T);S===0&&re("Can't get an profile file name."),g._OrtFree(S)},Xr=c=>{let g=[];for(let b of c){let T=b[2];!Array.isArray(T)&&"buffer"in T&&g.push(T.buffer)}return g}}),Et,ae,Lt,Jt,Zt,er,zr,Cr,kt,qt,Yr,Jr,ei,Hi,Ki,ya,tr,Zi,Qi=C(()=>{"use strict";Ge(),ji(),nt(),wr(),Et=()=>!!de.wasm.proxy&&typeof document<"u",Lt=!1,Jt=!1,Zt=!1,Cr=new Map,kt=(c,g)=>{let b=Cr.get(c);b?b.push(g):Cr.set(c,[g])},qt=()=>{if(Lt||!Jt||Zt||!ae)throw new Error("worker not ready")},Yr=c=>{switch(c.data.type){case"init-wasm":Lt=!1,c.data.err?(Zt=!0,zr[1](c.data.err)):(Jt=!0,zr[0]()),er&&(URL.revokeObjectURL(er),er=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let g=Cr.get(c.data.type);c.data.err?g.shift()[1](c.data.err):g.shift()[0](c.data.out);break}default:}},Jr=async()=>{if(!Jt){if(Lt)throw new Error("multiple calls to 'initWasm()' detected.");if(Zt)throw new Error("previous call to 'initWasm()' failed.");if(Lt=!0,Et())return new Promise((c,g)=>{ae?.terminate(),Ri().then(([b,T])=>{try{ae=T,ae.onerror=B=>g(B),ae.onmessage=Yr,zr=[c,g];let S={type:"init-wasm",in:de};if(!S.in.wasm.wasmPaths&&b){let B=mr();B&&(S.in.wasm.wasmPaths=B)}ae.postMessage(S),er=b}catch(S){g(S)}},g)});try{await vr(de.wasm),await jr(de),Jt=!0}catch(c){throw Zt=!0,c}finally{Lt=!1}}},ei=async c=>{if(Et())return qt(),new Promise((g,b)=>{kt("init-ep",[g,b]);let T={type:"init-ep",in:{epName:c,env:de}};ae.postMessage(T)});await Hr(de,c)},Hi=async c=>Et()?(qt(),new Promise((g,b)=>{kt("copy-from",[g,b]);let T={type:"copy-from",in:{buffer:c}};ae.postMessage(T,[c.buffer])})):we(c),Ki=async(c,g)=>{if(Et()){if(g?.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return qt(),new Promise((b,T)=>{kt("create",[b,T]);let S={type:"create",in:{model:c,options:{...g}}},B=[];c instanceof Uint8Array&&B.push(c.buffer),ae.postMessage(S,B)})}else return ht(c,g)},ya=async c=>{if(Et())return qt(),new Promise((g,b)=>{kt("release",[g,b]);let T={type:"release",in:c};ae.postMessage(T)});Qr(c)},tr=async(c,g,b,T,S,B)=>{if(Et()){if(b.some(I=>I[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(S.some(I=>I))throw new Error("pre-allocated output tensor is not supported for proxy.");return qt(),new Promise((I,k)=>{kt("run",[I,k]);let O=b,V={type:"run",in:{sessionId:c,inputIndices:g,inputs:O,outputIndices:T,options:B}};ae.postMessage(V,Xr(O))})}else return D(c,g,b,T,S,B)},Zi=async c=>{if(Et())return qt(),new Promise((g,b)=>{kt("end-profiling",[g,b]);let T={type:"end-profiling",in:c};ae.postMessage(T)});Yt(c)}}),Xi,ti,ri,ii=C(()=>{"use strict";Ge(),Qi(),oe(),cr(),Gi(),Xi=(c,g)=>{switch(c.location){case"cpu":return[c.type,c.dims,c.data,"cpu"];case"gpu-buffer":return[c.type,c.dims,{gpuBuffer:c.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[c.type,c.dims,{mlTensor:c.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${c.location} for ${g()}`)}},ti=c=>{switch(c[3]){case"cpu":return new Me(c[0],c[2],c[1]);case"gpu-buffer":{let g=c[0];if(!Er(g))throw new Error(`not supported data type: ${g} for deserializing GPU tensor`);let{gpuBuffer:b,download:T,dispose:S}=c[2];return Me.fromGpuBuffer(b,{dataType:g,dims:c[1],download:T,dispose:S})}case"ml-tensor":{let g=c[0];if(!kr(g))throw new Error(`not supported data type: ${g} for deserializing MLTensor tensor`);let{mlTensor:b,download:T,dispose:S}=c[2];return Me.fromMLTensor(b,{dataType:g,dims:c[1],download:T,dispose:S})}default:throw new Error(`invalid data location: ${c[3]}`)}},ri=class{async fetchModelAndCopyToWasmMemory(c){return Hi(await Ir(c))}async loadModel(c,g){je();let b;typeof c=="string"?b=await this.fetchModelAndCopyToWasmMemory(c):b=c,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await Ki(b,g),Fe()}async dispose(){return ya(this.sessionId)}async run(c,g,b){je();let T=[],S=[];Object.entries(c).forEach(q=>{let M=q[0],ee=q[1],A=this.inputNames.indexOf(M);if(A===-1)throw new Error(`invalid input '${M}'`);T.push(ee),S.push(A)});let B=[],I=[];Object.entries(g).forEach(q=>{let M=q[0],ee=q[1],A=this.outputNames.indexOf(M);if(A===-1)throw new Error(`invalid output '${M}'`);B.push(ee),I.push(A)});let k=T.map((q,M)=>Xi(q,()=>`input "${this.inputNames[S[M]]}"`)),O=B.map((q,M)=>q?Xi(q,()=>`output "${this.outputNames[I[M]]}"`):null),V=await tr(this.sessionId,S,k,I,O,b),G={};for(let q=0;q<V.length;q++)G[this.outputNames[I[q]]]=B[q]??ti(V[q]);return Fe(),G}startProfiling(){}endProfiling(){Zi(this.sessionId)}}}),Ar={};le(Ar,{OnnxruntimeWebAssemblyBackend:()=>si,initializeFlags:()=>ai,wasmBackend:()=>ni});var ai,si,ni,Yi=C(()=>{"use strict";Ge(),Qi(),ii(),ai=()=>{(typeof de.wasm.initTimeout!="number"||de.wasm.initTimeout<0)&&(de.wasm.initTimeout=0);let c=de.wasm.simd;if(typeof c!="boolean"&&c!==void 0&&c!=="fixed"&&c!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${c}". Reset it to \`false\` and ignore SIMD feature checking.`),de.wasm.simd=!1),typeof de.wasm.proxy!="boolean"&&(de.wasm.proxy=!1),typeof de.wasm.trace!="boolean"&&(de.wasm.trace=!1),typeof de.wasm.numThreads!="number"||!Number.isInteger(de.wasm.numThreads)||de.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)de.wasm.numThreads=1;else{let g=typeof navigator>"u"?Z("node:os").cpus().length:navigator.hardwareConcurrency;de.wasm.numThreads=Math.min(4,Math.ceil((g||1)/2))}},si=class{async init(c){ai(),await Jr(),await ei(c)}async createInferenceSessionHandler(c,g){let b=new ri;return await b.loadModel(c,g),b}},ni=new si}),Ji={};le(Ji,{InferenceSession:()=>pr,TRACE:()=>Pt,TRACE_EVENT_BEGIN:()=>Xe,TRACE_EVENT_END:()=>Ye,TRACE_FUNC_BEGIN:()=>je,TRACE_FUNC_END:()=>Fe,Tensor:()=>Me,default:()=>ns,env:()=>de,registerBackend:()=>Ee}),Ge(),Ge(),Ge();var _a="1.27.0",ns=Ti;{let c=(Yi(),J(Ar)).wasmBackend;Ee("cpu",c,10),Ee("wasm",c,10)}return Object.defineProperty(de.versions,"web",{value:_a,enumerable:!0}),J(Ji)})();typeof Ec=="object"&&typeof $n=="object"&&($n.exports=af)});var zc=tt(Ve=>{"use strict";var sf=Ve&&Ve.__createBinding||(Object.create?(function(P,L,U,H){H===void 0&&(H=U);var Z=Object.getOwnPropertyDescriptor(L,U);(!Z||("get"in Z?!L.__esModule:Z.writable||Z.configurable))&&(Z={enumerable:!0,get:function(){return L[U]}}),Object.defineProperty(P,H,Z)}):(function(P,L,U,H){H===void 0&&(H=U),P[H]=L[U]})),nf=Ve&&Ve.__setModuleDefault||(Object.create?(function(P,L){Object.defineProperty(P,"default",{enumerable:!0,value:L})}):function(P,L){P.default=L}),of=Ve&&Ve.__importStar||function(P){if(P&&P.__esModule)return P;var L={};if(P!=null)for(var U in P)U!=="default"&&Object.prototype.hasOwnProperty.call(P,U)&&sf(L,P,U);return nf(L,P),L};Object.defineProperty(Ve,"__esModule",{value:!0});Ve.MicVAD=Ve.getDefaultRealTimeVADOptions=Ve.ort=Ve.DEFAULT_MODEL=void 0;var uf=of(kc()),lf=Da(),vn=Na(),vt=di(),Fr=ca(),Ic=fn(),df=gn();Ve.DEFAULT_MODEL="legacy";Ve.ort=uf;var pf="vad.worklet.bundle.min.js",cf="silero_vad_v5.onnx",hf="silero_vad_legacy.onnx",ff=P=>({...vn.defaultFrameProcessorOptions,onFrameProcessed:()=>{},onVADMisfire:()=>{vt.log.debug("VAD misfire")},onSpeechStart:()=>{vt.log.debug("Detected speech start")},onSpeechEnd:()=>{vt.log.debug("Detected speech end")},onSpeechRealStart:()=>{vt.log.debug("Detected real speech start")},baseAssetPath:"./",onnxWASMBasePath:"./",model:P,workletOptions:{},getStream:async()=>await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,autoGainControl:!0,noiseSuppression:!0}}),pauseStream:async L=>{L.getTracks().forEach(U=>{U.stop()})},resumeStream:async()=>await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:!0,autoGainControl:!0,noiseSuppression:!0}}),ortConfig:L=>{L.env.logLevel="error"},startOnLoad:!0,processorType:"auto"});Ve.getDefaultRealTimeVADOptions=ff;var mf=P=>"audioWorklet"in P&&typeof AudioWorkletNode=="function"?"AudioWorklet":"ScriptProcessor";async function gf(P,L,U,H,Z){await U.audioWorklet.addModule(P),L.processorOptions={...L.processorOptions??{},frameSamples:H};let C=new AudioWorkletNode(U,"vad-helper-worklet",L);return C.port.onmessage=async le=>{let be=le.data;if(!(typeof be=="object"&&be&&"message"in be)){console.error("Invalid message event",be);return}switch(be.message){case Fr.Message.AudioFrame:{if(!("data"in be&&be.data instanceof ArrayBuffer)){console.log("Audio frame message has no data");return}let J=new Float32Array(be.data);await Z(J);break}}},C}async function yf(P,L,U){let H=new df.Resampler({nativeSampleRate:P.sampleRate,targetSampleRate:16e3,targetFrameSize:L});vt.log.debug("using script processor");let C=P.createScriptProcessor(4096,1,1),le=!1;return C.onaudioprocess=async be=>{if(!le){le=!0;try{let J=be.inputBuffer.getChannelData(0);be.outputBuffer.getChannelData(0).fill(0);let Se=H.process(J);for(let Ee of Se)await U(Ee)}catch(J){console.error("Error processing audio:",J)}finally{le=!1}}},C.connect(P.destination),C}var xn=class P{constructor(L,U,H,Z,C=!1,le=null,be=null,J=null,ge=null,Se=null,Ee=null,rt="uninitialized",_t=!1){this.options=L,this.frameProcessor=U,this.model=H,this.frameSamples=Z,this.listening=C,this.errored=le,this._stream=be,this._audioContext=J,this._vadNode=ge,this._mediaStreamAudioSourceNode=Se,this._audioProcessorAdapterType=Ee,this.initializationState=rt,this.ownsAudioContext=_t,this.getAudioInstances=()=>{if(this._stream===null||this._audioContext===null||this._vadNode==null||this._mediaStreamAudioSourceNode==null)throw new Error("MicVAD has null stream, audio context, or processor adapter");return{stream:this._stream,audioContext:this._audioContext,vadNode:this._vadNode,mediaStreamAudioSourceNode:this._mediaStreamAudioSourceNode}},this.setErrored=ze=>{this.initializationState="errored",this.errored=ze},this.start=async()=>{switch(this.initializationState){case"uninitialized":{vt.log.debug("initializing micVAD"),this.initializationState="initializing",this.frameProcessor.resume();try{this._stream=await this.options.getStream()}catch(ze){throw ze instanceof Error?this.setErrored(ze.message):this.setErrored(String(ze)),ze}if(this.options.audioContext?(console.log("using custom audio context"),this._audioContext=this.options.audioContext):(console.log("using default audio context"),this._audioContext=new AudioContext,this.ownsAudioContext=!0),!this._audioContext)throw this.setErrored("Audio context is null"),Error("Audio context is null");switch(this._audioProcessorAdapterType=this.options.processorType=="auto"?mf(this._audioContext):this.options.processorType,this._audioProcessorAdapterType){case"AudioWorklet":this._vadNode=await gf(this.options.baseAssetPath+pf,this.options.workletOptions,this._audioContext,this.frameSamples,this.processFrame);break;case"ScriptProcessor":this._vadNode=await yf(this._audioContext,this.frameSamples,this.processFrame);break;default:throw new Error(`Unsupported audio processor adapter type: ${this._audioProcessorAdapterType}`)}this._mediaStreamAudioSourceNode=new MediaStreamAudioSourceNode(this._audioContext,{mediaStream:this._stream}),this._mediaStreamAudioSourceNode.connect(this._vadNode),vt.log.debug("started micVAD"),this.listening=!0,this.initializationState="initialized";break}case"initializing":{vt.log.warn("start called while initializing");break}case"initialized":{if(this.listening)return;this.listening=!0,this.frameProcessor.resume();let{stream:ze,audioContext:xt,vadNode:nr}=this.getAudioInstances();this._stream=await this.options.resumeStream(ze);let Gr=new MediaStreamAudioSourceNode(xt,{mediaStream:this._stream});this._mediaStreamAudioSourceNode=Gr,Gr.connect(nr);break}case"destroyed":{vt.log.warn("start called after destroyed");break}case"errored":{vt.log.error("start called after errored");break}default:{vt.log.warn("weird initialization state");break}}},this.pause=async()=>{if(!this.listening)return;this.listening=!1;let{stream:ze,mediaStreamAudioSourceNode:xt}=this.getAudioInstances();await this.options.pauseStream(ze),xt.disconnect(),this.frameProcessor.pause(this.handleFrameProcessorEvent)},this.destroy=async()=>{vt.log.debug("destroy called"),this.initializationState="destroyed";let{vadNode:ze}=this.getAudioInstances();ze instanceof AudioWorkletNode&&ze.port.postMessage(Fr.Message.SpeechStop),this.listening&&await this.pause(),await this.model.release(),this.ownsAudioContext&&await this._audioContext?.close()},this.setOptions=ze=>{this.frameProcessor.setOptions(ze)},this.processFrame=async ze=>{await this.frameProcessor.process(ze,this.handleFrameProcessorEvent)},this.handleFrameProcessorEvent=ze=>{switch(ze.msg){case Fr.Message.FrameProcessed:this.options.onFrameProcessed(ze.probs,ze.frame);break;case Fr.Message.SpeechStart:this.options.onSpeechStart();break;case Fr.Message.SpeechRealStart:this.options.onSpeechRealStart();break;case Fr.Message.VADMisfire:this.options.onVADMisfire();break;case Fr.Message.SpeechEnd:this.options.onSpeechEnd(ze.audio);break}}}static async new(L={}){let U={...(0,Ve.getDefaultRealTimeVADOptions)(L.model??Ve.DEFAULT_MODEL),...L};(0,vn.validateOptions)(U),Ve.ort.env.wasm.wasmPaths=U.onnxWASMBasePath,U.ortConfig!==void 0&&U.ortConfig(Ve.ort);let H=U.model==="v5"?cf:hf,Z=U.baseAssetPath+H,C=U.model==="v5"?Ic.SileroV5.new:Ic.SileroLegacy.new,le;try{le=await C(Ve.ort,()=>(0,lf.defaultModelFetcher)(Z))}catch(Ee){throw console.error(`Encountered an error while loading model file ${Z}`),Ee}let be=U.model==="v5"?512:1536,J=be/16,ge=new vn.FrameProcessor(le.process,le.reset_state,{positiveSpeechThreshold:U.positiveSpeechThreshold,negativeSpeechThreshold:U.negativeSpeechThreshold,redemptionMs:U.redemptionMs,preSpeechPadMs:U.preSpeechPadMs,minSpeechMs:U.minSpeechMs,submitUserSpeechOnPause:U.submitUserSpeechOnPause},J),Se=new P(U,ge,le,be);if(U.startOnLoad)try{await Se.start()}catch(Ee){throw console.error("Error starting micVad",Ee),Ee}return Se}};Ve.MicVAD=xn});var Cc=tt(We=>{"use strict";Object.defineProperty(We,"__esModule",{value:!0});We.getDefaultRealTimeVADOptions=We.MicVAD=We.DEFAULT_MODEL=We.utils=We.NonRealTimeVAD=We.Message=We.FrameProcessor=We.defaultModelFetcher=We.baseAssetPath=void 0;var _f=dn();Object.defineProperty(We,"baseAssetPath",{enumerable:!0,get:function(){return _f.baseAssetPath}});var wf=Da();Object.defineProperty(We,"defaultModelFetcher",{enumerable:!0,get:function(){return wf.defaultModelFetcher}});var bf=Na();Object.defineProperty(We,"FrameProcessor",{enumerable:!0,get:function(){return bf.FrameProcessor}});var $f=ca();Object.defineProperty(We,"Message",{enumerable:!0,get:function(){return $f.Message}});var vf=xc();Object.defineProperty(We,"NonRealTimeVAD",{enumerable:!0,get:function(){return vf.NonRealTimeVAD}});var Wa=Sc();We.utils={audioFileToArray:Wa.audioFileToArray,minFramesForTargetMS:Wa.minFramesForTargetMS,arrayBufferToBase64:Wa.arrayBufferToBase64,encodeWAV:Wa.encodeWAV};var Sn=zc();Object.defineProperty(We,"DEFAULT_MODEL",{enumerable:!0,get:function(){return Sn.DEFAULT_MODEL}});Object.defineProperty(We,"MicVAD",{enumerable:!0,get:function(){return Sn.MicVAD}});Object.defineProperty(We,"getDefaultRealTimeVADOptions",{enumerable:!0,get:function(){return Sn.getDefaultRealTimeVADOptions}})});var xf=Bh(Cc());var export_MicVAD=xf.MicVAD;export{export_MicVAD as MicVAD};
/*! Bundled license information:

onnxruntime-web/dist/ort.min.js:
  (*!
   * ONNX Runtime Web v1.27.0
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

onnxruntime-web/dist/ort.wasm.min.js:
  (*!
   * ONNX Runtime Web v1.27.0
   * Copyright (c) Microsoft Corporation. All rights reserved.
   * Licensed under the MIT License.
   *)
*/
