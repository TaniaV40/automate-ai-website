const loadHomeContent = async () => {
  try {
    const response = await fetch('content/home.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();

    const heroHeadline = document.getElementById('hero-headline');
    const heroSubtext = document.getElementById('hero-subtext');
    const aboutHeader = document.getElementById('about-header');
    const aboutBody = document.getElementById('about-body');
    const servicesTitle = document.getElementById('services-title');
    const servicesSubtitle = document.getElementById('services-subtitle');
    const servicesList = document.getElementById('services-list');
    const ctaHeadline = document.getElementById('cta-headline');
    const ctaButton = document.getElementById('cta-button');
    const footerDescription = document.getElementById('footer-description');

    if (heroHeadline && data.hero_headline) heroHeadline.innerHTML = data.hero_headline;
    if (heroSubtext && data.hero_subtext) heroSubtext.textContent = data.hero_subtext;
    if (aboutHeader && data.about_header) aboutHeader.textContent = data.about_header;

    if (aboutBody && Array.isArray(data.about_body)) {
      aboutBody.innerHTML = '';
      data.about_body.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `• ${item}`;
        aboutBody.appendChild(li);
      });
    }

    if (servicesTitle && data.services_title) servicesTitle.textContent = data.services_title;
    if (servicesSubtitle && data.services_subtitle) servicesSubtitle.textContent = data.services_subtitle;

    if (servicesList && Array.isArray(data.services)) {
      const icons = ['message-square-code', 'workflow', 'bar-chart-3', 'zap'];
      servicesList.innerHTML = '';
      data.services.forEach((service, index) => {
        const article = document.createElement('article');
        article.className = 'service-card card-glass';
        article.innerHTML = `
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
            <i data-lucide="${icons[index % icons.length]}" class="icon-glow" style="stroke-width: 1.5px" aria-hidden="true"></i>
          </div>
          <h3 class="card-title text-brand text-lg">${service.title}</h3>
          <p class="card-text mt-2 text-sm text-gray-700">${service.description}</p>
          <a class="mt-4 inline-flex text-sm font-semibold text-brand" href="services.html">Learn More</a>
        `;
        servicesList.appendChild(article);
      });

      if (window.lucide?.createIcons) {
        window.lucide.createIcons();
      }
    }

    if (ctaHeadline && data.cta_headline) ctaHeadline.textContent = data.cta_headline;
    if (ctaButton && data.cta_button) ctaButton.textContent = data.cta_button;
    if (footerDescription && data.footer_description) footerDescription.textContent = data.footer_description;
  } catch (error) {
    // Intentionally ignore CMS loader errors in production.
  }
};

const loadContactContent = async () => {
  try {
    const response = await fetch('content/contact.json', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();

    const faqTitle = document.getElementById('faq-title');
    const faqList = document.getElementById('faq-list');

    if (faqTitle && data.faq_title) faqTitle.textContent = data.faq_title;

    if (faqList && Array.isArray(data.faqs)) {
      faqList.innerHTML = '';
      data.faqs.forEach((item) => {
        const details = document.createElement('details');
        details.className = 'card-glass';
        details.innerHTML = `
          <summary class="card-title cursor-pointer text-sm">${item.question}</summary>
          <p class="card-text mt-3 text-sm">${item.answer}</p>
        `;
        faqList.appendChild(details);
      });
    }
  } catch (error) {
    // Intentionally ignore CMS loader errors in production.
  }
};

document.addEventListener('DOMContentLoaded', loadHomeContent);
document.addEventListener('DOMContentLoaded', loadContactContent);
