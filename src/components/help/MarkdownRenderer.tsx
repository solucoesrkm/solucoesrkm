'use client';

/**
 * Componente que renderiza Markdown simples em HTML.
 * Usado para exibir overrides do help editados pelo admin.
 * Suporta: headings, bold, italic, listas, blockquotes, parágrafos.
 */

export function MarkdownRenderer({ content }: { content: string }) {
    const renderMarkdown = (md: string): string => {
        const lines = md.split('\n');
        let html = '';
        let inList = false;
        let inOl = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Headings
            if (line.startsWith('### ')) {
                if (inList) { html += '</ul>'; inList = false; }
                if (inOl) { html += '</ol>'; inOl = false; }
                html += `<h4 class="text-sm font-bold text-foreground mt-5 mb-2">${processInline(line.slice(4))}</h4>`;
                continue;
            }
            if (line.startsWith('## ')) {
                if (inList) { html += '</ul>'; inList = false; }
                if (inOl) { html += '</ol>'; inOl = false; }
                html += `<h3 class="text-base font-bold text-foreground mt-6 mb-2">${processInline(line.slice(3))}</h3>`;
                continue;
            }
            if (line.startsWith('# ')) {
                if (inList) { html += '</ul>'; inList = false; }
                if (inOl) { html += '</ol>'; inOl = false; }
                html += `<h2 class="text-lg font-bold text-foreground mt-6 mb-3">${processInline(line.slice(2))}</h2>`;
                continue;
            }

            // Blockquote
            if (line.startsWith('> ')) {
                if (inList) { html += '</ul>'; inList = false; }
                if (inOl) { html += '</ol>'; inOl = false; }
                const content = line.slice(2);
                const isWarning = content.includes('⚠️') || content.toLowerCase().includes('atenção');
                const isTip = content.includes('💡') || content.toLowerCase().includes('dica');
                const borderColor = isWarning ? 'border-amber-500/50 bg-amber-500/5' : isTip ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-teal-500/50 bg-accent/30';
                html += `<blockquote class="border-l-4 ${borderColor} pl-4 py-3 my-3 rounded-r-xl text-sm text-muted-foreground">${processInline(content)}</blockquote>`;
                continue;
            }

            // Unordered list
            if (line.match(/^[-*] /)) {
                if (!inList) { html += '<ul class="space-y-1 my-2">'; inList = true; }
                if (inOl) { html += '</ol>'; inOl = false; }
                html += `<li class="flex items-start gap-2 text-sm text-muted-foreground"><span class="text-teal-500 mt-1">•</span><span>${processInline(line.replace(/^[-*] /, ''))}</span></li>`;
                continue;
            }

            // Ordered list
            const olMatch = line.match(/^(\d+)\. (.+)/);
            if (olMatch) {
                if (!inOl) { html += '<ol class="space-y-1 my-2 counter-reset">'; inOl = true; }
                if (inList) { html += '</ul>'; inList = false; }
                html += `<li class="flex items-start gap-2 text-sm text-muted-foreground"><span class="text-teal-500 font-bold min-w-[20px]">${olMatch[1]}.</span><span>${processInline(olMatch[2])}</span></li>`;
                continue;
            }

            // Empty line
            if (line.trim() === '') {
                if (inList) { html += '</ul>'; inList = false; }
                if (inOl) { html += '</ol>'; inOl = false; }
                continue;
            }

            // Paragraph
            if (inList) { html += '</ul>'; inList = false; }
            if (inOl) { html += '</ol>'; inOl = false; }
            html += `<p class="text-sm text-muted-foreground leading-relaxed my-2">${processInline(line)}</p>`;
        }

        if (inList) html += '</ul>';
        if (inOl) html += '</ol>';

        return html;
    };

    const processInline = (text: string): string => {
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-accent text-xs font-mono text-foreground">$1</code>');
    };

    return (
        <div
            className="space-y-1"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
    );
}
