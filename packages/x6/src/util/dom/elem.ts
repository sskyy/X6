import { hasClass } from './class'

let idCounter = 0
export function uniqueId() {
  idCounter += 1
  return `v${idCounter}`
}

export function ensureId(elem: Element) {
  if (elem.id == null || elem.id === '') {
    elem.id = uniqueId()
  }
  return elem.id
}

/**
 * Returns true if object is an instance of SVGGraphicsElement.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement
 */
export function isSVGGraphicsElement(
  elem?: any | null,
): elem is SVGGraphicsElement {
  if (elem == null) {
    return false
  }

  return typeof elem.getScreenCTM === 'function' && elem instanceof SVGElement
}

export const ns = {
  svg: 'http://www.w3.org/2000/svg',
  xmlns: 'http://www.w3.org/2000/xmlns/',
  xml: 'http://www.w3.org/XML/1998/namespace',
  xlink: 'http://www.w3.org/1999/xlink',
  xhtml: 'http://www.w3.org/1999/xhtml',
}

export const svgVersion = '1.1'

export function createElement<T extends Element>(
  tagName: string,
  doc: Document = document,
): T {
  return (doc.createElement(tagName) as any) as T
}

export function createElementNS<T extends Element>(
  tagName: string,
  namespaceURI: string = ns.xhtml,
  doc: Document = document,
): T {
  return (doc.createElementNS(namespaceURI, tagName) as any) as T
}

export function createSvgElement<T extends SVGElement>(
  tagName: string,
  doc: Document = document,
): T {
  return createElementNS<SVGElement>(tagName, ns.svg, doc) as T
}

export function createSvgDocument(content?: string) {
  if (content) {
    const xml = `<svg xmlns="${ns.svg}" xmlns:xlink="${ns.xlink}" version="${svgVersion}">${content}</svg>`
    const { documentElement } = parseXML(xml, { async: false })
    return (documentElement as any) as SVGSVGElement
  }

  const svg = document.createElementNS(ns.svg, 'svg')
  svg.setAttributeNS(ns.xmlns, 'xmlns:xlink', ns.xlink)
  svg.setAttribute('version', svgVersion)
  return svg as SVGSVGElement
}

export function parseXML(data: string, options: { async?: boolean } = {}) {
  let xml

  try {
    const parser = new DOMParser()
    if (options.async != null) {
      const tmp = parser as any
      tmp.async = options.async
    }
    xml = parser.parseFromString(data, 'text/xml')
  } catch (error) {
    xml = undefined
  }

  if (!xml || xml.getElementsByTagName('parsererror').length) {
    throw new Error(`Invalid XML: ${data}`)
  }

  return xml
}

export function tagName(node: Element, lowercase: boolean = true) {
  const nodeName = node.nodeName
  return lowercase ? nodeName.toLowerCase() : nodeName.toUpperCase()
}

export function index(elem: Element) {
  let index = 0
  let node = elem.previousSibling
  while (node) {
    if (node.nodeType === 1) {
      index += 1
    }
    node = node.previousSibling
  }
  return index
}

export function find(elem: Element, selector: string) {
  return elem.querySelectorAll(selector)
}

export function findOne(elem: Element, selector: string) {
  return elem.querySelector(selector)
}

export function findParentByClass(
  elem: Element,
  className: string,
  terminator?: Element,
) {
  const ownerSVGElement = (elem as SVGElement).ownerSVGElement
  let node = elem.parentNode
  while (node && node !== terminator && node !== ownerSVGElement) {
    if (hasClass(node as Element, className)) {
      return node
    }
    node = node.parentNode
  }

  return null
}

export function contains(parent: Element, child: Element) {
  const bup = child && child.parentNode
  return (
    parent === bup ||
    !!(bup && bup.nodeType === 1 && parent.compareDocumentPosition(bup) & 16)
  )
}

export function remove(elem: Element) {
  if (elem.parentNode) {
    elem.parentNode.removeChild(elem)
  }
}

export function empty(elem: Element) {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild)
  }
}

export function append(
  elem: Element,
  elems: Element | DocumentFragment | (Element | DocumentFragment)[],
) {
  const arr = Array.isArray(elems) ? elems : [elems]
  arr.forEach((child) => {
    if (child != null) {
      elem.appendChild(child)
    }
  })
}

export function prepend(
  elem: Element,
  elems: Element | DocumentFragment | (Element | DocumentFragment)[],
) {
  const child = elem.firstChild
  return child ? before(child as HTMLElement, elems) : append(elem, elems)
}

export function before(
  elem: Element,
  elems: Element | DocumentFragment | (Element | DocumentFragment)[],
) {
  const parent = elem.parentNode
  if (parent) {
    const arr = Array.isArray(elems) ? elems : [elems]
    arr.forEach((child) => {
      if (child != null) {
        parent.insertBefore(child, elem)
      }
    })
  }
}

export function appendTo(elem: Element, target: Element) {
  if (target != null) {
    target.appendChild(elem)
  }
}

// Determines whether a node is an HTML node
export function isHTMLElement(elem: any): elem is HTMLElement {
  try {
    // Using W3 DOM2 (works for FF, Opera and Chrome)
    return elem instanceof HTMLElement
  } catch (e) {
    // Browsers not supporting W3 DOM2 don't have HTMLElement and
    // an exception is thrown and we end up here. Testing some
    // properties that all elements have (works on IE7)
    return (
      typeof elem === 'object' &&
      elem.nodeType === 1 &&
      typeof elem.style === 'object' &&
      typeof elem.ownerDocument === 'object'
    )
  }
}
