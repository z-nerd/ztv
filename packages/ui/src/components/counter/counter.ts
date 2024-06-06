import htmlStr from "./counter.html?raw"
import cssStr from "./counter.scss?inline"

export interface CounterClickEvent {
  count: number
  e: MouseEvent
}

interface CustomElementEventMap extends HTMLElementEventMap {
  "counter-click": { detail: CounterClickEvent }
}

const template = document.createElement("template")
template.innerHTML = `<style>${cssStr}</style>${htmlStr}`

const TAG_NAME = "my-counter"
const ATTRIBUTES = ["count"] as const
export class Counter extends HTMLDivElement {
  static get observedAttributes() {
    return ATTRIBUTES
  }

  initAttribute(name: string, defaultValue: string) {
    if (!this.attributes.getNamedItem(name))
      this.setAttribute(name, defaultValue)
  }

  shadowRoot: ShadowRoot
  counterRef: HTMLDivElement
  increaseRef: HTMLButtonElement
  decreaseRef: HTMLButtonElement
  counterClickEvent!: CustomEvent<CounterClickEvent>

  constructor() {
    super()
    this.shadowRoot = this.attachShadow({ mode: "closed" })
    this.shadowRoot!.appendChild(template.content.cloneNode(true))
    this.setAttribute("is", TAG_NAME)
    this.counterRef = this.shadowRoot.querySelector(".counter")!
    this.increaseRef = this.shadowRoot.querySelector(".increase")!
    this.decreaseRef = this.shadowRoot.querySelector(".decrease")!
  }

  public get count() {
    return +this.getAttribute("count")!
  }
  public set count(count: number) {
    this.setAttribute("count", count.toString())
  }

  initAttr() {
    this.initAttribute("count", "0")
  }

  connectedCallback() {
    this.initAttr()

    this.counterClickEvent = new CustomEvent<CounterClickEvent>(
      "counter-click",
      {
        detail: {
          count: 0,
          e: null,
        } as any,
      },
    )
    setTimeout(() => {
      this.increaseRef.addEventListener("click", this.incHandler)
      this.decreaseRef.addEventListener("click", this.decHandler)
    }, 0)
  }
  disconnectedCallback() {
    this.increaseRef.removeEventListener("click", this.incHandler)
    this.decreaseRef.removeEventListener("click", this.decHandler)
  }

  incHandler = (e: MouseEvent) => {
    this.counterClickEvent.detail.e = e
    this.counterClickEvent.detail.count = 1
    this.dispatchEvent(this.counterClickEvent)
  }

  decHandler = (e: MouseEvent) => {
    this.counterClickEvent.detail.e = e
    this.counterClickEvent.detail.count = -1
    this.dispatchEvent(this.counterClickEvent)
  }
  attributeChangedCallback(
    attributeName: (typeof ATTRIBUTES)[number],
    oldValue: string,
    newValue: string,
  ) {
    switch (attributeName) {
      case "count":
        this.countUpdate(+oldValue, +newValue)
        break
    }
  }

  countUpdate(_oldCount: number, newCount: number) {
    this.counterRef.innerHTML = newCount.toString()
  }

  // @ts-ignore: Unreachable code error
  addEventListener<K extends keyof CustomElementEventMap>(
    type: K,
    listener: (this: HTMLDivElement, ev: CustomElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  )

  // @ts-ignore: Unreachable code error
  removeEventListener<K extends keyof CustomElementEventMap>(
    type: K,
    listener: (this: HTMLDivElement, ev: CustomElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  )
}

customElements.define(TAG_NAME, Counter, { extends: "div" })
