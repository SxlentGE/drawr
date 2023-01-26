Math.clamp=((e,t,n)=>e>n?n:e<t?t:e);const e=e=>document.querySelector(e),t=matchMedia("(pointer:fine)").matches,n=io(),o=e("#canvas"),i=o.getContext("2d"),d=localStorage;let l="#000000",a=0,s=0;const c=t=>{if(!d.cooldown){if(t)return void(e("#cooldown").innerText="0:00");d.cooldown=Date.now()+1e4}let n=new Date(+d.cooldown),o=((e,t)=>(e(),setInterval(e,t)))(()=>{const t=new Date,i=60*t.getMinutes()+t.getSeconds(),l=60*n.getMinutes()+n.getSeconds(),a=(l-i)%60,s=(l-i)/60|0;if(0===s&&0===a)return e("#cooldown").innerText="0:00",delete d.cooldown,void clearInterval(o);const c=`${s}:${(a+"").padStart(2,"0")}`;e("#cooldown").innerText=c},1e3)},r=(t,n)=>{const i=o.getBoundingClientRect(),d=e("pinch-zoom").scale,l=Math.floor((t-i.x)/d),c=Math.floor((n-i.y)/d);a=Math.clamp(l,0,o.width-1),s=Math.clamp(c,0,o.height-1),e("#pixel").style.left=a*d+i.x,e("#pixel").style.top=s*d+i.y,e("#pixel").style.width=e("#pixel").style.height=d,e("#coordinates").innerText=`(${a}, ${s}) ${d.toFixed(2)}x`},h=t=>{const n=t.type;let o;"error"===n?o="error":"warning"===n&&(o="warn");const i=document.createElement("li");i.innerText=t.contents,i.classList.add(o),e("#messages").appendChild(i),setTimeout(()=>i.remove(),3e3)},w=()=>{e("#cooldown").classList.remove("flash"),setTimeout(()=>{e("#cooldown").classList.add("flash")},1)},g=(e,t,n)=>{i.fillStyle=n,i.fillRect(e,t,1,1)},p=()=>{const t=Math.min(window.innerWidth/o.width,window.innerHeight/o.height)/1.5;e("pinch-zoom").setTransform({scale:t,x:(window.innerWidth-o.width*t)/2,y:(window.innerHeight-o.height*t)/2}),e("#coordinates").innerText=`(${a}, ${s}) ${t.toFixed(2)}x`};window.addEventListener("resize",()=>{p()}),window.addEventListener("load",()=>{c(!0),e("#colorPicker").addEventListener("input",({target:{value:e}})=>{l=e}),t?(o.addEventListener("mousemove",e=>{r(e.pageX,e.pageY)}),e("pinch-zoom").addEventListener("change",()=>{const t=e("pinch-zoom").scale,n=o.getBoundingClientRect();e("#pixel").style.left=a*t+n.left,e("#pixel").style.top=s*t+n.top,e("#pixel").style.width=t,e("#pixel").style.height=t,e("#coordinates").innerText=`(${a}, ${s}) ${t.toFixed(2)}x`}),e("pinch-zoom").addEventListener("click",e=>{const t=o.getBoundingClientRect();if(e.pageX>=t.x&&e.pageX<=t.x+t.width&&e.pageY>=t.top&&e.pageY<=t.top+t.height){if(d.cooldown)return void w();c(),g(a,s,l),n.emit("set",a,s,l)}})):(e("pinch-zoom").addEventListener("change",()=>{r(window.innerWidth/2,window.innerHeight/2)}),e("pinch-zoom").addEventListener("click",()=>{d.cooldown?w():(c(),g(a,s,l),n.emit("set",a,s,l))}));const m=new Image;m.onload=(()=>{o.width=m.width,o.height=m.height,i.imageSmoothingEnabled=!1,i.drawImage(m,0,0),p()}),m.src="./image.png",n.on("set",(e,t,n)=>{g(e,t,n)}),n.on("message",h)})