// Local-only checks. SMTP is intercepted in memory: no customer email is sent.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { spawn } = require('node:child_process');
const net = require('node:net');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const throttleDirectory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'bravo-ux-test-'));
const base = 'http://127.0.0.1:5511';
const artifacts = path.join(__dirname, 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });
let acceptMail = true, mailCount = 0;
const smtp = net.createServer(socket => {
  socket.write('220 localhost test SMTP\r\n');
  let buffer = '', data = false;
  socket.on('data', chunk => {
    buffer += chunk.toString();
    let end;
    while ((end = buffer.indexOf('\r\n')) >= 0) {
      const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
      if (data) {
        if (line === '.') { data = false; mailCount++; socket.write('250 Accepted locally\r\n'); }
      } else if (/^(EHLO|HELO)/i.test(line)) socket.write('250 localhost\r\n');
      else if (/^DATA/i.test(line)) { data = true; socket.write('354 Send data\r\n'); }
      else if (/^QUIT/i.test(line)) socket.end('221 Bye\r\n');
      else if (!acceptMail) socket.write('550 Test transport rejection\r\n');
      else socket.write('250 OK\r\n');
    }
  });
});
const php = spawn(path.resolve('.local-tools/php/php.exe'), ['-d','SMTP=127.0.0.1','-d','smtp_port=2526','-d','display_errors=0','-S','127.0.0.1:5511','-t',process.cwd()], {windowsHide:true,stdio:'ignore',env:{...process.env,BRAVO_RATE_LIMIT_DIR:throttleDirectory}});
const results = [];
let browser;
(async () => {
  await new Promise(resolve => smtp.listen(2526,'127.0.0.1',resolve));
  await new Promise(r=>setTimeout(r,500));
  browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const width of (process.env.UX_WIDTHS || '320,375,390,430,768,1024,1440,1920').split(',').map(Number)) {
    await page.setViewportSize({width,height:900});
    for (const route of ['index.html','about.html','services.html','contact.php']) {
      await page.goto(base+'/'+route, {waitUntil:'domcontentloaded'}); await page.waitForTimeout(200);
      await page.evaluate(() => document.fonts.ready);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `${route} overflow at ${width}`);
      for (let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=700) {
        await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),y); await page.waitForTimeout(120);
      }
      // A coarse jump can skip short items; explicitly visit any unobserved item.
      for (const item of await page.locator('.reveal:not(.is-visible)').all()) {
        await item.scrollIntoViewIfNeeded();
        await item.evaluate(e => new Promise((resolve,reject) => {
          const started=performance.now();
          function check() {
            if(e.classList.contains('is-visible')) return resolve();
            if(performance.now()-started>3000) return reject(new Error('Reveal did not respond to viewport entry'));
            requestAnimationFrame(check);
          } check();
        }));
      }
      await page.waitForTimeout(650);
      assert.equal(await page.locator('.reveal:not(.is-visible)').count(),0,`Hidden content ${route} ${width}: ` + await page.locator('.reveal:not(.is-visible)').evaluateAll(es=>es.map(e=>e.className+' '+Math.round(e.getBoundingClientRect().top))));
      assert.equal(await page.locator('img[src]').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).length),0,`Broken image ${route}`);
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
      if (width<1024) {
        await page.locator('#navToggle').click();
        assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#navToggle').getAttribute('aria-expanded'),'false');
        assert(await page.locator('#navToggle').evaluate(e=>e===document.activeElement));
      }
      if ([390,1440].includes(width)) await page.screenshot({path:path.join(artifacts,`${route}-${width}.png`),fullPage:true});
      results.push(`${route} @ ${width}: layout, images, reveal${width<1024?', menu':''} passed`);
      console.log(results.at(-1));
    }
  }
  await page.goto(base+'/services.html');
  await page.locator('.gallery-open').first().click();
  assert(await page.locator('dialog').evaluate(e=>e.open));
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.lightbox__count').textContent(),'2 / 5');
  await page.keyboard.press('Escape');
  assert(await page.locator('.gallery-open').first().evaluate(e=>e===document.activeElement));
  await page.locator('#k9-guard-dog .service-quote').click();
  assert.equal(await page.locator('#service').inputValue(),'K9 Guard Dog');
  await page.locator('[type=submit]').click();
  assert.equal(await page.locator('#customer_name').getAttribute('aria-invalid'),'true');
  async function fill() {
    await page.locator('#customer_name').fill('Local UX test');
    await page.locator('#phone').fill('+603 9226 9786');
    await page.locator('#email').fill('test@example.invalid');
    await page.locator('#service').selectOption('K9 Guard Dog');
  }
  await fill();
  await page.locator('[type=submit]').click();
  await page.locator('.form__feedback--success:visible').waitFor();
  assert.equal(mailCount,1);
  await page.goto(base+'/contact.php?sent=1');
  assert.equal(await page.locator('.form__feedback--success').count(),0);
  // A second attempt in the same session is rate limited and retains fields.
  await fill(); await page.locator('[type=submit]').click();
  await page.locator('.form__feedback--error:visible').waitFor();
  assert.match(await page.locator('.form__feedback--error:visible').textContent(),/wait a minute/);
  assert.equal(await page.locator('#customer_name').inputValue(),'Local UX test');
  await page.context().clearCookies(); acceptMail=false;
  await page.goto(base+'/contact.php'); await fill();
  await page.locator('[type=submit]').click();
  await page.locator('.form__feedback--error:visible').waitFor();
  assert.match(await page.locator('.form__feedback--error:visible').textContent(),/could not send/);
  assert.equal(mailCount,1);
  await page.goto(base+'/contact.php'); await fill();
  await page.locator('[name=csrf_token]').evaluate(e=>e.value='invalid');
  await page.locator('[type=submit]').click();
  await page.locator('.form__feedback--error:visible').waitFor();
  assert.match(await page.locator('.form__feedback--error:visible').textContent(),/session expired/);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base+'/index.html');
  assert.equal(await page.locator('.hero__title').evaluate(e=>getComputedStyle(e).animationName),'none');
  assert.equal(await page.locator('.reveal:not(.is-visible)').count(),0);
  await page.goto(base+'/operations.html'); await page.waitForURL('**/services.html#security-operations');
  const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:900}});
  await nojs.goto(base+'/services.html');
  assert(await nojs.locator('#navMenu').isVisible());
  assert.equal(await nojs.locator('.service-quote').count(),12);
  assert.equal(errors.length,0,errors.join('\n'));
  results.push('Gallery keyboard/focus, service preselection, inline validation, PHP + intercepted SMTP success/failure, rate limit, CSRF, forged success URL, reduced motion, legacy redirect, no-JS navigation passed.');
  fs.writeFileSync(path.join(artifacts,'results.txt'),results.join('\n'));
  console.log(results.join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();php.kill();smtp.close();});
