// Comprehensive content data — inspired by masir.faradars.org structure

export interface GuideItem {
  slug: string;
  title: string;
  excerpt: string;
  category: 'rules' | 'knowing-options' | 'decision-making' | 'after-selection';
  categoryLabel: string;
}

export const GUIDES: GuideItem[] = [
  // قواعد پذیرش و اسناد رسمی
  { slug: 'major-selection-overview', title: 'مرور کلی انتخاب رشته', excerpt: 'انتخاب رشته زمانی به تصمیمی قابل‌دفاع تبدیل می‌شود که داوطلب پیش از بررسی جداول و فرم‌های انتخاب رشته، معیارها و محدودیت‌های خود را روشن کند، سپس گزینه‌های ممکن را ارزیابی کند.', category: 'rules', categoryLabel: 'قواعد پذیرش و اسناد رسمی' },
  { slug: 'major-selection-score-report', title: 'تفسیر کارنامه کنکور', excerpt: 'کارنامه کنکور نقشه‌ای از جایگاه سنجش و محدودیت‌های انتخاب داوطلب است، نه پاسخ آماده‌ای برای اینکه کدام رشته‌محل را حتما می‌توان به دست آورد.', category: 'rules', categoryLabel: 'قواعد پذیرش و اسناد رسمی' },
  { slug: 'major-selection-booklet', title: 'خواندن دفترچه انتخاب رشته', excerpt: 'انتخاب رشته موفق بیش از آنکه به حفظ کردن کدرشته‌محل‌ها وابسته باشد، به خواندن دقیق دفترچه و اصلاحیه‌ها، تشخیص محدودیت‌های هر گزینه و ثبت قابل‌ردیابی اولویت‌ها بستگی دارد.', category: 'rules', categoryLabel: 'قواعد پذیرش و اسناد رسمی' },
  { slug: 'major-selection-quotas-and-regional-admission', title: 'سهمیه‌ها و پذیرش بومی', excerpt: 'در کنکور ایران، نتیجه قابل‌تفسیر فقط با یک رتبه یا نمره سنجیده نمی‌شود، بلکه سهمیه، گروه رقابتی، بومی‌گزینی و نوع پذیرش هرکدام بخشی از سازوکار گزینش‌اند.', category: 'rules', categoryLabel: 'قواعد پذیرش و اسناد رسمی' },
  { slug: 'major-selection-university-and-program-types', title: 'انواع دانشگاه‌ها و دوره‌ها', excerpt: 'انتخاب بین انواع دانشگاه‌ها و دوره‌های تحصیلی در ایران زمانی معنادار است که داوطلب، هزینه، میزان انعطاف، شیوه آموزش، الزامات اداری و تجربه روزمره هر گزینه را بداند.', category: 'rules', categoryLabel: 'قواعد پذیرش و اسناد رسمی' },
  { slug: 'major-selection-past-admission-data', title: 'داده‌های قبولی سال‌های گذشته', excerpt: 'داده‌های قبولی سال‌های گذشته زمانی برای انتخاب رشته مفیدند که به عنوان نشانهای از سطح رقابت و دامنه ریسک، در کنار مقررات دوره جاری و شرایط واقعی داوطلب تفسیر شوند.', category: 'rules', categoryLabel: 'قواعد پذیرش و اسناد رسمی' },
  { slug: 'major-selection-special-cases', title: 'پذیرش‌های دارای شرایط خاص', excerpt: 'در پذیرش‌های دارای شرایط خاص، تصمیم داوطلب فقط به انتخاب رشته محدود نمی‌شود. او باید همزمان امکان عبور از مراحل گزینش و ارزیابی سلامت را بسنجد.', category: 'rules', categoryLabel: 'قواعد پذیرش و اسناد رسمی' },

  // شناخت رشته، دانشگاه و شهر
  { slug: 'major-selection-choosing-a-field', title: 'تناسب رشته با علاقه و توانایی', excerpt: 'انتخاب رشته زمانی درست است که علاقه، توانایی‌های فعلی و قابل‌اکتساب، ارزش‌های شخصی، اهداف بلندمدت و واقعیت‌های تحصیل را به طور همزمان بسنجد.', category: 'knowing-options', categoryLabel: 'شناخت رشته، دانشگاه و شهر' },
  { slug: 'major-selection-curriculum-reality', title: 'واقعیت تحصیل در یک رشته', excerpt: 'نام یک رشته فقط اطلاعاتی کلی در اختیار شما قرار می‌دهد و برای اینکه بفهمید تحصیل در آن رشته واقعا چه شرایطی دارد، باید درس‌های پایه و تخصصی، پیش‌نیازها و محتوای عملی را بررسی کنید.', category: 'knowing-options', categoryLabel: 'شناخت رشته، دانشگاه و شهر' },
  { slug: 'major-selection-career-prospects', title: 'بازار کار و آینده شغلی رشته', excerpt: 'تصمیم برای ورود به یک رشته نباید فقط بر اساس تصور عمومی از درآمد یا پرستیژ شکل بگیرد؛ بازار کار واقعی، روندهای آینده و شرایط جغرافیایی اشتغال باید بررسی شود.', category: 'knowing-options', categoryLabel: 'شناخت رشته، دانشگاه و شهر' },
  { slug: 'major-selection-evaluating-a-university', title: 'ارزیابی دانشگاه', excerpt: 'انتخاب دانشگاه می‌تواند اثری هم‌وزن انتخاب رشته بر تجربه تحصیلی و مسیر شغلی شما داشته باشد. ارزیابی دانشگاه به چند معیار کلیدی نیاز دارد.', category: 'knowing-options', categoryLabel: 'شناخت رشته، دانشگاه و شهر' },
  { slug: 'major-selection-field-vs-university-vs-city', title: 'رشته، دانشگاه یا شهر؟', excerpt: 'یکی از سؤال‌های همیشگی داوطلبان این است که اولویت اول چه باشد: رشته، دانشگاه یا شهر محل تحصیل؟ پاسخ به شرایط و اولویت‌های شخصی شما بستگی دارد.', category: 'knowing-options', categoryLabel: 'شناخت رشته، دانشگاه و شهر' },
  { slug: 'major-selection-studying-away-from-home', title: 'تحصیل در شهری دیگر', excerpt: 'برای بسیاری از داوطلبان، تحصیل در شهری غیر از شهر محل سکونت، واقعیتی است که باید با دقت برایش آماده شد: هزینه، انسجام اجتماعی، دوری از خانواده و امکانات شهر.', category: 'knowing-options', categoryLabel: 'شناخت رشته، دانشگاه و شهر' },

  // روش تصمیم‌گیری و چیدن فهرست
  { slug: 'major-selection-scoring-your-options', title: 'امتیازدهی به رشته‌محل‌ها', excerpt: 'امتیازدهی به رشته‌محل‌ها روشی ساختارمند برای تبدیل ترجیح‌های vague به اعدادی قابل‌مقایسه است.', category: 'decision-making', categoryLabel: 'روش تصمیم‌گیری و چیدن فهرست' },
  { slug: 'major-selection-pairwise-and-regret', title: 'مقایسه زوجی و آزمون پشیمانی', excerpt: 'مقایسه زوجی روشی برای تصمیم‌گیری بین گزینه‌هایی است که مقایسه مستقیم آن‌ها دشوار است.', category: 'decision-making', categoryLabel: 'روش تصمیم‌گیری و چیدن فهرست' },
  { slug: 'major-selection-building-a-shortlist', title: 'ساخت فهرست کوتاه', excerpt: 'ساخت فهرست کوتاه، گزینش نهایی از میان گزینه‌های متعدد با حذف تدریجی و تمرکز روی بهترین‌ها.', category: 'decision-making', categoryLabel: 'روش تصمیم‌گیری و چیدن فهرست' },
  { slug: 'major-selection-chance-versus-preference', title: 'شانس قبولی یا ترجیح؟', excerpt: 'آیا باید رشته‌ای را انتخاب کرد که شانس قبولی بیشتری دارد یا رشته‌ای که بیشتر دوست دارم؟', category: 'decision-making', categoryLabel: 'روش تصمیم‌گیری و چیدن فهرست' },
  { slug: 'major-selection-ordering-the-list', title: 'چیدن ترتیب انتخاب‌ها', excerpt: 'ترتیب انتخاب‌ها در فهرست انتخاب رشته می‌تواند اثر بزرگی بر نتیجه نهایی داشته باشد.', category: 'decision-making', categoryLabel: 'روش تصمیم‌گیری و چیدن فهرست' },
  { slug: 'major-selection-final-audit', title: 'بازبینی و ثبت نهایی فرم', excerpt: 'پیش از ثبت نهایی فرم انتخاب رشته، باید یک بازبینی کامل انجام دهید تا از عدم خطا و انطباق با مقررات مطمئن شوید.', category: 'decision-making', categoryLabel: 'روش تصمیم‌گیری و چیدن فهرست' },

  // مشاوره، خانواده و پس از انتخاب
  { slug: 'major-selection-family-and-advice', title: 'نقش خانواده و مشاور', excerpt: 'نقش خانواده و مشاور در انتخاب رشته می‌تواند هم کمک‌کننده و هم بازدارنده باشد.', category: 'after-selection', categoryLabel: 'مشاوره، خانواده و پس از انتخاب' },
  { slug: 'major-selection-finding-a-counselor', title: 'انتخاب مشاور تحصیلی', excerpt: 'انتخاب مشاور تحصیلی مناسب می‌تواند فرایند انتخاب رشته را بسیار ساده‌تر و مؤثرتر کند.', category: 'after-selection', categoryLabel: 'مشاوره، خانواده و پس از انتخاب' },
  { slug: 'major-selection-waiting-for-results', title: 'از اعلام نتایج تا ثبت‌نام', excerpt: 'پس از اعلام نتایج کنکور و انتخاب رشته، مراحل دیگری مانند ثبت‌نام و آمادگی برای شروع دانشگاه پیش روست.', category: 'after-selection', categoryLabel: 'مشاوره، خانواده و پس از انتخاب' },
  { slug: 'major-selection-preparing-for-university', title: 'آمادگی برای شروع دانشگاه', excerpt: 'ورود به دانشگاه آغاز مرحله‌ای جدید است که نیازمند آمادگی ذهنی، مهارتی و اجتماعی است.', category: 'after-selection', categoryLabel: 'مشاوره، خانواده و پس از انتخاب' },
];

// Field categories — masir style
export interface FieldCategory {
  id: string;
  title: string;
  description: string;
}

export const FIELD_CATEGORIES: FieldCategory[] = [
  { id: 'basic-science', title: 'علوم پایه و میان‌رشته‌ای', description: 'رشته‌های علوم پایه و میان‌رشته‌ای مانند ریاضیات، فیزیک، شیمی، زیست‌شناسی و علم داده؛ بنیان نظری دانش و فناوری.' },
  { id: 'engineering', title: 'فنی و مهندسی', description: 'رشته‌های فنی و مهندسی مانند برق، مکانیک، عمران و کامپیوتر؛ طراحی، ساخت و بهبود سیستم‌های فنی.' },
  { id: 'medical', title: 'پزشکی و سلامت', description: 'رشته‌های پزشکی و سلامت مانند پزشکی، دندانپزشکی، داروسازی و پرستاری؛ مراقبت و درمان.' },
  { id: 'agriculture', title: 'کشاورزی و منابع طبیعی', description: 'رشته‌های کشاورزی و منابع طبیعی؛ تولید غذا، مدیریت منابع و محیط زیست.' },
  { id: 'humanities', title: 'علوم انسانی و اجتماعی', description: 'رشته‌های علوم انسانی و اجتماعی مانند حقوق، روان‌شناسی، جامعه‌شناسی و ادبیات.' },
  { id: 'management', title: 'مدیریت، اقتصاد و کسب‌وکار', description: 'رشته‌های مدیریت، اقتصاد و کسب‌وکار؛ سازماندهی، تصمیم‌گیری و بازار.' },
  { id: 'education', title: 'آموزش و تربیت', description: 'رشته‌های آموزش و تربیت؛ تربیت معلم و علوم تربیتی.' },
  { id: 'language', title: 'زبان و ادبیات', description: 'رشته‌های زبان و ادبیات؛ زبان‌های خارجی و ادبیات فارسی و عربی.' },
  { id: 'art', title: 'هنر، طراحی و میراث فرهنگی', description: 'رشته‌های هنر، طراحی و میراث فرهنگی مانند معماری، طراحی گرافیک، سینما و مرمت.' },
  { id: 'military', title: 'نظامی، انتظامی و امنیتی', description: 'رشته‌های نظامی، انتظامی و امنیتی؛ مطالعات امنیتی، راهبردی و حفاظت اطلاعات.' },
];

// University type categories — masir style
export const UNI_TYPE_CATEGORIES = [
  { id: 'dolati', title: 'دولتی (وزارت علوم)', description: 'دانشگاه‌های دولتی زیر نظر وزارت علوم، تحقیقات و فناوری؛ پذیرش عمدتاً از طریق کنکور سراسری و بدون شهریه در دوره روزانه.' },
  { id: 'teb', title: 'علوم پزشکی (وزارت بهداشت)', description: 'دانشگاه‌های علوم پزشکی زیر نظر وزارت بهداشت؛ پذیرش رشته‌های پزشکی، دندانپزشکی و علوم بهداشتی.' },
  { id: 'azad', title: 'آزاد اسلامی', description: 'دانشگاه آزاد اسلامی؛ پذیرش از طریق کنکور جداگانه با شهریه.' },
  { id: 'payamnoor', title: 'پیام نور', description: 'دانشگاه پیام نور؛ مدل نیم‌حضوری با انعطاف بالا.' },
  { id: 'ghayrentefai', title: 'غیرانتفاعی و غیردولتی', description: 'دانشگاه‌های غیرانتفاعی و غیردولتی؛ خصوصی با شهریه.' },
  { id: 'elmikarbordi', title: 'علمی‌کاربردی و مهارتی', description: 'دانشگاه علمی کاربردی؛ آموزش مهارتی با گرایش شغلی.' },
  { id: 'fanhariyan', title: 'فرهنگیان و تربیت معلم', description: 'دانشگاه فرهنگیان؛ تربیت معلم برای مدارس.' },
];

// Major descriptions — for the detailed major view
export interface MajorDescription {
  name: string;
  englishName?: string;
  intro: string;
  courses?: string;
  career?: string;
  suitableFor?: string;
}

export const MAJOR_DESCRIPTIONS: MajorDescription[] = [
  { name: 'مهندسی کامپیوتر', englishName: 'Computer Engineering', intro: 'آموزش طراحی و تحلیل سامانه‌های محاسباتی، نرم‌افزار و سخت‌افزار. رشته‌ای برای علاقه‌مندان به حل مسئله، برنامه‌نویسی و فناوری.', courses: 'برنامه‌نویسی، ساختمان داده، معماری کامپیوتر، پایگاه داده، شبکه، هوش مصنوعی.', career: 'نرم‌افزار، امنیت سایبری، هوش مصنوعی، داده، شبکه، فناوری اطلاعات.', suitableFor: 'کسانی که از حل مسئله و منطق لذت می‌برند و کنجکاو هستند.' },
  { name: 'مهندسی برق و الکترونیک', englishName: 'Electrical and Electronic Engineering', intro: 'آموزش طراحی و تحلیل سامانه‌های قدرت، مدار، کنترل و تجهیزات الکتریکی و الکترونیکی.', courses: 'مدارهای الکتریکی، ماشین‌های الکتریکی، سیستم‌های قدرت، الکترونیک، کنترل.', career: 'نیروگاه، شبکه توزیع، صنایع، اتوماسیون، تولید تجهیزات.', suitableFor: 'کسانی که ریاضی و فیزیک را دوست دارند و از کار فنی و آزمایشگاهی لذت می‌برند.' },
  { name: 'پزشکی', englishName: 'Medicine', intro: 'آموزش تشخیص، درمان و پیشگیری از بیماری‌ها. طولانی‌ترین و پرطرفدارترین رشته کنکور تجربی.', courses: 'آناتومی، فیزیولوژی، پاتولوژی، فارماکولوژی، بالینی.', career: 'طبابت، جراحی، تخصص‌های مختلف، پژوهش پزشکی.', suitableFor: 'کسانی که علاقه شدید به سلامت انسان، دقت بالا و صبر دارند.' },
  { name: 'دندانپزشکی', englishName: 'Dentistry', intro: 'آموزش تشخیص و درمان بیماری‌های دهان و دندان. رشته‌ای مستقل از پزشکی با طول تحصیل ۶ سال.', courses: 'آناتومی، فیزیولوژی، پاتولوژی، ترمیمی، پروتز، جراحی دهان.', career: 'طبابت خصوصی، کلینیک، بیمارستان، پژوهش.', suitableFor: 'کسانی با دقت دستی بالا و علاقه به کار عملی.' },
  { name: 'داروسازی', englishName: 'Pharmacy', intro: 'آموزش کشف، تولید و کنترل دارو. رشته‌ای میان‌رشته‌ای بین شیمی، زیست‌شناسی و پزشکی.', courses: 'شیمی دارویی، فارماکولوژی، فارماکوگنوسی، تکنولوژی دارو.', career: 'داروخانه، صنعت داروسازی، کنترل کیفیت، پژوهش.', suitableFor: 'کسانی با علاقه به شیمی و کار دقیق آزمایشگاهی.' },
  { name: 'مهندسی مکانیک', englishName: 'Mechanical Engineering', intro: 'آموزش طراحی، ساخت و نگهداری سیستم‌های مکانیکی و حرارتی.', courses: 'استاتیک، مقاومت مصالح، ترمودینامیک، سیالات، طراحی ماشین.', career: 'صنایع خودروسازی، نفت و گاز، نیروگاه، هوافضا.', suitableFor: 'کسانی با علاقه به فیزیک و کار فنی-صنعتی.' },
  { name: 'مهندسی عمران', englishName: 'Civil Engineering', intro: 'آموزش طراحی، ساخت و نگهداری ساختمان‌ها، پل‌ها، سدها و زیرساخت‌ها.', courses: 'استاتیک، مقاومت مصالح، مکانیک خاک، بتن، راه و راه‌آهن.', career: 'ساخت، پیمانکاری، مشاوره فنی، شهرداری.', suitableFor: 'کسانی با علاقه به ساختن و کار پروژه‌ای.' },
  { name: 'حقوق', englishName: 'Law', intro: 'آموزش قواعد حقوقی، قانون‌گذاری و رویه قضایی. رشته‌ای برای فهم و کار با نظام حقوقی.', courses: 'حقوق مدنی، حقوق جزایی، حقوق تجاری، حقوق اساسی، آیین دادرسی.', career: 'وکالت، قضاوت، مشاوره حقوقی، سازمان‌های دولتی.', suitableFor: 'کسانی با استدلال قوی، حافظه خوب و علاقه به متون قانونی.' },
  { name: 'روان‌شناسی', englishName: 'Psychology', intro: 'آموزش علمی رفتار و فرآیندهای ذهنی انسان. شامل روان‌شناسی بالینی، تربیتی، صنعتی و اجتماعی.', courses: 'روان‌شناسی عمومی، روان‌سنجی، روان‌شناسی بالینی، روان‌شناسی رشد.', career: 'درمان بالینی، مشاوره، منابع انسانی، پژوهش.', suitableFor: 'کسانی با علاقه به فهم انسان و همدلی.' },
  { name: 'اقتصاد', englishName: 'Economics', intro: 'آموزش تخصیص منابع کمیاب، رفتار بازار و سیاست‌های اقتصادی.', courses: 'اقتصاد خرد، اقتصاد کلان، آمار، اقتصادسنجی، اقتصاد توسعه.', career: 'بانکداری، بیمه، بازار سرمایه، سیاست‌گذاری، پژوهش.', suitableFor: 'کسانی با علاقه به آمار، تحلیل و کار با اعداد.' },
];

export function getMajorDescription(name: string): MajorDescription | null {
  const found = MAJOR_DESCRIPTIONS.find((m) => m.name === name);
  if (found) return found;
  // Return a generic description if not found
  return {
    name,
    intro: `معرفی رشته ${name}. اطلاعات کامل درباره دروس، گرایش‌ها، مهارت‌ها و بازار کار این رشته در ایران.`,
  };
}
