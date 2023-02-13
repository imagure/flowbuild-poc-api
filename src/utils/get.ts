/* eslint-disable @typescript-eslint/no-explicit-any */
const getPropByPath = (
  source: { [key: string]: any },
  path: string | Array<any>
): any => {
  const _path = Array.isArray(path) ? path : path.split('.')
  if (source && _path.length) return getPropByPath(source[_path.shift()], _path)
  return source
}

export { getPropByPath }
