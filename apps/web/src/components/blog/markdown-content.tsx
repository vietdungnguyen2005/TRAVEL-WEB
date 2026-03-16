"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
    content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
    return (
        <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
            <ReactMarkdown
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
                    ),
                    p: ({ children }) => (
                        <p className="mb-3 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-muted-foreground">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
