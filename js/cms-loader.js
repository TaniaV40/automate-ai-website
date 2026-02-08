const getPageKey = () => {
  const path = window.location.pathname;
  const slug = path.split('/').filter(Boolean).pop() || 'index.html';
  if (slug === 'index.html' || slug === '') return 'home';
  return slug.replace('.html', '');
};

const parseFrontmatter = (raw) => {
  const match = raw.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]*([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const yaml = match[1];
  const data = window.jsyaml ? window.jsyaml.load(yaml) : {};
  return { data: data || {}, body: match[2] };
};

const setText = (el, value) => {
  if (typeof value !== 'string') {
    el.textContent = value == null ? '' : String(value);
    return;
  }
  if (value.includes('<')) {
    el.innerHTML = value;
  } else {
    el.textContent = value;
  }
};

const formatInline = (text) =>
  text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const renderMarkdown = (markdown) => {
  if (!markdown) return '';
  if (markdown.includes('<')) return markdown;
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let paragraph = [];
  let listItems = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${formatInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      html.push(`<ul>${listItems.map((item) => `<li>${formatInline(item)}</li>`).join('')}</ul>`);
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      html.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      html.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      html.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
      return;
    }

    const listMatch = trimmed.match(/^[-*+]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  return html.join('');
};

const listRenderers = {
  '02_stats_items': (items, el) => {
    el.innerHTML = items
      .map(
        (item) => `
        <div class="card-glass">
          <p class="text-2xl font-semibold text-dark">${item.value}</p>
          <p class="mt-2 text-sm text-dark">${item.label}</p>
        </div>
      `
      )
      .join('');
  },
  '03_services_items': (items, el) => {
    const icons = ['message-square-code', 'workflow', 'bar-chart-3', 'zap'];
    el.innerHTML = items
      .map(
        (service, index) => `
        <article class="service-card card-glass">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
            <i data-lucide="${icons[index % icons.length]}" class="icon-glow" style="stroke-width: 1.5px" aria-hidden="true"></i>
          </div>
          <h3 class="card-title text-brand text-lg">${service.title}</h3>
          <p class="card-text mt-2 text-sm text-gray-700">${service.description}</p>
          <a class="mt-4 inline-flex text-sm font-semibold text-brand" href="services.html">Learn More</a>
        </article>
      `
      )
      .join('');
  },
  '02_services_items': (items, el) => {
    const icons = [
      'message-square-code',
      'workflow',
      'line-chart',
      'plug',
      'mail',
      'file-text',
      'shield-check',
      'cpu',
    ];
    el.innerHTML = items
      .map(
        (service, index) => `
        <article class="service-card card-glass">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
            <i data-lucide="${icons[index % icons.length]}" class="icon-glow" style="stroke-width: 1.5px" aria-hidden="true"></i>
          </div>
          <h3 class="card-title text-brand text-lg">${service.title}</h3>
          <p class="card-text mt-2 text-sm">${service.description}</p>
        </article>
      `
      )
      .join('');
  },
  '03_process_steps': (items, el) => {
    el.innerHTML = items
      .map(
        (step) => `
        <div class="card-glass">
          <p class="card-label">${step.label}</p>
          <p class="card-text mt-3 text-sm">${step.description}</p>
        </div>
      `
      )
      .join('');
  },
  '04_why_bullets': (items, el) => {
    el.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `• ${item}`;
      el.appendChild(li);
    });
  },
  '04_why_stats': (items, el) => {
    el.innerHTML = items
      .map(
        (stat) => `
        <div class="card-glass text-center text-white">
          <p class="card-label text-base text-white">${stat.value}</p>
          <p class="card-text mt-2 text-base text-white">${stat.label}</p>
        </div>
      `
      )
      .join('');
  },
  '02_mission_paragraphs': (items, el) => {
    el.innerHTML = '';
    items.forEach((text, index) => {
      const p = document.createElement('p');
      p.className = index === 0 ? 'mt-6 text-sm text-black' : 'mt-4 text-sm text-black';
      p.textContent = text;
      el.appendChild(p);
    });
  },
  '03_why_bullets': (items, el) => {
    el.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `• ${item}`;
      el.appendChild(li);
    });
  },
  '03_why_stats': (items, el) => {
    el.innerHTML = items
      .map(
        (stat) => `
        <div class="rounded-2xl border border-black/10 bg-black/5 p-5 text-center transition duration-300 ease-out hover:-translate-y-1 hover:border-brand/60 hover:shadow-[0_0_20px_rgba(58,13,188,0.35)]">
          <p class="text-2xl font-semibold">${stat.value}</p>
          <p class="text-sm text-black">${stat.label}</p>
        </div>
      `
      )
      .join('');
  },
  '05_timeline_items': (items, el) => {
    el.innerHTML = '';
    items.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="font-semibold text-black">${item.year}:</span> ${item.event}`;
      el.appendChild(li);
    });
  },
  '06_team_members': (items, el) => {
    el.innerHTML = items
      .map(
        (member) => `
        <div class="rounded-3xl border border-black/5 bg-white p-8 text-center transition duration-300 ease-out hover:-translate-y-1 hover:border-brand/60 hover:shadow-[0_0_20px_rgba(58,13,188,0.35)]">
          <h3 class="text-lg font-semibold">${member.name}</h3>
          <p class="text-sm text-black/60">${member.role}</p>
        </div>
      `
      )
      .join('');
  },
  '03_cases': (items, el) => {
    el.innerHTML = items
      .map((item) => {
        const results = (item.key_results || item.results || [])
          .map(
            (result) => `
            <div class="case-stat">
              <p class="case-stat__value">${result.value}</p>
              <p class="case-stat__label">${result.label}</p>
            </div>
          `
          )
          .join('');
        const tags = (item.tags || [])
          .map((tag) => (typeof tag === 'string' ? tag : tag.tag))
          .filter(Boolean)
          .map((tag) => `<span class="case-tag">${tag}</span>`)
          .join('');
        return `
        <article class="card-glass case-card">
          <div class="case-card__header">
            <span class="case-card__badge">${item.badge}</span>
            <h2 class="card-title mt-4 text-xl">${item.title}</h2>
          </div>
          <div class="case-card__body">
            <div class="case-block">
              <p class="case-block__label">Challenge</p>
              <p class="case-block__text">${item.challenge}</p>
            </div>
            <div class="case-block">
              <p class="case-block__label">Solution</p>
              <p class="case-block__text">${item.solution}</p>
            </div>
            <div class="case-block">
              <p class="case-block__label">Key Results</p>
              <div class="case-stats">${results}</div>
            </div>
            <div class="case-tags">${tags}</div>
          </div>
        </article>
      `;
      })
      .join('');
  },
  '02_contact_info_items': (items, el) => {
    el.innerHTML = '';
    items.forEach((item) => {
      const label = item.label || '';
      let valueHtml = item.value || '';
      if (label.toLowerCase().includes('email') && item.value) {
        valueHtml = `<a class="hover:text-brand" href="mailto:${item.value}">${item.value}</a>`;
      } else if (label.toLowerCase().includes('phone') && item.value) {
        const telValue = item.value.replace(/[^+\d]/g, '');
        valueHtml = `<a class="hover:text-brand" href="tel:${telValue}">${item.value}</a>`;
      }
      const li = document.createElement('li');
      li.innerHTML = `<span class="font-semibold text-black">${label}:</span> ${valueHtml}`;
      el.appendChild(li);
    });
  },
  '03_faq_items': (items, el) => {
    el.innerHTML = '';
    items.forEach((item) => {
      const details = document.createElement('details');
      details.className = 'card-glass';
      details.innerHTML = `
        <summary class="card-title cursor-pointer text-sm">${item.question}</summary>
        <p class="card-text mt-3 text-sm">${item.answer}</p>
      `;
      el.appendChild(details);
    });
  },
};

const applyCmsContent = (data) => {
  document.querySelectorAll('[data-cms]').forEach((el) => {
    const key = el.dataset.cms;
    if (!key || !(key in data)) return;
    setText(el, data[key]);
  });

  document.querySelectorAll('[data-cms-body]').forEach((el) => {
    const key = el.dataset.cmsBody || 'body';
    if (!key || !(key in data)) return;
    el.innerHTML = renderMarkdown(data[key]);
  });

  document.querySelectorAll('[data-cms-list]').forEach((el) => {
    const key = el.dataset.cmsList;
    const items = data[key];
    if (!Array.isArray(items)) return;
    const renderer = listRenderers[key];
    if (renderer) renderer(items, el);
  });

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
};

const loadCmsContent = async () => {
  try {
    const pageKey = getPageKey();
    const response = await fetch(`content/pages/${pageKey}.md`, { cache: 'no-store' });
    if (!response.ok) return;
    const raw = await response.text();
    const { data, body } = parseFrontmatter(raw);
    if (body && !data.body) data.body = body.trim();
    applyCmsContent(data);
  } catch (error) {
    // Intentionally ignore CMS loader errors in production.
  }
};

document.addEventListener('DOMContentLoaded', loadCmsContent);
