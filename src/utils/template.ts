export function renderTemplate(template: string, data: any): string {
  if (!template) return ''

  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    const value = path.split('.').reduce((acc: any, key: string) => {
      if (acc && typeof acc === 'object') {
        const target = '__v_isRef' in acc ? acc.value : acc
        return target?.[key]
      }
      return undefined
    }, data)

    return value !== undefined && value !== null ? String(value) : ''
  })
}
