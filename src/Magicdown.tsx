import { useMemo, useState } from 'react'
import Markdown, { type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkImages from 'remark-images'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import copy from 'copy-to-clipboard'
import { Copy, CopyCheck } from 'lucide-react'
import { langAlias } from './constants/highlight'
import { clsx } from 'clsx'
import { omit, capitalize, get, isNumber } from 'radash'

import './style.css'
import 'katex/dist/katex.min.css'

function getLangAlias(lang: string): string {
  return get(langAlias, lang, capitalize(lang))
}

export function Magicdown({ children, className, ...rest }: Options) {
  const [waitingCopy, setWaitingCopy] = useState<boolean>(false)
  const remarkPlugins = useMemo(() => rest.remarkPlugins ?? [], [])
  const rehypePlugins = useMemo(() => rest.rehypePlugins ?? [], [])
  const components = useMemo(() => rest.components ?? {}, [])

  const handleCopy = (start: number | undefined, end: number | undefined) => {
    if (children && isNumber(start) && isNumber(end)) {
      setWaitingCopy(true)
      copy(children.substring(start, end))
      setTimeout(() => {
        setWaitingCopy(false)
      }, 1200)
    }
  }

  return (
    <Markdown
      {...rest}
      className={clsx('markdown', className)}
      remarkPlugins={[remarkGfm, remarkMath, remarkImages, ...remarkPlugins]}
      rehypePlugins={[rehypeHighlight, rehypeKatex, ...rehypePlugins]}
      components={{
        code: (props) => {
          const { children, className, node, ...rest } = props
          if (className?.includes('hljs')) {
            const lang = /language-(\w+)/.exec(className || '')
            return (
              <>
                <div className="flex h-10 w-full items-center justify-between overflow-x-auto break-words rounded-t bg-gray-200 px-4 text-sm text-gray-500 dark:bg-gray-800">
                  {lang ? <span title={lang[1]}>{getLangAlias(lang[1])}</span> : null}
                  <button
                    className="h-6 w-6 rounded-sm p-1 hover:bg-gray-100"
                    title="Copy"
                    onClick={() => handleCopy(node?.position?.start.offset, node?.position?.end.offset)}
                  >
                    {waitingCopy ? <CopyCheck className="h-full w-full" /> : <Copy className="h-full w-full" />}
                  </button>
                </div>
                <code {...rest} className={className}>
                  {children}
                </code>
              </>
            )
          } else {
            return (
              <code {...rest} className={className}>
                {children}
              </code>
            )
          }
        },
        a: (props) => {
          const { children, ...rest } = props
          return (
            <a {...omit(rest, ['node'])} target="_blank">
              {children}
            </a>
          )
        },
        ...components,
      }}
    >
      {children}
    </Markdown>
  )
}
