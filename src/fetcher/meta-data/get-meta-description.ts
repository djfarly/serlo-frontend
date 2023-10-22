import { extractStringFromTextDocument } from '@/serlo-editor/plugins/text/utils/static-extract-text'
import { getChildrenOfSerializedDocument } from '@/serlo-editor/static-renderer/helper/get-children-of-serialized-document'
import { AnyEditorDocument } from '@/serlo-editor-integration/types/editor-plugins'
import {
  isRowsDocument,
  isTextDocument,
} from '@/serlo-editor-integration/types/plugin-type-guards'

export function getMetaDescription(
  content?: AnyEditorDocument
): string | undefined {
  if (!content) return undefined
  let extracted = ''

  if (isTextDocument(content)) {
    extracted = extractStringFromTextDocument(content) ?? undefined
  }

  if (isRowsDocument(content)) {
    // run row by row so we don't have to go through the whole content
    content.state.every((row) => {
      extracted += extractTextFromDocument(row)
      // continue if extract is shorter than 150
      return extracted.length < 150
    })
  }

  if (extracted.length < 50) return undefined

  const softLimit = 145
  const cutoff = softLimit + extracted.substring(softLimit).indexOf(' ')

  return (
    extracted.substring(0, cutoff) + (extracted.length > softLimit ? ' …' : '')
  )
}

function extractTextFromDocument(
  document?: AnyEditorDocument,
  collected: string = ''
): string {
  if (!document) return ''

  // call on children recursively
  collected += getChildrenOfSerializedDocument(document)
    .map((child) => extractTextFromDocument(child, collected))
    .join()

  if (!isTextDocument(document)) return collected
  const documentText = extractStringFromTextDocument(document)

  return collected ? `${collected} ${documentText}` : documentText
}
