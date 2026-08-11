export function exportJson(data: object, name: string) {
  const blob = new Blob([JSON.stringify(data)], {
    type: 'application/json',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${name}.json`
  link.click()
}

export async function importJson<T = any>(): Promise<T | null> {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  return new Promise((resolve) => {
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !file.name.endsWith('.json')) {
        alert('不是 JSON 文件')
        return resolve(null)
      }

      const reader = new FileReader()
      reader.onload = async function (e) {
        try {
          const jsonData: T = JSON.parse(e.target!.result as string)

          const type = Object.prototype.toString.call(jsonData).slice(8, -1)
          if (!['Array', 'Object'].includes(type)) {
            alert('内容非合法 JSON')
            return resolve(null)
          }
          resolve(jsonData)
        } catch (error: any) {
          alert(`内容非合法 JSON, ${error.message}`)
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    })

    // 取消选择文件时 change 不会触发, 需监听 cancel, 否则 Promise 永远挂起
    fileInput.addEventListener('cancel', () => resolve(null))

    fileInput.click()
  })
}
