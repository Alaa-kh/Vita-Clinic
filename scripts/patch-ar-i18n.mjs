import fs from 'node:fs'

const p = 'src/shared/i18n/locales/ar.json'
const j = JSON.parse(fs.readFileSync(p, 'utf8'))

Object.assign(j.app, { name: 'VitaGo', tagline: 'تسوق محلياً. توصيل بسرعة.' })
Object.assign(j.header, {
  brandLine: 'توصيل ومتجر إلكتروني',
  deliveryBadge: 'توصيل مباشر في المملكة',
  shopNow: 'تسوق الآن',
})
j.nav = {
  ...j.nav,
  shop: 'المتجر',
  track: 'الخريطة المباشرة',
  cart: 'السلة',
  orders: 'الطلبات',
  platform: 'المنصة',
}
j.footer.blurb = 'VitaGo سوقك للطعام والبقالة والتجزئة مع تتبع المندوب مباشرة.'
j.footer.email = 'hello@vitago.app'
j.home = {
  hero: {
    subhead: 'اطلب من المتاجر القريبة وتتبع كل توصيلة لحظة بلحظة.',
    ctaShop: 'ابدأ التسوق',
    ctaTrack: 'افتح الخريطة المباشرة',
  },
  categoriesEyebrow: 'التصنيفات',
  categoriesTitle: 'ماذا تحتاج؟',
  categoriesSub: 'طعام، بقالة، تقنية، أزياء، صيدلية والمزيد.',
  featuredEyebrow: 'الأكثر طلباً',
  featuredTitle: 'رائج الآن',
  featuredSub: 'منتجات مختارة مع وقت وصول واضح وأسعار بالريال.',
  deliveryTitle: 'منصة توصيل متكاملة',
  deliveryBody: 'خرائط ومدفوعات وWebSockets وبحث ذكي مربوطة بـ API حقيقي.',
  deliveryCta: 'افتح المنصة',
}
j.shop = {
  eyebrow: 'السوق',
  title: 'متجر VitaGo',
  subtitle: 'صفِّ حسب التصنيف والمدينة. أضف للسلة وادفع مع ETA مباشر.',
  search: 'ابحث عن منتجات',
  allCategories: 'كل التصنيفات',
  allCities: 'كل المدن',
  empty: 'لا منتجات مطابقة.',
  min: 'د',
  addToCart: 'أضف للسلة',
  viewCart: 'عرض السلة',
  added: 'تمت الإضافة',
  deliveryInfo: 'التوصيل',
  deliveryInfoBody: 'تتبع المندوب بعد الدفع مع مسار من المتجر إلى عنوانك.',
  inStock: 'متوفر',
  etaPrep: 'جاهز خلال ~{{min}} د',
  categories: {
    food: 'طعام',
    grocery: 'بقالة',
    electronics: 'إلكترونيات',
    fashion: 'أزياء',
    pharmacy: 'صيدلية',
    home: 'منزل',
    beauty: 'جمال',
    sports: 'رياضة',
  },
  catFood: 'طعام',
  catFoodLine: 'وجبات ومقاهي',
  catGrocery: 'بقالة',
  catGroceryLine: 'احتياجات يومية',
  catElectronics: 'إلكترونيات',
  catElectronicsLine: 'أجهزة وصوتيات',
  catFashion: 'أزياء',
  catFashionLine: 'ملابس وستايل',
  catPharmacy: 'صيدلية',
  catPharmacyLine: 'مستلزمات صحية',
  catBeauty: 'جمال',
  catBeautyLine: 'العناية بالبشرة',
  fulfillment: { delivery: 'توصيل', pickup: 'استلام', both: 'توصيل أو استلام' },
}
j.cart = {
  eyebrow: 'السلة',
  title: 'سلتك',
  empty: 'سلتك فارغة.',
  summary: 'ملخص الطلب',
  subtotal: 'المجموع الفرعي',
  items: '{{count}} عناصر',
  checkout: 'إتمام الشراء',
}
j.checkout = {
  eyebrow: 'الدفع',
  title: 'التوصيل والدفع',
  address: 'عنوان التوصيل',
  city: 'المدينة',
  notes: 'ملاحظات',
  payment: 'طريقة الدفع',
  placeOrder: 'تأكيد الطلب',
  deliveryFee: 'رسوم التوصيل تُحسب عند التأكيد',
}
j.orders = {
  eyebrow: 'الطلبات',
  title: 'طلباتك',
  empty: 'لا طلبات بعد.',
  track: 'تتبع',
}
j.track = {
  eyebrow: 'تتبع مباشر',
  title: 'تتبع التوصيل',
  status: 'الحالة: {{status}} · الوصول خلال {{eta}} د',
  courier: 'المندوب',
  etaAt: 'الوصول تقريباً {{time}}',
}
j.auth.roles = {
  customer: 'عميل',
  merchant: 'تاجر',
  courier: 'مندوب',
  patient: 'عميل',
  provider: 'تاجر',
}
j.auth.loginSubtitle = 'سجل الدخول للتسوق وتتبع التوصيل وإدارة الطلبات.'
j.auth.registerSubtitle = 'أنشئ حساب عميل أو تاجر أو مندوب.'
j.auth.demoHint = 'تجريبي: customer@vitago.app / Password123!'
j.auth.visualLine = 'تجارة إلكترونية مع خرائط مباشرة ومحافظ وتتبع مندوبين.'
j.dialog.logoutBody = 'ستحتاج لتسجيل الدخول مجدداً للوصول إلى السلة والطلبات والمحفوظات.'

fs.writeFileSync(p, JSON.stringify(j, null, 2))
console.log('ar ok')
