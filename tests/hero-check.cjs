const {chromium}=require(process.env.PLAYWRIGHT_PATH);const assert=require('node:assert/strict');const fs=require('node:fs');
let browser;
(async()=>{browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const p=await browser.newPage();const results=[];
for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]]){
 await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:5500/');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1000);
 const cta=await p.locator('.hero--home .hero__actions').boundingBox();assert(cta.y+cta.height<=height+1,`CTA below short screen at ${width}`);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 for(const selector of ['.brand','.header__whatsapp',...(width<1024?['#navToggle']:['.nav__link','.nav__cta'])])for(const target of await p.locator(selector).all()){const box=await target.boundingBox();assert(box.width>=44&&box.height>=44,`${selector} ${width}: ${JSON.stringify(box)}`);}
 if(width<1024){await p.locator('#navToggle').click();await p.locator('#navMenu a[href="services.html"]').click();await p.waitForURL('**/services.html');assert.equal(await p.locator('#navToggle').getAttribute('aria-expanded'),'false');await p.goto('http://127.0.0.1:5500/');await p.waitForTimeout(1000);}
 await p.screenshot({path:`tests/artifacts/hero-${width}.png`});results.push(`${width} x ${height}: hero CTAs visible, no overflow, header touch targets >=44px, mobile navigation passed.`);
}
const linear=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4};const luminance=hex=>{const c=hex.match(/../g).map(x=>linear(parseInt(x,16)));return .2126*c[0]+.7152*c[1]+.0722*c[2]};const contrast=(luminance('f3f3f3')+.05)/(luminance('875e09')+.05);assert(contrast>=4.5);results.push(`Light-section eyebrow contrast: ${contrast.toFixed(2)}:1 on #f3f3f3.`);
console.log(results.join('\n'));fs.writeFileSync('tests/artifacts/hero-results.txt',results.join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close()});
