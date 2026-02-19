import type { MDXComponents } from 'mdx/types';
import { SearchArea } from '@/components/mdx/SearchArea';
import { Features } from '@/components/mdx/Features';
import { Feature } from '@/components/mdx/Feature';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mdx-h1">
        <span className="mdx-syntax"># </span>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mdx-h2">
        <span className="mdx-syntax">## </span>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mdx-h3">
        <span className="mdx-syntax">### </span>
        {children}
      </h3>
    ),
    p: ({ children }) => <p className="mdx-p">{children}</p>,
    a: ({ href, children }) => (
      <a href={href} className="mdx-link" target="_blank" rel="noopener noreferrer">
        <span className="mdx-syntax">[</span>
        {children}
        <span className="mdx-syntax">]</span>
        <span className="mdx-link-url">
          <span className="mdx-syntax">(</span>
          {href}
          <span className="mdx-syntax">)</span>
        </span>
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mdx-blockquote">
        <span className="mdx-syntax">&gt; </span>
        {children}
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="mdx-code">
        <span className="mdx-syntax">`</span>
        {children}
        <span className="mdx-syntax">`</span>
      </code>
    ),
    pre: ({ children }) => <pre className="mdx-pre">{children}</pre>,
    hr: () => <div className="mdx-hr">---</div>,
    ul: ({ children }) => <ul className="mdx-ul">{children}</ul>,
    ol: ({ children }) => <ol className="mdx-ol">{children}</ol>,
    li: ({ children }) => <li className="mdx-li">{children}</li>,
    em: ({ children }) => (
      <em className="mdx-em">
        <span className="mdx-syntax">*</span>
        {children}
        <span className="mdx-syntax">*</span>
      </em>
    ),
    strong: ({ children }) => (
      <strong className="mdx-strong">
        <span className="mdx-syntax">**</span>
        {children}
        <span className="mdx-syntax">**</span>
      </strong>
    ),
    SearchArea,
    Features,
    Feature,
    ...components,
  };
}
