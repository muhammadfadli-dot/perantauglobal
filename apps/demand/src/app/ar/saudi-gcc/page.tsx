import type { Metadata } from "next";
import Image from "next/image";
import { Nav } from "@/components/sections/Nav";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "توظيف باريستا وممرضات إندونيسيات في السعودية",
  description: "حلول توظيف للشركات السعودية لاستقطاب باريستا وممرضات إندونيسيات، مع توضيح الاحتياج، اختيار المرشحين، المستندات، التنقل، والدعم بعد الانضمام.",
  keywords: [
    "توظيف باريستا إندونيسي",
    "استقدام باريستا إندونيسي",
    "باريستا إندونيسي للمقاهي",
    "عمالة باريستا إندونيسية",
    "توظيف باريستا للمقاهي",
    "توظيف ممرضات إندونيسيات",
    "توظيف ممرضين إندونيسيين",
    "استقدام ممرضات إندونيسيات",
    "ممرضات إندونيسيات للمستشفيات",
    "كادر تمريض إندونيسي للمستشفيات",
    "توظيف عمالة ماهرة للشركات",
    "استقدام عمالة إندونيسية للشركات",
    "حلول توظيف للشركات السعودية",
    "توفير موظفين للمقاهي السعودية",
    "توظيف كادر تمريض للمستشفيات",
    "حلول توظيف للمقاهي السعودية",
    "توفير كوادر للمستشفيات السعودية",
    "حلول توظيف للرعاية الصحية",
    "توظيف عمالة من إندونيسيا للشركات",
    "إجراءات توظيف العمالة للشركات",
  ],
  alternates: { canonical: "/ar/saudi-gcc", languages: { en: "/en/saudi-gcc", id: "/id/saudi-gcc", ar: "/ar/saudi-gcc" } },
  openGraph: {
    title: "توظيف الكفاءات الإندونيسية للسعودية والخليج | DTG",
    description: "مسار توظيف واضح للكفاءات الإندونيسية في الضيافة والرعاية الصحية.",
    url: "/ar/saudi-gcc",
    locale: "ar_SA",
  },
};

const sectors = [
  {
    title: "الرعاية الصحية",
    text: "للمستشفيات والعيادات ومرافق الرعاية التي تبحث عن كادر تمريض إندونيسي وفق متطلبات الدور وبيئة العمل.",
    roles: ["ممرضات وممرضون مسجّلون", "مقدمو رعاية ومساعدو تمريض", "كوادر صحية مساندة"],
    image: "/images/sector-healthcare.jpg",
    alt: "ممرضة إندونيسية تراجع ملف مريض في مستشفى حديث",
    keyword: "توظيف ممرضات إندونيسيات",
  },
  {
    title: "الضيافة والمقاهي",
    text: "للفنادق والمطاعم وسلاسل المقاهي التي تحتاج إلى باريستا إندونيسي وخدمات أغذية ومشروبات متوافقة مع احتياج العمل.",
    roles: ["باريستا إندونيسيون", "خدمة الأغذية والمشروبات", "فرق التدبير الفندقي"],
    image: "/images/sector-hospitality.jpg",
    alt: "باريستا إندونيسي يحضّر القهوة في مقهى فندقي",
    keyword: "توظيف باريستا إندونيسي",
  },
];

const process = [
  ["تحديد الاحتياج", "تحديد الدور، وبيئة العمل، والعدد، والجدول الزمني، والمعايير المهمة لصاحب العمل."],
  ["مراجعة الملاءمة والجاهزية", "مراجعة الخبرة ذات الصلة، والجاهزية العملية، واللغة أو التحضير المطلوب بحسب الدور."],
  ["تنسيق المسار الموثّق", "توضيح المستندات والمسؤوليات وخطوات التنقل مع الأطراف المعنية قبل المضي قدماً."],
  ["الدعم بعد الانضمام", "تنظيم التواصل والدعم وفق النطاق والشروط المكتوبة المتفق عليها."],
];

const faqs = [
  ["هل يمكن لـ DTG توفير باريستا إندونيسي؟", "تبدأ المحادثة باحتياج صاحب العمل للمقهى أو الفندق، ومتطلبات الدور، وخبرة المرشح، والجاهزية العملية قبل عرض أي ملف."],
  ["هل يمكن لـ DTG دعم احتياج تمريض في السعودية؟", "تتم مراجعة احتياج المستشفى أو المنشأة، وسياق العمل، ومتطلبات الدور، والمسار الموثق المناسب قبل الاتفاق على نطاق الدعم."],
  ["هل الأعداد المتاحة منشورة بشكل ثابت؟", "لا يتم نشر أرقام غير موثقة. يتم تأكيد الملاءمة والتوافر والجاهزية بناءً على احتياج صاحب العمل الفعلي."],
  ["ماذا تشمل الحماية لمدة ستة أشهر؟", "تُحدَّد الحماية المكتوبة وعملية الدعم أو الاسترداد وشروطها في اتفاقية التوظيف المطبقة."],
];

const arabicSeoJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "توظيف الكفاءات الإندونيسية للسعودية والخليج",
      description: "حلول توظيف للشركات السعودية لاستقطاب باريستا وممرضات إندونيسيات، من توضيح الاحتياج واختيار المرشحين إلى توثيق المسار والدعم بعد الانضمام.",
      url: `https://${SITE.domain}/ar/saudi-gcc`,
      serviceType: "حلول توظيف دولية للشركات",
      areaServed: [
        { "@type": "Country", name: "Saudi Arabia" },
        { "@type": "Place", name: "Gulf Cooperation Council" },
      ],
      availableLanguage: ["ar", "en", "id"],
      provider: {
        "@type": "Organization",
        name: SITE.legalName,
        url: `https://${SITE.domain}`,
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: `https://${SITE.domain}/` },
        { "@type": "ListItem", position: 2, name: "السعودية والخليج", item: `https://${SITE.domain}/ar/saudi-gcc` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="gcc-ar-label"><span />{children}</div>;
}

// Arabic localization draft prepared for GCC review. It is intentionally authored
// as market copy and includes the initial Saudi SEO themes without keyword stuffing.
export default function SaudiGccArabicPage() {
  return (
    <div className="gcc-page gcc-ar-page" dir="rtl" lang="ar">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(arabicSeoJsonLd) }} />
      <Nav market="gcc" initialLocale="ar" />
      <main>
        <header id="top" className="gcc-ar-hero">
          <Image src="/images/hero-arches.jpg" alt="محترفون إندونيسيون في سياق عمل خليجي" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
          <div className="gcc-ar-hero-overlay" />
          <div className="gcc-ar-shell gcc-ar-hero-content">
            <p className="gcc-ar-kicker">شريك إندونيسي مرخّص لاستقطاب الكفاءات · السعودية والخليج</p>
            <h1>وظّف الكفاءات الإندونيسية بثقة.<br /><em>حماية مكتوبة لمدة 6 أشهر.</em></h1>
            <p className="gcc-ar-lede">تدعم DTG أصحاب العمل في السعودية والخليج، من تحديد احتياج القوى العاملة واختيار المرشحين إلى المستندات، والتنسيق للتنقل، والدعم بعد الانضمام.</p>
            <div className="gcc-ar-actions">
              <a className="gcc-ar-primary" href="#contact">ناقش احتياجات القوى العاملة</a>
              <a className="gcc-ar-secondary" href="#sectors">استكشف قطاعات الكفاءات</a>
            </div>
            <a className="gcc-ar-guarantee-link" href="#guarantee">حماية مكتوبة لمدة ستة أشهر بعد انضمام المرشح</a>
          </div>
        </header>

        <section className="gcc-ar-trust" aria-label="اعتمادات DTG">
          <div className="gcc-ar-shell gcc-ar-trust-grid">
            <div><b>معتمد من وزارة الخارجية السعودية</b><small>رقم التسجيل 321</small></div>
            <div><b>شركة P3MI مرخّصة</b><small>1810240237512001</small></div>
            <div><b>مجموعة دايالِيما</b><small>أكثر من 26 عاماً في رأس المال البشري</small></div>
            <div><b>حماية مكتوبة</b><small>لمدة ستة أشهر بعد الانضمام</small></div>
          </div>
        </section>

        <section id="why" className="gcc-ar-section gcc-ar-paper">
          <div className="gcc-ar-shell gcc-ar-two-column">
            <div>
              <SectionLabel>لماذا DTG</SectionLabel>
              <h2>قرار توظيف أوضح،<br /><em>بمسار مسؤول.</em></h2>
            </div>
            <div className="gcc-ar-copy">
              <p>تساعد DTG الشركات السعودية في مواءمة احتياج القوى العاملة مع الخبرة ذات الصلة، والجاهزية العملية، ومسار التوظيف المناسب. تبدأ المحادثة من العمل المطلوب، لا من قائمة مرشحين عامة.</p>
              <p>تشمل حلول التوظيف للشركات السعودية توضيح متطلبات الوظيفة، ومراجعة المرشحين، وتنسيق المستندات والتنقل ضمن المسؤوليات المتفق عليها.</p>
            </div>
          </div>
        </section>

        <section id="sectors" className="gcc-ar-section gcc-ar-offwhite">
          <div className="gcc-ar-shell">
            <SectionLabel>القطاعات</SectionLabel>
            <div className="gcc-ar-section-intro">
              <h2>قطاعات ذات صلة بالسعودية والخليج.</h2>
              <p>توفير موظفين للمقاهي السعودية وتوظيف كادر تمريض للمستشفيات يبدأان بفهم الدور وسياق مكان العمل ومتطلبات صاحب العمل.</p>
            </div>
            <div className="gcc-ar-sector-grid">
              {sectors.map((sector) => (
                <article className="gcc-ar-sector-card" key={sector.title}>
                  <div className="gcc-ar-image"><Image src={sector.image} alt={sector.alt} fill sizes="(max-width: 800px) 100vw, 50vw" style={{ objectFit: "cover" }} /></div>
                  <div className="gcc-ar-card-body">
                    <p className="gcc-ar-keyword">{sector.keyword}</p>
                    <h3>{sector.title}</h3>
                    <p>{sector.text}</p>
                    <ul>{sector.roles.map((role) => <li key={role}>{role}</li>)}</ul>
                    <a href="#contact">ناقش احتياج هذا القطاع</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="gcc-ar-section gcc-ar-paper">
          <div className="gcc-ar-shell">
            <SectionLabel>مسار التوظيف</SectionLabel>
            <div className="gcc-ar-section-intro"><h2>رحلة واضحة من الاحتياج إلى الدعم.</h2><p>استقدام عمالة إندونيسية للشركات يُناقش بحسب الدور، والوثائق المطلوبة، والمسؤوليات الموثقة.</p></div>
            <ol className="gcc-ar-process">{process.map(([title, body], index) => <li key={title}><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
          </div>
        </section>

        <section id="guarantee" className="gcc-ar-section gcc-ar-guarantee">
          <div className="gcc-ar-shell gcc-ar-guarantee-card">
            <SectionLabel>الحماية المكتوبة</SectionLabel>
            <h2>ستة أشهر.<br /><em>موثقة كتابياً.</em></h2>
            <p>يحصل صاحب العمل على حماية مكتوبة لمدة ستة أشهر بعد انضمام المرشح. تُحدَّد الشروط السارية وعملية الدعم أو الاسترداد في اتفاقية التوظيف.</p>
            <div className="gcc-ar-pills"><span>الشروط ضمن الاتفاقية</span><span>عملية الدعم موثقة</span><span>خلال المدة المتفق عليها</span></div>
          </div>
        </section>

        <section id="credentials" className="gcc-ar-section gcc-ar-offwhite">
          <div className="gcc-ar-shell">
            <SectionLabel>الاعتمادات والسجل</SectionLabel>
            <h2>دليل يمكن الرجوع إليه.</h2>
            <div className="gcc-ar-credentials">
              <div><small>وكيل معتمد من وزارة الخارجية السعودية</small><b>REG. 321</b><p>مسجل لدى الجهات السعودية.</p></div>
              <div><small>شركة P3MI مرخّصة في إندونيسيا</small><b>1810240237512001</b><p>مرخّصة لتوظيف العمالة للخارج.</p></div>
              <div><small>جزء من مجموعة دايالِيما</small><b>26+ عاماً</b><p>خبرة في الاستشارات ورأس المال البشري.</p></div>
            </div>
          </div>
        </section>

        <section id="faq" className="gcc-ar-section gcc-ar-paper">
          <div className="gcc-ar-shell gcc-ar-faq-layout">
            <div><SectionLabel>أسئلة السوق</SectionLabel><h2>إجابات واضحة قبل الخطوة التالية.</h2></div>
            <div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
          </div>
        </section>

        <section id="contact" className="gcc-ar-contact">
          <div className="gcc-ar-shell">
            <SectionLabel>ابدأ المحادثة</SectionLabel>
            <h2>شاركنا احتياجك من القوى العاملة.</h2>
            <p>اذكر الدور والعدد وسياق مكان العمل والوقت المستهدف، وسيتواصل فريق DTG لمناقشة الخطوة المناسبة.</p>
            <a className="gcc-ar-primary" href="https://wa.me/6285110555561?text=Halo%20DTG%2C%20saya%20ingin%20mendiskusikan%20kebutuhan%20tenaga%20kerja%20untuk%20Saudi%20Arabia%20dan%20GCC." target="_blank" rel="noreferrer">تواصل عبر واتساب</a>
          </div>
        </section>
      </main>
      <footer className="gcc-ar-footer"><div className="gcc-ar-shell">DTG · شريك إندونيسي لاستقطاب الكفاءات · جزء من مجموعة دايالِيما</div></footer>
    </div>
  );
}
