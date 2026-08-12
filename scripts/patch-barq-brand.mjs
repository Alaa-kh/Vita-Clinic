import fs from 'node:fs'

for (const file of ['src/shared/i18n/locales/en.json', 'src/shared/i18n/locales/ar.json']) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'))
  const ar = file.includes('ar.json')
  j.app.name = 'BARQ'
  j.app.tagline = ar ? 'برق التوصيل. طلبك يصل أسرع.' : 'Lightning delivery. Your order moves faster.'
  j.header.brandLine = ar ? 'سوق وتوصيل فوري' : 'Dispatch marketplace'
  j.header.deliveryBadge = ar ? 'تتبع مباشر · شبكة BARQ' : 'LIVE TRACKING · BARQ GRID'
  j.header.shopNow = ar ? 'اطلب الآن' : 'Order now'
  j.footer.blurb = ar
    ? 'BARQ منصة توصيل ومتجر — مسار واضح، دفع سريع، وتتبع لحظة بلحظة.'
    : 'BARQ is a dispatch-first marketplace — clear routes, fast checkout, live courier tracking.'
  j.footer.email = 'hello@barq.app'
  j.home.hero.subhead = ar
    ? 'لوحة إرسال حية للمتاجر القريبة. اطلب، ادفع، وتابع الصاعقة حتى بابك.'
    : 'A live dispatch board for nearby stores. Order, pay, and watch the bolt race to your door.'
  j.home.hero.ctaShop = ar ? 'افتح السوق' : 'Open market'
  j.home.hero.ctaTrack = ar ? 'خريطة التتبع' : 'Tracking map'
  j.home.liveStamp = ar ? 'مباشر' : 'Live grid'
  j.home.dispatchStamp = ar ? 'إرسال فوري' : 'Instant dispatch'
  j.home.marqueeEta = ar ? 'ETA أقل من 40د' : 'ETA under 40m'
  j.home.laneCategories = ar ? 'الممر 01 / تصنيفات' : 'Lane 01 / Categories'
  j.home.laneDispatch = ar ? 'الممر 02 / إرسال' : 'Lane 02 / Hot drops'
  j.home.hotDrop = ar ? 'إسقاط ساخن' : 'Hot drop'
  j.home.categoriesEyebrow = ar ? 'ممرات الطلب' : 'Order lanes'
  j.home.categoriesTitle = ar ? 'اختر مسارك' : 'Pick your lane'
  j.home.categoriesSub = ar
    ? 'شبكة تصنيفات حادة — بدون بطاقات ناعمة، فقط مسارات واضحة.'
    : 'Hard-edged category lanes — no soft cards, just clear routes.'
  j.home.featuredEyebrow = ar ? 'قائمة الإرسال' : 'Dispatch list'
  j.home.featuredTitle = ar ? 'إسقاطات اليوم' : "Today's drops"
  j.home.featuredSub = ar
    ? 'تذاكر منتجات بأسلوب المستودع — جاهزة للإرسال.'
    : 'Warehouse-style product tickets ready for dispatch.'
  j.home.deliveryTitle = ar ? 'المحرك الكامل خلف البرق' : 'The full engine behind the bolt'
  j.home.deliveryBody = ar
    ? 'خرائط، محافظ، شات، وذكاء اصطناعي — مربوطة بسيرفر حي.'
    : 'Maps, wallets, chat, and AI — wired to a live server.'
  j.home.deliveryCta = ar ? 'لوحة المنصة' : 'Platform deck'
  j.auth.demoHint = ar
    ? 'تجريبي: customer@vitago.app / Password123!'
    : 'Demo: customer@vitago.app / Password123!'
  fs.writeFileSync(file, JSON.stringify(j, null, 2))
  console.log('patched', file)
}
